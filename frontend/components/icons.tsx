import type { ComponentType, SVGProps } from "react";

import type { DietaryType } from "@/lib/types";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function LeafIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 20c8 0 12.5-6.5 12.5-15.5C9.5 4.5 5 10 5 17.5c0 .9.1 1.7.3 2.5" />
      <path d="M6 20c1-4.5 4.5-9 12-13.5" />
    </svg>
  );
}

export function SproutIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20v-8.5" />
      <path d="M12 11.5c0-3-2.2-5-5.5-5 0 3 2.2 5 5.5 5Z" />
      <path d="M12 11.5c0-4 2.4-7 6-7 0 4-2.4 7-6 7Z" />
      <path d="M6 20h12" />
    </svg>
  );
}

export function FishIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 12c3-4 8-6.5 13-4.5 2 .8 4 2.4 5 4.5-1 2.1-3 3.7-5 4.5-5 2-10-.5-13-4.5Z" />
      <path d="M17 9v6" />
      <circle cx="7.5" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function DrumstickIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="6" cy="6" r="2.1" />
      <circle cx="4.3" cy="8.6" r="2.1" />
      <circle cx="18" cy="18" r="2.1" />
      <circle cx="19.7" cy="15.4" r="2.1" />
      <path d="M7.5 7.5l9 9" />
    </svg>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3c1.3 2.3-1 4-1 6.5a2.5 2.5 0 0 0 5 0c0-.9-.3-1.5-.7-1.9.7 2.4-.8 3.9-.8 5.9a3.5 3.5 0 1 1-7 0c0-3.5 2.6-5.9 4.5-10.5Z" />
    </svg>
  );
}

export function WheatOffIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21V6" />
      <path d="M12 10 8.5 7M12 10l3.5-3" />
      <path d="M12 15 8.5 12M12 15l3.5-3" />
      <path d="M5 5l14 14" />
    </svg>
  );
}

export function DumbbellIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 10v4M21 10v4" />
      <path d="M5.5 8.5v7M18.5 8.5v7" />
      <path d="M8 12h8" />
    </svg>
  );
}

export function UtensilsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 3v6a2 2 0 1 0 4 0V3" />
      <path d="M9 3v18" />
      <path d="M16.5 3c-1.4 1.8-1.4 4.9 0 6.7.7.5.7 1 .7 1.6V21" />
    </svg>
  );
}

export function TrendDownIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 7l7 7 4-4 7 7" />
      <path d="M21 11v6h-6" />
    </svg>
  );
}

export function SlidersIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 6h6M16 6h4" />
      <circle cx="12" cy="6" r="2" fill="currentColor" stroke="none" />
      <path d="M4 12h2M10 12h10" />
      <circle cx="7" cy="12" r="2" fill="currentColor" stroke="none" />
      <path d="M4 18h10M18 18h2" />
      <circle cx="15" cy="18" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  );
}

export function ShoppingBagIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.5 3 4 7v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7l-2.5-4Z" />
      <path d="M4 7h16" />
      <path d="M15.5 11a3.5 3.5 0 0 1-7 0" />
    </svg>
  );
}

export const DIET_ICONS: Record<DietaryType, ComponentType<IconProps>> = {
  omnivore: UtensilsIcon,
  vegetarian: LeafIcon,
  vegan: SproutIcon,
  pescatarian: FishIcon,
  keto: FlameIcon,
  paleo: DrumstickIcon,
  gluten_free: WheatOffIcon,
  high_protein: DumbbellIcon,
  low_carb: TrendDownIcon,
};

export const DIET_ICON_COLORS: Record<DietaryType, string> = {
  omnivore: "text-zinc-500 dark:text-zinc-400",
  vegetarian: "text-green-600 dark:text-green-400",
  vegan: "text-emerald-600 dark:text-emerald-400",
  pescatarian: "text-sky-600 dark:text-sky-400",
  keto: "text-orange-600 dark:text-orange-400",
  paleo: "text-amber-700 dark:text-amber-500",
  gluten_free: "text-yellow-700 dark:text-yellow-500",
  high_protein: "text-red-600 dark:text-red-400",
  low_carb: "text-purple-600 dark:text-purple-400",
};

export function DietIcon({ type, className = "h-4 w-4" }: { type: DietaryType; className?: string }) {
  const Icon = DIET_ICONS[type];
  return <Icon className={`${DIET_ICON_COLORS[type]} ${className}`} />;
}
