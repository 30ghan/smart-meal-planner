# Smart Meal Planner -- backend

FastAPI + SQLAlchemy + SQLite backend for the Smart Meal Planner app. See the
project root for frontend setup. This file focuses on the recommendation
system, since that's the part with the most going on.

## Setup

```bash
python -m venv venv
venv/Scripts/activate        # venv\Scripts\activate on Windows
pip install -r requirements.txt
python seed_data.py          # populates the meal catalog
uvicorn main:app --reload
```

## Recommendation system

Recommending a meal happens in two clearly separate steps, on purpose:

### 1. Filtering -- deterministic, rule-based

`_matches_diet()` and `_is_safe()` in `recommendations.py` check dietary
type and cross-reference allergens/disliked foods against each meal's
ingredients. This step is **not** machine learning and never will be: an
allergy or a dietary restriction is a hard requirement, not something that
should ever be "probably fine." A meal either passes this filter or it's
never shown to that user, full stop.

### 2. Ranking -- a learned model

Everything that survives the filter above then gets ranked by a
**scikit-learn `RandomForestRegressor`** (`backend/ml/scoring.py`), trained
to predict a continuous "fit score" per meal. It replaces what used to be a
flat sort by `|calories - target|`.

**Features** (`ml.scoring.FEATURE_NAMES`), one row per (meal, user) pair:

| feature | what it captures |
|---|---|
| `calorie_deviation_ratio` | how far the meal's calories are from the user's per-meal-type target, as a ratio |
| `protein_share` / `carbs_share` / `fat_share` | each macro's share of the meal's total macro calories |
| `matches_primary_diet` | whether the meal carries the user's `dietary_type` tag |
| `tag_count` | how many dietary tags the meal satisfies at once, as a rough versatility signal |

**Why Random Forest over a KNN regressor** (the other option on the table):
it needs no feature scaling — mixing a 0-1 ratio, three shares, and a small
integer count would otherwise skew KNN's distance metric unless every
feature were normalised first — and it captures non-linear interactions
between features (e.g. a slightly-off calorie count matters less when the
macros are otherwise a great match) that a distance metric doesn't express.
It also exposes `feature_importances_`, which turned out to be genuinely
useful for sanity-checking the model (see below).

**Training data is synthetic, and that's stated plainly in the code.** The
app doesn't yet have real like/dislike feedback to learn from —
`PlannerEntry` records which meal was *assigned* to a slot, not whether the
user actually liked it, and treating "was planned" as a positive label
would be a guess dressed up as data. Rather than assume a specific feedback
mechanism, `ml/scoring.py` trains on a small hand-built dataset instead: a
handful of "user archetype" profiles (an omnivore, a vegan, a keto profile,
etc., each with target macro shares) scored against every real meal in the
catalog using a hand-written labelling rule that rewards close calorie fit,
macro-share alignment with the archetype, and a diet-tag match. This keeps
the pipeline real and end-to-end -- features engineered, a model genuinely
trained and queried via `.predict()`, not hard-coded -- while being upfront
that the *labels* are a stand-in, not observed behaviour. The doc comment
at the top of `ml/scoring.py` marks the exact function
(`generate_synthetic_training_data()`) to replace once the app collects
real feedback, whatever form that ends up taking.

**A finding worth noting**: `matches_primary_diet` dominates the trained
model's global `feature_importances_` (~0.84 of 1.0), because the labelling
rule applies a large flat penalty for a diet mismatch. In production,
though, that feature is effectively constant — `recommend_meals()` only
ever calls the model on meals that already passed the deterministic diet
filter, so every meal it scores already has `matches_primary_diet = 1`.
The feature that dominates training importance is the one that does the
*least* work at inference time; the actual ranking among already-filtered
meals comes from the remaining macro/calorie-fit features. Checked this
against real output (e.g. a keto profile correctly ranks a 6-tag,
high-fat/low-carb salmon dish above an equal-calorie steak dish with a
less keto-aligned macro split) rather than just trusting the importance
numbers in isolation.

### 3. Similar meals -- separate, content-based

`GET /meals/{meal_id}/similar` (`backend/ml/similarity.py`) is unrelated to
the scoring model above: it builds a feature vector per meal from
calories, macros (scaled to roughly the same range), and a one-hot
encoding of dietary tags, then uses scikit-learn's `NearestNeighbors` with
cosine distance to find the closest meals to a given one. No user data
involved, so it works the same for a meal with zero planner history.

## CV / interview summary

> Replaced a hand-coded calorie-distance sort with a scikit-learn
> `RandomForestRegressor` trained on engineered nutritional features
> (macro shares, calorie deviation, diet-tag match) to rank meal
> recommendations, plus a separate `NearestNeighbors`-based "similar
> meals" endpoint using cosine similarity over the same feature space.
> Deterministic allergen/diet filtering was deliberately kept rule-based
> and untouched -- only the ranking of already-safe meals is learned.

## Adding new ML libraries

`scikit-learn` and `numpy` are the only ML dependencies. Both installed
cleanly against this project's Python 3.14 venv with prebuilt wheels --
worth re-checking if you bump the Python version.
