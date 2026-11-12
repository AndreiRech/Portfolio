import test from "node:test";
import assert from "node:assert/strict";
import { dateRange, parseCalendar, validSnapshot } from "./contributions.mjs";
const now = new Date("2026-11-11T12:00:00Z");
test("a rolling year ending on leap day retains March 1 of the previous year", () => {
  assert.deepEqual(dateRange(new Date("2024-02-29T12:00:00Z")), {
    from: "2023-03-01",
    to: "2024-02-29",
  });
});
function fixture() {
  const { from, to } = dateRange(now);
  const current = new Date(`${from}T00:00:00Z`);
  let html = "";
  while (current.toISOString().slice(0, 10) <= to) {
    const date = current.toISOString().slice(0, 10);
    html += `<td data-date="${date}" id="day-${date}" data-level="2"></td><tool-tip for="day-${date}">1,200 contributions on November 11th.</tool-tip>`;
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return html;
}
test("calendar parser pairs dates and counts, sorts by date and covers the rolling year", () => {
  const result = parseCalendar(fixture(), now);
  assert.equal(result.days.length, 365);
  assert.equal(result.days[0].date, "2025-11-12");
  assert.equal(result.days.at(-1)?.date, "2026-11-11");
  assert.equal(result.days[0].count, 1200);
  assert.equal(validSnapshot(result), true);
});
test("missing dates, missing counts and changed upstream markup cannot replace the real snapshot", () => {
  const html = fixture();
  assert.throws(() =>
    parseCalendar(html.replace(/<tool-tip[^>]*>[^<]*<\/tool-tip>/, ""), now),
  );
  assert.throws(() =>
    parseCalendar(
      html.replace('data-date="2025-11-12"', 'data-date="2025-11-13"'),
      now,
    ),
  );
  assert.throws(() => parseCalendar("<html>Unavailable</html>", now));
  assert.equal(
    validSnapshot({
      profile: "SomeoneElse",
      updatedAt: now.toISOString(),
      days: [],
    }),
    false,
  );
});
