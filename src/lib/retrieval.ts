// Small keyword retriever over the curated sources. No embeddings, no external
// calls: the knowledge base is small and every source is hand-checked.

import { SOURCES, type Source } from "../content/sources.ts";
import { normalize } from "./safety.ts";

const ARABIC = /[؀-ۿ]/;

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function keywordMatches(text: string, keyword: string): boolean {
  const kw = normalize(keyword);
  if (ARABIC.test(kw)) {
    // Arabic: substring match, but short words need a word boundary.
    if (kw.length <= 3) {
      return new RegExp(`(?<![\\u0600-\\u06FF])(و|ب|ف|ال)?${escapeRegex(kw)}(?![\\u0600-\\u06FF])`).test(text);
    }
    return text.includes(kw);
  }
  // Latin: short keywords need full word boundaries ("er" must not match "error");
  // longer ones only need a start boundary so plurals match ("doctors").
  const pattern = kw.length <= 3 ? `\\b${escapeRegex(kw)}\\b` : `\\b${escapeRegex(kw)}`;
  return new RegExp(pattern).test(text);
}

export type Hit = { source: Source; score: number };

export function retrieve(question: string, k = 4): Hit[] {
  const text = normalize(question);
  return SOURCES.map((source) => {
    let score = 0;
    for (const keyword of source.keywords) {
      if (keywordMatches(text, keyword)) {
        // Multi-word phrases are more specific, so they count more.
        score += keyword.trim().split(/\s+/).length;
      }
    }
    return { source, score };
  })
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
