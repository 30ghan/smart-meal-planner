from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from deps import get_current_user

router = APIRouter(prefix="/preferences", tags=["preferences"])


@router.get("", response_model=schemas.PreferenceRead)
def get_preferences(current_user: models.User = Depends(get_current_user)) -> models.Preference:
    return current_user.preference


@router.put("", response_model=schemas.PreferenceRead)
def update_preferences(
    payload: schemas.PreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> models.Preference:
    preference = current_user.preference
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(preference, field, value)
    db.commit()
    db.refresh(preference)
    return preference
