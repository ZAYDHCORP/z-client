import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useTheo } from "@/lib/gate/theocentric/store"

export interface PickedItem {
  contentId: string
  order?: number
  required: boolean
}

/**
 * Search box state for a content picker. Typing re-queries the server (debounced)
 * so items beyond the first page are still reachable; clearing it restores the
 * full first page.
 */
export function useContentSearch() {
  const { queryContent } = useTheo()
  const [q, setQ] = useState("")
  useEffect(() => {
    const t = setTimeout(() => queryContent(q.trim() ? { q: q.trim() } : {}), q ? 350 : 0)
    return () => clearTimeout(t)
  }, [q, queryContent])
  return { q, setQ }
}

export function ContentSearchInput({ q, setQ }: { q: string; setQ: (v: string) => void }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input placeholder="Search content to add…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
    </div>
  )
}

/** Checklist of content with per-item order / required controls. Selected items stay on top. */
export function ContentPicker({
  items,
  onToggle,
  onChange,
  showOrder = false,
  className = "max-h-56",
}: {
  items: PickedItem[]
  onToggle: (contentId: string) => void
  onChange: (contentId: string, patch: Partial<PickedItem>) => void
  showOrder?: boolean
  className?: string
}) {
  const { data, hasMore, loadMore, isLoading } = useTheo()
  const byId = new Map(data.content.map((c) => [c.id, c]))
  const selectedIds = new Set(items.map((i) => i.contentId))
  const rows = [
    ...items.map((i) => ({ id: i.contentId, title: byId.get(i.contentId)?.title ?? "(item not in the loaded results)" })),
    ...data.content.filter((c) => !selectedIds.has(c.id)).map((c) => ({ id: c.id, title: c.title || "Untitled" })),
  ]

  return (
    <div className={`${className} space-y-1 overflow-y-auto rounded-lg border border-border p-2`}>
      {rows.map((r) => {
        const item = items.find((i) => i.contentId === r.id)
        return (
          <label key={r.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent/40">
            <input type="checkbox" checked={!!item} onChange={() => onToggle(r.id)} />
            <span className="flex-1 truncate">{r.title}</span>
            {item && (
              <span className="flex items-center gap-2">
                {showOrder && (
                  <input
                    type="number"
                    value={item.order ?? 0}
                    onChange={(e) => onChange(r.id, { order: Number(e.target.value) })}
                    className="w-14 rounded border border-border bg-background px-1.5 py-0.5 text-xs"
                  />
                )}
                <span className="flex items-center gap-1 text-xs">
                  <Switch checked={item.required} onCheckedChange={(v) => onChange(r.id, { required: v })} />
                  Req
                </span>
              </span>
            )}
          </label>
        )
      })}
      {rows.length === 0 && (
        <p className="px-2 py-3 text-center text-xs text-muted-foreground">
          {isLoading("content") ? "Loading content…" : "No content found."}
        </p>
      )}
      {hasMore("content") && (
        <div className="flex justify-center pt-1">
          <Button type="button" variant="ghost" size="sm" disabled={isLoading("content")} onClick={() => loadMore("content")}>
            {isLoading("content") ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </div>
  )
}
