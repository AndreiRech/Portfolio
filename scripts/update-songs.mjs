// Resolves the personal song selection (src/features/games/songs/data/songs.source.json, drawn from
// Andrei's Spotify playlist) into 30-second iTunes previews. Run manually with
// `npm run refresh:songs`; the committed snapshot keeps the static export
// independent of the iTunes API at build time.
import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const source = JSON.parse(
  await readFile(
    new URL("src/features/games/songs/data/songs.source.json", root),
    "utf8",
  ),
);
const target = new URL("src/features/games/songs/data/songs.json", root);

const normalize = (value) =>
  value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\(.*?\)|\[.*?\]|feat\..*$/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

async function resolve({ title, artist }) {
  const mainArtist = artist.split(",")[0].trim();
  const term = encodeURIComponent(`${mainArtist} ${title}`);
  const response = await fetch(
    `https://itunes.apple.com/search?term=${term}&entity=song&limit=10&country=US`,
    { signal: AbortSignal.timeout(15000) },
  );
  if (!response.ok) throw new Error(`iTunes ${response.status}`);
  const { results } = await response.json();
  const wanted = normalize(title);
  const artistKey = normalize(mainArtist);
  return results.find(
    (item) =>
      item.previewUrl &&
      normalize(item.artistName).includes(artistKey) &&
      normalize(item.trackName).startsWith(wanted),
  );
}

const songs = [];
const missing = [];
for (const entry of source) {
  try {
    const match = await resolve(entry);
    if (!match) {
      missing.push(entry);
      continue;
    }
    songs.push({
      id: String(match.trackId),
      title: entry.title,
      artist: entry.artist,
      preview: match.previewUrl,
      artwork: match.artworkUrl100,
      link: match.trackViewUrl.replace(/[&?]uo=\d+/, ""),
    });
  } catch (error) {
    missing.push({ ...entry, error: String(error) });
  }
  await new Promise((done) => setTimeout(done, 350));
}
await writeFile(target, JSON.stringify(songs, null, 2) + "\n");
console.log(`${songs.length} songs resolved, ${missing.length} missing.`);
for (const entry of missing)
  console.log(`  missing: ${entry.artist} - ${entry.title}`);
