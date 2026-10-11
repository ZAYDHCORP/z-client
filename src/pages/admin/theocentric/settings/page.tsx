import { useEffect, useState } from "react"
import { toast } from "sonner"
import { PageHeader } from "@/components/gate/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useTheo, useTheoLoad } from "@/lib/gate/theocentric/store"

export default function TheoSettingsPage() {
  const { data, updateSettings } = useTheo()
  useTheoLoad("settings", "categories")
  const s = data.settings
  const [saving, setSaving] = useState(false)
  const [verificationRequired, setVerificationRequired] = useState(s.verificationRequired)
  const [publicationRules, setPublicationRules] = useState(s.publicationRules)
  const [displayRules, setDisplayRules] = useState(s.displayRules)
  const [defaultOrdering, setDefaultOrdering] = useState(s.defaultOrdering)
  const [defaultCategories, setDefaultCategories] = useState<string[]>(s.defaultCategories)
  const [defaultJourney, setDefaultJourney] = useState<string[]>(s.defaultJourney)

  // Settings arrive asynchronously — sync the form once they land.
  useEffect(() => {
    setVerificationRequired(s.verificationRequired)
    setPublicationRules(s.publicationRules)
    setDisplayRules(s.displayRules)
    setDefaultOrdering(s.defaultOrdering)
    setDefaultCategories(s.defaultCategories)
    setDefaultJourney(s.defaultJourney)
  }, [s])

  function toggleCat(id: string) {
    setDefaultCategories((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }
  async function save() {
    setSaving(true)
    const ok = await updateSettings({
      verificationRequired,
      publicationRules,
      displayRules,
      defaultOrdering,
      defaultCategories,
      defaultJourney,
    })
    setSaving(false)
    if (ok) toast.success("Settings saved")
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure verification, publication and display rules for the Theocentric & Doxology module."
        actions={
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Settings"}</Button>
        }
      />

      <div className="max-w-3xl space-y-5">
        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
          <div>
            <p className="text-sm font-medium">Verification Required Before Publish</p>
            <p className="text-xs text-muted-foreground">Block publishing content that is not verified.</p>
          </div>
          <Switch checked={verificationRequired} onCheckedChange={setVerificationRequired} />
        </div>

        <div className="space-y-1.5">
          <Label>Publication Rules</Label>
          <Textarea value={publicationRules} onChange={(e) => setPublicationRules(e.target.value)} rows={3} placeholder="Describe rules for publishing content…" />
        </div>
        <div className="space-y-1.5">
          <Label>Display Rules</Label>
          <Textarea value={displayRules} onChange={(e) => setDisplayRules(e.target.value)} rows={3} placeholder="Describe how content is displayed to users…" />
        </div>
        <div className="space-y-1.5">
          <Label>Default Ordering</Label>
          <Input value={defaultOrdering} onChange={(e) => setDefaultOrdering(e.target.value)} placeholder="e.g. displayOrder asc" />
        </div>

        <div className="space-y-1.5">
          <Label>Default Categories</Label>
          <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-3">
            {data.categories.map((c) => (
              <label key={c.id} className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" checked={defaultCategories.includes(c.id)} onChange={() => toggleCat(c.id)} />
                {c.name}
              </label>
            ))}
            {data.categories.length === 0 && <span className="text-xs text-muted-foreground">No categories yet.</span>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Default Journey (section keys)</Label>
          <Input
            value={defaultJourney.join(", ")}
            onChange={(e) => setDefaultJourney(e.target.value.split(",").map((x) => x.trim()).filter(Boolean))}
            placeholder="comma separated section keys"
          />
        </div>

      </div>
    </div>
  )
}
