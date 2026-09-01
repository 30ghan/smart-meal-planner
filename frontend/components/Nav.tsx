"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/planner", label: "Planner" },
  { href: "/meals", label: "Meals" },
  { href: "/preferences", label: "Preferences" },
];

// No Dashboard -- it's meaningless without a saved account. Meals,
// Preferences, and Planner are all guest-accessible, just in a limited
// preview mode on the Planner side (see app/planner/page.tsx).
const GUEST_LINKS = [
  { href: "/planner", label: "Planner" },
  { href: "/meals", label: "Meals" },
  { href: "/preferences", label: "Preferences" },
];

export function Nav() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/">
          <Logo />
        </Link>

        {!loading && user && (
          <nav className="flex items-center gap-6">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium ${
                  pathname.startsWith(link.href)
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <span className="hidden text-sm text-zinc-400 sm:inline">{user.full_name}</span>
            <Button variant="secondary" onClick={handleLogout}>
              Log out
            </Button>
          </nav>
        )}

        {!loading && !user && (
          <nav className="flex items-center gap-6">
            {GUEST_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium ${
                  pathname.startsWith(link.href)
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Log in
            </Link>
            <Link href="/register">
              <Button>Sign up</Button>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
