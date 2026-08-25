import { SproutIcon } from "@/components/icons";

interface LogoProps {
  className?: string;
  badgeClassName?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
}

export function Logo({
  className = "",
  badgeClassName = "h-8 w-8",
  iconClassName = "h-4 w-4",
  textClassName = "text-lg",
  showText = true,
}: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`flex shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white ${badgeClassName}`}
      >
        <SproutIcon className={iconClassName} strokeWidth={2} />
      </span>
      {showText && (
        <span className={`font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 ${textClassName}`}>
          Smart Meal Planner
        </span>
      )}
    </span>
  );
}
