import type { MembershipPlan, PaymentRecord, PaymentStats } from "./types"

type Raw = Record<string, unknown>

const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : v == null ? fallback : String(v))
const num = (v: unknown, fallback = 0) => {
  const n = typeof v === "number" ? v : Number(v)
  return Number.isFinite(n) ? n : fallback
}
const obj = (v: unknown): Raw => (v && typeof v === "object" ? (v as Raw) : {})

/**
 * Plans come back with `priceINR` (response) but are updated with `priceInr`
 * (request) — the backend's own casing quirk, handled here and in the store.
 */
export function normalizePlan(raw: Raw): MembershipPlan {
  const name = str(raw.name ?? raw.title ?? raw.key ?? raw.planKey)
  return {
    id: str(raw.id),
    name,
    durationLabel: str(raw.durationLabel ?? raw.duration ?? raw.label),
    priceINR: num(raw.priceINR ?? raw.priceInr ?? raw.price),
    popular: Boolean(raw.popular),
    benefits: Array.isArray(raw.benefits) ? (raw.benefits as unknown[]).map(String) : [],
    active: raw.active !== false,
    entitlements: str(raw.entitlements),
  }
}

export function normalizePayment(raw: Raw): PaymentRecord {
  const user = obj(raw.user)
  const plan = obj(raw.plan)
  const planName = str(plan.name ?? raw.planName ?? (typeof raw.plan === "string" ? raw.plan : ""))
  const status = str(raw.status, "pending").toLowerCase()
  const type = str(raw.membershipType ?? plan.type ?? raw.membership_type).toLowerCase()
  return {
    id: str(raw.id),
    userId: str(raw.userId ?? raw.user_id ?? user.id),
    userName: str(raw.userName ?? user.name ?? raw.user_name, "—"),
    plan: planName || "—",
    amount: num(raw.amount),
    currency: str(raw.currency, "INR"),
    status: (["success", "pending", "failed", "refunded", "cancelled"].includes(status)
      ? status
      : "pending") as PaymentRecord["status"],
    method: str(raw.method, "—"),
    provider: str(raw.provider, "razorpay"),
    transactionRef: str(raw.transactionRef ?? raw.transaction_ref ?? raw.orderId ?? raw.id),
    createdAt: str(raw.createdAt ?? raw.created_at, new Date().toISOString()),
    membershipType: type.includes("life") || /lifetime/i.test(planName) ? "lifetime" : "subscription",
  }
}

export function normalizePaymentStats(raw: unknown): PaymentStats {
  const r = obj(obj(raw).stats ?? raw)
  return {
    totalRevenue: num(r.totalRevenue),
    successful: num(r.successful),
    pending: num(r.pending),
    failed: num(r.failed),
    refunded: num(r.refunded),
  }
}
