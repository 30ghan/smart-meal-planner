"""Meal recommendation logic shared by the meals and planner routers."""

import random

from sqlalchemy.orm import Session, joinedload

import models
from ml.scoring import score_meals


def _matches_diet(meal: models.Meal, dietary_type: models.DietaryType) -> bool:
    if dietary_type == models.DietaryType.OMNIVORE:
        return True
    return dietary_type.value in meal.dietary_tags


def _is_safe(meal: models.Meal, allergies: list[str], disliked_foods: list[str]) -> bool:
    blocked = {a.strip().lower() for a in allergies} | {d.strip().lower() for d in disliked_foods}
    if not blocked:
        return True
    meal_terms = {a.lower() for a in meal.allergens} | {meal.name.lower()}
    ingredient_terms = {link.name.lower() for link in meal.ingredient_links}
    return blocked.isdisjoint(meal_terms) and blocked.isdisjoint(ingredient_terms)


def recommend_meals(
    db: Session,
    preference: models.Preference,
    meal_type: models.MealType | None = None,
    limit: int = 10,
) -> list[models.Meal]:
    """Return meals matching the user's diet and free of allergens/dislikes,
    ranked by a learned fit-score model (see ml/scoring.py) instead of a
    hard-coded formula. The filtering above stays deterministic on purpose
    -- see _matches_diet/_is_safe -- only the ranking of what survives it
    is learned."""
    query = db.query(models.Meal).options(
        joinedload(models.Meal.ingredient_links).joinedload(models.MealIngredient.ingredient)
    )
    if meal_type is not None:
        query = query.filter(models.Meal.meal_type == meal_type)
    candidates = query.all()

    eligible = [
        meal
        for meal in candidates
        if _matches_diet(meal, preference.dietary_type)
        and _is_safe(meal, preference.allergies, preference.disliked_foods)
    ]
    if not eligible:
        return eligible

    scores = score_meals(db, eligible, preference)
    ranked = [meal for _, meal in sorted(zip(scores, eligible), key=lambda pair: pair[0], reverse=True)]
    return ranked[:limit]


# How many of the best-scoring eligible meals to shuffle among when picking
# a day's meal, so the week has some variety without ignoring the model's
# ranking entirely by reaching for a poor-fit meal just for novelty.
VARIETY_WINDOW = 5


def _pick_week_of_meals(eligible: list[models.Meal], days: int) -> list[models.Meal]:
    """Choose one meal per day from `eligible` (already ranked best-fit
    first by recommend_meals()), avoiding repeats until every eligible meal
    has been used once -- only then does it start reusing meals, so a day
    repeats a previous choice only when there genuinely aren't enough
    distinct options."""
    unused = list(eligible)
    chosen: list[models.Meal] = []
    for _ in range(days):
        if not unused:
            unused = list(eligible)
        window = unused[:VARIETY_WINDOW] if len(unused) >= VARIETY_WINDOW else unused
        pick = random.choice(window)
        unused.remove(pick)
        chosen.append(pick)
    return chosen


def generate_weekly_plan(db: Session, user: models.User, week_start) -> list[models.PlannerEntry]:
    """Build a full 7-day x 3-meal plan. For each meal type, every eligible
    meal is used at most once before any meal repeats, so (given enough
    variety in the catalog for the user's diet) no meal appears twice in
    the same week."""
    preference = user.preference
    days = list(models.DayOfWeek)
    entries: list[models.PlannerEntry] = []

    for meal_type in models.MealType:
        eligible = recommend_meals(db, preference, meal_type=meal_type, limit=1000)
        if not eligible:
            continue
        week_of_meals = _pick_week_of_meals(eligible, len(days))
        for day, meal in zip(days, week_of_meals):
            entries.append(
                models.PlannerEntry(
                    user_id=user.id,
                    meal_id=meal.id,
                    week_start=week_start,
                    day_of_week=day,
                    meal_type=meal_type,
                )
            )
    return entries
