const DATE = /^\d{4}-\d{2}-\d{2}$/;
export const PROFILE = "AndreiRech";
export function dateRange(now = new Date()) {
  const end = now.toISOString().slice(0, 10);
  const start = new Date(`${end}T00:00:00Z`);
  const month = start.getUTCMonth();
  start.setUTCFullYear(start.getUTCFullYear() - 1);
  if (start.getUTCMonth() !== month) start.setUTCDate(0);
  start.setUTCDate(start.getUTCDate() + 1);
  return { from: start.toISOString().slice(0, 10), to: end };
}
function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
}
export function validSnapshot(value) {
  if (
    !value ||
    value.profile !== PROFILE ||
    typeof value.updatedAt !== "string" ||
    !Number.isFinite(Date.parse(value.updatedAt)) ||
    !Array.isArray(value.days) ||
    value.days.length < 350 ||
    value.days.length > 367
  )
    return false;
  let previous = null;
  for (const day of value.days) {
    if (
      !day ||
      typeof day !== "object" ||
      !DATE.test(day.date) ||
      !Number.isInteger(day.count) ||
      day.count < 0 ||
      day.count > 1_000_000 ||
      !Number.isInteger(day.level) ||
      day.level < 0 ||
      day.level > 4
    )
      return false;
    const date = new Date(`${day.date}T00:00:00Z`);
    if (
      !Number.isFinite(date.getTime()) ||
      date.toISOString().slice(0, 10) !== day.date ||
      (previous !== null && date.getTime() - previous !== 86_400_000)
    )
      return false;
    previous = date.getTime();
  }
  return true;
}
export function parseCalendar(html, now = new Date()) {
  if (html.length > 2_000_000)
    throw new Error("Calendar response is too large.");
  const counts = new Map();
  for (const match of html.matchAll(
    /<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g,
  )) {
    const id = attribute(match[1], "for");
    const text = match[2].replace(/<[^>]+>/g, "").trim();
    const count = text.match(/^(No|[\d,]+) contributions? on /);
    if (id && count)
      counts.set(
        id,
        count[1] === "No" ? 0 : Number(count[1].replaceAll(",", "")),
      );
  }
  const { from, to } = dateRange(now);
  const dates = new Map();
  for (const match of html.matchAll(/<td\b[^>]*\bdata-date="[^>]*>/g)) {
    const tag = match[0];
    const date = attribute(tag, "data-date");
    if (!date || date < from || date > to) continue;
    if (dates.has(date)) throw new Error("Duplicate calendar date.");
    dates.set(date, {
      date,
      count: counts.get(attribute(tag, "id")),
      level: Number(attribute(tag, "data-level")),
    });
  }
  const snapshot = {
    profile: PROFILE,
    updatedAt: now.toISOString(),
    days: [...dates.values()].sort((a, b) => a.date.localeCompare(b.date)),
  };
  if (
    !validSnapshot(snapshot) ||
    snapshot.days[0].date !== from ||
    snapshot.days.at(-1).date !== to
  )
    throw new Error("Calendar is incomplete or invalid.");
  return snapshot;
}
