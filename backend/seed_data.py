"""Populate the database with a starter catalog of meals so the
recommendation engine and grocery list have something to work with.

Run with: python seed_data.py
"""

import models
from database import Base, SessionLocal, engine

SAMPLE_MEALS = [
    {
        "name": "Oatmeal with Berries",
        "description": "Rolled oats topped with mixed berries and honey.",
        "meal_type": models.MealType.BREAKFAST,
        "calories": 350,
        "protein_g": 10,
        "carbs_g": 60,
        "fat_g": 6,
        "dietary_tags": ["vegetarian", "vegan", "gluten_free"],
        "allergens": [],
        "ingredients": [
            {"name": "rolled oats", "quantity": 1, "unit": "cup"},
            {"name": "mixed berries", "quantity": 0.5, "unit": "cup"},
            {"name": "honey", "quantity": 1, "unit": "tbsp"},
        ],
    },
    {
        "name": "Greek Yogurt Parfait",
        "description": "Greek yogurt layered with granola and honey.",
        "meal_type": models.MealType.BREAKFAST,
        "calories": 320,
        "protein_g": 20,
        "carbs_g": 40,
        "fat_g": 8,
        "dietary_tags": ["vegetarian"],
        "allergens": ["dairy"],
        "ingredients": [
            {"name": "greek yogurt", "quantity": 1, "unit": "cup"},
            {"name": "granola", "quantity": 0.5, "unit": "cup"},
            {"name": "honey", "quantity": 1, "unit": "tbsp"},
        ],
    },
    {
        "name": "Veggie Scramble",
        "description": "Scrambled eggs with bell peppers, onion, and spinach.",
        "meal_type": models.MealType.BREAKFAST,
        "calories": 400,
        "protein_g": 24,
        "carbs_g": 12,
        "fat_g": 26,
        "dietary_tags": ["vegetarian", "gluten_free", "keto", "paleo"],
        "allergens": ["eggs"],
        "ingredients": [
            {"name": "eggs", "quantity": 3, "unit": "unit"},
            {"name": "bell pepper", "quantity": 0.5, "unit": "unit"},
            {"name": "onion", "quantity": 0.25, "unit": "unit"},
            {"name": "spinach", "quantity": 1, "unit": "cup"},
        ],
    },
    {
        "name": "Peanut Butter Banana Toast",
        "description": "Whole grain toast with peanut butter and banana.",
        "meal_type": models.MealType.BREAKFAST,
        "calories": 380,
        "protein_g": 12,
        "carbs_g": 52,
        "fat_g": 14,
        "dietary_tags": ["vegetarian", "vegan"],
        "allergens": ["peanuts", "gluten"],
        "ingredients": [
            {"name": "whole grain bread", "quantity": 2, "unit": "slice"},
            {"name": "peanut butter", "quantity": 2, "unit": "tbsp"},
            {"name": "banana", "quantity": 1, "unit": "unit"},
        ],
    },
    {
        "name": "Grilled Chicken Salad",
        "description": "Mixed greens with grilled chicken, tomato, and vinaigrette.",
        "meal_type": models.MealType.LUNCH,
        "calories": 480,
        "protein_g": 40,
        "carbs_g": 18,
        "fat_g": 26,
        "dietary_tags": ["gluten_free", "paleo", "keto"],
        "allergens": [],
        "ingredients": [
            {"name": "chicken breast", "quantity": 6, "unit": "oz"},
            {"name": "mixed greens", "quantity": 2, "unit": "cup"},
            {"name": "cherry tomatoes", "quantity": 0.5, "unit": "cup"},
            {"name": "olive oil vinaigrette", "quantity": 2, "unit": "tbsp"},
        ],
    },
    {
        "name": "Falafel Wrap",
        "description": "Falafel, hummus, and vegetables in a whole wheat wrap.",
        "meal_type": models.MealType.LUNCH,
        "calories": 550,
        "protein_g": 18,
        "carbs_g": 68,
        "fat_g": 22,
        "dietary_tags": ["vegetarian", "vegan"],
        "allergens": ["gluten", "sesame"],
        "ingredients": [
            {"name": "falafel", "quantity": 5, "unit": "unit"},
            {"name": "whole wheat wrap", "quantity": 1, "unit": "unit"},
            {"name": "hummus", "quantity": 3, "unit": "tbsp"},
            {"name": "cucumber", "quantity": 0.5, "unit": "unit"},
        ],
    },
    {
        "name": "Shrimp Tacos",
        "description": "Seared shrimp in corn tortillas with cabbage slaw.",
        "meal_type": models.MealType.LUNCH,
        "calories": 520,
        "protein_g": 32,
        "carbs_g": 46,
        "fat_g": 20,
        "dietary_tags": ["pescatarian", "gluten_free"],
        "allergens": ["shellfish"],
        "ingredients": [
            {"name": "shrimp", "quantity": 6, "unit": "oz"},
            {"name": "corn tortillas", "quantity": 3, "unit": "unit"},
            {"name": "cabbage slaw", "quantity": 1, "unit": "cup"},
            {"name": "lime", "quantity": 1, "unit": "unit"},
        ],
    },
    {
        "name": "Quinoa Buddha Bowl",
        "description": "Quinoa, roasted vegetables, and tahini dressing.",
        "meal_type": models.MealType.LUNCH,
        "calories": 500,
        "protein_g": 16,
        "carbs_g": 64,
        "fat_g": 18,
        "dietary_tags": ["vegetarian", "vegan", "gluten_free"],
        "allergens": ["sesame"],
        "ingredients": [
            {"name": "quinoa", "quantity": 1, "unit": "cup"},
            {"name": "roasted sweet potato", "quantity": 1, "unit": "cup"},
            {"name": "chickpeas", "quantity": 0.5, "unit": "cup"},
            {"name": "tahini dressing", "quantity": 2, "unit": "tbsp"},
        ],
    },
    {
        "name": "Turkey Club Sandwich",
        "description": "Turkey, bacon, lettuce, and tomato on toasted bread.",
        "meal_type": models.MealType.LUNCH,
        "calories": 560,
        "protein_g": 34,
        "carbs_g": 42,
        "fat_g": 28,
        "dietary_tags": [],
        "allergens": ["gluten"],
        "ingredients": [
            {"name": "turkey breast", "quantity": 4, "unit": "oz"},
            {"name": "bacon", "quantity": 2, "unit": "slice"},
            {"name": "bread", "quantity": 3, "unit": "slice"},
            {"name": "lettuce", "quantity": 2, "unit": "leaf"},
            {"name": "tomato", "quantity": 0.5, "unit": "unit"},
        ],
    },
    {
        "name": "Baked Salmon with Asparagus",
        "description": "Oven-roasted salmon fillet with asparagus.",
        "meal_type": models.MealType.DINNER,
        "calories": 620,
        "protein_g": 44,
        "carbs_g": 14,
        "fat_g": 40,
        "dietary_tags": ["pescatarian", "gluten_free", "keto", "paleo"],
        "allergens": ["fish"],
        "ingredients": [
            {"name": "salmon fillet", "quantity": 8, "unit": "oz"},
            {"name": "asparagus", "quantity": 1, "unit": "bunch"},
            {"name": "olive oil", "quantity": 1, "unit": "tbsp"},
            {"name": "lemon", "quantity": 1, "unit": "unit"},
        ],
    },
    {
        "name": "Beef Stir Fry",
        "description": "Sliced beef and vegetables in a soy-ginger sauce over rice.",
        "meal_type": models.MealType.DINNER,
        "calories": 680,
        "protein_g": 38,
        "carbs_g": 62,
        "fat_g": 26,
        "dietary_tags": [],
        "allergens": ["soy", "gluten"],
        "ingredients": [
            {"name": "beef sirloin", "quantity": 6, "unit": "oz"},
            {"name": "broccoli", "quantity": 1, "unit": "cup"},
            {"name": "carrot", "quantity": 1, "unit": "unit"},
            {"name": "jasmine rice", "quantity": 1, "unit": "cup"},
            {"name": "soy sauce", "quantity": 2, "unit": "tbsp"},
        ],
    },
    {
        "name": "Chickpea Coconut Curry",
        "description": "Chickpeas simmered in coconut curry sauce over rice.",
        "meal_type": models.MealType.DINNER,
        "calories": 610,
        "protein_g": 18,
        "carbs_g": 78,
        "fat_g": 24,
        "dietary_tags": ["vegetarian", "vegan", "gluten_free"],
        "allergens": [],
        "ingredients": [
            {"name": "chickpeas", "quantity": 1.5, "unit": "cup"},
            {"name": "coconut milk", "quantity": 1, "unit": "cup"},
            {"name": "curry paste", "quantity": 2, "unit": "tbsp"},
            {"name": "jasmine rice", "quantity": 1, "unit": "cup"},
        ],
    },
    {
        "name": "Zucchini Noodle Bolognese",
        "description": "Spiralized zucchini with a beef and tomato ragu.",
        "meal_type": models.MealType.DINNER,
        "calories": 480,
        "protein_g": 32,
        "carbs_g": 20,
        "fat_g": 30,
        "dietary_tags": ["gluten_free", "keto", "paleo"],
        "allergens": [],
        "ingredients": [
            {"name": "zucchini", "quantity": 2, "unit": "unit"},
            {"name": "ground beef", "quantity": 6, "unit": "oz"},
            {"name": "tomato sauce", "quantity": 1, "unit": "cup"},
            {"name": "parmesan cheese", "quantity": 2, "unit": "tbsp"},
        ],
    },
    {
        "name": "Margherita Pizza",
        "description": "Thin crust pizza with tomato, mozzarella, and basil.",
        "meal_type": models.MealType.DINNER,
        "calories": 700,
        "protein_g": 26,
        "carbs_g": 82,
        "fat_g": 28,
        "dietary_tags": ["vegetarian"],
        "allergens": ["gluten", "dairy"],
        "ingredients": [
            {"name": "pizza dough", "quantity": 1, "unit": "unit"},
            {"name": "mozzarella cheese", "quantity": 1, "unit": "cup"},
            {"name": "tomato sauce", "quantity": 0.5, "unit": "cup"},
            {"name": "basil", "quantity": 6, "unit": "leaf"},
        ],
    },
    {
        "name": "Lentil Soup",
        "description": "Hearty lentil soup with carrots, celery, and cumin.",
        "meal_type": models.MealType.DINNER,
        "calories": 420,
        "protein_g": 22,
        "carbs_g": 60,
        "fat_g": 8,
        "dietary_tags": ["vegetarian", "vegan", "gluten_free"],
        "allergens": [],
        "ingredients": [
            {"name": "lentils", "quantity": 1.5, "unit": "cup"},
            {"name": "carrot", "quantity": 1, "unit": "unit"},
            {"name": "celery", "quantity": 1, "unit": "stalk"},
            {"name": "vegetable broth", "quantity": 3, "unit": "cup"},
        ],
    },
]


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(models.Meal).first() is not None:
            print("Meals already exist, skipping seed.")
            return

        for data in SAMPLE_MEALS:
            data = dict(data)
            ingredients = data.pop("ingredients")
            meal = models.Meal(**data)
            for item in ingredients:
                ingredient = db.query(models.Ingredient).filter(models.Ingredient.name == item["name"]).first()
                if ingredient is None:
                    ingredient = models.Ingredient(name=item["name"])
                    db.add(ingredient)
                    db.flush()
                meal.ingredient_links.append(
                    models.MealIngredient(ingredient=ingredient, quantity=item["quantity"], unit=item["unit"])
                )
            db.add(meal)

        db.commit()
        print(f"Seeded {len(SAMPLE_MEALS)} meals.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
