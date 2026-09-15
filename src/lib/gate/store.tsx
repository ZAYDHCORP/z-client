import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { buildSeed } from "./seed"
import type {
  AnyContent,
  ApiKey,
  AuditLog,
  BackupRecord,
  BadgeRule,
  Category,
  MediaAsset,
  MembershipPlan,
  NotificationRecord,
  PaymentRecord,
  PlatformId,
  PodcastEpisode,
  Region,
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

function initialData(): GateData {
  const s = buildSeed() as Omit<GateData, "settings">
  return { ...s, settings: SETTINGS }
}

const STORAGE_KEY = "gate_admin_state_v1"

interface StoreContextValue {
  data: GateData
  mounted: boolean
  save: () => void
  resetData: () => void
  updateSettings: (patch: Partial<GateSettings>) => void
  logAudit: (e: Omit<AuditLog, "id" | "timestamp">) => void
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
  // notifications
  addNotification: (n: NotificationRecord) => void
  updateNotification: (id: string, patch: Partial<NotificationRecord>) => void
  removeNotification: (id: string) => void
  sendNotification: (id: string) => void
  // users
  addUser: (u: UserRecord) => void
  updateUser: (id: string, patch: Partial<UserRecord>) => void
  removeUser: (id: string) => void
  // plans / badges / api / backups
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
  if (type === "book") return { ...data, books: items as any }
  if (type === "research") return { ...data, research: items as any }
  if (type === "infographic") return { ...data, infographics: items as any }
  return { ...data, podcasts: items as any }
}

function updateOne(
  data: GateData,
  id: string,
  patch: Partial<AnyContent>,
): GateData {
  const map: Record<AnyContent["type"], AnyContent[]> = {
    book: data.books,
    research: data.research,
    infographic: data.infographics,
    podcast: data.podcasts,
  }
  for (const t of Object.keys(map) as AnyContent["type"][]) {
    const arr = map[t]
    if (arr.some((x) => x.id === id)) {
      const next = arr.map((x) =>
        x.id === id ? ({ ...x, ...patch, updatedAt: new Date().toISOString() } as AnyContent) : x,
      )
      return replaceContent(data, t, next)
    }
  }
  return data
}

let auditN = 0

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<GateData>(initialData)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as GateData
        if (parsed && parsed.settings) setData(parsed)
      }
    } catch {
      /* ignore */
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch {
        /* ignore */
      }
    }
  }, [data, mounted])

  const logAudit = (e: Omit<AuditLog, "id" | "timestamp">) => {
    setData((d) => ({
      ...d,
      auditLogs: [
        {
          id: `al_${(++auditN).toString().padStart(5, "0")}`,
          timestamp: new Date().toISOString(),
          ...e,
        },
        ...d.auditLogs,
      ].slice(0, 500),
    }))
  }

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
      mounted,
      save: () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        } catch {
          /* ignore */
        }
      },
      resetData: () => {
        setData(initialData())
        pushActivity("system", "Reset all admin data to seed")
      },
      updateSettings: (patch) => {
        setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }))
        logAudit({
          actor: "admin@gate.app",
          role: "Super Admin",
          action: "settings",
          resource: "settings",
          resourceId: "settings",
          ip: "203.0.113.12",
          result: "success",
          detail: "Updated application settings.",
        })
      },
      logAudit,
      addContent: (item) => {
        setData((d) => {
          const key =
            item.type === "book"
              ? "books"
              : item.type === "research"
                ? "research"
                : item.type === "infographic"
                  ? "infographics"
                  : "podcasts"
          return { ...d, [key]: [item, ...(d as any)[key]] }
        })
        pushActivity("create", `Created ${item.type}: ${item.title}`, item.platform)
        logAudit({
          actor: "admin@gate.app",
          role: "Super Admin",
          action: "create",
          resource: item.type,
          resourceId: item.id,
          ip: "203.0.113.12",
          result: "success",
          detail: `Created '${item.title}'.`,
        })
      },
      updateContent: (id, patch) => {
        setData((d) => updateOne(d, id, patch))
      },
      removeContent: (id) => {
        setData((d) => {
          const t = (Object.keys(map2(d)) as AnyContent["type"][]).find((k) =>
            map2(d)[k].some((x) => x.id === id),
          )
          if (!t) return d
          return replaceContent(
            d,
            t,
            map2(d)[t].filter((x) => x.id !== id),
          )
        })
        pushActivity("delete", `Deleted content ${id}`)
        logAudit({
          actor: "admin@gate.app",
          role: "Super Admin",
          action: "delete",
          resource: "content",
          resourceId: id,
          ip: "203.0.113.12",
          result: "success",
          detail: `Deleted content ${id}.`,
        })
      },
      setContentStatus: (id, status, extra) => {
        setData((d) => {
          const patch: Partial<AnyContent> = {
            status,
            updatedAt: new Date().toISOString(),
          }
          if (status === "published") {
            patch.publishedAt = new Date().toISOString()
          }
          if (status === "scheduled" && extra?.scheduledAt) {
            patch.scheduledAt = extra.scheduledAt
          }
          return updateOne(d, id, { ...patch, ...extra })
        })
        pushActivity(status, `Content ${id} → ${status}`)
        logAudit({
          actor: "admin@gate.app",
          role: "Super Admin",
          action: status,
          resource: "content",
          resourceId: id,
          ip: "203.0.113.12",
          result: "success",
          detail: `Set status to ${status}.`,
        })
      },
      toggleFeatured: (id) => {
        setData((d) => {
          const t = findType(d, id)
          if (!t) return d
          const arr = (d as any)[keyFor(t)]
          const item = arr.find((x: AnyContent) => x.id === id)
          return replaceContent(d, t, [
            ...arr.map((x: AnyContent) =>
              x.id === id ? { ...x, featured: !x.featured } : x,
            ),
          ])
        })
      },
      togglePin: (id) => {
        setData((d) => {
          const t = findType(d, id)
          if (!t) return d
          const arr = (d as any)[keyFor(t)]
          return replaceContent(d, t, [
            ...arr.map((x: AnyContent) =>
              x.id === id ? { ...x, pinned: !x.pinned } : x,
            ),
          ])
        })
      },
      duplicateContent: (id) => {
        setData((d) => {
          const t = findType(d, id)
          if (!t) return d
          const arr = (d as any)[keyFor(t)]
          const src = arr.find((x: AnyContent) => x.id === id)
          if (!src) return d
          const copy: AnyContent = {
            ...src,
            id: `${t}_dup_${Date.now().toString(36)}`,
            title: `${src.title} (Copy)`,
            status: "draft",
            slug: `${src.slug}-copy`,
            featured: false,
            pinned: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: undefined,
          }
          return replaceContent(d, t, [copy, ...arr])
        })
        pushActivity("duplicate", `Duplicated content ${id}`)
      },
      reorderContent: (ids, type) => {
        setData((d) => {
          const arr = (d as any)[keyFor(type)]
          const order = new Map(ids.map((id, i) => [id, i + 1]))
          const next = arr
            .map((x: AnyContent) => ({
              ...x,
              displayOrder: order.get(x.id) ?? x.displayOrder,
            }))
            .sort((a: AnyContent, b: AnyContent) => a.displayOrder - b.displayOrder)
          return replaceContent(d, type, next)
        })
      },
      syncRssFeed: (feedId) => {
        setData((d) => {
          const feed = d.rss.find((f) => f.id === feedId)
          if (!feed) return d
          const titles = [
            "The Weekly Briefing",
            "Behind the Headlines",
            "Conversations That Matter",
            "Field Notes",
            "The Long View",
          ]
          const newEp: PodcastEpisode = {
            id: `pe_${Date.now().toString(36)}`,
            type: "podcast",
            platform: feed.platform,
            title: `${titles[Math.floor(Math.random() * titles.length)]} — Sync ${new Date().toLocaleDateString()}`,
            slug: `ep-${Date.now().toString(36)}`,
            status: "published",
            category: d.categories.find((c) => c.platform === feed.platform)?.name ?? "General",
            tags: ["rss", "sync"],
            regions: ["Global"],
            topics: [],
            featured: false,
            pinned: false,
            displayOrder: 1,
            views: 0,
            shares: 0,
            bookmarks: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
            description:
              "Episode fetched automatically from the platform RSS feed.",
            artwork: "",
            audioUrl: `${feed.url.replace(/\/rss$/, "")}/play/${Date.now()}/episode-sync.mp3`,
            duration: "32:00",
            episodeNumber: feed.totalEpisodes + 1,
            season: 1,
            rssGuid: `guid-${Date.now().toString(36)}`,
            originalTitle: "Synced episode",
            originalDescription: "Original RSS description.",
            feedId,
            explicit: false,
            seo: {
              seoTitle: "Synced Episode",
              metaDescription: "",
              focusKeyword: "",
              slug: `ep-${Date.now().toString(36)}`,
              canonicalUrl: "",
              ogTitle: "",
              ogDescription: "",
              ogImage: "",
              twitterCard: "summary_large_image",
              schemaType: "PodcastEpisode",
              robots: "index,follow",
              aeoSummary: "",
              faq: [],
            },
            feedPlacement: "default",
          }
          return {
            ...d,
            podcasts: [newEp, ...d.podcasts],
            rss: d.rss.map((f) =>
              f.id === feedId
                ? {
                    ...f,
                    lastSync: new Date().toISOString(),
                    totalEpisodes: f.totalEpisodes + 1,
                    newLastSync: f.newLastSync + 1,
                    status: "healthy" as const,
                  }
                : f,
            ),
          }
        })
        pushActivity("rss", `Synced feed ${feedId}`, "RSS")
        logAudit({
          actor: "system",
          role: "System",
          action: "rss_sync",
          resource: "podcast",
          resourceId: feedId,
          ip: "internal",
          result: "success",
          detail: `Manual RSS sync added 1 episode to ${feedId}.`,
        })
      },
      addCategory: (c) => {
        setData((d) => ({ ...d, categories: [c, ...d.categories] }))
        logAudit({
          actor: "admin@gate.app",
          role: "Super Admin",
          action: "create",
          resource: "category",
          resourceId: c.id,
          ip: "203.0.113.12",
          result: "success",
          detail: `Created category '${c.name}'.`,
        })
      },
      updateCategory: (id, patch) =>
        setData((d) => ({
          ...d,
          categories: d.categories.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        })),
      removeCategory: (id) =>
        setData((d) => ({
          ...d,
          categories: d.categories.filter((c) => c.id !== id),
        })),
      addTag: (t) =>
        setData((d) => ({ ...d, tags: [t, ...d.tags] })),
      updateTag: (id, patch) =>
        setData((d) => ({
          ...d,
          tags: d.tags.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      removeTag: (id) =>
        setData((d) => ({ ...d, tags: d.tags.filter((t) => t.id !== id) })),
      addRegion: (r) =>
        setData((d) => ({ ...d, regions: [r, ...d.regions] })),
      updateRegion: (id, patch) =>
        setData((d) => ({
          ...d,
          regions: d.regions.map((r) =>
            r.id === id ? { ...r, ...patch } : r,
          ),
        })),
      removeRegion: (id) =>
        setData((d) => ({
          ...d,
          regions: d.regions.filter((r) => r.id !== id),
        })),
      addTopic: (t) =>
        setData((d) => ({ ...d, topics: [t, ...d.topics] })),
      updateTopic: (id, patch) =>
        setData((d) => ({
          ...d,
          topics: d.topics.map((t) =>
            t.id === id ? { ...t, ...patch } : t,
          ),
        })),
      removeTopic: (id) =>
        setData((d) => ({
          ...d,
          topics: d.topics.filter((t) => t.id !== id),
        })),
      addService: (s) => {
        setData((d) => ({ ...d, services: [s, ...d.services] }))
        logAudit({
          actor: "admin@gate.app",
          role: "Super Admin",
          action: "create",
          resource: "service",
          resourceId: s.id,
          ip: "203.0.113.12",
          result: "success",
          detail: `Created service '${s.title}'.`,
        })
      },
      updateService: (id, patch) =>
        setData((d) => ({
          ...d,
          services: d.services.map((s) =>
            s.id === id ? { ...s, ...patch } : s,
          ),
        })),
      removeService: (id) =>
        setData((d) => ({
          ...d,
          services: d.services.filter((s) => s.id !== id),
        })),
      addSocialLink: (s) =>
        setData((d) => ({ ...d, socialLinks: [s, ...d.socialLinks] })),
      updateSocialLink: (id, patch) =>
        setData((d) => ({
          ...d,
          socialLinks: d.socialLinks.map((s) =>
            s.id === id ? { ...s, ...patch } : s,
          ),
        })),
      removeSocialLink: (id) =>
        setData((d) => ({
          ...d,
          socialLinks: d.socialLinks.filter((s) => s.id !== id),
        })),
      addMedia: (m) =>
        setData((d) => ({ ...d, mediaAssets: [m, ...d.mediaAssets] })),
      updateMedia: (id, patch) =>
        setData((d) => ({
          ...d,
          mediaAssets: d.mediaAssets.map((m) =>
            m.id === id ? { ...m, ...patch } : m,
          ),
        })),
      removeMedia: (id) =>
        setData((d) => ({
          ...d,
          mediaAssets: d.mediaAssets.filter((m) => m.id !== id),
        })),
      addNotification: (n) =>
        setData((d) => ({ ...d, notifications: [n, ...d.notifications] })),
      updateNotification: (id, patch) =>
        setData((d) => ({
          ...d,
          notifications: d.notifications.map((n) =>
            n.id === id ? { ...n, ...patch } : n,
          ),
        })),
      removeNotification: (id) =>
        setData((d) => ({
          ...d,
          notifications: d.notifications.filter((n) => n.id !== id),
        })),
      sendNotification: (id) =>
        setData((d) => ({
          ...d,
          notifications: d.notifications.map((n) =>
            n.id === id
              ? {
                  ...n,
                  status: "sent" as const,
                  sentAt: new Date().toISOString(),
                }
              : n,
          ),
        })),
      addUser: (u) =>
        setData((d) => ({ ...d, users: [u, ...d.users] })),
      updateUser: (id, patch) =>
        setData((d) => ({
          ...d,
          users: d.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
        })),
      removeUser: (id) =>
        setData((d) => ({
          ...d,
          users: d.users.filter((u) => u.id !== id),
        })),
      updatePlan: (id, patch) =>
        setData((d) => ({
          ...d,
          membershipPlans: d.membershipPlans.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        })),
      updateBadge: (id, patch) =>
        setData((d) => ({
          ...d,
          badgeRules: d.badgeRules.map((b) =>
            b.id === id ? { ...b, ...patch } : b,
          ),
        })),
      addBadge: (b) => {
        setData((d) => ({ ...d, badgeRules: [b, ...d.badgeRules] }))
        logAudit({
          actor: "admin@gate.app",
          role: "Super Admin",
          action: "create",
          resource: "badge",
          resourceId: b.id,
          ip: "203.0.113.12",
          result: "success",
          detail: `Created badge rule '${b.name}'.`,
        })
      },
      removeBadge: (id) =>
        setData((d) => ({
          ...d,
          badgeRules: d.badgeRules.filter((b) => b.id !== id),
        })),
      addApiKey: (k) =>
        setData((d) => ({ ...d, apiKeys: [k, ...d.apiKeys] })),
      revokeApiKey: (id) =>
        setData((d) => ({
          ...d,
          apiKeys: d.apiKeys.map((k) =>
            k.id === id ? { ...k, status: "revoked" as const } : k,
          ),
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
        logAudit({
          actor: "admin@gate.app",
          role: "Super Admin",
          action: "backup",
          resource: "backup",
          resourceId: id,
          ip: "203.0.113.12",
          result: "success",
          detail: "Created on-demand full backup.",
        })
      },
      restoreBackup: (id) => {
        logAudit({
          actor: "admin@gate.app",
          role: "Super Admin",
          action: "restore",
          resource: "backup",
          resourceId: id,
          ip: "203.0.113.12",
          result: "success",
          detail: "Initiated backup restore.",
        })
      },
    }
  }, [data, mounted])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
          <span className="text-sm">Loading .Gate Admin…</span>
        </div>
      </div>
    )
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
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
