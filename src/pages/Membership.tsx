import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { AlertTriangle, Check, CheckCircle2, Loader2, ShieldCheck, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SiteHeader } from "@/components/home/SiteHeader"
import { getCachedUser } from "@/lib/client-auth"
import { createOrder, openCheckout, refreshRates, type CheckoutOrder, type CheckoutResult } from "@/lib/checkout"

/**
 * The plans customers can buy. `key` is the planKey the server expects; prices are
 * deliberately NOT hard-coded here — the real amount comes back from the server when
 * the order is created and is shown on the "Review order" step before any payment.
 */
const PLANS = [
  { key: "monthly", name: "Monthly", period: "Billed every month" },
  { key: "one_year", name: "1 Year", period: "Billed yearly", popular: true },
  { key: "three_years", name: "3 Years", period: "One payment for 3 years" },
  { key: "five_years", name: "5 Years", period: "One payment for 5 years" },
  { key: "seven_years", name: "7 Years", period: "One payment for 7 years" },
  { key: "nine_years", name: "9 Years", period: "One payment for 9 years" },
  { key: "lifetime", name: "Lifetime", period: "One-time, never expires" },
] as const

const BENEFITS = ["Every platform: IPN, IGC, IFR and ISR", "All premium books, reports and podcasts", "New releases as they publish"]
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SAR", "CAD", "AUD"]

const money = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount)
  } catch {
    return `${amount} ${currency}`
  }
}

type Plan = (typeof PLANS)[number]
interface LogLine {
  at: string
  what: string
  data?: unknown
}

export default function MembershipPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const user = getCachedUser()
  const debug = params.get("debug") === "1"

  const [currency, setCurrency] = useState("INR")
  const [busyPlan, setBusyPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [review, setReview] = useState<{ plan: Plan; order: CheckoutOrder } | null>(null)
  const [paying, setPaying] = useState(false)
  const [result, setResult] = useState<{ plan: Plan; order: CheckoutOrder; outcome: CheckoutResult } | null>(null)
  const [log, setLog] = useState<LogLine[]>([])
  const autoStarted = useRef(false)

  const note = useCallback((what: string, data?: unknown) => {
    setLog((l) => [...l, { at: new Date().toLocaleTimeString(), what, data }])
  }, [])

  const begin = useCallback(
    async (plan: Plan) => {
      if (!getCachedUser()) {
        navigate(`/signin?callbackUrl=${encodeURIComponent(`/membership?plan=${plan.key}`)}`)
        return
      }
      setError(null)
      setBusyPlan(plan.key)
      note("create-order → request", { planKey: plan.key, currency })
      try {
        const order = await createOrder(plan.key, currency)
        note("create-order → response", order)
        setReview({ plan, order })
      } catch (err) {
        const e = err as { status?: number; message?: string }
        note("create-order → error", e)
        setError(
          e?.status === 500
            ? `${currency} isn't supported for this payment. Try INR.`
            : e?.message || "Could not start the payment. Please try again.",
        )
      } finally {
        setBusyPlan(null)
      }
    },
    [currency, navigate, note],
  )

  // Arrive from the home page button (or after signing in) with ?plan=lifetime.
  useEffect(() => {
    const wanted = params.get("plan")
    if (!wanted || autoStarted.current || !getCachedUser()) return
    const plan = PLANS.find((p) => p.key === wanted)
    if (plan) {
      autoStarted.current = true
      void begin(plan)
    }
  }, [params, begin])

  const pay = async () => {
    if (!review) return
    const { plan, order } = review
    setPaying(true)
    note("razorpay → opening", { orderId: order.orderId })
    // Close our modal first: a Radix dialog traps focus and blocks pointer events on
    // everything outside it, which would make Razorpay's inputs impossible to type in.
    setReview(null)
    await new Promise((r) => setTimeout(r, 350))
    document.body.style.pointerEvents = ""
    try {
      const outcome = await openCheckout({
        order,
        description: `${plan.name} membership`,
        prefill: { name: user?.name ?? undefined, email: user?.email ?? undefined },
      })
      note("razorpay → result", outcome)
      if (outcome.status === "dismissed") {
        setReview({ plan, order }) // window closed without paying — bring the review back
      } else {
        setResult({ plan, order, outcome })
      }
    } catch (err) {
      note("razorpay → error", { message: (err as Error).message })
      setError((err as Error).message)
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-4xl font-semibold tracking-tight">Membership</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              One membership unlocks everything across IPN, IGC, IFR and ISR. Pick a plan, review the amount, then pay securely with Razorpay.
            </p>
          </div>
          <div className="w-full sm:w-44">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Pay in</p>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {user?.role === "admin" && (
          <p className="mb-6 flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            You're signed in as an admin. A purchase is recorded against the account that makes it, so use a normal customer account to test.
          </p>
        )}
        {error && (
          <p role="alert" className="mb-6 flex items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            {error}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <Card key={plan.key} className={`gap-4 py-5 ${"popular" in plan && plan.popular ? "ring-2 ring-primary" : ""}`}>
              <CardContent className="flex h-full flex-col gap-4 px-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">{plan.period}</p>
                  </div>
                  {"popular" in plan && plan.popular && (
                    <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">Popular</span>
                  )}
                </div>
                <ul className="flex-1 space-y-2 text-sm text-muted-foreground">
                  {BENEFITS.map((b) => (
                    <li key={b} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{b}</li>
                  ))}
                </ul>
                <Button disabled={busyPlan !== null} onClick={() => begin(plan)}>
                  {busyPlan === plan.key ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                  {user ? "Choose plan" : "Sign in to choose"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4" /> Payments are processed by Razorpay. Your card details never touch our servers.
        </p>

        {debug && (
          <section className="mt-10 rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Checkout log (debug)</h2>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    note("refresh-rates → request")
                    try {
                      const rates = await refreshRates()
                      note("refresh-rates → response", { currencies: Object.keys(rates).length, sample: Object.entries(rates).slice(0, 6) })
                    } catch (err) {
                      note("refresh-rates → error", err)
                    }
                  }}
                >
                  Refresh rates
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setLog([])}>Clear</Button>
              </div>
            </div>
            <pre className="max-h-72 overflow-auto rounded-lg bg-muted p-3 text-[11px] leading-relaxed">
              {log.length === 0 ? "Nothing yet." : log.map((l) => `${l.at}  ${l.what}${l.data !== undefined ? "\n    " + JSON.stringify(l.data) : ""}`).join("\n")}
            </pre>
          </section>
        )}
      </main>

      {/* Review order */}
      <Dialog open={!!review} onOpenChange={(open) => !open && !paying && setReview(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review your order</DialogTitle>
            <DialogDescription>Check the details, then continue to the secure payment window.</DialogDescription>
          </DialogHeader>
          {review && (
            <dl className="space-y-3 rounded-xl border border-border p-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Plan</dt><dd className="font-medium">{review.plan.name} membership</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Amount</dt><dd className="text-lg font-semibold">{money(review.order.amount, review.order.currency)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Order</dt><dd className="font-mono text-xs">{review.order.orderId}</dd></div>
            </dl>
          )}
          <DialogFooter>
            <Button variant="outline" disabled={paying} onClick={() => setReview(null)}>Cancel</Button>
            <Button disabled={paying} onClick={pay}>
              {paying ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
              Pay securely
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result */}
      <Dialog open={!!result} onOpenChange={(open) => !open && setResult(null)}>
        <DialogContent className="sm:max-w-md">
          {result?.outcome.status === "success" && (
            <>
              <DialogHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500"><CheckCircle2 className="h-7 w-7" /></div>
                <DialogTitle>Payment received</DialogTitle>
                <DialogDescription>
                  Thank you. Your {result.plan.name} membership activates as soon as the payment is confirmed — this usually takes a few seconds.
                </DialogDescription>
              </DialogHeader>
              <dl className="space-y-2 rounded-xl border border-border p-4 text-xs">
                <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Payment ID</dt><dd className="font-mono">{result.outcome.paymentId}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Order</dt><dd className="font-mono">{result.outcome.orderId}</dd></div>
              </dl>
              <DialogFooter>
                <Button onClick={() => navigate("/account")}>Go to my account</Button>
              </DialogFooter>
            </>
          )}
          {result?.outcome.status === "failed" && (
            <>
              <DialogHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/15 text-rose-500"><XCircle className="h-7 w-7" /></div>
                <DialogTitle>Payment didn't go through</DialogTitle>
                <DialogDescription>{result.outcome.reason} You have not been charged for a failed payment.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setResult(null)}>Close</Button>
                <Button
                  onClick={() => {
                    const r = result
                    setResult(null)
                    setReview({ plan: r.plan, order: r.order })
                  }}
                >
                  Try again
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
