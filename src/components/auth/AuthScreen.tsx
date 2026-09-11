"use client";

import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";

export default function AuthScreen({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f4f0e8] text-zinc-950 dark:bg-[#090908] dark:text-[#f6f0e5]">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(195,142,71,.25),transparent_28%),radial-gradient(circle_at_80%_5%,rgba(50,92,88,.18),transparent_30%)]" />
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
        <div className="mb-8 self-center">
          <Logo />
        </div>
        <div className="rounded-[2rem] border border-black/10 bg-white/70 p-7 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
          <h1 className="font-serif text-3xl font-semibold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{subtitle}</p>
          )}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-sm text-zinc-500">{footer}</div>}
      </div>
    </main>
  );
}
