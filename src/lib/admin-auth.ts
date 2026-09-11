// Private, non-public admin session helper.
// NOTE: This is a frontend prototype. Real production deployments MUST enforce
// authentication and role-based access control on the server. The admin area is
// intentionally NOT linked from any public page, nav, footer or menu.

const SESSION_KEY = "gate_admin_session_v1";

export type AdminSession = { email: string; role: "admin"; issuedAt: number };

export function setAdminSession(email: string): void {
  if (typeof window === "undefined") return;
  const session: AdminSession = { email, role: "admin", issuedAt: Date.now() };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    if (parsed && parsed.role === "admin") return parsed;
    return null;
  } catch {
    return null;
  }
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function isAdmin(): boolean {
  return getAdminSession() !== null;
}
