import assert from "node:assert/strict";
import test from "node:test";
import { isAltered, isLive } from "./itunes.mjs";

const item = (trackName: string, collectionName = "") => ({
  trackName,
  collectionName,
});

test("altered cuts are rejected", () => {
  for (const name of [
    "Creep (Acoustic)",
    "Blinding Lights (Remix)",
    "Miracle (Stripped)",
    "Love Story (Taylor’s Version)",
    "Cheiro de Culpado (Cover)",
    "Apologize (iTunes Session)",
    "Espresso (On Vacation Version)",
    "Show das Poderosas (Batutinha DJ - Rádio Edit)",
  ])
    assert.equal(isAltered(item(name)), true, name);
  assert.equal(isAltered(item("Dias Melhores", "Acústico Jota Quest")), true);
});

test("studio cuts and deluxe editions are kept", () => {
  assert.equal(isAltered(item("Shape of You", "÷ (Deluxe)")), false);
  assert.equal(isAltered(item("Bohemian Rhapsody", "A Night At The Opera")), false);
  assert.equal(isAltered(item("Hips Don't Lie (feat. Wyclef Jean)")), false);
});

test("live cuts are detected so they stay a last resort", () => {
  assert.equal(isLive(item("Camaro Amarelo (Ao Vivo)")), true);
  assert.equal(isLive(item("Leilão (Live)")), true);
  assert.equal(isLive(item("Mozão", "Tá Diferente")), false);
});
