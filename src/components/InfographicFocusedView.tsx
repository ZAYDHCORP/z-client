"use client";

import React, { useState } from "react";
import {
  X,
  Share2,
  Bookmark,
  BookmarkCheck,
  Eye,
  Maximize2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export type InfographicPostData = {
  id: string;
  platform: "IPN" | "IGC" | "IFR" | "ISR";
  title: string;
  caption: string;
  imageUrl: string;
  category: string;
  tags: string[];
  views?: number;
  publishedAt?: string;
};

export default function InfographicFocusedView({
  post,
  onClose,
}: {
  post: InfographicPostData;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [viewCount, setViewCount] = useState(post.views || 1240);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: post.title,
          text: post.caption.slice(0, 100),
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 z-[85] grid place-items-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-[2.5rem] border border-white/10 bg-[#12100d] text-white p-6 md:p-8 shadow-2xl my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 z-10 rounded-full bg-white/10 p-2.5 hover:bg-white/20 transition"
        >
          <X size={20} />
        </button>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] items-start">
          {/* Fixed 4:5 Portrait Image Card */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-zinc-900 border border-white/10 shadow-2xl group">
            {post.imageUrl ? (
              <img
                src={post.imageUrl}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-zinc-900 via-[#80623b] to-[#12100d] p-8 flex flex-col justify-between">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold w-fit">
                  4:5 Portrait Infographic
                </span>
                <h3 className="text-3xl font-bold leading-tight">
                  {post.title}
                </h3>
                <span className="text-xs text-white/60">{post.platform}</span>
              </div>
            )}
            <span className="absolute top-4 left-4 rounded-full bg-black/60 backdrop-blur px-3 py-1 text-xs font-bold text-[#d5a85c]">
              {post.platform} • {post.category}
            </span>
          </div>

          {/* Details & Expandable Caption */}
          <div className="flex flex-col justify-between h-full space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>Published {post.publishedAt || "Recently"}</span>
                <span className="flex items-center gap-1">
                  <Eye size={14} /> {viewCount.toLocaleString()} Views
                </span>
              </div>

              <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight leading-snug">
                {post.title}
              </h2>

              {/* Caption with Read More toggle */}
              <div className="mt-4 rounded-2xl bg-white/5 p-4 border border-white/10">
                <p
                  className={`text-sm leading-relaxed text-white/80 whitespace-pre-line ${
                    expanded ? "" : "line-clamp-6"
                  }`}
                >
                  {post.caption}
                </p>
                {post.caption.length > 200 && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-3 flex items-center gap-1 text-xs font-bold text-[#d5a85c] hover:underline"
                  >
                    {expanded ? (
                      <>
                        Read Less <ChevronUp size={14} />
                      </>
                    ) : (
                      <>
                        Read More <ChevronDown size={14} />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Interaction Bar: View Count, Share, Bookmark only (No likes, comments, reactions) */}
            <div className="flex items-center justify-between border-t border-white/10 pt-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/60">
                <Eye size={16} className="text-[#d5a85c]" />
                <span>{viewCount} Views</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-bold hover:bg-white/20 transition"
                >
                  <Share2 size={15} /> Share
                </button>

                <button
                  onClick={() => setBookmarked(!bookmarked)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
                    bookmarked
                      ? "bg-[#d5a85c] text-black"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {bookmarked ? (
                    <>
                      <BookmarkCheck size={15} /> Saved
                    </>
                  ) : (
                    <>
                      <Bookmark size={15} /> Bookmark
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
