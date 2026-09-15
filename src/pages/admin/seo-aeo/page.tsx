import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Search, Pencil, CheckCircle2, AlertCircle } from "lucide-react"
import { PageHeader, StatusBadge, PlatformPill } from "@/components/gate/ui"
import { useGate } from "@/lib/gate/store"
import type { AnyContent } from "@/lib/gate/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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

export default function SeoAeoPage() {
  const { data, updateContent } = useGate()
  const [q, setQ] = useState("")
  const [platform, setPlatform] = useState("ALL")
  const [editing, setEditing] = useState<AnyContent | null>(null)
  const [open, setOpen] = useState(false)

  const all = useMemo(
    () => [...data.books, ...data.research, ...data.infographics, ...data.podcasts],
    [data],
  )
  const filtered = useMemo(
    () =>
      all.filter((c) => (platform === "ALL" ? true : c.platform === platform))
        .filter((c) =>
          q
            ? c.title.toLowerCase().includes(q.toLowerCase()) ||
              c.seo.focusKeyword.toLowerCase().includes(q.toLowerCase())
            : true,
        ),
    [all, q, platform],
  )

  function optimized(c: AnyContent) {
    return c.seo.focusKeyword.trim().length > 0 && c.seo.aeoSummary.trim().length > 0
  }

  return (
    <div>
      <PageHeader
        title="SEO / AEO"
        description="Per-content search optimisation and answer-engine optimisation. Focus keywords, meta, Open Graph, robots and AI-friendly summaries."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search content…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Platforms</SelectItem>
            {data && ["IPN", "IGC", "IFR", "ISR"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Focus Keyword</TableHead>
              <TableHead>Robots</TableHead>
              <TableHead>Optimised</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <p className="font-medium">{c.title}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{c.seo.seoTitle || "—"}</p>
                </TableCell>
                <TableCell><PlatformPill p={c.platform} /></TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.seo.focusKeyword || "—"}</TableCell>
                <TableCell><StatusBadge status="active" label={c.seo.robots} /></TableCell>
                <TableCell>
                  {optimized(c) ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" /> Yes</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400"><AlertCircle className="h-3.5 w-3.5" /> Needs work</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(c); setOpen(true) }}><Pencil className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>SEO / AEO · {editing?.title}</DialogTitle></DialogHeader>
          {editing && <SeoEditor content={editing} onClose={() => setOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SeoEditor({ content, onClose }: { content: AnyContent; onClose: () => void }) {
  const { updateContent } = useGate()
  const [form, setForm] = useState(content.seo)
  const set = (patch: Partial<AnyContent["seo"]>) => setForm((f) => ({ ...f, ...patch }))

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">SEO Title</Label>
          <Input value={form.seoTitle} onChange={(e) => set({ seoTitle: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Focus Keyword</Label>
          <Input value={form.focusKeyword} onChange={(e) => set({ focusKeyword: e.target.value })} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Meta Description</Label>
        <Textarea value={form.metaDescription} onChange={(e) => set({ metaDescription: e.target.value })} rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Robots</Label>
          <Select value={form.robots} onValueChange={(v) => set({ robots: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="index,follow">index, follow</SelectItem>
              <SelectItem value="noindex">noindex</SelectItem>
              <SelectItem value="index,nofollow">index, nofollow</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Twitter Card</Label>
          <Select value={form.twitterCard} onValueChange={(v) => set({ twitterCard: v as "summary" | "summary_large_image" })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">summary</SelectItem>
              <SelectItem value="summary_large_image">summary_large_image</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">OG Title</Label>
          <Input value={form.ogTitle} onChange={(e) => set({ ogTitle: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">OG Image URL</Label>
          <Input value={form.ogImage} onChange={(e) => set({ ogImage: e.target.value })} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">AEO Summary (AI answer snippet)</Label>
        <Textarea value={form.aeoSummary} onChange={(e) => set({ aeoSummary: e.target.value })} rows={3} />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => { updateContent(content.id, { seo: form }); toast.success("SEO saved"); onClose() }}>Save</Button>
      </div>
    </div>
  )
}
