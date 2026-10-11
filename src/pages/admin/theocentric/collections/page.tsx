import { useState } from "react"
import { toast } from "sonner"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { PageHeader, StatusBadge } from "@/components/gate/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTheo, useTheoLoad } from "@/lib/gate/theocentric/store"
import { ContentPicker, ContentSearchInput, useContentSearch } from "@/components/gate/theocentric/content-picker"
import type { PublicationStatus, TheoCollection } from "@/lib/gate/theocentric/types"

const statusOpts: { value: PublicationStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "unpublished", label: "Unpublished" },
  { value: "archived", label: "Archived" },
]

export default function CollectionsPage() {
  const { data, addCollection, updateCollection, removeCollection, loadMore, hasMore, isLoading } = useTheo()
  useTheoLoad("collections")
  const { q, setQ } = useContentSearch()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<TheoCollection | null>(null)

  function openNew() {
    setEditing({
      id: `col_${Date.now().toString(36)}`,
      name: "",
      description: "",
      icon: "",
      cover: "",
      items: [],
      status: "published",
    })
    setOpen(true)
  }
  function openEdit(c: TheoCollection) {
    setEditing(c)
    setOpen(true)
  }
  function save() {
    if (!editing) return
    if (!editing.name.trim()) return toast.error("A collection needs a name.")
    if (data.collections.some((x) => x.id === editing.id)) updateCollection(editing.id, editing)
    else addCollection(editing)
    setOpen(false)
  }
  function toggleItem(contentId: string) {
    if (!editing) return
    const exists = editing.items.some((i) => i.contentId === contentId)
    if (exists) {
      setEditing({ ...editing, items: editing.items.filter((i) => i.contentId !== contentId) })
    } else {
      setEditing({
        ...editing,
        items: [...editing.items, { contentId, order: editing.items.length + 1, required: false, repetition: "none" }],
      })
    }
  }

  return (
    <div>
      <PageHeader
        title="Collections / Routines"
        description="Group content into collections (routines) without duplicating records. The same item can belong to many collections."
        actions={
          <Button onClick={openNew}>
            <Plus className="mr-1.5 h-4 w-4" /> New Collection
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.collections.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.items.length} items</p>
              </div>
              <StatusBadge status={c.status} />
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.description || "—"}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
              </Button>
              <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => { if (confirm("Delete collection?")) removeCollection(c.id) }}>
                <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </div>
        ))}
        {data.collections.length === 0 && (
          <p className="text-sm text-muted-foreground">{isLoading("collections") ? "Loading collections…" : "No collections yet."}</p>
        )}
      </div>

      {hasMore("collections") && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" size="sm" disabled={isLoading("collections")} onClick={() => loadMore("collections")}>
            {isLoading("collections") ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[92vh] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4 text-left">
            <DialogTitle>{editing && data.collections.some((x) => x.id === editing.id) ? "Edit Collection" : "New Collection"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <>
              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Name</Label>
                    <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Icon</Label>
                    <Input value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} placeholder="emoji" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Cover URL</Label>
                    <Input value={editing.cover} onChange={(e) => setEditing({ ...editing, cover: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Status</Label>
                    <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v as PublicationStatus })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {statusOpts.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Description</Label>
                  <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Items ({editing.items.length})</p>
                  <ContentSearchInput q={q} setQ={setQ} />
                  <ContentPicker
                    showOrder
                    className="max-h-56"
                    items={editing.items}
                    onToggle={toggleItem}
                    onChange={(contentId, patch) =>
                      setEditing({
                        ...editing,
                        items: editing.items.map((i) => (i.contentId === contentId ? { ...i, ...patch } : i)),
                      })
                    }
                  />
                </div>
              </div>
              <div className="shrink-0 flex justify-end gap-2 border-t border-border px-6 py-4">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={save}>Save</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
