"use client";
import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import snapshot from "@/data/contributions.json";
import { useSettings } from "@/context/SettingsContext";
interface Day {
  date: string;
  count: number;
  level: number;
}
const data = snapshot as {
  profile: string;
  updatedAt: string | null;
  days: Day[];
};
export default function ContributionsSection() {
  const { copy: c, language } = useSettings();
  const [active, setActive] = useState<Day | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const locale = language === "pt" ? "pt-BR" : "en-US";
  const format = (date: string) =>
    new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${date}T00:00:00Z`));
  const label = (day: Day) =>
    `${format(day.date)}: ${day.count.toLocaleString(locale)} ${day.count === 1 ? c.contribution : c.totalContributions}`;
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const steps: Record<string, number> = {
      ArrowLeft: -7,
      ArrowRight: 7,
      ArrowUp: -1,
      ArrowDown: 1,
    };
    if (!(event.key in steps) && event.key !== "Home" && event.key !== "End")
      return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? data.days.length - 1
          : Math.max(
              0,
              Math.min(index + steps[event.key], data.days.length - 1),
            );
    setFocusIndex(next);
    buttons.current[next]?.focus();
  }
  const offset = data.days.length
    ? new Date(`${data.days[0].date}T00:00:00Z`).getUTCDay()
    : 0;
  return (
    <section id="contributions" className="section container">
      <div className="section-heading">
        <div>
          <h2>
            {c.contributions}
            <span className="heading-dot">.</span>
          </h2>
          <p>{c.activityIntro}</p>
        </div>
      </div>
      <div className="contribution-panel">
        {data.days.length ? (
          <>
            <div className="contribution-stats">
              <div>
                <strong>
                  {data.days
                    .reduce((sum, day) => sum + day.count, 0)
                    .toLocaleString(locale)}
                </strong>
                <span>{c.totalContributions}</span>
              </div>
              <div>
                <strong>
                  {data.days.filter((day) => day.count > 0).length}
                </strong>
                <span>{c.activeDays}</span>
              </div>
              <span className="period-label">{c.lastYear}</span>
            </div>
            <p id="calendar-help" className="sr-only">
              {language === "pt"
                ? "Use as setas para navegar entre os dias."
                : "Use arrow keys to move between days."}
            </p>
            <div className="calendar-scroll">
              <div
                className="calendar"
                role="group"
                aria-label={c.lastYear}
                aria-describedby="calendar-help"
              >
                {Array.from({ length: offset }, (_, i) => (
                  <span aria-hidden="true" key={`empty-${i}`} />
                ))}
                {data.days.map((day, index) => (
                  <button
                    key={day.date}
                    ref={(element) => {
                      buttons.current[index] = element;
                    }}
                    className="calendar-day"
                    data-level={day.level}
                    title={label(day)}
                    aria-label={label(day)}
                    tabIndex={focusIndex === index ? 0 : -1}
                    onKeyDown={(event) => navigate(event, index)}
                    onFocus={() => {
                      setFocusIndex(index);
                      setActive(day);
                    }}
                    onMouseEnter={() => setActive(day)}
                    onClick={() => {
                      setFocusIndex(index);
                      setActive(day);
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="calendar-footer">
              <span aria-live="polite">
                {active
                  ? label(active)
                  : `${format(data.days[0].date)} / ${format(data.days.at(-1)!.date)}`}
              </span>
              <div className="calendar-legend" aria-hidden="true">
                <span>{c.less}</span>
                {[0, 1, 2, 3, 4].map((level) => (
                  <i key={level} className="calendar-day" data-level={level} />
                ))}
                <span>{c.more}</span>
              </div>
            </div>
          </>
        ) : (
          <p>{c.activityUnavailable}</p>
        )}
      </div>
      <div className="contribution-bottom">
        <a
          href="https://github.com/AndreiRech"
          target="_blank"
          rel="noopener noreferrer"
          className="text-link"
        >
          {c.githubActivity}
          <ArrowUpRight size={16} />
        </a>
        {data.updatedAt ? (
          <small>
            {c.updated}:{" "}
            {new Intl.DateTimeFormat(locale, {
              dateStyle: "medium",
              timeZone: "UTC",
            }).format(new Date(data.updatedAt))}
          </small>
        ) : null}
      </div>
    </section>
  );
}
