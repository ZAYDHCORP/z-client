"use client";

import React, { useState } from "react";
import { X, Search, Copy, Check, Headphones, Play } from "lucide-react";

export type TranscriptSegment = {
  timestamp: string;
  timeSeconds: number;
  speaker: string;
  text: string;
};

export default function PodcastTranscriptModal({
  title,
  podcastTitle,
  platform,
  creator,
  segments = [],
  currentTime = 0,
  onSeek,
  onClose,
}: {
  title: string;
  podcastTitle?: string;
  platform: string;
  creator?: string;
  segments: TranscriptSegment[];
  currentTime?: number;
  onSeek: (seconds: number) => void;
  onClose: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const filteredSegments = segments.filter(
    (s) =>
      s.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.speaker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyFullTranscript = () => {
    const fullText = segments
      .map((s) => `[${s.timestamp}] ${s.speaker}: ${s.text}`)
      .join("\n\n");
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-[2.5rem] border border-white/10 bg-[#14110e] text-white p-6 sm:p-8 shadow-2xl my-6 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-[#9a6d35] text-white">
              <Headphones size={20} />
            </div>
            <div>
              <span className="text-xs font-bold text-[#d5a85c] uppercase tracking-wider">
                {platform} • {podcastTitle || "Podcast Episode"}
              </span>
              <h3 className="text-lg font-bold leading-snug line-clamp-1">
                {title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-2.5 hover:bg-white/20 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50"
            />
            <input
              type="text"
              placeholder="Search transcript..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-white/15 bg-white/10 pl-10 pr-4 py-2 text-xs text-white outline-none focus:border-[#d5a85c]"
            />
          </div>

          <button
            onClick={copyFullTranscript}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold hover:bg-white/20 transition"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-400" /> Copied!
              </>
            ) : (
              <>
                <Copy size={14} /> Copy Full Transcript
              </>
            )}
          </button>
        </div>

        {/* Transcript Segments List */}
        <div className="mt-6 space-y-4 max-h-[420px] overflow-y-auto pr-2">
          {filteredSegments.length === 0 ? (
            <p className="text-sm opacity-60 py-8 text-center">
              No transcript matches found.
            </p>
          ) : (
            filteredSegments.map((seg, idx) => {
              const isActive =
                currentTime >= seg.timeSeconds &&
                (idx === segments.length - 1 ||
                  currentTime < (segments[idx + 1]?.timeSeconds || Infinity));

              return (
                <div
                  key={idx}
                  onClick={() => onSeek(seg.timeSeconds)}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    isActive
                      ? "bg-[#9a6d35]/20 border-[#d5a85c] text-white shadow-lg"
                      : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-[#d5a85c] flex items-center gap-1.5">
                      <Play size={10} className="fill-current" /> {seg.speaker}
                    </span>
                    <span className="rounded-full bg-black/40 px-2.5 py-0.5 font-mono text-[11px] text-white/60">
                      {seg.timestamp}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{seg.text}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
