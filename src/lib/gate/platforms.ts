import type { PlatformMeta, PlatformId } from "./types"

export const PLATFORMS: PlatformMeta[] = [
  {
    id: "IPN",
    name: "IPN",
    fullName: "International Public Network",
    tagline: "For Planet, People, Progress & Policies.",
    color: "#0ea5e9",
    softColor: "rgba(14,165,233,0.12)",
    accent: "#0284c7",
    description:
      "World, politics, economy, society, environment, science, health, education and global affairs.",
  },
  {
    id: "IGC",
    name: "IGC",
    fullName: "Inspire Guide Connect",
    tagline: "Career. Motivation. Growth.",
    color: "#10b981",
    softColor: "rgba(16,185,129,0.12)",
    accent: "#059669",
    description:
      "Career development, motivation, leadership, productivity, entrepreneurship and communication.",
  },
  {
    id: "IFR",
    name: "IFR",
    fullName: "Integrity Finance Research",
    tagline: "Ethical finance. Real research.",
    color: "#f59e0b",
    softColor: "rgba(245,158,11,0.12)",
    accent: "#d97706",
    description:
      "Ethical finance, banking, economics, markets, industry analysis and public policy.",
  },
  {
    id: "ISR",
    name: "ISR",
    fullName: "Ideological Studies Research",
    tagline: "Quranic studies. Theology. Hadith.",
    color: "#8b5cf6",
    softColor: "rgba(139,92,246,0.12)",
    accent: "#7c3aed",
    description:
      "Quranic studies, tafsir, hadith, creed, theology, history and contemporary issues.",
  },
]

export const PLATFORM_MAP: Record<PlatformId, PlatformMeta> = PLATFORMS.reduce(
  (acc, p) => {
    acc[p.id] = p
    return acc
  },
  {} as Record<PlatformId, PlatformMeta>,
)

export function platformColor(id: PlatformId | "ALL"): string {
  if (id === "ALL") return "#64748b"
  return PLATFORM_MAP[id]?.color ?? "#64748b"
}

export const PLATFORM_CATEGORIES: Record<PlatformId, string[]> = {
  IPN: [
    "World",
    "Politics & Governance",
    "Business & Economy",
    "Society",
    "Environment & Climate",
    "Law & Justice",
    "Science & Technology",
    "Health",
    "Education",
    "Security & Defence",
    "Culture & Lifestyle",
    "Sports",
  ],
  IGC: [
    "Career Development",
    "Motivation",
    "Leadership & Growth Mindset",
    "Productivity & Time Management",
    "Business & Entrepreneurship",
    "Communication & Public Speaking Skills",
    "Environmental Sustainability",
  ],
  IFR: [
    "Ethical Finance",
    "Ethical Banking",
    "Shariah Governance",
    "Economics",
    "Indian Economy",
    "Global Economy",
    "Industry Analysis",
    "Company Research",
    "Financial Markets",
    "Public Policy",
    "Financial Literacy",
  ],
  ISR: [
    "Quranic Studies",
    "Tafsir Ibn Kathir",
    "Hadith Studies",
    "Sahih Bukhari",
    "Sahih Muslim",
    "Creed and Theology",
    "Theological Jurisprudence",
    "Theological History",
    "Theological Ethics",
    "Science and Theology",
    "Feminism and Theology",
    "Terrorism and Theology",
    "Relationships and Theology",
    "Prophetic and Companion Biographies",
    "Contemporary Theological Issues",
  ],
}
