const PROFILE_CACHE_KEY = "gate_user_profile_v1";
const PENDING_2FA_TOKEN_KEY = "gate_pending_2fa_token_v1";

export type ClientUser = {
  id?: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role?: string | null;
  membership?: string | null;
  provider?: string | null;
  emailVerified?: string | Date | null;
  createdAt?: string | Date | null;
  twoFactorEnabled?: boolean;
};

export function getCachedUser(): ClientUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_CACHE_KEY);
    return raw ? (JSON.parse(raw) as ClientUser) : null;
  } catch {
    return null;
  }
}

export function cacheUser(user: ClientUser | null): void {
  if (typeof window === "undefined") return;
  if (!user) {
    window.localStorage.removeItem(PROFILE_CACHE_KEY);
    return;
  }
  window.localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(user));
}

export function cachePendingTwoFactorToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (!token) {
    window.localStorage.removeItem(PENDING_2FA_TOKEN_KEY);
    return;
  }
  window.localStorage.setItem(PENDING_2FA_TOKEN_KEY, token);
}

export function getPendingTwoFactorToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(PENDING_2FA_TOKEN_KEY);
}

export function logoutCurrentUser(): void {
  cacheUser(null);
  cachePendingTwoFactorToken(null);
}

/**
 * Fetches the current user's profile from the backend (cookie-authenticated),
 * updates the local cache, and returns the user.
 * Throws on network / auth failure so callers can fall back to getCachedUser().
 */
export async function fetchCurrentUser(): Promise<ClientUser> {
  // Lazy-import to avoid circular deps and keep this file framework-agnostic
  const { api } = await import("@/lib/axios");
  const { API } = await import("@/lib/constants");

  const res = await api.get(API.AUTH.PROFILE);
  const user: ClientUser = res.data?.data ?? res.data;
  cacheUser(user);
  return user;
}
