/**
 * Edge-compatible admin JWT utilities.
 * Uses the Web Crypto API so this module is safe to import from middleware.
 */

export const ADMIN_COOKIE_NAME = "gate_admin_token";

type AdminPayload = {
  sub?: string;
  role?: string;
  exp?: number;
};

/**
 * Verifies an admin JWT signed with HS256 using ADMIN_JWT_SECRET.
 * Returns the decoded payload on success, null on any failure.
 */
export async function verifyAdminToken(token: string): Promise<AdminPayload | null> {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sigB64] = parts;

    // Import the HMAC key
    const keyData = new TextEncoder().encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    // Verify the signature
    const sigBytes = base64UrlDecode(sigB64);
    const message = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const valid = await crypto.subtle.verify("HMAC", cryptoKey, sigBytes.buffer as ArrayBuffer, message);
    if (!valid) return null;

    // Decode payload
    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(payloadB64)),
    ) as AdminPayload;

    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

    // Must have admin role
    if (payload.role !== "admin") return null;

    return payload;
  } catch {
    return null;
  }
}

function base64UrlDecode(str: string): Uint8Array {
  // Convert base64url → base64
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    str.length + ((4 - (str.length % 4)) % 4),
    "=",
  );
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
