"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { DIET_LABELS, isMeatMeal } from "@/lib/diet";
import { DIETARY_TYPES, MEAL_TYPES, type DietaryType, type Meal, type MealType } from "@/lib/types";
import { CalorieWheel } from "@/components/CalorieWheel";
import { DietIcon, DrumstickIcon } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Input";

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

const KNOWN_DIET_TAGS = new Set<string>(DIETARY_TYPES);

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [mealType, setMealType] = useState<MealType | "">("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset the loading flag synchronously when the filter changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const query = mealType ? `?meal_type=${mealType}` : "";
    api
      .get<Meal[]>(`/meals${query}`)
      .then(setMeals)
      .catch(() => {
        // Leaves the catalog empty rather than crashing the page.
      })
      .finally(() => setLoading(false));
  }, [mealType]);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Meal catalog</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Browse every meal available for your weekly plan.
          </p>
        </div>
        <Select
          value={mealType}
          onChange={(e) => setMealType(e.target.value as MealType | "")}
          className="w-auto"
        >
          <option value="">All meal types</option>
          {MEAL_TYPES.map((type) => (
            <option key={type} value={type}>
              {MEAL_TYPE_LABELS[type]}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-zinc-500">Loading...</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meals.map((meal) => (
            <Card key={meal.id}>
              <div className="flex items-start justify-between gap-2">
                <h2 className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-50">
                  {isMeatMeal(meal) && (
                    <DrumstickIcon
                      className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-500"
                      aria-label="Contains meat, poultry, or seafood"
                    />
                  )}
                  {meal.name}
                </h2>
                <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {MEAL_TYPE_LABELS[meal.meal_type]}
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{meal.description}</p>

              <div className="mt-3 flex items-center gap-4">
                <CalorieWheel calories={meal.calories} size={48} />
                <div className="flex flex-col gap-0.5 text-xs text-zinc-500">
                  <span>{meal.protein_g}g protein</span>
                  <span>{meal.carbs_g}g carbs</span>
                  <span>{meal.fat_g}g fat</span>
                </div>
              </div>

              {meal.dietary_tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {meal.dietary_tags
                    .filter((tag): tag is DietaryType => KNOWN_DIET_TAGS.has(tag))
                    .map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700 dark:bg-green-950 dark:text-green-400"
                      >
                        <DietIcon type={tag} className="h-3 w-3" />
                        {DIET_LABELS[tag]}
                      </span>
                    ))}
                </div>
              )}

              {meal.allergens.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {meal.allergens.map((allergen) => (
                    <span
                      key={allergen}
                      className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700 dark:bg-red-950 dark:text-red-400"
                    >
                      {allergen}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
