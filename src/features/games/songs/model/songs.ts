/** Clip lengths unlocked by each attempt, in seconds (Heardle/Songless style). */
export const CLIP_SECONDS = [0.1, 0.5, 1, 2, 4, 7, 11, 16] as const;
export const MAX_ATTEMPTS = CLIP_SECONDS.length;

export type Song = {
  id: string;
  title: string;
  artist: string;
  preview: string;
  artwork: string;
  link: string;
  /** Release year ("2015") or period ("2000–2004"), for the songs-by-year list. */
  year?: string;
};
/** Anything the visitor can name: a playable song or a guess bank entry. */
export type SongName = Pick<Song, "title" | "artist">;
export type SongAttempt =
  | { kind: "skip" }
  | { kind: "wrong"; guess: SongName }
  | { kind: "right"; guess: SongName };
export type SongRound = {
  songId: string;
  attempts: SongAttempt[];
  status: "playing" | "won" | "lost";
};

export const newRound = (songId: string): SongRound => ({
  songId,
  attempts: [],
  status: "playing",
});

/** Seconds the visitor may currently hear; the whole clip once the round ends. */
export function clipLength(round: SongRound): number {
  if (round.status !== "playing") return CLIP_SECONDS[MAX_ATTEMPTS - 1];
  return CLIP_SECONDS[Math.min(round.attempts.length, MAX_ATTEMPTS - 1)];
}

function record(round: SongRound, attempt: SongAttempt): SongRound {
  const attempts = [...round.attempts, attempt];
  const status =
    attempt.kind === "right"
      ? "won"
      : attempts.length >= MAX_ATTEMPTS
        ? "lost"
        : "playing";
  return { ...round, attempts, status };
}

/**
 * A guess names any song from the guess bank and wins when it is the same
 * song as the answer; repeating a wrong guess costs nothing.
 */
export function guessSong(
  round: SongRound,
  guess: SongName,
  answer: SongName,
): SongRound {
  if (round.status !== "playing") return round;
  if (
    round.attempts.some(
      (attempt) => attempt.kind === "wrong" && sameSong(attempt.guess, guess),
    )
  )
    return round;
  const kind = sameSong(guess, answer) ? "right" : "wrong";
  return record(round, {
    kind,
    guess: { title: guess.title, artist: guess.artist },
  });
}

export const skipSong = (round: SongRound): SongRound =>
  round.status === "playing" ? record(round, { kind: "skip" }) : round;

/** 6 points on the first clip down to 1 on the last; nothing for a miss. */
export const songPoints = (round: SongRound): number =>
  round.status === "won" ? MAX_ATTEMPTS + 1 - round.attempts.length : 0;

/** Picks an unplayed song, starting over once the whole catalogue was heard. */
export function pickSong(
  catalogue: readonly Pick<Song, "id">[],
  played: readonly string[],
  random: () => number = Math.random,
): string {
  const fresh = catalogue.filter((song) => !played.includes(song.id));
  const pool = fresh.length ? fresh : catalogue;
  return pool[Math.floor(random() * pool.length) % pool.length].id;
}

export const normalizeText = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Title without version tags: "Believer (Live)" and "Habits - Remastered" count as the plain song. */
const titleKey = (title: string) =>
  normalizeText(
    title.replace(/\(.*?\)|\[.*?\]|\s+feat\..*$|\s+[-–]\s.*$/gi, ""),
  );

/** First credited artist, so duos and features match however they are joined. */
const leadArtist = (artist: string) =>
  normalizeText(
    artist.split(/,|&|\s+(?:x|e|and|feat\.?|ft\.?|with)\s+/i)[0] ?? artist,
  );

const songKey = (song: SongName) =>
  `${titleKey(song.title)}|${leadArtist(song.artist)}`;

/** Same song when the title and the lead artist agree, whatever the version. */
export const sameSong = (a: SongName, b: SongName) => songKey(a) === songKey(b);

/** Joins song lists, keeping the first copy of each song in list order. */
export function mergeSongNames<T extends SongName>(
  ...lists: readonly (readonly T[])[]
): T[] {
  const seen = new Set<string>();
  const merged: T[] = [];
  for (const list of lists)
    for (const song of list) {
      const key = songKey(song);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(song);
    }
  return merged;
}

export type SongIndex<T extends SongName> = readonly {
  song: T;
  title: string;
  words: string;
}[];

/** Normalises the bank once so each keystroke only compares strings. */
export const indexSongs = <T extends SongName>(
  songs: readonly T[],
): SongIndex<T> =>
  songs.map((song) => ({
    song,
    title: normalizeText(song.title),
    words: ` ${normalizeText(`${song.title} ${song.artist}`)}`,
  }));

/**
 * Autocomplete over the guess bank: every query word must appear in the
 * title or artist. Titles starting with the query come first, then titles or
 * artists with a word starting with each query word, then any substring;
 * ties keep bank order, which is by popularity.
 */
export function searchSongs<T extends SongName>(
  index: SongIndex<T>,
  query: string,
  limit = 8,
): T[] {
  const phrase = normalizeText(query);
  const words = phrase.split(" ").filter(Boolean);
  if (!words.length) return [];
  const ranks: T[][] = [[], [], []];
  for (const entry of index) {
    if (!words.every((word) => entry.words.includes(word))) continue;
    const rank = entry.title.startsWith(phrase)
      ? 0
      : words.every((word) => entry.words.includes(` ${word}`))
        ? 1
        : 2;
    ranks[rank].push(entry.song);
    if (ranks[0].length >= limit) break;
  }
  return ranks.flat().slice(0, limit);
}

/**
 * Songs the daily round may pick: every list but the volatile charts and the
 * personal playlist, deduplicated and sorted by id so the day's song does not
 * depend on how the lists are ordered.
 */
export function dailySongPool<T extends Pick<Song, "id">>(
  lists: readonly (readonly T[])[],
): T[] {
  const byId = new Map<string, T>();
  for (const list of lists)
    for (const song of list) if (!byId.has(song.id)) byId.set(song.id, song);
  return [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
}

const isText = (value: unknown, max = 300): value is string =>
  typeof value === "string" && value.length > 0 && value.length <= max;

/**
 * ASVS 2.2: a saved daily round is untrusted. It must be for today's song,
 * hold well-formed attempts, and its status is recomputed by replaying them.
 */
export function parseSongRound(
  value: unknown,
  songId: string,
): SongRound | null {
  if (!value || typeof value !== "object") return null;
  const saved = value as { songId?: unknown; attempts?: unknown };
  if (saved.songId !== songId || !Array.isArray(saved.attempts)) return null;
  if (saved.attempts.length > MAX_ATTEMPTS) return null;
  let round = newRound(songId);
  for (const attempt of saved.attempts as unknown[]) {
    if (round.status !== "playing" || !attempt || typeof attempt !== "object")
      return null;
    const { kind, guess } = attempt as { kind?: unknown; guess?: unknown };
    if (kind === "skip") {
      round = record(round, { kind: "skip" });
      continue;
    }
    const name = guess as { title?: unknown; artist?: unknown } | undefined;
    if (
      (kind !== "wrong" && kind !== "right") ||
      !name ||
      !isText(name.title) ||
      !isText(name.artist)
    )
      return null;
    round = record(round, {
      kind,
      guess: { title: name.title, artist: name.artist },
    });
  }
  return round;
}

/** Spoiler-free result: skips, misses, the hit and the unused attempts. */
export const songShare = (round: SongRound): string =>
  Array.from({ length: MAX_ATTEMPTS }, (_, index) => {
    const kind = round.attempts[index]?.kind;
    return kind === "right"
      ? "🟩"
      : kind === "wrong"
        ? "🟥"
        : kind === "skip"
          ? "⬛"
          : "⬜";
  }).join("");
