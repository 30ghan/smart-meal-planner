export type DietaryType =
  | "omnivore"
  | "vegetarian"
  | "vegan"
  | "pescatarian"
  | "keto"
  | "paleo"
  | "gluten_free"
  | "high_protein"
  | "low_carb";

export type MealType = "breakfast" | "lunch" | "dinner";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export const DAYS_OF_WEEK: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];

export const DIETARY_TYPES: DietaryType[] = [
  "omnivore",
  "vegetarian",
  "vegan",
  "pescatarian",
  "keto",
  "paleo",
  "gluten_free",
  "high_protein",
  "low_carb",
];

export interface User {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

export interface Preference {
  id: number;
  user_id: number;
  dietary_type: DietaryType;
  calorie_goal: number;
  allergies: string[];
  disliked_foods: string[];
}

export interface MealIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Meal {
  id: number;
  name: string;
  description: string;
  meal_type: MealType;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  dietary_tags: string[];
  allergens: string[];
  ingredients: MealIngredient[];
}

export interface PlannerEntry {
  id: number;
  week_start: string;
  day_of_week: DayOfWeek;
  meal_type: MealType;
  meal: Meal;
}

export interface GroceryListItem {
  ingredient: string;
  quantity: number;
  unit: string;
}

export interface GroceryListGroup {
  category: string;
  items: GroceryListItem[];
}

export interface GroceryList {
  week_start: string;
  groups: GroceryListGroup[];
  total_items: number;
}
