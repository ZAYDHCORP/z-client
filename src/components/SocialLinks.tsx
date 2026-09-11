import type { SocialLink } from "@/lib/gate-data";

export default function SocialLinks({
  links,
  className = "",
  size = 18,
}: {
  links: SocialLink[];
  className?: string;
  size?: number;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.label + link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            title={link.label}
            className="grid size-10 place-items-center rounded-full border border-black/10 bg-white/70 text-zinc-700 transition hover:-translate-y-0.5 hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white dark:hover:text-black"
          >
            <Icon size={size} />
          </a>
        );
      })}
    </div>
  );
}
