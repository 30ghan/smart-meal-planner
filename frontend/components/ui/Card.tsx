import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900 ${className}`}
      {...props}
    />
  );
}
