# Expansão de cultura e conhecimentos gerais do Raridade

O banco passa de 122 para 142 categorias, somando 26.099 respostas por categoria. O total anterior era 20.216. Uma resposta válida em vários temas aparece na contagem de cada um; aliases não são contados como respostas diferentes.

| Categoria | Antes | Depois |
| --- | ---: | ---: |
| Animais | 4206 | 4464 |
| Bandas de rock | 98 | 127 |
| Dinossauros | 64 | 299 |
| Jogadores de futebol | 94 | 536 |
| Filmes | 506 | 597 |
| Mitologia nórdica | 0 | 81 |
| Mitologia romana | 0 | 79 |
| Mitologia egípcia | 0 | 66 |
| Mitologia japonesa | 0 | 59 |
| Comidas azedas | 0 | 45 |
| Comidas amargas | 0 | 28 |
| Comidas apimentadas | 0 | 40 |
| Famílias dos Pokémon iniciais | 0 | 93 |
| Bandas que ganharam Grammy | 0 | 54 |
| Filmes premiados pelo Oscar | 0 | 136 |
| Animais que começam com A | 0 | 433 |
| Animais que começam com B | 0 | 404 |
| Animais que começam com C | 0 | 715 |
| Animais que começam com F | 0 | 141 |
| Animais que começam com G | 0 | 365 |
| Animais que começam com L | 0 | 234 |
| Animais que começam com M | 0 | 440 |
| Animais que começam com P | 0 | 766 |
| Animais que começam com S | 0 | 283 |
| Animais que começam com T | 0 | 366 |

## Escopo e critérios

- Futebol inclui jogadores e jogadoras, atuais e históricos, sem depender de time ou situação contratual. Nomes completos, apelidos conhecidos e grafias alternativas se unem quando identificam a mesma pessoa. Falcão e Radamel Falcao, Gérson e Gerson Santos da Silva, Müller e Thomas Müller continuam respostas distintas.
- Os 27 iniciais das nove gerações, Pikachu e Eevee já estavam no banco. A categoria Pokémon iniciais conserva essas 29 espécies. A nova categoria Famílias dos Pokémon iniciais reúne 93 espécies: os trios e suas evoluções, mais a família de Pikachu e as evoluções de Eevee. Inclui Pichu. São famílias de espécies, sem afirmar que os parceiros especiais de Let's Go podem evoluir. Formas regionais e megavoluções não contam como espécies adicionais.
- Dinossauros recebe gêneros e nomes populares em português, com nomes científicos como aliases quando conhecidos. Há gêneros históricos e de classificação discutida; o banco não é uma revisão taxonômica. Pterodáctilo, Mosassauro e Plesiossauro saem de Dinossauros e continuam em Animais. Indominus, fictício, sai também de Animais. Argentinossauro e Argentinosauro são consolidados como grafias da mesma resposta.
- As novas mitologias são nórdica, romana, egípcia e japonesa. Aceitam divindades, personagens, criaturas, objetos, lugares e conceitos tradicionais. Não incluem interpretações exclusivas de filmes ou jogos como se fossem tradições antigas.
- Comidas azedas inclui frutas ácidas, conservas e preparações reconhecidas pelo sabor azedo; comidas amargas e apimentadas recebem listas próprias. O sabor de um preparo pode variar conforme a receita.
- Animais por letra usa nomes em português e suas variantes conhecidas, sem trazer nomes científicos do instantâneo de animais apenas porque começam com a letra. Os aliases de outra inicial são removidos daquele tema: C aceita Chita; G aceita Guepardo. Os nomes exibidos respeitam a letra. Cada pergunta tem ao menos vinte respostas e conserva a escala editorial de pontos, com uma resposta familiar valendo um ponto.
- Bandas que ganharam Grammy exige ao menos uma vitória competitiva do Grammy principal, não apenas indicação, Latin Grammy ou prêmio honorário. A lista inclui bandas de rock e o duo eletrônico Daft Punk.
- Filmes premiados pelo Oscar inclui títulos com vitória competitiva em qualquer categoria, inclusive técnicas, atuação, animação e filme internacional. Não exige Melhor Filme. Indicados sem vitória, como Cidade de Deus, ficam fora desta categoria. Cada título também é aceito em Filmes.

## Fontes e manutenção

As novas listas editoriais estão em [culture.ts](../../src/features/games/rarity/data/culture.ts). [awards.json](../../src/features/games/rarity/data/awards.json) registra o ano e uma obra vencedora por banda; para filmes, registra o ano da cerimônia, o título em inglês, a categoria vencedora e o link oficial. Não há chamadas externas durante as partidas, nem afirmação de cobertura exaustiva dos prêmios.

Referências de conferência:

- Mitologias: [religião romana no English Heritage](https://www.english-heritage.org.uk/learn/story-of-england/romans/religion), [deuses egípcios no Australian Museum](https://australian.museum/learn/cultures/international-collection/ancient-egyptian/religion-and-gods-in-ancient-egypt/), [deuses nórdicos no Gresham College](https://www.gresham.ac.uk/watch-now/viking-gods) e [Susanoo na Encyclopedia of Shinto da Kokugakuin](https://d-museum.kokugakuin.ac.jp/eos/detail/?id=9152).

- [Diretório de dinossauros do Natural History Museum](https://www.nhm.ac.uk/discover/dino-directory/name/name-az-all/gallery.html) e [definição de dinossauro pelo Natural History Museum de Los Angeles](https://nhm.org/learning-resource/what-dinosaur).
- [Comunicado oficial de Pokémon Let's Go](https://press.pokemon.com/en-NZ/New-Information-Revealed-for-Pokemon-Lets-Go-Pikachu-and-Pokemon-Lets-) e [iniciais no site oficial de Legends Z-A](https://www.pokemon.co.jp/ex/legends_z-a/ja/pokemon/250227_01/).
- Recording Academy: [Metallica](https://www.grammy.com/artists/metallica/10686/), [Foo Fighters](https://www.grammy.com/artists/foo-fighters/14694/), [Nirvana](https://www.grammy.com/artists/nirvana/8026/), [Coldplay](https://www.grammy.com/artists/coldplay/10952/), [Muse](https://www.grammy.com/artists/muse/13100/) e [Paramore em 2024](https://www.grammy.com/awards/categories/best-rock-album/2024/). As demais referências ficam associadas às entradas por cerimônia.
- Academia de cinema: [Oscar 2000](https://www.oscars.org/oscars/ceremonies/2000), [2023](https://www.oscars.org/oscars/ceremonies/2023), [2024](https://www.oscars.org/oscars/ceremonies/2024) e [2025](https://www.oscars.org/oscars/ceremonies/2025). Cada entrada no JSON aponta para sua própria cerimônia.

## Validação e progresso

Os testes cobrem todos os 29 iniciais, a presença das 93 espécies das famílias no banco geral de Pokémon, nomes por letra, identidades de jogadores, aliases de dinossauros, exclusões taxonômicas, metadados dos prêmios e exemplos de vencedores e apenas indicados. A validação estrutural não substitui revisão factual.

A mudança no conjunto de categorias altera o sorteio diário. O progresso temporário passa a rarity-timed-v3; partidas temporárias antigas começam novamente, e o histórico de resultados permanece independente e preservado.
