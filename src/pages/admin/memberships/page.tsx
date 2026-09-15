import { toast } from "sonner"
import { IndianRupee, TrendingUp, Users, RefreshCw } from "lucide-react"
import { PageHeader, StatCard } from "@/components/gate/ui"
import { useGate } from "@/lib/gate/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function MembershipsPage() {
  const { data, updatePlan } = useGate()
  const plans = data.membershipPlans

  const subs = data.payments.filter((p) => p.status === "success" && p.membershipType === "subscription").length
  const lifetime = data.payments.filter((p) => p.membershipType === "lifetime" && p.status === "success").length
  const renewals = data.payments.filter((p) => p.status === "success").length

  return (
    <div>
      <PageHeader
        title="Memberships"
        description="Manage the unified Gate Membership — six subscription plans plus the one-time Lifetime offer."
        actions={<Button variant="outline" onClick={() => toast.success("Exchange rates refreshed")}>Refresh Rates</Button>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active Subscriptions" value={subs} icon={<Users className="h-4 w-4" />} accent="#10b981" />
        <StatCard label="Lifetime Members" value={lifetime} icon={<TrendingUp className="h-4 w-4" />} accent="#8b5cf6" />
        <StatCard label="Renewals" value={renewals} icon={<RefreshCw className="h-4 w-4" />} accent="#0ea5e9" />
        <StatCard label="Currency" value="INR → 150+" icon={<IndianRupee className="h-4 w-4" />} accent="#f59e0b" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.id} className={p.popular ? "ring-2 ring-primary" : ""}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">{p.name}</CardTitle>
                <p className="text-xs text-muted-foreground capitalize">{p.durationLabel}</p>
              </div>
              {p.popular && <Badge>Popular</Badge>}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end gap-1">
                <IndianRupee className="mb-1 h-5 w-5" />
                <span className="text-3xl font-semibold tracking-tight">{p.priceINR.toLocaleString()}</span>
                {p.durationLabel !== "One-time" && <span className="mb-1 text-sm text-muted-foreground">/ {p.durationLabel.toLowerCase()}</span>}
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {p.benefits.map((b) => (
                  <li key={b} className="flex gap-2"><span className="text-primary">✓</span>{b}</li>
                ))}
              </ul>
              <div className="space-y-1.5">
                <Label className="text-xs">Price (INR)</Label>
                <Input
                  type="number"
                  value={p.priceINR}
                  onChange={(e) => updatePlan(p.id, { priceINR: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-2">
                <span className="text-sm">Plan active</span>
                <Switch checked={p.active} onCheckedChange={(v) => { updatePlan(p.id, { active: v }); toast.success(`${p.name} ${v ? "activated" : "deactivated"}`) }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Multi-currency & Entitlements</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          All canonical prices are stored in INR and converted at the server using live exchange rates.
          Historical transactions retain the currency and rate captured at checkout. Every plan unlocks identical
          premium benefits across IPN, IGC, IFR and ISR — only duration and price differ. Lifetime is a one-time
          permanent entitlement, never a recurring subscription.
        </CardContent>
      </Card>
    </div>
  )
}
