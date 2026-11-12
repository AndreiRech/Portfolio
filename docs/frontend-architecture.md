# Arquitetura do frontend

O portfólio usa a mesma organização por funcionalidade do Backoffice da Rech
(`rech-web/docs/frontend-architecture.md`), adaptada ao App Router do Next.js com export
estático. Next.js, React e TypeScript continuam sendo a base.

```text
src/
  app/                 rotas finas, metadados e folhas de estilo globais
  layouts/
    site/              Navbar, Footer e a chuva de pixels do rodapé
  features/
    portfolio/         Home, seções, página de projeto, 404, dados e tipos
    games/             página de jogos, barra de abas e os jogos
      memory/          sinais de The Witcher
      songs/           adivinhe a música (prévias do Apple Music, quatro listas)
      higher-lower/    mais ou menos (AniList, IMDb e Spotify)
      duel/            duelo D20 contra monstros
      daily/           data do dia, sorteio com semente e progresso salvo
      termo/           Termo diário
      conexo/          Conexo diário
      crossword/       palavra cruzada diária
      rarity/          Raridade diária (respostas raras valem mais)
      sudoku/          sudoku diário
    dice/              dado 3D e o gesto de arrastar e soltar
    collectibles/      caixas, inventário, recompensas e coleção salva
    companions/        companheiros em pixel art, HUD e pet pela página
    achievements/      conquistas, toasts e easter eggs
  shared/
    i18n/              idioma, textos em inglês e português
    lib/               sons sintetizados e explosão de pixels
    ui/                ícones, pixel art em grade, letras e movimento reduzido
scripts/               jobs de dados (contribuições, músicas, mais ou menos, palavras) e seus testes
```

Cada funcionalidade agrupa `pages/`, `components/`, `hooks/`, `model/`, `services/` e
`data/` conforme a necessidade. Os testes (`*.test.mts`) ficam junto ao código que
exercitam. Não crie pastas vazias para completar a estrutura.

## Responsabilidades

`app/` só declara rotas, metadados e a composição dos providers em `layout.tsx`. Cada
`page.tsx` renderiza a página da funcionalidade, por exemplo
`features/collectibles/pages/CasesPage.tsx`. As folhas de estilo globais continuam em
`app/` e são importadas uma vez pelo layout, na ordem em que se sobrescrevem.

`layouts/site/` contém a estrutura comum a todas as páginas.

Em cada funcionalidade:

- `pages/` compõe a tela de uma rota.
- `components/` contém os blocos de interface e os jogos.
- `hooks/` contém providers, hooks e estado compartilhado entre componentes, como a
  coleção, os companheiros, as conquistas e o arremesso do dado.
- `model/` define tipos, regras, cálculos e reducers puros, testados sem React.
- `services/` conhece endpoints e valida respostas de APIs externas, como o AniList.
- `data/` reúne catálogos estáticos: projetos, experiências, músicas, monstros e sprites.

Uma funcionalidade pode consumir componentes, hooks ou modelos de outra quando
compartilha o conceito. Exemplos: o duelo usa o dado 3D e os companheiros, e as caixas
desenham recompensas com o sprite do companheiro. `shared/` contém apenas código
independente das funcionalidades.

## Estado, armazenamento e serviços externos

A coleção, a escolha de companheiro e as conquistas ficam em `localStorage`, atrás de
stores criados pelos providers de cada funcionalidade. Os parsers validam o formato salvo
antes de usá-lo. Pontuações dos jogos valem só para a sessão.

Os desafios diários usam o número do dia local como semente de um gerador
determinístico (`daily/model/daily.ts`), então o desafio é igual para todos sem
servidor. O progresso do dia fica em `localStorage` sob `daily:<jogo>:<data>`, via
`useDailyProgress`, que descarta os dias anteriores.

Dados que não têm API pública para o navegador viram instantâneos em `data/`,
atualizados manualmente: `npm run refresh:songs` (paradas do Spotify via kworb.net e
prévias do iTunes), `npm run refresh:higher-lower` (streams do Spotify e notas do
IMDb, dos datasets não comerciais) e `npm run refresh:words` (léxico do Termo). O
Mais ou menos carrega o instantâneo de uma categoria só quando ela é jogada.

As chamadas HTTP ficam em `services/`. Elas recebem `fetch` e `AbortSignal` como
dependências, o que permite testá-las sem rede. O jogo de músicas toca prévias públicas
com `<audio>` e não faz chamadas HTTP. Os efeitos sonoros são sintetizados com Web Audio
em `shared/lib/sfx.ts` e o áudio é liberado no primeiro gesto do visitante.

## Dependências e manutenção

Importe arquivos diretamente com `@/`, sem arquivos `index.ts` que reexportam uma
funcionalidade inteira. Os módulos exercitados pelos testes de `node --test` usam imports
relativos com extensão (`./battle.ts`), porque o Node não resolve o alias `@/`.

O ESLint impede:

- dependências de `shared/` para funcionalidades e layouts;
- dependências de `model/`, `services/` e `data/` para componentes, páginas, hooks e UI;
- chamadas a `fetch` em páginas, componentes, hooks e layouts.

`npm run verify` executa formatação, lint, testes e build.
