import { test } from "node:test";
import assert from "node:assert/strict";
import { checkSafety } from "../src/lib/safety.ts";

const emergency = [
  "My dad has chest pain and his arm feels numb",
  "she passed out in the kitchen",
  "I can't breathe properly",
  "the pain medication isn't working and the pain is getting worse",
  "he seems confused and is not making sense",
  "عندي ألم في الصدر من ساعة",
  "ماما مش قادرة تتنفس",
  "أُغمي عليه فجأة",
  "ابني بيتخنق",
  "صدري مكتوم",
];

const crisis = ["I want to die", "عايزة أموت نفسي"];

const ok = [
  "How do I apply for OHIP?",
  "What is a walk-in clinic?",
  "مش عارفة أطلع كارت OHIP إزاي",
  "Can a pharmacist prescribe for pink eye?",
  "إيه الفرق بين الـ walk-in والـ urgent care؟",
];

for (const q of emergency)
  test(`emergency: ${q}`, () => assert.equal(checkSafety(q).kind, "emergency"));
for (const q of crisis)
  test(`crisis: ${q}`, () => assert.equal(checkSafety(q).kind, "crisis"));
for (const q of ok)
  test(`ok: ${q}`, () => assert.equal(checkSafety(q).kind, "ok"));

import { mentionsSymptoms, containsPersonalNumber } from "../src/lib/safety.ts";

test("symptoms: English", () => assert.ok(mentionsSymptoms("my son has a fever and a rash")));
test("symptoms: Arabic", () => assert.ok(mentionsSymptoms("بنتي عندها سخونية وكحة")));
test("symptoms: Arabic short stem with prefix", () => assert.ok(mentionsSymptoms("عندي ألم بسيط في ركبتي")));
test("no symptoms: 'المستشفى' is not 'ألم'", () => assert.ok(!mentionsSymptoms("فين أقرب المستشفى؟")));
test("no symptoms: OHIP question", () => assert.ok(!mentionsSymptoms("How do I apply for OHIP?")));
test("health card number is caught", () => assert.ok(containsPersonalNumber("my card is 1234-567-890")));
test("normal numbers are fine", () => assert.ok(!containsPersonalNumber("I've been here 3 months")));
