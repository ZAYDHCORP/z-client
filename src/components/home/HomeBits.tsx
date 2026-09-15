import type { ReactNode } from "react";
import { BarChart3, Bookmark } from "lucide-react";

export function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#9a6d35]">{eyebrow}</p>
      <h2 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.04em] md:text-6xl">{title}</h2>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-700 dark:text-zinc-300">{text}</p>
    </div>
  );
}

export function FeedCard({ number, icon, title, text, onClick }: { number: string; icon: ReactNode; title: string; text: string; onClick?: () => void }) {
  return (
    <article onClick={onClick} className="relative rounded-[2rem] border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-black/25 cursor-pointer hover:shadow-xl transition">
      <span className="absolute right-5 top-5 rounded-full bg-zinc-950 px-3 py-1 text-xs font-bold text-white dark:bg-white dark:text-black">{number}</span>
      <div className="text-[#9a6d35]">{icon}</div>
      <h3 className="mt-8 text-2xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{text}</p>
      <div className="mt-5 flex gap-3 text-sm">
        <span className="flex items-center gap-1"><BarChart3 size={16} /> View Count</span>
        <span>Share</span>
        <span className="flex items-center gap-1"><Bookmark size={16} /> Bookmark</span>
      </div>
    </article>
  );
}

export function Metric({ title, value, icon }: { title: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-black/10 bg-white/65 p-6 dark:border-white/10 dark:bg-white/5">
      <div className="text-[#9a6d35]">{icon}</div>
      <p className="mt-8 text-sm text-zinc-500">{title}</p>
      <p className="mt-2 text-4xl font-bold tracking-tight">{value}</p>
    </div>
  );
}
