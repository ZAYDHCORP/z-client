import { useMemo, useState, type ChangeEvent } from "react"
import { Plus, Pencil, Trash2, Search, Upload, FileText, Eye } from "lucide-react"
import { toast } from "sonner"
import { uploadFile } from "@/lib/gate/upload"
import { PageHeader } from "@/components/gate/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import type { ReactNode } from "react"

export interface Column<T> {
  header: string
  cell: (row: T) => ReactNode
  className?: string
}
export interface FieldDef {
  name: string
  label: string
  type: "text" | "textarea" | "number" | "select" | "switch" | "icon" | "file"
  /** For `file` fields: accepted MIME patterns, e.g. "image/*,application/pdf". */
  accept?: string
  options?: { value: string; label: string }[]
  placeholder?: string
  disabled?: boolean
}

export function CrudTable<T extends { id: string }>({
  title,
  description,
  columns,
  fields,
  rows,
  newRecord,
  onSave,
  onDelete,
  searchKeys,
  addLabel = "Add",
  dialogTitle = "Edit",
  onLoadMore,
  hasMore,
  loadingMore,
  onPreview,
}: {
  title: string
  description?: string
  columns: Column<T>[]
  fields: FieldDef[]
  rows: T[]
  newRecord: () => T
  /** Return `false` to keep the dialog open (e.g. failed client-side validation). */
  onSave: (item: T) => void | false
  onDelete: (id: string) => void
  searchKeys: (keyof T)[]
  addLabel?: string
  dialogTitle?: string
  /** Pagination — pass all three together to show a "Load more" footer. */
  onLoadMore?: () => void
  hasMore?: boolean
  loadingMore?: boolean
  /** When given, each row gets an eye button that previews it. */
  onPreview?: (row: T) => void
}) {
  const [q, setQ] = useState("")
  const [editing, setEditing] = useState<T | null>(null)
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!q) return rows
    const needle = q.toLowerCase()
    return rows.filter((r) =>
      searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(needle)),
    )
  }, [q, rows, searchKeys])

  function openNew() {
    setEditing(newRecord())
    setOpen(true)
  }
  function openEdit(row: T) {
    setEditing(row)
    setOpen(true)
  }
  function save() {
    if (editing) {
      if (onSave(editing) === false) return
      setOpen(false)
    }
  }

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button onClick={openNew}>
            <Plus className="mr-1.5 h-4 w-4" /> {addLabel}
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={`Search ${title.toLowerCase()}…`} value={q} onChange={(e) => setQ(e.target.value)} className="pl-10" />
        </div>
        <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground tabular-nums">
          {filtered.length} {filtered.length === 1 ? "record" : "records"}
        </span>
      </div>

      <div className="gate-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.header} className={c.className}>{c.header}</TableHead>
              ))}
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id}>
                {columns.map((c) => (
                  <TableCell key={c.header} className={c.className}>{c.cell(row)}</TableCell>
                ))}
                <TableCell>
                  <div className="flex justify-end gap-1">
                    {onPreview && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Preview" onClick={() => onPreview(row)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(row)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600" onClick={() => { if (confirm("Delete this item?")) onDelete(row.id) }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="py-16 text-center text-muted-foreground">
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {onLoadMore && hasMore && !q && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={onLoadMore} disabled={loadingMore}>
            {loadingMore ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[90vh] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4 text-left">
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          {editing && (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
                {fields.map((f) => (
                  <FieldEditor
                    key={f.name}
                    def={f}
                    value={(editing as any)[f.name]}
                    onChange={(v) => setEditing({ ...editing, [f.name]: v } as T)}
                    onPatch={(patch) => setEditing({ ...editing, ...patch } as T)}
                    record={editing}
                  />
                ))}
              </div>
              <div className="shrink-0 flex justify-end gap-2 border-t border-border px-6 py-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={save}>Save</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FieldEditor({
  def,
  value,
  onChange,
  onPatch,
  record,
}: {
  def: FieldDef
  value: any
  onChange: (v: any) => void
  /** Set several fields of the record at once (used by file fields to fill name, type, size…). */
  onPatch: (patch: Record<string, unknown>) => void
  record?: any
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{def.label}</Label>
      {def.type === "file" && (
        <FileField accept={def.accept} value={value} onPatch={onPatch} record={record} fieldName={def.name} />
      )}
      {def.type === "icon" && (
        <IconField value={value} onChange={onChange} record={record} />
      )}
      {def.type === "text" && (
        <Input value={value ?? ""} placeholder={def.placeholder} disabled={def.disabled} onChange={(e) => onChange(e.target.value)} />
      )}
      {def.type === "number" && (
        <Input type="number" value={value ?? 0} disabled={def.disabled} onChange={(e) => onChange(Number(e.target.value))} />
      )}
      {def.type === "textarea" && (
        <Textarea value={value ?? ""} placeholder={def.placeholder} onChange={(e) => onChange(e.target.value)} rows={3} />
      )}
      {def.type === "switch" && (
        <div className="flex items-center gap-2 pt-1">
          <Switch checked={!!value} onCheckedChange={onChange} />
          <span className="text-sm text-muted-foreground">{value ? "On" : "Off"}</span>
        </div>
      )}
      {def.type === "select" && (
        <Select value={value ?? ""} onValueChange={onChange}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {def.options?.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}

function isImageValue(v: any) {
  return typeof v === "string" && (v.startsWith("data:") || v.startsWith("http"))
}

function IconField({
  value,
  onChange,
  record,
}: {
  value: any
  onChange: (v: any) => void
  record?: any
}) {
  const [busy, setBusy] = useState(false)
  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = ""
    if (!f) return
    setBusy(true)
    try {
      const { publicUrl } = await uploadFile(f)
      onChange(publicUrl)
    } catch (err) {
      toast.error((err as Error).message || "Upload failed")
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={isImageValue(value) ? "" : (value ?? "")}
          placeholder="Emoji (e.g. ☪️) or short text"
          onChange={(e) => onChange(e.target.value)}
          className="max-w-[240px]"
        />
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-accent/40">
          <Upload className="h-4 w-4" /> {busy ? "Uploading…" : "Attach PNG logo"}
          <input type="file" accept="image/png,image/*" className="hidden" disabled={busy} onChange={onFile} />
        </label>
      </div>
      <div className="flex items-center gap-3 overflow-hidden rounded-lg border border-border bg-card p-3">
        {value ? (
          isImageValue(value) ? (
            <img src={value} alt="" className="h-10 w-10 shrink-0 overflow-hidden rounded-md object-contain" />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary/10 text-lg leading-none">{value}</span>
          )
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground leading-none">—</span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{record?.name || "Category name"}</p>
          <p className="truncate text-xs text-muted-foreground">
            {record?.description || "Category description preview"}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Pick a file from the device and upload it (signed upload straight to storage).
 * On success the record gets the short public URL plus name / type / mime / size /
 * dimensions, so the admin never types those by hand. While the upload runs the
 * record is flagged `__uploading` so Save can wait for it.
 */
function FileField({
  accept,
  value,
  onPatch,
  record,
  fieldName,
}: {
  accept?: string
  value: any
  onPatch: (patch: Record<string, unknown>) => void
  record?: any
  fieldName: string
}) {
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const uploading = Boolean(record?.__uploading)

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = ""
    if (!f) return
    const preview = f.type.startsWith("image/") ? URL.createObjectURL(f) : null
    setLocalPreview(preview)
    onPatch({ __uploading: true })

    // Image size is read from the local file while the upload runs.
    const dims = preview
      ? await new Promise<{ width?: number; height?: number }>((resolve) => {
          const img = new Image()
          img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
          img.onerror = () => resolve({})
          img.src = preview
        })
      : {}

    try {
      const { publicUrl, kind } = await uploadFile(f)
      onPatch({
        [fieldName]: publicUrl,
        type: kind,
        mime: f.type,
        sizeKB: Math.max(1, Math.ceil(f.size / 1024)),
        name: record?.name ? record.name : f.name,
        ...dims,
        __uploading: false,
      })
    } catch (err) {
      toast.error((err as Error).message || "Upload failed")
      onPatch({ __uploading: false })
    }
  }

  const hasFile = typeof value === "string" && value.length > 0
  const previewSrc = localPreview ?? (hasFile && record?.type === "image" ? value : null)

  return (
    <div className="space-y-2">
      <label
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-8 text-sm text-muted-foreground transition-colors ${
          uploading ? "cursor-wait" : "cursor-pointer hover:border-gold/60 hover:bg-gold-soft"
        }`}
      >
        {previewSrc ? (
          <img src={previewSrc} alt="" className="max-h-40 rounded-md object-contain" />
        ) : hasFile ? (
          <FileText className="h-8 w-8" />
        ) : (
          <Upload className="h-6 w-6" />
        )}
        <span className="font-medium text-foreground">
          {uploading ? "Uploading…" : hasFile ? "Replace file" : "Choose a file to upload"}
        </span>
        <span className="text-xs">Image, PDF or audio</span>
        <input type="file" accept={accept} className="hidden" disabled={uploading} onChange={onFile} />
      </label>
      {hasFile && !uploading && (
        <p className="truncate text-xs text-muted-foreground">
          {record?.name} · {record?.mime}
          {record?.sizeKB ? ` · ${record.sizeKB} KB` : ""}
          {record?.width ? ` · ${record.width}×${record.height}` : ""}
        </p>
      )}
    </div>
  )
}
