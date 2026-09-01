from fastapi import Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

import models
from database import get_db
from security import decode_access_token

COOKIE_NAME = "access_token"


def get_current_user(request: Request, db: Session = Depends(get_db)) -> models.User:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    user_id = decode_access_token(token)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user = db.get(models.User, int(user_id))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user


def get_current_user_or_guest_preference(
    request: Request,
    db: Session = Depends(get_db),
    dietary_type: models.DietaryType = Query(default=models.DietaryType.OMNIVORE),
    calorie_goal: int = Query(default=2000, ge=800, le=6000),
    allergies: list[str] = Query(default=[]),
    disliked_foods: list[str] = Query(default=[]),
) -> models.Preference:
    """Returns the logged-in user's saved Preference if the access_token
    cookie is present and valid; otherwise builds a throwaway, never-
    persisted Preference from query params (or the same defaults the
    Preference model itself uses) -- so a guest can get real
    recommendations without an account and without anything touching the
    database.

    Deliberately a standalone check rather than built on top of
    get_current_user(): that function's job is to enforce login and raise
    401 when there isn't one, and every endpoint that still requires a
    real account should keep depending on it, completely unchanged.
    """
    token = request.cookies.get(COOKIE_NAME)
    if token:
        user_id = decode_access_token(token)
        if user_id is not None:
            user = db.get(models.User, int(user_id))
            if user is not None:
                return user.preference

    return models.Preference(
        dietary_type=dietary_type,
        calorie_goal=calorie_goal,
        allergies=allergies,
        disliked_foods=disliked_foods,
    )
