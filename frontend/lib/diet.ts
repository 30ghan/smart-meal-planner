import type { DietaryType, Meal } from "@/lib/types";

export const DIET_LABELS: Record<DietaryType, string> = {
  omnivore: "Omnivore",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  pescatarian: "Pescatarian",
  keto: "Keto",
  paleo: "Paleo",
  gluten_free: "Gluten-free",
  high_protein: "High protein",
  low_carb: "Low-carb",
};

// Ingredient/name keywords used to flag a meal as containing meat, poultry,
// or seafood, so the UI can show a meat indicator even on meals that don't
// carry an explicit dietary tag for it (most omnivore meals don't).
const MEAT_KEYWORDS = [
  "chicken",
  "turkey",
  "beef",
  "pork",
  "bacon",
  "sausage",
  "lamb",
  "salmon",
  "shrimp",
  "fish",
];

export function isMeatMeal(meal: Meal): boolean {
  if (meal.dietary_tags.includes("vegetarian") || meal.dietary_tags.includes("vegan")) {
    return false;
  }
  const haystack = [meal.name, ...meal.ingredients.map((i) => i.name)].join(" ").toLowerCase();
  return MEAT_KEYWORDS.some((keyword) => haystack.includes(keyword));
}
