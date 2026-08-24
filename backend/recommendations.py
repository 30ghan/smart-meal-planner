"""Meal recommendation logic shared by the meals and planner routers."""

import random

from sqlalchemy.orm import Session, joinedload

import models

# Rough calorie split across the three daily meals; used to score how well a
# candidate meal fits within the user's daily calorie goal.
MEAL_TYPE_CALORIE_SHARE = {
    models.MealType.BREAKFAST: 0.25,
    models.MealType.LUNCH: 0.35,
    models.MealType.DINNER: 0.40,
}


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


def _calorie_target(meal_type: models.MealType, calorie_goal: int) -> int:
    share = MEAL_TYPE_CALORIE_SHARE.get(meal_type, 1 / 3)
    return round(calorie_goal * share)


def recommend_meals(
    db: Session,
    preference: models.Preference,
    meal_type: models.MealType | None = None,
    limit: int = 10,
) -> list[models.Meal]:
    """Return meals matching the user's diet and free of allergens/dislikes,
    ranked by how close they are to the user's per-meal calorie target."""
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
    eligible.sort(key=lambda meal: abs(meal.calories - _calorie_target(meal.meal_type, preference.calorie_goal)))
    return eligible[:limit]


def generate_weekly_plan(db: Session, user: models.User, week_start) -> list[models.PlannerEntry]:
    """Build a full 7-day x 3-meal plan from recommended meals, picking
    randomly among the top matches for each slot so the week isn't repetitive."""
    preference = user.preference
    entries: list[models.PlannerEntry] = []
    for day in models.DayOfWeek:
        for meal_type in models.MealType:
            options = recommend_meals(db, preference, meal_type=meal_type, limit=5)
            if not options:
                continue
            chosen = random.choice(options)
            entries.append(
                models.PlannerEntry(
                    user_id=user.id,
                    meal_id=chosen.id,
                    week_start=week_start,
                    day_of_week=day,
                    meal_type=meal_type,
                )
            )
    return entries
