import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Clock } from "lucide-react"
import { PageHeader } from "@/components/gate/ui"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTheo, useTheoLoad } from "@/lib/gate/theocentric/store"
import { ContentPicker, ContentSearchInput, useContentSearch } from "@/components/gate/theocentric/content-picker"
import type { AfterSalahEntry, SalahName } from "@/lib/gate/theocentric/types"

const SALAH: SalahName[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]

export default function AfterSalahPage() {
  const { data, saveAfterSalah } = useTheo()
  useTheoLoad("afterSalah", "collections")
  const { q, setQ } = useContentSearch()
  const [entries, setEntries] = useState<AfterSalahEntry[]>(data.afterSalah)
  const [saving, setSaving] = useState(false)

  // Configuration arrives asynchronously — sync the editable copy once it lands.
  useEffect(() => setEntries(data.afterSalah), [data.afterSalah])

  function setEntry(salah: SalahName, patch: Partial<AfterSalahEntry>) {
    setEntries((prev) => {
      const existing = prev.find((e) => e.salah === salah)
      if (existing) return prev.map((e) => (e.salah === salah ? { ...e, ...patch } : e))
      return [...prev, { salah, collectionId: null, items: [], ...patch }]
    })
  }
  function toggleItem(salah: SalahName, contentId: string) {
    setEntries((prev) => {
      if (!prev.some((e) => e.salah === salah)) prev = [...prev, { salah, collectionId: null, items: [] }]
      return prev.map((e) => {
        if (e.salah !== salah) return e
        const has = e.items.some((i) => i.contentId === contentId)
        return {
          ...e,
          items: has
            ? e.items.filter((i) => i.contentId !== contentId)
            : [...e.items, { contentId, order: e.items.length + 1, required: false }],
        }
      })
    })
  }
  function setItem(salah: SalahName, contentId: string, patch: { required?: boolean }) {
    setEntries((prev) =>
      prev.map((e) =>
        e.salah === salah ? { ...e, items: e.items.map((i) => (i.contentId === contentId ? { ...i, ...patch } : i)) } : e,
      ),
    )
  }
  async function save() {
    setSaving(true)
    const ok = await saveAfterSalah(entries)
    setSaving(false)
    if (ok) toast.success("After-salah configuration saved")
  }

  return (
    <div>
      <PageHeader
        title="After Salah"
        description="What appears after each of the five prayers."
        actions={<Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Configuration"}</Button>}
      />

      <div className="mb-4 max-w-md">
        <ContentSearchInput q={q} setQ={setQ} />
      </div>

      <div className="space-y-4">
        {SALAH.map((s) => {
          const entry = entries.find((e) => e.salah === s)
          return (
            <div key={s} className="gate-surface p-4">
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

              <div className="mt-3">
                <ContentPicker
                  className="max-h-52"
                  items={entry?.items ?? []}
                  onToggle={(id) => toggleItem(s, id)}
                  onChange={(id, patch) => setItem(s, id, patch)}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
