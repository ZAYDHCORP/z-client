import type { PlatformKey } from "@/lib/home-data";

export function PlatformLogo({ id }: { id: PlatformKey | "Z" }) {
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
