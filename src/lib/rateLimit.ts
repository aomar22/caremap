// Daily limits: per visitor and for the whole app.
//
// Production uses Upstash Redis over its REST API (no extra package needed).
// Without Redis, an in-memory store is used for local development only:
// in production we FAIL CLOSED, because serverless memory is not shared
// between instances and would not really protect your API budget.

import { createHash } from "node:crypto";
import { config } from "./config.ts";

export interface CounterStore {
  /** Increment key, set it to expire after ttlSeconds, return the new value. */
  incr(key: string, ttlSeconds: number): Promise<number>;
}

export class MemoryStore implements CounterStore {
  private data = new Map<string, { value: number; expires: number }>();
  async incr(key: string, ttlSeconds: number): Promise<number> {
    const now = Date.now();
    const entry = this.data.get(key);
    if (!entry || entry.expires <= now) {
      this.data.set(key, { value: 1, expires: now + ttlSeconds * 1000 });
      return 1;
    }
    entry.value += 1;
    return entry.value;
  }
}

export class UpstashStore implements CounterStore {
  private url: string;
  private token: string;
  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }
  async incr(key: string, ttlSeconds: number): Promise<number> {
    const res = await fetch(`${this.url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["INCR", key],
        // Keys include the date, so refreshing the TTL on each hit is harmless.
        ["EXPIRE", key, String(ttlSeconds)],
      ]),
      cache: "no-store",
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Upstash ${res.status}: ${detail.slice(0, 200)}`);
    }
    const data = (await res.json()) as Array<{ result?: number; error?: string }>;
    const value = data[0]?.result;
    if (typeof value !== "number") throw new Error("Rate limit store returned no count");
    return value;
  }
}

let defaultStore: CounterStore | null | undefined;

/** Returns the store to use, or null if limits can't be enforced safely. */
export function getStore(): CounterStore | null {
  if (defaultStore !== undefined) return defaultStore;
  // Tolerate values pasted with quotes or spaces (e.g. copied from a .env snippet).
  const clean = (v?: string) => v?.trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");
  const url = clean(process.env.UPSTASH_REDIS_REST_URL);
  const token = clean(process.env.UPSTASH_REDIS_REST_TOKEN);
  if (url && token) defaultStore = new UpstashStore(url, token);
  else if (process.env.NODE_ENV !== "production") defaultStore = new MemoryStore();
  else {
    console.error("[CareMap] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are missing: refusing model calls.");
    defaultStore = null;
  }
  return defaultStore;
}

/** We never store raw IP addresses, only a salted hash. */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || "caremap-dev-salt";
  return createHash("sha256").update(salt + ip).digest("hex").slice(0, 32);
}

function today(): string {
  return new Date().toISOString().slice(0, 10); // UTC day
}

const DAY = 60 * 60 * 26; // a bit over a day so keys outlive the UTC day

export type LimitResult =
  | { ok: true; remaining: number }
  | { ok: false; reason: "per_ip" | "global" | "unavailable" };

export async function checkLimits(ip: string, store = getStore()): Promise<LimitResult> {
  if (!store) return { ok: false, reason: "unavailable" };
  const day = today();
  try {
    const mine = await store.incr(`rl:ip:${hashIp(ip)}:${day}`, DAY);
    if (mine > config.perIpDaily) return { ok: false, reason: "per_ip" };
    const all = await store.incr(`rl:global:${day}`, DAY);
    if (all > config.globalDaily) return { ok: false, reason: "global" };
    return { ok: true, remaining: config.perIpDaily - mine };
  } catch (err) {
    console.error("[CareMap] Rate limit store error:", err instanceof Error ? err.message : err);
    // If we can't count, we don't spend.
    return { ok: false, reason: "unavailable" };
  }
}
