from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from deps import COOKIE_NAME, get_current_user
from security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7


def _set_auth_cookie(response: Response, user_id: int) -> None:
    token = create_access_token(subject=str(user_id))
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,  # set True when served over HTTPS in production
        max_age=COOKIE_MAX_AGE_SECONDS,
        path="/",
    )


@router.post("/register", response_model=schemas.UserRead, status_code=status.HTTP_201_CREATED)
def register(payload: schemas.UserCreate, response: Response, db: Session = Depends(get_db)) -> models.User:
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = models.User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.flush()
    db.add(models.Preference(user_id=user.id))
    db.commit()
    db.refresh(user)

    _set_auth_cookie(response, user.id)
    return user


@router.post("/login", response_model=schemas.UserRead)
def login(payload: schemas.LoginRequest, response: Response, db: Session = Depends(get_db)) -> models.User:
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    _set_auth_cookie(response, user.id)
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> None:
    response.delete_cookie(COOKIE_NAME, path="/")


@router.get("/me", response_model=schemas.UserRead)
def me(current_user: models.User = Depends(get_current_user)) -> models.User:
    return current_user
