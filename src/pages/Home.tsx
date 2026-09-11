import { Logo } from "@/components/Logo";
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Bookmark,
  Check,
  ChevronRight,
  Download,
  FileText,
  Globe2,
  Headphones,
  HeartPulse,
  Image as ImageIcon,
  LayoutDashboard,
  Menu,
  Moon,
  Pause,
  Play,
  Repeat,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Sun,
  User,
  Volume2,
  WalletCards,
  X,
  FileCode,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { playHeartbeatSound } from "@/components/HeartbeatAudio";
import GateReader, { BookSampleData } from "@/components/GateReader";
import BookDetailModal, { BookItemData } from "@/components/BookDetailModal";
import InfographicFocusedView, { InfographicPostData } from "@/components/InfographicFocusedView";
import PodcastTranscriptModal, { TranscriptSegment } from "@/components/PodcastTranscriptModal";
import UserProfileAnalyticsModal from "@/components/UserProfileAnalyticsModal";
import ServiceLandingModal from "@/components/ServiceLandingModal";
import { hubs, hubByKey, gateSocials, zSocials } from "@/lib/gate-data";
import SocialLinks from "@/components/SocialLinks";
import { Typewriter } from "@/components/TypeWriter";
import { API } from "@/lib/constants";
import { ClientUser, fetchCurrentUser, getCachedUser } from "@/lib/client-auth";

type PlatformKey = "IPN" | "IGC" | "IFR" | "ISR";

type Episode = {
  platform: PlatformKey | "Z";
  podcastTitle?: string;
  creator?: string;
  title: string;
  description: string;
  transcript?: TranscriptSegment[];
  audioUrl: string;
  image: string;
  duration?: string;
  episodeUrl?: string;
  pubDate: string;
};

const platforms: Record<PlatformKey, {
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

const plans = [
  ["Monthly", "₹99", "Flexible", "Just ₹3.30/day."],
  ["1 Year", "₹799", "Popular", "Only ₹66.58/month. Recommended for regular learners."],
  ["3 Years", "₹2,199", "Value", "Just ₹61.08/month for uninterrupted access."],
  ["5 Years", "₹3,499", "Savings", "Only ₹58.32/month with long-term savings."],
  ["7 Years", "₹4,699", "Commitment", "Just ₹55.94/month for committed members."],
  ["9 Years", "₹5,799", "Legacy", "Only ₹53.69/month, best long-term value."],
];

const nav = ["Home", "Services", "Gate Feed", "Search", "Membership", "Dashboard", "Z Web App"];
const contentTypes = ["All", "Books", "Infographics", "Podcasts", "Research Reports"];

const sampleBooks: BookItemData[] = [
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

const sampleInfographics: InfographicPostData[] = [
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

const contentLibrary = [
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

const hubTags: Record<PlatformKey, string[]> = {
  IPN: ["World", "Global", "Politics", "Governance", "Climate", "Policy", "United Nations", "Public Affairs", "Society", "Environment", "Security", "Culture"],
  IGC: ["Career", "Employability", "Motivation", "Leadership", "Growth Mindset", "Productivity", "Time Management", "Entrepreneurship", "Communication", "Public Speaking", "Sustainability"],
  IFR: ["Finance", "Economy", "Markets", "Ethical Banking", "Shariah Governance", "Financial Literacy", "Company Research", "Public Policy", "Industry Analysis", "Ethical Finance"],
  ISR: ["Quran", "Tafsir", "Hadith", "Sahih Bukhari", "Sahih Muslim", "Theology", "Ethics", "Creed", "Jurisprudence", "Prophetic Biography", "Contemporary Issues"],
};


function PlatformLogo({ id }: { id: PlatformKey | "Z" }) {
  if (id === "Z") {
    return (
      <div className="flex items-center gap-4">
        <img src="/z-logo.png" alt="Z | ZAYDH logo" className="h-20 w-20 rounded-2xl object-contain mix-blend-multiply dark:mix-blend-screen" />
        <div>
          <span className="block text-3xl font-black tracking-tight text-zinc-950 dark:text-white">Z</span>
          <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-300">ZAYDH Productivity & Automation</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <span className="font-serif text-5xl font-black tracking-tight text-zinc-950 dark:text-white">{id}</span>
      <span className="mb-1 flex items-center gap-1 font-serif text-xl font-bold"><span className="size-2 rounded-full bg-current" />Gate</span>
    </div>
  );
}

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [active, setActive] = useState<PlatformKey>("IPN");
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [playing, setPlaying] = useState(false);
  const [user, setUser] = useState<ClientUser | null>(() => getCachedUser());
  const navigate = useNavigate();
  const signedIn = Boolean(user?.email);
  const userRole: "user" | "admin" =
    user?.role === "admin" ? "admin" : "user";
  const userName =
    user?.name ??
    (user?.email ? user.email.split("@")[0] : "Guest");
  const [showWelcome, setShowWelcome] = useState(false);
  const [selectedType, setSelectedType] = useState("Books");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);

  // New Modals
  const [selectedBookModal, setSelectedBookModal] = useState<BookItemData | null>(null);
  const [selectedInfographicModal, setSelectedInfographicModal] = useState<InfographicPostData | null>(null);
  const [readerOpen, setReaderOpen] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<{ hub: (typeof hubs)[number]; service: (typeof hubs)[number]["services"][number] } | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const featured = useMemo(() => episodes.find((item) => item.platform === active) ?? episodes[0], [active, episodes]);
  const nowPlaying = currentEpisode ?? featured;
  const activeHubTags = hubTags[active];
  const filteredContent = useMemo(() => contentLibrary.filter((item) => {
    const hubMatch = item.platform === active;
    const typeMatch = selectedType === "All" || item.type === selectedType;
    const categoryMatch = selectedCategory === "All" || item.category === selectedCategory;
    const tagMatch = selectedTag === "All" || (item.tags as readonly string[]).includes(selectedTag);
    return hubMatch && typeMatch && categoryMatch && tagMatch;
  }), [active, selectedType, selectedCategory, selectedTag]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    setSelectedCategory("All");
    setSelectedTag("All");
    setSelectedService(null);
  }, [active]);

  useEffect(() => {
    fetch(API.PODCASTS, { credentials: "include" })
      .then((res) => res.json())
      .then((data: { episodes?: Episode[] }) => setEpisodes(data.episodes ?? []))
      .catch(() => setEpisodes([]));
  }, []);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch(() => setUser(getCachedUser()));
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    audioRef.current.playbackRate = speed;
    audioRef.current.loop = repeat;
  }, [volume, speed, repeat]);

  useEffect(() => {
    if (!nowPlaying || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: nowPlaying.title,
      artist: nowPlaying.creator || nowPlaying.platform,
      album: nowPlaying.podcastTitle || `${nowPlaying.platform} Podcast`,
      artwork: nowPlaying.image ? [{ src: nowPlaying.image, sizes: "512x512", type: "image/png" }] : [],
    });
    navigator.mediaSession.setActionHandler("play", () => void audioRef.current?.play());
    navigator.mediaSession.setActionHandler("pause", () => audioRef.current?.pause());
    navigator.mediaSession.setActionHandler("seekbackward", () => skipBy(-30));
    navigator.mediaSession.setActionHandler("seekforward", () => skipBy(10));
  }, [nowPlaying]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!playerOpen) return;
      if (event.code === "Space") {
        event.preventDefault();
        void toggleAudio();
      }
      if (event.key === "ArrowLeft") skipBy(-10);
      if (event.key === "ArrowRight") skipBy(10);
      if (event.key === "Escape") setPlayerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Synchronized Heartbeat Sound & Logo Reveal on every page load/refresh
  useEffect(() => {
    // Attempt automatic heartbeat audio on load/refresh
    playHeartbeatSound();

    // Fallback trigger for restricted autoplay policies on first permitted user interaction
    const triggerHeartbeat = () => {
      playHeartbeatSound();
    };
    window.addEventListener("pointerdown", triggerHeartbeat, { once: true });
    window.addEventListener("keydown", triggerHeartbeat, { once: true });
    return () => {
      window.removeEventListener("pointerdown", triggerHeartbeat);
      window.removeEventListener("keydown", triggerHeartbeat);
    };
  }, []);

  const toggleAudio = async () => {
    if (!audioRef.current || !nowPlaying?.audioUrl) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }
    await audioRef.current.play();
    setPlaying(true);
  };

  const openEpisode = async (episode: Episode) => {
    if (!signedIn) {
      openAuth("sign-in");
      return;
    }
    setCurrentEpisode(episode);
    setPlayerOpen(true);
    setPlaying(false);
    window.setTimeout(() => void audioRef.current?.play().then(() => setPlaying(true)).catch(() => setPlaying(false)), 80);
  };

  const skipBy = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + seconds));
  };

  const seekTo = (value: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value;
    setProgress(value);
  };

  const updateProgress = () => {
    if (!audioRef.current) return;
    setProgress(audioRef.current.currentTime || 0);
    setDuration(audioRef.current.duration || 0);
  };

  const nextEpisode = () => {
    if (!nowPlaying || episodes.length === 0) return;
    const next = shuffle ? episodes[Math.floor(Math.random() * episodes.length)] : episodes[(episodes.findIndex((episode) => episode.audioUrl === nowPlaying.audioUrl) + 1) % episodes.length];
    setCurrentEpisode(next);
    window.setTimeout(() => void audioRef.current?.play().then(() => setPlaying(true)), 80);
  };

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const rest = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${rest}`;
  };

  const openAuth = (mode: "sign-in" | "sign-up" | "forgot" = "sign-in") => {
    const page =
      mode === "sign-up" ? "/signup" : mode === "forgot" ? "/forgot-password" : "/signin";
    navigate(page);
  };

  // Show the welcome banner the first time a real session is established
  const welcomeShown = useRef(false);
  useEffect(() => {
    if (signedIn && !welcomeShown.current) {
      welcomeShown.current = true;
      setShowWelcome(true);
      const t = window.setTimeout(() => setShowWelcome(false), 4200);
      return () => window.clearTimeout(t);
    }
    if (!signedIn) welcomeShown.current = false;
  }, [signedIn]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f0e8] text-zinc-950 transition-colors duration-500 dark:bg-[#090908] dark:text-[#f6f0e5]">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(195,142,71,.25),transparent_28%),radial-gradient(circle_at_80%_5%,rgba(50,92,88,.18),transparent_30%),linear-gradient(120deg,rgba(255,255,255,.65),transparent)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(195,142,71,.16),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(87,116,112,.18),transparent_30%)]" />
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f4f0e8]/80 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#090908]/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <a href="#home"><Logo compact /></a>
          <nav className="hidden items-center gap-1 rounded-full border border-black/10 bg-white/55 p-1 text-sm dark:border-white/10 dark:bg-white/5 lg:flex">
            {nav.map((item) => <a className="rounded-full px-4 py-2 text-zinc-700 transition hover:bg-black hover:text-white dark:text-zinc-200 dark:hover:bg-white dark:hover:text-black" href={`#${item.toLowerCase().replaceAll(" ", "-")}`} key={item}>{item}</a>)}
          </nav>
          <div className="flex items-center gap-2">
            <SocialLinks links={gateSocials} className="hidden lg:flex" />
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full border border-black/10 bg-white/70 p-3 dark:border-white/10 dark:bg-white/10" aria-label="Toggle theme">{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button>
<button onClick={() => openAuth("sign-in")} className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-black">Sign In</button>
            
            {/* Functional 3-Bar Menu Icon that opens Spotify-style User Profile & Growth Analytics */}
            <button
              onClick={() => setUserProfileModalOpen(true)}
              className="rounded-full border border-black/10 bg-white/70 p-3 hover:bg-black/5 dark:border-white/10 dark:bg-white/10 transition"
              aria-label="Open User Profile & Analytics"
              title="Open User Profile & Analytics"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      <section id="home" className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
        <div className="flex flex-col justify-center">
          <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white/65 px-4 py-2 text-lg font-bold dark:border-white/10 dark:bg-white/10"><Typewriter words={[
              " Gate. Learn. Discover. Grow.",
              
            ]}/></div>
          <div className="mb-6"><Logo /></div>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[.95] tracking-[-0.05em] md:text-7xl">One premium knowledge ecosystem for IPN, IGC, IFR and ISR.</h1>
          <div className="mt-7 max-w-3xl rounded-[2rem] border border-black/10 bg-white/55 p-6 shadow-xl shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5">
            <p className="font-serif text-2xl font-semibold leading-snug tracking-[-0.02em] text-zinc-950 dark:text-white">
              Before the world fills your screen, fill your mind with something worth keeping.
            </p>
            <p className="mt-4 text-base leading-8 text-zinc-700 dark:text-zinc-300 md:text-lg">
              Most of us reach for our phone before we have even finished waking up. The problem is not the screen. It is what we allow the screen to feed us. Gate is built for this new attention economy, where people increasingly discover, understand and remember ideas through visuals and audio rather than long articles and endless blogs. Founded by Zayd Haji, Gate brings IPN, International Public Network, IGC, Inspire Guide Connect, IFR, Integrity Finance Research, and ISR, Ideological Studies Research into one intelligent feed of infographics, podcasts, books and research. Instead of adding more noise to your day, Gate gives your attention somewhere meaningful to go. Open your phone, and discover something that informs you, challenges you, teaches you or stays with you.
            </p>
            <p className="mt-5 font-serif text-2xl font-semibold tracking-[-0.02em] text-[#9a6d35]">
              Do not just scroll. Feed your mind.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => openAuth("sign-up")} className="rounded-full bg-zinc-950 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-black/10 dark:bg-white dark:text-black">Become a Member</button>
            <a className="rounded-full border border-black/15 bg-white/60 px-6 py-4 text-sm font-bold dark:border-white/15 dark:bg-white/10" href="#gate-feed">Explore Gate Feed</a>
          </div>
          <SocialLinks links={gateSocials} className="mt-6" />
        </div>
        <div className="self-start rounded-[2.5rem] border border-black/10 bg-white/55 my-6 p-4 shadow-2xl shadow-black/10 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            {(Object.keys(platforms) as PlatformKey[]).map((id) => (
              <button key={id} onClick={() => { setActive(id); setSelectedCategory("All"); setSelectedTag("All"); }} className={`group min-h-56 rounded-[2rem] border p-5 text-left transition hover:-translate-y-1 ${active === id ? "border-black bg-white shadow-xl dark:border-white dark:bg-white/10" : "border-black/10 bg-white/45 dark:border-white/10 dark:bg-black/20"}`}>
                <PlatformLogo id={id} />
                <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">{platforms[id].name}</p>
                <p className="mt-2 text-lg font-semibold">{platforms[id].promise}</p>
                <ChevronRight className="mt-6 transition group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className={`rounded-[2.5rem] bg-gradient-to-br ${platforms[active].tone} border border-black/10 p-6 dark:border-white/10 md:p-10`}>
          <div className="flex flex-col justify-between gap-8 lg:flex-row">
            <div>
              <PlatformLogo id={active} />
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">{platforms[active].name}</h2>
              <SocialLinks links={hubByKey(active).socials} className="mt-4" />
              <div className="mt-5 flex flex-wrap gap-2">{contentTypes.map((type) => <button onClick={() => setSelectedType(type)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selectedType === type ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-black" : "border-black/10 bg-white/55 dark:border-white/10 dark:bg-black/20"}`} key={type}>{type}</button>)}</div>
            </div>
            <div className="max-w-2xl">
              <h3 className="text-sm font-bold uppercase tracking-[0.22em] text-zinc-500">Categories</h3>
              <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => setSelectedCategory("All")} className={`rounded-full px-3 py-2 text-xs font-semibold ${selectedCategory === "All" ? "bg-zinc-950 text-white dark:bg-white dark:text-black" : "bg-white/60 dark:bg-black/20"}`}>All</button>{platforms[active].categories.map((cat) => <button onClick={() => setSelectedCategory(cat)} className={`rounded-full px-3 py-2 text-xs font-semibold ${selectedCategory === cat ? "bg-zinc-950 text-white dark:bg-white dark:text-black" : "bg-white/60 dark:bg-black/20"}`} key={cat}>{cat}</button>)}</div>
            </div>
          </div>
          <div className="mt-8 rounded-[2rem] border border-black/10 bg-white/60 p-5 dark:border-white/10 dark:bg-black/20">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h3 className="text-2xl font-semibold">Gate hub category and tag results</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Filters follow the selected hub, so categories, tags and results stay specific to the active Gate platform.</p>
              </div>
              <div className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-black">{filteredContent.length} results</div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {["All", ...activeHubTags].map((tag) => <button onClick={() => setSelectedTag(tag)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selectedTag === tag ? "border-[#9a6d35] bg-[#9a6d35] text-white" : "border-black/10 bg-white/70 dark:border-white/10 dark:bg-white/10"}`} key={tag}>#{tag}</button>)}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {filteredContent.map((item, index) => <article key={`${item.platform}-${item.title}`} className="rounded-[1.5rem] border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black/30"><div className="flex items-start justify-between gap-3"><span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-bold text-white dark:bg-white dark:text-black">{String(index + 1).padStart(2, "0")} {item.type.slice(0, -1)}</span><span className="text-sm font-bold text-[#9a6d35]">{item.platform}</span></div><h4 className="mt-5 text-xl font-semibold">{item.title}</h4><p className="mt-2 text-sm text-zinc-500">{item.category}</p><p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{item.description}</p><div className="mt-4 flex flex-wrap gap-2">{item.tags.map((tag) => <button onClick={() => setSelectedTag(tag)} className="rounded-full bg-black/5 px-2 py-1 text-xs font-semibold dark:bg-white/10" key={tag}>#{tag}</button>)}</div></article>)}
            </div>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <FeedCard onClick={() => setSelectedBookModal(sampleBooks[0])} number="01 Book" icon={<BookOpen />} title="Professional book cards" text="16:25 covers, title, author, 10,000-character descriptions, samples, purchase links and Gate Reader." />
            <FeedCard onClick={() => nowPlaying && void openEpisode(nowPlaying)} number="01 Podcast" icon={<Headphones />} title="Live RSS podcast playback" text="Actual RSS audio, full player, mini player, queue, speed, sleep timer, downloads and Media Session support." />
            <FeedCard onClick={() => setSelectedInfographicModal(sampleInfographics[0])} number="01 Infographic" icon={<ImageIcon />} title="Social infographic feed" text="Fixed 4:5 publishing, captions, tags, full-screen view, view count, share and bookmark only." />
          </div>
        </div>
      </section>

      <section id="hub-services" className="mx-auto max-w-7xl px-4 py-14">
        <SectionTitle eyebrow="Hub Services" title={`${hubByKey(active).name} services`} text="Explore the professional services offered by each Gate hub. Open any service to see what it provides, who it is for, the engagement process and how to enquire. No login required." />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hubByKey(active).services.map((service) => {
            const Icon = service.icon;
            return (
              <button key={service.slug} onClick={() => setSelectedService({ hub: hubByKey(active), service })} className="group rounded-[2rem] border border-black/10 bg-white/65 p-6 text-left transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between">
                  <span className="grid size-14 place-items-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-black"><Icon size={26} /></span>
                  <ChevronRight className="text-zinc-400 transition group-hover:translate-x-1 group-hover:text-zinc-950 dark:group-hover:text-white" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold">{service.name}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{service.short}</p>
                <p className="mt-5 text-sm font-bold text-[#9a6d35]">{service.pricing}</p>
              </button>
            );
          })}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {(Object.keys(platforms) as PlatformKey[]).filter((id) => id !== active).map((id) => (
            <button key={id} onClick={() => { setActive(id); setSelectedCategory("All"); setSelectedTag("All"); }} className="rounded-full border border-black/10 bg-white/60 px-5 py-3 text-sm font-semibold dark:border-white/10 dark:bg-white/10">View {platforms[id].name} services</button>
          ))}
        </div>
      </section>

      <section id="gate-feed" className="mx-auto max-w-7xl px-4 py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#9a6d35]">Post Login Experience</p>
          <h2 className="mt-3 font-serif text-4xl font-semibold leading-[0.95] tracking-[-0.04em] md:text-6xl">Turn your screen time into a daily stream of useful knowledge</h2>
          <p className="mt-5 text-lg leading-8 text-zinc-700 dark:text-zinc-300">Once you sign in, Gate becomes more than a library. It becomes a personalised starting point for discovering ideas worth your attention. Your four knowledge hubs | IPN, IGC, IFR and ISR | remain within reach, while the Gate Feed brings relevant books, research reports, podcasts and infographics into one continuous discovery experience.</p>
          <p className="mt-4 text-lg leading-8 text-zinc-700 dark:text-zinc-300">Instead of opening your phone and falling into another cycle of random scrolling, you can return to a feed shaped around learning, curiosity and the subjects you choose to explore.</p>
          <p className="mt-6 font-serif text-2xl font-semibold tracking-[-0.02em] text-[#9a6d35]">Open Gate. Find something worth knowing. Let your next scroll teach you something.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#hub-services" className="rounded-full bg-zinc-950 px-7 py-4 text-center font-bold text-white shadow-xl transition hover:opacity-90 dark:bg-white dark:text-black">Explore the Feed</a>
            <button onClick={() => openAuth("sign-up")} className="rounded-full border border-black/15 bg-white/60 px-7 py-4 text-center font-bold transition hover:bg-black hover:text-white dark:border-white/15 dark:bg-white/10 dark:hover:bg-white dark:hover:text-black">Become a Member</button>
          </div>
        </div>
        <div className="mt-8 space-y-8">
          <div className="rounded-[2rem] border border-black/10 bg-white/55 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="mb-4 flex items-center justify-between"><h3 className="flex items-center gap-2 text-xl font-semibold"><BookOpen /> Books</h3><span className="text-sm text-zinc-500">Horizontal slider</span></div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {sampleBooks.map((b, n) => (
                <button key={b.id} onClick={() => setSelectedBookModal(b)} className="rounded-[1.5rem] border border-black/10 bg-white p-3 text-left transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-black/30">
                  <div className="aspect-[16/25] rounded-[1.1rem] bg-gradient-to-br from-zinc-900 via-[#80623b] to-[#e4d6bc] p-4 text-white flex flex-col justify-between">
                    <span className="rounded-full bg-white/20 px-2 py-1 text-xs font-bold w-fit">{String(n + 1).padStart(2, "0")} {b.type.slice(0, -1)}</span>
                    <h4 className="font-serif font-bold text-base leading-snug line-clamp-3">{b.title}</h4>
                    <span className="text-xs opacity-75">{b.author}</span>
                  </div>
                  <p className="mt-2 text-xs font-bold text-[#9a6d35]">{b.platform} • Read Sample</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-white/55 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="mb-4 flex items-center justify-between"><h3 className="flex items-center gap-2 text-xl font-semibold"><Headphones /> Podcasts</h3><span className="text-sm text-zinc-500">RSS synced</span></div>
            <div className="grid gap-4 md:grid-cols-3">
              {episodes.length === 0 && <div className="rounded-[1.5rem] border border-black/10 bg-white p-5 text-sm text-zinc-500 dark:border-white/10 dark:bg-black/30">Loading real RSS podcast episodes and artwork...</div>}
              {episodes.slice(0, 6).map((episode, index) => (
                <button type="button" onClick={() => void openEpisode(episode)} key={`${episode.title}-${index}`} className="rounded-[1.5rem] border border-black/10 bg-white p-4 text-left transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-black/30">
                  <div className="relative aspect-square overflow-hidden rounded-[1.2rem] bg-zinc-900 text-white">
                    {episode.image && <img src={episode.image} alt={`${episode.title} artwork`} className="h-full w-full object-cover" />}
                    <span className="absolute left-4 top-4 rounded-full bg-black/65 px-3 py-1 text-xs font-bold backdrop-blur">{String(index + 1).padStart(2, "0")} Podcast</span>
                    <span className="absolute bottom-4 right-4 grid size-11 place-items-center rounded-full bg-white text-black"><Play size={18} /></span>
                  </div>
                  <p className="mt-3 text-sm font-bold text-[#9a6d35]">{episode.platform} · {episode.podcastTitle || "Podcast"}</p>
                  <h4 className="mt-1 line-clamp-3 text-lg font-semibold leading-snug">{episode.title}</h4>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_.75fr]">
            <article onClick={() => setSelectedInfographicModal(sampleInfographics[0])} className="rounded-[2rem] border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5 cursor-pointer hover:shadow-xl transition">
              <div className="relative aspect-[4/5] rounded-[1.6rem] overflow-hidden bg-zinc-900 text-white">
                <img src={sampleInfographics[0].imageUrl} alt="Infographic post" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-between">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur w-fit">01 Infographic</span>
                  <div>
                    <span className="text-xs font-bold text-[#d5a85c]">{sampleInfographics[0].platform} • {sampleInfographics[0].category}</span>
                    <h3 className="mt-1 text-2xl font-semibold leading-tight">{sampleInfographics[0].title}</h3>
                  </div>
                </div>
              </div>
              <h3 className="mt-5 text-2xl font-semibold">Expandable captions, tags and focused reading</h3>
              <p className="mt-2 text-zinc-600 dark:text-zinc-300">Why are Gate Infographics useful in a world overloaded with content? Because understanding should not require hours of reading. Gate transforms news, research, data, ideas and important information into visually structured stories designed for modern attention spans. While AI is accelerating the volume of written content online, Gate focuses on the value of visual understanding: helping people discover what happened, why it matters and what they should remember in a format that is faster to absorb and easier to recall. Gate Infographics are built for busy people who want meaningful knowledge without another endless article.</p>
            </article>
            <aside className="rounded-[2rem] border border-black/10 bg-white/55 p-6 dark:border-white/10 dark:bg-white/5">
              <h3 className="text-xl font-semibold">Recommendation Signals</h3>
              <div className="mt-4 grid gap-3">{["Searches", "Views", "Saves", "Shares", "Reading time", "Completed content", "Followed categories", "Membership access"].map((item) => <div className="flex items-center justify-between rounded-2xl bg-black/5 p-3 dark:bg-white/10" key={item}><span>{item}</span><Check size={18} /></div>)}</div>
            </aside>
          </div>
        </div>
      </section>

      <section id="search" className="mx-auto max-w-7xl px-4 py-14">
        <SectionTitle eyebrow="Discovery" title="Find the knowledge that deserves your attention" text="The internet does not have a shortage of information. It has a shortage of direction. Gate Discovery helps you move beyond endless scrolling and repetitive search results by connecting meaningful knowledge across IPN, IGC, IFR and ISR. Instead of searching separately through scattered content, discover relevant books, podcasts, infographics and research through one intelligent knowledge layer built around what you want to understand, not simply what you want to click. Explore by subject, region, topic or idea and move naturally from one perspective to another, turning fragmented information into a clearer path of discovery." />
        <div className="mt-8 rounded-[2rem] border border-black/10 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-3 rounded-full border border-black/10 bg-white px-5 py-4 dark:border-white/10 dark:bg-black/30"><Search /><span className="text-zinc-500">Search ethical finance podcasts, climate reports, Quranic studies, productivity books...</span></div>
          <div className="mt-5 flex flex-wrap gap-2">{["Platform", "Category", "Content Type", "Tags", "Region", "Topic", "Date", "Popularity"].map((f) => <span className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black" key={f}>{f}</span>)}</div>
        </div>
      </section>

      <section id="membership" className="mx-auto max-w-7xl px-4 py-14 space-y-12">
        {/* Lifetime Membership One Time Launch Offer Section */}
        <div className="overflow-hidden rounded-[3rem] border border-black/10 bg-[#15110c] text-white shadow-2xl shadow-black/20 dark:border-white/10">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_.95fr]">
            <div className="relative p-8 md:p-12">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(213,168,92,.35),transparent_28%),radial-gradient(circle_at_90%_20%,rgba(255,255,255,.12),transparent_22%)]" />
              <div className="relative">
                <div className="flex flex-wrap gap-3">
                  <span className="rounded-full border border-[#d5a85c]/40 bg-[#d5a85c]/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#f4d39b]">One Time Launch Offer</span>
                  <span className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-black">Lifetime Access</span>
                </div>
                <h2 className="mt-8 max-w-3xl font-serif text-5xl font-semibold leading-[0.95] tracking-[-0.05em] md:text-7xl">Pay Once. Learn for a Lifetime.</h2>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">A founder-led .Gate lifetime membership launch offer curated by Zayd Haji, Founder of .Gate, created for individuals who want their daily screen time to compound into knowledge instead of disappearing into digital noise.</p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#f4d39b]">One-Time Investment</p>
                    <p className="mt-3 text-5xl font-black tracking-tight">₹9,999</p>
                    <p className="mt-2 text-sm text-white/60 line-through">Standard recurring multi-year renewals</p>
                  </div>
                  <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#f4d39b]">First Year Breakdown</p>
                    <p className="mt-3 text-2xl font-black">₹27.39 / day</p>
                    <p className="mt-1 text-2xl font-black">₹833.25 / month</p>
                    <p className="mt-2 text-sm text-white/60">Effective cost approaches zero the longer you stay.</p>
                  </div>
                </div>

                <p className="mt-8 rounded-[2rem] border border-[#d5a85c]/30 bg-[#d5a85c]/10 p-5 font-serif text-2xl leading-snug text-[#ffe3af]">Your daily screen time already has a cost; make some of that time compound into knowledge.</p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button className="rounded-full bg-white px-7 py-4 text-sm font-black text-black shadow-xl transition hover:scale-[1.02]">Claim Lifetime Membership | ₹9,999</button>
                  <a href="#gate-feed" className="rounded-full border border-white/25 bg-white/10 px-7 py-4 text-sm font-black text-white backdrop-blur transition hover:bg-white/20">Explore What’s Inside Gate</a>
                </div>
                <p className="mt-4 flex items-center gap-2 text-sm text-white/55"><ShieldCheck size={16} /> Secure one-time payment. No recurring billing for this lifetime launch membership.</p>
              </div>
            </div>

            <div className="border-t border-white/10 bg-white/[0.06] p-8 md:p-12 lg:border-l lg:border-t-0">
              <h3 className="text-2xl font-semibold tracking-tight">Lifetime membership includes</h3>
              <div className="mt-6 grid gap-3">
                {["IPN | International Public Network", "IGC | Inspire Guide Connect", "IFR | Integrity Finance Research", "ISR | Ideological Studies Research"].map((item) => (
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4" key={item}>
                    <span className="font-semibold">{item}</span>
                    <Check className="text-[#d5a85c]" size={18} />
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[2rem] border border-white/10 bg-black/20 p-5">
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#f4d39b]">Value Stack & Resources</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {["Books", "Podcasts", "Infographics", "Research Reports", "Eligible premium learning resources", "Member downloads", "Progress tracking", "Knowledge discovery feed"].map((item) => (
                    <div className="flex items-center gap-2 text-sm text-white/80" key={item}><Check size={16} className="text-[#d5a85c]" /> {item}</div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-[2rem] bg-white p-5 text-black">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#9a6d35]">Founder Led Credibility</p>
                <p className="mt-3 text-sm leading-7 text-zinc-700">Created by Zayd Haji, Founder of .Gate, this launch offer is designed as a rare long-term investment in intellectual growth across the four pillars of the Gate ecosystem.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Standard Gate Membership Pricing Options */}
        <div>
          <SectionTitle eyebrow="Gate Membership Pricing" title="Standard recurring subscription plans" text="Choose a duration that matches your commitment. All plans unlock identical premium benefits across IPN, IGC, IFR and ISR." />
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              ["Monthly", "₹99", "Flexible", "Just ₹3.30/day. Maximum flexibility with full premium access and the freedom to cancel anytime."],
              ["1 Year", "₹799", "Popular", "Only ₹66.58/month or ₹2.19/day. Save over 32%. Recommended choice for regular learners."],
              ["3 Years", "₹2,199", "Value", "Just ₹61.08/month or ₹2.01/day. Greater long-term value with uninterrupted access."],
              ["5 Years", "₹3,499", "Savings", "Only ₹58.32/month or ₹1.92/day. Lock in lower pricing with substantial savings."],
              ["7 Years", "₹4,699", "Commitment", "Just ₹55.94/month or ₹1.84/day. Continuous access at one of the lowest effective costs."],
              ["9 Years", "₹5,799", "Legacy", "Only ₹53.69/month or ₹1.77/day. Maximum savings for lifelong learners and supporters."],
            ].map(([name, price, label, detail]) => (
              <div key={name} className={`rounded-[2rem] border p-6 flex flex-col justify-between ${name === "1 Year" ? "border-zinc-950 bg-zinc-950 text-white shadow-2xl shadow-black/20 dark:border-white" : "border-black/10 bg-white/65 dark:border-white/10 dark:bg-white/5"}`}>
                <div>
                  <div className="flex items-center justify-between"><h3 className="text-2xl font-semibold">{name}</h3><span className={`rounded-full px-3 py-1 text-sm font-bold ${name === "1 Year" ? "bg-white text-black" : "bg-black/10 dark:bg-white/15"}`}>{label}</span></div>
                  <p className="mt-6 text-4xl font-bold">{price}</p>
                  <p className="mt-3 text-sm opacity-80 leading-6">{detail}</p>
                </div>
                <button className={`mt-8 w-full rounded-full px-5 py-3.5 font-bold transition ${name === "1 Year" ? "bg-white text-black hover:bg-zinc-200" : "bg-zinc-950 text-white dark:bg-white dark:text-black hover:opacity-90"}`}>Choose {name}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="dashboard" className="mx-auto max-w-7xl px-4 py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#9a6d35]">User Account</p>
          <h2 className="mt-3 font-serif text-4xl font-semibold leading-[0.95] tracking-[-0.04em] md:text-6xl">Your knowledge journey, remembered in one place</h2>
          <p className="mt-5 text-lg leading-8 text-zinc-700 dark:text-zinc-300">What makes a Gate account valuable is not simply access. It is continuity. Your account remembers where your curiosity has taken you, what you have explored and where you left off, so knowledge does not disappear the moment you close the app.</p>
          <p className="mt-4 text-lg leading-8 text-zinc-700 dark:text-zinc-300">From discovering your first infographic to returning to an unfinished book, podcast or research report, Gate turns scattered consumption into a personal knowledge journey.</p>
          <p className="mt-4 text-lg leading-8 text-zinc-700 dark:text-zinc-300">What can you do with a Gate account? Discover relevant knowledge, continue where you stopped, save what matters, understand your progress and manage your premium access from one place.</p>
          <p className="mt-4 text-lg leading-8 text-zinc-700 dark:text-zinc-300">Whether you are exploring Gate as a guest, building a regular learning habit or using an active membership, your journey stays connected to you.</p>
          <p className="mt-6 font-serif text-2xl font-semibold tracking-[-0.02em] text-[#9a6d35]">Don't just consume content. Build a record of what you know.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            {signedIn ? (
              <button onClick={() => setUserProfileModalOpen(true)} className="rounded-full bg-zinc-950 px-7 py-4 text-center font-bold text-white shadow-xl transition hover:opacity-90 dark:bg-white dark:text-black">View My Profile</button>
            ) : (
              <button onClick={() => openAuth("sign-in")} className="rounded-full bg-zinc-950 px-7 py-4 text-center font-bold text-white shadow-xl transition hover:opacity-90 dark:bg-white dark:text-black">Sign In</button>
            )}
            <button onClick={() => setUserProfileModalOpen(true)} className="rounded-full border border-black/15 bg-white/60 px-7 py-4 text-center font-bold transition hover:bg-black hover:text-white dark:border-white/15 dark:bg-white/10 dark:hover:bg-white dark:hover:text-black">Open Profile & Analytics</button>
          </div>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <div className="rounded-[2rem] border border-black/10 bg-white/65 p-6 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-4"><div className="grid size-16 place-items-center rounded-full bg-zinc-950 text-white"><User /></div><div><h3 className="text-2xl font-semibold">Greetings, {signedIn ? userName : "Guest"}</h3><p className="text-sm text-zinc-500">{signedIn ? "Active Gate Member" : "Sign in to activate your dashboard"}</p></div></div>
            <div className="mt-6 grid gap-3">
              <button onClick={() => setUserProfileModalOpen(true)} className="flex items-center justify-between rounded-2xl bg-black/5 hover:bg-black/10 p-3 font-semibold transition dark:bg-white/10 dark:hover:bg-white/20">
                <span>View & Edit Full Profile</span> <ChevronRight size={18} />
              </button>
              {["Profile Photo", "Name", "Bio", "Interests", "Membership", "Reading History", "Listening History", "Downloads", "Bookmarks", "Recently Viewed", "Progress Timeline", "Activity Calendar"].map((item) => <div className="flex justify-between rounded-2xl bg-black/5 p-3 dark:bg-white/10" key={item}><span>{item}</span><Check size={18} /></div>)}
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Metric title="Reading Hours" value="42" icon={<BookOpen />} />
            <Metric title="Listening Hours" value="18" icon={<Headphones />} />
            <Metric title="Completion Rate" value="76%" icon={<Activity />} />
            <Metric title="Learning Streak" value="21 days" icon={<HeartPulse />} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionTitle eyebrow="Podcast Player" title="Listen to ideas when reading can wait" text="People do not always have the time, focus or environment to read. Gate Podcasts turn meaningful conversations, analysis and knowledge into audio you can carry through your day. Whether you are commuting, working, walking or simply taking a break from the screen, Gate lets you stay connected to ideas without demanding your eyes. Instead of adding another stream of disposable entertainment to your routine, Gate gives your listening time something worth returning to. Real voices. Real perspectives. Real knowledge. Wherever your day takes you." />
        <div className="mt-8 rounded-[2.5rem] border border-black/10 bg-[#18140f] p-5 text-white shadow-2xl dark:border-white/10 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
            <button onClick={() => nowPlaying && void openEpisode(nowPlaying)} className="aspect-square overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#d5a85c] to-[#31261b] text-left shadow-2xl">
              {nowPlaying?.image ? <img src={nowPlaying.image} alt={`${nowPlaying.title} artwork`} className="h-full w-full object-cover" /> : <div className="p-6"><Headphones size={48} /><p className="mt-24 text-2xl font-semibold">{nowPlaying?.platform ?? active} Podcast</p></div>}
            </button>
            <div className="flex flex-col justify-center">
              <p className="text-sm uppercase tracking-[0.25em] text-white/50">Now Playing</p>
              <h3 className="mt-3 text-3xl font-semibold md:text-5xl">{nowPlaying?.title ?? "Loading live RSS episode"}</h3>
              <p className="mt-4 line-clamp-3 whitespace-pre-line text-left leading-7 text-white/65">{nowPlaying?.description ?? "RSS sync is loading the latest IPN, IGC, IFR and ISR episodes."}</p>
              <audio ref={audioRef} src={nowPlaying?.audioUrl} onTimeUpdate={updateProgress} onLoadedMetadata={updateProgress} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => { setPlaying(false); if (!repeat) nextEpisode(); }} preload="metadata" />
              <div className="mt-6 flex items-center gap-3 text-sm text-white/60"><span>{formatTime(progress)}</span><input aria-label="Seek podcast" type="range" min="0" max={duration || 0} value={progress} onChange={(event) => seekTo(Number(event.target.value))} className="w-full accent-white" /><span>{formatTime(duration)}</span></div>
              <div className="mt-6 flex flex-wrap items-center gap-3"><button onClick={toggleAudio} className="grid size-16 place-items-center rounded-full bg-white text-black" aria-label="Play podcast">{playing ? <Pause /> : <Play />}</button><button onClick={() => skipBy(-30)} className="rounded-full bg-white/10 px-4 py-3 text-sm font-semibold">-30</button><button onClick={() => skipBy(10)} className="rounded-full bg-white/10 px-4 py-3 text-sm font-semibold">+10</button><button onClick={() => setSpeed(speed === 2 ? 1 : speed + 0.25)} className="rounded-full bg-white/10 px-4 py-3 text-sm font-semibold">{speed}x</button><button onClick={() => setTranscriptOpen(true)} className="rounded-full bg-[#9a6d35] text-white px-5 py-3 text-sm font-bold flex items-center gap-2"><FileCode size={16} /> Transcript</button><button onClick={() => setPlayerOpen(true)} className="rounded-full bg-white/10 px-4 py-3 text-sm font-semibold">Open Full Player</button></div>
            </div>
          </div>
        </div>
      </section>

      <section id="z-web-app" className="mx-auto max-w-7xl px-4 py-14">
        <div className="rounded-[2.5rem] border border-black/10 bg-white/65 p-8 dark:border-white/10 dark:bg-white/5 md:p-12">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <PlatformLogo id="Z" />
              <p className="mt-5 font-serif text-2xl font-semibold leading-snug tracking-[-0.02em] text-[#9a6d35] md:text-3xl">Turn busywork into a better way of working</p>
              <p className="mt-4 text-base leading-8 text-zinc-600 dark:text-zinc-300 md:text-lg">Work is becoming increasingly digital, but digital does not always mean productive. Z is built to help people simplify repetitive work, organise their workflow and spend less time managing tasks that technology can handle better.</p>
              <p className="mt-4 text-base leading-8 text-zinc-600 dark:text-zinc-300 md:text-lg">While Gate is your destination for knowledge, Z is the practical layer for turning that knowledge into a more organised, efficient digital workday. Explore the Z Web App, discover its productivity and automation capabilities, and listen to the Z podcast for ideas on working smarter, building better systems and navigating the changing world of technology.</p>
              <p className="mt-6 font-serif text-xl font-semibold tracking-[-0.02em] text-zinc-950 dark:text-white">Learn what matters with Gate. Build a better workflow with Z.</p>
              <p className="mt-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">Z remains completely independent from Gate's membership, navigation and content ecosystem.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="https://www.zaydh.com" target="_blank" rel="noopener noreferrer" className="rounded-full bg-zinc-950 px-7 py-4 text-center font-bold text-white shadow-xl transition hover:opacity-90 dark:bg-white dark:text-black">Open Z Web App</a>
                <a href="https://open.spotify.com/show/4VbEv3uStwjtli1ssG0utE" target="_blank" rel="noopener noreferrer" className="rounded-full border border-black/15 bg-white/60 px-7 py-4 text-center font-bold transition hover:bg-black hover:text-white dark:border-white/15 dark:bg-white/10 dark:hover:bg-white dark:hover:text-black">Listen to Z Podcast</a>
              </div>
              <SocialLinks links={zSocials} className="mt-6" />
            </div>
          </div>
        </div>
      </section>

      {/* Mini Player */}
      {signedIn && nowPlaying && (
        <div className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-5xl rounded-[1.5rem] border border-white/15 bg-[#17130f]/95 p-3 text-white shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button onClick={() => setPlayerOpen(true)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
              {nowPlaying.image && <img src={nowPlaying.image} alt="Podcast artwork" className="size-14 rounded-xl object-cover" />}
              <span className="min-w-0"><span className="block truncate font-semibold">{nowPlaying.title}</span><span className="block truncate text-sm text-white/55">{nowPlaying.platform} · {nowPlaying.podcastTitle || "Podcast"}</span></span>
            </button>
            <button onClick={() => setTranscriptOpen(true)} className="rounded-full bg-white/10 px-3 py-2 text-xs font-bold flex items-center gap-1.5"><FileCode size={14} /> Transcript</button>
            <button onClick={() => skipBy(-30)} className="hidden rounded-full bg-white/10 p-3 sm:grid"><SkipBack size={18} /></button>
            <button onClick={toggleAudio} className="grid size-12 place-items-center rounded-full bg-white text-black">{playing ? <Pause /> : <Play />}</button>
            <button onClick={() => skipBy(10)} className="hidden rounded-full bg-white/10 p-3 sm:grid"><SkipForward size={18} /></button>
          </div>
        </div>
      )}

      {/* Full Screen Podcast Player */}
      {playerOpen && nowPlaying && signedIn && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-[#12100d] text-white">
          <div className="min-h-screen bg-[radial-gradient(circle_at_50%_0%,rgba(214,168,92,.34),transparent_35%),linear-gradient(180deg,#17130f,#050505)] p-4 md:p-8">
            <div className="mx-auto max-w-6xl">
              <div className="flex items-center justify-between gap-4">
                <button onClick={() => setPlayerOpen(false)} className="rounded-full bg-white/10 p-3"><X /></button>
                <div className="flex items-center gap-2 text-sm text-white/60"><Headphones size={16} /> Full Screen Gate Player</div>
                <button className="rounded-full bg-white/10 p-3"><Share2 /></button>
              </div>
              <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(260px,420px)_1fr] lg:items-start">
                <div>
                  <div className="aspect-square overflow-hidden rounded-[2rem] bg-zinc-900 shadow-2xl shadow-black/40">{nowPlaying.image && <img src={nowPlaying.image} alt={`${nowPlaying.title} thumbnail`} className="h-full w-full object-cover" />}</div>
                  <div className="mt-5 rounded-[1.5rem] bg-white/10 p-4">
                    <p className="text-sm uppercase tracking-[0.22em] text-white/45">Creator Profile</p>
                    <h4 className="mt-2 text-xl font-semibold">{nowPlaying.creator || nowPlaying.podcastTitle || nowPlaying.platform}</h4>
                    <p className="mt-1 text-sm text-white/60">{nowPlaying.platform} podcast feed synced from RSS.</p>
                    {(["IPN", "IGC", "IFR", "ISR"] as const).includes(nowPlaying.platform as "IPN") && (
                      <SocialLinks links={hubByKey(nowPlaying.platform as "IPN").socials} className="mt-4" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#d5a85c]">{nowPlaying.platform} · {nowPlaying.podcastTitle || "Podcast"}</p>
                  <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] md:text-6xl">{nowPlaying.title}</h2>
                  <p className="mt-3 text-sm text-white/50">{nowPlaying.pubDate} {nowPlaying.duration ? `· ${nowPlaying.duration}` : ""}</p>
                  <div className="mt-8 rounded-[1.75rem] bg-black/25 p-5">
                    <div className="flex items-center gap-3 text-sm text-white/60"><span>{formatTime(progress)}</span><input aria-label="Seek full player" type="range" min="0" max={duration || 0} value={progress} onChange={(event) => seekTo(Number(event.target.value))} className="w-full accent-[#d5a85c]" /><span>{formatTime(duration)}</span></div>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3"><button onClick={() => setShuffle(!shuffle)} className={`rounded-full p-3 ${shuffle ? "bg-[#d5a85c] text-black" : "bg-white/10"}`}><Shuffle /></button><button onClick={() => skipBy(-30)} className="rounded-full bg-white/10 p-4"><SkipBack /></button><button onClick={toggleAudio} className="grid size-20 place-items-center rounded-full bg-white text-black shadow-xl">{playing ? <Pause size={34} /> : <Play size={34} />}</button><button onClick={() => skipBy(10)} className="rounded-full bg-white/10 p-4"><SkipForward /></button><button onClick={() => setRepeat(!repeat)} className={`rounded-full p-3 ${repeat ? "bg-[#d5a85c] text-black" : "bg-white/10"}`}><Repeat /></button></div>
                    <div className="mt-6 grid gap-4 md:grid-cols-3"><label className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-3 text-sm"><Volume2 size={18} /><input aria-label="Volume" type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => setVolume(Number(event.target.value))} className="w-full accent-white" /></label><button onClick={() => setSpeed(speed === 2 ? 1 : speed + 0.25)} className="rounded-full bg-white/10 px-4 py-3 text-sm font-bold">Speed {speed}x</button><button onClick={() => setTranscriptOpen(true)} className="rounded-full bg-[#d5a85c] text-black px-4 py-3 text-sm font-bold flex items-center justify-center gap-2"><FileCode size={16} /> Open Transcript</button></div>
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <button onClick={() => setTranscriptOpen(true)} className="rounded-full bg-[#d5a85c] text-black px-4 py-3 text-sm font-bold flex items-center justify-center gap-2"><FileCode size={16} /> Interactive Transcript</button>
                    {["Queue", "Autoplay", "Download Offline", "Bookmark", "Related Episodes", "Resume Saved", "Casting Ready"].map((item) => <button className="rounded-full bg-white/10 px-4 py-3 text-sm font-semibold" key={item}>{item}</button>)}
                  </div>
                  <article className="mt-8 rounded-[1.75rem] bg-white/10 p-5">
                    <h3 className="text-2xl font-semibold">Episode Description</h3>
                    <p className="mt-4 whitespace-pre-line text-left text-base leading-8 text-white/75">{nowPlaying.description || "No description provided in the RSS feed."}</p>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Profile & Growth Analytics Modal (Opened via 3-bar menu) */}
      {userProfileModalOpen && (
        <UserProfileAnalyticsModal
          userName={userName}
          userEmail={user?.email ?? `${userName.toLowerCase().replaceAll(" ", "")}@drzgate.com`}
          userRole={userRole}
          onClose={() => setUserProfileModalOpen(false)}
        />
      )}

      {/* Podcast Interactive Transcript Modal */}
      {transcriptOpen && nowPlaying && (
        <PodcastTranscriptModal
          title={nowPlaying.title}
          podcastTitle={nowPlaying.podcastTitle}
          platform={nowPlaying.platform}
          creator={nowPlaying.creator}
          segments={nowPlaying.transcript || []}
          currentTime={progress}
          onSeek={(seconds) => seekTo(seconds)}
          onClose={() => setTranscriptOpen(false)}
        />
      )}

      {/* Book Detail Modal */}
      {selectedBookModal && (
        <BookDetailModal
          item={selectedBookModal}
          onClose={() => setSelectedBookModal(null)}
          onReadSample={() => {
            setSelectedBookModal(null);
            setReaderOpen(true);
          }}
        />
      )}

      {/* Infographic Focused View */}
      {selectedInfographicModal && (
        <InfographicFocusedView
          post={selectedInfographicModal}
          onClose={() => setSelectedInfographicModal(null)}
        />
      )}

      {/* Hub Service Landing Page (Public, no login required) */}
      {selectedService && (
        <ServiceLandingModal
          hub={selectedService.hub}
          service={selectedService.service}
          onClose={() => setSelectedService(null)}
        />
      )}

      {/* Gate Reader Component */}
      {readerOpen && (
        <GateReader onClose={() => setReaderOpen(false)} />
      )}

      <footer className="border-t border-black/10 px-4 py-10 dark:border-white/10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center"><div className="flex flex-col gap-3"><Logo compact /><p className="text-sm text-zinc-500">Gate. Learn. Discover. Grow.</p></div><SocialLinks links={gateSocials} /></div></footer>
      {showWelcome && <div className="fixed right-4 top-24 z-[70] flex items-center gap-3 rounded-3xl border border-black/10 bg-white/95 p-4 shadow-2xl shadow-black/15 animate-in fade-in slide-in-from-top-3 dark:border-white/10 dark:bg-zinc-950/95"><Logo compact /><span className="font-semibold">Greetings, {userName}</span></div>}
    </main>
  );
}

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div><p className="text-sm font-bold uppercase tracking-[0.25em] text-[#9a6d35]">{eyebrow}</p><h2 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.04em] md:text-6xl">{title}</h2><p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-700 dark:text-zinc-300">{text}</p></div>;
}

function FeedCard({ number, icon, title, text, onClick }: { number: string; icon: React.ReactNode; title: string; text: string; onClick?: () => void }) {
  return <article onClick={onClick} className="relative rounded-[2rem] border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-black/25 cursor-pointer hover:shadow-xl transition"><span className="absolute right-5 top-5 rounded-full bg-zinc-950 px-3 py-1 text-xs font-bold text-white dark:bg-white dark:text-black">{number}</span><div className="text-[#9a6d35]">{icon}</div><h3 className="mt-8 text-2xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{text}</p><div className="mt-5 flex gap-3 text-sm"><span className="flex items-center gap-1"><BarChart3 size={16} /> View Count</span><span>Share</span><span className="flex items-center gap-1"><Bookmark size={16} /> Bookmark</span></div></article>;
}

function Metric({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return <div className="rounded-[2rem] border border-black/10 bg-white/65 p-6 dark:border-white/10 dark:bg-white/5"><div className="text-[#9a6d35]">{icon}</div><p className="mt-8 text-sm text-zinc-500">{title}</p><p className="mt-2 text-4xl font-bold tracking-tight">{value}</p></div>;
}
