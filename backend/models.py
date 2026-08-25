from datetime import date, datetime
from enum import Enum as PyEnum

from sqlalchemy import Date, DateTime, Enum, Float, ForeignKey, Integer, JSON, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class DietaryType(str, PyEnum):
    OMNIVORE = "omnivore"
    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"
    PESCATARIAN = "pescatarian"
    KETO = "keto"
    PALEO = "paleo"
    GLUTEN_FREE = "gluten_free"
    HIGH_PROTEIN = "high_protein"


class MealType(str, PyEnum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"


class DayOfWeek(str, PyEnum):
    MONDAY = "monday"
    TUESDAY = "tuesday"
    WEDNESDAY = "wednesday"
    THURSDAY = "thursday"
    FRIDAY = "friday"
    SATURDAY = "saturday"
    SUNDAY = "sunday"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    preference: Mapped["Preference"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    planner_entries: Mapped[list["PlannerEntry"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class Preference(Base):
    __tablename__ = "preferences"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    dietary_type: Mapped[DietaryType] = mapped_column(Enum(DietaryType), default=DietaryType.OMNIVORE)
    calorie_goal: Mapped[int] = mapped_column(Integer, default=2000)
    allergies: Mapped[list[str]] = mapped_column(JSON, default=list)
    disliked_foods: Mapped[list[str]] = mapped_column(JSON, default=list)

    user: Mapped["User"] = relationship(back_populates="preference")


class Ingredient(Base):
    __tablename__ = "ingredients"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)

    meal_links: Mapped[list["MealIngredient"]] = relationship(back_populates="ingredient")


class Meal(Base):
    __tablename__ = "meals"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(1000), default="")
    meal_type: Mapped[MealType] = mapped_column(Enum(MealType), nullable=False)
    calories: Mapped[int] = mapped_column(Integer, nullable=False)
    protein_g: Mapped[float] = mapped_column(Float, default=0)
    carbs_g: Mapped[float] = mapped_column(Float, default=0)
    fat_g: Mapped[float] = mapped_column(Float, default=0)
    # e.g. ["vegan", "gluten_free"] -- a meal can satisfy several dietary types at once
    dietary_tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    # e.g. ["nuts", "dairy"] -- matched against user allergies to exclude unsafe meals
    allergens: Mapped[list[str]] = mapped_column(JSON, default=list)

    ingredient_links: Mapped[list["MealIngredient"]] = relationship(
        back_populates="meal", cascade="all, delete-orphan"
    )
    planner_entries: Mapped[list["PlannerEntry"]] = relationship(back_populates="meal")


class MealIngredient(Base):
    __tablename__ = "meal_ingredients"

    id: Mapped[int] = mapped_column(primary_key=True)
    meal_id: Mapped[int] = mapped_column(ForeignKey("meals.id"), nullable=False)
    ingredient_id: Mapped[int] = mapped_column(ForeignKey("ingredients.id"), nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)

    meal: Mapped["Meal"] = relationship(back_populates="ingredient_links")
    ingredient: Mapped["Ingredient"] = relationship(back_populates="meal_links")

    @property
    def name(self) -> str:
        return self.ingredient.name


class PlannerEntry(Base):
    __tablename__ = "planner_entries"
    __table_args__ = (
        UniqueConstraint("user_id", "week_start", "day_of_week", "meal_type", name="uq_planner_slot"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    meal_id: Mapped[int] = mapped_column(ForeignKey("meals.id"), nullable=False)
    week_start: Mapped[date] = mapped_column(Date, nullable=False)
    day_of_week: Mapped[DayOfWeek] = mapped_column(Enum(DayOfWeek), nullable=False)
    meal_type: Mapped[MealType] = mapped_column(Enum(MealType), nullable=False)

    user: Mapped["User"] = relationship(back_populates="planner_entries")
    meal: Mapped["Meal"] = relationship(back_populates="planner_entries")
