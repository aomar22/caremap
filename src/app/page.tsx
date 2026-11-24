"use client";

import { useEffect, useRef, useState } from "react";

type Lang = "en" | "ar";

type AskResponse =
  | { type: "emergency" | "crisis"; message: string; source: string }
  | {
      type: "answer";
      answer: string;
      sources: { n: number; title: string; url: string; publisher: string }[];
      note?: { message: string; source: string };
    }
  | { type: "error"; message: string };

const MAX_CHARS = 500;

const T = {
  en: {
    tagline: "Find the right health service in Ontario",
    emergency: "Emergency? Call 911",
    disclaimer:
      "General information from official sources. Not medical advice, and no diagnosis. Please don't enter your name, health card number or other personal details.",
    placeholder: "Ask about OHIP, finding a doctor, walk-in clinics, pharmacists…",
    ask: "Ask",
    asking: "Finding sources…",
    sources: "Sources",
    examplesTitle: "Try asking",
    examples: [
      "How do I apply for OHIP?",
      "I don't have a family doctor. What can I do?",
      "What's the difference between a walk-in clinic and urgent care?",
      "Can a pharmacist treat pink eye?",
    ],
    call911: "Call 911",
    call988: "Call or text 988",
    call811: "Call 811",
    network: "Something went wrong. For health advice call Health811 (811). In an emergency call 911.",
    footer: "Built as a portfolio project. Content is summarized from official sources; always check the linked page.",
    toggle: "العربية",
  },
  ar: {
    tagline: "اعرف تروح فين للخدمة الصحية المناسبة في أونتاريو",
    emergency: "طوارئ؟ اتصل بـ911",
    disclaimer:
      "معلومات عامة من مصادر رسمية. مش نصيحة طبية ومفيش تشخيص. من فضلك ماتكتبش اسمك ولا رقم كارت الصحة ولا أي بيانات شخصية.",
    placeholder: "اسأل عن OHIP، إزاي تلاقي دكتور، الـ walk-in، الصيدلي…",
    ask: "اسأل",
    asking: "بدوّر في المصادر…",
    sources: "المصادر",
    examplesTitle: "جرّب تسأل",
    examples: [
      "إزاي أطلع كارت OHIP؟",
      "معنديش دكتور عائلة، أعمل إيه؟",
      "إيه الفرق بين الـ walk-in والـ urgent care؟",
      "الصيدلي ينفع يعالج الرمد؟",
    ],
    call911: "اتصل بـ911",
    call988: "اتصل أو ابعت رسالة على 988",
    call811: "اتصل بـ811",
    network: "حصلت مشكلة. للنصيحة الصحية اتصل بـ Health811 (811). في الطوارئ اتصل بـ911.",
    footer: "مشروع بورتفوليو. المحتوى ملخّص من مصادر رسمية، وارجع دايمًا للرابط الأصلي.",
    toggle: "English",
  },
} as const;

/** "rtl" when the text is mostly Arabic, so mixed Arabic/English lines keep the right word order. */
function textDir(text: string): "rtl" | "ltr" {
  const arabic = (text.match(/[\u0600-\u06FF]/g) ?? []).length;
  const latin = (text.match(/[A-Za-z]/g) ?? []).length;
  return arabic > latin ? "rtl" : "ltr";
}

// Phone numbers like 1-800-268-1154 or 416-314-5518.
const PHONE = /(?:\+?1[-.\s])?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/;

/** Renders one line: "[1]" citations become source links, and phone numbers become
 *  tap-to-call links that always read left-to-right, even inside Arabic text. */
function Line({ text, sources }: { text: string; sources: { n: number; url: string }[] }) {
  const parts = text.split(new RegExp(`(\\[\\d+\\]|${PHONE.source})`, "g")).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\[(\d+)\]$/);
        const src = m ? sources.find((s) => s.n === Number(m[1])) : undefined;
        if (src)
          return (
            <a key={i} href={src.url} target="_blank" rel="noopener noreferrer" className="cite">
              {part}
            </a>
          );
        if (new RegExp(`^${PHONE.source}$`).test(part))
          return (
            <a key={i} href={`tel:${part.replace(/[^\d+]/g, "")}`} dir="ltr" className="phone">
              {part}
            </a>
          );
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/** Each line gets its own direction, so an Arabic line that starts with "1." or an English
 *  word still flows right-to-left, and English lines stay left-to-right. */
function AnswerText({ text, sources }: { text: string; sources: { n: number; url: string }[] }) {
  return (
    <div className="answer-text">
      {text.split("\n").map((line, i) =>
        line.trim() === "" ? (
          <div key={i} className="answer-gap" />
        ) : (
          <p key={i} dir={textDir(line)} className="answer-line">
            <Line text={line} sources={sources} />
          </p>
        ),
      )}
    </div>
  );
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskResponse | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const t = T[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => {
    if (result) resultRef.current?.focus();
  }, [result]);

  async function ask(q: string) {
    const trimmed = q.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      setResult((await res.json()) as AskResponse);
    } catch {
      setResult({ type: "error", message: t.network });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <a href="tel:911" className="emergency-bar">
        {t.emergency}
      </a>

      <main className="container">
        <header className="header">
          <div>
            <h1 className="logo">
              Care<span>Map</span>
            </h1>
            <p className="tagline">{t.tagline}</p>
          </div>
          <button className="lang-toggle" onClick={() => setLang(lang === "en" ? "ar" : "en")}>
            {t.toggle}
          </button>
        </header>

        <p className="disclaimer">{t.disclaimer}</p>

        <form
          className="ask-form"
          onSubmit={(e) => {
            e.preventDefault();
            ask(question);
          }}
        >
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value.slice(0, MAX_CHARS))}
            placeholder={t.placeholder}
            rows={3}
            dir="auto"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask(question);
              }
            }}
            aria-label={t.placeholder}
          />
          <div className="form-row">
            <span className="counter">
              {question.length}/{MAX_CHARS}
            </span>
            <button type="submit" disabled={loading || !question.trim()}>
              {loading ? t.asking : t.ask}
            </button>
          </div>
        </form>

        {!result && !loading && (
          <section className="examples">
            <h2>{t.examplesTitle}</h2>
            <div className="chips">
              {t.examples.map((ex) => (
                <button
                  key={ex}
                  className="chip"
                  onClick={() => {
                    setQuestion(ex);
                    ask(ex);
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </section>
        )}

        <div ref={resultRef} tabIndex={-1} aria-live="polite" className="result-wrap">
          {result?.type === "emergency" && (
            <div className="card card-emergency" dir={textDir(result.message)}>
              <p className="big">{result.message}</p>
              <a href="tel:911" className="call-btn danger">
                {t.call911}
              </a>
            </div>
          )}

          {result?.type === "crisis" && (
            <div className="card card-crisis" dir={textDir(result.message)}>
              <p className="big">{result.message}</p>
              <div className="btn-row">
                <a href="tel:988" className="call-btn">
                  {t.call988}
                </a>
                <a href="tel:911" className="call-btn danger">
                  {t.call911}
                </a>
              </div>
            </div>
          )}

          {result?.type === "answer" && (
            <div className="card" dir={textDir(result.answer)}>
              {result.note && (
                <div className="note">
                  <p>{result.note.message}</p>
                  <a href="tel:811" className="call-btn small">
                    {t.call811}
                  </a>
                </div>
              )}
              <AnswerText text={result.answer} sources={result.sources} />
              {result.sources.length > 0 && (
                <div className="sources">
                  <h3>{t.sources}</h3>
                  <ol>
                    {result.sources.map((s) => (
                      <li key={s.n}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer">
                          {s.title}
                        </a>
                        <span className="publisher"> — {s.publisher}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          {result?.type === "error" && <div className="card card-error" dir={textDir(result.message)}>
              {result.message}
            </div>}
        </div>

        <footer className="footer">{t.footer}</footer>
      </main>
    </>
  );
}