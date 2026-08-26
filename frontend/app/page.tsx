"use client";

import Link from "next/link";

import { CalendarIcon, ShoppingBagIcon, SlidersIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { IconBadge } from "@/components/ui/IconBadge";
import { useAuth } from "@/context/AuthContext";

const FEATURES = [
  {
    icon: SlidersIcon,
    iconClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    title: "Tell us your preferences",
    description: "Dietary type, allergies, disliked foods, and a daily calorie goal.",
  },
  {
    icon: CalendarIcon,
    iconClassName: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    title: "Get a full week planned",
    description: "Breakfast, lunch, and dinner for all 7 days, matched to your goals.",
  },
  {
    icon: ShoppingBagIcon,
    iconClassName: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    title: "Shop with one list",
    description: "Every ingredient from your week's meals, combined and ready to go.",
  },
];

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="relative flex flex-1 flex-col items-center overflow-hidden px-6 py-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-[calc(50%+8rem)] rounded-full bg-emerald-500/20 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute -top-16 left-1/2 h-80 w-80 translate-x-[calc(-50%+10rem)] rounded-full bg-sky-500/20 blur-3xl dark:bg-sky-500/10" />
      </div>

      <div className="flex max-w-2xl flex-col items-center text-center">
        <Eyebrow>Personalized meal planning</Eyebrow>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl dark:text-zinc-50">
          Never wonder what to eat again
        </h1>
        <p className="mt-5 text-lg text-zinc-600 dark:text-zinc-400">
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

      <div className="mt-20 flex w-full max-w-4xl flex-col items-center">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          From preferences to plate in 3 steps
        </h2>
      </div>

      <div className="mt-10 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title}>
            <IconBadge className={feature.iconClassName}>
              <feature.icon className="h-5 w-5" />
            </IconBadge>
            <h3 className="mt-4 font-bold text-zinc-900 dark:text-zinc-50">{feature.title}</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{feature.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
