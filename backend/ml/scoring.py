"""Learned ranking model for meal recommendations.

recommend_meals() in recommendations.py still filters candidates
deterministically (diet type via _matches_diet, allergens/dislikes via
_is_safe) -- that stays rule-based on purpose, because "never show a peanut
allergy sufferer a peanut dish" must be a guarantee, not a probability. This
module only replaces the *ranking* of the meals that already passed that
filter: instead of sorting purely by |calories - target|, a scikit-learn
RandomForestRegressor predicts a continuous "fit score" per meal from a
small feature set (calorie fit + macro balance + diet-tag signal), and
recommend_meals() sorts by that score instead.

RandomForestRegressor was chosen over a KNN regressor because:
  - it needs no feature scaling (KNN's distances would be skewed by mixing
    a 0-1 ratio, 0-1 shares, and a small integer count in the same space
    unless every feature were normalised first),
  - it captures non-linear/interaction effects between features (e.g. a
    slightly-off calorie count matters less on a meal whose macros are
    otherwise a great match) that a distance metric doesn't express, and
  - it exposes feature_importances_, which is genuinely useful here to
    sanity-check *why* the model ranks the way it does.

--------------------------------------------------------------------------
IMPORTANT -- about the training data
--------------------------------------------------------------------------
The app has no real like/dislike signal to learn from yet: PlannerEntry only
records which meal was *assigned* to a slot, not whether the user actually
liked it, so treating "was planned" as a positive label would be a guess
dressed up as data (a meal can be planned and still be a bad fit, or a great
fit that was swapped out for something else). Rather than assume that, or
invent a specific feedback UI, this module trains on a clearly-synthetic
dataset instead: a handful of hand-specified "user archetype" profiles
(SYNTHETIC_PROFILES below), each scored against every real meal in the
catalog using a hand-written rule (_label_from_features) that rewards close
calorie fit, macro-share alignment with the archetype, and a diet-tag match.

This makes the ML pipeline real and end-to-end -- features are engineered,
a model is genuinely trained and used for inference, not hard-coded -- while
being honest that the *labels* are a stand-in, not observed behaviour.

The natural place to swap this out later, once the app collects real
feedback (whatever form that ends up taking -- thumbs up/down, ratings,
"kept vs swapped out", etc.) is generate_synthetic_training_data(): replace
its body with a query over the real feedback table and everything else
(features, model, caching, recommend_meals()'s use of it) keeps working
unchanged.
"""

import threading
from dataclasses import dataclass

import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sqlalchemy.orm import Session

import models
from calorie_targets import calorie_target

FEATURE_NAMES = [
    "calorie_deviation_ratio",  # |meal calories - target| / target for this meal's slot
    "protein_share",  # protein's share of the meal's macro calories
    "carbs_share",  # carbs' share of the meal's macro calories
    "fat_share",  # fat's share of the meal's macro calories
    "matches_primary_diet",  # 1.0 if the meal carries the user's dietary_type tag (omnivore always does)
    "tag_count",  # how many dietary tags the meal satisfies at once (a rough versatility signal)
]


def extract_features(meal: models.Meal, dietary_type: models.DietaryType, target_calories: int) -> list[float]:
    """Turn a (meal, user diet context) pair into the numeric feature vector
    the model is trained and queried on. Training (generate_synthetic_
    training_data) and inference (score_meals) both call this exact
    function, so the two can never drift out of sync with each other."""
    calorie_deviation_ratio = abs(meal.calories - target_calories) / target_calories if target_calories else 0.0

    total_macro_calories = meal.protein_g * 4 + meal.carbs_g * 4 + meal.fat_g * 9
    if total_macro_calories > 0:
        protein_share = (meal.protein_g * 4) / total_macro_calories
        carbs_share = (meal.carbs_g * 4) / total_macro_calories
        fat_share = (meal.fat_g * 9) / total_macro_calories
    else:
        protein_share = carbs_share = fat_share = 0.0

    matches_primary_diet = 1.0 if _matches_diet_tag(meal, dietary_type) else 0.0
    tag_count = float(len(meal.dietary_tags))

    return [calorie_deviation_ratio, protein_share, carbs_share, fat_share, matches_primary_diet, tag_count]


def _matches_diet_tag(meal: models.Meal, dietary_type: models.DietaryType) -> bool:
    return dietary_type == models.DietaryType.OMNIVORE or dietary_type.value in meal.dietary_tags


@dataclass(frozen=True)
class SyntheticProfile:
    """A hand-specified stand-in for "a type of user", used only to
    generate synthetic training labels -- see the module docstring."""

    dietary_type: models.DietaryType
    calorie_goal: int
    target_protein_share: float
    target_carbs_share: float
    target_fat_share: float


# Macro-share targets are rough, illustrative splits for each archetype
# (e.g. keto's ~68% fat / ~7% carbs), not clinical guidance.
SYNTHETIC_PROFILES: list[SyntheticProfile] = [
    SyntheticProfile(models.DietaryType.OMNIVORE, 2200, 0.20, 0.50, 0.30),
    SyntheticProfile(models.DietaryType.VEGETARIAN, 1900, 0.18, 0.55, 0.27),
    SyntheticProfile(models.DietaryType.VEGAN, 1800, 0.15, 0.60, 0.25),
    SyntheticProfile(models.DietaryType.KETO, 2100, 0.25, 0.07, 0.68),
    SyntheticProfile(models.DietaryType.HIGH_PROTEIN, 2400, 0.38, 0.37, 0.25),
    SyntheticProfile(models.DietaryType.PESCATARIAN, 2000, 0.25, 0.45, 0.30),
]


def _label_from_features(features: list[float], profile: SyntheticProfile) -> float:
    """SYNTHETIC LABEL RULE -- used only to build training examples, never
    called at inference time (score_meals() uses the trained model's
    .predict(), not this function). Starts at a perfect 1.0 and subtracts
    penalties for calorie deviation, macro-share mismatch, and a diet-tag
    miss, then adds a small bonus for versatility; clamped to [0, 1]."""
    calorie_deviation_ratio, protein_share, carbs_share, fat_share, matches_primary_diet, tag_count = features

    score = 1.0
    score -= min(calorie_deviation_ratio, 1.0) * 0.4
    score -= abs(protein_share - profile.target_protein_share) * 0.6
    score -= abs(carbs_share - profile.target_carbs_share) * 0.6
    score -= abs(fat_share - profile.target_fat_share) * 0.6
    if not matches_primary_diet:
        score -= 0.5
    score += min(tag_count, 5) * 0.02

    return max(0.0, min(1.0, score))


def generate_synthetic_training_data(meals: list[models.Meal]) -> tuple[np.ndarray, np.ndarray]:
    """Build (X, y) training data by scoring every meal in the catalog
    against every SYNTHETIC_PROFILE. THIS IS SYNTHETIC DATA, not real user
    feedback -- see the module docstring for why, and for where to plug in
    real feedback once the app collects it."""
    X: list[list[float]] = []
    y: list[float] = []

    for profile in SYNTHETIC_PROFILES:
        for meal in meals:
            target = calorie_target(meal.meal_type, profile.calorie_goal)
            features = extract_features(meal, profile.dietary_type, target)
            X.append(features)
            y.append(_label_from_features(features, profile))

    return np.array(X), np.array(y)


_model_cache: RandomForestRegressor | None = None
_model_lock = threading.Lock()


def _train_model(db: Session) -> RandomForestRegressor:
    meals = db.query(models.Meal).all()
    if not meals:
        raise RuntimeError(
            "Cannot train the recommendation model: no meals in the database. Run `python seed_data.py` first."
        )
    X, y = generate_synthetic_training_data(meals)
    model = RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42)
    model.fit(X, y)
    return model


def get_model(db: Session) -> RandomForestRegressor:
    """Trains the model once (on first use, from whichever request happens
    to need it first) and caches it in memory for the life of the process.
    Training the synthetic dataset takes well under a second, so there's no
    need for a persisted model artifact or a separate training step."""
    global _model_cache
    if _model_cache is not None:
        return _model_cache
    with _model_lock:
        if _model_cache is None:
            _model_cache = _train_model(db)
    return _model_cache


def score_meals(db: Session, meals: list[models.Meal], preference: models.Preference) -> list[float]:
    """Predicted fit score per meal, higher is better. Called by
    recommend_meals() in recommendations.py to rank meals that already
    passed the deterministic diet/allergy filter -- this function never
    sees, and can't override, meals that filter already excluded."""
    if not meals:
        return []
    model = get_model(db)
    X = np.array(
        [
            extract_features(meal, preference.dietary_type, calorie_target(meal.meal_type, preference.calorie_goal))
            for meal in meals
        ]
    )
    return model.predict(X).tolist()
