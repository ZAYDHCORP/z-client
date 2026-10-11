/**
 * Admin sections that are not connected to the backend yet — they run on
 * local, in-browser data only, so anything they "save" (a backup, a sent
 * notification, an API key…) is not real. They stay hidden in production and
 * are reachable only when `VITE_SHOW_UNCONNECTED=true` (local development).
 */
const UNCONNECTED_PATHS = [
  "/admin/notifications",
  "/admin/badges-streaks",
  "/admin/api-management",
  "/admin/backups",
  "/admin/security",
  "/admin/settings",
  "/admin/doxology",
]

export const SHOW_UNCONNECTED = import.meta.env.VITE_SHOW_UNCONNECTED === "true"

export function isUnconnectedPath(pathname: string): boolean {
  return UNCONNECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}
