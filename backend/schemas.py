from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from models import DayOfWeek, DietaryType, MealType

# ---------------------------------------------------------------------------
# Auth / users
# ---------------------------------------------------------------------------


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=255)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    created_at: datetime


# ---------------------------------------------------------------------------
# Preferences
# ---------------------------------------------------------------------------


class PreferenceBase(BaseModel):
    dietary_type: DietaryType = DietaryType.OMNIVORE
    calorie_goal: int = Field(default=2000, ge=800, le=6000)
    allergies: list[str] = Field(default_factory=list)
    disliked_foods: list[str] = Field(default_factory=list)


class PreferenceUpdate(BaseModel):
    dietary_type: DietaryType | None = None
    calorie_goal: int | None = Field(default=None, ge=800, le=6000)
    allergies: list[str] | None = None
    disliked_foods: list[str] | None = None


class PreferenceRead(PreferenceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int


# ---------------------------------------------------------------------------
# Meals / ingredients
# ---------------------------------------------------------------------------


class MealIngredientCreate(BaseModel):
    name: str
    quantity: float = Field(gt=0)
    unit: str


class MealIngredientRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    quantity: float
    unit: str


class MealBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str = ""
    meal_type: MealType
    calories: int = Field(gt=0)
    protein_g: float = Field(default=0, ge=0)
    carbs_g: float = Field(default=0, ge=0)
    fat_g: float = Field(default=0, ge=0)
    dietary_tags: list[str] = Field(default_factory=list)
    allergens: list[str] = Field(default_factory=list)


class MealCreate(MealBase):
    ingredients: list[MealIngredientCreate] = Field(default_factory=list)


class MealRead(MealBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ingredients: list[MealIngredientRead] = Field(default_factory=list, validation_alias="ingredient_links")


# ---------------------------------------------------------------------------
# Planner
# ---------------------------------------------------------------------------


class PlannerEntrySet(BaseModel):
    week_start: date
    day_of_week: DayOfWeek
    meal_type: MealType
    meal_id: int


class PlannerEntryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    week_start: date
    day_of_week: DayOfWeek
    meal_type: MealType
    meal: MealRead


class GroceryListItem(BaseModel):
    ingredient: str
    quantity: float
    unit: str


class GroceryListResponse(BaseModel):
    week_start: date
    items: list[GroceryListItem]
