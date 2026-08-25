interface CalorieWheelProps {
  calories: number;
  /** Calorie value that fills the ring completely; meals above this still cap at 100%. */
  max?: number;
  size?: number;
}

export function CalorieWheel({ calories, max = 800, size = 56 }: CalorieWheelProps) {
  const strokeWidth = size * 0.12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, calories / max));
  const center = size / 2;
  const compact = size < 45;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className="stroke-zinc-100 dark:stroke-zinc-800"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="round"
          fill="none"
          className="stroke-emerald-500 transition-[stroke-dashoffset]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-semibold leading-none text-zinc-900 dark:text-zinc-50 ${compact ? "text-[9px]" : "text-[11px]"}`}
        >
          {calories}
        </span>
        {!compact && <span className="text-[8px] leading-none text-zinc-400">kcal</span>}
      </div>
    </div>
  );
}
