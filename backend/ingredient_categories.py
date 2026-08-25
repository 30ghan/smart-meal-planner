"""Keyword-based grocery aisle classification for ingredient names.

Categorizing is done from the ingredient name at grocery-list time rather
than stored on the Ingredient model, so the meal catalog can keep growing
without a migration -- this is just a display grouping, not a fact about
the ingredient that other logic depends on.
"""

# Match precedence, NOT display order (see CATEGORY_ORDER for that). Pantry
# is checked before Dairy & Eggs on purpose: "coconut milk" and "peanut
# butter" would otherwise match Dairy's generic "milk" / "butter" keywords
# via substring before reaching Pantry's more specific phrases.
CATEGORY_KEYWORDS: list[tuple[str, list[str]]] = [
    # Seafood is checked before Meat & Poultry: "tuna steak" would otherwise
    # match Meat & Poultry's generic "steak" keyword before ever reaching
    # Seafood's "tuna".
    (
        "Seafood",
        ["salmon", "shrimp", "tuna", "cod", "tilapia", "fish", "trout", "crab"],
    ),
    (
        "Meat & Poultry",
        ["chicken", "turkey", "beef", "steak", "pork", "bacon", "sausage", "lamb", "ham"],
    ),
    (
        "Produce",
        [
            "tomato",
            "onion",
            "garlic",
            "spinach",
            "broccoli",
            "cauliflower",
            "carrot",
            "celery",
            "lettuce",
            "cucumber",
            "avocado",
            "lemon",
            "lime",
            "banana",
            "berries",
            "apple",
            "potato",
            "zucchini",
            "bell pepper",
            "asparagus",
            "mushroom",
            "cabbage",
            "basil",
            "cilantro",
            "kale",
            "brussels sprout",
            "green beans",
            "scallion",
            "ginger",
            "slaw",
            "sprout",
            "eggplant",
            "squash",
            "sweet corn",
            "greens",
        ],
    ),
    (
        "Pantry",
        [
            "oil",
            "sauce",
            "honey",
            "vinegar",
            "broth",
            "curry paste",
            "tahini",
            "peanut butter",
            "almond butter",
            "almond",
            "walnut",
            "cashew",
            "seed",
            "coconut milk",
            "chickpeas",
            "lentils",
            "beans",
            "tofu",
            "tempeh",
            "spice",
            "cumin",
            "paprika",
            "tamari",
            "soy sauce",
            "salsa",
            "olives",
            "miso",
            "cocoa",
            "chocolate",
            "syrup",
            "mayo",
            "mustard",
            "dressing",
            "yeast",
            "protein powder",
            "falafel",
            "hummus",
        ],
    ),
    (
        "Dairy & Eggs",
        ["cheese", "yogurt", "cream", "butter", "eggs", "egg", "milk"],
    ),
    (
        "Grains & Bakery",
        [
            "rice",
            "quinoa",
            "oats",
            "bread",
            "tortilla",
            "wrap",
            "pasta",
            "dough",
            "buckwheat",
            "granola",
            "noodle",
            "bagel",
            "muesli",
        ],
    ),
]

# Display order in the grocery list -- independent of match precedence above.
CATEGORY_ORDER = ["Produce", "Meat & Poultry", "Seafood", "Dairy & Eggs", "Grains & Bakery", "Pantry", "Other"]


def categorize_ingredient(name: str) -> str:
    lowered = name.lower()

    # "chicken broth" / "beef stock" etc. would otherwise match Meat &
    # Poultry via the protein name before reaching Pantry's "broth"
    # keyword; broth/stock is shelf-stable pantry regardless of flavor.
    if "broth" in lowered or "stock" in lowered:
        return "Pantry"

    for category, keywords in CATEGORY_KEYWORDS:
        if any(keyword in lowered for keyword in keywords):
            return category
    return "Other"
