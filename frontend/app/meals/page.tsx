"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { getGuestPreferences, guestPreferencesToSearchParams } from "@/lib/guestPreferences";
import { MEAL_TYPES, type Meal, type MealType } from "@/lib/types";
import { MealCard } from "@/components/MealCard";
import { Select } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

export default function MealsPage() {
  const { user, loading: authLoading } = useAuth();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [mealType, setMealType] = useState<MealType | "">("");
  const [loading, setLoading] = useState(true);

  const [recommended, setRecommended] = useState<Meal[]>([]);
  const [recommendedLoading, setRecommendedLoading] = useState(true);

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

  useEffect(() => {
    if (authLoading) return;

    // Logged-in users' saved preferences are read server-side from the
    // access_token cookie -- no query params needed. A guest's preferences
    // never leave this device, so they're sent as query params instead;
    // /meals/recommended accepts both without requiring login either way.
    const params = user ? new URLSearchParams() : guestPreferencesToSearchParams(getGuestPreferences());
    params.set("limit", "6");

    api
      .get<Meal[]>(`/meals/recommended?${params.toString()}`)
      .then(setRecommended)
      .catch(() => {
        // Leaves the recommended row empty rather than crashing the page.
      })
      .finally(() => setRecommendedLoading(false));
  }, [authLoading, user]);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Meal catalog</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Browse every meal available for your weekly plan.
        </p>
      </div>

      {!authLoading && (recommendedLoading || recommended.length > 0) && (
        <div className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Recommended for you
            </h2>
            <p className="text-sm text-zinc-500">
              {user ? (
                "Based on your saved preferences."
              ) : (
                <>
                  Based on preferences saved on this device.{" "}
                  <Link href="/preferences" className="font-medium underline underline-offset-2">
                    Set them here
                  </Link>
                  .
                </>
              )}
            </p>
          </div>

          {recommendedLoading ? (
            <p className="mt-4 text-sm text-zinc-500">Loading...</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Full catalog</h2>
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
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      )}
    </div>
  );
}
