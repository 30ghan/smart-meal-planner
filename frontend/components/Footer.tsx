import Link from "next/link";

import { Logo } from "@/components/Logo";

// Only pages that actually exist -- no Privacy/Terms placeholders that
// would 404. Mirrors the guest-accessible routes in Nav.tsx.
const FOOTER_LINKS = [
  { href: "/meals", label: "Meals" },
  { href: "/planner", label: "Planner" },
  { href: "/preferences", label: "Preferences" },
  { href: "/login", label: "Log in" },
  { href: "/register", label: "Sign up" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800/80 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="w-fit">
          <Logo textClassName="text-base" />
        </Link>

        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-800/80">
        <p className="mx-auto max-w-5xl px-6 py-4 text-xs text-zinc-400 dark:text-zinc-500">
          &copy; {year} Help Me Meal. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
