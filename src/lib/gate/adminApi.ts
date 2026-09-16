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

async function getOne<T>(url: string): Promise<T> {
  const res = await api.get(url);
  return unwrap<T>(res.data);
}

async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.post(url, body ?? {});
  return unwrap<T>(res.data);
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
  content: {
    list: <T>(page = 1) => list<T>(API.ADMIN.CONTENT, "content", page),
    get: <T>(id: string) => getOne<T>(API.ADMIN.CONTENT_BY_ID(id)),
    create: <T>(body: unknown) => post<T>(API.ADMIN.CONTENT, body),
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
      create: <T>(body: unknown) => post<T>(API.ADMIN.TAXONOMY_TOPICS, body),
      update: <T>(id: string, body: unknown) =>
        put<T>(API.ADMIN.TAXONOMY_TOPIC_BY_ID(id), body),
      remove: (id: string) => remove(API.ADMIN.TAXONOMY_TOPIC_BY_ID(id)),
    },
    regions: {
      list: <T>(page = 1) =>
        list<T>(API.ADMIN.TAXONOMY_REGIONS, "regions", page),
      get: <T>(id: string) => getOne<T>(API.ADMIN.TAXONOMY_REGION_BY_ID(id)),
      create: <T>(body: unknown) => post<T>(API.ADMIN.TAXONOMY_REGIONS, body),
      update: <T>(id: string, body: unknown) =>
        put<T>(API.ADMIN.TAXONOMY_REGION_BY_ID(id), body),
      remove: (id: string) => remove(API.ADMIN.TAXONOMY_REGION_BY_ID(id)),
    },
    tags: {
      list: <T>(page = 1) => list<T>(API.ADMIN.TAXONOMY_TAGS, "tags", page),
      get: <T>(id: string) => getOne<T>(API.ADMIN.TAXONOMY_TAG_BY_ID(id)),
      create: <T>(body: unknown) => post<T>(API.ADMIN.TAXONOMY_TAGS, body),
      update: <T>(id: string, body: unknown) =>
        put<T>(API.ADMIN.TAXONOMY_TAG_BY_ID(id), body),
      remove: (id: string) => remove(API.ADMIN.TAXONOMY_TAG_BY_ID(id)),
    },
    categories: {
      list: <T>(page = 1) =>
        list<T>(API.ADMIN.TAXONOMY_CATEGORIES, "categories", page),
      get: <T>(id: string) => getOne<T>(API.ADMIN.TAXONOMY_CATEGORY_BY_ID(id)),
      create: <T>(body: unknown) =>
        post<T>(API.ADMIN.TAXONOMY_CATEGORIES, body),
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
        post<T>(API.ADMIN.OPERATIONS_RSS_FEEDS, body),
      update: <T>(id: string, body: unknown) =>
        put<T>(API.ADMIN.OPERATIONS_RSS_FEED_BY_ID(id), body),
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
      create: <T>(body: unknown) => post<T>(API.ADMIN.OPERATIONS_MEDIA, body),
      update: <T>(id: string, body: unknown) =>
        put<T>(API.ADMIN.OPERATIONS_MEDIA_BY_ID(id), body),
      remove: (id: string) => remove(API.ADMIN.OPERATIONS_MEDIA_BY_ID(id)),
    },
    socialLinks: {
      list: <T>(page = 1) =>
        list<T>(API.ADMIN.OPERATIONS_SOCIAL_LINKS, "socialLinks", page),
      get: <T>(id: string) =>
        getOne<T>(API.ADMIN.OPERATIONS_SOCIAL_LINK_BY_ID(id)),
      create: <T>(body: unknown) =>
        post<T>(API.ADMIN.OPERATIONS_SOCIAL_LINKS, body),
      update: <T>(id: string, body: unknown) =>
        put<T>(API.ADMIN.OPERATIONS_SOCIAL_LINK_BY_ID(id), body),
      remove: (id: string) =>
        remove(API.ADMIN.OPERATIONS_SOCIAL_LINK_BY_ID(id)),
    },
    services: {
      list: <T>(page = 1) =>
        list<T>(API.ADMIN.OPERATIONS_SERVICES, "services", page),
      get: <T>(id: string) => getOne<T>(API.ADMIN.OPERATIONS_SERVICE_BY_ID(id)),
      create: <T>(body: unknown) =>
        post<T>(API.ADMIN.OPERATIONS_SERVICES, body),
      update: <T>(id: string, body: unknown) =>
        put<T>(API.ADMIN.OPERATIONS_SERVICE_BY_ID(id), body),
      remove: (id: string) => remove(API.ADMIN.OPERATIONS_SERVICE_BY_ID(id)),
    },
  },
};
