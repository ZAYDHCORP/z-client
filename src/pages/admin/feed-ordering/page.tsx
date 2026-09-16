import { useEffect, useMemo, useState } from "react"
import { ArrowDown, ArrowUp, Pin, Star } from "lucide-react"
import { PageHeader } from "@/components/gate/ui"
import { useGate } from "@/lib/gate/store"
import { PLATFORMS, PLATFORM_MAP } from "@/lib/gate/platforms"
import type { AnyContent, ContentType } from "@/lib/gate/types"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export default function FeedOrderingPage() {
  const { data, reorderContent, toggleFeatured, togglePin, ensureContentLoaded } = useGate()

  useEffect(() => {
    ensureContentLoaded()
  }, [ensureContentLoaded])

  const [platform, setPlatform] = useState<string>("all")
  const [type, setType] = useState<ContentType>("book")

  const all = [
    ...data.books,
    ...data.research,
    ...data.infographics,
    ...data.podcasts,
  ].filter((c) => c.type === type) as AnyContent[]

  const list = useMemo(
    () =>
      all
        .filter((c) => (platform === "all" ? true : c.platform === platform))
        .slice()
        .sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
          return a.displayOrder - b.displayOrder
        }),
    [all, platform],
  )

  function move(index: number, dir: -1 | 1) {
    const next = list.slice()
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    const ids = next.map((c) => c.id)
    reorderContent(ids, type)
  }

  return (
    <div>
      <PageHeader
        title="Feed Ordering"
        description="Manually reorder, pin and feature content per platform. Numbering follows publishing order but can be overridden."
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            {PLATFORMS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={(v) => setType(v as ContentType)}>
          <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="book">Books</SelectItem>
            <SelectItem value="research">Research Reports</SelectItem>
            <SelectItem value="infographic">Infographics</SelectItem>
            <SelectItem value="podcast">Podcasts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {list.map((item, i) => (
          <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-sm font-semibold tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {PLATFORM_MAP[item.platform].name} · {item.category}
                {item.pinned && " · pinned"} {item.featured && " · featured"}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePin(item.id)}>
              <Pin className={`h-4 w-4 ${item.pinned ? "fill-current text-primary" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleFeatured(item.id)}>
              <Star className={`h-4 w-4 ${item.featured ? "fill-current text-amber-400" : ""}`} />
            </Button>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(i, -1)} disabled={i === 0}>
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(i, 1)} disabled={i === list.length - 1}>
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
