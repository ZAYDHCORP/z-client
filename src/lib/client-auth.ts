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
 * Where to send a user immediately after they authenticate, based on their
 * role. There is only one sign-in form for both users and admins — the
 * backend's `role` on the account decides where they land.
 */
export function getPostLoginPath(user: ClientUser | null | undefined): string {
  return user?.role === "admin" ? "/admin" : "/account";
}

/**
 * Normalizes a user record out of an auth response payload.
 *
 * The backend is inconsistent about shape: some responses nest the account
 * under a `user` key, others (e.g. 2FA verify) return the account fields
 * directly on `data` (`{ id, firstName, lastName, email, role }`), with no
 * `name` field at all. Returns null when the payload has no recognizable
 * account in it (e.g. a "2FA required" response with only a pendingToken).
 */
export function parseUserResponse(payload: unknown): ClientUser | null {
  if (!payload || typeof payload !== "object") return null;
  const raw = payload as Record<string, unknown>;
  const source = (
    raw.user && typeof raw.user === "object" ? raw.user : raw
  ) as Record<string, unknown>;

  const email = typeof source.email === "string" ? source.email : undefined;
  const id = typeof source.id === "string" ? source.id : undefined;
  if (!email && !id) return null;

  const firstName = typeof source.firstName === "string" ? source.firstName : "";
  const lastName = typeof source.lastName === "string" ? source.lastName : "";
  const name =
    typeof source.name === "string" && source.name
      ? source.name
      : [firstName, lastName].filter(Boolean).join(" ") || null;

  return {
    id,
    email: email ?? null,
    name,
    image: typeof source.image === "string" ? source.image : null,
    role: typeof source.role === "string" ? source.role : "user",
    membership: typeof source.membership === "string" ? source.membership : null,
    provider: typeof source.provider === "string" ? source.provider : null,
    emailVerified: (source.emailVerified as string | Date | null | undefined) ?? null,
    createdAt: (source.createdAt as string | Date | null | undefined) ?? null,
    twoFactorEnabled:
      typeof source.twoFactorEnabled === "boolean" ? source.twoFactorEnabled : undefined,
  };
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
  const user = parseUserResponse(res.data?.data ?? res.data);
  if (!user) throw new Error("Profile response did not contain a user record.");
  cacheUser(user);
  return user;
}
