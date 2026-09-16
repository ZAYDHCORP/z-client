import { useEffect } from "react"
import { Lock, ShieldCheck, KeyRound, Activity } from "lucide-react"
import { toast } from "sonner"
import { PageHeader, StatusBadge } from "@/components/gate/ui"
import { useGate } from "@/lib/gate/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function SecurityPage() {
  const { data, updateSettings, ensureAuditLogsLoaded } = useGate()

  useEffect(() => {
    ensureAuditLogsLoaded()
  }, [ensureAuditLogsLoaded])

  const s = data.settings

  return (
    <div>
      <PageHeader
        title="Security"
        description="Authentication policy, rate limiting, data protection and live system integrity monitoring."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Lock className="h-4 w-4" /> Access Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Require Two-Factor Auth</p>
                <p className="text-xs text-muted-foreground">Enforce 2FA for all admins</p>
              </div>
              <Switch checked={s.twoFactorRequired} onCheckedChange={(v) => { updateSettings({ twoFactorRequired: v }); toast.success("2FA policy updated") }} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">GDPR Consent Banner</p>
                <p className="text-xs text-muted-foreground">Show consent to EU visitors</p>
              </div>
              <Switch checked={s.gdprConsent} onCheckedChange={(v) => { updateSettings({ gdprConsent: v }); toast.success("GDPR setting updated") }} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">Take the storefront offline</p>
              </div>
              <Switch checked={s.maintenanceMode} onCheckedChange={(v) => { updateSettings({ maintenanceMode: v }); toast.success(v ? "Maintenance mode ON" : "Maintenance mode OFF") }} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">API Rate Limit (requests / min)</Label>
              <Input
                type="number"
                value={s.rateLimitPerMin}
                onChange={(e) => updateSettings({ rateLimitPerMin: Number(e.target.value) })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4" /> System Integrity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.systemHealth.map((h) => (
              <div key={h.name} className="flex items-center justify-between rounded-lg border border-border p-2.5">
                <div>
                  <p className="text-sm font-medium">{h.name}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{h.detail}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={h.status} />
                  <p className="mt-1 text-xs text-muted-foreground">{h.latency} ms</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 rounded-lg border border-border p-2.5">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Active API keys</span>
              <span className="ml-auto text-sm font-medium">{data.apiKeys.filter((k) => k.status === "active").length}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border p-2.5">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Audit events (30d)</span>
              <span className="ml-auto text-sm font-medium">{data.auditLogs.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle className="text-base">Recent Security Events</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.auditLogs.slice(0, 8).map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-sm">{a.actor}</TableCell>
                  <TableCell className="text-sm">{a.action}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.resource}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.ip}</TableCell>
                  <TableCell><StatusBadge status={a.result} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(a.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
