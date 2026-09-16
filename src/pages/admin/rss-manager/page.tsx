import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Pencil, RefreshCw, Rss, Star, CheckCircle2 } from "lucide-react"
import { PageHeader, StatusBadge } from "@/components/gate/ui"
import { useGate } from "@/lib/gate/store"
import { PLATFORMS, PLATFORM_MAP } from "@/lib/gate/platforms"
import type { PlatformId, PodcastEpisode } from "@/lib/gate/types"
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
  const { data, syncRssFeed, ensureContentLoaded, ensureCategoriesLoaded, ensureRssLoaded } = useGate()

  useEffect(() => {
    ensureContentLoaded()
    ensureCategoriesLoaded()
    ensureRssLoaded()
  }, [ensureContentLoaded, ensureCategoriesLoaded, ensureRssLoaded])

  const [platform, setPlatform] = useState("all")
  const [editing, setEditing] = useState<PodcastEpisode | null>(null)
  const [open, setOpen] = useState(false)

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
        description="Automatic RSS fetching & synchronisation. Store actual enclosure audio URLs, edit metadata and control publishing per platform."
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
                  <Button size="sm" className="flex-1" onClick={() => { syncRssFeed(f.id); toast.success(`${m.name} synced`) }}>
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Sync Now
                  </Button>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Switch checked={f.autoSync} /> Auto
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Episodes */}
      <div className="mb-4 mt-6 flex items-center gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Episodes</h2>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            {PLATFORMS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card">
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
                <TableCell>
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
                <TableCell className="text-sm text-muted-foreground">{ep.category}</TableCell>
                <TableCell><StatusBadge status={ep.status} /></TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(ep as PodcastEpisode); setOpen(true) }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
      <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5" /> Stored enclosure audio URL is used directly by the player — never a placeholder.
      </p>
    </div>
  )
}
