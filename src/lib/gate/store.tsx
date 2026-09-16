import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { toast } from "sonner"
import { buildSeed } from "./seed"
import { adminApi } from "./adminApi"
import type {
  AnyContent,
  ApiKey,
  AuditLog,
  BackupRecord,
  BadgeRule,
  BookContent,
  Category,
  InfographicContent,
  MediaAsset,
  MembershipPlan,
  NotificationRecord,
  PaymentRecord,
  PlatformId,
  PodcastEpisode,
  Region,
  ResearchContent,
  RssFeed,
  ServiceRecord,
  SocialLink,
  Tag,
  Topic,
  UserRecord,
} from "./types"

export interface GateSettings {
  siteName: string
  tagline: string
  defaultAppearance: "light" | "dark" | "system"
  defaultCurrency: string
  exchangeRateAPI: string
  rssAutoSync: boolean
  maintenanceMode: boolean
  seoDefaults: { ogType: string; twitterCard: string; robots: string }
  mediaMaxSizeMB: number
  allowDuplicateMedia: boolean
  rateLimitPerMin: number
  twoFactorRequired: boolean
  gdprConsent: boolean
}

export interface GateData {
  books: AnyContent[]
  research: AnyContent[]
  infographics: AnyContent[]
  podcasts: AnyContent[]
  rss: RssFeed[]
  users: UserRecord[]
  membershipPlans: MembershipPlan[]
  payments: PaymentRecord[]
  categories: Category[]
  tags: Tag[]
  regions: Region[]
  topics: Topic[]
  services: ServiceRecord[]
  socialLinks: SocialLink[]
  mediaAssets: MediaAsset[]
  notifications: NotificationRecord[]
  auditLogs: AuditLog[]
  badgeRules: BadgeRule[]
  apiKeys: ApiKey[]
  backups: BackupRecord[]
  systemHealth: { name: string; status: string; latency: number; detail: string }[]
  activity: { type: string; title: string; meta?: string; ts: number }[]
  settings: GateSettings
}

const SETTINGS: GateSettings = {
  siteName: ".Gate",
  tagline: "Learn. Discover. Grow.",
  defaultAppearance: "system",
  defaultCurrency: "INR",
  exchangeRateAPI: "https://api.exchangerate.host",
  rssAutoSync: true,
  maintenanceMode: false,
  seoDefaults: {
    ogType: "article",
    twitterCard: "summary_large_image",
    robots: "index,follow",
  },
  mediaMaxSizeMB: 25,
  allowDuplicateMedia: false,
  rateLimitPerMin: 60,
  twoFactorRequired: true,
  gdprConsent: true,
}

/**
 * Domains below still come from `buildSeed()` (placeholder data) because no
 * backend endpoint has been wired up for them yet: membershipPlans, payments,
 * notifications, badgeRules, apiKeys, backups, systemHealth, activity.
 *
 * Everything else — content, users, taxonomy, rss feeds, media, social
 * links, services, audit logs — is fetched from the real admin API below and
 * starts empty until that fetch resolves.
 */
function initialData(): GateData {
  const seed = buildSeed() as Omit<GateData, "settings">
  return {
    ...seed,
    books: [],
    research: [],
    infographics: [],
    podcasts: [],
    rss: [],
    users: [],
    categories: [],
    tags: [],
    regions: [],
    topics: [],
    services: [],
    socialLinks: [],
    mediaAssets: [],
    auditLogs: [],
    settings: SETTINGS,
  }
}

function emptySeo() {
  return {
    seoTitle: "",
    metaDescription: "",
    focusKeyword: "",
    slug: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterCard: "summary_large_image" as const,
    schemaType: "",
    robots: "index,follow",
    aeoSummary: "",
    faq: [],
  }
}

function emptyPurchaseLinks() {
  const link = { enabled: false, url: "" }
  return {
    paperback: { ...link },
    ebook: { ...link },
    amazon: { ...link },
    notionPress: { ...link },
    googlePlayBooks: { ...link },
    other: { ...link },
  }
}

/**
 * The exact response shape for /admin/content hasn't been confirmed against
 * a live admin session yet, so this fills in every field the UI reads with a
 * safe default and layers whatever the backend actually sent on top —
 * nothing crashes if a field is missing or named differently than expected.
 */
function normalizeContent(raw: Record<string, unknown>): AnyContent {
  const base = {
    id: String(raw.id ?? raw._id ?? ""),
    platform: raw.platform as PlatformId,
    title: (raw.title as string) ?? "",
    slug: (raw.slug as string) ?? "",
    status: (raw.status as AnyContent["status"]) ?? "draft",
    category: (raw.category as string) ?? "",
    subcategory: raw.subcategory as string | undefined,
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
    regions: Array.isArray(raw.regions) ? (raw.regions as string[]) : [],
    topics: Array.isArray(raw.topics) ? (raw.topics as string[]) : [],
    featured: Boolean(raw.featured),
    pinned: Boolean(raw.pinned),
    displayOrder: Number(raw.displayOrder ?? 0),
    views: Number(raw.views ?? 0),
    shares: Number(raw.shares ?? 0),
    bookmarks: Number(raw.bookmarks ?? 0),
    createdAt: (raw.createdAt as string) ?? new Date().toISOString(),
    updatedAt: (raw.updatedAt as string) ?? (raw.createdAt as string) ?? new Date().toISOString(),
    publishedAt: raw.publishedAt as string | undefined,
    scheduledAt: raw.scheduledAt as string | undefined,
    author: raw.author as string | undefined,
    description: (raw.description as string) ?? "",
    seo: (raw.seo as ReturnType<typeof emptySeo>) ?? emptySeo(),
    feedPlacement: (raw.feedPlacement as AnyContent["feedPlacement"]) ?? "default",
  }

  const type = raw.type as AnyContent["type"]

  if (type === "book" || type === "research") {
    return {
      ...base,
      type,
      cover: (raw.cover as string) ?? (raw.coverImage as string) ?? (raw.coverUrl as string) ?? "",
      subtitle: raw.subtitle as string | undefined,
      pdfUrl: raw.pdfUrl as string | undefined,
      publicationInfo: raw.publicationInfo as string | undefined,
      purchaseLinks: (raw.purchaseLinks as ReturnType<typeof emptyPurchaseLinks>) ?? emptyPurchaseLinks(),
      freeSampleEnabled: Boolean(raw.freeSampleEnabled),
      freeSamplePdf: raw.freeSamplePdf as string | undefined,
    } as BookContent | ResearchContent
  }

  if (type === "infographic") {
    return {
      ...base,
      type: "infographic",
      image: (raw.image as string) ?? (raw.imageUrl as string) ?? "",
      caption: (raw.caption as string) ?? "",
    } as InfographicContent
  }

  return {
    ...base,
    type: "podcast",
    artwork: (raw.artwork as string) ?? (raw.image as string) ?? (raw.imageUrl as string) ?? "",
    audioUrl: (raw.audioUrl as string) ?? "",
    duration: (raw.duration as string) ?? "",
    episodeNumber: Number(raw.episodeNumber ?? 0),
    season: raw.season as number | undefined,
    rssGuid: (raw.rssGuid as string) ?? "",
    originalTitle: (raw.originalTitle as string) ?? base.title,
    originalDescription: (raw.originalDescription as string) ?? base.description,
    feedId: (raw.feedId as string) ?? "",
    explicit: Boolean(raw.explicit),
  } as PodcastEpisode
}

/**
 * The audit-logs endpoint returns snake_case field names (actor_id,
 * actor_name, resource_id, created_at, ...) instead of the camelCase the
 * rest of the admin API uses, so this maps the response onto the frontend's
 * AuditLog shape.
 */
function normalizeAuditLog(raw: Record<string, unknown>): AuditLog {
  return {
    id: String(raw.id ?? raw._id ?? ""),
    actor: (raw.actor as string) ?? (raw.actor_name as string) ?? (raw.actorName as string) ?? "",
    role: (raw.role as string) ?? (raw.actor_role as string) ?? (raw.actorRole as string) ?? "",
    action: (raw.action as string) ?? "",
    resource: (raw.resource as string) ?? (raw.resource_type as string) ?? (raw.resourceType as string) ?? "",
    resourceId: (raw.resourceId as string) ?? (raw.resource_id as string) ?? "",
    timestamp:
      (raw.timestamp as string) ?? (raw.created_at as string) ?? (raw.createdAt as string) ?? new Date().toISOString(),
    ip: (raw.ip as string) ?? (raw.ip_address as string) ?? (raw.ipAddress as string) ?? "",
    result: ((raw.result as string) ?? (raw.status as string) ?? "success") as AuditLog["result"],
    detail: (raw.detail as string) ?? (raw.description as string) ?? (raw.message as string) ?? "",
  }
}

export type ResourceKey =
  | "content"
  | "users"
  | "categories"
  | "tags"
  | "regions"
  | "topics"
  | "services"
  | "socialLinks"
  | "mediaAssets"
  | "rss"
  | "auditLogs"

const RESOURCE_KEYS: ResourceKey[] = [
  "content",
  "users",
  "categories",
  "tags",
  "regions",
  "topics",
  "services",
  "socialLinks",
  "mediaAssets",
  "rss",
  "auditLogs",
]

const RESOURCE_LABEL: Record<ResourceKey, string> = {
  content: "content",
  users: "users",
  categories: "categories",
  tags: "tags",
  regions: "regions",
  topics: "topics",
  services: "services",
  socialLinks: "social links",
  mediaAssets: "media",
  rss: "RSS feeds",
  auditLogs: "audit logs",
}

interface ResourcePage {
  hasMore: boolean
  apply: (d: GateData, append: boolean) => GateData
}

/**
 * Fetches one page (25 items, matching the backend's own default) of a
 * resource. `apply` merges that page into the store — replacing the current
 * list on page 1, appending on later pages so "Load more" doesn't refetch
 * what's already on screen.
 */
async function fetchResourcePage(key: ResourceKey, page: number): Promise<ResourcePage> {
  switch (key) {
    case "content": {
      const { items: raw, hasMore } = await adminApi.content.list<Record<string, unknown>>(page)
      const normalized = raw.map(normalizeContent)
      const byType = {
        books: normalized.filter((c) => c.type === "book"),
        research: normalized.filter((c) => c.type === "research"),
        infographics: normalized.filter((c) => c.type === "infographic"),
        podcasts: normalized.filter((c) => c.type === "podcast"),
      }
      return {
        hasMore,
        apply: (d, append) => ({
          ...d,
          books: append ? [...d.books, ...byType.books] : byType.books,
          research: append ? [...d.research, ...byType.research] : byType.research,
          infographics: append ? [...d.infographics, ...byType.infographics] : byType.infographics,
          podcasts: append ? [...d.podcasts, ...byType.podcasts] : byType.podcasts,
        }),
      }
    }
    case "users": {
      const { items, hasMore } = await adminApi.users.list<UserRecord>(page)
      return { hasMore, apply: (d, append) => ({ ...d, users: append ? [...d.users, ...items] : items }) }
    }
    case "categories": {
      const { items, hasMore } = await adminApi.taxonomy.categories.list<Category>(page)
      return { hasMore, apply: (d, append) => ({ ...d, categories: append ? [...d.categories, ...items] : items }) }
    }
    case "tags": {
      const { items, hasMore } = await adminApi.taxonomy.tags.list<Tag>(page)
      return { hasMore, apply: (d, append) => ({ ...d, tags: append ? [...d.tags, ...items] : items }) }
    }
    case "regions": {
      const { items, hasMore } = await adminApi.taxonomy.regions.list<Region>(page)
      return { hasMore, apply: (d, append) => ({ ...d, regions: append ? [...d.regions, ...items] : items }) }
    }
    case "topics": {
      const { items, hasMore } = await adminApi.taxonomy.topics.list<Topic>(page)
      return { hasMore, apply: (d, append) => ({ ...d, topics: append ? [...d.topics, ...items] : items }) }
    }
    case "services": {
      const { items, hasMore } = await adminApi.operations.services.list<ServiceRecord>(page)
      return { hasMore, apply: (d, append) => ({ ...d, services: append ? [...d.services, ...items] : items }) }
    }
    case "socialLinks": {
      const { items, hasMore } = await adminApi.operations.socialLinks.list<SocialLink>(page)
      return { hasMore, apply: (d, append) => ({ ...d, socialLinks: append ? [...d.socialLinks, ...items] : items }) }
    }
    case "mediaAssets": {
      const { items, hasMore } = await adminApi.operations.media.list<MediaAsset>(page)
      return { hasMore, apply: (d, append) => ({ ...d, mediaAssets: append ? [...d.mediaAssets, ...items] : items }) }
    }
    case "rss": {
      const { items, hasMore } = await adminApi.operations.rssFeeds.list<RssFeed>(page)
      return { hasMore, apply: (d, append) => ({ ...d, rss: append ? [...d.rss, ...items] : items }) }
    }
    case "auditLogs": {
      const { items: raw, hasMore } = await adminApi.auditLogs.list<Record<string, unknown>>(page)
      const items = raw.map(normalizeAuditLog)
      return { hasMore, apply: (d, append) => ({ ...d, auditLogs: append ? [...d.auditLogs, ...items] : items }) }
    }
  }
}

interface StoreContextValue {
  data: GateData
  mounted: boolean
  loading: boolean
  resetData: () => void
  // lazy per-resource loading — call the relevant one from the admin page
  // that actually needs that data, instead of fetching everything up front
  ensureContentLoaded: () => void
  ensureUsersLoaded: () => void
  ensureCategoriesLoaded: () => void
  ensureTagsLoaded: () => void
  ensureRegionsLoaded: () => void
  ensureTopicsLoaded: () => void
  ensureServicesLoaded: () => void
  ensureSocialLinksLoaded: () => void
  ensureMediaLoaded: () => void
  ensureRssLoaded: () => void
  ensureAuditLogsLoaded: () => void
  isResourceLoading: (key: ResourceKey) => boolean
  // pagination — 25 items per page (matches the backend default). Call
  // loadMore to fetch the next page; hasMore says whether one exists.
  loadMore: (key: ResourceKey) => void
  hasMore: (key: ResourceKey) => boolean
  updateSettings: (patch: Partial<GateSettings>) => void
  // content
  addContent: (item: AnyContent) => void
  updateContent: (id: string, patch: Partial<AnyContent>) => void
  removeContent: (id: string) => void
  setContentStatus: (
    id: string,
    status: AnyContent["status"],
    extra?: Partial<AnyContent>,
  ) => void
  toggleFeatured: (id: string) => void
  togglePin: (id: string) => void
  duplicateContent: (id: string) => void
  reorderContent: (ids: string[], type: AnyContent["type"]) => void
  syncRssFeed: (feedId: string) => void
  // taxonomy
  addCategory: (c: Category) => void
  updateCategory: (id: string, patch: Partial<Category>) => void
  removeCategory: (id: string) => void
  addTag: (t: Tag) => void
  updateTag: (id: string, patch: Partial<Tag>) => void
  removeTag: (id: string) => void
  addRegion: (r: Region) => void
  updateRegion: (id: string, patch: Partial<Region>) => void
  removeRegion: (id: string) => void
  addTopic: (t: Topic) => void
  updateTopic: (id: string, patch: Partial<Topic>) => void
  removeTopic: (id: string) => void
  // services / links
  addService: (s: ServiceRecord) => void
  updateService: (id: string, patch: Partial<ServiceRecord>) => void
  removeService: (id: string) => void
  addSocialLink: (s: SocialLink) => void
  updateSocialLink: (id: string, patch: Partial<SocialLink>) => void
  removeSocialLink: (id: string) => void
  // media
  addMedia: (m: MediaAsset) => void
  updateMedia: (id: string, patch: Partial<MediaAsset>) => void
  removeMedia: (id: string) => void
  // rss feeds
  updateRssFeed: (id: string, patch: Partial<RssFeed>) => void
  removeRssFeed: (id: string) => void
  // notifications (still local — no backend endpoint yet)
  addNotification: (n: NotificationRecord) => void
  updateNotification: (id: string, patch: Partial<NotificationRecord>) => void
  removeNotification: (id: string) => void
  sendNotification: (id: string) => void
  // users
  updateUser: (id: string, patch: Partial<UserRecord>) => void
  removeUser: (id: string) => void
  // plans / badges / api / backups (still local — no backend endpoint yet)
  updatePlan: (id: string, patch: Partial<MembershipPlan>) => void
  addBadge: (b: BadgeRule) => void
  updateBadge: (id: string, patch: Partial<BadgeRule>) => void
  removeBadge: (id: string) => void
  addApiKey: (k: ApiKey) => void
  revokeApiKey: (id: string) => void
  createBackup: () => void
  restoreBackup: (id: string) => void
}

const Ctx = createContext<StoreContextValue | null>(null)

export function useGate(): StoreContextValue {
  const v = useContext(Ctx)
  if (!v) throw new Error("useGate must be used within StoreProvider")
  return v
}

function replaceContent(
  data: GateData,
  type: AnyContent["type"],
  items: AnyContent[],
): GateData {
  if (type === "book") return { ...data, books: items }
  if (type === "research") return { ...data, research: items }
  if (type === "infographic") return { ...data, infographics: items }
  return { ...data, podcasts: items }
}

function map2(d: GateData) {
  return {
    book: d.books,
    research: d.research,
    infographic: d.infographics,
    podcast: d.podcasts,
  }
}
function keyFor(t: AnyContent["type"]) {
  return t === "book"
    ? "books"
    : t === "research"
      ? "research"
      : t === "infographic"
        ? "infographics"
        : "podcasts"
}
function findType(d: GateData, id: string): AnyContent["type"] | null {
  for (const t of Object.keys(map2(d)) as AnyContent["type"][]) {
    if (map2(d)[t].some((x) => x.id === id)) return t
  }
  return null
}

function reportError(action: string, err: unknown) {
  console.error(`Admin action failed (${action}):`, err)
  toast.error(`Could not ${action}. Please try again.`)
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<GateData>(initialData)
  const loadedRef = useRef<Partial<Record<ResourceKey, boolean>>>({})
  const inFlightRef = useRef<Partial<Record<ResourceKey, Promise<void>>>>({})
  const [loadingKeys, setLoadingKeys] = useState<Partial<Record<ResourceKey, boolean>>>({})
  const [pageState, setPageState] = useState<Partial<Record<ResourceKey, { page: number; hasMore: boolean }>>>({})

  const loadPage = useCallback((key: ResourceKey, page: number): Promise<void> => {
    if (inFlightRef.current[key]) return inFlightRef.current[key] as Promise<void>

    setLoadingKeys((s) => ({ ...s, [key]: true }))
    const promise = fetchResourcePage(key, page)
      .then(({ apply, hasMore }) => {
        setData((d) => apply(d, page > 1))
        loadedRef.current[key] = true
        setPageState((s) => ({ ...s, [key]: { page, hasMore } }))
      })
      .catch((err) => {
        console.error(`Failed to load ${key} from the server:`, err)
        toast.error(`Could not load ${RESOURCE_LABEL[key]} from the server.`)
      })
      .finally(() => {
        delete inFlightRef.current[key]
        setLoadingKeys((s) => ({ ...s, [key]: false }))
      })

    inFlightRef.current[key] = promise
    return promise
  }, [])

  // First page only — idempotent, safe to call from every page that reads
  // this resource. Later pages come from loadMore() below.
  const ensureLoaded = useCallback(
    (key: ResourceKey) => {
      if (loadedRef.current[key] || inFlightRef.current[key]) return
      void loadPage(key, 1)
    },
    [loadPage],
  )

  // Stable wrappers (identity never changes) so admin pages can safely put
  // them in a useEffect dependency array without re-triggering the fetch
  // on every unrelated store re-render.
  const ensureContentLoaded = useCallback(() => ensureLoaded("content"), [ensureLoaded])
  const ensureUsersLoaded = useCallback(() => ensureLoaded("users"), [ensureLoaded])
  const ensureCategoriesLoaded = useCallback(() => ensureLoaded("categories"), [ensureLoaded])
  const ensureTagsLoaded = useCallback(() => ensureLoaded("tags"), [ensureLoaded])
  const ensureRegionsLoaded = useCallback(() => ensureLoaded("regions"), [ensureLoaded])
  const ensureTopicsLoaded = useCallback(() => ensureLoaded("topics"), [ensureLoaded])
  const ensureServicesLoaded = useCallback(() => ensureLoaded("services"), [ensureLoaded])
  const ensureSocialLinksLoaded = useCallback(() => ensureLoaded("socialLinks"), [ensureLoaded])
  const ensureMediaLoaded = useCallback(() => ensureLoaded("mediaAssets"), [ensureLoaded])
  const ensureRssLoaded = useCallback(() => ensureLoaded("rss"), [ensureLoaded])
  const ensureAuditLogsLoaded = useCallback(() => ensureLoaded("auditLogs"), [ensureLoaded])
  const isResourceLoading = useCallback((key: ResourceKey) => Boolean(loadingKeys[key]), [loadingKeys])
  const hasMore = useCallback((key: ResourceKey) => Boolean(pageState[key]?.hasMore), [pageState])
  const loadMore = useCallback(
    (key: ResourceKey) => {
      const state = pageState[key]
      if (!state?.hasMore || inFlightRef.current[key]) return
      void loadPage(key, state.page + 1)
    },
    [pageState, loadPage],
  )
  const resetData = useCallback(() => {
    const toReload = RESOURCE_KEYS.filter((k) => loadedRef.current[k])
    toReload.forEach((k) => {
      loadedRef.current[k] = false
    })
    setPageState((s) => {
      const next = { ...s }
      toReload.forEach((k) => delete next[k])
      return next
    })
    toReload.forEach((k) => void loadPage(k, 1))
  }, [loadPage])

  const value: StoreContextValue = useMemo(() => {
    const pushActivity = (type: string, title: string, meta?: string) =>
      setData((d) => ({
        ...d,
        activity: [
          { type, title, meta, ts: Date.now() },
          ...d.activity,
        ].slice(0, 60),
      }))

    return {
      data,
      mounted: true,
      loading: Object.values(loadingKeys).some(Boolean),
      resetData,
      ensureContentLoaded,
      ensureUsersLoaded,
      ensureCategoriesLoaded,
      ensureTagsLoaded,
      ensureRegionsLoaded,
      ensureTopicsLoaded,
      ensureServicesLoaded,
      ensureSocialLinksLoaded,
      ensureMediaLoaded,
      ensureRssLoaded,
      ensureAuditLogsLoaded,
      isResourceLoading,
      loadMore,
      hasMore,
      updateSettings: (patch) => {
        setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }))
      },

      // ---- content ----
      addContent: (item) => {
        const key = keyFor(item.type)
        setData((d) => ({ ...d, [key]: [item, ...(d as any)[key]] }))
        pushActivity("create", `Created ${item.type}: ${item.title}`, item.platform)
        adminApi.content
          .create<Record<string, unknown>>(item)
          .then((res) => {
            const saved = normalizeContent({ ...item, ...res })
            setData((d) => replaceContent(d, item.type, (d as any)[key].map((x: AnyContent) => (x.id === item.id ? saved : x))))
          })
          .catch((err) => {
            setData((d) => replaceContent(d, item.type, (d as any)[key].filter((x: AnyContent) => x.id !== item.id)))
            reportError("create this content", err)
          })
      },
      updateContent: (id, patch) => {
        const type = findType(data, id)
        if (!type) return
        const key = keyFor(type)
        const previous = (data as any)[key]
        setData((d) => {
          const arr = (d as any)[key] as AnyContent[]
          const next = arr.map((x) =>
            x.id === id ? ({ ...x, ...patch, updatedAt: new Date().toISOString() } as AnyContent) : x,
          )
          return replaceContent(d, type, next)
        })
        adminApi.content.update(id, patch).catch((err) => {
          setData((d) => replaceContent(d, type, previous))
          reportError("save this content", err)
        })
      },
      removeContent: (id) => {
        const type = findType(data, id)
        if (!type) return
        const key = keyFor(type)
        const previous = (data as any)[key]
        setData((d) => replaceContent(d, type, ((d as any)[key] as AnyContent[]).filter((x) => x.id !== id)))
        pushActivity("delete", `Deleted content ${id}`)
        adminApi.content.remove(id).catch((err) => {
          setData((d) => replaceContent(d, type, previous))
          reportError("delete this content", err)
        })
      },
      setContentStatus: (id, status, extra) => {
        const type = findType(data, id)
        if (!type) return
        const key = keyFor(type)
        const previous = (data as any)[key]
        setData((d) => {
          const patch: Partial<AnyContent> = { status, updatedAt: new Date().toISOString() }
          if (status === "published") patch.publishedAt = new Date().toISOString()
          if (status === "scheduled" && extra?.scheduledAt) patch.scheduledAt = extra.scheduledAt
          const arr = (d as any)[key] as AnyContent[]
          const next = arr.map((x) => (x.id === id ? ({ ...x, ...patch, ...extra } as AnyContent) : x))
          return replaceContent(d, type, next)
        })
        pushActivity(status, `Content ${id} → ${status}`)
        adminApi.content.setStatus(id, status, extra).catch((err) => {
          setData((d) => replaceContent(d, type, previous))
          reportError("update the status", err)
        })
      },
      toggleFeatured: (id) => {
        const type = findType(data, id)
        if (!type) return
        const key = keyFor(type)
        const previous = (data as any)[key]
        setData((d) => {
          const arr = (d as any)[key] as AnyContent[]
          return replaceContent(d, type, arr.map((x) => (x.id === id ? { ...x, featured: !x.featured } : x)))
        })
        adminApi.content.toggleFeatured(id).catch((err) => {
          setData((d) => replaceContent(d, type, previous))
          reportError("update featured status", err)
        })
      },
      togglePin: (id) => {
        const type = findType(data, id)
        if (!type) return
        const key = keyFor(type)
        const previous = (data as any)[key]
        setData((d) => {
          const arr = (d as any)[key] as AnyContent[]
          return replaceContent(d, type, arr.map((x) => (x.id === id ? { ...x, pinned: !x.pinned } : x)))
        })
        adminApi.content.togglePin(id).catch((err) => {
          setData((d) => replaceContent(d, type, previous))
          reportError("update pin status", err)
        })
      },
      duplicateContent: (id) => {
        const type = findType(data, id)
        if (!type) return
        const key = keyFor(type)
        const src = ((data as any)[key] as AnyContent[]).find((x) => x.id === id)
        if (!src) return
        adminApi
          .content.duplicate<Record<string, unknown>>(id)
          .then((res) => {
            const copy = normalizeContent({
              ...src,
              ...res,
              id: (res?.id as string) ?? `${type}_dup_${Date.now().toString(36)}`,
              title: `${src.title} (Copy)`,
              status: "draft",
            })
            setData((d) => replaceContent(d, type, [copy, ...((d as any)[key] as AnyContent[])]))
            pushActivity("duplicate", `Duplicated content ${id}`)
          })
          .catch((err) => reportError("duplicate this content", err))
      },
      reorderContent: (ids, type) => {
        const key = keyFor(type)
        const previous = (data as any)[key]
        setData((d) => {
          const arr = (d as any)[key] as AnyContent[]
          const order = new Map(ids.map((id, i) => [id, i + 1]))
          const next = arr
            .map((x) => ({ ...x, displayOrder: order.get(x.id) ?? x.displayOrder }))
            .sort((a, b) => a.displayOrder - b.displayOrder)
          return replaceContent(d, type, next)
        })
        adminApi.content.reorder({ type, ids }).catch((err) => {
          setData((d) => replaceContent(d, type, previous))
          reportError("save the new order", err)
        })
      },
      syncRssFeed: (feedId) => {
        adminApi.operations.rssFeeds
          .sync<Partial<RssFeed>>(feedId)
          .then((res) => {
            setData((d) => ({
              ...d,
              rss: d.rss.map((f) => (f.id === feedId ? { ...f, lastSync: new Date().toISOString(), ...res } : f)),
            }))
            pushActivity("rss", `Synced feed ${feedId}`, "RSS")
          })
          .catch((err) => reportError("sync this feed", err))
      },

      // ---- taxonomy: categories ----
      addCategory: (c) => {
        setData((d) => ({ ...d, categories: [c, ...d.categories] }))
        adminApi.taxonomy.categories
          .create<Category>(c)
          .then((res) =>
            setData((d) => ({
              ...d,
              categories: d.categories.map((x) => (x.id === c.id ? { ...c, ...res } : x)),
            })),
          )
          .catch((err) => {
            setData((d) => ({ ...d, categories: d.categories.filter((x) => x.id !== c.id) }))
            reportError("create this category", err)
          })
      },
      updateCategory: (id, patch) => {
        const previous = data.categories
        setData((d) => ({ ...d, categories: d.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) }))
        adminApi.taxonomy.categories.update(id, patch).catch((err) => {
          setData((d) => ({ ...d, categories: previous }))
          reportError("save this category", err)
        })
      },
      removeCategory: (id) => {
        const previous = data.categories
        setData((d) => ({ ...d, categories: d.categories.filter((c) => c.id !== id) }))
        adminApi.taxonomy.categories.remove(id).catch((err) => {
          setData((d) => ({ ...d, categories: previous }))
          reportError("delete this category", err)
        })
      },

      // ---- taxonomy: tags ----
      addTag: (t) => {
        setData((d) => ({ ...d, tags: [t, ...d.tags] }))
        adminApi.taxonomy.tags
          .create<Tag>(t)
          .then((res) => setData((d) => ({ ...d, tags: d.tags.map((x) => (x.id === t.id ? { ...t, ...res } : x)) })))
          .catch((err) => {
            setData((d) => ({ ...d, tags: d.tags.filter((x) => x.id !== t.id) }))
            reportError("create this tag", err)
          })
      },
      updateTag: (id, patch) => {
        const previous = data.tags
        setData((d) => ({ ...d, tags: d.tags.map((t) => (t.id === id ? { ...t, ...patch } : t)) }))
        adminApi.taxonomy.tags.update(id, patch).catch((err) => {
          setData((d) => ({ ...d, tags: previous }))
          reportError("save this tag", err)
        })
      },
      removeTag: (id) => {
        const previous = data.tags
        setData((d) => ({ ...d, tags: d.tags.filter((t) => t.id !== id) }))
        adminApi.taxonomy.tags.remove(id).catch((err) => {
          setData((d) => ({ ...d, tags: previous }))
          reportError("delete this tag", err)
        })
      },

      // ---- taxonomy: regions ----
      addRegion: (r) => {
        setData((d) => ({ ...d, regions: [r, ...d.regions] }))
        adminApi.taxonomy.regions
          .create<Region>(r)
          .then((res) => setData((d) => ({ ...d, regions: d.regions.map((x) => (x.id === r.id ? { ...r, ...res } : x)) })))
          .catch((err) => {
            setData((d) => ({ ...d, regions: d.regions.filter((x) => x.id !== r.id) }))
            reportError("create this region", err)
          })
      },
      updateRegion: (id, patch) => {
        const previous = data.regions
        setData((d) => ({ ...d, regions: d.regions.map((r) => (r.id === id ? { ...r, ...patch } : r)) }))
        adminApi.taxonomy.regions.update(id, patch).catch((err) => {
          setData((d) => ({ ...d, regions: previous }))
          reportError("save this region", err)
        })
      },
      removeRegion: (id) => {
        const previous = data.regions
        setData((d) => ({ ...d, regions: d.regions.filter((r) => r.id !== id) }))
        adminApi.taxonomy.regions.remove(id).catch((err) => {
          setData((d) => ({ ...d, regions: previous }))
          reportError("delete this region", err)
        })
      },

      // ---- taxonomy: topics ----
      addTopic: (t) => {
        setData((d) => ({ ...d, topics: [t, ...d.topics] }))
        adminApi.taxonomy.topics
          .create<Topic>(t)
          .then((res) => setData((d) => ({ ...d, topics: d.topics.map((x) => (x.id === t.id ? { ...t, ...res } : x)) })))
          .catch((err) => {
            setData((d) => ({ ...d, topics: d.topics.filter((x) => x.id !== t.id) }))
            reportError("create this topic", err)
          })
      },
      updateTopic: (id, patch) => {
        const previous = data.topics
        setData((d) => ({ ...d, topics: d.topics.map((t) => (t.id === id ? { ...t, ...patch } : t)) }))
        adminApi.taxonomy.topics.update(id, patch).catch((err) => {
          setData((d) => ({ ...d, topics: previous }))
          reportError("save this topic", err)
        })
      },
      removeTopic: (id) => {
        const previous = data.topics
        setData((d) => ({ ...d, topics: d.topics.filter((t) => t.id !== id) }))
        adminApi.taxonomy.topics.remove(id).catch((err) => {
          setData((d) => ({ ...d, topics: previous }))
          reportError("delete this topic", err)
        })
      },

      // ---- services ----
      addService: (s) => {
        setData((d) => ({ ...d, services: [s, ...d.services] }))
        adminApi.operations.services
          .create<ServiceRecord>(s)
          .then((res) => setData((d) => ({ ...d, services: d.services.map((x) => (x.id === s.id ? { ...s, ...res } : x)) })))
          .catch((err) => {
            setData((d) => ({ ...d, services: d.services.filter((x) => x.id !== s.id) }))
            reportError("create this service", err)
          })
      },
      updateService: (id, patch) => {
        const previous = data.services
        setData((d) => ({ ...d, services: d.services.map((s) => (s.id === id ? { ...s, ...patch } : s)) }))
        adminApi.operations.services.update(id, patch).catch((err) => {
          setData((d) => ({ ...d, services: previous }))
          reportError("save this service", err)
        })
      },
      removeService: (id) => {
        const previous = data.services
        setData((d) => ({ ...d, services: d.services.filter((s) => s.id !== id) }))
        adminApi.operations.services.remove(id).catch((err) => {
          setData((d) => ({ ...d, services: previous }))
          reportError("delete this service", err)
        })
      },

      // ---- social links ----
      addSocialLink: (s) => {
        setData((d) => ({ ...d, socialLinks: [s, ...d.socialLinks] }))
        adminApi.operations.socialLinks
          .create<SocialLink>(s)
          .then((res) =>
            setData((d) => ({
              ...d,
              socialLinks: d.socialLinks.map((x) => (x.id === s.id ? { ...s, ...res } : x)),
            })),
          )
          .catch((err) => {
            setData((d) => ({ ...d, socialLinks: d.socialLinks.filter((x) => x.id !== s.id) }))
            reportError("create this social link", err)
          })
      },
      updateSocialLink: (id, patch) => {
        const previous = data.socialLinks
        setData((d) => ({
          ...d,
          socialLinks: d.socialLinks.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        }))
        adminApi.operations.socialLinks.update(id, patch).catch((err) => {
          setData((d) => ({ ...d, socialLinks: previous }))
          reportError("save this social link", err)
        })
      },
      removeSocialLink: (id) => {
        const previous = data.socialLinks
        setData((d) => ({ ...d, socialLinks: d.socialLinks.filter((s) => s.id !== id) }))
        adminApi.operations.socialLinks.remove(id).catch((err) => {
          setData((d) => ({ ...d, socialLinks: previous }))
          reportError("delete this social link", err)
        })
      },

      // ---- media ----
      addMedia: (m) => {
        setData((d) => ({ ...d, mediaAssets: [m, ...d.mediaAssets] }))
        adminApi.operations.media
          .create<MediaAsset>(m)
          .then((res) =>
            setData((d) => ({
              ...d,
              mediaAssets: d.mediaAssets.map((x) => (x.id === m.id ? { ...m, ...res } : x)),
            })),
          )
          .catch((err) => {
            setData((d) => ({ ...d, mediaAssets: d.mediaAssets.filter((x) => x.id !== m.id) }))
            reportError("upload this media item", err)
          })
      },
      updateMedia: (id, patch) => {
        const previous = data.mediaAssets
        setData((d) => ({
          ...d,
          mediaAssets: d.mediaAssets.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        }))
        adminApi.operations.media.update(id, patch).catch((err) => {
          setData((d) => ({ ...d, mediaAssets: previous }))
          reportError("save this media item", err)
        })
      },
      removeMedia: (id) => {
        const previous = data.mediaAssets
        setData((d) => ({ ...d, mediaAssets: d.mediaAssets.filter((m) => m.id !== id) }))
        adminApi.operations.media.remove(id).catch((err) => {
          setData((d) => ({ ...d, mediaAssets: previous }))
          reportError("delete this media item", err)
        })
      },

      // ---- rss feeds ----
      updateRssFeed: (id, patch) => {
        const previous = data.rss
        setData((d) => ({ ...d, rss: d.rss.map((f) => (f.id === id ? { ...f, ...patch } : f)) }))
        adminApi.operations.rssFeeds.update(id, patch).catch((err) => {
          setData((d) => ({ ...d, rss: previous }))
          reportError("save this feed", err)
        })
      },
      removeRssFeed: (id) => {
        const previous = data.rss
        setData((d) => ({ ...d, rss: d.rss.filter((f) => f.id !== id) }))
        adminApi.operations.rssFeeds.remove(id).catch((err) => {
          setData((d) => ({ ...d, rss: previous }))
          reportError("delete this feed", err)
        })
      },

      // ---- notifications (local only — no backend endpoint yet) ----
      addNotification: (n) => setData((d) => ({ ...d, notifications: [n, ...d.notifications] })),
      updateNotification: (id, patch) =>
        setData((d) => ({
          ...d,
          notifications: d.notifications.map((n) => (n.id === id ? { ...n, ...patch } : n)),
        })),
      removeNotification: (id) =>
        setData((d) => ({ ...d, notifications: d.notifications.filter((n) => n.id !== id) })),
      sendNotification: (id) =>
        setData((d) => ({
          ...d,
          notifications: d.notifications.map((n) =>
            n.id === id ? { ...n, status: "sent" as const, sentAt: new Date().toISOString() } : n,
          ),
        })),

      // ---- users ----
      updateUser: (id, patch) => {
        const previous = data.users
        setData((d) => ({ ...d, users: d.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) }))
        adminApi.users.update(id, patch).catch((err) => {
          setData((d) => ({ ...d, users: previous }))
          reportError("save this user", err)
        })
      },
      removeUser: (id) => {
        const previous = data.users
        setData((d) => ({ ...d, users: d.users.filter((u) => u.id !== id) }))
        adminApi.users.suspend(id).catch((err) => {
          setData((d) => ({ ...d, users: previous }))
          reportError("suspend this user", err)
        })
      },

      // ---- plans / badges / api keys / backups (local only — no backend endpoint yet) ----
      updatePlan: (id, patch) =>
        setData((d) => ({
          ...d,
          membershipPlans: d.membershipPlans.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      addBadge: (b) => setData((d) => ({ ...d, badgeRules: [b, ...d.badgeRules] })),
      updateBadge: (id, patch) =>
        setData((d) => ({
          ...d,
          badgeRules: d.badgeRules.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        })),
      removeBadge: (id) =>
        setData((d) => ({ ...d, badgeRules: d.badgeRules.filter((b) => b.id !== id) })),
      addApiKey: (k) => setData((d) => ({ ...d, apiKeys: [k, ...d.apiKeys] })),
      revokeApiKey: (id) =>
        setData((d) => ({
          ...d,
          apiKeys: d.apiKeys.map((k) => (k.id === id ? { ...k, status: "revoked" as const } : k)),
        })),
      createBackup: () => {
        const id = `bkp_${Date.now().toString(36)}`
        setData((d) => ({
          ...d,
          backups: [
            {
              id,
              name: `gate-db-full-${new Date().toISOString().slice(0, 10)}`,
              type: "full",
              sizeMB: Math.round(1500 + Math.random() * 600),
              createdAt: new Date().toISOString(),
              status: "completed",
              verified: true,
            },
            ...d.backups,
          ],
        }))
      },
      restoreBackup: () => {
        /* no backend endpoint yet */
      },
    }
  }, [
    data,
    loadingKeys,
    resetData,
    ensureContentLoaded,
    ensureUsersLoaded,
    ensureCategoriesLoaded,
    ensureTagsLoaded,
    ensureRegionsLoaded,
    ensureTopicsLoaded,
    ensureServicesLoaded,
    ensureSocialLinksLoaded,
    ensureMediaLoaded,
    ensureRssLoaded,
    ensureAuditLogsLoaded,
    isResourceLoading,
    loadMore,
    hasMore,
  ])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
