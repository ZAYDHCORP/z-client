import { useEffect, useState } from "react"
import { toast } from "sonner"
import { IndianRupee, TrendingUp, Users, Layers } from "lucide-react"
import { PageHeader, StatCard } from "@/components/gate/ui"
import { useGate } from "@/lib/gate/store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/** Price field that only saves on blur / Enter — never a request per keystroke. */
function PriceInput({ value, onCommit }: { value: number; onCommit: (n: number) => void }) {
  const [draft, setDraft] = useState(String(value))
  useEffect(() => setDraft(String(value)), [value])

  const commit = () => {
    const n = Number(draft)
    if (!Number.isFinite(n) || n <= 0) {
      toast.error("Price must be a positive number")
      setDraft(String(value))
      return
    }
    if (n !== value) onCommit(n)
  }

  return (
    <Input
      type="number"
      min={1}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
    />
  )
}

export default function MembershipsPage() {
  const { data, updatePlan, ensurePlansLoaded, ensurePaymentsLoaded, isResourceLoading } = useGate()
  const plans = data.membershipPlans
  const stats = data.paymentStats

  useEffect(() => {
    ensurePlansLoaded()
    ensurePaymentsLoaded()
  }, [ensurePlansLoaded, ensurePaymentsLoaded])

  return (
    <div>
      <PageHeader
        title="Memberships"
        description="Plans and prices for Gate membership."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Active Plans" value={`${plans.filter((p) => p.active).length} / ${plans.length}`} icon={<Layers className="h-4 w-4" />} accent="#8b5cf6" />
        <StatCard label="Successful Payments" value={stats?.successful ?? "—"} icon={<Users className="h-4 w-4" />} accent="#10b981" />
        <StatCard label="Total Revenue" value={stats ? "₹" + stats.totalRevenue.toLocaleString("en-IN") : "—"} icon={<TrendingUp className="h-4 w-4" />} accent="#0ea5e9" />
        <StatCard label="Currency" value="INR → 150+" icon={<IndianRupee className="h-4 w-4" />} accent="#f59e0b" />
      </div>

      {plans.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          {isResourceLoading("membershipPlans") ? "Loading plans…" : "No plans found."}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.id} className={cn("h-full gap-4 py-4", p.popular && "ring-1 ring-gold/60", !p.active && "opacity-70")}>
            <div className="flex items-start justify-between gap-3 px-4">
              <div>
                <p className="font-serif text-xl font-semibold tracking-tight">{p.name}</p>
                <p className="mt-0.5 text-xs capitalize text-muted-foreground">{p.durationLabel}</p>
              </div>
              {p.popular && (
                <span className="rounded-full bg-gold px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-background">
                  Popular
                </span>
              )}
            </div>
            <CardContent className="flex flex-1 flex-col gap-4 p-0 px-4">
              <div className="flex items-end gap-1.5">
                <span className="mb-1.5 text-lg text-muted-foreground">₹</span>
                <span className="text-3xl leading-none font-semibold tracking-tight tabular-nums">{p.priceINR.toLocaleString("en-IN")}</span>
                {p.durationLabel && p.durationLabel !== "One-time" && (
                  <span className="mb-0.5 text-sm text-muted-foreground">/ {p.durationLabel.toLowerCase()}</span>
                )}
              </div>
              <ul className="flex-1 space-y-2 text-sm text-muted-foreground">
                {p.benefits.map((b) => (
                  <li key={b} className="flex gap-2.5"><span className="text-gold">✓</span>{b}</li>
                ))}
              </ul>
              <div className="space-y-3 border-t border-border/70 pt-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Price (INR)</Label>
                  <PriceInput value={p.priceINR} onCommit={(n) => { updatePlan(p.id, { priceINR: n }); toast.success(`${p.name} price set to ₹${n.toLocaleString("en-IN")}`) }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Plan active</span>
                  <Switch checked={p.active} onCheckedChange={(v) => { updatePlan(p.id, { active: v }); toast.success(`${p.name} ${v ? "activated" : "deactivated"}`) }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
