export type RateLimitResult = {
  allowed: boolean;
  timestamps: number[];
  retryAfterSeconds: number;
};

export function checkRateLimit(
  priorTimestamps: readonly number[],
  now: number,
  requestedLimit: number,
  requestedWindowMs: number,
): RateLimitResult {
  const limit = Math.max(1, Math.floor(requestedLimit) || 1);
  const windowMs = Math.max(1_000, Math.floor(requestedWindowMs) || 1_000);
  const cutoff = now - windowMs;
  const timestamps = priorTimestamps.filter((timestamp) => Number.isFinite(timestamp) && timestamp > cutoff);

  if (timestamps.length >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((timestamps[0] + windowMs - now) / 1_000));
    return { allowed: false, timestamps, retryAfterSeconds };
  }

  return { allowed: true, timestamps: [...timestamps, now], retryAfterSeconds: 0 };
}
