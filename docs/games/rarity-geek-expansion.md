# Expansão geek do Raridade

O banco passou de 106 para 122 temas e de 16.104 para 20.216 respostas por categoria. Os totais contam um título novamente quando ele é válido em mais de um tema. O banco editorial está em [geek.ts](../../src/features/games/rarity/data/geek.ts), integrado por [expand.ts](../../src/features/games/rarity/data/expand.ts).

## Cobertura

| Categoria | Antes | Depois |
| --- | ---: | ---: |
| Desenhos animados | 74 | 273 |
| Jogos de videogame | 99 | 1135 |
| Jogos FPS | 0 | 134 |
| Jogos RPG | 0 | 188 |
| Jogos de Pokémon | 0 | 88 |
| Jogos de Nintendo | 0 | 226 |
| Jogos de PlayStation | 0 | 107 |
| Jogos de Xbox | 0 | 100 |
| Pokémon iniciais | 0 | 29 |
| Pokémon lendários | 0 | 71 |
| Animes | 0 | 203 |
| Jogadores profissionais de Counter-Strike | 0 | 150 |
| Filmes | 0 | 506 |
| Filmes de animação | 0 | 126 |
| Séries | 0 | 601 |
| Consoles de videogame | 0 | 61 |
| Personagens de videogame | 0 | 141 |
| Mapas de Counter-Strike | 0 | 146 |

## Critérios

- Jogos e suas sequências, remakes e edições nomeadas são respostas separadas. Siglas e grafias do mesmo título são aliases: CS2 corresponde a Counter-Strike 2; CS:GO, Source e 1.6 têm suas próprias entradas. A entrada genérica Counter-Strike já existente também aceita CS 1.6. As listas são extensíveis e não pretendem enumerar todo jogo, patch ou edição regional já publicado.
- As categorias de Nintendo, PlayStation e Xbox incluem jogos lançados nos respectivos consoles ou portáteis, inclusive títulos multiplataforma. Não exigem exclusividade nem ownership atual do estúdio. Pokémon Go e serviços exclusivos de PC/celular ficam fora de Nintendo; Unite, Quest, Shuffle e Café também têm versões para consoles Nintendo.
- Jogos dos temas FPS, RPG e plataformas também valem em Jogos de videogame. Filmes da Pixar e filmes de animação também valem em Filmes. Animes de TV também valem em Séries e Desenhos animados.
- Pokémon iniciais cobre as espécies de primeira etapa oferecidas como parceiros iniciais nos jogos principais, incluindo Pikachu e Eevee. Pokémon lendários segue a distinção entre lendários e míticos: Mew, por exemplo, permanece na categoria geral Pokémon, sem entrar em lendários.
- Profissionais de Counter-Strike inclui jogadores atuais e históricos de CS clássico, Source, CS:GO e CS2. Nicknames são as respostas principais; alguns nomes completos conhecidos também são aceitos. Não há associação com times atuais nem ranking de desempenho.
- Mapas de Counter-Strike inclui mapas oficiais e comunitários distribuídos ao longo da série, incluindo operações e mapas retirados. Todos os nomes da tabela enviada pelo usuário foram transcritos para uma referência de teste. Prefixos de arquivo conhecidos são aliases; Pool Day aceita tanto ar_pool_day quanto fy_pool_day. A presença de um mapa não afirma que ele está na rotação competitiva atual.
- A pontuação de 1 a 10 continua editorial. Toda a base funciona localmente durante a partida.

## Fontes de conferência

A expansão é curadoria local. Foram consultadas fontes públicas para conferir títulos, versões e identidades, além da tabela de mapas fornecida pelo usuário:

- [Counter-Strike no Steam](https://store.steampowered.com/app/10/CounterStrike/), [Source no Steam](https://store.steampowered.com/app/240/CounterStrike_Source/) e [apresentação oficial de CS2](https://www.counter-strike.net/cs2).
- [PEAK no catálogo da Landfall](https://landfall.se/) e [Omega Ruby e Alpha Sapphire no site Pokémon](https://www.pokemon.com/uk/pokemon-video-games/pokemon-omega-ruby-and-pokemon-alpha-sapphire).
- [FalleN](https://www.hltv.org/player/2023/fallen), [ZywOo](https://www.hltv.org/player/11893/zywoo) e [donk](https://www.hltv.org/player/21167/donk) no HLTV, como referências de nicknames e identidades.
- [Catálogo de aventura da Crunchyroll](https://www.crunchyroll.com/videos/adventure) para títulos de anime.
- [Pool Day no Workshop, publicado pelos criadores](https://steamcommunity.com/workshop/filedetails/?id=3263935964), que descreve as variantes Arms Race e fy_pool_day.

## Progresso salvo e validação

Os novos temas alteram o sorteio diário. O progresso temporário passa de rarity-timed-v1 para rarity-timed-v2 para não aplicar respostas antigas aos novos temas do mesmo dia. O histórico de resultados permanece no armazenamento independente anterior.

Os testes verificam aliases exatos, distinção entre versões, inclusão nas categorias amplas, cobertura da tabela de mapas, ausência de chaves duplicadas, pontuações e isolamento entre listas. Os snapshots de 1.025 espécies de Pokémon, 118 elementos e 27 unidades federativas permanecem com seus tamanhos anteriores.
