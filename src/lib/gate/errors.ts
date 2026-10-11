import { toast } from "sonner"

/**
 * The backend's own explanation for a 4xx (409 slug clash, 400 business rule,
 * 422 validation…) — written for the admin and far more useful than a generic
 * "try again". Network/5xx failures return null so callers show generic text.
 */
export function describeError(err: unknown): string | null {
  if (!err || typeof err !== "object") return null
  const { status, message } = err as { status?: number; message?: unknown }
  if (typeof message !== "string" || !message) return null
  return status && status >= 400 && status < 500 ? message : null
}

export function reportError(action: string, err: unknown) {
  console.error(`Admin action failed (${action}):`, err)
  const reason = describeError(err)
  toast.error(reason ? `Could not ${action}: ${reason}` : `Could not ${action}. Please try again.`)
}
