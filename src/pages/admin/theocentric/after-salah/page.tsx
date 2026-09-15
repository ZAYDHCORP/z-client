import { useState } from "react"
import { Clock } from "lucide-react"
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
import type { AfterSalahEntry, SalahName } from "@/lib/gate/theocentric/types"

const SALAH: SalahName[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]

export default function AfterSalahPage() {
  const { data, updateAfterSalah } = useTheo()
  const [entries, setEntries] = useState<AfterSalahEntry[]>(data.afterSalah)

  function setEntry(salah: SalahName, patch: Partial<AfterSalahEntry>) {
    setEntries((prev) => {
      const existing = prev.find((e) => e.salah === salah)
      if (existing) return prev.map((e) => (e.salah === salah ? { ...e, ...patch } : e))
      return [...prev, { salah, collectionId: null, items: [], ...patch }]
    })
  }
  function toggleItem(salah: SalahName, contentId: string) {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.salah !== salah) return e
        const has = e.items.some((i) => i.contentId === contentId)
        return {
          ...e,
          items: has
            ? e.items.filter((i) => i.contentId !== contentId)
            : [...e.items, { contentId, order: e.items.length + 1, required: false }],
        }
      }),
    )
  }
  function save() {
    updateAfterSalah(entries)
  }

  return (
    <div>
      <PageHeader
        title="After Salah"
        description="Configure the adhkars and supplications shown after each of the five prayers."
        actions={<Button onClick={save}>Save Configuration</Button>}
      />

      <div className="space-y-4">
        {SALAH.map((s) => {
          const entry = entries.find((e) => e.salah === s)
          return (
            <div key={s} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">{s}</h3>
                <div className="ml-auto w-56 space-y-1.5">
                  <Label className="text-xs">Collection (optional)</Label>
                  <Select
                    value={entry?.collectionId ?? "none"}
                    onValueChange={(v) => setEntry(s, { collectionId: v === "none" ? null : v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select collection" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {data.collections.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-3 max-h-52 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                {data.content.map((c) => {
                  const item = entry?.items.find((i) => i.contentId === c.id)
                  return (
                    <label key={c.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent/40">
                      <input type="checkbox" checked={!!item} onChange={() => toggleItem(s, c.id)} />
                      <span className="flex-1 truncate">{c.title || "Untitled"}</span>
                      {item && (
                        <label className="flex items-center gap-1 text-xs">
                          <Switch
                            checked={item.required}
                            onCheckedChange={(v) =>
                              setEntries((prev) =>
                                prev.map((e) =>
                                  e.salah === s
                                    ? { ...e, items: e.items.map((i) => (i.contentId === c.id ? { ...i, required: v } : i)) }
                                    : e,
                                ),
                              )
                            }
                          />
                          Req
                        </label>
                      )}
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
