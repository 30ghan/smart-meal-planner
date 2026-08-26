interface MacroBarsProps {
  proteinG: number;
  carbsG: number;
  fatG: number;
}

const MACROS = [
  { key: "protein", label: "Protein", caloriesPerGram: 4, colorClass: "bg-emerald-500" },
  { key: "carbs", label: "Carbs", caloriesPerGram: 4, colorClass: "bg-sky-500" },
  { key: "fat", label: "Fat", caloriesPerGram: 9, colorClass: "bg-amber-500" },
] as const;

export function MacroBars({ proteinG, carbsG, fatG }: MacroBarsProps) {
  const grams = { protein: proteinG, carbs: carbsG, fat: fatG };
  const totalCalories = MACROS.reduce((sum, m) => sum + grams[m.key] * m.caloriesPerGram, 0) || 1;

  return (
    <div className="flex flex-col gap-1.5">
      {MACROS.map((macro) => {
        const percent = Math.round(((grams[macro.key] * macro.caloriesPerGram) / totalCalories) * 100);
        return (
          <div key={macro.key}>
            <div className="flex items-baseline justify-between text-[11px]">
              <span className="font-medium text-zinc-500 dark:text-zinc-400">{macro.label}</span>
              <span className="text-zinc-400 dark:text-zinc-500">
                {grams[macro.key]}g <span className="text-zinc-300 dark:text-zinc-600">({percent}%)</span>
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div className={`h-full rounded-full ${macro.colorClass}`} style={{ width: `${percent}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
