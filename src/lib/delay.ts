/**
 * Simulate network latency for mock services so the UI exercises
 * loading/queued/streaming states realistically.
 */
export function delay(ms = 600): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function jitter(min = 400, max = 1200): number {
  return Math.floor(min + Math.random() * (max - min));
}
