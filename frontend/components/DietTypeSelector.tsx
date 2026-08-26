import { DIET_ICONS, DIET_ICON_COLORS } from "@/components/icons";
import { DIET_LABELS } from "@/lib/diet";
import { DIETARY_TYPES, type DietaryType } from "@/lib/types";

interface DietTypeSelectorProps {
  value: DietaryType;
  onChange: (value: DietaryType) => void;
}

export function DietTypeSelector({ value, onChange }: DietTypeSelectorProps) {
  return (
    <div role="radiogroup" className="grid grid-cols-3 gap-2">
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
            className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 px-3 py-3 text-center transition-colors ${
              selected
                ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10"
                : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
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
