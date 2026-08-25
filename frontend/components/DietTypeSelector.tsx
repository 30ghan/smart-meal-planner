import { DIET_ICONS, DIET_ICON_COLORS } from "@/components/icons";
import { DIET_LABELS } from "@/lib/diet";
import { DIETARY_TYPES, type DietaryType } from "@/lib/types";

interface DietTypeSelectorProps {
  value: DietaryType;
  onChange: (value: DietaryType) => void;
}

export function DietTypeSelector({ value, onChange }: DietTypeSelectorProps) {
  return (
    <div role="radiogroup" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {DIETARY_TYPES.map((type) => {
        const Icon = DIET_ICONS[type];
        const selected = value === type;
        return (
          <button
            key={type}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(type)}
            className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-center transition-colors ${
              selected
                ? "border-zinc-900 bg-zinc-50 dark:border-zinc-50 dark:bg-zinc-800"
                : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
            }`}
          >
            <Icon className={`h-5 w-5 ${DIET_ICON_COLORS[type]}`} />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{DIET_LABELS[type]}</span>
          </button>
        );
      })}
    </div>
  );
}
