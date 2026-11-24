import { test } from "node:test";
import assert from "node:assert/strict";
import { retrieve } from "../src/lib/retrieval.ts";

const top = (q: string) => retrieve(q)[0]?.source.id;

test("OHIP (en)", () => assert.equal(top("How do I apply for OHIP?"), "ohip-apply"));
test("OHIP (ar)", () => assert.equal(top("إزاي أطلع كارت OHIP؟"), "ohip-apply"));
test("family doctor (en)", () => assert.equal(top("I don't have a family doctor"), "family-doctor"));
test("family doctor (ar)", () => assert.equal(top("معنديش دكتور عائلة أعمل إيه"), "family-doctor"));
test("pharmacist", () => assert.equal(top("Can a pharmacist treat pink eye?"), "pharmacist"));
test("pharmacist (ar)", () => assert.equal(top("الصيدلي ينفع يعالج الرمد؟"), "pharmacist"));
test("walk-in vs urgent care returns both", () => {
  const ids = retrieve("What's the difference between a walk-in clinic and urgent care?").map((h) => h.source.id);
  assert.ok(ids.includes("walk-in") && ids.includes("urgent-care"), ids.join(","));
});
test("'error' does not match the short keyword 'er'", () => {
  const ids = retrieve("I got an error on the website").map((h) => h.source.id);
  assert.ok(!ids.includes("emergency"));
});
test("unrelated question returns nothing", () => assert.equal(retrieve("best pizza in Toronto").length, 0));

test("pregnant newcomer without OHIP gets CHC + midwives + OHIP", () => {
  const ids = retrieve("I am new to Toronto and I don't have OHIP yet, it will be issued after 3 months, and I am pregnant, where can I go?").map((h) => h.source.id);
  for (const id of ["community-health-centres", "no-ohip-pregnancy", "ohip-apply"]) assert.ok(ids.includes(id), ids.join(","));
});
test("same question in Arabic", () => {
  const ids = retrieve("أنا لسه جاية تورنتو ومعنديش OHIP وأنا حامل، أروح فين؟").map((h) => h.source.id);
  for (const id of ["community-health-centres", "no-ohip-pregnancy"]) assert.ok(ids.includes(id), ids.join(","));
});
test("nearest community health centre", () => {
  assert.equal(top("where is the nearest community health centre?"), "community-health-centres");
});
