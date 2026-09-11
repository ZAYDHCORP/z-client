"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Search as SearchIcon,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Maximize2,
  Minimize2,
  List,
  Sun,
  Moon,
  Type,
} from "lucide-react";

export type BookSampleData = {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  coverImage?: string;
  chapters: {
    title: string;
    content: string[];
  }[];
};

const DEFAULT_SAMPLE_BOOK: BookSampleData = {
  id: "book-sample-1",
  title: "World Policy & Ethical Governance Handbook",
  subtitle: "Frameworks for Modern Public Affairs and Sustainable Progress",
  author: "Dr. Zayd Haji",
  coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
  chapters: [
    {
      title: "Chapter 1: Principles of International Public Networks",
      content: [
        "In an era defined by interconnected challenges, the role of public networks has transcended traditional diplomatic boundaries. The International Public Network (IPN) serves as a vital bridge between public interest, policy formulation, and global progress.",
        "Effective governance requires transparent channels that synthesise scientific research, economic realities, and societal aspirations. By establishing unified standards across international platforms, leaders can build policies that endure across generations.",
        "Key focus areas include law, justice, environmental sustainability, and regional economic stability. This handbook outlines actionable strategies for practitioners in global affairs, diplomacy, and ethical governance."
      ]
    },
    {
      title: "Chapter 2: Ethical Finance & Economic Integrity",
      content: [
        "Financial systems carry profound moral implications. Integrity Finance Research (IFR) examines how ethical banking, Shariah governance, and public policy intersect to form resilient financial architectures.",
        "Unlike speculative financial models, ethical finance prioritises real economic value, risk-sharing, and long-term societal well-being. From global market dynamics to micro-level financial literacy, establishing trust is paramount.",
        "Case studies from emerging and developed economies demonstrate that institutions adhering to strict governance codes outperform traditional counterparts during periods of macroeconomic volatility."
      ]
    },
    {
      title: "Chapter 3: Leadership, Mindset & Continuous Growth",
      content: [
        "Inspire Guide Connect (IGC) addresses the human dimension of organizational success. Productivity, leadership, and personal growth form the foundation upon which strategic policies are executed.",
        "Time management in complex knowledge ecosystems requires disciplined prioritization. Leaders must cultivate adaptive mindsets, effective communication skills, and empathy when guiding diverse teams.",
        "Embracing a growth mindset allows professionals to navigate industry transformations, integrate cutting-edge technologies, and contribute meaningfully to their communities."
      ]
    },
    {
      title: "Chapter 4: Theological Insights & Contemporary Discourse",
      content: [
        "Ideological Studies Research (ISR) explores the foundational texts, classical jurisprudence, and contemporary theological discussions shaping global perspectives.",
        "A rigorous analytical approach to classical sources | including Quranic commentary and Hadith methodology | enables scholars and research practitioners to address modern socio-ethical questions with clarity and authenticity.",
        "By examining theology in dialogue with science, ethics, and relationships, ISR fosters balanced intellectual inquiry grounded in scholarly traditional rigor."
      ]
    }
  ]
};

export default function GateReader({
  book = DEFAULT_SAMPLE_BOOK,
  onClose,
}: {
  book?: BookSampleData;
  onClose: () => void;
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [readerTheme, setReaderTheme] = useState<"light" | "sepia" | "dark">("sepia");
  const [showToc, setShowToc] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [turningPage, setTurningPage] = useState<"next" | "prev" | null>(null);

  // Flatten book pages (title page + chapter pages)
  const pages = React.useMemo(() => {
    const list: { type: "cover" | "chapter"; title: string; text: string[]; chapterIndex?: number }[] = [];
    list.push({
      type: "cover",
      title: book.title,
      text: [book.subtitle || "", `By ${book.author}`, "Gate Publications • Free Sample Edition"],
    });

    book.chapters.forEach((chap, cIdx) => {
      // Create pages per chapter
      list.push({
        type: "chapter",
        title: chap.title,
        text: chap.content,
        chapterIndex: cIdx,
      });
    });

    return list;
  }, [book]);

  const totalPages = pages.length;

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setTurningPage("next");
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1);
        setTurningPage(null);
      }, 250);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setTurningPage("prev");
      setTimeout(() => {
        setCurrentPage((prev) => prev - 1);
        setTurningPage(null);
      }, 250);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages]);

  // Touch swipe handling
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) handleNext();
    if (diff < -50) handlePrev();
  };

  const toggleBookmark = () => {
    if (bookmarks.includes(currentPage)) {
      setBookmarks(bookmarks.filter((b) => b !== currentPage));
    } else {
      setBookmarks([...bookmarks, currentPage]);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Reader theme colors
  const themeClasses = {
    light: "bg-[#faf8f5] text-zinc-900 border-zinc-200",
    sepia: "bg-[#f4ecd8] text-[#42321c] border-[#e2d5ba]",
    dark: "bg-[#18181b] text-zinc-100 border-zinc-800",
  }[readerTheme];

  const currentPageData = pages[currentPage];

  // Search results
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const matches: { pageIndex: number; title: string; snippet: string }[] = [];
    pages.forEach((p, idx) => {
      const fullText = p.text.join(" ");
      if (p.title.toLowerCase().includes(q) || fullText.toLowerCase().includes(q)) {
        matches.push({
          pageIndex: idx,
          title: p.title,
          snippet: fullText.substring(0, 90) + "...",
        });
      }
    });
    return matches;
  }, [searchQuery, pages]);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col font-serif ${themeClasses} transition-colors duration-300`}>
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between border-b px-4 py-3 font-sans backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-black/10 dark:hover:bg-white/10 transition"
            title="Close Reader"
          >
            <X size={20} />
          </button>
          <div>
            <span className="block text-sm font-semibold truncate max-w-[200px] sm:max-w-xs">{book.title}</span>
            <span className="block text-xs opacity-70">
              Page {currentPage + 1} of {totalPages}
            </span>
          </div>
        </div>

        {/* Reader Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setShowToc(!showToc)}
            className={`rounded-full p-2 hover:bg-black/10 dark:hover:bg-white/10 transition ${showToc ? "bg-black/10 dark:bg-white/15" : ""}`}
            title="Table of Contents"
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`rounded-full p-2 hover:bg-black/10 dark:hover:bg-white/10 transition ${showSearch ? "bg-black/10 dark:bg-white/15" : ""}`}
            title="Search inside book"
          >
            <SearchIcon size={18} />
          </button>
          <button
            onClick={toggleBookmark}
            className="rounded-full p-2 hover:bg-black/10 dark:hover:bg-white/10 transition"
            title={bookmarks.includes(currentPage) ? "Remove Bookmark" : "Add Bookmark"}
          >
            {bookmarks.includes(currentPage) ? (
              <BookmarkCheck size={18} className="text-[#9a6d35]" />
            ) : (
              <Bookmark size={18} />
            )}
          </button>

          {/* Theme switcher */}
          <div className="hidden sm:flex items-center gap-1 rounded-full border border-current/15 p-1 text-xs font-sans">
            <button
              onClick={() => setReaderTheme("light")}
              className={`rounded-full px-2 py-0.5 ${readerTheme === "light" ? "bg-white text-black font-bold shadow-sm" : ""}`}
            >
              Light
            </button>
            <button
              onClick={() => setReaderTheme("sepia")}
              className={`rounded-full px-2 py-0.5 ${readerTheme === "sepia" ? "bg-[#e2d5ba] text-[#332210] font-bold shadow-sm" : ""}`}
            >
              Sepia
            </button>
            <button
              onClick={() => setReaderTheme("dark")}
              className={`rounded-full px-2 py-0.5 ${readerTheme === "dark" ? "bg-zinc-800 text-white font-bold shadow-sm" : ""}`}
            >
              Dark
            </button>
          </div>

          {/* Zoom controls */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(80, z - 15))}
              className="rounded-full p-2 hover:bg-black/10 dark:hover:bg-white/10"
              title="Zoom Out"
            >
              <ZoomOut size={18} />
            </button>
            <span className="text-xs font-sans opacity-70 w-9 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(180, z + 15))}
              className="rounded-full p-2 hover:bg-black/10 dark:hover:bg-white/10"
              title="Zoom In"
            >
              <ZoomIn size={18} />
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="rounded-full p-2 hover:bg-black/10 dark:hover:bg-white/10 transition hidden sm:block"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </header>

      {/* Main Reading Area */}
      <div
        className="relative flex-1 overflow-hidden flex items-center justify-center p-4 sm:p-8"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Table of Contents Drawer */}
        {showToc && (
          <div className="absolute left-0 top-0 bottom-0 z-30 w-72 sm:w-80 border-r bg-inherit backdrop-blur-xl p-5 shadow-2xl overflow-y-auto font-sans animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Contents & Bookmarks</h3>
              <button onClick={() => setShowToc(false)} className="rounded-full p-1 hover:bg-black/10">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2">Chapters</h4>
                <div className="space-y-1">
                  {pages.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentPage(idx);
                        setShowToc(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${
                        currentPage === idx ? "bg-[#9a6d35] text-white font-semibold" : "hover:bg-black/5 dark:hover:bg-white/10"
                      }`}
                    >
                      {idx === 0 ? "Cover & Preface" : p.title}
                    </button>
                  ))}
                </div>
              </div>

              {bookmarks.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2">Saved Bookmarks</h4>
                  <div className="space-y-1">
                    {bookmarks.map((bIdx) => (
                      <button
                        key={bIdx}
                        onClick={() => {
                          setCurrentPage(bIdx);
                          setShowToc(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2"
                      >
                        <Bookmark size={14} className="text-[#9a6d35]" />
                        <span>Page {bIdx + 1}: {pages[bIdx].title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Panel */}
        {showSearch && (
          <div className="absolute right-0 top-0 bottom-0 z-30 w-72 sm:w-80 border-l bg-inherit backdrop-blur-xl p-5 shadow-2xl overflow-y-auto font-sans animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Search in Book</h3>
              <button onClick={() => setShowSearch(false)} className="rounded-full p-1 hover:bg-black/10">
                <X size={16} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Type keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-current/20 bg-black/5 dark:bg-white/10 outline-none text-sm"
              autoFocus
            />
            <div className="mt-4 space-y-2">
              {searchResults.length === 0 && searchQuery && (
                <p className="text-sm opacity-60">No matches found.</p>
              )}
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentPage(res.pageIndex);
                    setShowSearch(false);
                  }}
                  className="w-full text-left p-3 rounded-xl border border-current/10 hover:bg-black/5 dark:hover:bg-white/10 text-sm"
                >
                  <p className="font-bold text-xs opacity-70">Page {res.pageIndex + 1}</p>
                  <p className="font-semibold">{res.title}</p>
                  <p className="text-xs opacity-80 mt-1 line-clamp-2">{res.snippet}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Book Page Frame with Page Turn Animation */}
        <div
          className={`relative max-w-3xl w-full mx-auto min-h-[500px] sm:min-h-[640px] rounded-3xl border border-current/10 shadow-2xl p-6 sm:p-12 flex flex-col justify-between transition-all duration-300 transform ${
            turningPage === "next"
              ? "-rotate-1 translate-x-4 opacity-75 scale-[0.98]"
              : turningPage === "prev"
              ? "rotate-1 -translate-x-4 opacity-75 scale-[0.98]"
              : "rotate-0 translate-x-0 opacity-100 scale-100"
          }`}
          style={{ zoom: `${zoom}%` }}
        >
          {/* Header metadata */}
          <div className="flex justify-between items-center text-xs opacity-50 font-sans uppercase tracking-widest border-b border-current/10 pb-3">
            <span>{book.author}</span>
            <span>Gate Free Sample</span>
          </div>

          {/* Page Body */}
          <div className="my-6 space-y-6 flex-1">
            {currentPageData.type === "cover" ? (
              <div className="text-center py-12 flex flex-col items-center justify-center space-y-6">
                <div className="w-40 sm:w-48 aspect-[16/25] rounded-2xl bg-gradient-to-br from-amber-800 to-amber-950 text-white p-4 shadow-2xl flex flex-col justify-between border border-white/20">
                  <span className="text-xs font-sans tracking-widest uppercase text-amber-200">.Gate Edition</span>
                  <h2 className="font-serif text-xl font-bold leading-tight">{book.title}</h2>
                  <span className="text-xs font-sans text-amber-100">{book.author}</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold leading-snug">{book.title}</h1>
                <p className="text-base sm:text-lg opacity-80 max-w-md font-sans">{book.subtitle}</p>
                <div className="inline-block rounded-full px-4 py-1.5 border border-current/20 text-xs font-sans uppercase tracking-wider font-bold">
                  {book.author}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold border-b border-current/10 pb-3">
                  {currentPageData.title}
                </h2>
                {currentPageData.text.map((para, pIdx) => (
                  <p key={pIdx} className="text-base sm:text-lg leading-relaxed sm:leading-loose text-justify">
                    {para}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Page Footer */}
          <div className="flex justify-between items-center text-xs font-sans opacity-50 border-t border-current/10 pt-3">
            <span>{currentPageData.title}</span>
            <span>
              {currentPage + 1} / {totalPages}
            </span>
          </div>
        </div>

        {/* Desktop Prev/Next Floating Buttons */}
        <button
          onClick={handlePrev}
          disabled={currentPage === 0}
          className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 rounded-full p-4 border border-current/15 bg-inherit shadow-lg hover:scale-110 disabled:opacity-20 transition"
          title="Previous Page"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages - 1}
          className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 rounded-full p-4 border border-current/15 bg-inherit shadow-lg hover:scale-110 disabled:opacity-20 transition"
          title="Next Page"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Bottom Control Bar */}
      <footer className="border-t px-4 py-3 font-sans backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            className="flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-full border border-current/20 hover:bg-black/10 disabled:opacity-30"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <div className="flex-1 sm:w-48">
            <input
              type="range"
              min="0"
              max={totalPages - 1}
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="w-full accent-[#9a6d35]"
            />
          </div>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages - 1}
            className="flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-full border border-current/20 hover:bg-black/10 disabled:opacity-30"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>

        <div className="text-xs opacity-75 font-medium">
          Reading Progress: {Math.round(((currentPage + 1) / totalPages) * 100)}%
        </div>
      </footer>
    </div>
  );
}
