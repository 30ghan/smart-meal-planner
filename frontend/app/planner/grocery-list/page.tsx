"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api";
import type { GroceryList } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function mondayOf(date: Date): Date {
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatDate(date: Date): string {
  // Local date parts, not toISOString() -- that converts to UTC first and
  // rolls midnight-local back a day for positive UTC offsets (e.g. BST).
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function GroceryListPage() {
  const [list, setList] = useState<GroceryList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const weekStart = formatDate(mondayOf(new Date()));
    api
      .get<GroceryList>(`/planner/grocery-list?week_start=${weekStart}`)
      .then(setList)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load grocery list."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Grocery list</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Every ingredient needed for this week&apos;s planned meals.
          </p>
        </div>
        <Link href="/planner">
          <Button variant="secondary">Back to planner</Button>
        </Link>
      </div>

      <Card className="mt-6">
        {loading ? (
          <p className="text-sm text-zinc-500">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : !list || list.items.length === 0 ? (
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No meals planned for this week yet, so there&apos;s nothing to shop for.
            </p>
            <Link href="/planner" className="mt-3 inline-block">
              <Button variant="secondary">Plan your week</Button>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {list.items.map((item) => (
              <li key={`${item.ingredient}-${item.unit}`} className="flex items-center justify-between py-2.5">
                <span className="text-sm capitalize text-zinc-900 dark:text-zinc-50">{item.ingredient}</span>
                <span className="text-sm text-zinc-500">
                  {item.quantity} {item.unit}
                  {item.quantity !== 1 ? "s" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
