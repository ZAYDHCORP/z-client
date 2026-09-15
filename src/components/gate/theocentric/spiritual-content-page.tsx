import { useMemo, useState } from "react"
import { Copy, Pencil, Plus, Search, Star, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/gate/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { SpiritualEditor } from "./spiritual-editor"
import { useTheo } from "@/lib/gate/theocentric/store"
import {
  ROUTINE_LABELS,
  type ContentKind,
  type PublicationStatus,
  type SpiritualContent,
  type VerificationStatus,
} from "@/lib/gate/theocentric/types"

const KIND_LABEL: Record<ContentKind, string> = {
  dua: "Dua",
  adkar: "Adhkars",
  quranic: "Quranic Reminders",
  rabbana: "Rabbana",
  ruqiyah: "Ruqiyah",
}

function repDisplay(r: string) {
  if (r === "none" || !r) return "—"
  if (r === "custom") return "Custom"
  return `${r}×`
}

export function SpiritualContentPage({
  title,
  description,
  kinds,
  predicate,
  showKind = false,
  hideAdd = false,
}: {
  title: string
  description?: string
  kinds: ContentKind[]
  predicate?: (c: SpiritualContent) => boolean
  showKind?: boolean
  hideAdd?: boolean
}) {
  const {
    data,
    setContentStatus,
    setVerification,
    toggleFeatured,
    duplicateContent,
    removeContent,
    bulkAction,
  } = useTheo()
  const [q, setQ] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [verifyFilter, setVerifyFilter] = useState<string>("all")
  const [catFilter, setCatFilter] = useState<string>("all")
  const [selected, setSelected] = useState<string[]>([])
  const [editing, setEditing] = useState<SpiritualContent | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const catName = (id: string) =>
    data.categories.find((c) => c.id === id)?.name ?? "—"

  const rows = useMemo(() => {
    let list = data.content.filter((c) => kinds.includes(c.kind))
    if (predicate) list = list.filter(predicate)
    if (statusFilter !== "all") list = list.filter((c) => c.status === statusFilter)
    if (verifyFilter !== "all") list = list.filter((c) => c.verification === verifyFilter)
    if (catFilter !== "all") list = list.filter((c) => c.category === catFilter)
    const needle = q.trim().toLowerCase()
    if (needle)
      list = list.filter((c) =>
        [c.title, c.arabic, c.transliteration, c.translation, c.tags.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(needle),
      )
    return [...list].sort((a, b) => a.displayOrder - b.displayOrder)
  }, [data.content, kinds, predicate, statusFilter, verifyFilter, catFilter, q])

  function openNew() {
    if (kinds.length === 1) {
      setEditing(null)
      setEditOpen(true)
    }
  }
  function openEdit(item: SpiritualContent) {
    setEditing(item)
    setEditOpen(true)
  }
  function toggleSelect(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  const singleKind = kinds.length === 1

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          !hideAdd && singleKind ? (
            <Button onClick={openNew}>
              <Plus className="mr-1.5 h-4 w-4" /> New {KIND_LABEL[kinds[0]]}
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search text, tags…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="unpublished">Unpublished</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={verifyFilter} onValueChange={setVerifyFilter}>
          <SelectTrigger><SelectValue placeholder="Verification" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All verification</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="requires_correction">Requires Correction</SelectItem>
          </SelectContent>
        </Select>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {data.categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selected.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-accent/40 px-3 py-2 text-sm">
          <span className="font-medium">{selected.length} selected</span>
          <Button size="sm" variant="outline" onClick={() => { bulkAction(selected, "publish"); setSelected([]) }}>
            Publish
          </Button>
          <Button size="sm" variant="outline" onClick={() => { bulkAction(selected, "unpublish"); setSelected([]) }}>
            Unpublish
          </Button>
          <Button size="sm" variant="outline" onClick={() => { bulkAction(selected, "verify"); setSelected([]) }}>
            Verify
          </Button>
          <Button size="sm" variant="outline" onClick={() => { bulkAction(selected, "archive"); setSelected([]) }}>
            Archive
          </Button>
          <Button size="sm" variant="destructive" onClick={() => { selected.forEach((id) => removeContent(id)); setSelected([]) }}>
            Delete
          </Button>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              {showKind && <TableHead>Kind</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead>Verify</TableHead>
              <TableHead>Routines</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected.includes(c.id)}
                    onChange={() => toggleSelect(c.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFeatured(c.id)}
                      title="Toggle featured"
                      className="text-muted-foreground hover:text-amber-500"
                    >
                      <Star className={`h-4 w-4 ${c.featured ? "fill-amber-400 text-amber-400" : ""}`} />
                    </button>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{c.title || "Untitled"}</p>
                      {c.arabic && (
                        <p dir="rtl" className="truncate text-xs text-muted-foreground font-[amiri,serif]">{c.arabic}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {repDisplay(c.repetition)}
                        {c.quranReference && ` · ${c.quranReference}`}
                        {c.tags.length > 0 && ` · ${c.tags.slice(0, 2).join(", ")}`}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{catName(c.category)}</TableCell>
                {showKind && (
                  <TableCell>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{KIND_LABEL[c.kind]}</span>
                  </TableCell>
                )}
                <TableCell>
                  <Select value={c.status} onValueChange={(v) => setContentStatus(c.id, v as PublicationStatus)}>
                    <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="unpublished">Unpublished</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select value={c.verification} onValueChange={(v) => setVerification(c.id, v as VerificationStatus)}>
                    <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unverified">Unverified</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="requires_correction">Needs Fix</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {c.routines.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                    {c.routines.map((r) => (
                      <span key={r} className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                        {ROUTINE_LABELS[r]}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)} title="Edit / Preview">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => duplicateContent(c.id)} title="Duplicate">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-rose-600"
                      onClick={() => { if (confirm("Delete this item?")) removeContent(c.id) }}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={showKind ? 8 : 7} className="py-10 text-center text-muted-foreground">
                  No content found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <SpiritualEditor
        kind={editing ? editing.kind : kinds[0]}
        item={editing}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  )
}
