// Safety checks that run BEFORE any model call.
// These rules are deterministic on purpose: the model never decides whether
// something is an emergency. When in doubt, we over-trigger.
//
// Emergency signs come from the Government of Ontario "Emergency rooms" page:
// https://www.ontario.ca/page/emergency-rooms
// (loss of consciousness, pain not relieved by pain medication, confusion,
//  persistent severe chest pain, difficulty breathing)

export type SafetyResult =
  | { kind: "emergency"; matched: string[] }
  | { kind: "crisis"; matched: string[] }
  | { kind: "ok" };

type Rule = { id: string; patterns: RegExp[] };

// Arabic text is normalized before matching (see normalize()), so patterns
// are written without diacritics and with unified alef / ya / ta marbuta.
const EMERGENCY_RULES: Rule[] = [
  {
    id: "loss_of_consciousness",
    patterns: [
      /\b(unconscious|passed out|pass(ing)? out|fainted|faint(ing)?|not waking up|won'?t wake up|unresponsive|blacked out)\b/,
      /(فقد|فاقد|فقدان) (ال)?وعي/,
      /(اغمي|اغما|مغمي) عليه/,
      /(مبيفوقش|مش بيفوق|مش بتفوق|مش راضي يفوق|مش راضيه تفوق)/,
    ],
  },
  {
    id: "pain_not_relieved",
    patterns: [
      /\bpain\b.*\b(medication|meds|painkillers?|tylenol|advil|ibuprofen|acetaminophen)\b.*\b(not|isn'?t|doesn'?t|don'?t|won'?t|no longer)\b/,
      /\b(painkillers?|pain medication|meds)\b.*\b(not|isn'?t|doesn'?t|don'?t|aren'?t)\b.*\b(work|help|relieve)/,
      /\b(worst|unbearable|severe|excruciating) pain\b/,
      /(مسكن|مسكنات|بنادول|بروفين).*(مش|مبيجيبش|مش بيجيب|مش نافع|مفيش فايده|مش جايب)/,
      /(الم|وجع) (شديد|فظيع|مش طبيعي|مش محتمل)/,
    ],
  },
  {
    id: "confusion",
    patterns: [
      /\b(confused|confusion|disoriented|not making sense|can'?t speak|slurred speech|doesn'?t know where)\b/,
      /(تشوش|تايه|مش مركز خالص|مش عارف هو فين|كلامه مش مفهوم|لسانه تقيل)/,
    ],
  },
  {
    id: "chest_pain",
    patterns: [
      /\bchest\b.*\b(pain|pressure|tight|tightness|hurts?|squeez)/,
      /\b(pain|pressure|tightness) in (my|his|her|the) chest\b/,
      /(الم|وجع|ضغط|كتمه|تقل) (في )?(ال)?صدر/,
      /صدري (واجعني|بيوجعني|مكتوم)/,
    ],
  },
  {
    id: "difficulty_breathing",
    patterns: [
      /\b(can'?t|cannot|hard to|trouble|difficulty|struggling to) breath/,
      /\b(short(ness)? of breath|not breathing|choking|gasping)\b/,
      /(ضيق|صعوبه) (في )?(ال)?(تنفس|نفس)/,
      /(مش|مش قادر|مش قادره|مش عارف|مش عارفه) (ي|ا|ت)?(تنفس|اخد نفسي|ياخد نفسه|تاخد نفسها)/,
      /(بيتخنق|بتتخنق|اتخنق|مخنوق)/,
    ],
  },
];

// Mental health crisis: routed to 988 (Suicide Crisis Helpline, Canada) and 911.
const CRISIS_RULES: Rule[] = [
  {
    id: "self_harm",
    patterns: [
      /\b(suicid\w*|kill (my|him|her)self|end (my|his|her) life|want to die|hurt (my|him|her)self|self[- ]harm)\b/,
      /(انتحار|انتحر|اموت نفسي|اقتل نفسي|عايز اموت|عايزه اموت|اذي نفسي|اأذي نفسي)/,
    ],
  },
];

// Symptom words that are NOT red flags. We never judge severity; when these
// appear we add the Health811 note so a nurse makes that call.
const SYMPTOM_HINTS: RegExp[] = [
  /\b(fever|cough\w*|rash\w*|pain|ache|aching|hurts?|sore|sick|vomit\w*|nause\w*|diarrh\w*|headache|dizz\w*|bleed\w*|swollen|swelling|infection|symptoms?|itch\w*|burn\w*)\b/,
  /(حراره|سخونيه|سخن|كحه|بيكح|طفح|حبوب في|وجع|بيوجعني|واجعني|عيان|تعبان|ترجيع|بيرجع|اسهال|صداع|دوخه|دايخ|نزيف|التهاب|حكه|اعراض)/,
  // Short stems need Arabic word boundaries ("الم" is also the start of "المستشفي").
  /(?<![\u0600-\u06FF])(و|ب|ف)?(الم|ورم|عرض)(?![\u0600-\u06FF])/,
];

export function mentionsSymptoms(question: string): boolean {
  const text = normalize(question);
  return SYMPTOM_HINTS.some((p) => p.test(text));
}

// Health card numbers (10 digits, often 4-3-3) must never be sent to us.
const HEALTH_CARD = /\b\d{4}[\s-]?\d{3}[\s-]?\d{3}\b/;

export function containsPersonalNumber(question: string): boolean {
  return HEALTH_CARD.test(question);
}

/** Lowercase, strip Arabic diacritics/tatweel, unify common letter variants. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ً-ْـ]/g, "") // harakat + tatweel
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/’/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function match(rules: Rule[], text: string): string[] {
  return rules
    .filter((r) => r.patterns.some((p) => p.test(text)))
    .map((r) => r.id);
}

export function checkSafety(question: string): SafetyResult {
  const text = normalize(question);
  const crisis = match(CRISIS_RULES, text);
  if (crisis.length) return { kind: "crisis", matched: crisis };
  const emergency = match(EMERGENCY_RULES, text);
  if (emergency.length) return { kind: "emergency", matched: emergency };
  return { kind: "ok" };
}

// Fixed replies. These never go through the model.
export const EMERGENCY_REPLY = {
  en:
    "This may be an emergency. Call 911 now or go to the nearest emergency department. " +
    "Don't wait for an online answer.",
  ar: "ده ممكن يكون طوارئ. اتصل بـ911 دلوقتي أو روح أقرب طوارئ. ماتستناش إجابة أونلاين.",
  source: "https://www.ontario.ca/page/emergency-rooms",
};

export const CRISIS_REPLY = {
  en:
    "You don't have to go through this alone. Call or text 988 (Suicide Crisis Helpline, " +
    "24/7, free). If you or someone else is in immediate danger, call 911.",
  ar:
    "إنت مش لوحدك. اتصل أو ابعت رسالة على 988 (خط أزمات الانتحار، 24 ساعة، مجاني). " +
    "لو فيه خطر دلوقتي عليك أو على حد تاني، اتصل بـ911.",
  source: "https://988.ca",
};

// Used when the question is about symptoms but not a red flag:
// we don't judge severity, we point to the official nurse line.
export const UNSURE_REPLY = {
  en:
    "I can't tell how serious a symptom is. For advice on where to go, call Health811 " +
    "(dial 811, 24/7, free) to talk to a registered nurse. If it gets worse, call 911.",
  ar:
    "أنا مقدرش أحدد العرض ده خطير ولا لأ. عشان تعرف تروح فين، اتصل بـ Health811 " +
    "(اطلب 811، 24 ساعة، مجاني) وكلم ممرضة مسجلة. لو الحالة اتدهورت، اتصل بـ911.",
  source: "https://health811.ontario.ca",
};
