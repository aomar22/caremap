// The whole request pipeline, kept free of Next.js so it can be unit-tested.
//
// Order matters:
//   1. safety check              (emergencies are answered even if rate-limited or invalid)
//   2. validate input            (length, personal numbers)
//   3. rate limit                (only requests that may reach the model are counted)
//   4. retrieve sources          (no match -> fixed reply, no model call)
//   5. model answer with citations

import { config } from "./config.ts";
import {
  checkSafety,
  containsPersonalNumber,
  mentionsSymptoms,
  EMERGENCY_REPLY,
  CRISIS_REPLY,
  UNSURE_REPLY,
} from "./safety.ts";
import { checkLimits, type CounterStore, getStore } from "./rateLimit.ts";
import { retrieve } from "./retrieval.ts";
import { SYSTEM_PROMPT, buildUserMessage } from "./prompt.ts";
import { askClaude, type AskModel } from "./model.ts";

export type Lang = "en" | "ar";

export type AskResponse =
  | { type: "emergency" | "crisis"; message: string; source: string }
  | {
      type: "answer";
      answer: string;
      sources: { n: number; title: string; url: string; publisher: string }[];
      note?: { message: string; source: string };
    }
  | { type: "error"; message: string };

export type AskResult = { status: number; body: AskResponse };

const MSG = {
  empty: { en: "Please type a question.", ar: "اكتب سؤالك من فضلك." },
  tooLong: {
    en: `Please keep your question under ${config.maxQuestionChars} characters.`,
    ar: `من فضلك خلي السؤال أقل من ${config.maxQuestionChars} حرف.`,
  },
  personal: {
    en: "Please don't share your health card number or other personal numbers. Remove it and ask again.",
    ar: "من فضلك ماتكتبش رقم كارت الصحة أو أي أرقام شخصية. امسحه واسأل تاني.",
  },
  perIp: {
    en: "You've reached today's question limit. Please come back tomorrow, or call Health811 (811) for help now.",
    ar: "وصلت للحد اليومي للأسئلة. ارجع بكرة، أو اتصل بـ Health811 (811) لو محتاج مساعدة دلوقتي.",
  },
  global: {
    en: "CareMap has reached its daily limit. Please try tomorrow, or call Health811 (811) for help now.",
    ar: "CareMap وصل للحد اليومي. جرّب بكرة، أو اتصل بـ Health811 (811) لو محتاج مساعدة دلوقتي.",
  },
  unavailable: {
    en: "CareMap is temporarily unavailable. For health advice call Health811 (811). In an emergency call 911.",
    ar: "CareMap مش متاح دلوقتي. للنصيحة الصحية اتصل بـ Health811 (811). في الطوارئ اتصل بـ911.",
  },
  fallback: {
    en: "I couldn't write a summary right now, but these official pages answer your question. For help choosing where to go, call Health811 (811, 24/7, free). In an emergency call 911.",
    ar: "مقدرتش أكتب ملخص دلوقتي، بس الصفحات الرسمية دي فيها إجابة سؤالك. عشان تعرف تروح فين، اتصل بـ Health811 (811، 24 ساعة، مجاني). في الطوارئ اتصل بـ911.",
  },
  noSources: {
    en: "I don't have reliable information on that yet. Health811 (call 811, 24/7, free) can help you find the right service.",
    ar: "معنديش معلومات موثوقة عن ده لسه. Health811 (اتصل بـ811، 24 ساعة، مجاني) يقدر يساعدك تلاقي الخدمة المناسبة.",
  },
} as const;

export function detectLang(text: string): Lang {
  return /[؀-ۿ]/.test(text) ? "ar" : "en";
}

export async function handleAsk(
  input: unknown,
  ip: string,
  deps: { model?: AskModel; store?: CounterStore | null } = {},
): Promise<AskResult> {
  const raw = typeof input === "string" ? input : "";
  const question = raw.trim();
  const lang = detectLang(question);

  if (!question) return { status: 400, body: { type: "error", message: MSG.empty[lang] } };

  // Safety first: an emergency gets the 911 reply even if the question is too
  // long or contains a health card number. (Checked on a bounded slice.)
  const safety = checkSafety(question.slice(0, 5000));
  if (safety.kind === "emergency")
    return { status: 200, body: { type: "emergency", message: EMERGENCY_REPLY[lang], source: EMERGENCY_REPLY.source } };
  if (safety.kind === "crisis")
    return { status: 200, body: { type: "crisis", message: CRISIS_REPLY[lang], source: CRISIS_REPLY.source } };

  if (question.length > config.maxQuestionChars)
    return { status: 400, body: { type: "error", message: MSG.tooLong[lang] } };
  if (containsPersonalNumber(question))
    return { status: 400, body: { type: "error", message: MSG.personal[lang] } };

  const hits = retrieve(question);
  const note = mentionsSymptoms(question)
    ? { message: UNSURE_REPLY[lang], source: UNSURE_REPLY.source }
    : undefined;

  if (hits.length === 0) {
    // Nothing to ground an answer on: don't spend a model call.
    return { status: 200, body: { type: "answer", answer: MSG.noSources[lang], sources: [], note } };
  }

  const limit = await checkLimits(ip, deps.store === undefined ? getStore() : deps.store);
  if (!limit.ok) {
    const status = limit.reason === "per_ip" ? 429 : 503;
    return { status, body: { type: "error", message: MSG[limit.reason === "per_ip" ? "perIp" : limit.reason][lang] } };
  }

  const sources = hits.map((h) => h.source);
  try {
    const answer = await (deps.model ?? askClaude)(SYSTEM_PROMPT, buildUserMessage(question, sources));
    return {
      status: 200,
      body: {
        type: "answer",
        answer,
        sources: sources.map((s, i) => ({
          n: i + 1,
          title: lang === "ar" ? s.title_ar : s.title,
          url: s.url,
          publisher: s.publisher,
        })),
        note,
      },
    };
  } catch (err) {
    console.error("[CareMap] Answer failed:", err instanceof Error ? err.message : err);
    // Still useful without the model: show the official pages we found.
    return {
      status: 200,
      body: {
        type: "answer",
        answer: MSG.fallback[lang],
        sources: sources.map((s, i) => ({
          n: i + 1,
          title: lang === "ar" ? s.title_ar : s.title,
          url: s.url,
          publisher: s.publisher,
        })),
        note,
      },
    };
  }
}
