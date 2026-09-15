import { useState } from "react"
import { Compass, Plus, Trash2 } from "lucide-react"
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
import { useTheo } from "@/lib/gate/theocentric/store"
import type { JourneySection } from "@/lib/gate/theocentric/types"

export default function DailyJourneyPage() {
  const { data, updateJourney } = useTheo()
  const [sections, setSections] = useState<JourneySection[]>(data.journey.sections)

  function update(s: JourneySection) {
    setSections((prev) => prev.map((x) => (x.key === s.key ? s : x)))
  }
  function add() {
    setSections((prev) => [
      ...prev,
      { key: `sec_${Date.now().toString(36)}`, label: "New Section", required: false, collectionId: null },
    ])
  }
  function remove(key: string) {
    setSections((prev) => prev.filter((x) => x.key !== key))
  }
  function save() {
    updateJourney({ sections })
  }

  return (
    <div>
      <PageHeader
        title="Daily Journey"
        description="Define the ordered sections of a user's daily spiritual journey. Each section maps to a collection of content."
        actions={
          <>
            <Button variant="outline" onClick={add}>
              <Plus className="mr-1.5 h-4 w-4" /> Add Section
            </Button>
            <Button onClick={save}>Save Configuration</Button>
          </>
        }
      />

      <div className="space-y-3">
        {sections.map((s, idx) => (
          <div key={s.key} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-end">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">{idx + 1}</span>
            </div>
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs">Section Label</Label>
              <Input value={s.label} onChange={(e) => update({ ...s, label: e.target.value })} />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs">Collection</Label>
              <Select
                value={s.collectionId ?? "none"}
                onValueChange={(v) => update({ ...s, collectionId: v === "none" ? null : v })}
              >
                <SelectTrigger><SelectValue placeholder="Select collection" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No collection</SelectItem>
                  {data.collections.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={s.required} onCheckedChange={(v) => update({ ...s, required: v })} /> Required
            </label>
            <Button variant="ghost" size="icon" className="text-rose-600" onClick={() => remove(s.key)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {sections.length === 0 && (
          <p className="text-sm text-muted-foreground">No sections configured. Add one to begin.</p>
        )}
      </div>
    </div>
  )
}
