import { useMemo, useState, type ChangeEvent } from "react"
import { Plus, Pencil, Trash2, Search, Upload } from "lucide-react"
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
  type: "text" | "textarea" | "number" | "select" | "switch" | "icon"
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
}: {
  title: string
  description?: string
  columns: Column<T>[]
  fields: FieldDef[]
  rows: T[]
  newRecord: () => T
  onSave: (item: T) => void
  onDelete: (id: string) => void
  searchKeys: (keyof T)[]
  addLabel?: string
  dialogTitle?: string
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
      onSave(editing)
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
      <div className="relative mb-4 max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={`Search ${title.toLowerCase()}…`} value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-xl border border-border bg-card">
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
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600" onClick={() => { if (confirm("Delete this item?")) onDelete(row.id) }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="py-10 text-center text-muted-foreground">
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
  record,
}: {
  def: FieldDef
  value: any
  onChange: (v: any) => void
  record?: any
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{def.label}</Label>
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
  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result as string)
    reader.readAsDataURL(f)
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
          <Upload className="h-4 w-4" /> Attach PNG logo
          <input type="file" accept="image/png,image/*" className="hidden" onChange={onFile} />
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
