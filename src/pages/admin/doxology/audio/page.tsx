import { useState } from "react"
import { Music, Pencil, Plus, Star, Trash2, Upload } from "lucide-react"
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
import { useDoxology } from "@/lib/gate/doxology/store"
import type { AudioEntry } from "@/lib/gate/doxology/types"

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

export default function AudioLibraryPage() {
  const { data, addAudio, updateAudio, removeAudio, setDefaultAudio } = useDoxology()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AudioEntry | null>(null)
  const [url, setUrl] = useState("")

  function openNew() {
    setEditing({ id: "", name: "", category: "adhan", source: "", url: "", isDefault: false, updatedAt: new Date().toISOString() })
    setUrl("")
    setOpen(true)
  }
  function openEdit(a: AudioEntry) {
    setEditing(a)
    setUrl(a.url)
    setOpen(true)
  }
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const dataUrl = await readFileAsDataUrl(f)
    setUrl(dataUrl)
    if (editing) setEditing({ ...editing, url: dataUrl })
  }
  function save() {
    if (!editing) return
    const payload = { ...editing, url, updatedAt: new Date().toISOString() }
    if (!payload.id) {
      addAudio({ ...payload, id: `aud_${Date.now().toString(36)}` })
    } else {
      updateAudio(payload.id, payload)
    }
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Audio Library"
        description="Upload or update approved alarm/reminder audio. All audio must be from authentic, approved sources."
        actions={
          <Button onClick={openNew}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Audio
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.audio.map((a) => (
          <div key={a.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">{a.name}</p>
                {a.isDefault && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Default
                  </span>
                )}
              </div>
              <StatusBadge status={a.category} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{a.source || "—"}</p>
            <div className="mt-3">
              {a.url ? (
                <audio controls src={a.url} className="h-9 w-full" />
              ) : (
                <p className="text-xs text-rose-600">No file uploaded</p>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(a)}>
                <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
              </Button>
              {!a.isDefault && (
                <Button size="sm" variant="outline" onClick={() => setDefaultAudio(a.id)}>
                  <Star className="mr-1 h-3.5 w-3.5" /> Set as Default
                </Button>
              )}
              <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => { if (confirm("Delete this audio?")) removeAudio(a.id) }}>
                <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </div>
        ))}
        {data.audio.length === 0 && (
          <p className="text-sm text-muted-foreground">No audio yet.</p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[92vh] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4 text-left">
            <DialogTitle>{editing && editing.id ? "Edit Audio" : "Add Approved Audio"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Name</Label>
                  <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Makkah Adhan (Fajr)" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Category</Label>
                  <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v as AudioEntry["category"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adhan">Adhan</SelectItem>
                      <SelectItem value="dhikr">Dhikr</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Authentic / Approved Source</Label>
                  <Textarea value={editing.source} onChange={(e) => setEditing({ ...editing, source: e.target.value })} rows={2} placeholder="Describe the verified source" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Audio File</Label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-accent/40">
                    <Upload className="h-4 w-4" /> {url || editing.url ? "Replace file" : "Upload audio"}
                    <input type="file" accept="audio/*" className="hidden" onChange={onFile} />
                  </label>
                  {url && <p className="text-xs text-emerald-600">File attached.</p>}
                </div>
              </div>
              <div className="flex shrink-0 justify-end gap-2 border-t border-border px-6 py-4">
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
