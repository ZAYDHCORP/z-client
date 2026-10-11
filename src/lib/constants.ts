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

    // Memberships — plans are editable; payments are read-only reporting.
    // (Checkout and webhook endpoints are intentionally NOT defined here —
    // payment flows must never be reachable from the admin browser.)
    MEMBERSHIP_PLANS: `${BASE}/admin/memberships/plans`,
    MEMBERSHIP_PLAN_BY_ID: (id: string) => `${BASE}/admin/memberships/plans/${id}`,
    MEMBERSHIP_PAYMENTS: `${BASE}/admin/memberships/payments`,
    MEMBERSHIP_PAYMENTS_STATS: `${BASE}/admin/memberships/payments/stats`,

    // Theocentric & Doxology. The backend mounts Phase 1 taxonomy under a
    // different prefix (`theocentricTaxonomy`) than the rest of the module
    // (`theocentric`) — the full-test-suite doc lists everything under
    // `theocentric`, but the deployed routes differ.
    THEO_CATEGORIES: `${BASE}/admin/theocentricTaxonomy/categories`,
    THEO_CATEGORY_BY_ID: (id: string) => `${BASE}/admin/theocentricTaxonomy/categories/${id}`,
    THEO_SUBCATEGORIES: `${BASE}/admin/theocentricTaxonomy/subcategories`,
    THEO_SUBCATEGORY_BY_ID: (id: string) => `${BASE}/admin/theocentricTaxonomy/subcategories/${id}`,
    THEO_TAGS: `${BASE}/admin/theocentricTaxonomy/tags`,
    THEO_TAG_BY_ID: (id: string) => `${BASE}/admin/theocentricTaxonomy/tags/${id}`,
    THEO_REFERENCES: `${BASE}/admin/theocentricTaxonomy/references`,
    THEO_REFERENCE_BY_ID: (id: string) => `${BASE}/admin/theocentricTaxonomy/references/${id}`,
    THEO_CONTENT: `${BASE}/admin/theocentric/content`,
    THEO_CONTENT_BY_ID: (id: string) => `${BASE}/admin/theocentric/content/${id}`,
    THEO_CONTENT_STATUS: (id: string) => `${BASE}/admin/theocentric/content/${id}/status`,
    THEO_CONTENT_VERIFICATION: (id: string) => `${BASE}/admin/theocentric/content/${id}/verification`,
    THEO_CONTENT_FEATURED: (id: string) => `${BASE}/admin/theocentric/content/${id}/featured`,
    THEO_CONTENT_DUPLICATE: (id: string) => `${BASE}/admin/theocentric/content/${id}/duplicate`,
    THEO_CONTENT_REORDER: `${BASE}/admin/theocentric/content/reorder`,
    THEO_COLLECTIONS: `${BASE}/admin/theocentric/collections`,
    THEO_COLLECTION_BY_ID: (id: string) => `${BASE}/admin/theocentric/collections/${id}`,
    THEO_MILESTONES: `${BASE}/admin/theocentric/milestones`,
    THEO_MILESTONE_BY_ID: (id: string) => `${BASE}/admin/theocentric/milestones/${id}`,
    THEO_JOURNEY: `${BASE}/admin/theocentric/journey`,
    THEO_AFTER_SALAH: `${BASE}/admin/theocentric/after-salah`,
    THEO_SETTINGS: `${BASE}/admin/theocentric/settings`,
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
