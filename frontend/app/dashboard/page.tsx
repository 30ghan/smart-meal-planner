"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { DIET_LABELS, isMeatMeal } from "@/lib/diet";
import type { DayOfWeek, MealType, Preference, PlannerEntry } from "@/lib/types";
import { MEAL_TYPES } from "@/lib/types";
import { CalendarIcon, DietIcon, DrumstickIcon, ShoppingBagIcon, SlidersIcon, UtensilsIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { IconBadge } from "@/components/ui/IconBadge";
import { useAuth } from "@/context/AuthContext";

const QUICK_LINKS = [
  {
    href: "/planner",
    icon: CalendarIcon,
    iconClassName: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    title: "Weekly planner",
    description: "View or generate your 7-day plan.",
  },
  {
    href: "/planner/grocery-list",
    icon: ShoppingBagIcon,
    iconClassName: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    title: "Grocery list",
    description: "See what to buy for this week.",
  },
  {
    href: "/meals",
    icon: UtensilsIcon,
    iconClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    title: "Browse meals",
    description: "Explore the full meal catalog.",
  },
];

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
      .catch(() => {
        // A 401 here triggers a redirect to /login inside the api client;
        // any other failure just leaves the dashboard cards in their
        // loading-finished, empty state rather than crashing the page.
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <Eyebrow>Dashboard</Eyebrow>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
        Welcome back{user ? `, ${user.full_name}` : ""}
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-50">
            <CalendarIcon className="h-4 w-4 text-zinc-400" />
            Today&apos;s meals
          </h2>
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
                    <span className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-50">
                      {entry && isMeatMeal(entry.meal) && (
                        <DrumstickIcon className="h-3.5 w-3.5 text-amber-700 dark:text-amber-500" />
                      )}
                      {entry ? entry.meal.name : "Not planned"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-50">
            <SlidersIcon className="h-4 w-4 text-zinc-400" />
            Your preferences
          </h2>
          {loading ? (
            <p className="mt-2 text-sm text-zinc-500">Loading...</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              <li className="flex justify-between">
                <span className="text-zinc-500">Diet</span>
                {preference && (
                  <span className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-50">
                    <DietIcon type={preference.dietary_type} className="h-3.5 w-3.5" />
                    {DIET_LABELS[preference.dietary_type]}
                  </span>
                )}
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
        {QUICK_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full transition-colors hover:border-zinc-400 dark:hover:border-zinc-600">
              <IconBadge className={link.iconClassName}>
                <link.icon className="h-5 w-5" />
              </IconBadge>
              <h3 className="mt-4 font-bold text-zinc-900 dark:text-zinc-50">{link.title}</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{link.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
