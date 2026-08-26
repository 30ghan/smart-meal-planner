import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

import { Nav } from "@/components/Nav";
import { AuthProvider } from "@/context/AuthContext";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Meal Planner",
  description: "Plan your week, hit your goals, and generate your grocery list.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <AuthProvider>
          <Nav />
          <main className="flex flex-1 flex-col">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
