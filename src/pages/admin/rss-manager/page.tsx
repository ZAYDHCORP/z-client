import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Pencil, Plus, RefreshCw, Rss, Trash2 } from "lucide-react"
import { PageHeader, StatusBadge } from "@/components/gate/ui"
import { useGate } from "@/lib/gate/store"
import { PLATFORMS, PLATFORM_MAP } from "@/lib/gate/platforms"
import type { PlatformId, PodcastEpisode, RssFeed } from "@/lib/gate/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"

export default function RssManagerPage() {
  const { data, syncRssFeed, addRssFeed, updateRssFeed, removeRssFeed, ensureContentTypeLoaded, ensureCategoriesLoaded, ensureRssLoaded, loadMore, hasMore, isResourceLoading } = useGate()

  useEffect(() => {
    ensureContentTypeLoaded("podcast")
    ensureCategoriesLoaded()
    ensureRssLoaded()
  }, [ensureContentTypeLoaded, ensureCategoriesLoaded, ensureRssLoaded])

  const [platform, setPlatform] = useState("all")
  const [editing, setEditing] = useState<PodcastEpisode | null>(null)
  const [open, setOpen] = useState(false)
  const [feedOpen, setFeedOpen] = useState(false)
  const [syncing, setSyncing] = useState<string | null>(null)

  const runSync = (id: string) => {
    setSyncing(id)
    syncRssFeed(id)
    // The store reports the result (or error) itself; just release the button.
    setTimeout(() => setSyncing((cur) => (cur === id ? null : cur)), 1500)
  }

  const episodes = useMemo(
    () =>
      data.podcasts
        .filter((c) => c.type === "podcast")
        .filter((c) => (platform === "all" ? true : c.platform === platform))
        .slice()
        .sort((a, b) => b.displayOrder - a.displayOrder),
    [data.podcasts, platform],
  )

  return (
    <div>
      <PageHeader
        title="RSS Manager"
        description="Fetch podcast episodes from RSS feeds and manage them."
        actions={
          <Button onClick={() => setFeedOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Feed
          </Button>
        }
      />

      {/* Feed cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.rss.map((f) => {
          const m = PLATFORM_MAP[f.platform]
          return (
            <Card key={f.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium" style={{ color: m.color }}>
                    <Rss className="h-4 w-4" /> {m.name}
                  </span>
                  <StatusBadge status={f.status} />
                </div>
                <p className="truncate text-xs text-muted-foreground">{f.url}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{f.totalEpisodes} episodes</span>
                  <span className="text-muted-foreground">{f.newLastSync} new</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Last sync: {f.lastSync ? new Date(f.lastSync).toLocaleString() : "—"}
                </p>
                <div className="flex items-center gap-2">
                  <Button size="sm" className="flex-1" disabled={syncing === f.id || f.id.startsWith("rss_")} onClick={() => runSync(f.id)}>
                    <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${syncing === f.id ? "animate-spin" : ""}`} /> Sync Now
                  </Button>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Switch checked={f.autoSync} onCheckedChange={(v) => updateRssFeed(f.id, { autoSync: v })} /> Auto
                  </span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={f.id.startsWith("rss_")} onClick={() => removeRssFeed(f.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {hasMore("rss") && (
        <div className="mt-3 flex justify-center">
          <Button variant="outline" size="sm" disabled={isResourceLoading("rss")} onClick={() => loadMore("rss")}>
            {isResourceLoading("rss") ? "Loading…" : "Load more feeds"}
          </Button>
        </div>
      )}

      {/* Episodes */}
      <div className="mb-4 mt-8 flex items-center gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Episodes</h2>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            {PLATFORMS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="gate-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Episode</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {episodes.map((ep) => (
              <TableRow key={ep.id}>
                <TableCell className="w-full max-w-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                      {(ep as PodcastEpisode).artwork ? (
                        <img src={(ep as PodcastEpisode).artwork} alt="" className="h-full w-full object-cover" />
                      ) : <div className="flex h-full items-center justify-center text-[8px] text-muted-foreground">1:1</div>}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{ep.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{(ep as PodcastEpisode).duration} · ep {(ep as PodcastEpisode).episodeNumber}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell><PlatformPill p={ep.platform} /></TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{ep.category}</TableCell>
                <TableCell><StatusBadge status={ep.status} /></TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(ep as PodcastEpisode); setOpen(true) }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {episodes.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-14 text-center text-muted-foreground">
                  No episodes yet — add a feed and press Sync Now to import them.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={feedOpen} onOpenChange={setFeedOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add RSS Feed</DialogTitle>
          </DialogHeader>
          <FeedForm
            onCancel={() => setFeedOpen(false)}
            onSave={(feed) => { addRssFeed(feed); setFeedOpen(false) }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Episode · Categorisation</DialogTitle>
          </DialogHeader>
          {editing && <EpisodeEditor episode={editing} onClose={() => setOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FeedForm({ onSave, onCancel }: { onSave: (f: RssFeed) => void; onCancel: () => void }) {
  const [platform, setPlatform] = useState<PlatformId>("IPN")
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const valid = title.trim().length > 0 && /^https?:\/\//i.test(url.trim())
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Platform</Label>
        <Select value={platform} onValueChange={(v) => setPlatform(v as PlatformId)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{PLATFORMS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="IPN Gate Podcast" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Feed URL</Label>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…/rss" />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button
          disabled={!valid}
          onClick={() =>
            onSave({
              id: `rss_${Date.now().toString(36)}`,
              platform,
              title: title.trim(),
              url: url.trim(),
              status: "healthy",
              totalEpisodes: 0,
              newLastSync: 0,
              autoSync: false,
              frequency: "daily",
            })
          }
        >
          Add Feed
        </Button>
      </div>
    </div>
  )
}

function PlatformPill({ p }: { p: PlatformId }) {
  const m = PLATFORM_MAP[p]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: m.softColor, color: m.color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />{m.name}
    </span>
  )
}

function EpisodeEditor({ episode, onClose }: { episode: PodcastEpisode; onClose: () => void }) {
  const { data, updateContent, toggleFeatured } = useGate()
  const [form, setForm] = useState(episode)
  const set = (patch: any) => setForm((f) => ({ ...f, ...patch }))
  const catOptions = data.categories.filter((c) => c.platform === form.platform)

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Title</Label>
        <Input value={form.title} onChange={(e) => set({ title: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Platform</Label>
          <Select value={form.platform} onValueChange={(v) => set({ platform: v as PlatformId })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PLATFORMS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Category</Label>
          <Select value={form.category} onValueChange={(v) => set({ category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{catOptions.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Description</Label>
        <Textarea value={form.description} onChange={(e) => set({ description: e.target.value })} rows={3} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Tags (comma separated)</Label>
        <Input value={form.tags.join(", ")} onChange={(e) => set({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Audio URL (actual RSS enclosure)</Label>
        <Input value={form.audioUrl} onChange={(e) => set({ audioUrl: e.target.value })} />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <span className="text-sm">Featured episode</span>
        <Switch checked={form.featured} onCheckedChange={(v) => set({ featured: v })} />
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { toggleFeatured(form.id); set({ featured: !form.featured }) }}>{form.featured ? "Unfeature" : "Feature"}</Button>
          <Button onClick={() => { updateContent(form.id, form); toast.success("Episode saved"); onClose() }}>Save</Button>
        </div>
      </div>
    </div>
  )
}
