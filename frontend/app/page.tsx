"use client";

import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";

const FEATURES = [
  {
    title: "Tell us your preferences",
    description: "Dietary type, allergies, disliked foods, and a daily calorie goal.",
  },
  {
    title: "Get a full week planned",
    description: "Breakfast, lunch, and dinner for all 7 days, matched to your goals.",
  },
  {
    title: "Shop with one list",
    description: "Every ingredient from your week's meals, combined and ready to go.",
  },
];

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-20">
      <div className="flex max-w-2xl flex-col items-center text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          Meal planning that fits your diet
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Set your preferences once. Smart Meal Planner recommends meals that avoid your allergens,
          skip foods you dislike, and hit your calorie goals &mdash; then builds your grocery list for you.
        </p>

        {!loading && (
          <div className="mt-8 flex gap-3">
            {user ? (
              <Link href="/planner">
                <Button>Go to your planner</Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button>Get started</Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary">Log in</Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-16 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title}>
            <h2 className="font-medium text-zinc-900 dark:text-zinc-50">{feature.title}</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{feature.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
