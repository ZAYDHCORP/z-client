import { cn } from "@/lib/utils"

export function GateLogo({
  className,
  showText = true,
  size = "md",
}: {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
}) {
  const dot =
    size === "lg" ? "h-10 w-10" : size === "sm" ? "h-5 w-5" : "h-7 w-7"
  const text =
    size === "lg" ? "text-xl" : size === "sm" ? "text-sm" : "text-base"
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "relative inline-block shrink-0 bg-[url('/gate-icon.png')] bg-contain bg-center bg-no-repeat dark:invert",
          dot,
        )}
        aria-hidden
      />
      {showText && (
        <span
          className={cn("font-serif font-semibold tracking-tight text-foreground", text)}
        >
          .Gate
        </span>
      )}
    </span>
  )
}
