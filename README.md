# CareMap

**Find the right health service in Ontario: in English or Egyptian Arabic.**

CareMap helps people, especially newcomers, understand Ontario's health system: how to get OHIP, how to find a family doctor, and when to use a walk-in clinic, urgent care, a pharmacist, Health811 or the emergency department. Every answer cites an official source.

CareMap **does not diagnose**. It points people to the right *service*, and when someone describes symptoms it sends them to Health811's registered nurses (811), the official service for that.

> General information only. Not medical advice. In an emergency, call 911.

## Why

Emergency departments get crowded partly because people don't know their other options. Newcomers face extra barriers: a new system, a new language, and often no family doctor yet. CareMap explains the options in plain language, in English and Egyptian Arabic.

## How it works

```
question
   │
   ├─ 1. Validate: length limit, reject health card numbers
   ├─ 2. Safety check (deterministic, no AI)
   │      ├─ emergency signs → fixed "Call 911" reply
   │      └─ crisis language → fixed "Call or text 988 / 911" reply
   ├─ 3. Rate limit: per visitor per day + global daily cap
   ├─ 4. Retrieve from a hand-checked set of official sources
   │      └─ no match → fixed "call 811" reply, no AI call
   ├─ 5. Claude answers ONLY from those sources, with [n] citations
   └─ 6. Symptoms mentioned → add a Health811 note
```

### Safety design

- **The model never decides if something is an emergency.** Red flags are matched in code (English and Egyptian Arabic) against the signs listed on the [Government of Ontario's emergency rooms page](https://www.ontario.ca/page/emergency-rooms). It over-triggers on purpose.
- **Emergency and crisis replies are fixed text** and are returned even when the visitor has used up their daily limit.
- **No personal data:** questions are not logged, health card numbers are rejected, and visitor IPs are only stored as salted hashes for rate limiting.
- **Grounded answers only:** the prompt restricts the model to the provided sources and forbids diagnosis, severity judgments, medication advice and invented numbers.

### Cost protection

- Per-visitor daily limit (`PER_IP_DAILY_LIMIT`, default 10).
- Global daily cap on AI calls (`GLOBAL_DAILY_LIMIT`, default 200): a hard daily spend ceiling.
- Max question length and max output tokens.
- **Fails closed:** in production without the rate-limit database, no AI calls are made.
- Also set a monthly spend limit in the Anthropic Console as a last line of defence.

## Tech

Next.js (App Router) · TypeScript · Claude API (plain `fetch`, no SDK) · Upstash Redis (REST) for rate limiting · Node's built-in test runner.

## Run locally

Requires Node 22.6+.

```bash
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
npm test                     # safety, retrieval and pipeline tests
npm run dev                  # http://localhost:3000
```

In development, rate limits use in-memory counters, so Upstash is optional.

## Deploy (Vercel)

1. Push to GitHub and import the repo in Vercel.
2. Create a free Redis database at [upstash.com](https://upstash.com) and copy its REST URL and token.
3. In Vercel → Settings → Environment Variables, add `ANTHROPIC_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` and a long random `IP_HASH_SALT`.
4. Set a monthly spend limit in the Anthropic Console.
5. Deploy.

## Content and licensing

Source summaries are written in our own words and every answer links to the original page. See [SOURCES.md](SOURCES.md) for each source and its reuse terms. To add a source, add an entry to `src/content/sources.ts`, add it to `SOURCES.md`, and add a retrieval test.

## Background

CareMap grew out of a group project at Seneca Polytechnic, where I was the product owner. This repository is my independent implementation.
