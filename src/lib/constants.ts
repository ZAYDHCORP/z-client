const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
console.log("BASE", BASE);
export const API = {
  AUTH: {
    LOGIN:            `${BASE}/auth/login`,
    REGISTER:         `${BASE}/auth/register`,
    LOGOUT:           `${BASE}/auth/logout`,
    FORGOT_PASS:      `${BASE}/auth/forgot-password`,
    RESET_PASS:       `${BASE}/auth/reset-password`,
    REFRESH_TOKEN:    `${BASE}/auth/refresh-token`,
    GOOGLE_LOGIN:     `${BASE}/auth/google`,
    GOOGLE_CALLBACK:  `${BASE}/auth/google/callback`,
    PROFILE:          `${BASE}/auth/profile`,
    SETUP_2FA:        `${BASE}/auth/2fa/setup`,
    VERIFY_SETUP_2FA: `${BASE}/auth/2fa/verify-setup`,
    VERIFY_LOGIN_2FA: `${BASE}/auth/2fa/verify-login`,
    DISABLE_2FA:      `${BASE}/auth/2fa/disable`,
  },
  ADMIN: {
    LOGIN:            `${BASE}/admin/login`,
  },
  PODCASTS:           `${BASE}/podcasts`,
} as const;


console.log("DISABLE", API.AUTH.DISABLE_2FA);

export const PUBLIC_ENDPOINTS = [
  API.AUTH.LOGIN,
  API.AUTH.REGISTER,
  API.AUTH.FORGOT_PASS,
  API.AUTH.GOOGLE_LOGIN,
  API.AUTH.GOOGLE_CALLBACK,
  API.AUTH.VERIFY_LOGIN_2FA,
  API.ADMIN.LOGIN,
  API.PODCASTS,
];
