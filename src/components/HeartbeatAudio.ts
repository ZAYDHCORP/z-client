"use client";

// Web Audio API Heartbeat Synthesizer
// Produces an audible double-thump (lub-dub) synchronized with .gate-dot pulse
export function playHeartbeatSound() {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Pulse 1 - Lub (0.17s)
    playThump(ctx, now + 0.17, 75, 35, 0.14, 0.35);
    // Pulse 1 - Dub (0.58s)
    playThump(ctx, now + 0.58, 95, 45, 0.12, 0.28);

    // Pulse 2 - Lub (1.59s)
    playThump(ctx, now + 1.59, 75, 35, 0.14, 0.35);
    // Pulse 2 - Dub (2.00s)
    playThump(ctx, now + 2.00, 95, 45, 0.12, 0.28);
  } catch (err) {
    console.debug("Heartbeat audio autoplay restriction:", err);
  }
}

function playThump(
  ctx: AudioContext,
  startTime: number,
  startFreq: number,
  endFreq: number,
  duration: number,
  gainVal: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(startFreq, startTime);
  osc.frequency.exponentialRampToValueAtTime(
    endFreq,
    startTime + duration
  );

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainVal, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}
