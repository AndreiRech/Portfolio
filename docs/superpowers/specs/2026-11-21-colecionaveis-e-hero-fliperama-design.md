# Colecionáveis renovados e hero de fliperama

Data: 2026-11-21. A refatoração da seção do portfólio (seletor de classe, ficha de
personagem, cartuchos) fica para um design separado.

## Intenção

O site já é estilizado como um arcade em pixel art, mas a hero ainda gira em torno
de um dado e a caixa tem poucos itens, alguns fracos (o cursor Cristal) ou repetidos
(a Aurora quase igual ao tema padrão). O objetivo é que a primeira tela leve aos
jogos diários, que são o motivo de voltar ao site, e que abrir caixas valha mais a
pena: mais itens, itens que reagem ao uso e pets com animação melhor.

## Objetivos

1. Remover o cursor Cristal.
2. Adicionar uma paleta lendária dourada ("Tesouro").
3. Trocar o pet lendário D20 dourado por um dragãozinho dourado.
4. Refazer a Aurora com cores totalmente novas.
5. Trocar o dado da hero por um fliperama que mostra os jogos diários de hoje. O dado
   vai para outro lugar do site.
6. Dar a cada cursor um efeito ao clicar.
7. Criar um tipo novo de item, o rastro do cursor.
8. Refazer os sprites dos pets com mais detalhe e animações melhores.
9. Adicionar itens novos à caixa.

## Fora do escopo

- A refatoração da seção do portfólio.
- Avisar ou compensar quem perde o Cristal ou o D20 dourado (decidido: perde sem
  aviso).
- Mudar as chances das raridades.

## Anti-objetivos

- A hero não pode depender de um jogo que só existe em português.
- Nenhum efeito pode atrapalhar o uso do site: rastros e efeitos de clique não
  capturam o ponteiro, não cobrem texto por mais de um instante e não rodam em
  toque.
- Nada de movimento contínuo para quem pediu movimento reduzido.

## Restrições

- Next.js com export estático. O dia local só é conhecido depois de montar
  (`useToday`), então a hero precisa de um estado inicial neutro.
- A coleção é validada por `parseCollection`. Ids removidos somem sozinhos, e um
  tipo novo de item exige um novo espaço em `equipped`.
- Termo, Conexo, Cruzada e Raridade só existem em português (`PortugueseOnly`). Em
  inglês, os diários são Cores, Escala, Sudoku, Músicas e Mais ou menos.
- Toda arte é pixel art com temas da cultura geek.
- Os modelos puros ficam em `model/` com testes `*.test.mts` (`node --test`).

## Abordagens consideradas (hero)

- **A. Um jogo jogável na hero (Termo).** Era o gancho mais forte, mas a hero ficaria
  presa a um jogo que metade dos visitantes não consegue jogar.
- **B. Cartões com prévia de cada jogo / C. lista de todos os diários.** São
  informativos e funcionam nos dois idiomas, mas são estáticos e menos memoráveis.
- **D1. Fliperama (escolhida pelo Andrei).** É interativo como o dado, mostra vários
  jogos, filtra pelo idioma e combina com a ideia futura dos cartuchos no portfólio.
- D2. Pet na hero: descartada por depender de quem já tem pet.

## Decisões

### Catálogo

Distribuição final por raridade. `*` marca item novo, `~` marca item alterado.

| Raridade | Paletas | Cursores | Pets | Rastros (novo tipo) |
|---|---|---|---|---|
| Consumer | Floresta, Vermelho coral | Seta pixel | | Poeira de pixel\* |
| Industrial | Violeta, Oceano\* | Mira, Patinha | Slime\* | Bolhas\* |
| Mil-Spec | | Picareta\* | Galinha, Gato, Sapo | |
| Restricted | Fogueira, Rosa | Espada, Varinha mágica | | Brasas\* |
| Classified | | Sabre de luz\* | Medalhão, Fantasma, Morcego\* | |
| Covert | Aurora~ | | D20 | Arco-íris 8-bit\* |
| Legendary | Tesouro\* | Faca dourada | Dragão dourado\* | |

Todo nível continua com pelo menos um item, o que deve ser coberto por teste.

### Paletas

- **Tesouro (lendária):** bg `#1d180d`, surface `#282011`, raised `#342a16`, fg
  `#fbf1d3`, muted `#d4c597`, accent `#ffd23f`, blue `#e0a526`, line `#57471f`.
  Ganha um brilho em CSS que passa sobre `h1`, `h2` e `.button.primary` a cada ~8 s.
  O brilho fica desligado com `prefers-reduced-motion`.
- **Aurora (nova):** bg `#0f1630`, surface `#172040`, raised `#1f2a52`, fg `#e8ecff`,
  muted `#aab3d9`, accent `#5cf2a6`, blue `#b07cff`, line `#34407a`.
- **Oceano:** bg `#0f1d2b`, surface `#162838`, raised `#1d3346`, fg `#e3eef7`, muted
  `#a9bfd0`, accent `#4f9dff`, blue `#2fc4b2`, line `#2e4a63`.
- Os swatches de `PALETTE_SWATCHES` seguem os quatro tons principais de cada paleta.
- Os valores exatos podem ser ajustados por contraste (texto `fg` sobre `bg` e
  `accent` sobre `bg`, AA).

### Cursores e efeito de clique

O Cristal sai: o catálogo, `public/collectibles/cursors/crystal.svg` e o CSS em
`globals.css`. A Picareta e o Sabre de luz ganham SVG em pixel art, no mesmo formato
dos outros (hotspot declarado no CSS).

Cada cursor tem um efeito ao clicar, no ponto do clique, desenhado na camada
`.pixel-feedback` que já existe (`shared/lib/pixelBurst.ts`):

| Cursor | Efeito |
|---|---|
| Seta pixel | onda quadrada de pixels que se expande |
| Mira | marcador de acerto em "X" que pisca |
| Patinha | pegada carimbada que some aos poucos |
| Espada | arco de corte |
| Varinha mágica | estrelinhas |
| Faca dourada | brilho dourado e moedinhas |
| Picareta | lascas de bloco caindo |
| Sabre de luz | rastro de luz no balanço |

- O efeito vale para cliques em qualquer lugar da página e não bloqueia o clique
  (`pointer-events: none`).
- Só roda com ponteiro fino (`(pointer: fine)`).
- Com movimento reduzido, vira um flash parado de ~150 ms.
- Um efeito novo por clique, com teto de partículas vivas para cliques rápidos.

### Rastro do cursor (tipo novo `trail`)

- `RewardKind` ganha `"trail"`, `equipped` ganha `trail: null`, e o parser, o
  inventário (quarto espaço e filtro) e os textos em pt/en acompanham.
- O rastro equipado é exposto como `data-trail` no `<html>`, como o cursor.
- Ele é desenhado numa camada fixa própria, com `pointer-events: none`, por
  `requestAnimationFrame`. Só emite enquanto o ponteiro se move e para o loop quando
  fica parado.
- Rastros: Poeira de pixel (quadradinhos na cor de destaque), Bolhas (sobem e
  estouram), Brasas (laranja, sobem e apagam) e Arco-íris 8-bit (faixa de pixels
  coloridos).
- Desligado em toque e com movimento reduzido.
- O ícone na caixa e no inventário é uma pequena arte em pixel do próprio rastro.

### Pets

- **Pets novos em 32 × 32** (slime, morcego e dragão dourado), desenhados por um
  rasterizador de formas sombreadas (`companions/model/pixelSprite.ts`): luz de cima
  à esquerda, três tons por material e contorno automático.
- **Pets existentes mantêm o desenho** (decisão tomada na implementação: renderizados,
  eles já tinham boa qualidade, e o redesenho em 32 × 32 arriscava piorar a arte e
  quebrar as animações ajustadas do duelo e dos emotes). Eles ganham:
  - um quadro de respiração alternado com o idle, além do piscar. A respiração
    dobra as patas (o corpo desce sobre pernas mais curtas) em vez de cortar uma
    linha do corpo, que deformava a cabeça;
  - quadros de ação próprios quando fazem sentido (a galinha dá um pulinho).
- **Ações com dois quadros** tocam uma vez em 1,2 s: entrada, quadro principal
  mantido, saída.
- **Dragão dourado:** voa batendo as asas. Na ação, solta uma baforada de fogo em
  pixel.
- **D20 dourado sai:** saem o sprite, `variant="gold"` no `CompanionDock`, os
  seletores `.pet-gold-d20` / `[data-pet="gold-d20"]` no CSS e `isDie` passa a
  reconhecer só `d20`. A variante dourada do `Die3D` fica, se o duelo usar.
- O número na face do D20 é reposicionado para a nova grade.
- **Ações:** slime quica e se divide por um instante; morcego dá um rasante; dragão
  solta fogo. As já existentes (purr, hop, boo, shine, roll) ganham quadros próprios
  em vez de só um emote.

### Conquistas `nat20` e `fumble`

Passam a ser liberadas pela rolagem do pet D20 no `CompanionDock`, ao pousar o dado
com 20 ou com 1. As dicas mudam para "Tire 20 com o pet D20" / "Tire 1 com o pet
D20", e o mesmo em inglês. O dado da hero deixa de liberar conquistas.

### Hero de fliperama

```
┌──────────────────────────────┬──────────────────────────┐
│ Andrei Rech                  │     ┌ marquise ────┐     │
│ texto curto                  │     │ ▓ TERMO #312 │     │
│                              │     │  prévia      │     │
│ ver meu trabalho ↓  diga oi  │     │  ✔ vencido   │     │
│                              │     ├──────────────┤     │
│ [prêmio] [pets] [jogos]      │     │ ◀  ▶  START  │     │
│                              │     └──────────────┘     │
└──────────────────────────────┴──────────────────────────┘
```

- O gabinete arcade em pixel ocupa o lugar do `HeroDice` e é o maior elemento da
  hero.
- A tela mostra um jogo diário de cada vez:
  - o nome e o número do dia;
  - uma prévia em pixel do jogo (arte fixa por jogo);
  - o estado de hoje: "vencido", "perdido" ou "jogar". O estado vem do histórico
    (`daily-history:v1`, via `useHistory`).
- A lista de jogos depende do idioma. Em português: Termo, Conexo, Cruzada,
  Raridade, Sudoku, Cores, Escala, Músicas e Mais ou menos. Em inglês, saem os
  quatro exclusivos.
- O primeiro jogo exibido é o primeiro ainda não jogado hoje. Se todos foram
  jogados, mostra o primeiro com a mensagem de que todos foram jogados e a contagem
  para o próximo dia.
- **Controles:** ◀ ▶ trocam o jogo (são botões e também as setas do teclado com o
  gabinete focado). START é um link para `/games?activity=<id>`, com `&mode=daily`
  para Músicas e Mais ou menos e com a dificuldade normal no Sudoku.
- **Modo demonstração:** a tela alterna sozinha a cada ~4 s. Pausa com hover, foco
  ou depois de qualquer interação, e fica desligado com movimento reduzido.
- **"INSERT COIN":** o texto pisca na marquise. Clicar na fenda da moeda toca um som
  (`sfx`) e equivale a START.
- **Antes de montar** (export estático), a tela mostra "PRESS START", sem estado nem
  número do dia.
- A seleção do jogo inicial e a lista por idioma ficam num modelo puro testado (ex.:
  `portfolio/model/arcade.ts`).
- O texto à esquerda continua (`HeroName`, intro e texto curto). O botão principal
  deixa de disputar atenção com o gabinete: "ver meu trabalho" e "diga oi" ficam
  como links secundários.

### O dado da hero

O `HeroDice` é removido do site (decidido pelo Andrei). O `Die3D` e o
`useDieThrow` continuam, porque o pet D20 e o duelo os usam. O cartão de
companheiros da `ExploreSection` continua mostrando o pet D20.

## O que fica para quem implementar

- A arte final de cada sprite, SVG de cursor, ícone de rastro e prévia de jogo no
  fliperama, dentro das regras acima.
- Os valores finos de tempo, contagem e tamanho das partículas.
- O layout do gabinete no celular. Sugestão:
  no celular, o gabinete vai abaixo do texto, com largura total, e o modo
  demonstração fica desligado.
- Os textos novos em pt/en, seguindo o tom atual.
