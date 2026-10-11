import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  Archive,
  BookHeart,
  BookText,
  Heart,
  Layers,
  Repeat,
  Star,
  Wand2,
} from "lucide-react"
import { PageHeader, StatCard, SectionTitle } from "@/components/gate/ui"
import { useTheo, useTheoContent } from "@/lib/gate/theocentric/store"
import { adminApi } from "@/lib/gate/adminApi"
import type { ContentKind } from "@/lib/gate/theocentric/types"

const KIND_META: { kind: ContentKind; label: string; icon: React.ReactNode; href: string }[] = [
  { kind: "dua", label: "Duas", icon: <Heart className="h-4 w-4" />, href: "/admin/theocentric/duas" },
  { kind: "adkar", label: "Adhkars", icon: <Repeat className="h-4 w-4" />, href: "/admin/theocentric/adhkars" },
  { kind: "quranic", label: "Quranic Reminders", icon: <BookText className="h-4 w-4" />, href: "/admin/theocentric/quranic-supplications" },
  { kind: "rabbana", label: "40 Rabbana", icon: <BookHeart className="h-4 w-4" />, href: "/admin/theocentric/40-rabbana" },
  { kind: "ruqiyah", label: "Ruqiyah", icon: <Wand2 className="h-4 w-4" />, href: "/admin/theocentric/ruqiyah" },
]

interface Counts {
  kinds: Partial<Record<ContentKind, number>>
  published?: number
  drafts?: number
  archived?: number
  collections?: number
  categories?: number
  references?: number
}

export default function TheoDashboard() {
  const { data } = useTheo()
  // The newest items for the "recent" list; the headline numbers below are
  // server-side counts (limit=1 requests) so they stay correct past one page.
  useTheoContent({})
  const [counts, setCounts] = useState<Counts>({ kinds: {} })

  useEffect(() => {
    let cancelled = false
    const t = adminApi.theocentric
    const set = (patch: Partial<Counts>) => !cancelled && setCounts((c) => ({ ...c, ...patch }))
    KIND_META.forEach((m) =>
      t.content.count({ kind: m.kind }).then((n) => !cancelled && setCounts((c) => ({ ...c, kinds: { ...c.kinds, [m.kind]: n } }))).catch(() => {}),
    )
    t.content.count({ status: "published" }).then((n) => set({ published: n })).catch(() => {})
    t.content.count({ status: "draft" }).then((n) => set({ drafts: n })).catch(() => {})
    t.content.count({ status: "archived" }).then((n) => set({ archived: n })).catch(() => {})
    t.collections.count().then((n) => set({ collections: n })).catch(() => {})
    t.categories.count().then((n) => set({ categories: n })).catch(() => {})
    t.references.count().then((n) => set({ references: n })).catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const show = (n?: number) => (n === undefined ? "—" : n)
  const total = KIND_META.every((m) => counts.kinds[m.kind] !== undefined)
    ? KIND_META.reduce((sum, m) => sum + (counts.kinds[m.kind] ?? 0), 0)
    : undefined
  const recent = [...data.content]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6)

  return (
    <div>
      <PageHeader
        title="Theocentric & Doxology"
        description="Duas, adhkars, Quranic reminders, 40 Rabbana and Ruqiyah."
        actions={
          <Link to="/admin/theocentric/duas">
            <span className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
              + New Dua
            </span>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Content" value={show(total)} icon={<Layers className="h-4 w-4" />} accent="#7c3aed" />
        <StatCard label="Published" value={show(counts.published)} icon={<BookText className="h-4 w-4" />} accent="#059669" />
        <StatCard label="Drafts" value={show(counts.drafts)} icon={<Star className="h-4 w-4" />} accent="#2563eb" />
        <StatCard label="Archived" value={show(counts.archived)} icon={<Archive className="h-4 w-4" />} accent="#d97706" delta={undefined} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionTitle>Content by Kind</SectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {KIND_META.map((m) => (
              <Link
                key={m.kind}
                to={m.href}
                className="gate-surface gate-surface-hover p-4 "
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {m.icon}
                  </span>
                  <span className="text-2xl font-semibold">{show(counts.kinds[m.kind])}</span>
                </div>
                <p className="mt-2 text-sm font-medium">{m.label}</p>
              </Link>
            ))}
          </div>

          <div className="mt-6">
            <SectionTitle>Recent Activity</SectionTitle>
            <div className="gate-surface">
              {recent.map((c) => (
                <Link
                  key={c.id}
                  to={`/admin/theocentric/${c.kind === "quranic" ? "quranic-supplications" : c.kind === "rabbana" ? "40-rabbana" : c.kind === "ruqiyah" ? "ruqiyah" : c.kind}`}
                  className="flex items-center justify-between border-b border-border px-4 py-3 last:border-0 hover:bg-accent/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.title || "Untitled"}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.kind} · {new Date(c.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{c.status}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div>
          <SectionTitle>Structure</SectionTitle>
          <div className="space-y-3">
            <Link to="/admin/theocentric/collections" className="flex items-center justify-between gate-surface gate-surface-hover p-4 ">
              <span className="text-sm font-medium">Collections / Routines</span>
              <span className="text-lg font-semibold">{show(counts.collections)}</span>
            </Link>
            <Link to="/admin/theocentric/categories" className="flex items-center justify-between gate-surface gate-surface-hover p-4 ">
              <span className="text-sm font-medium">Categories</span>
              <span className="text-lg font-semibold">{show(counts.categories)}</span>
            </Link>
            <Link to="/admin/theocentric/references" className="flex items-center justify-between gate-surface gate-surface-hover p-4 ">
              <span className="text-sm font-medium">References</span>
              <span className="text-lg font-semibold">{show(counts.references)}</span>
            </Link>
            <Link to="/admin/theocentric/featured" className="flex items-center justify-between gate-surface gate-surface-hover p-4 ">
              <span className="text-sm font-medium">Featured</span>
              <span className="text-xs text-muted-foreground">View</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
