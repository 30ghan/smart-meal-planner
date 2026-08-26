"use client";

import { useEffect, useState, type FormEvent } from "react";

import { api, ApiError } from "@/lib/api";
import type { DietaryType, Preference } from "@/lib/types";
import { DietTypeSelector } from "@/components/DietTypeSelector";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { TagInput } from "@/components/ui/TagInput";

export default function PreferencesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [dietaryType, setDietaryType] = useState<DietaryType>("omnivore");
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [dislikedFoods, setDislikedFoods] = useState<string[]>([]);

  useEffect(() => {
    api
      .get<Preference>("/preferences")
      .then((pref) => {
        setDietaryType(pref.dietary_type);
        setCalorieGoal(pref.calorie_goal);
        setAllergies(pref.allergies);
        setDislikedFoods(pref.disliked_foods);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load preferences."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      await api.put<Preference>("/preferences", {
        dietary_type: dietaryType,
        calorie_goal: calorieGoal,
        allergies,
        disliked_foods: dislikedFoods,
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">Loading...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Your preferences</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Used to recommend meals, build your weekly plan, and keep your grocery list relevant.
      </p>

      <Card className="mt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Dietary type</label>
            <DietTypeSelector value={dietaryType} onChange={setDietaryType} />
          </div>

          <div>
            <label htmlFor="calorieGoal" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Daily calorie goal
            </label>
            <Input
              id="calorieGoal"
              type="number"
              min={800}
              max={6000}
              step={50}
              value={calorieGoal}
              onChange={(e) => setCalorieGoal(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Allergies</label>
            <TagInput value={allergies} onChange={setAllergies} placeholder="e.g. peanuts, shellfish" />
            <p className="mt-1 text-xs text-zinc-500">Press Enter or comma to add.</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Disliked foods
            </label>
            <TagInput value={dislikedFoods} onChange={setDislikedFoods} placeholder="e.g. mushroom, cilantro" />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {saved && <p className="text-sm text-green-600">Preferences saved.</p>}

          <Button type="submit" disabled={saving} className="self-start">
            {saving ? "Saving..." : "Save preferences"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
