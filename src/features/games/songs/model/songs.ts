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
};
export type SongAttempt =
  | { kind: "skip" }
  | { kind: "wrong"; songId: string }
  | { kind: "right"; songId: string };
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

/** A guess must name a catalogue song; repeating a wrong guess costs nothing. */
export function guessSong(
  round: SongRound,
  songId: string,
  catalogue: readonly Pick<Song, "id">[],
): SongRound {
  if (round.status !== "playing") return round;
  if (!catalogue.some((song) => song.id === songId)) return round;
  if (
    round.attempts.some(
      (attempt) => attempt.kind === "wrong" && attempt.songId === songId,
    )
  )
    return round;
  return record(
    round,
    songId === round.songId
      ? { kind: "right", songId }
      : { kind: "wrong", songId },
  );
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
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Catalogue autocomplete: every query word must appear in the title or artist. */
export function searchSongs<T extends Pick<Song, "title" | "artist">>(
  catalogue: readonly T[],
  query: string,
  limit = 6,
): T[] {
  const words = normalizeText(query).split(" ").filter(Boolean);
  if (!words.length) return [];
  return catalogue
    .filter((song) => {
      const haystack = normalizeText(`${song.title} ${song.artist}`);
      return words.every((word) => haystack.includes(word));
    })
    .slice(0, limit);
}
