# Respostas faltantes do Raridade

Jogadores relataram respostas válidas recusadas em várias categorias, como Profissões, Coisas que têm no zoológico e Personagens bíblicos. Esta revisão passou por todas as 142 categorias. O total de respostas por categoria foi de 26099 para 55348. A soma conta a mesma resposta uma vez por tema em que ela vale. Nenhuma categoria nova foi criada e nenhuma consulta externa acontece durante uma rodada.

## Fontes

As adições vêm de três origens, aplicadas nesta ordem em [expand.ts](../../src/features/games/rarity/data/expand.ts):

1. **Curadoria editorial.** [requested.ts](../../src/features/games/rarity/data/requested.ts) traz as respostas comuns que faltavam em cada tema, com grafias alternativas. Exemplos: Vendedor, Mecânico e Youtuber em Profissões; Pavão, Ema e Tratador no zoológico; Lúcifer, Gabriel e Nabucodonosor nos personagens bíblicos. Respostas que muita gente dá recebem pontuação baixa, de 1 a 4. Essa curadoria é aplicada antes dos catálogos, então a pontuação editorial sempre prevalece sobre o valor padrão de uma importação.
2. **Catálogos públicos.** [catalogs.json](../../src/features/games/rarity/data/catalogs.json) é um instantâneo gerado por `npm run refresh:rarity-catalogs` ([script](../../scripts/update-rarity-catalogs.mjs)):
   - **Profissões:** títulos e sinônimos da [CBO 2002](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/cbo/servicos/downloads) do Ministério do Trabalho e Emprego. Títulos com mais de quatro palavras ficam de fora, porque ninguém os digita numa rodada.
   - **Wikidata (CC0):** capitais de países soberanos, clubes de futebol do Brasil, raças de cachorro, linguagens de programação, minerais e gemas, montadoras, bandas de rock, figuras das mitologias grega, romana e nórdica e personagens bíblicos.
   - **Pontuação:** a importação usa o número de páginas da Wikipédia (sitelinks) como estimativa de fama. Itens com 100 ou mais valem 6, com 40 ou mais valem 7, com 15 ou mais valem 8 e o restante vale 9. Nos títulos da CBO, uma palavra vale 8 e várias palavras valem 9.
   - **Aliases:** um alias do Wikidata só é aceito se compartilha uma palavra com o rótulo. Isso descartou, por exemplo, o apelido de outro clube cadastrado num item de time. Prefixos como "São" geram também a forma curta ("São Tomé" aceita "Tomé"). Uma lista de bloqueio impede que a forma curta de "São Salvador" aceite Salvador, a cidade brasileira, como capital.
   - **Descartes:** pesquisas de cantores e instrumentos no Wikidata vieram com ruído, como atores marcados como cantores e softwares marcados como instrumentos. Essas categorias foram completadas só pela curadoria.
3. **Grupos de animais.** O zoológico passa a aceitar mamíferos, aves, répteis e anfíbios do instantâneo do iNaturalist. Insetos, aracnídeos e peixes ficam de fora. Coisas que voam aceita aves capazes de voar, morcegos, animais "voadores" (esquilo-voador, peixe-voador) e insetos alados. Pinguins, avestruzes, emas, casuares, kiwis e formigas ficam de fora. Esses animais herdam a pontuação que já têm em Animais.

## Respostas que valem em mais de uma categoria

Quando um tema é parte de outro, o banco copia as respostas do tema específico para o amplo. Nenhuma entrada aparece duplicada dentro de um tema. Esta revisão incluiu duas regras novas: Esportes olímpicos alimenta Esportes e Filmes da Pixar alimenta Filmes de animação. As regras que já existiam continuam valendo:

- Aves, Peixes, Insetos, Animais marinhos, Animais da Amazônia e Dinossauros alimentam Animais.
- Os jogos por gênero ou plataforma alimentam Jogos de videogame.
- Filmes de animação e Filmes premiados pelo Oscar alimentam Filmes.
- Animes alimenta Séries e Desenhos animados.

Animais citados só no zoológico, na fazenda ou em Coisas que voam também passaram a valer em Animais e nos temas por letra. Exemplos: lobo-guará, mico-leão-dourado, égua e esquilo-voador. Daft Punk continua fora de Bandas de rock, porque é música eletrônica.

## O que não mudou

As listas fechadas continuam com o mesmo tamanho: Estados brasileiros, Elementos químicos, Pokémon, Pokémon iniciais, Famílias dos Pokémon iniciais, Jogos de Pokémon, Pokémon lendários, Mapas de Counter-Strike, Bandas que ganharam Grammy e Filmes premiados pelo Oscar. Pokémon singulares (Mew, Celebi, Arceus) continuam fora dos lendários, como já exigia o teste existente. Os temas "Animais que começam com…" crescem sozinhos, porque derivam de Animais.

## Validação

[requested.test.mts](../../src/features/games/rarity/model/requested.test.mts) verifica cinco coisas:

- as respostas relatadas são aceitas com pontuação de resposta comum;
- toda adição editorial chega ao banco jogável;
- os catálogos não sobrescrevem pontuações editoriais;
- as regras de voo e de zoológico excluem pinguim, avestruz, formiga e barata;
- cada tema específico continua contido no tema amplo correspondente.

Os dados entram no bundle carregado sob demanda pelo jogo. A curadoria e os catálogos somam cerca de 180 KB com gzip.

## Cobertura por categoria

| Categoria                                 | Antes | Depois | Novas |
| ----------------------------------------- | ----: | -----: | ----: |
| Doces de festa                            |    76 |    150 |    74 |
| Frutas                                    |    82 |    142 |    60 |
| Animais                                   |  4464 |   4732 |   268 |
| Cores                                     |   107 |    197 |    90 |
| Países                                    |   198 |    201 |     3 |
| Profissões                                |   104 |   6742 |  6638 |
| Esportes                                  |    89 |    256 |   167 |
| Instrumentos musicais                     |    96 |    200 |   104 |
| Partes do corpo                           |    89 |    218 |   129 |
| Times de futebol do Brasil                |    90 |    878 |   788 |
| Marcas de carro                           |   127 |    377 |   250 |
| Comidas típicas brasileiras               |    78 |    190 |   112 |
| Sabores de pizza                          |    78 |    178 |   100 |
| Legumes e verduras                        |    72 |    147 |    75 |
| Bebidas                                   |    91 |    217 |   126 |
| Roupas                                    |    86 |    194 |   108 |
| Coisas de praia                           |    75 |    203 |   128 |
| Super-heróis                              |    77 |    231 |   154 |
| Pokémon                                   |  1025 |   1025 |     0 |
| Raças de cachorro                         |   182 |    478 |   296 |
| Aves                                      |  1984 |   2015 |    31 |
| Peixes                                    |   403 |    442 |    39 |
| Insetos                                   |   565 |    612 |    47 |
| Flores                                    |    75 |    173 |    98 |
| Temperos                                  |    67 |    173 |   106 |
| Eletrodomésticos                          |    66 |    156 |    90 |
| Ferramentas                               |    70 |    200 |   130 |
| Meios de transporte                       |    71 |    183 |   112 |
| Ritmos musicais                           |    83 |    241 |   158 |
| Cantores brasileiros                      |    93 |    418 |   325 |
| Filmes da Pixar                           |    29 |     39 |    10 |
| Jogos de tabuleiro                        |    71 |    163 |    92 |
| Redes sociais e apps                      |    74 |    246 |   172 |
| Linguagens de programação                 |   101 |    341 |   240 |
| Estados brasileiros                       |    27 |     27 |     0 |
| Elementos químicos                        |   118 |    118 |     0 |
| Sobremesas                                |    89 |    229 |   140 |
| Salgadinhos de festa                      |    60 |    160 |   100 |
| Queijos                                   |    63 |    211 |   148 |
| Sabores de sorvete                        |    70 |    203 |   133 |
| Material escolar                          |    64 |    184 |   120 |
| Brinquedos                                |    65 |    212 |   147 |
| Desenhos animados                         |   273 |    401 |   128 |
| Bandas de rock                            |   127 |    668 |   541 |
| Mitologia grega                           |    77 |   1066 |   989 |
| Dinossauros                               |   299 |    304 |     5 |
| Jogos de videogame                        |  1135 |   1322 |   187 |
| Coisas da cozinha                         |    75 |    237 |   162 |
| Capitais do mundo                         |   112 |    225 |   113 |
| Partes do carro                           |    72 |    208 |   136 |
| Coisas que têm no quarto                  |    51 |    158 |   107 |
| Cidades turísticas do Brasil              |    77 |    236 |   159 |
| Apelidos carinhosos                       |    62 |    204 |   142 |
| Itens de supermercado                     |    74 |    213 |   139 |
| Cores de cabelo                           |    66 |    162 |    96 |
| Comidas de festa junina                   |    66 |    161 |    95 |
| Personagens de novela                     |    66 |    132 |    66 |
| Animais marinhos                          |    79 |    219 |   140 |
| Doenças comuns                            |    68 |    251 |   183 |
| Palavras em inglês usadas no Brasil       |    83 |    266 |   183 |
| Coisas que voam                           |    67 |   2575 |  2508 |
| Coisas redondas                           |    66 |    178 |   112 |
| Coisas amarelas                           |    59 |    203 |   144 |
| Coisas verdes                             |    68 |    236 |   168 |
| Coisas vermelhas                          |    62 |    231 |   169 |
| Coisas da escola                          |    73 |    223 |   150 |
| Coisas que têm no hospital                |    77 |    275 |   198 |
| Coisas de casamento                       |    69 |    220 |   151 |
| Esportes olímpicos                        |    74 |    124 |    50 |
| Partes de uma árvore                      |    79 |    187 |   108 |
| Coisas que têm no circo                   |    65 |    193 |   128 |
| Partes do corpo de um animal              |    65 |    207 |   142 |
| Coisas que têm no zoológico               |    85 |   2879 |  2794 |
| Tipos de pão                              |    73 |    190 |   117 |
| Ingredientes de salada                    |    77 |    216 |   139 |
| Coisas de inverno                         |    66 |    192 |   126 |
| Coisas de verão                           |    72 |    197 |   125 |
| Personagens da Turma da Mônica            |    71 |     91 |    20 |
| Personagens de Harry Potter               |    78 |    192 |   114 |
| Coisas do Natal                           |    83 |    207 |   124 |
| Animais da Amazônia                       |    89 |    196 |   107 |
| Cantores internacionais                   |    98 |    312 |   214 |
| Nomes de cachorro                         |    91 |    291 |   200 |
| Coisas que têm no banheiro                |    73 |    187 |   114 |
| Personagens de desenho animado            |    92 |    595 |   503 |
| Coisas do Carnaval                        |    65 |    249 |   184 |
| Coisas que têm em um escritório           |    81 |    200 |   119 |
| Jogadores de futebol                      |   536 |    585 |    49 |
| Gírias brasileiras                        |    97 |    328 |   231 |
| Sabores de bala e chiclete                |    77 |    160 |    83 |
| Pratos de comida de boteco                |    81 |    215 |   134 |
| Coisas que têm em uma fazenda             |    86 |    226 |   140 |
| Coisas que se colecionam                  |    85 |    214 |   129 |
| Instrumentos de cozinha profissional      |    84 |    232 |   148 |
| Planetas, luas e astros                   |    98 |    229 |   131 |
| Coisas que têm em um parque de diversões  |    80 |    144 |    64 |
| Personagens bíblicos                      |   111 |    542 |   431 |
| Coisas de praia de rio e cachoeira        |    84 |    212 |   128 |
| Tipos de dança                            |    95 |    236 |   141 |
| Objetos de costura                        |    45 |    163 |   118 |
| Ferramentas de jardinagem                 |    45 |    146 |   101 |
| Formas de relevo                          |    45 |    158 |   113 |
| Gêneros literários                        |    45 |    171 |   126 |
| Objetos de acampamento                    |    45 |    155 |   110 |
| Pedras e minerais                         |    45 |    334 |   289 |
| Tipos de massa italiana                   |    45 |    108 |    63 |
| Jogos FPS                                 |   134 |    179 |    45 |
| Jogos RPG                                 |   188 |    236 |    48 |
| Jogos de Pokémon                          |    88 |     88 |     0 |
| Jogos de Nintendo                         |   226 |    260 |    34 |
| Jogos de PlayStation                      |   107 |    159 |    52 |
| Jogos de Xbox                             |   100 |    121 |    21 |
| Pokémon iniciais                          |    29 |     29 |     0 |
| Pokémon lendários                         |    71 |     71 |     0 |
| Animes                                    |   203 |    246 |    43 |
| Jogadores profissionais de Counter-Strike |   150 |    208 |    58 |
| Filmes                                    |   597 |    786 |   189 |
| Filmes de animação                        |   126 |    240 |   114 |
| Séries                                    |   601 |    714 |   113 |
| Consoles de videogame                     |    61 |     98 |    37 |
| Personagens de videogame                  |   141 |    453 |   312 |
| Mapas de Counter-Strike                   |   146 |    146 |     0 |
| Mitologia nórdica                         |    81 |    140 |    59 |
| Mitologia romana                          |    79 |    199 |   120 |
| Mitologia egípcia                         |    66 |     93 |    27 |
| Mitologia japonesa                        |    59 |    114 |    55 |
| Comidas azedas                            |    45 |    118 |    73 |
| Comidas amargas                           |    28 |    105 |    77 |
| Comidas apimentadas                       |    40 |    150 |   110 |
| Famílias dos Pokémon iniciais             |    93 |     93 |     0 |
| Bandas que ganharam Grammy                |    54 |     54 |     0 |
| Filmes premiados pelo Oscar               |   136 |    136 |     0 |
| Animais que começam com A                 |   433 |    455 |    22 |
| Animais que começam com B                 |   404 |    435 |    31 |
| Animais que começam com C                 |   715 |    757 |    42 |
| Animais que começam com F                 |   141 |    150 |     9 |
| Animais que começam com G                 |   365 |    375 |    10 |
| Animais que começam com L                 |   234 |    251 |    17 |
| Animais que começam com M                 |   440 |    463 |    23 |
| Animais que começam com P                 |   766 |    808 |    42 |
| Animais que começam com S                 |   283 |    293 |    10 |
| Animais que começam com T                 |   366 |    386 |    20 |
