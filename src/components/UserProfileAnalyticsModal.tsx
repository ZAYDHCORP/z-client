"use client";

import React, { useState } from "react";
import {
  X,
  User,
  BarChart3,
  BookOpen,
  Headphones,
  Bookmark,
  Download,
  Clock,
  Calendar,
  Search,
  Share2,
  Check,
  Edit3,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Heart,
  Eye,
  Tag,
  Award,
} from "lucide-react";
import { gateSocials } from "@/lib/gate-data";
import SocialLinks from "@/components/SocialLinks";

export default function UserProfileAnalyticsModal({
  userName = "Zayd Haji",
  userEmail = "zayd@drzgate.com",
  userRole = "user",
  onClose,
}: {
  userName?: string;
  userEmail?: string;
  userRole?: "user" | "admin";
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"profile" | "analytics" | "history" | "downloads" | "settings">("profile");

  // Editable Profile States
  const [name, setName] = useState(userName);
  const [bio, setBio] = useState("Research practitioner, public affairs enthusiast, and lifelong learner exploring ethical finance, public networks, and leadership.");
  const [interests, setInterests] = useState<string[]>(["World Policy", "Ethical Finance", "Productivity", "Theology"]);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Analytics & History States
  const [readingHours, setReadingHours] = useState(42);
  const [listeningHours, setListeningHours] = useState(18);
  const [completedCount, setCompletedContent] = useState(14);
  const [searchesCount, setSearchesCount] = useState(38);
  const [viewsCount, setViewsCount] = useState(124);
  const [savesCount, setSavesCount] = useState(19);
  const [sharesCount, setSharesCount] = useState(8);

  const [followedCategories, setFollowedCategories] = useState<Record<string, boolean>>({
    "World Affairs": true,
    "Ethical Banking": true,
    "Productivity": true,
    "Contemporary Theology": true,
    "Science & Tech": false,
  });

  const toggleCategory = (cat: string) => {
    setFollowedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-[2.5rem] border border-black/10 dark:border-white/10 bg-[#f4f0e8] dark:bg-[#12100d] text-zinc-950 dark:text-white p-6 sm:p-10 shadow-2xl my-6 font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/10 p-2.5 hover:scale-105 transition"
        >
          <X size={20} />
        </button>

        {/* Top User Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-black/10 dark:border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="relative size-20 overflow-hidden rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 text-white flex items-center justify-center border-2 border-[#9a6d35] shadow-xl">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
              ) : (
                <User size={36} />
              )}
            </div>
<div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{name}</h2>
              <p className="text-xs text-zinc-500 font-medium">{userEmail}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-block size-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Active Gate Member
                </span>
              </div>
            </div>
          </div>

          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 flex flex-wrap gap-2 border-b border-black/10 dark:border-white/10 pb-4">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition ${
                activeTab === "profile"
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-black shadow-md"
                  : "bg-white/50 dark:bg-white/10 hover:bg-black/5"
              }`}
            >
              <User size={16} /> Profile & Settings
            </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition ${
              activeTab === "analytics"
                ? "bg-zinc-950 text-white dark:bg-white dark:text-black shadow-md"
                : "bg-white/50 dark:bg-white/10 hover:bg-black/5"
            }`}
          >
            <BarChart3 size={16} /> Growth & Discovery Analytics
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition ${
              activeTab === "history"
                ? "bg-zinc-950 text-white dark:bg-white dark:text-black shadow-md"
                : "bg-white/50 dark:bg-white/10 hover:bg-black/5"
            }`}
          >
            <Clock size={16} /> History & Activity
          </button>

          <button
            onClick={() => setActiveTab("downloads")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition ${
              activeTab === "downloads"
                ? "bg-zinc-950 text-white dark:bg-white dark:text-black shadow-md"
                : "bg-white/50 dark:bg-white/10 hover:bg-black/5"
            }`}
          >
            <Download size={16} /> Downloads & Bookmarks
          </button>
        </div>

        {/* TAB 1: Profile Editing & Preferences */}
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile} className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/30 px-4 py-3 outline-none text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Profile Avatar Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/30 px-4 py-3 outline-none text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                Bio / Personal Motto
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/30 px-4 py-3 outline-none text-sm font-medium"
              />
            </div>

            {/* Followed Categories Toggles */}
            <div className="bg-white/50 dark:bg-white/5 p-5 rounded-2xl border border-black/10 dark:border-white/10 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <Tag size={14} /> Followed Knowledge Categories
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.keys(followedCategories).map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/70 dark:bg-black/20 border border-black/5 dark:border-white/5 cursor-pointer"
                  >
                    <span className="text-xs font-bold">{cat}</span>
                    <input
                      type="checkbox"
                      checked={followedCategories[cat]}
                      onChange={() => toggleCategory(cat)}
                      className="size-4 accent-[#9a6d35]"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-black/10 dark:border-white/10">
              {savedSuccess ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Check size={16} /> Profile preferences saved!
                </span>
              ) : (
                <span className="text-xs text-zinc-500">Changes apply instantly to your Gate profile.</span>
              )}
              <button
                type="submit"
                className="rounded-full bg-zinc-950 text-white dark:bg-white dark:text-black px-8 py-3 text-xs font-bold shadow-lg flex items-center gap-2"
              >
                <Edit3 size={16} /> Save Profile Changes
              </button>
            </div>
            <div className="mt-6 pt-5 border-t border-black/10 dark:border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Connect with Gate</h4>
              <SocialLinks links={gateSocials} className="mt-3" />
            </div>
          </form>
        )}

        {/* TAB 2: Growth & Discovery Analytics */}
        {activeTab === "analytics" && (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <Search className="text-[#9a6d35]" size={22} />
                <p className="mt-3 text-xs text-zinc-500 font-bold uppercase">Searches Executed</p>
                <p className="text-2xl font-black mt-1">{searchesCount}</p>
              </div>

              <div className="p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <Eye className="text-[#9a6d35]" size={22} />
                <p className="mt-3 text-xs text-zinc-500 font-bold uppercase">Content Views</p>
                <p className="text-2xl font-black mt-1">{viewsCount}</p>
              </div>

              <div className="p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <Bookmark className="text-[#9a6d35]" size={22} />
                <p className="mt-3 text-xs text-zinc-500 font-bold uppercase">Saves & Bookmarks</p>
                <p className="text-2xl font-black mt-1">{savesCount}</p>
              </div>

              <div className="p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <Share2 className="text-[#9a6d35]" size={22} />
                <p className="mt-3 text-xs text-zinc-500 font-bold uppercase">Shares Sent</p>
                <p className="text-2xl font-black mt-1">{sharesCount}</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#9a6d35] flex items-center gap-2">
                  <BookOpen size={16} /> Reading & Listening Hours
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Reading Time</span>
                      <span>{readingHours} Hours</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div className="h-full bg-[#9a6d35] rounded-full" style={{ width: "70%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Listening Time</span>
                      <span>{listeningHours} Hours</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: "45%" }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#9a6d35] flex items-center gap-2">
                  <Award size={16} /> Completed Content & Milestones
                </h4>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/70 dark:bg-black/20">
                  <span className="text-xs font-bold">Books & Reports Completed</span>
                  <span className="text-sm font-black">{completedCount} Completed</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/70 dark:bg-black/20">
                  <span className="text-xs font-bold">Learning Streak</span>
                  <span className="text-sm font-black text-amber-600">21 Days Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: History & Activity */}
        {activeTab === "history" && (
          <div className="mt-6 space-y-4">
            <h3 className="text-base font-bold">Recent Reading & Listening Activity</h3>
            <div className="space-y-3">
              {[
                { type: "Book", platform: "IPN", title: "World Policy & Ethical Governance Handbook", time: "2 hours ago" },
                { type: "Podcast", platform: "IFR", title: "Global Markets & Ethical Banking Episode #12", time: "Yesterday" },
                { type: "Infographic", platform: "IGC", title: "7 Pillars of Modern Leadership", time: "3 days ago" },
                { type: "Report", platform: "ISR", title: "Theology in Contemporary Discourse", time: "1 week ago" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-[#9a6d35] text-white px-2.5 py-1 text-[10px] font-bold">
                      {item.type}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-[#9a6d35] block">{item.platform}</span>
                      <h4 className="text-sm font-semibold">{item.title}</h4>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Downloads & Saved Bookmarks */}
        {activeTab === "downloads" && (
          <div className="mt-6 space-y-4">
            <h3 className="text-base font-bold">Offline Downloads & Saved Bookmarks</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: "World Policy Handbook (Free Sample PDF)", size: "4.2 MB", status: "Downloaded" },
                { title: "Global Markets Briefing Podcast #8", size: "18.5 MB", status: "Downloaded" },
                { title: "Leadership & Growth Mindset Playbook", size: "6.1 MB", status: "Saved Bookmark" },
              ].map((dl, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold leading-snug">{dl.title}</h4>
                    <span className="text-[10px] text-zinc-500 mt-1 block">{dl.size} • {dl.status}</span>
                  </div>
                  <button className="rounded-full bg-black/5 dark:bg-white/10 p-2 hover:bg-black/10">
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
