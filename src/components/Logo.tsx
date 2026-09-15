const LETTERS = [".", "G", "a", "t", "e"];

export function Logo({
  withWordmark = true,
  compact = false,
  invert = false,
}: {
  withWordmark?: boolean;
  compact?: boolean;
  /** Force the icon to its light (inverted) form for surfaces that are always dark, regardless of the site's light/dark toggle. */
  invert?: boolean;
}) {
  return (
    <div
      className="gate-logo-wrapper cursor-pointer select-none"
      aria-label=".Gate"
    >
      <span
        className={`gate-dot heartbeat${compact ? "" : " gate-dot-lg"}${invert ? " gate-dot-invert" : ""}`}
      />

      {withWordmark && (
        <span
          className={
            compact
              ? "text-xl sm:text-2xl lg:text-[1.75rem] gate-wordmark"
              : "text-3xl sm:text-4xl gate-wordmark"
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
