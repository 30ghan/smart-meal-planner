"""Shared calorie-target math.

Lives in its own module (rather than inside recommendations.py, where it
used to be) so that both recommendations.py and ml/scoring.py can import it
without recommendations.py -> ml/scoring.py -> recommendations.py becoming
a circular import.
"""

import models

# Rough calorie split across the three daily meals; used to judge how well a
# candidate meal fits within the user's daily calorie goal.
MEAL_TYPE_CALORIE_SHARE = {
    models.MealType.BREAKFAST: 0.25,
    models.MealType.LUNCH: 0.35,
    models.MealType.DINNER: 0.40,
}


def calorie_target(meal_type: models.MealType, calorie_goal: int) -> int:
    share = MEAL_TYPE_CALORIE_SHARE.get(meal_type, 1 / 3)
    return round(calorie_goal * share)
