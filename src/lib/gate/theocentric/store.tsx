import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { toast } from "sonner"
import { adminApi } from "../adminApi"
import { reportError } from "../errors"
import {
  DEFAULT_SETTINGS,
  afterSalahBody,
  changedFields,
  collectionItemsBody,
  normalizeAfterSalah,
  normalizeCategory,
  normalizeCollection,
  normalizeContent,
  normalizeJourney,
  normalizeMilestone,
  normalizeReference,
  normalizeSettings,
  normalizeSubcategory,
  normalizeTag,
  toBody,
} from "./api"
import type {
  AfterSalahEntry,
  JourneySection,
  Milestone,
  PublicationStatus,
  SpiritualContent,
  TheoCategory,
  TheoCollection,
  TheoData,
  TheoReference,
  TheoSettings,
  TheoSubcategory,
  TheoTag,
  VerificationStatus,
} from "./types"

type Raw = Record<string, unknown>

/** Server-side filters supported by GET /admin/theocentric/content. */
export interface ContentFilters {
  kind?: string
  category?: string
  status?: string
  routine?: string
  q?: string
}

export type TheoKey =
  | "categories"
  | "subcategories"
  | "tags"
  | "references"
  | "collections"
  | "milestones"
  | "content"
  | "journey"
  | "afterSalah"
  | "settings"

type CrudKey = "categories" | "subcategories" | "tags" | "references" | "collections" | "milestones"

const LABEL: Record<TheoKey, string> = {
  categories: "categories",
  subcategories: "subcategories",
  tags: "tags",
  references: "references",
  collections: "collections",
  milestones: "milestones",
  content: "content",
  journey: "the daily journey",
  afterSalah: "after-salah settings",
  settings: "settings",
}

/** Load failures: a 404 means the route isn't deployed on this server, which a retry won't fix. */
function reportLoadError(key: TheoKey, err: unknown) {
  console.error(`Failed to load ${key}:`, err)
  if ((err as { status?: number })?.status === 404) {
    toast.error(`${LABEL[key][0].toUpperCase()}${LABEL[key].slice(1)} isn't available on this server yet.`, {
      id: `theo-missing-${key}`,
      description: "The backend hasn't deployed this endpoint — nothing is wrong with your account.",
    })
    return
  }
  toast.error(`Could not load ${LABEL[key]} from the server.`, { id: `theo-load-${key}` })
}

const SINGULAR: Record<CrudKey, string> = {
  categories: "category",
  subcategories: "subcategory",
  tags: "tag",
  references: "reference",
  collections: "collection",
  milestones: "milestone",
}

const CRUD = {
  categories: { api: adminApi.theocentric.categories, normalize: normalizeCategory },
  subcategories: { api: adminApi.theocentric.subcategories, normalize: normalizeSubcategory },
  tags: { api: adminApi.theocentric.tags, normalize: normalizeTag },
  references: { api: adminApi.theocentric.references, normalize: normalizeReference },
  collections: { api: adminApi.theocentric.collections, normalize: normalizeCollection },
  milestones: { api: adminApi.theocentric.milestones, normalize: normalizeMilestone },
} as const

function emptyData(): TheoData {
  return {
    content: [],
    categories: [],
    subcategories: [],
    collections: [],
    references: [],
    tags: [],
    journey: { sections: [] },
    afterSalah: [],
    featured: [],
    milestones: [],
    settings: DEFAULT_SETTINGS,
  }
}

interface TheoContextValue {
  data: TheoData
  // lazy loading (25 per page — Load more fetches the next page)
  ensureLoaded: (key: TheoKey) => void
  queryContent: (filters: ContentFilters) => void
  isLoading: (key: TheoKey) => boolean
  hasMore: (key: TheoKey) => boolean
  loadMore: (key: TheoKey) => void
  updateSettings: (patch: Partial<TheoSettings>) => Promise<boolean>
  // content
  addContent: (item: SpiritualContent) => void
  updateContent: (id: string, patch: Partial<SpiritualContent>) => void
  removeContent: (id: string) => void
  setContentStatus: (id: string, status: PublicationStatus) => void
  setVerification: (id: string, v: VerificationStatus) => void
  toggleFeatured: (id: string) => void
  duplicateContent: (id: string) => void
  reorderContent: (ids: string[]) => void
  bulkAction: (ids: string[], action: string, payload?: string) => Promise<void>
  // taxonomy
  addCategory: (c: TheoCategory) => void
  updateCategory: (id: string, patch: Partial<TheoCategory>) => void
  removeCategory: (id: string) => void
  addSubcategory: (s: TheoSubcategory) => void
  updateSubcategory: (id: string, patch: Partial<TheoSubcategory>) => void
  removeSubcategory: (id: string) => void
  addCollection: (c: TheoCollection) => void
  updateCollection: (id: string, patch: Partial<TheoCollection>) => void
  removeCollection: (id: string) => void
  addReference: (r: TheoReference) => void
  updateReference: (id: string, patch: Partial<TheoReference>) => void
  removeReference: (id: string) => void
  addTag: (t: TheoTag) => void
  updateTag: (id: string, patch: Partial<TheoTag>) => void
  removeTag: (id: string) => void
  // journey / after salah
  saveJourney: (sections: JourneySection[]) => Promise<boolean>
  saveAfterSalah: (entries: AfterSalahEntry[]) => Promise<boolean>
  // milestones
  addMilestone: (m: Milestone) => void
  updateMilestone: (id: string, patch: Partial<Milestone>) => void
  removeMilestone: (id: string) => void
}

const Ctx = createContext<TheoContextValue | null>(null)

export function useTheo(): TheoContextValue {
  const v = useContext(Ctx)
  if (!v) throw new Error("useTheo must be used within TheocentricProvider")
  return v
}

/** Loads the given resources the first time a page needs them (idempotent). */
export function useTheoLoad(...keys: Exclude<TheoKey, "content">[]) {
  const { ensureLoaded } = useTheo()
  const signature = keys.join(",")
  useEffect(() => {
    signature.split(",").filter(Boolean).forEach((k) => ensureLoaded(k as TheoKey))
  }, [ensureLoaded, signature])
}

/** Queries content with server-side filters; re-queries only when the filters change. */
export function useTheoContent(filters: ContentFilters) {
  const { queryContent } = useTheo()
  const signature = JSON.stringify(filters)
  useEffect(() => {
    queryContent(JSON.parse(signature) as ContentFilters)
  }, [queryContent, signature])
}

/**
 * The server answers PATCH calls with the full record, but be defensive: only
 * trust a response as a full record when it carries the identifying fields.
 */
function mergeContent(prev: SpiritualContent, raw: unknown, fallback: Partial<SpiritualContent>): SpiritualContent {
  const r = raw && typeof raw === "object" ? (raw as Raw) : null
  if (r && r.id && r.title !== undefined && r.kind !== undefined) return normalizeContent(r)
  const patch: Partial<SpiritualContent> = { ...fallback }
  if (r) {
    if (typeof r.status === "string") patch.status = r.status as PublicationStatus
    if (typeof r.verification === "string") patch.verification = r.verification as VerificationStatus
    if (typeof r.featured === "boolean") patch.featured = r.featured
    if (typeof r.updatedAt === "string") patch.updatedAt = r.updatedAt
  }
  return { ...prev, ...patch }
}

export function TheocentricProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<TheoData>(emptyData)
  const dataRef = useRef(data)
  dataRef.current = data

  const loadedRef = useRef<Partial<Record<TheoKey, boolean>>>({})
  const inFlightRef = useRef<Partial<Record<TheoKey, boolean>>>({})
  const [loadingKeys, setLoadingKeys] = useState<Partial<Record<TheoKey, boolean>>>({})
  const [pageState, setPageState] = useState<Partial<Record<TheoKey, { page: number; hasMore: boolean }>>>({})
  const contentFilters = useRef<ContentFilters | null>(null)
  const contentReq = useRef(0)
  const loadingRef = useRef(loadingKeys)
  loadingRef.current = loadingKeys

  const setLoading = (key: TheoKey, v: boolean) => setLoadingKeys((s) => ({ ...s, [key]: v }))

  // ---- loading -----------------------------------------------------------

  const loadCrudPage = useCallback(async (key: CrudKey, page: number) => {
    if (inFlightRef.current[key]) return
    inFlightRef.current[key] = true
    setLoading(key, true)
    try {
      const cfg = CRUD[key]
      const { items: raw, hasMore } = await (cfg.api.list as (p: number) => Promise<{ items: Raw[]; hasMore: boolean }>)(page)
      const items = raw.map(cfg.normalize as (r: Raw) => unknown)
      setData((d) => ({ ...d, [key]: page > 1 ? [...(d[key] as unknown[]), ...items] : items }) as TheoData)
      loadedRef.current[key] = true
      setPageState((s) => ({ ...s, [key]: { page, hasMore } }))
    } catch (err) {
      reportLoadError(key, err)
    } finally {
      inFlightRef.current[key] = false
      setLoading(key, false)
    }
  }, [])

  const loadContentPage = useCallback(async (page: number, filters: ContentFilters, req: number) => {
    setLoading("content", true)
    try {
      const { items: raw, hasMore } = await adminApi.theocentric.content.list<Raw>(page, { ...filters })
      if (req !== contentReq.current) return // a newer query superseded this one
      const items = raw.map(normalizeContent)
      setData((d) => ({ ...d, content: page > 1 ? [...d.content, ...items] : items }))
      loadedRef.current.content = true
      setPageState((s) => ({ ...s, content: { page, hasMore } }))
    } catch (err) {
      if (req !== contentReq.current) return
      console.error("Failed to load content:", err)
      toast.error("Could not load content from the server.")
    } finally {
      if (req === contentReq.current) setLoading("content", false)
    }
  }, [])

  const queryContent = useCallback(
    (filters: ContentFilters) => {
      const same = contentFilters.current && JSON.stringify(contentFilters.current) === JSON.stringify(filters)
      if (same && (loadedRef.current.content || loadingRef.current.content)) return
      contentFilters.current = filters
      const req = ++contentReq.current
      void loadContentPage(1, filters, req)
    },
    [loadContentPage],
  )

  const loadSingleton = useCallback(async (key: "journey" | "afterSalah" | "settings") => {
    if (inFlightRef.current[key]) return
    inFlightRef.current[key] = true
    setLoading(key, true)
    try {
      if (key === "journey") {
        const sections = normalizeJourney(await adminApi.theocentric.journey.get<unknown>())
        setData((d) => ({ ...d, journey: { sections } }))
      } else if (key === "afterSalah") {
        const entries = normalizeAfterSalah(await adminApi.theocentric.afterSalah.get<unknown>())
        setData((d) => ({ ...d, afterSalah: entries }))
      } else {
        const settings = normalizeSettings(await adminApi.theocentric.settings.get<unknown>())
        setData((d) => ({ ...d, settings }))
      }
      loadedRef.current[key] = true
    } catch (err) {
      reportLoadError(key, err)
    } finally {
      inFlightRef.current[key] = false
      setLoading(key, false)
    }
  }, [])

  const ensureLoaded = useCallback(
    (key: TheoKey) => {
      if (loadedRef.current[key] || inFlightRef.current[key]) return
      if (key === "content") return queryContent({})
      if (key === "journey" || key === "afterSalah" || key === "settings") return void loadSingleton(key)
      void loadCrudPage(key, 1)
    },
    [loadCrudPage, loadSingleton, queryContent],
  )

  const isLoading = useCallback((key: TheoKey) => Boolean(loadingKeys[key]), [loadingKeys])
  const hasMore = useCallback((key: TheoKey) => Boolean(pageState[key]?.hasMore), [pageState])
  const loadMore = useCallback(
    (key: TheoKey) => {
      const state = pageState[key]
      if (!state?.hasMore || loadingRef.current[key]) return
      if (key === "content") {
        void loadContentPage(state.page + 1, contentFilters.current ?? {}, contentReq.current)
      } else if (key !== "journey" && key !== "afterSalah" && key !== "settings") {
        void loadCrudPage(key, state.page + 1)
      }
    },
    [pageState, loadContentPage, loadCrudPage],
  )

  // ---- generic optimistic CRUD (categories, subcategories, tags, …) --------

  const add = useCallback((key: CrudKey, item: { id: string }) => {
    const cfg = CRUD[key]
    const create = cfg.api.create as (body: unknown) => Promise<Raw>
    setData((d) => ({ ...d, [key]: [item, ...(d[key] as { id: string }[])] }) as TheoData)
    const body =
      key === "collections"
        ? {
            ...toBody({ ...(item as TheoCollection), items: undefined }, "create"),
            items: collectionItemsBody((item as TheoCollection).items),
          }
        : toBody(item, "create")
    create(body)
      .then((res) => {
        const saved = res && (res as Raw).id ? (cfg.normalize as (r: Raw) => unknown)(res) : item
        setData((d) => ({ ...d, [key]: (d[key] as { id: string }[]).map((x) => (x.id === item.id ? saved : x)) }) as TheoData)
      })
      .catch((err) => {
        setData((d) => ({ ...d, [key]: (d[key] as { id: string }[]).filter((x) => x.id !== item.id) }) as TheoData)
        reportError(`create this ${SINGULAR[key]}`, err)
      })
  }, [])

  const update = useCallback((key: CrudKey, id: string, patch: Record<string, unknown>) => {
    const cfg = CRUD[key]
    const prev = (dataRef.current[key] as { id: string }[]).find((x) => x.id === id)
    if (!prev) return
    const diff = changedFields(prev as Record<string, unknown>, patch)
    if (Object.keys(diff).length === 0) return

    setData((d) => ({ ...d, [key]: (d[key] as { id: string }[]).map((x) => (x.id === id ? { ...x, ...diff } : x)) }) as TheoData)

    let body: Raw
    if (key === "collections") {
      const { items, ...rest } = diff as Partial<TheoCollection> & Record<string, unknown>
      body = toBody(rest, "update")
      // Omitting `items` leaves them untouched; sending it makes the server diff add/update/remove.
      if (items) body.items = collectionItemsBody(items)
    } else {
      body = toBody(diff, "update")
    }
    const send = cfg.api.update as (id: string, body: unknown) => Promise<Raw>
    send(id, body)
      .then((res) => {
        if (res && (res as Raw).id) {
          const saved = (cfg.normalize as (r: Raw) => unknown)(res)
          setData((d) => ({ ...d, [key]: (d[key] as { id: string }[]).map((x) => (x.id === id ? saved : x)) }) as TheoData)
        }
      })
      .catch((err) => {
        setData((d) => ({ ...d, [key]: (d[key] as { id: string }[]).map((x) => (x.id === id ? prev : x)) }) as TheoData)
        reportError(`save this ${SINGULAR[key]}`, err)
      })
  }, [])

  const removeItem = useCallback((key: CrudKey, id: string) => {
    const cfg = CRUD[key]
    const list = dataRef.current[key] as { id: string }[]
    const index = list.findIndex((x) => x.id === id)
    const prev = list[index]
    setData((d) => ({ ...d, [key]: (d[key] as { id: string }[]).filter((x) => x.id !== id) }) as TheoData)
    ;(cfg.api.remove as (id: string) => Promise<unknown>)(id).catch((err) => {
      // 409 explains why (child categories, content assigned, tag in use, in a collection…)
      setData((d) => {
        const current = d[key] as { id: string }[]
        const next = [...current]
        next.splice(Math.min(index, next.length), 0, prev)
        return { ...d, [key]: next } as TheoData
      })
      reportError(`delete this ${SINGULAR[key]}`, err)
    })
  }, [])

  // ---- content-specific --------------------------------------------------

  const patchContent = useCallback((id: string, fn: (c: SpiritualContent) => SpiritualContent) => {
    setData((d) => ({ ...d, content: d.content.map((c) => (c.id === id ? fn(c) : c)) }))
  }, [])

  const addContent = useCallback((item: SpiritualContent) => {
    setData((d) => ({ ...d, content: [item, ...d.content] }))
    adminApi.theocentric.content
      .create<Raw>(toBody(item, "create"))
      .then((res) => {
        const saved = res && res.id ? normalizeContent(res) : item
        setData((d) => ({ ...d, content: d.content.map((c) => (c.id === item.id ? saved : c)) }))
      })
      .catch((err) => {
        setData((d) => ({ ...d, content: d.content.filter((c) => c.id !== item.id) }))
        reportError("create this item", err)
      })
  }, [])

  const updateContent = useCallback(
    (id: string, patch: Partial<SpiritualContent>) => {
      const prev = dataRef.current.content.find((c) => c.id === id)
      if (!prev) return
      const diff = changedFields(prev, patch)
      if (Object.keys(diff).length === 0) return
      const body = toBody(diff, "update")
      if (Object.keys(body).length === 0) return // only server-owned fields changed
      patchContent(id, (c) => ({ ...c, ...diff }))
      adminApi.theocentric.content
        .update<Raw>(id, body)
        .then((res) => patchContent(id, (c) => mergeContent(c, res, {})))
        .catch((err) => {
          patchContent(id, () => prev)
          reportError("save this item", err)
        })
    },
    [patchContent],
  )

  const removeContent = useCallback((id: string) => {
    const list = dataRef.current.content
    const index = list.findIndex((c) => c.id === id)
    const prev = list[index]
    setData((d) => ({ ...d, content: d.content.filter((c) => c.id !== id) }))
    adminApi.theocentric.content.remove(id).catch((err) => {
      setData((d) => {
        const next = [...d.content]
        next.splice(Math.min(index, next.length), 0, prev)
        return { ...d, content: next }
      })
      reportError("delete this item", err)
    })
  }, [])

  const setContentStatus = useCallback(
    (id: string, status: PublicationStatus) => {
      const prev = dataRef.current.content.find((c) => c.id === id)
      if (!prev || prev.status === status) return
      patchContent(id, (c) => ({ ...c, status }))
      adminApi.theocentric.content
        .setStatus<Raw>(id, status)
        .then((res) => patchContent(id, (c) => mergeContent(c, res, { status })))
        .catch((err) => {
          patchContent(id, () => prev)
          reportError("change the status", err)
        })
    },
    [patchContent],
  )

  const setVerification = useCallback(
    (id: string, verification: VerificationStatus) => {
      const prev = dataRef.current.content.find((c) => c.id === id)
      if (!prev || prev.verification === verification) return
      patchContent(id, (c) => ({ ...c, verification }))
      adminApi.theocentric.content
        .setVerification<Raw>(id, verification)
        .then((res) => {
          // Marking "requires_correction" auto-flips a published item back to draft — take the server's word.
          patchContent(id, (c) => mergeContent(c, res, { verification }))
          if (verification === "requires_correction" && prev.status === "published") {
            toast.info("Marked as requires correction — moved back to draft.")
          }
        })
        .catch((err) => {
          patchContent(id, () => prev)
          reportError("change the verification", err)
        })
    },
    [patchContent],
  )

  const toggleFeatured = useCallback(
    (id: string) => {
      const prev = dataRef.current.content.find((c) => c.id === id)
      if (!prev) return
      patchContent(id, (c) => ({ ...c, featured: !prev.featured }))
      adminApi.theocentric.content
        .toggleFeatured<Raw>(id)
        .then((res) => patchContent(id, (c) => mergeContent(c, res, { featured: !prev.featured })))
        .catch((err) => {
          patchContent(id, () => prev)
          reportError("update featured", err)
        })
    },
    [patchContent],
  )

  const duplicateContent = useCallback((id: string) => {
    adminApi.theocentric.content
      .duplicate<Raw>(id)
      .then((res) => {
        if (!res || !res.id) return
        const copy = normalizeContent(res)
        setData((d) => {
          const i = d.content.findIndex((c) => c.id === id)
          const next = [...d.content]
          next.splice(i < 0 ? 0 : i + 1, 0, copy)
          return { ...d, content: next }
        })
        toast.success("Duplicated as a draft")
      })
      .catch((err) => reportError("duplicate this item", err))
  }, [])

  const reorderContent = useCallback((ids: string[]) => {
    const previous = dataRef.current.content
    setData((d) => ({
      ...d,
      content: d.content.map((c) => (ids.includes(c.id) ? { ...c, displayOrder: ids.indexOf(c.id) + 1 } : c)),
    }))
    adminApi.theocentric.content.reorder(ids).catch((err) => {
      setData((d) => ({ ...d, content: previous }))
      reportError("save the new order", err)
    })
  }, [])

  const bulkAction = useCallback(async (ids: string[], action: string, payload?: string) => {
    const items = ids
      .map((id) => dataRef.current.content.find((c) => c.id === id))
      .filter((c): c is SpiritualContent => Boolean(c))
    if (items.length === 0) return

    // The API refuses to publish unverified content — check up front so a bulk
    // publish is all-or-nothing instead of leaving a half-published selection.
    if (action === "publish") {
      const blocked = items.filter((c) => c.verification !== "verified")
      if (blocked.length > 0) {
        toast.error(
          `Cannot publish unverified content: ${blocked.map((c) => c.title || "Untitled").slice(0, 3).join(", ")}${blocked.length > 3 ? ` and ${blocked.length - 3} more` : ""}. Nothing was changed.`,
        )
        return
      }
    }
    if ((action === "category" || action === "tag" || action === "untag") && !payload) {
      toast.error("This action needs a value.")
      return
    }

    const content = adminApi.theocentric.content
    const run = (c: SpiritualContent): Promise<unknown> => {
      switch (action) {
        case "publish": return content.setStatus(c.id, "published")
        case "unpublish": return content.setStatus(c.id, "unpublished")
        case "archive": return content.setStatus(c.id, "archived")
        case "restore": return content.setStatus(c.id, "draft")
        case "verify": return content.setVerification(c.id, "verified")
        case "category": return content.update(c.id, { category: payload, subcategory: null })
        case "tag":
          return content.update(c.id, {
            tags: c.tags.some((t) => t.toLowerCase() === payload!.toLowerCase()) ? c.tags : [...c.tags, payload],
          })
        case "untag":
          return content.update(c.id, { tags: c.tags.filter((t) => t.toLowerCase() !== payload!.toLowerCase()) })
        default: return Promise.reject({ message: `Unknown action "${action}"` })
      }
    }

    const results = await Promise.allSettled(items.map(run))
    let failed = 0
    let firstReason = ""
    results.forEach((r, i) => {
      const c = items[i]
      if (r.status === "rejected") {
        failed++
        firstReason ||= (r.reason as { message?: string })?.message ?? ""
        return
      }
      patchContent(c.id, (cur) => mergeContent(cur, r.value, {}))
    })
    const ok = items.length - failed
    if (failed === 0) toast.success(`${ok} item${ok === 1 ? "" : "s"} updated`)
    else toast.error(`${ok} updated, ${failed} failed${firstReason ? `: ${firstReason}` : ""}`)
  }, [patchContent])

  // ---- journey / after salah / settings ------------------------------------

  const saveJourney = useCallback(async (sections: JourneySection[]) => {
    try {
      const res = await adminApi.theocentric.journey.save<unknown>({
        sections: sections.map((s) => ({
          key: s.key.trim(),
          label: s.label.trim(),
          required: s.required,
          collectionId: s.collectionId,
        })),
      })
      const saved = normalizeJourney(res)
      setData((d) => ({ ...d, journey: { sections: saved.length || sections.length === 0 ? saved : sections } }))
      return true
    } catch (err) {
      reportError("save the daily journey", err)
      return false
    }
  }, [])

  const saveAfterSalah = useCallback(async (entries: AfterSalahEntry[]) => {
    try {
      const res = await adminApi.theocentric.afterSalah.save<unknown>(afterSalahBody(entries))
      const saved = normalizeAfterSalah(res)
      setData((d) => ({ ...d, afterSalah: saved.length ? saved : entries }))
      return true
    } catch (err) {
      reportError("save the after-salah settings", err)
      return false
    }
  }, [])

  const updateSettings = useCallback(async (patch: Partial<TheoSettings>) => {
    const prev = dataRef.current.settings
    const diff = changedFields(prev, patch)
    if (Object.keys(diff).length === 0) return true
    setData((d) => ({ ...d, settings: { ...d.settings, ...diff } }))
    try {
      const res = await adminApi.theocentric.settings.save<unknown>(diff)
      if (res && typeof res === "object" && "verificationRequired" in (res as Raw)) {
        setData((d) => ({ ...d, settings: normalizeSettings(res) }))
      }
      return true
    } catch (err) {
      setData((d) => ({ ...d, settings: prev }))
      reportError("save the settings", err)
      return false
    }
  }, [])

  // ---- context value -------------------------------------------------------

  const value = useMemo<TheoContextValue>(
    () => ({
      data,
      ensureLoaded,
      queryContent,
      isLoading,
      hasMore,
      loadMore,
      updateSettings,
      addContent,
      updateContent,
      removeContent,
      setContentStatus,
      setVerification,
      toggleFeatured,
      duplicateContent,
      reorderContent,
      bulkAction,
      addCategory: (c) => add("categories", c),
      updateCategory: (id, patch) => update("categories", id, patch),
      removeCategory: (id) => removeItem("categories", id),
      addSubcategory: (s) => add("subcategories", s),
      updateSubcategory: (id, patch) => update("subcategories", id, patch),
      removeSubcategory: (id) => removeItem("subcategories", id),
      addCollection: (c) => add("collections", c),
      updateCollection: (id, patch) => update("collections", id, patch),
      removeCollection: (id) => removeItem("collections", id),
      addReference: (r) => add("references", r),
      updateReference: (id, patch) => update("references", id, patch),
      removeReference: (id) => removeItem("references", id),
      addTag: (t) => add("tags", t),
      updateTag: (id, patch) => update("tags", id, patch),
      removeTag: (id) => removeItem("tags", id),
      saveJourney,
      saveAfterSalah,
      addMilestone: (m) => add("milestones", m),
      updateMilestone: (id, patch) => update("milestones", id, patch),
      removeMilestone: (id) => removeItem("milestones", id),
    }),
    [
      data, ensureLoaded, queryContent, isLoading, hasMore, loadMore, updateSettings,
      addContent, updateContent, removeContent, setContentStatus, setVerification,
      toggleFeatured, duplicateContent, reorderContent, bulkAction, add, update,
      removeItem, saveJourney, saveAfterSalah,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
