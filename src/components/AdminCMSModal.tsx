"use client";

import React, { useState } from "react";
import {
  X,
  BookOpen,
  Image as ImageIcon,
  Headphones,
  Upload,
  Check,
  Save,
  Radio,
  Users,
  ShieldCheck,
  BarChart3,
  FileText,
  Link as LinkIcon,
  Plus,
} from "lucide-react";

export default function AdminCMSModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"books" | "infographics" | "podcasts" | "overview">("books");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Book Form State
  const [bookTitle, setBookTitle] = useState("");
  const [bookSubtitle, setBookSubtitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("Dr. Zayd Haji");
  const [bookPlatform, setBookPlatform] = useState<"IPN" | "IGC" | "IFR" | "ISR">("IPN");
  const [bookCategory, setBookCategory] = useState("World");
  const [bookDescription, setBookDescription] = useState("");
  const [bookTags, setBookTags] = useState("World, Governance, Policy");
  
  // Purchase Links Toggles
  const [paperbackEnabled, setPaperbackEnabled] = useState(false);
  const [paperbackUrl, setPaperbackUrl] = useState("");
  const [amazonEnabled, setAmazonEnabled] = useState(true);
  const [amazonUrl, setAmazonUrl] = useState("https://amazon.com");
  const [notionPressEnabled, setNotionPressEnabled] = useState(true);
  const [notionPressUrl, setNotionPressUrl] = useState("https://notionpress.com");
  const [googlePlayEnabled, setGooglePlayEnabled] = useState(true);
  const [googlePlayUrl, setGooglePlayUrl] = useState("https://play.google.com/store/books");

  // Free Sample Toggle
  const [freeSampleEnabled, setFreeSampleEnabled] = useState(true);

  // Infographic Form State
  const [infoTitle, setInfoTitle] = useState("");
  const [infoCaption, setInfoCaption] = useState("");
  const [infoPlatform, setInfoPlatform] = useState<"IPN" | "IGC" | "IFR" | "ISR">("IGC");
  const [infoCategory, setInfoCategory] = useState("Career Development");
  const [infoTags, setInfoTags] = useState("Productivity, Leadership");

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      alert("Content published successfully! It is now live in the Gate feed.");
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[95] grid place-items-center bg-black/75 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-[2.5rem] border border-black/10 dark:border-white/10 bg-[#f4f0e8] dark:bg-[#12100d] text-zinc-950 dark:text-white p-6 sm:p-10 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/10 p-2.5 hover:scale-105 transition"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 border-b border-black/10 dark:border-white/10 pb-5">
          <ShieldCheck className="text-[#9a6d35]" size={28} />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">.Gate Admin CMS & Publishing Console</h2>
            <p className="text-xs text-zinc-500">Google Play Books & Creator Studio style publishing workflow</p>
          </div>
        </div>

        {/* CMS Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-black/10 dark:border-white/10 pb-4">
          <button
            onClick={() => setActiveTab("books")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition ${
              activeTab === "books"
                ? "bg-zinc-950 text-white dark:bg-white dark:text-black shadow-md"
                : "bg-white/50 dark:bg-white/10 hover:bg-black/5"
            }`}
          >
            <BookOpen size={16} /> Books & Reports Publishing
          </button>

          <button
            onClick={() => setActiveTab("infographics")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition ${
              activeTab === "infographics"
                ? "bg-zinc-950 text-white dark:bg-white dark:text-black shadow-md"
                : "bg-white/50 dark:bg-white/10 hover:bg-black/5"
            }`}
          >
            <ImageIcon size={16} /> Infographics (4:5 Ratio)
          </button>

          <button
            onClick={() => setActiveTab("podcasts")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition ${
              activeTab === "podcasts"
                ? "bg-zinc-950 text-white dark:bg-white dark:text-black shadow-md"
                : "bg-white/50 dark:bg-white/10 hover:bg-black/5"
            }`}
          >
            <Headphones size={16} /> Podcast RSS Sync
          </button>

          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition ${
              activeTab === "overview"
                ? "bg-zinc-950 text-white dark:bg-white dark:text-black shadow-md"
                : "bg-white/50 dark:bg-white/10 hover:bg-black/5"
            }`}
          >
            <BarChart3 size={16} /> Platform Overview
          </button>
        </div>

        {/* TAB 1: Books & Reports Publishing */}
        {activeTab === "books" && (
          <form onSubmit={handlePublish} className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Book / Report Title (up to 200 chars)
                </label>
                <input
                  type="text"
                  maxLength={200}
                  required
                  placeholder="e.g. World Policy Handbook 2026"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/30 px-4 py-3 outline-none text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Strategic Frameworks for Sustainable Growth"
                  value={bookSubtitle}
                  onChange={(e) => setBookSubtitle(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/30 px-4 py-3 outline-none text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Author
                </label>
                <input
                  type="text"
                  required
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/30 px-4 py-3 outline-none text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Hub Platform
                </label>
                <select
                  value={bookPlatform}
                  onChange={(e) => setBookPlatform(e.target.value as any)}
                  className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/30 px-4 py-3 outline-none text-sm font-medium"
                >
                  <option value="IPN">IPN | International Public Network</option>
                  <option value="IGC">IGC | Inspire Guide Connect</option>
                  <option value="IFR">IFR | Integrity Finance Research</option>
                  <option value="ISR">ISR | Ideological Studies Research</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                Description (up to 10,000 chars)
              </label>
              <textarea
                rows={4}
                maxLength={10000}
                required
                placeholder="Comprehensive summary of the book or research report..."
                value={bookDescription}
                onChange={(e) => setBookDescription(e.target.value)}
                className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/30 px-4 py-3 outline-none text-sm font-medium"
              />
            </div>

            {/* 16:25 Cover Image Upload & Free Sample PDF Upload */}
            <div className="grid gap-6 md:grid-cols-2 bg-white/40 dark:bg-white/5 p-5 rounded-2xl border border-black/10 dark:border-white/10">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                  Cover Image (16:25 Ratio)
                </h4>
                <div className="border-2 border-dashed border-current/20 rounded-2xl p-4 text-center cursor-pointer hover:bg-black/5 transition flex flex-col items-center justify-center min-h-[120px]">
                  <Upload size={24} className="text-[#9a6d35]" />
                  <span className="text-xs font-bold mt-2">Upload 16:25 Cover Image</span>
                  <span className="text-[10px] opacity-60">PNG, JPG or WebP</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Enable Free Sample PDF
                  </h4>
                  <input
                    type="checkbox"
                    checked={freeSampleEnabled}
                    onChange={(e) => setFreeSampleEnabled(e.target.checked)}
                    className="size-4 accent-[#9a6d35]"
                  />
                </div>

                {freeSampleEnabled ? (
                  <div className="border-2 border-dashed border-current/20 rounded-2xl p-4 text-center cursor-pointer hover:bg-black/5 transition flex flex-col items-center justify-center min-h-[120px]">
                    <FileText size={24} className="text-[#9a6d35]" />
                    <span className="text-xs font-bold mt-2">Upload Free Sample PDF</span>
                    <span className="text-[10px] opacity-60">Publishes directly to Gate Reader</span>
                  </div>
                ) : (
                  <p className="text-xs opacity-60 p-4 border rounded-2xl bg-black/5">
                    Free Sample option is turned OFF. Readers will only see purchase options.
                  </p>
                )}
              </div>
            </div>

            {/* Purchase Options Hyperlinks Setup */}
            <div className="bg-white/40 dark:bg-white/5 p-5 rounded-2xl border border-black/10 dark:border-white/10 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <LinkIcon size={14} /> Purchase Options Hyperlink Controls
              </h4>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={amazonEnabled}
                    onChange={(e) => setAmazonEnabled(e.target.checked)}
                    className="size-4 accent-[#9a6d35]"
                  />
                  <input
                    type="url"
                    disabled={!amazonEnabled}
                    placeholder="Amazon URL"
                    value={amazonUrl}
                    onChange={(e) => setAmazonUrl(e.target.value)}
                    className="flex-1 rounded-xl border border-current/15 px-3 py-2 text-xs bg-white dark:bg-black/30 disabled:opacity-40"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={notionPressEnabled}
                    onChange={(e) => setNotionPressEnabled(e.target.checked)}
                    className="size-4 accent-[#9a6d35]"
                  />
                  <input
                    type="url"
                    disabled={!notionPressEnabled}
                    placeholder="NotionPress URL"
                    value={notionPressUrl}
                    onChange={(e) => setNotionPressUrl(e.target.value)}
                    className="flex-1 rounded-xl border border-current/15 px-3 py-2 text-xs bg-white dark:bg-black/30 disabled:opacity-40"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={googlePlayEnabled}
                    onChange={(e) => setGooglePlayEnabled(e.target.checked)}
                    className="size-4 accent-[#9a6d35]"
                  />
                  <input
                    type="url"
                    disabled={!googlePlayEnabled}
                    placeholder="Google Play Books URL"
                    value={googlePlayUrl}
                    onChange={(e) => setGooglePlayUrl(e.target.value)}
                    className="flex-1 rounded-xl border border-current/15 px-3 py-2 text-xs bg-white dark:bg-black/30 disabled:opacity-40"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={paperbackEnabled}
                    onChange={(e) => setPaperbackEnabled(e.target.checked)}
                    className="size-4 accent-[#9a6d35]"
                  />
                  <input
                    type="url"
                    disabled={!paperbackEnabled}
                    placeholder="Paperback Store URL"
                    value={paperbackUrl}
                    onChange={(e) => setPaperbackUrl(e.target.value)}
                    className="flex-1 rounded-xl border border-current/15 px-3 py-2 text-xs bg-white dark:bg-black/30 disabled:opacity-40"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
              <button
                type="button"
                className="rounded-full border border-black/15 dark:border-white/15 px-6 py-3 text-xs font-bold"
              >
                Save Draft
              </button>
              <button
                type="submit"
                className="rounded-full bg-zinc-950 text-white dark:bg-white dark:text-black px-8 py-3 text-xs font-bold shadow-lg flex items-center gap-2"
              >
                <Save size={16} /> Publish Live
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: Infographics Publishing (4:5 Ratio) */}
        {activeTab === "infographics" && (
          <form onSubmit={handlePublish} className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-[200px_1fr]">
              {/* Fixed 4:5 Preview Box */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                  Image (Fixed 4:5 Ratio)
                </label>
                <div className="aspect-[4/5] w-full rounded-2xl border-2 border-dashed border-current/20 bg-white/40 dark:bg-white/5 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-black/5 transition">
                  <Upload size={28} className="text-[#9a6d35]" />
                  <span className="text-xs font-bold mt-2">Upload 4:5 Image</span>
                  <span className="text-[10px] opacity-60 mt-1">Live crop & preview</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Title (up to 200 chars)
                  </label>
                  <input
                    type="text"
                    maxLength={200}
                    required
                    placeholder="e.g. World Economy & Policy Growth Map"
                    value={infoTitle}
                    onChange={(e) => setInfoTitle(e.target.value)}
                    className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/30 px-4 py-3 outline-none text-sm font-medium"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                      Platform Hub
                    </label>
                    <select
                      value={infoPlatform}
                      onChange={(e) => setInfoPlatform(e.target.value as any)}
                      className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/30 px-4 py-3 outline-none text-sm font-medium"
                    >
                      <option value="IPN">IPN</option>
                      <option value="IGC">IGC</option>
                      <option value="IFR">IFR</option>
                      <option value="ISR">ISR</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      required
                      value={infoCategory}
                      onChange={(e) => setInfoCategory(e.target.value)}
                      className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/30 px-4 py-3 outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Caption / Description (up to 10,000 chars)
                  </label>
                  <textarea
                    rows={4}
                    maxLength={10000}
                    required
                    placeholder="Detailed caption text that expands with Read More..."
                    value={infoCaption}
                    onChange={(e) => setInfoCaption(e.target.value)}
                    className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/30 px-4 py-3 outline-none text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
              <button
                type="submit"
                className="rounded-full bg-zinc-950 text-white dark:bg-white dark:text-black px-8 py-3 text-xs font-bold shadow-lg flex items-center gap-2"
              >
                <Save size={16} /> Publish 4:5 Infographic
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: Podcast RSS Sync */}
        {activeTab === "podcasts" && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-bold">Connected Platform Podcast RSS Feeds</h3>
            <div className="space-y-3">
              {[
                { name: "IPN Feed", url: "https://anchor.fm/s/1154f5ab8/podcast/rss" },
                { name: "IGC Feed", url: "https://anchor.fm/s/109d1667c/podcast/rss" },
                { name: "IFR Feed", url: "https://anchor.fm/s/e7ad1b40/podcast/rss" },
                { name: "ISR Feed", url: "https://anchor.fm/s/f49f1ccc/podcast/rss" },
                { name: "Z Feed", url: "https://anchor.fm/s/10ae98954/podcast/rss" },
              ].map((feed, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 gap-3"
                >
                  <div>
                    <span className="font-bold text-sm block">{feed.name}</span>
                    <span className="text-xs text-zinc-500 break-all">{feed.url}</span>
                  </div>
                  <button
                    onClick={() => alert("RSS feed re-synchronized successfully!")}
                    className="rounded-full bg-black/5 dark:bg-white/10 px-4 py-2 text-xs font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition"
                  >
                    Sync Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Platform Overview */}
        {activeTab === "overview" && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10">
              <Users className="text-[#9a6d35]" size={24} />
              <p className="mt-3 text-xs text-zinc-500 font-bold uppercase">Total Members</p>
              <p className="text-2xl font-black mt-1">1,420 Active</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10">
              <FileText className="text-[#9a6d35]" size={24} />
              <p className="mt-3 text-xs text-zinc-500 font-bold uppercase">Published Items</p>
              <p className="text-2xl font-black mt-1">328 Entries</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10">
              <Radio className="text-[#9a6d35]" size={24} />
              <p className="mt-3 text-xs text-zinc-500 font-bold uppercase">Podcast Streams</p>
              <p className="text-2xl font-black mt-1">12,850 Views</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10">
              <ShieldCheck className="text-[#9a6d35]" size={24} />
              <p className="mt-3 text-xs text-zinc-500 font-bold uppercase">System Health</p>
              <p className="text-2xl font-black mt-1 text-emerald-600">100% Operational</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
