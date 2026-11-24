import { test } from "node:test";
import assert from "node:assert/strict";
import { handleAsk } from "../src/lib/handleAsk.ts";
import { MemoryStore, checkLimits } from "../src/lib/rateLimit.ts";
import { config } from "../src/lib/config.ts";

const fakeModel = async () => "Apply in person at ServiceOntario [1].";
let modelCalls = 0;
const countingModel = async () => {
  modelCalls++;
  return "ok [1]";
};

test("emergency skips the model and the rate limit", async () => {
  const r = await handleAsk("my mom has chest pain", "1.1.1.1", { model: countingModel, store: null });
  assert.equal(r.body.type, "emergency");
  assert.equal(modelCalls, 0);
});

test("crisis reply in Arabic", async () => {
  const r = await handleAsk("عايز أموت", "1.1.1.1", { store: null });
  assert.equal(r.body.type, "crisis");
  assert.ok(r.body.type === "crisis" && r.body.message.includes("988"));
});

test("normal answer has numbered sources", async () => {
  const r = await handleAsk("How do I apply for OHIP?", "2.2.2.2", { model: fakeModel, store: new MemoryStore() });
  assert.equal(r.status, 200);
  assert.ok(r.body.type === "answer" && r.body.sources[0].n === 1);
});

test("symptom question gets the 811 note", async () => {
  const r = await handleAsk("My child has a fever, should I go to a walk-in clinic?", "3.3.3.3", {
    model: fakeModel,
    store: new MemoryStore(),
  });
  assert.ok(r.body.type === "answer" && r.body.note?.message.includes("811"));
});

test("no matching source: fixed reply, no model call", async () => {
  const before = modelCalls;
  const r = await handleAsk("best pizza in Toronto", "4.4.4.4", { model: countingModel, store: new MemoryStore() });
  assert.equal(r.body.type, "answer");
  assert.equal(modelCalls, before);
});

test("too long / empty / health card are rejected", async () => {
  assert.equal((await handleAsk("x".repeat(config.maxQuestionChars + 1), "5.5.5.5")).status, 400);
  assert.equal((await handleAsk("   ", "5.5.5.5")).status, 400);
  assert.equal((await handleAsk("my OHIP is 1234 567 890, am I covered?", "5.5.5.5")).status, 400);
  assert.equal((await handleAsk(42, "5.5.5.5")).status, 400);
});

test("production without a store fails closed (503), never calls the model", async () => {
  const before = modelCalls;
  const r = await handleAsk("How do I apply for OHIP?", "6.6.6.6", { model: countingModel, store: null });
  assert.equal(r.status, 503);
  assert.equal(modelCalls, before);
});

test("per-IP daily limit returns 429", async () => {
  const store = new MemoryStore();
  for (let i = 0; i < config.perIpDaily; i++) assert.ok((await checkLimits("7.7.7.7", store)).ok);
  const r = await handleAsk("How do I apply for OHIP?", "7.7.7.7", { model: fakeModel, store });
  assert.equal(r.status, 429);
});

test("global daily cap stops everyone", async () => {
  const store = new MemoryStore();
  for (let i = 0; i < config.globalDaily; i++) await checkLimits(`10.0.${Math.floor(i / 250)}.${i % 250}`, store);
  const r = await handleAsk("How do I apply for OHIP?", "8.8.8.8", { model: fakeModel, store });
  assert.equal(r.status, 503);
});

test("model failure still returns the official sources", async () => {
  const r = await handleAsk("How do I apply for OHIP?", "9.9.9.9", {
    model: async () => { throw new Error("down"); },
    store: new MemoryStore(),
  });
  assert.equal(r.status, 200);
  assert.ok(r.body.type === "answer" && r.body.answer.includes("811") && r.body.sources.length > 0);
});

test("emergency wins even with a health card number in the text", async () => {
  const r = await handleAsk("chest pain right now, card 1234 567 890", "1.2.3.4", { store: null });
  assert.equal(r.body.type, "emergency");
});
