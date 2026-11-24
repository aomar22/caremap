// All limits in one place. Override with environment variables (see .env.example).

function num(name: string, fallback: number): number {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

export const config = {
  /** Questions per visitor (hashed IP) per day. */
  perIpDaily: num("PER_IP_DAILY_LIMIT", 10),
  /** Model calls for the whole app per day. This is the spend ceiling. */
  globalDaily: num("GLOBAL_DAILY_LIMIT", 200),
  /** Max characters in one question. */
  maxQuestionChars: num("MAX_QUESTION_CHARS", 500),
  /** Max tokens the model may generate per answer. */
  maxTokens: num("MAX_OUTPUT_TOKENS", 600),
  /** Cheap, fast model by default. */
  model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
};
