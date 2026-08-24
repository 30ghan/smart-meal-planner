"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { DayOfWeek, MealType, Preference, PlannerEntry } from "@/lib/types";
import { MEAL_TYPES } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

function todayName(): DayOfWeek {
  return new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() as DayOfWeek;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [preference, setPreference] = useState<Preference | null>(null);
  const [todaysEntries, setTodaysEntries] = useState<PlannerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get<Preference>("/preferences"), api.get<PlannerEntry[]>("/planner")])
      .then(([pref, entries]) => {
        setPreference(pref);
        const today = todayName();
        setTodaysEntries(entries.filter((e) => e.day_of_week === today));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Welcome back{user ? `, ${user.full_name}` : ""}
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="font-medium text-zinc-900 dark:text-zinc-50">Today&apos;s meals</h2>
          {loading ? (
            <p className="mt-2 text-sm text-zinc-500">Loading...</p>
          ) : todaysEntries.length === 0 ? (
            <div className="mt-2">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Nothing planned for today yet.
              </p>
              <Link href="/planner" className="mt-3 inline-block">
                <Button variant="secondary">Plan your week</Button>
              </Link>
            </div>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {MEAL_TYPES.map((mealType) => {
                const entry = todaysEntries.find((e) => e.meal_type === mealType);
                return (
                  <li key={mealType} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">{MEAL_TYPE_LABELS[mealType]}</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {entry ? entry.meal.name : "Not planned"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-medium text-zinc-900 dark:text-zinc-50">Your preferences</h2>
          {loading ? (
            <p className="mt-2 text-sm text-zinc-500">Loading...</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              <li className="flex justify-between">
                <span className="text-zinc-500">Diet</span>
                <span className="font-medium capitalize text-zinc-900 dark:text-zinc-50">
                  {preference?.dietary_type.replace("_", " ")}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-zinc-500">Calorie goal</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {preference?.calorie_goal} kcal/day
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-zinc-500">Allergies</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {preference?.allergies.length ? preference.allergies.join(", ") : "None"}
                </span>
              </li>
            </ul>
          )}
          <Link href="/preferences" className="mt-4 inline-block">
            <Button variant="secondary">Edit preferences</Button>
          </Link>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Link href="/planner">
          <Card className="transition-colors hover:border-zinc-400 dark:hover:border-zinc-600">
            <h3 className="font-medium text-zinc-900 dark:text-zinc-50">Weekly planner</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              View or generate your 7-day plan.
            </p>
          </Card>
        </Link>
        <Link href="/planner/grocery-list">
          <Card className="transition-colors hover:border-zinc-400 dark:hover:border-zinc-600">
            <h3 className="font-medium text-zinc-900 dark:text-zinc-50">Grocery list</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              See what to buy for this week.
            </p>
          </Card>
        </Link>
        <Link href="/meals">
          <Card className="transition-colors hover:border-zinc-400 dark:hover:border-zinc-600">
            <h3 className="font-medium text-zinc-900 dark:text-zinc-50">Browse meals</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Explore the full meal catalog.
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
