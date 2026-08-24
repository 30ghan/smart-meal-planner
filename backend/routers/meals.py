from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

import models
import schemas
from database import get_db
from deps import get_current_user
from recommendations import recommend_meals

router = APIRouter(prefix="/meals", tags=["meals"])


def _meal_query(db: Session):
    return db.query(models.Meal).options(
        joinedload(models.Meal.ingredient_links).joinedload(models.MealIngredient.ingredient)
    )


@router.get("", response_model=list[schemas.MealRead])
def list_meals(
    meal_type: models.MealType | None = None,
    db: Session = Depends(get_db),
) -> list[models.Meal]:
    query = _meal_query(db)
    if meal_type is not None:
        query = query.filter(models.Meal.meal_type == meal_type)
    return query.order_by(models.Meal.name).all()


@router.get("/recommended", response_model=list[schemas.MealRead])
def get_recommended_meals(
    meal_type: models.MealType | None = None,
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> list[models.Meal]:
    return recommend_meals(db, current_user.preference, meal_type=meal_type, limit=limit)


@router.get("/{meal_id}", response_model=schemas.MealRead)
def get_meal(meal_id: int, db: Session = Depends(get_db)) -> models.Meal:
    meal = _meal_query(db).filter(models.Meal.id == meal_id).first()
    if meal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal not found")
    return meal


@router.post("", response_model=schemas.MealRead, status_code=status.HTTP_201_CREATED)
def create_meal(payload: schemas.MealCreate, db: Session = Depends(get_db)) -> models.Meal:
    meal = models.Meal(
        name=payload.name,
        description=payload.description,
        meal_type=payload.meal_type,
        calories=payload.calories,
        protein_g=payload.protein_g,
        carbs_g=payload.carbs_g,
        fat_g=payload.fat_g,
        dietary_tags=payload.dietary_tags,
        allergens=payload.allergens,
    )
    for item in payload.ingredients:
        ingredient = db.query(models.Ingredient).filter(models.Ingredient.name == item.name).first()
        if ingredient is None:
            ingredient = models.Ingredient(name=item.name)
            db.add(ingredient)
            db.flush()
        meal.ingredient_links.append(
            models.MealIngredient(ingredient=ingredient, quantity=item.quantity, unit=item.unit)
        )

    db.add(meal)
    db.commit()
    db.refresh(meal)
    return meal
