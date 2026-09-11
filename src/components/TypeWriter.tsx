import { useEffect, useState } from "react";

interface TypewriterProps {
  words: string[];
  className?: string;
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseMs?: number;
}

export function Typewriter({
  words,
  className = "",
  typeSpeed = 140,
  deleteSpeed = 70,
  pauseMs = 1000,
}: TypewriterProps) {
  const [index, setIndex] = useState(0);
  const [sub, setSub] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[index % words.length];

    if (!deleting && sub === current) {
      const t = setTimeout(() => setDeleting(true), pauseMs);
      return () => clearTimeout(t);
    }
    if (deleting && sub === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
      return;
    }
    const t = setTimeout(
      () => {
        setSub((s) =>
          deleting ? current.slice(0, s.length - 1) : current.slice(0, s.length + 1),
        );
      },
      deleting ? deleteSpeed : typeSpeed,
    );
    return () => clearTimeout(t);
  }, [sub, deleting, index, words, typeSpeed, deleteSpeed, pauseMs]);

  return (
    <span className={className} aria-live="polite">
      {sub}
      <span className="inline-block w-[2px] h-[0.9em] align-[-0.1em] bg-current ml-1 animate-pulse" />
    </span>
  );
}
