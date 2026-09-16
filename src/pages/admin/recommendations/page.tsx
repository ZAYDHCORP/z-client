import { useEffect, useMemo, useState } from "react"
import { Sparkles, Star } from "lucide-react"
import { PageHeader } from "@/components/gate/ui"
import { useGate } from "@/lib/gate/store"
import { PLATFORM_MAP } from "@/lib/gate/platforms"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function RecommendationsPage() {
  const { data, toggleFeatured, ensureContentLoaded } = useGate()

  useEffect(() => {
    ensureContentLoaded()
  }, [ensureContentLoaded])

  const [type, setType] = useState("all")

  const featured = useMemo(
    () =>
      [
        ...data.books,
        ...data.research,
        ...data.infographics,
        ...data.podcasts,
      ].filter((c) => c.featured && (type === "all" || c.type === type)),
    [data, type],
  )

  const signals = [
    { name: "Searches", weight: "High" },
    { name: "Views", weight: "High" },
    { name: "Reading time", weight: "Medium" },
    { name: "Listening time", weight: "Medium" },
    { name: "Bookmarks", weight: "High" },
    { name: "Shares", weight: "Medium" },
    { name: "Completed content", weight: "High" },
    { name: "Categories explored", weight: "Medium" },
  ]

  return (
    <div>
      <PageHeader
        title="Recommendations & Discover"
        description="Personalised Gate Feed engine using behavioural signals. No likes, comments or followers."
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Star className="h-4 w-4 text-amber-400" /> Manually Featured Content
              </p>
              <div className="flex gap-1">
                {["all", "book", "research", "infographic", "podcast"].map((t) => (
                  <Button key={t} size="sm" variant={type === t ? "default" : "outline"} onClick={() => setType(t)}>
                    {t}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {featured.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-border p-2.5">
                  <div>
                    <p className="text-sm font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{PLATFORM_MAP[c.platform].name} · {c.type}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => { toggleFeatured(c.id); toast.success("Unfeatured") }}>
                    Unfeature
                  </Button>
                </div>
              ))}
              {featured.length === 0 && <p className="text-sm text-muted-foreground">No featured content in this filter.</p>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-violet-500" /> Behavioural Signals
            </div>
            <div className="space-y-2">
              {signals.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <span>{s.name}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{s.weight}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Related content, similar tags and trending items are computed server-side and respect platform boundaries and premium entitlement.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
