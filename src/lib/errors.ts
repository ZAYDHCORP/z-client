export type ApiError = {
  status?: number;
  message?: string;
  sessionExpired?: boolean;
  data?: unknown;
};

export function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return fallback;
}

export function isSessionExpired(err: unknown): boolean {
  return Boolean(
    err && typeof err === "object" && (err as { sessionExpired?: unknown }).sessionExpired === true,
  );
}
