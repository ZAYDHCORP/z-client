import { useEffect, useMemo, useState } from "react"
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
import { useTheo, useTheoContent, useTheoLoad, type ContentFilters } from "@/lib/gate/theocentric/store"
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
  filters: baseFilters,
}: {
  title: string
  description?: string
  kinds: ContentKind[]
  predicate?: (c: SpiritualContent) => boolean
  showKind?: boolean
  hideAdd?: boolean
  /** Server-side filters this page always applies (e.g. `{ status: "published" }`). */
  filters?: ContentFilters
}) {
  const {
    data,
    setContentStatus,
    setVerification,
    toggleFeatured,
    duplicateContent,
    removeContent,
    bulkAction,
    hasMore,
    loadMore,
    isLoading,
  } = useTheo()
  useTheoLoad("categories", "subcategories")
  const [q, setQ] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [verifyFilter, setVerifyFilter] = useState<string>("all")
  const [catFilter, setCatFilter] = useState<string>("all")
  const [selected, setSelected] = useState<string[]>([])
  const [editing, setEditing] = useState<SpiritualContent | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  // Search is sent to the server (debounced) so it reaches beyond the loaded page.
  const [debouncedQ, setDebouncedQ] = useState("")
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 350)
    return () => clearTimeout(t)
  }, [q])

  const serverFilters = useMemo<ContentFilters>(() => {
    const f: ContentFilters = { ...baseFilters }
    if (kinds.length === 1) f.kind = kinds[0]
    if (statusFilter !== "all") f.status = statusFilter
    if (catFilter !== "all") f.category = catFilter
    if (debouncedQ) f.q = debouncedQ
    return f
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(baseFilters), kinds.join(","), statusFilter, catFilter, debouncedQ])
  useTheoContent(serverFilters)

  const catName = (id: string) =>
    data.categories.find((c) => c.id === id)?.name ?? "—"

  const rows = useMemo(() => {
    // Status / category / kind / search are filtered by the server; what is left
    // here is only what the API has no filter for (verification, "featured").
    let list = data.content.filter((c) => kinds.includes(c.kind))
    if (predicate) list = list.filter(predicate)
    if (verifyFilter !== "all") list = list.filter((c) => c.verification === verifyFilter)
    return [...list].sort((a, b) => a.displayOrder - b.displayOrder)
  }, [data.content, kinds, predicate, verifyFilter])

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

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search text, tags…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="unpublished">Unpublished</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={verifyFilter} onValueChange={setVerifyFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Verification" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All verification</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
            <SelectItem value="under_review">Under review</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="requires_correction">Requires correction</SelectItem>
          </SelectContent>
        </Select>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Category" /></SelectTrigger>
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
          <Button size="sm" variant="destructive" onClick={() => { if (confirm(`Delete ${selected.length} selected item(s)? Items inside a collection can't be deleted.`)) { selected.forEach((id) => removeContent(id)); setSelected([]) } }}>
            Delete
          </Button>
        </div>
      )}

      <div className="gate-surface overflow-hidden">
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
                <TableCell className="max-w-[22rem]">
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
                <TableCell className="min-w-28 text-sm">{catName(c.category)}</TableCell>
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
                      <SelectItem value="under_review">Under review</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="requires_correction">Needs fix</SelectItem>
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
                      className="h-8 w-8 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600"
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
                  {isLoading("content") ? "Loading content…" : "No content found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {hasMore("content") && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" size="sm" disabled={isLoading("content")} onClick={() => loadMore("content")}>
            {isLoading("content") ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}

      <SpiritualEditor
        kind={editing ? editing.kind : kinds[0]}
        item={editing}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  )
}
