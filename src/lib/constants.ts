const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const API = {
  AUTH: {
    LOGIN: `${BASE}/auth/login`,
    REGISTER: `${BASE}/auth/register`,
    LOGOUT: `${BASE}/auth/logout`,
    FORGOT_PASS: `${BASE}/auth/forgot-password`,
    RESET_PASS: `${BASE}/auth/reset-password`,
    REFRESH_TOKEN: `${BASE}/auth/refresh-token`,
    GOOGLE_LOGIN: `${BASE}/auth/google`,
    GOOGLE_CALLBACK: `${BASE}/auth/google/callback`,
    PROFILE: `${BASE}/auth/profile`,
    SETUP_2FA: `${BASE}/auth/2fa/setup`,
    VERIFY_SETUP_2FA: `${BASE}/auth/2fa/verify-setup`,
    VERIFY_LOGIN_2FA: `${BASE}/auth/2fa/verify-login`,
    DISABLE_2FA: `${BASE}/auth/2fa/disable`,
  },
  ADMIN: {
    LOGIN: `${BASE}/auth/login`,
    PLATFORMS: `${BASE}/admin/platforms`,
    PLATFORM_STATS: (id: string) => `${BASE}/admin/platforms/${id}/stats`,

    CONTENT: `${BASE}/admin/content`,
    CONTENT_BY_ID: (id: string) => `${BASE}/admin/content/${id}`,
    CONTENT_REORDER: `${BASE}/admin/content/reorder`,
    CONTENT_DUPLICATE: (id: string) => `${BASE}/admin/content/${id}/duplicate`,
    CONTENT_PIN: (id: string) => `${BASE}/admin/content/${id}/pin`,
    CONTENT_FEATURED: (id: string) => `${BASE}/admin/content/${id}/featured`,
    CONTENT_STATUS: (id: string) => `${BASE}/admin/content/${id}/status`,

    USERS: `${BASE}/admin/users`,
    USER_BY_ID: (id: string) => `${BASE}/admin/users/${id}`,

    AUDIT_LOGS: `${BASE}/admin/audit-logs`,

    TAXONOMY_TOPICS: `${BASE}/admin/taxonomy/topics`,
    TAXONOMY_TOPIC_BY_ID: (id: string) => `${BASE}/admin/taxonomy/topics/${id}`,
    TAXONOMY_REGIONS: `${BASE}/admin/taxonomy/regions`,
    TAXONOMY_REGION_BY_ID: (id: string) => `${BASE}/admin/taxonomy/regions/${id}`,
    TAXONOMY_TAGS: `${BASE}/admin/taxonomy/tags`,
    TAXONOMY_TAG_BY_ID: (id: string) => `${BASE}/admin/taxonomy/tags/${id}`,
    TAXONOMY_CATEGORIES: `${BASE}/admin/taxonomy/categories`,
    TAXONOMY_CATEGORY_BY_ID: (id: string) => `${BASE}/admin/taxonomy/categories/${id}`,

    OPERATIONS_RSS_FEEDS: `${BASE}/admin/operations/rss-feeds`,
    OPERATIONS_RSS_FEED_BY_ID: (id: string) => `${BASE}/admin/operations/rss-feeds/${id}`,
    OPERATIONS_RSS_FEED_SYNC: (id: string) => `${BASE}/admin/operations/rss-feeds/${id}/sync`,
    OPERATIONS_MEDIA: `${BASE}/admin/operations/media`,
    OPERATIONS_MEDIA_BY_ID: (id: string) => `${BASE}/admin/operations/media/${id}`,
    OPERATIONS_SOCIAL_LINKS: `${BASE}/admin/operations/social-links`,
    OPERATIONS_SOCIAL_LINK_BY_ID: (id: string) => `${BASE}/admin/operations/social-links/${id}`,
    OPERATIONS_SERVICES: `${BASE}/admin/operations/services`,
    OPERATIONS_SERVICE_BY_ID: (id: string) => `${BASE}/admin/operations/services/${id}`,
  },
  PODCASTS: `${BASE}/podcasts`,
} as const;

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
