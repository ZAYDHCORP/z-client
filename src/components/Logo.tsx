import Link from "next/link";

const LETTERS = ["G", "a", "t", "e"];

export function Logo({
  withWordmark = true,
  compact = false,
}: {
  withWordmark?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="gate-logo-wrapper cursor-pointer select-none" aria-label=".Gate">
      <span className="gate-dot heartbeat" />

      {withWordmark && (
        <span
          className={
            compact
              ? "text-4xl sm:text-5xl lg:text-[3.25rem] gate-wordmark"
              : "text-6xl sm:text-7xl gate-wordmark"
          }
        >
          {LETTERS.map((letter, i) => (
            <span
              key={i}
              className="letter-reveal"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              {letter}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}
