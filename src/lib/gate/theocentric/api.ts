import type {
  AfterSalahEntry,
  CollectionItem,
  ContentKind,
  JourneySection,
  Milestone,
  PublicationStatus,
  Routine,
  SalahName,
  SpiritualContent,
  TheoCategory,
  TheoCollection,
  TheoReference,
  TheoSettings,
  TheoSubcategory,
  TheoTag,
  VerificationStatus,
} from "./types"

type Raw = Record<string, unknown>

const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : v == null ? fallback : String(v))
const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback)
const numOr = (v: unknown, fallback: number) => {
  const n = typeof v === "number" ? v : Number(v)
  return v != null && v !== "" && Number.isFinite(n) ? n : fallback
}
const numOrNull = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : Number(v)
  return v != null && v !== "" && Number.isFinite(n) ? n : null
}
const obj = (v: unknown): Raw => (v && typeof v === "object" ? (v as Raw) : {})

/** Relations may arrive as a bare id or as an embedded `{ id, … }` object. */
function refId(v: unknown): string {
  if (typeof v === "string") return v
  if (v && typeof v === "object" && "id" in v) return str((v as Raw).id)
  return ""
}

// ─────────────────────────── normalizers (API → UI) ───────────────────────────

export function normalizeCategory(r: Raw): TheoCategory {
  return {
    id: str(r.id),
    name: str(r.name),
    description: str(r.description),
    icon: str(r.icon),
    slug: str(r.slug),
    parent: refId(r.parent ?? r.parentId) || null,
    displayOrder: numOr(r.displayOrder, 0),
    visibility: bool(r.visibility, true),
    status: str(r.status, "published") as PublicationStatus,
  }
}

export function normalizeSubcategory(r: Raw): TheoSubcategory {
  return {
    id: str(r.id),
    name: str(r.name),
    parent: refId(r.parent ?? r.parentId),
    slug: str(r.slug),
    displayOrder: numOr(r.displayOrder, 0),
    hidden: bool(r.hidden, false),
    archived: bool(r.archived, false),
  }
}

export function normalizeTag(r: Raw): TheoTag {
  return { id: str(r.id), name: str(r.name), slug: str(r.slug) }
}

export function normalizeReference(r: Raw): TheoReference {
  return {
    id: str(r.id),
    type: r.type === "hadith" ? "hadith" : "quran",
    surah: str(r.surah),
    ayah: str(r.ayah),
    hadithCollection: str(r.hadithCollection),
    hadithNumber: str(r.hadithNumber),
    sourceBook: str(r.sourceBook),
    referenceText: str(r.referenceText),
    authenticity: str(r.authenticity),
    notes: str(r.notes),
  }
}

export function normalizeContent(r: Raw): SpiritualContent {
  const tags = Array.isArray(r.tags)
    ? (r.tags as unknown[]).map((t) => (typeof t === "string" ? t : str(obj(t).name))).filter(Boolean)
    : []
  const collections = Array.isArray(r.collections)
    ? (r.collections as unknown[]).map(refId).filter(Boolean)
    : []
  const routines = (Array.isArray(r.routines) ? r.routines : Array.isArray(r.routine) ? r.routine : []) as Routine[]
  const now = new Date().toISOString()
  return {
    id: str(r.id),
    kind: str(r.kind, "dua") as ContentKind,
    title: str(r.title),
    arabic: str(r.arabic),
    transliteration: str(r.transliteration),
    translation: str(r.translation),
    benefit: str(r.benefit),
    notes: str(r.notes),
    repetition: str(r.repetition, "none") || "none",
    category: refId(r.category ?? r.categoryId),
    subcategory: refId(r.subcategory ?? r.subcategoryId),
    occasion: str(r.occasion),
    tags,
    quranReference: str(r.quranReference),
    hadithReference: str(r.hadithReference),
    source: str(r.source),
    displayOrder: numOr(r.displayOrder, 0),
    verification: str(r.verification, "unverified") as VerificationStatus,
    status: str(r.status, "draft") as PublicationStatus,
    routines,
    isQuranic: bool(r.isQuranic, false),
    surahName: str(r.surahName),
    surahNumber: numOrNull(r.surahNumber),
    ayahRange: str(r.ayahRange),
    rabbanaNumber: numOrNull(r.rabbanaNumber),
    featured: bool(r.featured, false),
    collections,
    createdAt: str(r.createdAt, now),
    updatedAt: str(r.updatedAt, now),
  }
}

function normalizeItem(r: Raw): CollectionItem {
  return {
    contentId: refId(r.contentId ?? r.content),
    order: numOr(r.order, 0),
    required: bool(r.required, false),
    repetition: str(r.repetition, "none") || "none",
  }
}

export function normalizeCollection(r: Raw): TheoCollection {
  const items = Array.isArray(r.items) ? (r.items as Raw[]).map(normalizeItem) : []
  return {
    id: str(r.id),
    name: str(r.name),
    description: str(r.description),
    icon: str(r.icon),
    cover: str(r.cover),
    items: items.sort((a, b) => a.order - b.order),
    status: str(r.status, "published") as PublicationStatus,
  }
}

export function normalizeMilestone(r: Raw): Milestone {
  return {
    id: str(r.id),
    name: str(r.name),
    description: str(r.description),
    threshold: numOr(r.threshold, 1),
    active: bool(r.active, true),
  }
}

export function normalizeJourney(raw: unknown): JourneySection[] {
  const sections = obj(raw).sections
  if (!Array.isArray(sections)) return []
  return (sections as Raw[]).map((s) => ({
    key: str(s.key),
    label: str(s.label),
    required: bool(s.required, false),
    collectionId: refId(s.collectionId ?? s.collection) || null,
  }))
}

export function normalizeAfterSalah(raw: unknown): AfterSalahEntry[] {
  const entries = obj(raw).entries
  if (!Array.isArray(entries)) return []
  return (entries as Raw[]).map((e) => ({
    salah: str(e.salah) as SalahName,
    collectionId: refId(e.collectionId ?? e.collection) || null,
    items: Array.isArray(e.items)
      ? (e.items as Raw[]).map((i) => ({
          contentId: refId(i.contentId ?? i.content),
          order: numOr(i.order, 0),
          required: bool(i.required, false),
        }))
      : [],
  }))
}

export const DEFAULT_SETTINGS: TheoSettings = {
  defaultCategories: [],
  defaultJourney: [],
  verificationRequired: true,
  publicationRules: "",
  displayRules: "",
  defaultOrdering: "displayOrder asc",
}

export function normalizeSettings(raw: unknown): TheoSettings {
  const r = obj(raw)
  return {
    defaultCategories: Array.isArray(r.defaultCategories) ? (r.defaultCategories as unknown[]).map(refId).filter(Boolean) : [],
    defaultJourney: Array.isArray(r.defaultJourney) ? (r.defaultJourney as unknown[]).map(String) : [],
    verificationRequired: bool(r.verificationRequired, true),
    publicationRules: str(r.publicationRules),
    displayRules: str(r.displayRules),
    defaultOrdering: str(r.defaultOrdering, DEFAULT_SETTINGS.defaultOrdering),
  }
}

// ─────────────────────────── request bodies (UI → API) ───────────────────────────

/** Fields the server owns or derives — never sent back. */
const SERVER_OWNED = new Set(["id", "createdAt", "updatedAt", "collections", "usage"])

/** Keys where `null` is a meaningful "clear this" on update (e.g. `{ parent: null }`). */
const NULLABLE_ON_UPDATE = new Set(["parent", "subcategory"])

/**
 * Create bodies drop empty strings / nulls so optional fields are simply
 * absent (an empty `cover` or `subcategory` would fail URL/UUID validation).
 * Update bodies are already diffs (see `changedFields`), so an empty string
 * there is an intentional clear; the nullable relations convert to `null`.
 */
export function toBody(record: object, mode: "create" | "update"): Raw {
  const out: Raw = {}
  for (const [k, v] of Object.entries(record)) {
    if (SERVER_OWNED.has(k) || v === undefined) continue
    if (mode === "create") {
      if (v === "" || v === null) continue
      if (Array.isArray(v) && v.length === 0 && k !== "items") continue
    } else if (v === "" && NULLABLE_ON_UPDATE.has(k)) {
      out[k] = null
      continue
    } else if (v === null && !NULLABLE_ON_UPDATE.has(k)) {
      continue
    }
    out[k] = v
  }
  return out
}

/** Only the keys whose value actually changed — keeps PUT bodies partial, as the API expects. */
export function changedFields<T extends object>(prev: T | undefined, next: Partial<T>): Partial<T> {
  if (!prev) return next
  const out: Partial<T> = {}
  for (const k of Object.keys(next) as (keyof T)[]) {
    if (JSON.stringify(prev[k]) !== JSON.stringify(next[k])) out[k] = next[k]
  }
  return out
}

export function collectionItemsBody(items: CollectionItem[]) {
  return items.map((i) => ({
    contentId: i.contentId,
    order: i.order,
    required: i.required,
    repetition: i.repetition || "none",
  }))
}

export function afterSalahBody(entries: AfterSalahEntry[]) {
  return {
    entries: entries
      // Blank prayers are simply left out — the API doesn't require all five.
      .filter((e) => e.collectionId || e.items.length > 0)
      .map((e) => ({
        salah: e.salah,
        ...(e.collectionId ? { collectionId: e.collectionId } : {}),
        items: e.items.map((i) => ({ contentId: i.contentId, order: i.order, required: i.required })),
      })),
  }
}
