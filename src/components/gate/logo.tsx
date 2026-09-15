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
    size === "lg" ? "h-5 w-5" : size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5"
  const text =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-xl"
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "relative inline-block bg-[url('/gate-icon.png')] bg-contain bg-center bg-no-repeat invert",
          dot,
        )}
        aria-hidden
      />
      {showText && (
        <span
          className={cn(
            "font-semibold tracking-tight text-foreground",
            text,
          )}
          style={{ fontFamily: "'Hoefler Text', Georgia, 'Times New Roman', serif" }}
        >
          Gate
        </span>
      )}
    </span>
  )
}
