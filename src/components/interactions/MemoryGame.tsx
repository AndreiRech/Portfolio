"use client";
import {
  useEffect,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Play, RotateCcw, ArrowRight } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { playCopy } from "@/locales/play";
import { memoryReducer, initialMemory, type MemoryPad } from "@/lib/memory";

const pads = [0, 1, 2, 3] as const;
const colors = ["#ef8b82", "#9baaff", "#eac67d", "#a2cc98"];
const randomPad = () => Math.floor(Math.random() * 4) as MemoryPad;

export default function MemoryGame() {
  const { language } = useSettings();
  const c = playCopy[language];
  const [game, dispatch] = useReducer(memoryReducer, initialMemory);
  const [lit, setLit] = useState<MemoryPad | null>(null);
  const [beat, setBeat] = useState(0);
  const feedback = useRef<ReturnType<typeof setTimeout> | null>(null);
  const padButtons = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (game.phase !== "watch") return;
    let timer: ReturnType<typeof setTimeout>;
    let index = 0;
    function play() {
      if (index === game.sequence.length) {
        setLit(null);
        dispatch({ type: "ready" });
        return;
      }
      setBeat(index + 1);
      setLit(game.sequence[index]);
      timer = setTimeout(() => {
        setLit(null);
        index += 1;
        timer = setTimeout(play, 300);
      }, 480);
    }
    timer = setTimeout(play, 550);
    return () => {
      clearTimeout(timer);
    };
  }, [game.phase, game.sequence]);

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
    dispatch({ type: "press", pad });
  }
  function start() {
    if (feedback.current) clearTimeout(feedback.current);
    setLit(null);
    setBeat(0);
    dispatch({
      type: game.phase === "success" ? "next" : "start",
      pad: randomPad(),
    });
  }
  return (
    <article
      className="memory-lab"
      aria-labelledby="memory-title"
      onKeyDown={(event) => {
        if (
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.repeat ||
          !/^[1-4]$/.test(event.key)
        )
          return;
        event.preventDefault();
        const pad = (Number(event.key) - 1) as MemoryPad;
        padButtons.current[pad]?.focus();
        press(pad);
      }}
    >
      <div className="play-panel-heading">
        <span className="pixel-label">PIXEL MEMORY</span>
        <span className="memory-best">
          {c.best} <strong>{String(game.best).padStart(2, "0")}</strong>
        </span>
      </div>
      <h3 id="memory-title">{c.memory}</h3>
      <p className="memory-intro">{c.memoryIntro}</p>
      <div className="memory-board" data-phase={game.phase}>
        {pads.map((pad) => (
          <button
            key={pad}
            ref={(element) => {
              padButtons.current[pad] = element;
            }}
            className="memory-pad"
            style={{ "--pad-color": colors[pad] } as CSSProperties}
            data-lit={lit === pad}
            aria-disabled={game.phase !== "input"}
            onClick={() => press(pad)}
          >
            <span>{pad + 1}</span>
            <small>{c.colors[pad]}</small>
          </button>
        ))}
        <div className="memory-center" aria-hidden="true">
          <small>{c.round}</small>
          <strong>{String(game.sequence.length).padStart(2, "0")}</strong>
        </div>
      </div>
      <div className="memory-readout">
        <p role="status" aria-live="polite">
          {c[game.phase]}
          {game.phase === "watch" && lit !== null
            ? ` ${beat}: ${c.colors[lit]}.`
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
          disabled={game.phase === "watch"}
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
        <button
          className="memory-replay"
          disabled={game.phase !== "input"}
          onClick={() => dispatch({ type: "replay" })}
        >
          <RotateCcw size={15} />
          {c.replay}
        </button>
      </div>
      <p className="memory-keyboard">{c.keyboard}</p>
    </article>
  );
}
