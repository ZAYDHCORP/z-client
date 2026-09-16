import { cn } from "@/lib/utils"
import type { ContentStatus, PlatformId, VerificationStatus } from "@/lib/gate/types"
import { PLATFORM_MAP } from "@/lib/gate/platforms"

const statusStyles: Record<string, string> = {
  published: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  draft: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
  scheduled: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  archived: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-300",
  unpublished: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  pending: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  failed: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  refunded: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  cancelled: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-300",
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  suspended: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  healthy: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  degraded: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  error: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  operational: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  down: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  running: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
}

export function StatusBadge({
  status,
  className,
  label,
}: {
  status: string
  className?: string
  label?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        statusStyles[status] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {label ?? status.replace(/_/g, " ")}
    </span>
  )
}

const verifyStyles: Record<VerificationStatus, string> = {
  unverified: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-300",
  under_review: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  verified: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  requires_correction: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
}

export function VerifyBadge({ status }: { status: VerificationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        verifyStyles[status],
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  )
}

export const contentStatusOptions: { value: ContentStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "unpublished", label: "Unpublished" },
  { value: "archived", label: "Archived" },
]

import type { ReactNode } from "react"

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  accent,
  hint,
}: {
  label: string
  value: ReactNode
  delta?: string
  icon?: ReactNode
  accent?: string
  hint?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon && (
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: accent ?? "var(--accent)", color: accent ? "#fff" : undefined }}
          >
            {Icon}
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {delta && (
        <p className="mt-1 text-xs text-muted-foreground">
          <span className="text-emerald-600 dark:text-emerald-400">{delta}</span>{" "}
          {hint ?? "vs last period"}
        </p>
      )}
    </div>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h2>
  )
}

export function PlatformPill({ p }: { p: PlatformId | "ALL" }) {
  const m = p === "ALL" ? null : PLATFORM_MAP[p]
  if (!m)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/15 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
        All
      </span>
    )
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ background: m.softColor, color: m.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
      {m.name}
    </span>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
      <p className="text-base font-medium">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
