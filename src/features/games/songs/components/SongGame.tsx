"use client";
import { sfx } from "@/shared/lib/sfx";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { ArrowRight, Pause, Play, SkipForward, X, Check } from "lucide-react";
import GameHelp from "../../components/GameHelp";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { useUnlock } from "@/features/achievements/hooks/AchievementContext";
import { playCopy } from "@/shared/i18n/play";
import personal from "@/features/games/songs/data/personal.json";
import global from "@/features/games/songs/data/global.json";
import brazil from "@/features/games/songs/data/brazil.json";
import classics from "@/features/games/songs/data/classics.json";
import {
  CLIP_SECONDS,
  MAX_ATTEMPTS,
  clipLength,
  guessSong,
  newRound,
  pickSong,
  searchSongs,
  skipSong,
  songPoints,
  type Song,
  type SongRound,
} from "@/features/games/songs/model/songs";

/** Personal playlist first; charts refresh with `npm run refresh:songs`. */
const SONG_CATEGORIES = {
  personal: personal as Song[],
  global: global as Song[],
  brazil: brazil as Song[],
  classics: classics as Song[],
};
type SongCategory = keyof typeof SONG_CATEGORIES;
const CATEGORY_IDS = Object.keys(SONG_CATEGORIES) as SongCategory[];
const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

/** Reuses the song's audio element and rewinds it to the start of the clip. */
function prepareClip(
  current: HTMLAudioElement | null,
  song: Song,
  onError: () => void,
  onPlaying: () => void,
) {
  let element = current;
  if (!element || element.dataset.song !== song.id) {
    element?.pause();
    element = new Audio(song.preview);
    element.preload = "auto";
    element.dataset.song = song.id;
    element.onerror = onError;
  }
  element.onplaying = onPlaying;
  element.currentTime = 0;
  return element;
}

/** Category picker; the session score carries across categories. */
export default function SongGame() {
  const { language } = useSettings();
  const c = playCopy[language];
  const [category, setCategory] = useState<SongCategory>("personal");
  const [score, setScore] = useState(0);
  return (
    <SongRun
      key={category}
      category={category}
      score={score}
      addScore={(points) => setScore((current) => current + points)}
    >
      <div
        className="level-picker song-categories"
        role="group"
        aria-label={c.songsCategory}
      >
        {CATEGORY_IDS.map((id) => (
          <button
            key={id}
            aria-pressed={category === id}
            onClick={() => setCategory(id)}
          >
            {c.songCategories[id].tab}
          </button>
        ))}
      </div>
    </SongRun>
  );
}

function SongRun({
  category,
  score,
  addScore,
  children,
}: {
  category: SongCategory;
  score: number;
  addScore: (points: number) => void;
  children: React.ReactNode;
}) {
  const { language } = useSettings();
  const c = playCopy[language];
  const copy = c.songCategories[category];
  const SONGS = SONG_CATEGORIES[category];
  const unlock = useUnlock();
  const [played, setPlayed] = useState<string[]>([]);
  const [round, setRound] = useState<SongRound | null>(null);
  const [query, setQuery] = useState("");
  const [audio, setAudio] = useState<"idle" | "loading" | "playing" | "error">(
    "idle",
  );
  const [progress, setProgress] = useState(0);
  const player = useRef<HTMLAudioElement | null>(null);
  const frame = useRef(0);
  const listId = useId();
  const decimals = new Intl.NumberFormat(
    language === "pt" ? "pt-BR" : "en-US",
    {
      maximumFractionDigits: 1,
    },
  );
  /** Clip lengths read naturally: 0.1, 0.5, 1, 2… (0,1 in Portuguese). */
  const seconds = (value: number) =>
    decimals.format(Math.round(value * 10) / 10);

  // Picking at random must wait for the client to avoid a hydration mismatch.
  useEffect(() => {
    const first = pickSong(SONGS, []);
    queueMicrotask(() => {
      setRound(newRound(first));
      setPlayed([first]);
    });
  }, [SONGS]);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      player.current?.pause();
    },
    [],
  );

  const song = SONGS.find((item) => item.id === round?.songId);
  const limit = round ? clipLength(round) : CLIP_SECONDS[0];
  const total = CLIP_SECONDS[MAX_ATTEMPTS - 1];
  const PREVIEW_SECONDS = 30;
  const done = round ? round.status !== "playing" : false;
  const results = done ? [] : searchSongs(SONGS, query);

  function stop() {
    cancelAnimationFrame(frame.current);
    player.current?.pause();
    setAudio((current) => (current === "error" ? current : "idle"));
  }

  /** Plays from the start up to `until` seconds; the reveal plays the whole preview. */
  function startClip(until: number) {
    if (!song) return;
    cancelAnimationFrame(frame.current);
    const clip = prepareClip(
      player.current,
      song,
      () => {
        cancelAnimationFrame(frame.current);
        setAudio("error");
      },
      () => setAudio("playing"),
    );
    player.current = clip;
    setProgress(0);
    setAudio("loading");
    const tick = () => {
      setProgress(clip.currentTime);
      if (clip.currentTime >= until || clip.ended) {
        clip.pause();
        setAudio("idle");
        return;
      }
      frame.current = requestAnimationFrame(tick);
    };
    clip
      .play()
      .then(() => {
        frame.current = requestAnimationFrame(tick);
      })
      .catch((error: unknown) => {
        // A pause before playback starts is not a loading failure.
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setAudio("error");
      });
  }

  function play() {
    if (audio === "playing" || audio === "loading") return stop();
    startClip(done ? Infinity : limit);
  }

  function settle(next: SongRound) {
    setRound(next);
    setQuery("");
    const last = next.attempts.at(-1);
    if (next.status === "playing") {
      if (last?.kind === "wrong") sfx.wrong();
      else sfx.tick();
      return;
    }
    if (next.status === "won") {
      if (next.attempts.length === 1) sfx.reveal(3);
      else sfx.roundClear();
    } else sfx.wrong();
    // The answer keeps playing until the visitor moves on.
    if (audio !== "error") startClip(Infinity);
    const points = songPoints(next);
    addScore(points);
    if (points === MAX_ATTEMPTS) unlock("perfect-pitch");
  }

  function guess(id: string) {
    if (round) settle(guessSong(round, id, SONGS));
  }

  function nextSong() {
    stop();
    player.current = null;
    const id = pickSong(SONGS, played);
    setPlayed((current) =>
      current.length >= SONGS.length ? [id] : [...current, id],
    );
    setRound(newRound(id));
    setAudio("idle");
    setProgress(0);
    setQuery("");
  }

  if (!round || !song)
    return (
      <div className="game-loading" role="status">
        {c.loading}
      </div>
    );

  const nextClip =
    CLIP_SECONDS[Math.min(round.attempts.length + 1, MAX_ATTEMPTS - 1)];
  return (
    <article className="song-lab" aria-labelledby="songs-title">
      <div className="play-panel-heading">
        <span className="pixel-label">{copy.label}</span>
        <span className="memory-best">
          {c.songScore} <strong>{String(score).padStart(2, "0")}</strong>
          <small>
            {" "}
            · {played.length}/{SONGS.length}
          </small>
        </span>
      </div>
      <h2 id="songs-title">{c.songsTitle}</h2>
      <GameHelp>{copy.intro}</GameHelp>
      {children}

      <ol className="song-attempts" aria-label={c.attempts}>
        {Array.from({ length: MAX_ATTEMPTS }, (_, index) => {
          const attempt = round.attempts[index];
          const guessed =
            attempt && attempt.kind !== "skip"
              ? SONGS.find((item) => item.id === attempt.songId)
              : undefined;
          return (
            <li key={index} data-kind={attempt?.kind ?? "empty"}>
              {attempt?.kind === "right" ? (
                <Check size={16} aria-hidden="true" />
              ) : attempt?.kind === "wrong" ? (
                <X size={16} aria-hidden="true" />
              ) : attempt?.kind === "skip" ? (
                <SkipForward size={16} aria-hidden="true" />
              ) : (
                <span aria-hidden="true">{index + 1}</span>
              )}
              <span>
                {guessed
                  ? `${guessed.title} — ${guessed.artist}`
                  : attempt?.kind === "skip"
                    ? c.skipped
                    : " "}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="song-player">
        <div
          className="song-timeline"
          role="progressbar"
          aria-label={c.clipLabel}
          aria-valuemin={0}
          aria-valuemax={done ? PREVIEW_SECONDS : limit}
          aria-valuenow={Math.round(
            done ? progress : Math.min(progress, limit),
          )}
          style={
            {
              "--unlocked": done ? "100%" : `${(limit / total) * 100}%`,
              "--progress": done
                ? `${Math.min(progress / PREVIEW_SECONDS, 1) * 100}%`
                : `${(Math.min(progress, limit) / total) * 100}%`,
            } as CSSProperties
          }
        >
          {done
            ? null
            : CLIP_SECONDS.slice(0, -1).map((second) => (
                <i
                  key={second}
                  style={{ left: `${(second / total) * 100}%` }}
                />
              ))}
        </div>
        <div className="song-controls">
          <span>
            {done ? "0" : c.clipLabel + " " + seconds(limit)}
            {c.seconds}
          </span>
          <button
            className="song-play"
            onClick={play}
            aria-label={audio === "playing" ? c.stopClip : c.playClip}
            disabled={audio === "error"}
          >
            {audio === "playing" || audio === "loading" ? (
              <Pause size={22} aria-hidden="true" />
            ) : (
              <Play size={22} aria-hidden="true" />
            )}
          </button>
          <span>
            {done ? PREVIEW_SECONDS : total}
            {c.seconds}
          </span>
        </div>
        <p className="song-status" role="status" aria-live="polite">
          {audio === "loading"
            ? c.audioLoading
            : audio === "error"
              ? c.audioError
              : " "}
        </p>
      </div>

      {done ? (
        <div className="song-result" data-status={round.status}>
          <p role="status">
            {round.status === "won"
              ? fill(c.songWon, {
                  n: `${round.attempts.length}/${MAX_ATTEMPTS}`,
                  p: songPoints(round),
                })
              : c.songLost}
          </p>
          <div className="song-reveal">
            {song.artwork ? (
              <Image
                src={song.artwork}
                width={72}
                height={72}
                alt=""
                unoptimized
              />
            ) : null}
            <div>
              <strong>{song.title}</strong>
              <span>{song.artist}</span>
            </div>
          </div>
          <button className="button primary" onClick={nextSong}>
            {c.nextSong}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <form
          className="song-guess"
          onSubmit={(event) => {
            event.preventDefault();
            if (results[0]) guess(results[0].id);
          }}
        >
          <label htmlFor={`${listId}-input`} className="sr-only">
            {c.guessLabel}
          </label>
          <input
            id={`${listId}-input`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={c.guessPlaceholder}
            autoComplete="off"
            aria-describedby={`${listId}-hint`}
            aria-controls={listId}
          />
          <ul id={listId} className="song-results" aria-label={c.guessLabel}>
            {results.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => guess(item.id)}>
                  <strong>{item.title}</strong>
                  <span>{item.artist}</span>
                </button>
              </li>
            ))}
          </ul>
          <p id={`${listId}-hint`} className="song-hint" aria-live="polite">
            {query.trim() && !results.length ? c.noSongMatch : " "}
          </p>
          <div className="memory-actions">
            <button
              type="button"
              className="memory-replay"
              onClick={() => settle(skipSong(round))}
            >
              <SkipForward size={15} aria-hidden="true" />
              {round.attempts.length < MAX_ATTEMPTS - 1
                ? fill(c.skipMore, { s: seconds(nextClip - limit) })
                : c.skip}
            </button>
            {audio === "error" ? (
              <button
                type="button"
                className="memory-replay"
                onClick={nextSong}
              >
                {c.tryAnotherSong}
                <ArrowRight size={15} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </form>
      )}
    </article>
  );
}
