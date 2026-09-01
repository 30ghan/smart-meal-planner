"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface GuestSignUpPromptProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export function GuestSignUpPrompt({
  open,
  onClose,
  title = "Like what you see?",
  message,
}: GuestSignUpPromptProps) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 px-6 backdrop-blur-sm"
    >
      <Card
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-prompt-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm"
      >
        <h2 id="guest-prompt-title" className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
        <div className="mt-5 flex gap-2">
          <Link href="/register" className="flex-1">
            <Button className="w-full">Create free account</Button>
          </Link>
          <Button variant="secondary" onClick={onClose}>
            Maybe later
          </Button>
        </div>
      </Card>
    </div>
  );
}
