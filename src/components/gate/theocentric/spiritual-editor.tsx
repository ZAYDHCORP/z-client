import { useEffect, useState } from "react"
import { Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import {
  ROUTINE_LABELS,
  type ContentKind,
  type PublicationStatus,
  type Routine,
  type SpiritualContent,
  type VerificationStatus,
} from "@/lib/gate/theocentric/types"

const REP_OPTIONS = ["none", "1", "3", "7", "10", "33", "100", "custom"]

function empty(kind: ContentKind): SpiritualContent {
  return {
    id: `${kind}_${Date.now().toString(36)}`,
    kind,
    title: "",
    arabic: "",
    transliteration: "",
    translation: "",
    benefit: "",
    notes: "",
    repetition: "none",
    category: "",
    subcategory: "",
    occasion: "",
    tags: [],
    quranReference: "",
    hadithReference: "",
    source: "",
    displayOrder: 1,
    verification: "unverified",
    status: "draft",
    routines: [],
    isQuranic: kind === "quranic" || kind === "rabbana" || kind === "ruqiyah",
    surahName: "",
    surahNumber: null,
    ayahRange: "",
    rabbanaNumber: kind === "rabbana" ? 1 : null,
    featured: false,
    collections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function SpiritualEditor({
  kind,
  item,
  open,
  onOpenChange,
}: {
  kind: ContentKind
  item: SpiritualContent | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { data, addContent, updateContent } = useTheo()
  const [form, setForm] = useState<SpiritualContent>(() => (item ? item : empty(kind)))
  const [customRep, setCustomRep] = useState("")

  useEffect(() => {
    if (open) {
      setForm(item ? item : empty(kind))
      setCustomRep("")
    }
  }, [open, item, kind])

  const set = (patch: Partial<SpiritualContent>) =>
    setForm((f) => ({ ...f, ...patch, updatedAt: new Date().toISOString() }))
  const catName = (id: string) => data.categories.find((c) => c.id === id)?.name ?? "—"
  const subOptions = data.subcategories.filter((s) => s.parent === form.category)

  const kindLabel: Record<ContentKind, string> = {
    dua: "Dua",
    adkar: "Adhkars",
    quranic: "Quranic Reminders",
    rabbana: "40 Rabbana",
    ruqiyah: "Ruqiyah",
  }

  function save() {
    const finalRep = form.repetition === "custom" ? customRep || "none" : form.repetition
    const payload = { ...form, repetition: finalRep }
    if (item) updateContent(item.id, payload)
    else addContent(payload)
    onOpenChange(false)
  }

  const repDisplay = form.repetition === "custom" ? customRep || "—" : form.repetition === "none" ? "No Specific Count" : `${form.repetition}×`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="shrink-0 space-y-1 border-b border-border px-6 py-4 text-left">
          <DialogTitle>
            {item ? `Edit ${kindLabel[kind]}` : `New ${kindLabel[kind]}`}
          </DialogTitle>
          <DialogDescription>
            RTL-safe editing with live preview. Published content reflects immediately in the user dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Form column */}
            <div className="space-y-3">
              <Field label="Title">
                <Input value={form.title} onChange={(e) => set({ title: e.target.value })} />
              </Field>
              <Field label="Arabic (RTL)">
                <Textarea
                  dir="rtl"
                  className="text-right font-[amiri,serif] text-base leading-loose"
                  value={form.arabic}
                  onChange={(e) => set({ arabic: e.target.value })}
                  rows={4}
                />
              </Field>
              <Field label="Transliteration">
                <Input value={form.transliteration} onChange={(e) => set({ transliteration: e.target.value })} />
              </Field>
              <Field label="English Translation">
                <Textarea value={form.translation} onChange={(e) => set({ translation: e.target.value })} rows={3} />
              </Field>
              <Field label="Benefit / Virtue">
                <Textarea value={form.benefit} onChange={(e) => set({ benefit: e.target.value })} rows={2} />
              </Field>
              <Field label="Notes (internal)">
                <Textarea value={form.notes} onChange={(e) => set({ notes: e.target.value })} rows={2} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Repetition Count">
                  <Select value={form.repetition} onValueChange={(v) => set({ repetition: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {REP_OPTIONS.map((r) => (
                        <SelectItem key={r} value={r}>{r === "none" ? "No Specific Count" : r === "custom" ? "Custom" : `${r}×`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                {form.repetition === "custom" && (
                  <Field label="Custom Count">
                    <Input type="number" value={customRep} onChange={(e) => setCustomRep(e.target.value)} />
                  </Field>
                )}
                <Field label="Category">
                  <Select value={form.category} onValueChange={(v) => set({ category: v, subcategory: "" })}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {data.categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Subcategory">
                  <Select value={form.subcategory} onValueChange={(v) => set({ subcategory: v })}>
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>
                      {subOptions.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Occasion">
                  <Input value={form.occasion} onChange={(e) => set({ occasion: e.target.value })} />
                </Field>
                <Field label="Display Order">
                  <Input type="number" value={form.displayOrder} onChange={(e) => set({ displayOrder: Number(e.target.value) })} />
                </Field>
              </div>

              <Field label="Tags (comma separated)">
                <Input
                  value={form.tags.join(", ")}
                  onChange={(e) => set({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Qur'an Reference">
                  <Input value={form.quranReference} onChange={(e) => set({ quranReference: e.target.value })} placeholder="e.g. 2:255" />
                </Field>
                <Field label="Hadith Reference">
                  <Input value={form.hadithReference} onChange={(e) => set({ hadithReference: e.target.value })} />
                </Field>
              </div>
              <Field label="Source">
                <Input value={form.source} onChange={(e) => set({ source: e.target.value })} />
              </Field>

              {(kind === "quranic" || kind === "ruqiyah" || kind === "rabbana") && (
                <div className="grid grid-cols-3 gap-3 rounded-lg border border-border p-3">
                  <Field label="Surah Name">
                    <Input value={form.surahName} onChange={(e) => set({ surahName: e.target.value })} />
                  </Field>
                  <Field label="Surah #">
                    <Input type="number" value={form.surahNumber ?? ""} onChange={(e) => set({ surahNumber: e.target.value ? Number(e.target.value) : null })} />
                  </Field>
                  <Field label="Ayah Range">
                    <Input value={form.ayahRange} onChange={(e) => set({ ayahRange: e.target.value })} />
                  </Field>
                </div>
              )}
              {kind === "rabbana" && (
                <Field label="Rabbana Number">
                  <Input type="number" value={form.rabbanaNumber ?? ""} onChange={(e) => set({ rabbanaNumber: e.target.value ? Number(e.target.value) : null })} />
                </Field>
              )}

              {kind === "adkar" && (
                <div className="rounded-lg border border-border p-3">
                  <p className="mb-2 text-sm font-medium">Routines (multi-select)</p>
                  <div className="flex flex-wrap gap-3">
                    {(Object.keys(ROUTINE_LABELS) as Routine[]).map((r) => (
                      <label key={r} className="flex items-center gap-1.5 text-sm">
                        <input
                          type="checkbox"
                          checked={form.routines.includes(r)}
                          onChange={(e) =>
                            set({
                              routines: e.target.checked
                                ? [...form.routines, r]
                                : form.routines.filter((x) => x !== r),
                            })
                          }
                        />
                        {ROUTINE_LABELS[r]}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Field label="Verification Status">
                  <Select value={form.verification} onValueChange={(v) => set({ verification: v as VerificationStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["unverified", "under_review", "verified", "requires_correction"] as VerificationStatus[]).map((v) => (
                        <SelectItem key={v} value={v}>{v.replace(/_/g, " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Publication Status">
                  <Select value={form.status} onValueChange={(v) => set({ status: v as PublicationStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["draft", "published", "unpublished", "archived"] as PublicationStatus[]).map((v) => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border p-3">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={form.featured} onCheckedChange={(v) => set({ featured: v })} /> Featured
                </label>
                {(kind === "dua" || kind === "adkar") && (
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={form.isQuranic} onCheckedChange={(v) => set({ isQuranic: v })} /> Mark as Qur'anic source
                  </label>
                )}
              </div>
            </div>

            {/* Preview column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Eye className="h-4 w-4" /> Live Preview
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{kindLabel[kind]}</p>
                <h3 className="mt-1 text-lg font-semibold">{form.title || "Untitled"}</h3>
                {form.arabic && (
                  <p dir="rtl" className="mt-3 rounded-lg bg-muted p-3 text-right font-[amiri,serif] text-xl leading-loose">
                    {form.arabic}
                  </p>
                )}
                {form.transliteration && (
                  <p className="mt-2 text-sm italic text-muted-foreground">{form.transliteration}</p>
                )}
                {form.translation && (
                  <p className="mt-1 text-sm">{form.translation}</p>
                )}
                {form.benefit && (
                  <p className="mt-2 rounded-lg bg-accent/50 p-2 text-sm">
                    <span className="font-medium">Benefit: </span>{form.benefit}
                  </p>
                )}
                {form.quranReference && (
                  <p className="mt-2 text-xs text-muted-foreground">Reference: {form.quranReference} {form.source ? `· ${form.source}` : ""}</p>
                )}
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Category: {catName(form.category)}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">Repeat: {repDisplay}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-between gap-3 border-t border-border px-6 py-4">
          <span className="text-xs text-muted-foreground">
            {form.verification === "verified" ? "Verified" : "Not verified"} · {form.status}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={save}>{item ? "Save Changes" : "Create Draft"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  )
}
