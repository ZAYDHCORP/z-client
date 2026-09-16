import { useEffect, useMemo, useState } from "react"
import { Search, TrendingUp, Filter } from "lucide-react"
import { PageHeader } from "@/components/gate/ui"
import { useGate } from "@/lib/gate/store"
import { PLATFORM_MAP } from "@/lib/gate/platforms"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function SearchAdminPage() {
  const { data, ensureContentLoaded } = useGate()

  useEffect(() => {
    ensureContentLoaded()
  }, [ensureContentLoaded])

  const [q, setQ] = useState("")

  const all = [
    ...data.books,
    ...data.research,
    ...data.infographics,
    ...data.podcasts,
  ]

  const results = useMemo(() => {
    if (!q) return []
    const n = q.toLowerCase()
    return all
      .filter(
        (c) =>
          c.title.toLowerCase().includes(n) ||
          c.description.toLowerCase().includes(n) ||
          c.tags.join(" ").toLowerCase().includes(n) ||
          c.category.toLowerCase().includes(n),
      )
      .slice(0, 20)
  }, [q, all])

  const terms = [
    { term: "ethical finance", count: 412, trend: "+12%" },
    { term: "tafsir", count: 388, trend: "+8%" },
    { term: "productivity", count: 301, trend: "+5%" },
    { term: "climate policy", count: 244, trend: "+18%" },
    { term: "hadith", count: 219, trend: "+3%" },
    { term: "infographics", count: 198, trend: "+22%" },
  ]

  return (
    <div>
      <PageHeader
        title="Search & Discovery"
        description="Global search administration across titles, metadata, categories, tags and platforms."
      />
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search the entire Gate index…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>

      {q && (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-muted-foreground">{results.length} results</p>
          {results.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
              <div>
                <p className="font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground">{PLATFORM_MAP[r.platform].name} · {r.category} · {r.type}</p>
              </div>
              <div className="flex gap-1">
                {r.tags.slice(0, 3).map((t) => <Badge key={t} variant="secondary">#{t}</Badge>)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4 text-emerald-500" /> Trending Searches
            </div>
            <div className="space-y-2">
              {terms.map((t) => (
                <div key={t.term} className="flex items-center justify-between text-sm">
                  <span>{t.term}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{t.trend} · {t.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Filter className="h-4 w-4 text-sky-500" /> Filters Available
            </div>
            <div className="flex flex-wrap gap-2">
              {["Platform", "Category", "Content Type", "Tags", "Date", "Popularity"].map((f) => (
                <Badge key={f} variant="outline">{f}</Badge>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              The search index updates automatically whenever content is created, published, unpublished or archived.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
