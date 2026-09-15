import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { buildTheoSeed } from "./seed"
import type {
  AfterSalahEntry,
  DailyJourneyConfig,
  FeaturedEntry,
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

const STORAGE_KEY = "theo_admin_state_v1"

function initialData(): TheoData {
  return buildTheoSeed()
}

interface TheoContextValue {
  data: TheoData
  mounted: boolean
  save: () => void
  resetData: () => void
  updateSettings: (patch: Partial<TheoSettings>) => void
  // content
  addContent: (item: SpiritualContent) => void
  updateContent: (id: string, patch: Partial<SpiritualContent>) => void
  removeContent: (id: string) => void
  setContentStatus: (id: string, status: PublicationStatus) => void
  setVerification: (id: string, v: VerificationStatus) => void
  toggleFeatured: (id: string) => void
  duplicateContent: (id: string) => void
  reorderContent: (ids: string[]) => void
  bulkAction: (ids: string[], action: string, payload?: any) => void
  // categories
  addCategory: (c: TheoCategory) => void
  updateCategory: (id: string, patch: Partial<TheoCategory>) => void
  removeCategory: (id: string) => void
  // subcategories
  addSubcategory: (s: TheoSubcategory) => void
  updateSubcategory: (id: string, patch: Partial<TheoSubcategory>) => void
  removeSubcategory: (id: string) => void
  // collections
  addCollection: (c: TheoCollection) => void
  updateCollection: (id: string, patch: Partial<TheoCollection>) => void
  removeCollection: (id: string) => void
  // references
  addReference: (r: TheoReference) => void
  updateReference: (id: string, patch: Partial<TheoReference>) => void
  removeReference: (id: string) => void
  // tags
  addTag: (t: TheoTag) => void
  updateTag: (id: string, patch: Partial<TheoTag>) => void
  removeTag: (id: string) => void
  // journey / salah
  updateJourney: (j: DailyJourneyConfig) => void
  updateAfterSalah: (a: AfterSalahEntry[]) => void
  // featured
  addFeatured: (f: FeaturedEntry) => void
  updateFeatured: (id: string, patch: Partial<FeaturedEntry>) => void
  removeFeatured: (id: string) => void
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

let seq = 0
const uid = (p: string) => `${p}_${Date.now().toString(36)}_${(++seq).toString(36)}`

export function TheocentricProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<TheoData>(initialData)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as TheoData
        if (parsed && parsed.content) setData(parsed)
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

  const value = useMemo<TheoContextValue>(() => {
    const set = (patch: Partial<TheoData>) => setData((d) => ({ ...d, ...patch }))
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
      resetData: () => setData(initialData()),
      updateSettings: (patch) => set({ settings: { ...data.settings, ...patch } }),
      addContent: (item) => set({ content: [item, ...data.content] }),
      updateContent: (id, patch) =>
        set({
          content: data.content.map((x) =>
            x.id === id ? { ...x, ...patch, updatedAt: new Date().toISOString() } : x,
          ),
        }),
      removeContent: (id) => set({ content: data.content.filter((x) => x.id !== id) }),
      setContentStatus: (id, status) => set({ content: data.content.map((x) => (x.id === id ? { ...x, status, updatedAt: new Date().toISOString() } : x)) }),
      setVerification: (id, v) => set({ content: data.content.map((x) => (x.id === id ? { ...x, verification: v } : x)) }),
      toggleFeatured: (id) => set({ content: data.content.map((x) => (x.id === id ? { ...x, featured: !x.featured } : x)) }),
      duplicateContent: (id) =>
        set({
          content: data.content.flatMap((x) =>
            x.id === id
              ? [
                  x,
                  {
                    ...x,
                    id: uid(x.kind),
                    title: `${x.title} (Copy)`,
                    status: "draft" as const,
                    verification: "unverified" as const,
                    featured: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                ]
              : [x],
          ),
        }),
      reorderContent: (ids) =>
        set({
          content: data.content.map((x) =>
            ids.includes(x.id) ? { ...x, displayOrder: ids.indexOf(x.id) + 1 } : x,
          ),
        }),
      bulkAction: (ids, action, payload) =>
        set({
          content: data.content.map((x) => {
            if (!ids.includes(x.id)) return x
            if (action === "publish") return { ...x, status: "published" as const }
            if (action === "unpublish") return { ...x, status: "unpublished" as const }
            if (action === "archive") return { ...x, status: "archived" as const }
            if (action === "restore") return { ...x, status: "draft" as const }
            if (action === "verify") return { ...x, verification: "verified" as const }
            if (action === "category" && payload) return { ...x, category: payload }
            if (action === "tag" && payload) return { ...x, tags: Array.from(new Set([...x.tags, payload])) }
            if (action === "untag" && payload) return { ...x, tags: x.tags.filter((t) => t !== payload) }
            return x
          }),
        }),
      addCategory: (c) => set({ categories: [c, ...data.categories] }),
      updateCategory: (id, patch) => set({ categories: data.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) }),
      removeCategory: (id) => set({ categories: data.categories.filter((c) => c.id !== id) }),
      addSubcategory: (s) => set({ subcategories: [s, ...data.subcategories] }),
      updateSubcategory: (id, patch) => set({ subcategories: data.subcategories.map((s) => (s.id === id ? { ...s, ...patch } : s)) }),
      removeSubcategory: (id) => set({ subcategories: data.subcategories.filter((s) => s.id !== id) }),
      addCollection: (c) => set({ collections: [c, ...data.collections] }),
      updateCollection: (id, patch) => set({ collections: data.collections.map((c) => (c.id === id ? { ...c, ...patch } : c)) }),
      removeCollection: (id) => set({ collections: data.collections.filter((c) => c.id !== id) }),
      addReference: (r) => set({ references: [r, ...data.references] }),
      updateReference: (id, patch) => set({ references: data.references.map((r) => (r.id === id ? { ...r, ...patch } : r)) }),
      removeReference: (id) => set({ references: data.references.filter((r) => r.id !== id) }),
      addTag: (t) => set({ tags: [t, ...data.tags] }),
      updateTag: (id, patch) => set({ tags: data.tags.map((t) => (t.id === id ? { ...t, ...patch } : t)) }),
      removeTag: (id) => set({ tags: data.tags.filter((t) => t.id !== id) }),
      updateJourney: (j) => set({ journey: j }),
      updateAfterSalah: (a) => set({ afterSalah: a }),
      addFeatured: (f) => set({ featured: [f, ...data.featured] }),
      updateFeatured: (id, patch) => set({ featured: data.featured.map((f) => (f.id === id ? { ...f, ...patch } : f)) }),
      removeFeatured: (id) => set({ featured: data.featured.filter((f) => f.id !== id) }),
      addMilestone: (m) => set({ milestones: [m, ...data.milestones] }),
      updateMilestone: (id, patch) => set({ milestones: data.milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)) }),
      removeMilestone: (id) => set({ milestones: data.milestones.filter((m) => m.id !== id) }),
    }
  }, [data, mounted])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
          <span className="text-sm">Loading Theocentric & Doxology Admin…</span>
        </div>
      </div>
    )
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
