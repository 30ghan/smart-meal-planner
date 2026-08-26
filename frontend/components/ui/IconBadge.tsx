import type { ReactNode } from "react";

export function IconBadge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${className}`}>
      {children}
    </span>
  );
}
