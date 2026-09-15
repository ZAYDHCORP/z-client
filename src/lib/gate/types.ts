export type PlatformId = "IPN" | "IGC" | "IFR" | "ISR"
export type ContentType = "book" | "infographic" | "podcast" | "research"

export type ContentStatus =
  | "draft"
  | "scheduled"
  | "published"
  | "archived"
  | "unpublished"

export type VerificationStatus =
  | "unverified"
  | "under_review"
  | "verified"
  | "requires_correction"

export interface PlatformMeta {
  id: PlatformId
  name: string
  fullName: string
  tagline: string
  color: string
  softColor: string
  accent: string
  description: string
}

export interface SeoAeo {
  seoTitle: string
  metaDescription: string
  focusKeyword: string
  slug: string
  canonicalUrl: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  twitterCard: "summary" | "summary_large_image"
  schemaType: string
  robots: string
  aeoSummary: string
  faq: { question: string; answer: string }[]
}

export interface PurchaseLink {
  enabled: boolean
  url: string
}

export interface PurchaseLinks {
  paperback: PurchaseLink
  ebook: PurchaseLink
  amazon: PurchaseLink
  notionPress: PurchaseLink
  googlePlayBooks: PurchaseLink
  other: PurchaseLink
}

export interface BaseContent {
  id: string
  type: ContentType
  platform: PlatformId
  title: string
  slug: string
  status: ContentStatus
  category: string
  subcategory?: string
  tags: string[]
  regions: string[]
  topics: string[]
  featured: boolean
  pinned: boolean
  displayOrder: number
  views: number
  shares: number
  bookmarks: number
  createdAt: string
  updatedAt: string
  publishedAt?: string
  scheduledAt?: string
  author?: string
  description: string
  seo: SeoAeo
  feedPlacement: "default" | "top" | "hidden"
}

export interface BookContent extends BaseContent {
  type: "book"
  cover: string
  subtitle?: string
  pdfUrl?: string
  publicationInfo?: string
  purchaseLinks: PurchaseLinks
  freeSampleEnabled: boolean
  freeSamplePdf?: string
}

export interface ResearchContent extends BaseContent {
  type: "research"
  cover: string
  subtitle?: string
  pdfUrl?: string
  publicationInfo?: string
  purchaseLinks: PurchaseLinks
  freeSampleEnabled: boolean
  freeSamplePdf?: string
}

export interface InfographicContent extends BaseContent {
  type: "infographic"
  image: string
  caption: string
}

export interface PodcastEpisode extends BaseContent {
  type: "podcast"
  artwork: string
  audioUrl: string
  duration: string
  episodeNumber: number
  season?: number
  rssGuid: string
  originalTitle: string
  originalDescription: string
  feedId: string
  explicit: boolean
}

export type AnyContent =
  | BookContent
  | ResearchContent
  | InfographicContent
  | PodcastEpisode

export interface RssFeed {
  id: string
  platform: PlatformId
  title: string
  url: string
  lastSync?: string
  status: "healthy" | "degraded" | "error"
  totalEpisodes: number
  newLastSync: number
  autoSync: boolean
  frequency: string
}

export interface UserRecord {
  id: string
  name: string
  email: string
  avatarColor: string
  provider: "email" | "google" | "apple"
  verified: boolean
  membership: "none" | "active" | "expired" | "lifetime"
  plan?: string
  accountStatus: "active" | "suspended" | "pending"
  role: "user" | "admin" | "editor" | "analyst"
  joinedAt: string
  lastActive: string
  bookmarks: number
  downloads: number
  readingHours: number
  listeningHours: number
  interests: string[]
  followedCategories: string[]
}

export interface MembershipPlan {
  id: string
  name: string
  durationLabel: string
  priceINR: number
  popular?: boolean
  benefits: string[]
  active: boolean
  entitlements: string
}

export interface PaymentRecord {
  id: string
  userId: string
  userName: string
  plan: string
  amount: number
  currency: string
  status: "success" | "pending" | "failed" | "refunded" | "cancelled"
  method: string
  provider: string
  transactionRef: string
  createdAt: string
  membershipType: "subscription" | "lifetime"
}

export interface Category {
  id: string
  platform: PlatformId | "ALL"
  name: string
  slug: string
  description: string
  parent?: string
  displayOrder: number
  status: "active" | "archived"
  icon: string
  contentCount: number
}

export interface Tag {
  id: string
  name: string
  slug: string
  usage: number
  platform: PlatformId | "ALL"
}

export interface Region {
  id: string
  name: string
  slug: string
  type: "regional" | "international"
  usage: number
}

export interface Topic {
  id: string
  name: string
  slug: string
  usage: number
}

export interface ServiceRecord {
  id: string
  platform: PlatformId
  category: string
  title: string
  slug: string
  shortDescription: string
  fullDescription: string
  benefits: string[]
  pricingMode: "contact" | "paid" | "free"
  pricingText: string
  whatsappUrl: string
  externalUrl: string
  seoTitle: string
  status: ContentStatus
  displayOrder: number
  featured: boolean
  updatedAt: string
}

export interface SocialLink {
  id: string
  platform: PlatformId | "ALL"
  type:
    | "website"
    | "youtube"
    | "spotify"
    | "apple"
    | "instagram"
    | "facebook"
    | "linkedin"
    | "x"
    | "whatsapp_community"
    | "whatsapp_channel"
    | "whatsapp_contact"
    | "service_enquiry"
  label: string
  url: string
  displayOrder: number
  active: boolean
}

export interface MediaAsset {
  id: string
  name: string
  folder: string
  type: "image" | "pdf" | "audio"
  mime: string
  sizeKB: number
  width?: number
  height?: number
  altText: string
  url: string
  uploadedAt: string
  usedBy: number
  hash: string
  duplicateOf?: string
}

export interface NotificationRecord {
  id: string
  type:
    | "book"
    | "podcast"
    | "research"
    | "infographic"
    | "renewal"
    | "workshop"
    | "certificate"
    | "platform"
    | "featured"
    | "recommendation"
  title: string
  body: string
  platform?: PlatformId
  target: "all" | "members" | "free"
  status: "draft" | "scheduled" | "sent"
  scheduledAt?: string
  createdAt: string
  sentAt?: string
}

export interface AuditLog {
  id: string
  actor: string
  role: string
  action: string
  resource: string
  resourceId: string
  timestamp: string
  ip: string
  result: "success" | "failure"
  detail: string
}

export interface BadgeRule {
  id: string
  name: string
  type:
    | "daily_streak"
    | "weekly_streak"
    | "monthly_streak"
    | "learning"
    | "reading"
    | "podcast"
    | "research"
    | "category"
    | "anniversary"
  description: string
  icon: string
  active: boolean
  threshold: number
}

export interface ApiKey {
  id: string
  name: string
  key: string
  scope: string
  status: "active" | "revoked"
  lastUsed: string
  createdAt: string
  rateLimit: number
}

export interface BackupRecord {
  id: string
  name: string
  type: "full" | "media" | "config"
  sizeMB: number
  createdAt: string
  status: "completed" | "running" | "failed"
  verified: boolean
}

export interface SystemHealth {
  name: string
  status: "operational" | "degraded" | "down"
  latency: number
  detail: string
}

export interface ActivityEvent {
  id: string
  type: string
  title: string
  timestamp: string
  meta?: string
}
