import { useEffect, useMemo, useRef, useState } from "react";
import { API } from "@/lib/constants";
import type { PlatformKey } from "@/lib/home-data";
import type { TranscriptSegment } from "@/components/PodcastTranscriptModal";

export type Episode = {
  platform: PlatformKey | "Z";
  podcastTitle?: string;
  creator?: string;
  title: string;
  description: string;
  transcript?: TranscriptSegment[];
  audioUrl: string;
  image: string;
  duration?: string;
  episodeUrl?: string;
  pubDate: string;
};

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

export function usePodcastPlayer({
  active,
  signedIn,
  onRequireAuth,
}: {
  active: PlatformKey;
  signedIn: boolean;
  onRequireAuth: () => void;
}) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [playing, setPlaying] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const featured = useMemo(
    () => episodes.find((item) => item.platform === active) ?? episodes[0],
    [active, episodes],
  );
  const nowPlaying = currentEpisode ?? featured;

  useEffect(() => {
    fetch(API.PODCASTS, { credentials: "include" })
      .then((res) => res.json())
      .then((data: { episodes?: Episode[] }) => setEpisodes(data.episodes ?? []))
      .catch(() => setEpisodes([]));
  }, []);

  // Keep `playing` in sync with the underlying <audio> element's native
  // play/pause state, since it can change outside toggleAudio() — e.g. the
  // media session action handlers below call audioRef.current.play/pause directly.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    audioRef.current.playbackRate = speed;
    audioRef.current.loop = repeat;
  }, [volume, speed, repeat]);

  useEffect(() => {
    if (!nowPlaying || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: nowPlaying.title,
      artist: nowPlaying.creator || nowPlaying.platform,
      album: nowPlaying.podcastTitle || `${nowPlaying.platform} Podcast`,
      artwork: nowPlaying.image ? [{ src: nowPlaying.image, sizes: "512x512", type: "image/png" }] : [],
    });
    navigator.mediaSession.setActionHandler("play", () => void audioRef.current?.play());
    navigator.mediaSession.setActionHandler("pause", () => audioRef.current?.pause());
    navigator.mediaSession.setActionHandler("seekbackward", () => skipBy(-30));
    navigator.mediaSession.setActionHandler("seekforward", () => skipBy(10));
  }, [nowPlaying]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!playerOpen) return;
      if (event.code === "Space") {
        event.preventDefault();
        void toggleAudio();
      }
      if (event.key === "ArrowLeft") skipBy(-10);
      if (event.key === "ArrowRight") skipBy(10);
      if (event.key === "Escape") setPlayerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const toggleAudio = async () => {
    if (!audioRef.current || !nowPlaying?.audioUrl) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }
    await audioRef.current.play();
    setPlaying(true);
  };

  const openEpisode = async (episode: Episode) => {
    if (!signedIn) {
      onRequireAuth();
      return;
    }
    setCurrentEpisode(episode);
    setPlayerOpen(true);
    setPlaying(false);
    window.setTimeout(() => void audioRef.current?.play().then(() => setPlaying(true)).catch(() => setPlaying(false)), 80);
  };

  const skipBy = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + seconds));
  };

  const seekTo = (value: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value;
    setProgress(value);
  };

  const updateProgress = () => {
    if (!audioRef.current) return;
    setProgress(audioRef.current.currentTime || 0);
    setDuration(audioRef.current.duration || 0);
  };

  const nextEpisode = () => {
    if (!nowPlaying || episodes.length === 0) return;
    const next = shuffle
      ? episodes[Math.floor(Math.random() * episodes.length)]
      : episodes[(episodes.findIndex((episode) => episode.audioUrl === nowPlaying.audioUrl) + 1) % episodes.length];
    setCurrentEpisode(next);
    window.setTimeout(() => void audioRef.current?.play().then(() => setPlaying(true)), 80);
  };

  return {
    episodes,
    nowPlaying,
    playing,
    playerOpen,
    setPlayerOpen,
    progress,
    duration,
    volume,
    setVolume,
    speed,
    setSpeed,
    repeat,
    setRepeat,
    shuffle,
    setShuffle,
    audioRef,
    toggleAudio,
    openEpisode,
    skipBy,
    seekTo,
    updateProgress,
    nextEpisode,
  };
}
