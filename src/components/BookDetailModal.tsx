"use client";

import React from "react";
import {
  X,
  BookOpen,
  ShoppingBag,
  ExternalLink,
  Share2,
  Bookmark,
  Check,
  Star,
} from "lucide-react";
import { hubByKey } from "@/lib/gate-data";
import SocialLinks from "@/components/SocialLinks";

export type BookPurchaseLinks = {
  paperbackEnabled?: boolean;
  paperbackUrl?: string;
  eBookEnabled?: boolean;
  eBookUrl?: string;
  amazonEnabled?: boolean;
  amazonUrl?: string;
  notionPressEnabled?: boolean;
  notionPressUrl?: string;
  googlePlayEnabled?: boolean;
  googlePlayUrl?: string;
  otherEnabled?: boolean;
  otherLabel?: string;
  otherUrl?: string;
};

export type BookItemData = {
  id: string;
  type: "Books" | "Research Reports";
  platform: "IPN" | "IGC" | "IFR" | "ISR";
  title: string;
  subtitle?: string;
  author: string;
  description: string;
  coverImage?: string;
  category: string;
  tags: string[];
  purchaseLinks?: BookPurchaseLinks;
  freeSampleEnabled?: boolean;
  freeSamplePdfUrl?: string;
};

export default function BookDetailModal({
  item,
  onClose,
  onReadSample,
}: {
  item: BookItemData;
  onClose: () => void;
  onReadSample: () => void;
}) {
  const links = item.purchaseLinks || {
    amazonEnabled: true,
    amazonUrl: "https://amazon.com",
    notionPressEnabled: true,
    notionPressUrl: "https://notionpress.com",
    googlePlayEnabled: true,
    googlePlayUrl: "https://play.google.com/store/books",
  };

  const hasAnyLink =
    links.paperbackEnabled ||
    links.eBookEnabled ||
    links.amazonEnabled ||
    links.notionPressEnabled ||
    links.googlePlayEnabled ||
    links.otherEnabled;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-[2.5rem] border border-black/10 bg-[#f4f0e8] dark:border-white/10 dark:bg-[#12100d] p-6 sm:p-10 shadow-2xl text-zinc-950 dark:text-white my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/10 p-2.5 hover:scale-105 transition"
        >
          <X size={20} />
        </button>

        <div className="grid gap-8 md:grid-cols-[220px_1fr] items-start">
          {/* Cover Image in 16:25 aspect ratio */}
          <div className="flex flex-col items-center">
            <div className="aspect-[16/25] w-48 sm:w-56 overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 text-white shadow-2xl border border-black/10 dark:border-white/10 relative group">
              {item.coverImage ? (
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="p-6 flex flex-col justify-between h-full bg-gradient-to-br from-[#1c1813] via-[#3a2d1d] to-[#110e0a]">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#d5a85c]">
                    {item.platform} {item.type}
                  </span>
                  <h3 className="font-serif text-lg font-bold leading-snug">
                    {item.title}
                  </h3>
                  <span className="text-xs opacity-75">{item.author}</span>
                </div>
              )}
            </div>

            {/* Read Free Sample Button */}
            {item.freeSampleEnabled !== false && (
              <button
                onClick={onReadSample}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-full bg-[#9a6d35] hover:bg-[#835b2a] text-white px-5 py-3.5 text-sm font-bold shadow-lg shadow-[#9a6d35]/20 transition"
              >
                <BookOpen size={18} />
                Read Free Sample
              </button>
            )}
          </div>

          {/* Details & Description */}
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-black/5 dark:bg-white/10 px-3 py-1 text-xs font-bold text-[#9a6d35]">
                {item.platform}
              </span>
              <span className="text-xs text-zinc-500 font-medium">
                {item.category}
              </span>
            </div>

            <h2 className="mt-3 text-3xl font-bold tracking-tight leading-snug">
              {item.title}
            </h2>
            {item.subtitle && (
              <p className="mt-1 text-base text-zinc-600 dark:text-zinc-300 font-medium">
                {item.subtitle}
              </p>
            )}

            <p className="mt-2 text-sm font-semibold text-zinc-500">
              By {item.author}
            </p>

            <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-zinc-500 border-y border-black/10 dark:border-white/10 py-3">
              <span className="flex items-center gap-1">
                <Star size={14} className="fill-[#9a6d35] text-[#9a6d35]" /> 4.9 Rating
              </span>
              <span>Language: English</span>
              <span>Format: Digital & Print</span>
            </div>

            {/* Description up to 10,000 characters */}
            <div className="mt-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                About this {item.type.slice(0, -1)}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-line max-h-60 overflow-y-auto pr-2">
                {item.description}
              </p>
            </div>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-black/5 dark:bg-white/10 px-2.5 py-1 text-xs font-semibold"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Configured Purchase Hyperlinks (Only enabled options rendered) */}
            {hasAnyLink && (
              <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1">
                  <ShoppingBag size={14} /> Available Purchase Links
                </h4>

                <div className="flex flex-wrap gap-2.5">
                  {links.paperbackEnabled && links.paperbackUrl && (
                    <a
                      href={links.paperbackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-black/15 dark:border-white/15 bg-white/80 dark:bg-white/10 px-4 py-2.5 text-xs font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition"
                    >
                      Paperback <ExternalLink size={14} />
                    </a>
                  )}

                  {links.eBookEnabled && links.eBookUrl && (
                    <a
                      href={links.eBookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-black/15 dark:border-white/15 bg-white/80 dark:bg-white/10 px-4 py-2.5 text-xs font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition"
                    >
                      eBook <ExternalLink size={14} />
                    </a>
                  )}

                  {links.amazonEnabled && links.amazonUrl && (
                    <a
                      href={links.amazonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-[#FF9900] text-black px-4 py-2.5 text-xs font-bold shadow-sm hover:brightness-105 transition"
                    >
                      Amazon <ExternalLink size={14} />
                    </a>
                  )}

                  {links.notionPressEnabled && links.notionPressUrl && (
                    <a
                      href={links.notionPressUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-[#E53935] text-white px-4 py-2.5 text-xs font-bold shadow-sm hover:brightness-105 transition"
                    >
                      NotionPress <ExternalLink size={14} />
                    </a>
                  )}

                  {links.googlePlayEnabled && links.googlePlayUrl && (
                    <a
                      href={links.googlePlayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-[#4285F4] text-white px-4 py-2.5 text-xs font-bold shadow-sm hover:brightness-105 transition"
                    >
                      Google Play Books <ExternalLink size={14} />
                    </a>
                  )}

                  {links.otherEnabled && links.otherUrl && (
                    <a
                      href={links.otherUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-black/15 dark:border-white/15 bg-white/80 dark:bg-white/10 px-4 py-2.5 text-xs font-bold hover:bg-black hover:text-white transition"
                    >
                      {links.otherLabel || "Other Store"} <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Connect with hub socials */}
            <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                Connect with {item.platform}
              </h4>
              <SocialLinks links={hubByKey(item.platform).socials} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
