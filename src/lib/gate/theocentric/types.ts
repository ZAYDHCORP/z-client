export type ContentKind = "dua" | "adkar" | "quranic" | "rabbana" | "ruqiyah"

export type VerificationStatus =
  | "unverified"
  | "under_review"
  | "verified"
  | "requires_correction"

export type PublicationStatus = "draft" | "published" | "unpublished" | "archived"

export type Routine =
  | "morning"
  | "evening"
  | "after_salah"
  | "before_sleep"
  | "upon_waking"
  | "daily"
  | "special"
  | "custom"

export const ROUTINE_LABELS: Record<Routine, string> = {
  morning: "Morning",
  evening: "Evening",
  after_salah: "After Salah",
  before_sleep: "Before Sleep",
  upon_waking: "Upon Waking",
  daily: "Daily Adhkars",
  special: "Special Occasion",
  custom: "Custom",
}

export interface SpiritualContent {
  id: string
  kind: ContentKind
  title: string
  arabic: string
  transliteration: string
  translation: string
  benefit: string
  notes: string
  repetition: string // "none" | "1" | "3" | "7" | "10" | "33" | "100" | custom number
  category: string // category id
  subcategory: string
  occasion: string
  tags: string[]
  quranReference: string
  hadithReference: string
  source: string
  displayOrder: number
  verification: VerificationStatus
  status: PublicationStatus
  routines: Routine[]
  isQuranic: boolean
  surahName: string
  surahNumber: number | null
  ayahRange: string
  rabbanaNumber: number | null
  featured: boolean
  collections: string[]
  createdAt: string
  updatedAt: string
}

export interface TheoCategory {
  id: string
  name: string
  description: string
  icon: string
  slug: string
  parent: string | null
  displayOrder: number
  visibility: boolean
  status: PublicationStatus
}

export interface TheoSubcategory {
  id: string
  name: string
  parent: string
  slug: string
  displayOrder: number
  hidden: boolean
  archived: boolean
}

export interface CollectionItem {
  contentId: string
  order: number
  required: boolean
  repetition: string
}

export interface TheoCollection {
  id: string
  name: string
  description: string
  icon: string
  cover: string
  items: CollectionItem[]
  status: PublicationStatus
}

export interface TheoReference {
  id: string
  type: "quran" | "hadith"
  surah: string
  ayah: string
  hadithCollection: string
  hadithNumber: string
  sourceBook: string
  referenceText: string
  authenticity: string
  notes: string
}

export interface TheoTag {
  id: string
  name: string
  slug: string
}

export interface JourneySection {
  key: string
  label: string
  required: boolean
  collectionId: string | null
}

export interface DailyJourneyConfig {
  sections: JourneySection[]
}

export type SalahName = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha"

export interface AfterSalahEntry {
  salah: SalahName
  collectionId: string | null
  items: { contentId: string; order: number; required: boolean }[]
}

export interface FeaturedEntry {
  id: string
  kind: ContentKind
  contentId: string
  displayOrder: number
  startDate: string
  endDate: string
}

export interface Milestone {
  id: string
  name: string
  description: string
  threshold: number
  active: boolean
}

export interface TheoSettings {
  defaultCategories: string[]
  defaultJourney: string[]
  verificationRequired: boolean
  publicationRules: string
  displayRules: string
  defaultOrdering: string
}

export interface TheoData {
  content: SpiritualContent[]
  categories: TheoCategory[]
  subcategories: TheoSubcategory[]
  collections: TheoCollection[]
  references: TheoReference[]
  tags: TheoTag[]
  journey: DailyJourneyConfig
  afterSalah: AfterSalahEntry[]
  featured: FeaturedEntry[]
  milestones: Milestone[]
  settings: TheoSettings
}
