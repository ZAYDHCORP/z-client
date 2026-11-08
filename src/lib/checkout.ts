import { api } from "@/lib/axios"
import { API } from "@/lib/constants"

/** What the server returns when an order is created (amount is in the order's own currency units). */
export interface CheckoutOrder {
  orderId: string
  amount: number
  currency: string
  gatewayKeyId: string
}

export type CheckoutResult =
  | { status: "success"; paymentId: string; orderId: string; signature?: string }
  | { status: "failed"; reason: string; code?: string; paymentId?: string }
  | { status: "dismissed" }

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature?: string
}
interface RazorpayFailure {
  error: { code?: string; description?: string; reason?: string; metadata?: { payment_id?: string } }
}
interface RazorpayInstance {
  open: () => void
  on: (event: "payment.failed", cb: (r: RazorpayFailure) => void) => void
}
type RazorpayCtor = new (options: Record<string, unknown>) => RazorpayInstance

declare global {
  interface Window {
    Razorpay?: RazorpayCtor
  }
}

/** Asks the server to create a payment order for a plan (optionally in another currency). */
export async function createOrder(planKey: string, currency?: string): Promise<CheckoutOrder> {
  const res = await api.post(API.CHECKOUT.CREATE_ORDER, currency && currency !== "INR" ? { planKey, currency } : { planKey })
  const d = (res.data?.data ?? res.data) as Partial<CheckoutOrder>
  if (!d?.orderId || !d.gatewayKeyId) throw { message: "The server did not return a valid order." }
  return { orderId: d.orderId, amount: Number(d.amount), currency: String(d.currency ?? "INR"), gatewayKeyId: d.gatewayKeyId }
}

/** Refreshes and returns the server's exchange rates (currency code → rate). */
export async function refreshRates(): Promise<Record<string, number>> {
  const res = await api.post(API.CHECKOUT.REFRESH_RATES)
  const d = res.data?.data ?? res.data
  return (d?.rates ?? {}) as Record<string, number>
}

let scriptPromise: Promise<RazorpayCtor> | null = null

/** Loads Razorpay's checkout script once. */
export function loadRazorpay(): Promise<RazorpayCtor> {
  if (window.Razorpay) return Promise.resolve(window.Razorpay)
  if (!scriptPromise) {
    scriptPromise = new Promise<RazorpayCtor>((resolve, reject) => {
      const el = document.createElement("script")
      el.src = "https://checkout.razorpay.com/v1/checkout.js"
      el.async = true
      el.onload = () => (window.Razorpay ? resolve(window.Razorpay) : reject(new Error("Razorpay did not start.")))
      el.onerror = () => {
        scriptPromise = null
        reject(new Error("Could not load the payment window. Check your connection and try again."))
      }
      document.body.appendChild(el)
    })
  }
  return scriptPromise
}

/**
 * Opens Razorpay's payment window for an order the server already created.
 * Resolves once the customer pays, the payment fails and the window is closed,
 * or the window is dismissed. The membership itself is activated by the
 * server (webhook) — this only reports what happened in the window.
 */
export async function openCheckout({
  order,
  description,
  prefill,
}: {
  order: CheckoutOrder
  description: string
  prefill?: { name?: string; email?: string }
}): Promise<CheckoutResult> {
  const Razorpay = await loadRazorpay()
  return new Promise<CheckoutResult>((resolve) => {
    let lastFailure: Extract<CheckoutResult, { status: "failed" }> | null = null
    const rzp = new Razorpay({
      key: order.gatewayKeyId,
      order_id: order.orderId, // the order carries the amount and currency
      name: "• Gate",
      description,
      prefill,
      theme: { color: "#9a6d35" },
      handler: (r: RazorpayResponse) =>
        resolve({
          status: "success",
          paymentId: r.razorpay_payment_id,
          orderId: r.razorpay_order_id,
          signature: r.razorpay_signature,
        }),
      modal: {
        ondismiss: () => resolve(lastFailure ?? { status: "dismissed" }),
      },
    })
    // A failed attempt leaves the window open so the customer can retry; remember why.
    rzp.on("payment.failed", (r) => {
      lastFailure = {
        status: "failed",
        reason: r.error?.description || r.error?.reason || "The payment could not be completed.",
        code: r.error?.code,
        paymentId: r.error?.metadata?.payment_id,
      }
    })
    rzp.open()
  })
}
