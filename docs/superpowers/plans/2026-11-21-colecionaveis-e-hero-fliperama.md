# Colecionáveis renovados e hero de fliperama — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Renovar o catálogo da caixa (paletas, cursores com efeito de clique, rastros,
pets 32×32) e trocar o dado da hero por um fliperama dos jogos diários.

**Architecture:** O catálogo continua em `collectibles/data/collectibles.ts`, com o novo
tipo `trail` passando por modelo, parser e inventário. Efeitos de clique e rastros são
componentes montados pelo `CollectionProvider`, com a lógica de partículas pura e
testada. Os pets passam a ser rasterizados de primitivas sombreadas por um modelo puro
(`companions/model/pixelSprite.ts`). O fliperama tem a seleção de jogos num modelo puro
(`portfolio/model/arcade.ts`) e um componente de apresentação.

**Tech Stack:** Next.js 16 (export estático), React 19, TypeScript, CSS global,
`node --test`.

**Spec:** `docs/superpowers/specs/2026-11-21-colecionaveis-e-hero-fliperama-design.md`

## Global Constraints

- Sem commits (pedido do Andrei); trabalho na branch `feat/collectibles-arcade-hero`.
- Toda arte em pixel art, `shapeRendering="crispEdges"`.
- Rastros e efeitos: `pointer-events: none`, só `(pointer: fine)`, rastro desligado e
  clique reduzido a flash com `prefers-reduced-motion: reduce`.
- Textos em pt e en para toda string nova.
- `npm run verify` (prettier, eslint, testes, build) precisa passar ao final.

## Review Focus

1. Coleção salva com `crystal`, `gold-d20` equipados ou um `equipped.trail` inválido:
   carrega limpa, sem quebrar a página. Teste na Task 1.
2. Visitante em inglês: o fliperama nunca oferece Termo, Conexo, Cruzada ou Raridade.
   Teste na Task 7.
3. Todos os diários de hoje já jogados: o fliperama mostra o primeiro e o estado
   "tudo jogado", sem índice inválido. Teste na Task 7.
4. Cliques muito rápidos com efeito ativo não acumulam partículas sem limite. Teste
   na Task 3 (`MAX_LIVE_PARTICLES`).
5. Todos os sprites têm o mesmo tamanho em todos os quadros, só com chaves da paleta.
   Teste na Task 5.

---

### Task 1: Catálogo e coleção

**Files:** Modify `src/features/collectibles/data/collectibles.ts`,
`src/features/collectibles/model/collection.ts`,
`src/features/collectibles/model/collection.test.mts`,
`src/features/collectibles/pages/InventoryPage.tsx`, `src/shared/i18n/{en,pt,interface}.ts`

**Interfaces:**
- Produces: `RewardKind = "palette" | "cursor" | "companion" | "trail"`;
  `REWARD_KINDS` readonly array na mesma ordem; `Collection.equipped.trail`.
- Ids novos: `ocean` (palette, industrial), `treasure` (palette, special),
  `pickaxe` (cursor, milspec), `saber` (cursor, classified), `slime` (companion,
  industrial), `bat` (companion, classified), `dragon` (companion, special),
  `dust` (trail, consumer), `bubbles` (trail, industrial), `embers` (trail,
  restricted), `rainbow` (trail, covert). Saem `crystal` e `gold-d20`.

- [ ] Testes: `every rarity tier keeps at least one reward`; `the special tier holds
  knife, treasure and dragon`; `removed rewards (crystal, gold-d20) are dropped from
  counts and slots`; `trail slot accepts only trail rewards`; o teste de
  allowlist passa a esperar `equipped` com `trail: null`.
- [ ] Rodar `npm test` e ver falhar; implementar; rodar e ver passar.

### Task 2: Paletas

**Files:** `src/app/globals.css`, `collectibles.ts` (`PALETTE_SWATCHES`)

- Valores exatos da spec para Aurora, Tesouro e Oceano. Brilho do Tesouro:
  `:root[data-palette="treasure"]` aplica `treasure-sheen` (gradiente animado em
  `background-clip: text` nos `h1, h2` e pseudo-elemento em `.button.primary`), 8 s,
  desligado sob reduced motion.
- O teste existente de "every palette reward has its own colors" cobre a presença.

### Task 3: Cursores e efeitos de clique

**Files:** Delete `public/collectibles/cursors/crystal.svg`; Create
`public/collectibles/cursors/{pickaxe,saber}.svg`,
`src/features/collectibles/data/clickEffects.ts`,
`src/features/collectibles/model/particles.ts` + `particles.test.mts`,
`src/features/collectibles/components/CursorEffects.tsx`; Modify `globals.css`,
`CollectionContext.tsx`

**Interfaces:**
- `particles.ts`: `type Particle = { x; y; vx; vy; life; maxLife; size; color; shape }`,
  `stepParticles(list, dt, gravity): Particle[]` (remove mortos),
  `capParticles(list, max): Particle[]` (mantém os mais novos),
  `MAX_LIVE_PARTICLES = 160`.
- `clickEffects.ts`: `CLICK_EFFECTS: Record<CursorId, (x, y, rand) => Particle[]>`.
- `CursorEffects` recebe `cursor: string | null`, `trail: string | null`; um canvas fixo
  compartilhado por clique e rastro.

- [ ] Testes de `stepParticles` (vida, remoção, gravidade) e `capParticles`; cada
  cursor tem efeito e cada efeito gera ≥ 1 partícula e ≤ 40.

### Task 4: Rastros

**Files:** `src/features/collectibles/data/trails.ts`, `CursorEffects.tsx`,
`RewardArt.tsx`, `globals.css`

**Interfaces:** `TRAILS: Record<TrailId, { emit(x, y, dx, dy, rand): Particle[]; art:
string[]; palette }>`; `RewardArt` desenha `kind === "trail"` com `PixelFrame`.

- [ ] Teste: todo reward `trail` tem entrada em `TRAILS` e emite partículas finitas.

### Task 5: Rasterizador e pets 32×32

**Files:** Create `src/features/companions/model/pixelSprite.ts` + test; rewrite
`src/features/companions/data/petSprites.ts`; Modify `PixelPet.tsx`,
`CompanionDock.tsx`, `games.css`, `interactions.css`

**Interfaces:**
- `pixelSprite.ts`: `type Shape = { kind: "ellipse" | "poly" | "rect"; ...; ramp:
  string /* chave base, ex. "w" → w1/w2/w3 */ }`;
  `rasterize(shapes: Shape[], size = 32, light = [-1, -1]): string[]` devolvendo
  linhas de chaves de um caractere, com contorno automático `o`.
- `PetFrames` ganha `breathe` e `action?: string[][]` (quadros da ação).
- `PET_SPRITES` com `chicken, cat, frog, medallion, ghost, d20, slime, bat, dragon`.

- [ ] Teste: todos os quadros 32×32, só chaves da paleta, idle ≠ walkA ≠ walkB.
- [ ] Ações: `slime → split`, `bat → swoop`, `dragon → breath` em `companionActions`.
- [ ] Verificação visual por screenshot da página de companheiros.

### Task 6: Conquistas no pet D20 e remoção do dado da hero

**Files:** Delete `src/features/portfolio/components/HeroDice.tsx`; Modify
`CompanionDock.tsx` (`landed` libera `nat20`/`fumble`), `achievements.ts` (dicas),
`hero.css` (estilos do dado).

### Task 7: Fliperama

**Files:** Create `src/features/portfolio/model/arcade.ts` + test,
`src/features/portfolio/components/ArcadeCabinet.tsx`; Modify `HeroSection.tsx`,
`hero.css`, i18n.

**Interfaces:**
- `ARCADE_GAMES: { id; activity; mode?; historyGame; portugueseOnly }[]`
- `arcadeGames(language): ArcadeGame[]`
- `firstUnplayed(games, playedToday: Set<HistoryGame>): { index: number; allDone:
  boolean }`
- `arcadeHref(game): string`

- [ ] Testes: inglês sem os quatro exclusivos; primeiro não jogado; tudo jogado →
  índice 0 e `allDone`; `songs` e `higher-lower` com `mode=daily`; sudoku normal.

### Task 8: Verificação

- [ ] `npm run verify` passa.
- [ ] Screenshots da home (pt/en, desktop/celular), `/cases`, inventário e pets.
