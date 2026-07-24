// Reconnect backoff: capped exponential with light jitter.
// attempt 0 → ~1s, 1 → ~2s, 2 → ~4s, 3 → ~8s, 4 → ~16s, 5+ → capped 30s.
// Jitter (0/250/500ms, cycling) avoids a thundering herd of simultaneous retries.
export function backoffDelay(attempt: number): number {
  const a = Math.max(0, Math.floor(attempt));
  const base = Math.min(30000, 1000 * 2 ** Math.min(a, 5));
  const jitter = (a % 3) * 250;
  return base + jitter;
}
