import { Clock } from "lucide-react"
import { PageHeader, SectionTitle } from "@/components/gate/ui"
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
import { useDoxology } from "@/lib/gate/doxology/store"
import { ALARM_DEFS } from "@/lib/gate/doxology/types"

export default function DoxologySettingsPage() {
  const { data, updateDefaults } = useDoxology()

  return (
    <div>
      <PageHeader
        title="Alarm Settings"
        description="Configure default reminder timings applied to new users and used by 'Reset to default'. 30-minute pre-Salah alerts apply to the five Fard prayers."
      />

      <div className="space-y-3">
        {ALARM_DEFS.map((d) => {
          const cfg = data.defaults.settings[d.type]
          return (
            <div key={d.type} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex w-40 items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{d.label}</span>
                </div>
                <label className="flex items-center gap-1.5 text-sm">
                  <Switch checked={cfg.enabled} onCheckedChange={(v) => updateDefaults(d.type, { enabled: v })} />
                  {cfg.enabled ? "On" : "Off"}
                </label>
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs">Default time</Label>
                  <Input
                    type="time"
                    value={cfg.time}
                    onChange={(e) => updateDefaults(d.type, { time: e.target.value })}
                    className="w-32"
                  />
                </div>
                {d.salah && (
                  <label className="flex items-center gap-1.5 text-sm">
                    <Switch checked={cfg.preAlert30} onCheckedChange={(v) => updateDefaults(d.type, { preAlert30: v })} />
                    30-min pre-alert
                  </label>
                )}
                <div className="ml-auto flex items-center gap-1.5">
                  <Label className="text-xs">Default audio</Label>
                  <Select
                    value={cfg.audioId ?? "none"}
                    onValueChange={(v) => updateDefaults(d.type, { audioId: v === "none" ? null : v })}
                  >
                    <SelectTrigger className="w-44"><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {data.audio.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{d.note}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-5 rounded-lg border border-border bg-accent/40 px-4 py-3 text-xs text-muted-foreground">
        {data.defaults.notes}
      </div>
    </div>
  )
}
