import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { hubs } from "@/lib/gate-data";

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
    <main className="grid min-h-screen bg-[#f4f0e8] text-zinc-950 dark:bg-[#090908] dark:text-[#f6f0e5] lg:grid-cols-2">
      {/* Brand story panel — desktop only */}
      <aside className="relative hidden overflow-hidden bg-[#0c0a08] px-12 py-12 text-[#f6f0e5] lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(195,142,71,.28),transparent_32%),radial-gradient(circle_at_85%_0%,rgba(50,92,88,.24),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(195,142,71,.14),transparent_40%)]" />
        <Link to="/" className="self-start">
          <Logo compact invert />
        </Link>

        <div className="max-w-md">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#d5a85c]">
            Learn. Discover. Grow.
          </p>
          <p className="mt-5 font-serif text-3xl font-semibold leading-snug tracking-[-0.02em] xl:text-4xl">
            Before the world fills your screen, fill your mind with something worth keeping.
          </p>
          <p className="mt-5 text-sm leading-7 text-white/60">
            One account unlocks the whole • Gate ecosystem — books, podcasts, infographics and
            research across four connected knowledge hubs.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {hubs.map((hub) => (
            <div
              key={hub.key}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
            >
              <p className="font-serif text-xl font-bold">{hub.key}</p>
              <p className="mt-1 text-xs leading-5 text-white/55">{hub.tagline}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Form panel */}
      <div className="relative flex min-h-screen flex-col justify-center px-5 py-12 sm:px-10 lg:px-16 xl:px-24">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(195,142,71,.25),transparent_28%),radial-gradient(circle_at_80%_5%,rgba(50,92,88,.18),transparent_30%)] lg:hidden" />
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="mb-10 flex justify-center lg:hidden">
            <Logo />
          </Link>
          <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{subtitle}</p>
          )}
          <div className="mt-7">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-zinc-500">{footer}</div>}
        </div>
      </div>
    </main>
  );
}
