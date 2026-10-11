import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/gate/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTheo, useTheoLoad } from "@/lib/gate/theocentric/store"
import type { JourneySection } from "@/lib/gate/theocentric/types"

export default function DailyJourneyPage() {
  const { data, saveJourney, isLoading } = useTheo()
  useTheoLoad("journey", "collections")
  const [sections, setSections] = useState<JourneySection[]>(data.journey.sections)
  const [saving, setSaving] = useState(false)

  // The journey arrives asynchronously — sync the editable copy once it lands.
  useEffect(() => setSections(data.journey.sections), [data.journey.sections])

  function update(idx: number, s: JourneySection) {
    setSections((prev) => prev.map((x, i) => (i === idx ? s : x)))
  }
  function add() {
    setSections((prev) => [
      ...prev,
      { key: `sec_${Date.now().toString(36)}`, label: "New Section", required: false, collectionId: null },
    ])
  }
  function remove(idx: number) {
    setSections((prev) => prev.filter((_, i) => i !== idx))
  }
  async function save() {
    const keys = sections.map((s) => s.key.trim())
    if (sections.some((s) => !s.key.trim() || !s.label.trim())) return toast.error("Every section needs a key and a label.")
    if (new Set(keys).size !== keys.length) return toast.error("Section keys must be unique.")
    setSaving(true)
    const ok = await saveJourney(sections)
    setSaving(false)
    if (ok) toast.success("Daily journey saved")
  }

  return (
    <div>
      <PageHeader
        title="Daily Journey"
        description="The ordered sections of a user's daily journey, each linked to a collection."
        actions={
          <>
            <Button variant="outline" onClick={add}>
              <Plus className="mr-1.5 h-4 w-4" /> Add Section
            </Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Configuration"}</Button>
          </>
        }
      />

      <div className="space-y-3">
        {sections.map((s, idx) => (
          <div key={idx} className="flex flex-col gap-3 gate-surface p-4 sm:flex-row sm:items-end">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">{idx + 1}</span>
            </div>
            <div className="w-40 space-y-1.5">
              <Label className="text-xs">Key</Label>
              <Input
                value={s.key}
                onChange={(e) => update(idx, { ...s, key: e.target.value.replace(/\s+/g, "_").toLowerCase() })}
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs">Section Label</Label>
              <Input value={s.label} onChange={(e) => update(idx, { ...s, label: e.target.value })} />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs">Collection</Label>
              <Select
                value={s.collectionId ?? "none"}
                onValueChange={(v) => update(idx, { ...s, collectionId: v === "none" ? null : v })}
              >
                <SelectTrigger><SelectValue placeholder="Select collection" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No collection</SelectItem>
                  {data.collections.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={s.required} onCheckedChange={(v) => update(idx, { ...s, required: v })} /> Required
            </label>
            <Button variant="ghost" size="icon" className="text-rose-600" onClick={() => remove(idx)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {sections.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {isLoading("journey") ? "Loading…" : "No sections configured. Add one to begin."}
          </p>
        )}
      </div>
    </div>
  )
}
