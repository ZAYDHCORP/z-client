import { Inbox } from "lucide-react"
import { cn } from "@/lib/utils"
import { sentenceCase } from "@/lib/text"
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
  status?: string | null
  className?: string
  label?: string
}) {
  const key = status ?? "unknown"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-current/15",
        statusStyles[key] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {label ?? sentenceCase(key)}
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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-current/15",
        verifyStyles[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {sentenceCase(status)}
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
    <div className="mb-6 flex flex-col gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <span className="mb-2.5 block h-[3px] w-8 rounded-full bg-gold" />
        <h1 className="font-serif text-[1.75rem] leading-[1.1] font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
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
  // Accents are hex colours — tint them for the icon chip so it reads as a
  // soft badge instead of a solid block.
  const tint = accent && accent.startsWith("#") && accent.length === 7
  return (
    <div className="gate-surface gate-surface-hover p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
        {Icon && (
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-black/5 dark:ring-white/10 [&_svg]:h-3.5 [&_svg]:w-3.5"
            style={{
              background: tint ? `${accent}24` : "var(--gold-soft)",
              color: tint ? accent : "var(--gold)",
            }}
          >
            {Icon}
          </span>
        )}
      </div>
      <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="text-2xl leading-none font-semibold tracking-tight tabular-nums">{value}</p>
        {delta && (
          <span
            title={hint ?? "vs last period"}
            className="rounded-full bg-emerald-500/12 px-1.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400"
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
      <span className="h-1 w-1 rounded-full bg-gold" />
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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-soft text-gold">
        <Inbox className="h-5 w-5" />
      </span>
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
