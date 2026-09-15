import type { BookItemData } from "@/components/BookDetailModal";
import type { InfographicPostData } from "@/components/InfographicFocusedView";

export type PlatformKey = "IPN" | "IGC" | "IFR" | "ISR";

export const platforms: Record<PlatformKey, {
  name: string;
  promise: string;
  tone: string;
  categories: string[];
  services: string[];
  rss: string;
  socials: string[];
}> = {
  IPN: {
    name: "International Public Network",
    promise: "For Planet, People, Progress & Policies.",
    tone: "from-sky-500/20 via-cyan-400/10 to-slate-950/5",
    categories: ["World", "Politics & Governance", "Business & Economy", "Society", "Environment & Climate", "Law & Justice", "Science & Technology", "Health", "Education", "Security & Defence", "Culture & Lifestyle", "Sports"],
    services: ["Advertising", "API Access", "Events", "Journalism Live Online/Offline Workshops", "Memberships", "Merchandise", "Public Affairs Consulting", "Research Reports"],
    rss: "https://anchor.fm/s/1154f5ab8/podcast/rss",
    socials: ["Website", "YouTube", "Spotify", "Apple Podcasts", "Instagram", "Facebook", "LinkedIn", "X", "WhatsApp Community", "WhatsApp Channel", "Contact"],
  },
  IGC: {
    name: "Inspire Guide Connect",
    promise: "Career, motivation, productivity and leadership growth.",
    tone: "from-amber-400/25 via-orange-300/10 to-stone-950/5",
    categories: ["Career Development", "Motivation", "Leadership & Growth Mindset", "Productivity & Time Management", "Business & Entrepreneurship", "Communication & Public Speaking Skills", "Environmental Sustainability"],
    services: ["Management Consulting", "Career & Employability Live Online/Offline Workshops", "Productivity & Time Management Live Online/Offline Workshops", "Books", "Memberships", "Patrons & Donations"],
    rss: "https://anchor.fm/s/109d1667c/podcast/rss",
    socials: ["Website", "YouTube", "Spotify", "Apple Podcasts", "Instagram", "Facebook", "LinkedIn", "X", "Students Community", "Professionals Community", "Corporate Community", "WhatsApp Contact"],
  },
  IFR: {
    name: "Integrity Finance Research",
    promise: "Ethical finance, markets, literacy and economic research.",
    tone: "from-emerald-500/20 via-teal-300/10 to-zinc-950/5",
    categories: ["Ethical Finance", "Ethical Banking", "Shariah Governance", "Economics", "Indian Economy", "Global Economy", "Industry Analysis", "Company Research", "Financial Markets", "Public Policy", "Financial Literacy"],
    services: ["Research Reports", "Books", "Memberships", "Financial Literacy Live Online/Offline Workshops", "Patrons & Donations"],
    rss: "https://anchor.fm/s/e7ad1b40/podcast/rss",
    socials: ["Website", "YouTube", "Spotify", "Apple Podcasts", "Instagram", "Facebook", "LinkedIn", "X", "Author Books", "Research Projects", "WhatsApp Contact"],
  },
  ISR: {
    name: "Ideological Studies Research",
    promise: "Quran, Hadith, theology, ethics and contemporary issues.",
    tone: "from-rose-500/20 via-stone-300/10 to-black/5",
    categories: ["Quranic Studies (6,236 Verses)", "Tafsir Ibn Kathir (6,236 Verses)", "Hadith Studies (68,061 Hadiths)", "Sahih Bukhari (7,563 Hadiths)", "Sahih Muslim (7,563 Hadiths)", "Sunan Abu Dawud (5,274 Hadiths)", "Jami at Tirmidhi (3,956 Hadiths)", "Sunan an Nasai (5,758 Hadiths)", "Sunan Ibn Majah (4,341 Hadiths)", "Al Muwatta by Imam Malik (1,861 Hadiths)", "Musnad Ahmad ibn Hanbal (28,199 Hadiths)", "Sunan ad Darimi (3,546 Hadiths)", "Creed and Theology", "Theological Jurisprudence", "Theological History", "Theological Ethics", "Science and Theology", "Feminism and Theology", "Terrorism and Theology", "Relationships and Theology", "Prophetic and Companion Biographies", "Contemporary Theological Issues"],
    services: ["Research Reports", "Books", "Memberships", "Theological Live Online/Offline Workshops", "Patrons and Donations"],
    rss: "https://anchor.fm/s/f49f1ccc/podcast/rss",
    socials: ["Website", "YouTube", "Spotify", "Apple Podcasts", "Instagram", "Facebook", "LinkedIn", "X", "Microsoft Teams", "WhatsApp Contact"],
  },
};

export const nav = ["Home", "Services", "Gate Feed", "Search", "Membership", "Dashboard", "Z Web App"];
export const contentTypes = ["All", "Books", "Infographics", "Podcasts", "Research Reports"];

// Placeholder catalogue content shown alongside the live RSS podcast feed,
// pending dedicated books/infographics backend endpoints.
export const sampleBooks: BookItemData[] = [
  {
    id: "b1",
    type: "Books",
    platform: "IPN",
    title: "World Policy & Ethical Governance Handbook",
    subtitle: "Frameworks for Modern Public Affairs and Sustainable Progress",
    author: "Dr. Zayd Haji",
    description: "A landmark treatise detailing connected frameworks for international diplomacy, law, public policy, and ecological responsibility across interconnected global networks.",
    category: "World",
    tags: ["World", "Global", "Politics"],
    freeSampleEnabled: true,
    purchaseLinks: {
      amazonEnabled: true,
      amazonUrl: "https://amazon.com",
      notionPressEnabled: true,
      notionPressUrl: "https://notionpress.com",
      googlePlayEnabled: true,
      googlePlayUrl: "https://play.google.com/store/books",
    },
  },
  {
    id: "b2",
    type: "Books",
    platform: "IGC",
    title: "Global Productivity & Mindset Playbook",
    subtitle: "Navigating Time, Leadership and Career Growth",
    author: "Dr. Zayd Haji",
    description: "Essential strategies for cultivating personal resilience, effective communication, time mastery, and visionary leadership in modern corporate and entrepreneurial environments.",
    category: "Productivity & Time Management",
    tags: ["Productivity", "Leadership", "Career"],
    freeSampleEnabled: true,
    purchaseLinks: {
      amazonEnabled: true,
      amazonUrl: "https://amazon.com",
      googlePlayEnabled: true,
      googlePlayUrl: "https://play.google.com/store/books",
    },
  },
  {
    id: "b3",
    type: "Research Reports",
    platform: "IFR",
    title: "World Economy & Ethical Finance Outlook",
    subtitle: "Macroeconomic Analysis, Banking Governance & Shariah Policy",
    author: "Dr. Zayd Haji",
    description: "In-depth economic research examining ethical financial systems, public market trends, banking governance, and sustainable investment frameworks across global markets.",
    category: "Global Economy",
    tags: ["Finance", "Economy", "Markets"],
    freeSampleEnabled: true,
    purchaseLinks: {
      googlePlayEnabled: true,
      googlePlayUrl: "https://play.google.com/store/books",
    },
  },
];

export const sampleInfographics: InfographicPostData[] = [
  {
    id: "info-1",
    platform: "IPN",
    title: "Global Public Policy & Environmental Architecture",
    caption: "A comprehensive 4:5 visual guide breaking down international policy frameworks, ecological targets, law reform, and multi-lateral public networks across 12 strategic global sectors.\n\nKey Highlights:\n• Connected governance frameworks\n• Sustainable economic transitions\n• Environmental protection compliance\n• Multi-stakeholder diplomacy roadmaps",
    imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80",
    category: "Environment & Climate",
    tags: ["World", "Climate", "Policy"],
    views: 2840,
    publishedAt: "Today",
  },
  {
    id: "info-2",
    platform: "IGC",
    title: "The 7 Pillars of Modern Leadership & Productivity",
    caption: "Transform your daily workflow with these proven time management techniques, growth mindset principles, and effective communication frameworks designed for leaders and emerging professionals.",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
    category: "Career Development",
    tags: ["Productivity", "Leadership", "Career"],
    views: 1950,
    publishedAt: "2 days ago",
  },
];

export const contentLibrary = [
  { platform: "IPN", type: "Books", title: "World Policy Handbook", category: "World", tags: ["World", "Global", "Politics"], description: "A premium IPN book entry connected to global public affairs." },
  { platform: "IPN", type: "Research Reports", title: "Climate, Society and Progress", category: "Environment & Climate", tags: ["Climate", "Policy", "Global"], description: "IPN research on climate policy, society and governance." },
  { platform: "IPN", type: "Infographics", title: "World Governance Map", category: "Politics & Governance", tags: ["Governance", "United Nations", "Public Affairs"], description: "IPN visual guide for global governance systems." },
  { platform: "IGC", type: "Books", title: "Global Productivity Playbook", category: "Productivity & Time Management", tags: ["Productivity", "Time Management", "Leadership"], description: "IGC productivity book connected to skills, work and career development." },
  { platform: "IGC", type: "Infographics", title: "Career Growth Ladder", category: "Career Development", tags: ["Career", "Employability", "Growth Mindset"], description: "IGC career development visual guide for students and professionals." },
  { platform: "IGC", type: "Podcasts", title: "Leadership Mindset Briefing", category: "Leadership & Growth Mindset", tags: ["Leadership", "Motivation", "Communication"], description: "IGC podcast for leadership, communication and motivation." },
  { platform: "IFR", type: "Books", title: "World Economy and Ethical Finance", category: "Global Economy", tags: ["Finance", "Economy", "Markets"], description: "IFR book on ethical finance and the global economy." },
  { platform: "IFR", type: "Research Reports", title: "Ethical Banking Outlook", category: "Ethical Banking", tags: ["Ethical Banking", "Shariah Governance", "Financial Literacy"], description: "IFR research report on banking governance and literacy." },
  { platform: "IFR", type: "Podcasts", title: "Global Markets Briefing", category: "Financial Markets", tags: ["Financial Markets", "Company Research", "Public Policy"], description: "IFR podcast indexed by markets, policy and research tags." },
  { platform: "ISR", type: "Books", title: "Theology in a Connected World", category: "Contemporary Theological Issues", tags: ["Theology", "Society", "Ethics"], description: "ISR book on theology, society and contemporary discourse." },
  { platform: "ISR", type: "Research Reports", title: "Hadith Studies Reference Guide", category: "Hadith Studies (68,061 Hadiths)", tags: ["Hadith", "Sahih Bukhari", "Sahih Muslim"], description: "ISR research guide for Hadith studies and classical sources." },
  { platform: "ISR", type: "Infographics", title: "Quranic Studies Pathway", category: "Quranic Studies (6,236 Verses)", tags: ["Quran", "Tafsir", "Theology"], description: "ISR infographic pathway for Quranic studies and Tafsir." },
] as const;

export const hubTags: Record<PlatformKey, string[]> = {
  IPN: ["World", "Global", "Politics", "Governance", "Climate", "Policy", "United Nations", "Public Affairs", "Society", "Environment", "Security", "Culture"],
  IGC: ["Career", "Employability", "Motivation", "Leadership", "Growth Mindset", "Productivity", "Time Management", "Entrepreneurship", "Communication", "Public Speaking", "Sustainability"],
  IFR: ["Finance", "Economy", "Markets", "Ethical Banking", "Shariah Governance", "Financial Literacy", "Company Research", "Public Policy", "Industry Analysis", "Ethical Finance"],
  ISR: ["Quran", "Tafsir", "Hadith", "Sahih Bukhari", "Sahih Muslim", "Theology", "Ethics", "Creed", "Jurisprudence", "Prophetic Biography", "Contemporary Issues"],
};
