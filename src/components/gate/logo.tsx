import { cn } from "@/lib/utils";

const BULLET = ["•"];
const LETTERS = [" G", "a", "t", "e"];

export function GateLogo({
  className,
  showText = true,
  size = "md",
}: {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const text =
    size === "lg" ? "text-4xl" : size === "sm" ? "text-lg" : "text-2xl";
  return (
    <span className={cn("gate-logo-wrapper", className)}>
      <span
        className={`gate-dot heartbeat${size === "lg" ? " gate-dot-lg" : ""}`}
        aria-hidden
      />
      {showText && (
        <>
          <span className={cn("gate-wordmark text-foreground", text)}>
            {BULLET.map((letter, i) => (
              <span
                key={i}
                className="letter-reveal"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                {letter}
              </span>
            ))}
          </span>
          <span className={cn("gate-wordmark text-foreground", text)}>
            {LETTERS.map((letter, i) => (
              <span
                key={i}
                className="letter-reveal"
                style={{ animationDelay: `${i * 75}ms` }}
              >
                {letter}
              </span>
            ))}
          </span>
        </>
      )}
    </span>
  );
}
