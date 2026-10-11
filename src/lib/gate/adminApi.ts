import { api } from "@/lib/axios";
import { API } from "@/lib/constants";

/**
 * The backend wraps every response as { success, message, statusCode, data }.
 * This pulls the actual payload out.
 */
function unwrap<T>(resData: unknown): T {
  if (
    resData &&
    typeof resData === "object" &&
    "data" in (resData as Record<string, unknown>)
  ) {
    return (resData as { data: T }).data;
  }
  return resData as T;
}

function toList<T>(payload: unknown, key: string): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj[key])) return obj[key] as T[];
    // Fall back to a generic guess if the confirmed key isn't there —
    // covers resources whose response shape hasn't been checked yet.
    for (const fallback of ["items", "results", "records", "data"]) {
      if (Array.isArray(obj[fallback])) return obj[fallback] as T[];
    }
    // Last resort: the only array in the payload is the list.
    const arrays = Object.values(obj).filter(Array.isArray);
    if (arrays.length === 1) return arrays[0] as T[];
  }
  return [];
}

interface Pagination {
  page?: number;
  totalPages?: number;
  total?: number;
}

function extractPagination(payload: unknown): Pagination {
  if (payload && typeof payload === "object") {
    const p = (payload as Record<string, unknown>).pagination;
    if (p && typeof p === "object") {
      const o = p as Record<string, unknown>;
      return {
        page: typeof o.page === "number" ? o.page : undefined,
        totalPages: typeof o.totalPages === "number" ? o.totalPages : undefined,
        total: typeof o.total === "number" ? o.total : undefined,
      };
    }
  }
  return {};
}


/** Fields the server owns — never sent back in a create/update body. */
const SERVER_OWNED = new Set([
  "id",
  "createdAt",
  "updatedAt",
  "uploadedAt",
  "usedBy",
  "hash",
  "isDuplicate",
  "duplicateOf",
  "lastSync",
  "newLastSync",
  "totalEpisodes",
]);

/**
 * Builds a request body from a UI record: drops server-owned fields and
 * empty strings (an empty "externalUrl" would fail the backend's URL check
 * with a 422 instead of simply being omitted). Updates keep non-URL empty
 * strings so a text field can still be cleared.
 */
function toBody(record: object, mode: "create" | "update"): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(record)) {
    if (SERVER_OWNED.has(k) || v === undefined) continue;
    if (v === "" && (mode === "create" || /url$/i.test(k))) continue;
    out[k] = v;
  }
  return out;
}

type Filters = Record<string, string | undefined>;

/** Appends non-empty filters as a query string (server-side filtering). */
function withFilters(url: string, filters: Filters): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== "" && v !== "all") qs.set(k, v);
  }
  const query = qs.toString();
  return query ? `${url}${url.includes("?") ? "&" : "?"}${query}` : url;
}

export interface Page<T> {
  items: T[];
  page: number;
  hasMore: boolean;
}

/** Default page size — matches the backend's own default, so we never pull more than one screenful at a time. */
const PAGE_SIZE = 25;

function withPage(url: string, page: number, limit: number): string {
  return `${url}${url.includes("?") ? "&" : "?"}page=${page}&limit=${limit}`;
}

async function list<T>(
  url: string,
  key: string,
  page = 1,
  limit = PAGE_SIZE,
): Promise<Page<T>> {
  const res = await api.get(withPage(url, page, limit));
  const unwrapped = unwrap<unknown>(res.data);
  const items = toList<T>(unwrapped, key);
  const { page: respPage, totalPages } = extractPagination(unwrapped);
  const hasMore =
    totalPages != null
      ? (respPage ?? page) < totalPages
      : items.length === limit;
  return { items, page: respPage ?? page, hasMore };
}

/** Total number of records matching a query, without pulling them (limit=1). */
async function count(url: string): Promise<number> {
  const res = await api.get(withPage(url, 1, 1));
  const unwrapped = unwrap<unknown>(res.data);
  const { total } = extractPagination(unwrapped);
  if (typeof total === "number") return total;
  if (unwrapped && typeof unwrapped === "object") {
    const flat = (unwrapped as Record<string, unknown>).total;
    if (typeof flat === "number") return flat;
  }
  return toList<unknown>(unwrapped, "").length;
}

async function getOne<T>(url: string): Promise<T> {
  const res = await api.get(url);
  return unwrap<T>(res.data);
}

async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.post(url, body ?? {});
  return unwrap<T>(res.data);
}

/**
 * Create responses should be the new record itself, but if the backend nests
 * it (`{ feed: {…} }`) pull it out — otherwise the optimistic client-side id
 * would never be swapped for the real one and later calls (sync, edit, delete)
 * would hit the server with an id it can't parse.
 */
function pickEntity<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const obj = payload as Record<string, unknown>;
    if (typeof obj.id === "string") return payload as T;
    const nested = Object.values(obj).filter(
      (v) => v && typeof v === "object" && !Array.isArray(v) && typeof (v as Record<string, unknown>).id === "string",
    );
    if (nested.length === 1) return nested[0] as T;
  }
  return payload as T;
}

async function createOne<T>(url: string, body?: unknown): Promise<T> {
  return pickEntity<T>(await post<unknown>(url, body));
}

async function put<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.put(url, body ?? {});
  return unwrap<T>(res.data);
}

async function patch<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.patch(url, body ?? {});
  return unwrap<T>(res.data);
}

async function remove<T = void>(url: string): Promise<T> {
  const res = await api.delete(url);
  return unwrap<T>(res.data);
}

export const adminApi = {
  platforms: {
    list: <T>(page = 1) => list<T>(API.ADMIN.PLATFORMS, "platforms", page),
    stats: <T>(id: string) => getOne<T>(API.ADMIN.PLATFORM_STATS(id)),
  },
  memberships: {
    plans: {
      // Seven fixed plans — one request is enough.
      list: <T>() => list<T>(API.ADMIN.MEMBERSHIP_PLANS, "plans", 1, 100),
      // Body must contain priceInr and/or active (server answers 422 otherwise).
      update: <T>(id: string, body: { priceInr?: number; active?: boolean }) =>
        patch<T>(API.ADMIN.MEMBERSHIP_PLAN_BY_ID(id), body),
    },
    // Read-only reporting. Checkout/webhooks are deliberately not exposed.
    payments: {
      list: <T>(
        page = 1,
        filters: { status?: string; userId?: string; q?: string } = {},
      ) => {
        const qs = new URLSearchParams();
        if (filters.status && filters.status !== "all") qs.set("status", filters.status);
        if (filters.userId) qs.set("userId", filters.userId);
        if (filters.q) qs.set("q", filters.q);
        const query = qs.toString();
        return list<T>(
          query ? `${API.ADMIN.MEMBERSHIP_PAYMENTS}?${query}` : API.ADMIN.MEMBERSHIP_PAYMENTS,
          "payments",
          page,
        );
      },
      stats: <T>() => getOne<T>(API.ADMIN.MEMBERSHIP_PAYMENTS_STATS),
    },
  },
  theocentric: {
    categories: {
      count: (filters: Filters = {}) => count(withFilters(API.ADMIN.THEO_CATEGORIES, filters)),
      list: <T>(page = 1, filters: Filters = {}) =>
        list<T>(withFilters(API.ADMIN.THEO_CATEGORIES, filters), "categories", page),
      create: <T>(body: unknown) => createOne<T>(API.ADMIN.THEO_CATEGORIES, body),
      update: <T>(id: string, body: unknown) => put<T>(API.ADMIN.THEO_CATEGORY_BY_ID(id), body),
      remove: (id: string) => remove(API.ADMIN.THEO_CATEGORY_BY_ID(id)),
    },
    subcategories: {
      count: (filters: Filters = {}) => count(withFilters(API.ADMIN.THEO_SUBCATEGORIES, filters)),
      list: <T>(page = 1, filters: Filters = {}) =>
        list<T>(withFilters(API.ADMIN.THEO_SUBCATEGORIES, filters), "subcategories", page),
      create: <T>(body: unknown) => createOne<T>(API.ADMIN.THEO_SUBCATEGORIES, body),
      update: <T>(id: string, body: unknown) => put<T>(API.ADMIN.THEO_SUBCATEGORY_BY_ID(id), body),
      remove: (id: string) => remove(API.ADMIN.THEO_SUBCATEGORY_BY_ID(id)),
    },
    tags: {
      count: (filters: Filters = {}) => count(withFilters(API.ADMIN.THEO_TAGS, filters)),
      list: <T>(page = 1, filters: Filters = {}) =>
        list<T>(withFilters(API.ADMIN.THEO_TAGS, filters), "tags", page),
      create: <T>(body: unknown) => createOne<T>(API.ADMIN.THEO_TAGS, body),
      update: <T>(id: string, body: unknown) => put<T>(API.ADMIN.THEO_TAG_BY_ID(id), body),
      remove: (id: string) => remove(API.ADMIN.THEO_TAG_BY_ID(id)),
    },
    references: {
      count: (filters: Filters = {}) => count(withFilters(API.ADMIN.THEO_REFERENCES, filters)),
      list: <T>(page = 1, filters: Filters = {}) =>
        list<T>(withFilters(API.ADMIN.THEO_REFERENCES, filters), "references", page),
      create: <T>(body: unknown) => createOne<T>(API.ADMIN.THEO_REFERENCES, body),
      update: <T>(id: string, body: unknown) => put<T>(API.ADMIN.THEO_REFERENCE_BY_ID(id), body),
      remove: (id: string) => remove(API.ADMIN.THEO_REFERENCE_BY_ID(id)),
    },
    collections: {
      count: (filters: Filters = {}) => count(withFilters(API.ADMIN.THEO_COLLECTIONS, filters)),
      list: <T>(page = 1, filters: Filters = {}) =>
        list<T>(withFilters(API.ADMIN.THEO_COLLECTIONS, filters), "collections", page),
      create: <T>(body: unknown) => createOne<T>(API.ADMIN.THEO_COLLECTIONS, body),
      update: <T>(id: string, body: unknown) => put<T>(API.ADMIN.THEO_COLLECTION_BY_ID(id), body),
      remove: (id: string) => remove(API.ADMIN.THEO_COLLECTION_BY_ID(id)),
    },
    milestones: {
      count: (filters: Filters = {}) => count(withFilters(API.ADMIN.THEO_MILESTONES, filters)),
      list: <T>(page = 1, filters: Filters = {}) =>
        list<T>(withFilters(API.ADMIN.THEO_MILESTONES, filters), "milestones", page),
      create: <T>(body: unknown) => createOne<T>(API.ADMIN.THEO_MILESTONES, body),
      update: <T>(id: string, body: unknown) => put<T>(API.ADMIN.THEO_MILESTONE_BY_ID(id), body),
      remove: (id: string) => remove(API.ADMIN.THEO_MILESTONE_BY_ID(id)),
    },
    content: {
      list: <T>(page = 1, filters: Filters = {}) =>
        list<T>(withFilters(API.ADMIN.THEO_CONTENT, filters), "content", page),
      create: <T>(body: unknown) => createOne<T>(API.ADMIN.THEO_CONTENT, body),
      update: <T>(id: string, body: unknown) =>
        put<T>(API.ADMIN.THEO_CONTENT_BY_ID(id), body),
      remove: (id: string) => remove(API.ADMIN.THEO_CONTENT_BY_ID(id)),
      count: (filters: Filters = {}) =>
        count(withFilters(API.ADMIN.THEO_CONTENT, filters)),
      setStatus: <T>(id: string, status: string) =>
        patch<T>(API.ADMIN.THEO_CONTENT_STATUS(id), { status }),
      setVerification: <T>(id: string, verification: string) =>
        patch<T>(API.ADMIN.THEO_CONTENT_VERIFICATION(id), { verification }),
      toggleFeatured: <T>(id: string) => patch<T>(API.ADMIN.THEO_CONTENT_FEATURED(id)),
      duplicate: <T>(id: string) => post<T>(API.ADMIN.THEO_CONTENT_DUPLICATE(id)),
      reorder: <T>(ids: string[]) => patch<T>(API.ADMIN.THEO_CONTENT_REORDER, { ids }),
    },
    journey: {
      get: <T>() => getOne<T>(API.ADMIN.THEO_JOURNEY),
      save: <T>(body: unknown) => put<T>(API.ADMIN.THEO_JOURNEY, body),
    },
    afterSalah: {
      get: <T>() => getOne<T>(API.ADMIN.THEO_AFTER_SALAH),
      save: <T>(body: unknown) => put<T>(API.ADMIN.THEO_AFTER_SALAH, body),
    },
    settings: {
      get: <T>() => getOne<T>(API.ADMIN.THEO_SETTINGS),
      save: <T>(body: unknown) => put<T>(API.ADMIN.THEO_SETTINGS, body),
    },
  },
  content: {
    count: (filters: Filters = {}) => count(withFilters(API.ADMIN.CONTENT, filters)),
    list: <T>(page = 1) => list<T>(API.ADMIN.CONTENT, "content", page),
    get: <T>(id: string) => getOne<T>(API.ADMIN.CONTENT_BY_ID(id)),
    create: <T>(body: unknown) => createOne<T>(API.ADMIN.CONTENT, body),
    update: <T>(id: string, body: unknown) =>
      put<T>(API.ADMIN.CONTENT_BY_ID(id), body),
    remove: (id: string) => remove(API.ADMIN.CONTENT_BY_ID(id)),
    reorder: (body: unknown) => patch(API.ADMIN.CONTENT_REORDER, body),
    duplicate: <T>(id: string) => post<T>(API.ADMIN.CONTENT_DUPLICATE(id)),
    togglePin: <T>(id: string) => patch<T>(API.ADMIN.CONTENT_PIN(id)),
    toggleFeatured: <T>(id: string) => patch<T>(API.ADMIN.CONTENT_FEATURED(id)),
    setStatus: <T>(
      id: string,
      status: string,
      extra?: Record<string, unknown>,
    ) => patch<T>(API.ADMIN.CONTENT_STATUS(id), { status, ...extra }),
  },
  users: {
    count: (filters: Filters = {}) => count(withFilters(API.ADMIN.USERS, filters)),
    list: <T>(page = 1) => list<T>(API.ADMIN.USERS, "users", page),
    get: <T>(id: string) => getOne<T>(API.ADMIN.USER_BY_ID(id)),
    update: <T>(id: string, body: unknown) =>
      put<T>(API.ADMIN.USER_BY_ID(id), body),
    suspend: (id: string) => remove(API.ADMIN.USER_BY_ID(id)),
  },
  auditLogs: {
    list: <T>(page = 1) => list<T>(API.ADMIN.AUDIT_LOGS, "logs", page),
  },
  taxonomy: {
    topics: {
      list: <T>(page = 1) => list<T>(API.ADMIN.TAXONOMY_TOPICS, "topics", page),
      get: <T>(id: string) => getOne<T>(API.ADMIN.TAXONOMY_TOPIC_BY_ID(id)),
      create: <T>(body: unknown) => createOne<T>(API.ADMIN.TAXONOMY_TOPICS, body),
      update: <T>(id: string, body: unknown) =>
        put<T>(API.ADMIN.TAXONOMY_TOPIC_BY_ID(id), body),
      remove: (id: string) => remove(API.ADMIN.TAXONOMY_TOPIC_BY_ID(id)),
    },
    regions: {
      list: <T>(page = 1) =>
        list<T>(API.ADMIN.TAXONOMY_REGIONS, "regions", page),
      get: <T>(id: string) => getOne<T>(API.ADMIN.TAXONOMY_REGION_BY_ID(id)),
      create: <T>(body: unknown) => createOne<T>(API.ADMIN.TAXONOMY_REGIONS, body),
      update: <T>(id: string, body: unknown) =>
        put<T>(API.ADMIN.TAXONOMY_REGION_BY_ID(id), body),
      remove: (id: string) => remove(API.ADMIN.TAXONOMY_REGION_BY_ID(id)),
    },
    tags: {
      list: <T>(page = 1) => list<T>(API.ADMIN.TAXONOMY_TAGS, "tags", page),
      get: <T>(id: string) => getOne<T>(API.ADMIN.TAXONOMY_TAG_BY_ID(id)),
      create: <T>(body: unknown) => createOne<T>(API.ADMIN.TAXONOMY_TAGS, body),
      update: <T>(id: string, body: unknown) =>
        put<T>(API.ADMIN.TAXONOMY_TAG_BY_ID(id), body),
      remove: (id: string) => remove(API.ADMIN.TAXONOMY_TAG_BY_ID(id)),
    },
    categories: {
      list: <T>(page = 1) =>
        list<T>(API.ADMIN.TAXONOMY_CATEGORIES, "categories", page),
      get: <T>(id: string) => getOne<T>(API.ADMIN.TAXONOMY_CATEGORY_BY_ID(id)),
      create: <T>(body: unknown) =>
        createOne<T>(API.ADMIN.TAXONOMY_CATEGORIES, body),
      update: <T>(id: string, body: unknown) =>
        put<T>(API.ADMIN.TAXONOMY_CATEGORY_BY_ID(id), body),
      remove: (id: string) => remove(API.ADMIN.TAXONOMY_CATEGORY_BY_ID(id)),
    },
  },
  operations: {
    rssFeeds: {
      list: <T>(page = 1) =>
        list<T>(API.ADMIN.OPERATIONS_RSS_FEEDS, "feeds", page),
      get: <T>(id: string) =>
        getOne<T>(API.ADMIN.OPERATIONS_RSS_FEED_BY_ID(id)),
      create: <T>(body: unknown) =>
        {
          // Creating a feed takes just platform/title/url — status, counts and
          // sync settings are server-managed (autoSync/frequency are set by PUT later).
          const { platform, title, url } = body as { platform: string; title: string; url: string };
          return createOne<T>(API.ADMIN.OPERATIONS_RSS_FEEDS, { platform, title, url });
        },
      update: <T>(id: string, body: unknown) =>
        put<T>(API.ADMIN.OPERATIONS_RSS_FEED_BY_ID(id), toBody(body as object, "update")),
      remove: (id: string) => remove(API.ADMIN.OPERATIONS_RSS_FEED_BY_ID(id)),
      sync: <T>(id: string) => post<T>(API.ADMIN.OPERATIONS_RSS_FEED_SYNC(id)),
    },
    media: {
      list: <T>(page = 1, q?: string) =>
        list<T>(
          q
            ? `${API.ADMIN.OPERATIONS_MEDIA}?q=${encodeURIComponent(q)}`
            : API.ADMIN.OPERATIONS_MEDIA,
          "media",
          page,
        ),
      get: <T>(id: string) => getOne<T>(API.ADMIN.OPERATIONS_MEDIA_BY_ID(id)),
      create: <T>(body: unknown) => createOne<T>(API.ADMIN.OPERATIONS_MEDIA, toBody(body as object, "create")),
      update: <T>(id: string, body: unknown) =>
        put<T>(API.ADMIN.OPERATIONS_MEDIA_BY_ID(id), toBody(body as object, "update")),
      remove: (id: string) => remove(API.ADMIN.OPERATIONS_MEDIA_BY_ID(id)),
    },
    socialLinks: {
      list: <T>(page = 1) =>
        list<T>(API.ADMIN.OPERATIONS_SOCIAL_LINKS, "socialLinks", page),
      get: <T>(id: string) =>
        getOne<T>(API.ADMIN.OPERATIONS_SOCIAL_LINK_BY_ID(id)),
      create: <T>(body: unknown) =>
        createOne<T>(API.ADMIN.OPERATIONS_SOCIAL_LINKS, toBody(body as object, "create")),
      update: <T>(id: string, body: unknown) =>
        put<T>(API.ADMIN.OPERATIONS_SOCIAL_LINK_BY_ID(id), toBody(body as object, "update")),
      remove: (id: string) =>
        remove(API.ADMIN.OPERATIONS_SOCIAL_LINK_BY_ID(id)),
    },
    services: {
      list: <T>(page = 1) =>
        list<T>(API.ADMIN.OPERATIONS_SERVICES, "services", page),
      get: <T>(id: string) => getOne<T>(API.ADMIN.OPERATIONS_SERVICE_BY_ID(id)),
      create: <T>(body: unknown) =>
        createOne<T>(API.ADMIN.OPERATIONS_SERVICES, toBody(body as object, "create")),
      update: <T>(id: string, body: unknown) =>
        put<T>(API.ADMIN.OPERATIONS_SERVICE_BY_ID(id), toBody(body as object, "update")),
      remove: (id: string) => remove(API.ADMIN.OPERATIONS_SERVICE_BY_ID(id)),
    },
  },
};
