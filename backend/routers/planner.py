from collections import defaultdict
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

import models
import schemas
from database import get_db
from deps import get_current_user
from ingredient_categories import CATEGORY_ORDER, categorize_ingredient
from recommendations import generate_weekly_plan

router = APIRouter(prefix="/planner", tags=["planner"])


def _monday_of(d: date) -> date:
    return d - timedelta(days=d.weekday())


def _week_query(db: Session, user_id: int, week_start: date):
    return (
        db.query(models.PlannerEntry)
        .options(
            joinedload(models.PlannerEntry.meal)
            .joinedload(models.Meal.ingredient_links)
            .joinedload(models.MealIngredient.ingredient)
        )
        .filter(models.PlannerEntry.user_id == user_id, models.PlannerEntry.week_start == week_start)
    )


@router.get("", response_model=list[schemas.PlannerEntryRead])
def get_week(
    week_start: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> list[models.PlannerEntry]:
    start = _monday_of(week_start or date.today())
    return _week_query(db, current_user.id, start).all()


@router.post("/generate", response_model=list[schemas.PlannerEntryRead], status_code=status.HTTP_201_CREATED)
def generate_plan(
    week_start: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> list[models.PlannerEntry]:
    start = _monday_of(week_start or date.today())

    _week_query(db, current_user.id, start).delete(synchronize_session=False)
    entries = generate_weekly_plan(db, current_user, start)
    db.add_all(entries)
    db.commit()

    return _week_query(db, current_user.id, start).all()


@router.put("/slot", response_model=schemas.PlannerEntryRead)
def set_slot(
    payload: schemas.PlannerEntrySet,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> models.PlannerEntry:
    meal = db.get(models.Meal, payload.meal_id)
    if meal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal not found")

    start = _monday_of(payload.week_start)
    entry = (
        db.query(models.PlannerEntry)
        .filter(
            models.PlannerEntry.user_id == current_user.id,
            models.PlannerEntry.week_start == start,
            models.PlannerEntry.day_of_week == payload.day_of_week,
            models.PlannerEntry.meal_type == payload.meal_type,
        )
        .first()
    )
    if entry is not None:
        entry.meal_id = meal.id
    else:
        entry = models.PlannerEntry(
            user_id=current_user.id,
            meal_id=meal.id,
            week_start=start,
            day_of_week=payload.day_of_week,
            meal_type=payload.meal_type,
        )
        db.add(entry)

    db.commit()

    return (
        _week_query(db, current_user.id, start)
        .filter(
            models.PlannerEntry.day_of_week == payload.day_of_week,
            models.PlannerEntry.meal_type == payload.meal_type,
        )
        .first()
    )


@router.delete("/slot", status_code=status.HTTP_204_NO_CONTENT)
def clear_slot(
    week_start: date,
    day_of_week: models.DayOfWeek,
    meal_type: models.MealType,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> None:
    start = _monday_of(week_start)
    db.query(models.PlannerEntry).filter(
        models.PlannerEntry.user_id == current_user.id,
        models.PlannerEntry.week_start == start,
        models.PlannerEntry.day_of_week == day_of_week,
        models.PlannerEntry.meal_type == meal_type,
    ).delete(synchronize_session=False)
    db.commit()


@router.get("/grocery-list", response_model=schemas.GroceryListResponse)
def grocery_list(
    week_start: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> schemas.GroceryListResponse:
    start = _monday_of(week_start or date.today())
    entries = _week_query(db, current_user.id, start).all()

    # Sum quantities for the same ingredient+unit across every meal in the
    # week, so a shared ingredient (e.g. eggs in both breakfast and dinner)
    # becomes one combined line instead of a duplicate entry per meal.
    totals: dict[tuple[str, str], float] = defaultdict(float)
    for entry in entries:
        for link in entry.meal.ingredient_links:
            totals[(link.name, link.unit)] += link.quantity

    by_category: dict[str, list[schemas.GroceryListItem]] = defaultdict(list)
    for (name, unit), qty in sorted(totals.items()):
        item = schemas.GroceryListItem(ingredient=name, quantity=round(qty, 2), unit=unit)
        by_category[categorize_ingredient(name)].append(item)

    groups = [
        schemas.GroceryListGroup(category=category, items=by_category[category])
        for category in CATEGORY_ORDER
        if by_category.get(category)
    ]
    total_items = sum(len(group.items) for group in groups)
    return schemas.GroceryListResponse(week_start=start, groups=groups, total_items=total_items)
