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
import { useTheo } from "@/lib/gate/theocentric/store"
import type { ContentKind } from "@/lib/gate/theocentric/types"

const KIND_META: { kind: ContentKind; label: string; icon: React.ReactNode; href: string }[] = [
  { kind: "dua", label: "Duas", icon: <Heart className="h-4 w-4" />, href: "/admin/theocentric/duas" },
  { kind: "adkar", label: "Adhkars", icon: <Repeat className="h-4 w-4" />, href: "/admin/theocentric/adhkars" },
  { kind: "quranic", label: "Quranic Reminders", icon: <BookText className="h-4 w-4" />, href: "/admin/theocentric/quranic-supplications" },
  { kind: "rabbana", label: "40 Rabbana", icon: <BookHeart className="h-4 w-4" />, href: "/admin/theocentric/40-rabbana" },
  { kind: "ruqiyah", label: "Ruqiyah", icon: <Wand2 className="h-4 w-4" />, href: "/admin/theocentric/ruqiyah" },
]

export default function TheoDashboard() {
  const { data } = useTheo()
  const counts = KIND_META.map((m) => ({
    ...m,
    count: data.content.filter((c) => c.kind === m.kind).length,
  }))
  const verified = data.content.filter((c) => c.verification === "verified").length
  const published = data.content.filter((c) => c.status === "published").length
  const featured = data.content.filter((c) => c.featured).length
  const needsVerification = data.content.filter((c) => c.verification !== "verified").length
  const recent = [...data.content]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6)

  return (
    <div>
      <PageHeader
        title="Theocentric & Doxology"
        description="Administer Dua, Adhkars, Quranic Reminders, 40 Rabbana, Ruqiyah and their structure."
        actions={
          <Link to="/admin/theocentric/duas">
            <span className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground">
              + New Dua
            </span>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Content" value={data.content.length} icon={<Layers className="h-4 w-4" />} accent="#7c3aed" />
        <StatCard label="Published" value={published} icon={<BookText className="h-4 w-4" />} accent="#059669" />
        <StatCard label="Verified" value={verified} icon={<Star className="h-4 w-4" />} accent="#2563eb" />
        <StatCard label="Needs Verification" value={needsVerification} icon={<Archive className="h-4 w-4" />} accent="#d97706" delta={undefined} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionTitle>Content by Kind</SectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {counts.map((m) => (
              <Link
                key={m.kind}
                to={m.href}
                className="rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {m.icon}
                  </span>
                  <span className="text-2xl font-semibold">{m.count}</span>
                </div>
                <p className="mt-2 text-sm font-medium">{m.label}</p>
              </Link>
            ))}
          </div>

          <div className="mt-6">
            <SectionTitle>Recent Activity</SectionTitle>
            <div className="rounded-xl border border-border bg-card">
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
            <Link to="/admin/theocentric/collections" className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:shadow-sm">
              <span className="text-sm font-medium">Collections / Routines</span>
              <span className="text-lg font-semibold">{data.collections.length}</span>
            </Link>
            <Link to="/admin/theocentric/categories" className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:shadow-sm">
              <span className="text-sm font-medium">Categories</span>
              <span className="text-lg font-semibold">{data.categories.length}</span>
            </Link>
            <Link to="/admin/theocentric/references" className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:shadow-sm">
              <span className="text-sm font-medium">References</span>
              <span className="text-lg font-semibold">{data.references.length}</span>
            </Link>
            <Link to="/admin/theocentric/featured" className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:shadow-sm">
              <span className="text-sm font-medium">Featured</span>
              <span className="text-lg font-semibold">{featured}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
