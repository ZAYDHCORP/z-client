import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Settings as SettingsIcon } from "lucide-react"
import { PageHeader } from "@/components/gate/ui"
import { useGate, type GateSettings } from "@/lib/gate/store"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  const { data, updateSettings } = useGate()
  const [form, setForm] = useState<GateSettings>(data.settings)

  useEffect(() => {
    setForm(data.settings)
  }, [data.settings])

  const set = (patch: Partial<GateSettings>) => setForm((f) => ({ ...f, ...patch }))
  const setSeo = (patch: Partial<GateSettings["seoDefaults"]>) =>
    setForm((f) => ({ ...f, seoDefaults: { ...f.seoDefaults, ...patch } }))

  function save() {
    updateSettings(form)
    toast.success("Settings saved")
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Global configuration for branding, appearance, commerce, SEO defaults, media and security policy."
        actions={<Button onClick={save}>Save Settings</Button>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Brand & Appearance</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Site Name</Label>
              <Input value={form.siteName} onChange={(e) => set({ siteName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tagline</Label>
              <Input value={form.tagline} onChange={(e) => set({ tagline: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Default Appearance</Label>
              <Select value={form.defaultAppearance} onValueChange={(v) => set({ defaultAppearance: v as GateSettings["defaultAppearance"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Default Currency</Label>
              <Select value={form.defaultCurrency} onValueChange={(v) => set({ defaultCurrency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="AED">AED (د.إ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Commerce & Automation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">RSS Auto-Sync</p>
                <p className="text-xs text-muted-foreground">Fetch new episodes automatically</p>
              </div>
              <Switch checked={form.rssAutoSync} onCheckedChange={(v) => set({ rssAutoSync: v })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">Take storefront offline</p>
              </div>
              <Switch checked={form.maintenanceMode} onCheckedChange={(v) => set({ maintenanceMode: v })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Exchange Rate API</Label>
              <Input value={form.exchangeRateAPI} onChange={(e) => set({ exchangeRateAPI: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">SEO / AEO Defaults</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">OG Type</Label>
                <Input value={form.seoDefaults.ogType} onChange={(e) => setSeo({ ogType: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Twitter Card</Label>
                <Select value={form.seoDefaults.twitterCard} onValueChange={(v) => setSeo({ twitterCard: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">summary</SelectItem>
                    <SelectItem value="summary_large_image">summary_large_image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Robots</Label>
              <Input value={form.seoDefaults.robots} onChange={(e) => setSeo({ robots: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Media & Security</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Max Upload Size (MB)</Label>
              <Input type="number" value={form.mediaMaxSizeMB} onChange={(e) => set({ mediaMaxSizeMB: Number(e.target.value) })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Allow Duplicate Media</p>
                <p className="text-xs text-muted-foreground">Permit identical files</p>
              </div>
              <Switch checked={form.allowDuplicateMedia} onCheckedChange={(v) => set({ allowDuplicateMedia: v })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">API Rate Limit (req/min)</Label>
              <Input type="number" value={form.rateLimitPerMin} onChange={(e) => set({ rateLimitPerMin: Number(e.target.value) })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Require 2FA</p>
                <p className="text-xs text-muted-foreground">Enforce for admins</p>
              </div>
              <Switch checked={form.twoFactorRequired} onCheckedChange={(v) => set({ twoFactorRequired: v })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">GDPR Consent</p>
                <p className="text-xs text-muted-foreground">Show consent banner</p>
              </div>
              <Switch checked={form.gdprConsent} onCheckedChange={(v) => set({ gdprConsent: v })} />
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <SettingsIcon className="h-3.5 w-3.5" /> Changes apply immediately and are persisted to your local admin session.
      </p>
    </div>
  )
}
