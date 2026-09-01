"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import { api, ApiError } from "@/lib/api";
import { getGuestPreferences, setGuestPreferences } from "@/lib/guestPreferences";
import type { DietaryType, Preference } from "@/lib/types";
import { DietTypeSelector } from "@/components/DietTypeSelector";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { TagInput } from "@/components/ui/TagInput";
import { useAuth } from "@/context/AuthContext";

export default function PreferencesPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [dietaryType, setDietaryType] = useState<DietaryType>("omnivore");
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [dislikedFoods, setDislikedFoods] = useState<string[]>([]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Guest: nothing to fetch, just read whatever's already on this
      // device -- these are synchronous local reads, not a data-fetching
      // library's async lifecycle, so setting state directly here is fine.
      const guest = getGuestPreferences();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDietaryType(guest.dietary_type);
      setCalorieGoal(guest.calorie_goal);
      setAllergies(guest.allergies);
      setDislikedFoods(guest.disliked_foods);
      setLoading(false);
      return;
    }

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
  }, [authLoading, user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (!user) {
      // Guest: nothing to send anywhere, just remember it on this device.
      setGuestPreferences({
        dietary_type: dietaryType,
        calorie_goal: calorieGoal,
        allergies,
        disliked_foods: dislikedFoods,
      });
      setSaved(true);
      return;
    }

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

  if (authLoading || loading) {
    return <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">Loading...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Your preferences</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Used to recommend meals, build your weekly plan, and keep your grocery list relevant.
      </p>

      {!user && (
        <p className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          You&apos;re not signed in, so these are saved on this device only.{" "}
          <Link href="/register" className="font-semibold underline underline-offset-2">
            Create a free account
          </Link>{" "}
          to keep them synced and build a weekly plan.
        </p>
      )}

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
          {saved && (
            <p className="text-sm text-green-600">
              {user ? "Preferences saved." : "Saved on this device."}
            </p>
          )}

          <Button type="submit" disabled={saving} className="self-start">
            {saving ? "Saving..." : "Save preferences"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
