import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-[calc(50%+8rem)] rounded-full bg-emerald-500/20 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute -top-16 left-1/2 h-80 w-80 translate-x-[calc(-50%+10rem)] rounded-full bg-sky-500/20 blur-3xl dark:bg-sky-500/10" />
      </div>

      <div className="flex max-w-md flex-col items-center text-center">
        <Eyebrow>Error 404</Eyebrow>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          This page is off the menu
        </h1>
        <p className="mt-5 text-lg text-zinc-600 dark:text-zinc-400">
          The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back to
          something tasty.
        </p>

        <div className="mt-8 flex gap-3">
          <Link href="/">
            <Button>Back home</Button>
          </Link>
          <Link href="/meals">
            <Button variant="secondary">Browse meals</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
