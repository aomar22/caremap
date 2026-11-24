// Calls the Anthropic Messages API with plain fetch (no SDK dependency).

import { config } from "./config.ts";

export type AskModel = (system: string, user: string) => Promise<string>;

export const askClaude: AskModel = async (system, user) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[CareMap] ANTHROPIC_API_KEY is not set. Add it to .env.local and restart `npm run dev`.");
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const send = (extra: Record<string, unknown>) =>
    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens,
        system,
        messages: [{ role: "user", content: user }],
        ...extra,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
    });

  // Extended thinking would spend the token budget before any visible text
  // (short, sourced answers don't need it), so turn it off. If a model doesn't
  // accept that setting, retry once with the API defaults.
  let res = await send({ thinking: { type: "disabled" } });
  if (res.status === 400) {
    const detail = await res.clone().text().catch(() => "");
    if (/thinking/i.test(detail)) {
      console.warn("[CareMap] Model rejected thinking setting; retrying with defaults.");
      res = await send({});
    }
  }

  if (!res.ok) {
    // Log the API's error (never the user's question) so problems are visible in the server terminal.
    const detail = await res.text().catch(() => "");
    console.error(`[CareMap] Model API error ${res.status}: ${detail.slice(0, 300)}`);
    throw new Error(`Model API error: ${res.status}`);
  }
  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
    stop_reason?: string;
    usage?: { output_tokens?: number };
  };
  const text = (data.content ?? [])
    .filter((b) => b.type === "text" && b.text)
    .map((b) => b.text)
    .join("\n")
    // The UI shows plain text, so drop Markdown emphasis and headings if any slip through.
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .trim();
  if (!text) {
    const types = (data.content ?? []).map((b) => b.type).join(",") || "none";
    console.error(
      `[CareMap] Empty model response: stop_reason=${data.stop_reason}, blocks=${types}, ` +
        `output_tokens=${data.usage?.output_tokens}, max_tokens=${config.maxTokens}`,
    );
    throw new Error("Empty model response");
  }
  if (data.stop_reason === "max_tokens") {
    console.warn(`[CareMap] Answer hit max_tokens (${config.maxTokens}); consider raising MAX_OUTPUT_TOKENS.`);
  }
  return text;
};