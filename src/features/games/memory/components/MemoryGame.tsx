"use client";
import {
  useEffect,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Play, ArrowRight } from "lucide-react";
import GameHelp from "../../components/GameHelp";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { playCopy } from "@/shared/i18n/play";
import { useUnlock } from "@/features/achievements/hooks/AchievementContext";
import {
  MEMORY_LEVELS,
  memoryReducer,
  initialMemory,
  type MemoryLevel,
  type MemoryPad,
} from "@/features/games/memory/model/memory";
import { sfx } from "@/shared/lib/sfx";
import { pixelBurst } from "@/shared/lib/pixelBurst";
import SignGlyph, { SIGNS } from "./SignGlyph";

/** Pause after a cleared round before the next one starts on its own. */
const NEXT_ROUND_DELAY = 2000;

const LEVEL_IDS = Object.keys(MEMORY_LEVELS) as MemoryLevel[];

export default function MemoryGame() {
  const { language } = useSettings();
  const c = playCopy[language];
  const [game, dispatch] = useReducer(memoryReducer, initialMemory);
  const [level, setLevel] = useState<MemoryLevel>("normal");
  const [bests, setBests] = useState<Record<MemoryLevel, number>>({
    easy: 0,
    normal: 0,
    hard: 0,
  });
  const rules = MEMORY_LEVELS[level];
  const signs = SIGNS.slice(0, rules.pads);
  const best = Math.max(bests[level], game.best);
  const [lit, setLit] = useState<MemoryPad | null>(null);
  const [beat, setBeat] = useState(0);
  const [cast, setCast] = useState<{ pad: MemoryPad; count: number } | null>(
    null,
  );
  const feedback = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lab = useRef<HTMLElement>(null);
  const padButtons = useRef<(HTMLButtonElement | null)[]>([]);

  /** Each sign casts its own effect and sound, on playback and on press. */
  function castSign(pad: MemoryPad) {
    const sign = SIGNS[pad];
    sfx.sign(sign.id);
    setCast((current) => ({ pad, count: (current?.count ?? 0) + 1 }));
    const box = padButtons.current[pad]?.getBoundingClientRect();
    if (box)
      pixelBurst(box.left + box.width / 2, box.top + box.height / 2, {
        count: 14,
        distance: 90,
        colors: [sign.color, "var(--fg)"],
      });
  }

  useEffect(() => {
    if (game.phase !== "watch") return;
    let timer: ReturnType<typeof setTimeout>;
    let index = 0;
    function play() {
      if (index === game.sequence.length) {
        setLit(null);
        dispatch({ type: "ready" });
        // Disabling Start during playback can return focus to the document.
        if (
          document.activeElement === document.body ||
          lab.current?.contains(document.activeElement)
        ) {
          padButtons.current[0]?.focus({ preventScroll: true });
        }
        return;
      }
      setBeat(index + 1);
      setLit(game.sequence[index]);
      const pad = game.sequence[index];
      sfx.sign(SIGNS[pad].id);
      setCast((current) => ({ pad, count: (current?.count ?? 0) + 1 }));
      timer = setTimeout(() => {
        setLit(null);
        index += 1;
        timer = setTimeout(play, rules.gap);
      }, rules.lit);
    }
    timer = setTimeout(play, 550);
    return () => {
      clearTimeout(timer);
    };
  }, [game.phase, game.sequence, rules.gap, rules.lit]);

  const unlock = useUnlock();
  useEffect(() => {
    if (game.best >= 5) unlock("memory5");
  }, [game.best, unlock]);

  // A cleared round chimes, then the next one starts by itself.
  useEffect(() => {
    if (game.phase === "lost") sfx.wrong();
    if (game.phase !== "success") return;
    sfx.roundClear();
    const timer = setTimeout(() => {
      setBeat(0);
      dispatch({
        type: "next",
        pad: Math.floor(Math.random() * rules.pads) as MemoryPad,
      });
    }, NEXT_ROUND_DELAY);
    return () => clearTimeout(timer);
  }, [game.phase, rules.pads]);

  useEffect(
    () => () => {
      if (feedback.current) clearTimeout(feedback.current);
    },
    [],
  );

  function press(pad: MemoryPad) {
    if (game.phase !== "input") return;
    if (feedback.current) clearTimeout(feedback.current);
    setLit(pad);
    feedback.current = setTimeout(() => setLit(null), 220);
    const correct = pad === game.sequence[game.inputIndex];
    if (correct) castSign(pad);
    dispatch({ type: "press", pad });
  }
  function start() {
    if (feedback.current) clearTimeout(feedback.current);
    setLit(null);
    setBeat(0);
    dispatch({
      type: game.phase === "success" ? "next" : "start",
      pad: Math.floor(Math.random() * rules.pads) as MemoryPad,
    });
  }
  function changeLevel(next: MemoryLevel) {
    if (next === level) return;
    if (feedback.current) clearTimeout(feedback.current);
    // Each difficulty keeps its own session best.
    setBests((current) => ({ ...current, [level]: best }));
    setLit(null);
    setBeat(0);
    setLevel(next);
    dispatch({ type: "reset" });
  }
  return (
    <article
      ref={lab}
      className="memory-lab"
      aria-labelledby="memory-title"
      onKeyDown={(event) => {
        if (
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.repeat ||
          !/^[1-5]$/.test(event.key) ||
          Number(event.key) > rules.pads
        )
          return;
        event.preventDefault();
        const pad = (Number(event.key) - 1) as MemoryPad;
        padButtons.current[pad]?.focus();
        press(pad);
      }}
    >
      <div className="play-panel-heading">
        <span className="pixel-label">{c.memoryLabel}</span>
        <span className="memory-best">
          {c.best} <strong>{String(best).padStart(2, "0")}</strong>
        </span>
      </div>
      <h2 id="memory-title">{c.memory}</h2>
      <GameHelp>
        {language === "pt"
          ? "Repita a sequência de sinais na ordem em que aparecem. Cada rodada acrescenta um sinal. Use os botões ou as teclas de 1 a 5."
          : "Repeat the signs in the order shown. Each round adds a sign. Use the buttons or keys 1 to 5."}
      </GameHelp>
      <div className="level-picker" role="group" aria-label={c.level}>
        {LEVEL_IDS.map((id) => (
          <button
            key={id}
            aria-pressed={level === id}
            disabled={game.phase === "watch"}
            onClick={() => {
              sfx.pop();
              changeLevel(id);
            }}
          >
            {c.levels[id]}
          </button>
        ))}
      </div>
      <div
        className="memory-board"
        data-phase={game.phase}
        data-pads={rules.pads}
      >
        {signs.map((sign, index) => {
          const pad = index as MemoryPad;
          return (
            <button
              key={pad}
              ref={(element) => {
                padButtons.current[pad] = element;
              }}
              className="memory-pad"
              style={{ "--pad-color": sign.color } as CSSProperties}
              data-lit={lit === pad}
              aria-disabled={game.phase !== "input"}
              aria-label={`${sign.name}, ${pad + 1}`}
              onClick={() => press(pad)}
            >
              <span className="memory-key" aria-hidden="true">
                {pad + 1}
              </span>
              <SignGlyph id={sign.id} />
              {cast?.pad === pad ? (
                <span
                  key={cast.count}
                  className="sign-cast"
                  data-sign={sign.id}
                  aria-hidden="true"
                />
              ) : null}
              <small>{sign.name}</small>
            </button>
          );
        })}
        <div className="memory-center" aria-hidden="true">
          <small>{c.round}</small>
          <strong>{String(game.sequence.length).padStart(2, "0")}</strong>
        </div>
      </div>
      <div className="memory-readout">
        <p role="status" aria-live="polite">
          {game.phase === "idle" ? "\u00a0" : c[game.phase]}
          {game.phase === "watch" && lit !== null
            ? ` ${beat}: ${SIGNS[lit].name}.`
            : ""}
        </p>
        <span>
          {game.phase === "input"
            ? `${game.inputIndex} / ${game.sequence.length} ${c.progress}`
            : "\u00a0"}
        </span>
      </div>
      <div className="memory-actions">
        <button
          className="button primary"
          onClick={start}
          disabled={game.phase === "watch" || game.phase === "success"}
        >
          {game.phase === "success"
            ? c.next
            : game.phase === "idle"
              ? c.start
              : c.restart}
          {game.phase === "success" ? (
            <ArrowRight size={18} />
          ) : (
            <Play size={16} />
          )}
        </button>
      </div>
      <p className="memory-keyboard">
        {c.keyboard.replace("5", String(rules.pads))}
      </p>
    </article>
  );
}
