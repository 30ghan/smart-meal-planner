import { DIET_LABELS, isMeatMeal } from "@/lib/diet";
import { DIETARY_TYPES, type DietaryType, type Meal, type MealType } from "@/lib/types";
import { CalorieWheel } from "@/components/CalorieWheel";
import { DietIcon, DrumstickIcon } from "@/components/icons";
import { MacroBars } from "@/components/MacroBars";
import { Card } from "@/components/ui/Card";

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

const MEAL_TYPE_BADGE_CLASSES: Record<MealType, string> = {
  breakfast: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  lunch: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  dinner: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
};

const KNOWN_DIET_TAGS = new Set<string>(DIETARY_TYPES);

export function MealCard({ meal }: { meal: Meal }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <h2 className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-50">
          {isMeatMeal(meal) && (
            <DrumstickIcon
              className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-500"
              aria-label="Contains meat, poultry, or seafood"
            />
          )}
          {meal.name}
        </h2>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${MEAL_TYPE_BADGE_CLASSES[meal.meal_type]}`}
        >
          {MEAL_TYPE_LABELS[meal.meal_type]}
        </span>
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{meal.description}</p>

      <div className="mt-3 flex items-center gap-4">
        <CalorieWheel calories={meal.calories} size={48} />
        <div className="flex-1">
          <MacroBars proteinG={meal.protein_g} carbsG={meal.carbs_g} fatG={meal.fat_g} />
        </div>
      </div>

      {meal.dietary_tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {meal.dietary_tags
            .filter((tag): tag is DietaryType => KNOWN_DIET_TAGS.has(tag))
            .map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700 dark:bg-green-950 dark:text-green-400"
              >
                <DietIcon type={tag} className="h-3 w-3" />
                {DIET_LABELS[tag]}
              </span>
            ))}
        </div>
      )}

      {meal.allergens.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {meal.allergens.map((allergen) => (
            <span
              key={allergen}
              className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700 dark:bg-red-950 dark:text-red-400"
            >
              {allergen}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
