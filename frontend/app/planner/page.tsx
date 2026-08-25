"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { api, ApiError } from "@/lib/api";
import { isMeatMeal } from "@/lib/diet";
import { DAYS_OF_WEEK, MEAL_TYPES, type DayOfWeek, type Meal, type MealType, type PlannerEntry } from "@/lib/types";
import { CalorieWheel } from "@/components/CalorieWheel";
import { DrumstickIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

function mondayOf(date: Date): Date {
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function formatDate(date: Date): string {
  // Format using local date parts. toISOString() converts to UTC first,
  // which rolls midnight-local back to the previous day for any positive
  // UTC offset (e.g. BST) and silently sends the wrong week to the API.
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function PlannerPage() {
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const [entries, setEntries] = useState<PlannerEntry[]>([]);
  const [recommended, setRecommended] = useState<Record<MealType, Meal[]>>({
    breakfast: [],
    lunch: [],
    dinner: [],
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingSlot, setPendingSlot] = useState<string | null>(null);

  const weekStartParam = useMemo(() => formatDate(weekStart), [weekStart]);
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  const loadWeek = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<PlannerEntry[]>(`/planner?week_start=${weekStartParam}`);
      setEntries(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load your planner.");
    } finally {
      setLoading(false);
    }
  }, [weekStartParam]);

  useEffect(() => {
    // No data-fetching library here; loadWeek() resets loading/error state
    // synchronously each time the selected week changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWeek();
  }, [loadWeek]);

  useEffect(() => {
    Promise.all(
      MEAL_TYPES.map((mealType) => api.get<Meal[]>(`/meals/recommended?meal_type=${mealType}&limit=8`)),
    )
      .then(([breakfast, lunch, dinner]) => setRecommended({ breakfast, lunch, dinner }))
      .catch(() => {
        // A 401 here triggers a redirect to /login inside the api client;
        // any other failure just leaves the "swap meal" pickers empty.
      });
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const data = await api.post<PlannerEntry[]>(`/planner/generate?week_start=${weekStartParam}`);
      setEntries(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to generate a plan.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleAssign(day: DayOfWeek, mealType: MealType, mealId: number) {
    const slotKey = `${day}-${mealType}`;
    setPendingSlot(slotKey);
    setError(null);
    try {
      const entry = await api.put<PlannerEntry>("/planner/slot", {
        week_start: weekStartParam,
        day_of_week: day,
        meal_type: mealType,
        meal_id: mealId,
      });
      setEntries((prev) => [...prev.filter((e) => !(e.day_of_week === day && e.meal_type === mealType)), entry]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update that meal.");
    } finally {
      setPendingSlot(null);
    }
  }

  async function handleClear(day: DayOfWeek, mealType: MealType) {
    const slotKey = `${day}-${mealType}`;
    setPendingSlot(slotKey);
    setError(null);
    try {
      await api.delete(`/planner/slot?week_start=${weekStartParam}&day_of_week=${day}&meal_type=${mealType}`);
      setEntries((prev) => prev.filter((e) => !(e.day_of_week === day && e.meal_type === mealType)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to clear that slot.");
    } finally {
      setPendingSlot(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Weekly planner</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} &ndash;{" "}
            {weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setWeekStart((w) => addDays(w, -7))}>
            Previous
          </Button>
          <Button variant="secondary" onClick={() => setWeekStart(mondayOf(new Date()))}>
            This week
          </Button>
          <Button variant="secondary" onClick={() => setWeekStart((w) => addDays(w, 7))}>
            Next
          </Button>
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? "Generating..." : "Generate week"}
          </Button>
          <Link href="/planner/grocery-list">
            <Button variant="secondary">Grocery list</Button>
          </Link>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 overflow-x-auto">
        <div className="grid min-w-[900px] grid-cols-[100px_repeat(7,1fr)] gap-2">
          <div />
          {DAYS_OF_WEEK.map((day, i) => (
            <div key={day} className="text-center text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {DAY_LABELS[day]}
              <div className="text-xs font-normal text-zinc-400">
                {addDays(weekStart, i).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
            </div>
          ))}

          {MEAL_TYPES.map((mealType) => (
            <div key={mealType} className="contents">
              <div className="flex items-center text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {MEAL_TYPE_LABELS[mealType]}
              </div>
              {DAYS_OF_WEEK.map((day) => {
                const entry = entries.find((e) => e.day_of_week === day && e.meal_type === mealType);
                const slotKey = `${day}-${mealType}`;
                const isPending = pendingSlot === slotKey;

                return (
                  <Card key={slotKey} className="flex min-h-28 flex-col justify-between p-3">
                    {loading ? (
                      <div className="flex-1 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                    ) : entry ? (
                      <>
                        <div className="flex items-center gap-2">
                          <CalorieWheel calories={entry.meal.calories} size={34} />
                          <p className="flex items-center gap-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                            {isMeatMeal(entry.meal) && (
                              <DrumstickIcon className="h-3 w-3 shrink-0 text-amber-700 dark:text-amber-500" />
                            )}
                            {entry.meal.name}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleClear(day, mealType)}
                          disabled={isPending}
                          className="mt-2 self-start text-xs text-zinc-400 hover:text-red-600 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <p className="text-xs text-zinc-400">Not planned</p>
                    )}

                    <select
                      value=""
                      disabled={isPending}
                      onChange={(e) => e.target.value && handleAssign(day, mealType, Number(e.target.value))}
                      className="mt-2 w-full rounded border border-zinc-200 bg-transparent text-xs text-zinc-500 focus:outline-none dark:border-zinc-700"
                    >
                      <option value="">{entry ? "Swap meal..." : "Choose meal..."}</option>
                      {recommended[mealType].map((meal) => (
                        <option key={meal.id} value={meal.id}>
                          {meal.name}
                        </option>
                      ))}
                    </select>
                  </Card>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
