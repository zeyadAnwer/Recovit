/**
 * Fixed-window rate limiter.
 *
 * The default store is in-memory, which is correct for a single Node process
 * (our deployment). For several instances or serverless hosts, implement
 * `RateLimitStore` on a shared store (Redis, Cloudflare KV…) — callers don't
 * change. nginx `limit_req` sits in front as a second, coarser layer.
 */
export interface RateLimitStore {
  /** Increments the counter for `key` and returns its value and window expiry. */
  increment(key: string, windowMs: number, now: number): { count: number; resetAt: number };
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the window resets (for a Retry-After header). */
  retryAfter: number;
}

export class MemoryStore implements RateLimitStore {
  readonly #entries = new Map<string, { count: number; resetAt: number }>();
  readonly #maxKeys: number;

  constructor(maxKeys = 10_000) {
    this.#maxKeys = maxKeys;
  }

  increment(key: string, windowMs: number, now: number) {
    const current = this.#entries.get(key);
    if (current && current.resetAt > now) {
      current.count += 1;
      return current;
    }
    if (this.#entries.size >= this.#maxKeys) this.#sweep(now);
    const fresh = { count: 1, resetAt: now + windowMs };
    this.#entries.set(key, fresh);
    return fresh;
  }

  /** Drops expired windows; if still full, drops the oldest entries. */
  #sweep(now: number): void {
    for (const [key, entry] of this.#entries) {
      if (entry.resetAt <= now) this.#entries.delete(key);
    }
    const overflow = this.#entries.size - Math.floor(this.#maxKeys * 0.9);
    if (overflow > 0) {
      for (const key of [...this.#entries.keys()].slice(0, overflow)) this.#entries.delete(key);
    }
  }
}

export function createRateLimiter(options: {
  max: number;
  windowMs: number;
  store?: RateLimitStore;
  now?: () => number;
}) {
  const store = options.store ?? new MemoryStore();
  const now = options.now ?? Date.now;
  return {
    hit(key: string): RateLimitResult {
      const time = now();
      const { count, resetAt } = store.increment(key, options.windowMs, time);
      return {
        allowed: count <= options.max,
        retryAfter: Math.max(0, Math.ceil((resetAt - time) / 1000)),
      };
    },
  };
}
