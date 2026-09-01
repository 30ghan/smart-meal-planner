"""Content-based "similar meals" lookup.

Builds one feature vector per meal from its macros, calories, and dietary
tags, then uses scikit-learn's NearestNeighbors (cosine distance) to find
the meals whose vectors are closest to a given meal's. This is plain
content-based similarity -- no user behaviour, ratings, or the scoring
model in ml/scoring.py are involved -- so it works identically for a
brand-new meal with zero planner history.
"""

import numpy as np
from sklearn.neighbors import NearestNeighbors

import models

# Every dietary tag the catalog uses, in a fixed order, so the one-hot
# encoding below lines up the same way for every meal regardless of which
# subset of tags any particular meal happens to carry.
_TAG_UNIVERSE = [tag.value for tag in models.DietaryType]


def _feature_row(meal: models.Meal, calorie_scale: float) -> list[float]:
    # Scaling the macro/calorie columns down to roughly the same 0-1 range
    # as the one-hot tag columns keeps cosine distance from being dominated
    # by calories just because it's the largest raw number.
    macro_features = [
        meal.calories / calorie_scale,
        meal.protein_g / calorie_scale,
        meal.carbs_g / calorie_scale,
        meal.fat_g / calorie_scale,
    ]
    tag_features = [1.0 if tag in meal.dietary_tags else 0.0 for tag in _TAG_UNIVERSE]
    return macro_features + tag_features


def build_feature_matrix(meals: list[models.Meal]) -> np.ndarray:
    """One row per meal: [calories, protein_g, carbs_g, fat_g] scaled by
    the catalog's largest calorie value, followed by a one-hot vector over
    every dietary tag."""
    if not meals:
        return np.empty((0, 4 + len(_TAG_UNIVERSE)))
    calorie_scale = max(meal.calories for meal in meals) or 1
    return np.array([_feature_row(meal, calorie_scale) for meal in meals])


def find_similar_meal_ids(target_meal_id: int, meals: list[models.Meal], top_n: int = 5) -> list[int]:
    """Return up to `top_n` meal ids most similar to `target_meal_id`,
    nearest first, excluding the meal itself. `meals` must include the
    target meal alongside the rest of the catalog to compare it against."""
    meal_ids = [meal.id for meal in meals]
    if target_meal_id not in meal_ids or len(meals) < 2:
        return []

    X = build_feature_matrix(meals)
    target_index = meal_ids.index(target_meal_id)

    n_neighbors = min(top_n + 1, len(meals))  # +1: the meal itself is always its own nearest neighbour
    nn = NearestNeighbors(n_neighbors=n_neighbors, metric="cosine")
    nn.fit(X)
    _, indices = nn.kneighbors(X[target_index : target_index + 1])

    return [meal_ids[i] for i in indices[0] if meal_ids[i] != target_meal_id][:top_n]
