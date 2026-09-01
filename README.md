# Smart Meal Planner

A full-stack meal planning app. Users set dietary preferences — diet type,
allergies, disliked foods, and a daily calorie goal — and get meal
recommendations that respect them, a full weekly meal plan (breakfast,
lunch, and dinner across all 7 days), and an auto-generated grocery list
grouped by category (produce, meat & poultry, dairy, pantry, etc.) with
ingredient quantities combined across the week.

## Features

- **Accounts** — register/login/logout with JWT auth stored in an httpOnly
  cookie.
- **Preferences** — dietary type (vegetarian, vegan, keto, high-protein,
  low-carb, and more), allergies, disliked foods, and a daily calorie goal.
- **Meal recommendations** — allergen/diet filtering is rule-based and
  absolute (a hard requirement is never "probably fine"); ranking among the
  safe results is done by a scikit-learn `RandomForestRegressor` trained on
  nutritional fit signals (macro balance, calorie-goal fit, diet-tag match).
  See [`backend/README.md`](backend/README.md) for the full writeup.
- **Similar meals** — a content-based `GET /meals/{id}/similar` endpoint
  using scikit-learn `NearestNeighbors` over macro/calorie/diet-tag
  features.
- **Weekly planner** — generates a full 7-day plan from the recommendation
  engine, with variety logic so the same meal doesn't repeat unless the
  catalog genuinely runs out of options; individual slots can be swapped or
  cleared manually.
- **Grocery list** — every ingredient across the week's planned meals,
  quantities summed and duplicates merged, grouped into shopping
  categories.

## Tech stack

- **Frontend**: Next.js (App Router) + React + TypeScript, Tailwind CSS
- **Backend**: FastAPI + SQLAlchemy + SQLite
- **ML**: scikit-learn (`RandomForestRegressor` for ranking,
  `NearestNeighbors` for similarity)
- **Auth**: JWT, stored in an httpOnly cookie (not localStorage)

## Getting started

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # source venv/bin/activate on macOS/Linux
pip install -r requirements.txt
cp .env.example .env         # defaults work as-is for local development
python seed_data.py          # populates the meal catalog
uvicorn main:app --reload    # http://localhost:8000
```

Environment variables (`backend/.env`, see `.env.example`):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLAlchemy connection string (defaults to a local SQLite file) |
| `SECRET_KEY` | JWT signing key — set a real secret in production |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | How long a login session lasts |
| `CORS_ORIGINS` | Allowed frontend origin(s) |

### Frontend

```bash
cd frontend
npm install
npm run dev                  # http://localhost:3000
```

By default the frontend talks to the backend at `http://localhost:8000`.
To point it elsewhere, add `NEXT_PUBLIC_API_URL=<url>` to a
`frontend/.env.local` file.

Requires Python 3.10+ and Node 18+.

## Project structure

```
backend/
  main.py               FastAPI app + router registration
  models.py             SQLAlchemy models (User, Preference, Meal, PlannerEntry, ...)
  schemas.py            Pydantic request/response models
  routers/              auth, preferences, meals, planner endpoints
  recommendations.py    filter (rule-based) + rank (learned) recommendation logic
  ml/                   RandomForestRegressor scoring + NearestNeighbors similarity
  seed_data.py          meal catalog seed script

frontend/
  app/                  pages -- landing, auth, dashboard, preferences, planner, grocery list, meals
  components/           shared UI (cards, buttons, icons, macro/calorie visuals)
  lib/                  API client, shared types, formatting helpers
  context/              auth state
```

See [`backend/README.md`](backend/README.md) for a deeper dive into the
recommendation system.
