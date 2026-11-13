# Bancos locais dos jogos

Todos os jogos usam apenas arquivos do projeto durante a partida. Nenhuma validação, sugestão ou pontuação faz requisições externas. Atualizar uma fonte é uma tarefa manual; revisar o diff antes de publicar o novo instantâneo.

## Fontes consultadas em 12/11/2026

- **Termo:** [fserb/pt-br](https://github.com/fserb/pt-br), licença MIT. Léxico, conjugações e índice de frequência do corpus. `npm run refresh:words` gera `src/features/games/termo/data/words.json`. O limite das respostas diárias passou de 900 para 1.800; o dicionário de tentativas também aceita conjugações e plurais. Os filtros mantêm nomes próprios, abreviações e palavras inadequadas fora das respostas diárias.
- **Países:** [API de localidades do IBGE](https://servicodados.ibge.gov.br/api/docs/localidades), endpoint `/api/v1/localidades/paises`. Instantâneo com 193 entradas, complementado com Vaticano, Palestina e outros nomes de uso corrente. A categoria mantém Inglaterra por compatibilidade e também aceita Reino Unido; inclui Taiwan e Kosovo. Nomes oficiais e usuais do mesmo país são aliases com a mesma pontuação.
- **Animais:** [API do iNaturalist](https://api.inaturalist.org/v1/docs/), endpoint `/v1/taxa`. Foram consultadas as primeiras 10.000 espécies ativas de Animalia, ordenadas pela quantidade de observações. O instantâneo retém 3.902 espécies com ao menos um nome válido em português, seus nomes científicos, identificação e grupo taxonômico. Só importa nomes declarados em português pela fonte, sem usar o nome inglês que a API pode devolver como fallback. Não importa imagens nem observações de usuários. A quantidade de observações serve somente para ordenar a coleta, nunca como estatística de popularidade de respostas.
- **Pokémon:** [PokéAPI](https://pokeapi.co/docs/v2#pokemon-species), `/api/v2/pokemon-species?limit=2000`. Instantâneo com 1.025 espécies, sem contar formas alternativas como espécies diferentes. Os nomes usados em português coincidem com a grafia internacional dessas espécies; aliases corrigem pontuação, gênero de Nidoran e nomes especiais.
- **Elementos químicos:** lista finita de 118 elementos, com nomes em português e variantes ortográficas. Referência para identidade e quantidade: [tabela da IUPAC](https://iupac.org/what-we-do/periodic-table-of-elements/).
- **Demais temas de Raridade:** banco editorial existente e `supplemental.ts`, com nomes regionais, compostos e variantes. Categorias abertas, como profissões, objetos, comidas e personagens, continuam sendo listas extensíveis. Não há promessa de cobertura universal.
- **Conexo e palavra cruzada:** conteúdo editorial próprio. As novas pistas de cruzada ficam em `crossword/data/challenging.ts`; as pistas introdutórias são preservadas em `clues.ts` como referência, sem participar da seleção diária atual.

`npm run refresh:rarity` atualiza países, animais e Pokémon em `rarity/data/external.json`. Faz requisições com timeout, tentativas limitadas e intervalo entre páginas. Só substitui o arquivo depois de validar todas as fontes, sem escrever um instantâneo parcial. A fonte é um ponto de partida: nomes populares podem variar regionalmente ou designar espécies diferentes. Os aliases são unificados antes da partida para evitar pontuações diferentes para a mesma resposta.

## Pontuação de Raridade

A pontuação é uma estimativa editorial de quão espontaneamente uma pessoa lembraria da resposta em português brasileiro. Não representa porcentagem de jogadores, abundância de uma espécie, tamanho de um país ou frequência observada de respostas.

- 1–3: respostas familiares e muito lembradas.
- 4–6: respostas conhecidas, mas menos imediatas.
- 7–9: respostas incomuns ou específicas.
- 10: conhecimento especializado.

Os antigos valores altos foram reduzidos para reservar o topo a respostas especializadas. Nomes de espécies importados recebem inicialmente 8 ou 9 conforme a especificidade do nome; respostas familiares já revisadas conservam sua pontuação editorial. Novos Pokémon começam em 7 e novos países em 8, com revisão dos países mais familiares. Elementos ainda não presentes começam em 9. Esses valores são critérios editoriais iniciais, sujeitos a revisão; uma pontuação empiricamente calibrada exigiria coleta real de respostas, ausente deste aplicativo.

As sugestões usam somente os aliases da categoria local, por prefixo e distância de edição, com apenas uma opção. Escolher uma sugestão preenche o campo; pressionar Enter confirma a rodada usando a sugestão exibida. A lista de respostas mais raras não é exibida após um chute. Acentos, espaços e pontuação são normalizados; C++, C# e o gênero de Nidoran permanecem distintos.

## Progresso e regras

A ampliação das respostas do Termo e a nova seleção de cruzadas mudam a solução diária. Os saves desses dois jogos usam a versão `v2` para não restaurar vitórias ou grades incompatíveis. O Conexo já descarta saves cujas palavras não correspondem ao novo desafio. Sudoku preserva saves antigos, inicializando contadores ausentes com zero.

Cada dificuldade do sudoku tem três vidas e até três dicas por partida. Um novo número errado consome uma vida; apagar e anotar não consomem. A dica resolve a casa selecionada, se necessário, ou outra ainda incorreta, e protege a casa preenchida. Os contadores são salvos por dificuldade. A terceira falha encerra aquela partida. O sudoku atual é infinito; novas partidas renovam os recursos e os melhores tempos de vitória ficam salvos por dificuldade.

## Histórico dos jogos diários

`daily-history:v1` guarda um resultado final por data e jogo, com o Termo separado por modo. Os resultados anteriores do sudoku diário permanecem separados em Fácil, Normal e Difícil, mas as partidas do sudoku infinito não entram nesse histórico. O histórico é independente dos saves temporários que a mudança de dia descarta. Não há sincronização de conta: os registros pertencem a este navegador e começam com os resultados observados a partir desta atualização. Uma partida já salva e concluída também é registrada quando seu jogo é aberto. Dias antigos cujo progresso já foi apagado não podem ser reconstruídos.

A taxa de vitória usa vitórias divididas por partidas encerradas. Partidas em andamento não entram no cálculo. No Termo, vale o resultado de cada modo; no Conexo e na cruzada, resolver sem revelar vence. A cruzada exige conferir a resposta final após preencher a grade. No Raridade, responder a todos os cinco temas sem pular vence; pular qualquer tema encerra o dia como derrota no histórico, preservando os pontos obtidos. Cores e Escala exigem média mínima de 70/100. Reabrir ou recarregar uma partida não duplica o resultado. Um dia completo no calendário exige resultados nos seis jogos diários, contando qualquer modo do Termo uma só vez.

As celebrações do Raridade usam animações finitas de transformação e opacidade. A quantidade de pixels cresce de forma quadrática com os pontos, de 14 a 212 partículas, com ondas mais longas e cores mais intensas nas faixas superiores. Elas não capturam cliques, são removidas após seis segundos ou ao avançar a rodada e ficam desativadas quando o navegador solicita movimento reduzido.


## Modos do Termo e tempo do Raridade

O Clássico preserva o save `termo-v2`. Dueto, Quarteto, Contagem, Fixas, Entre e Mentiroso têm saves separados e estatísticas próprias. Dueto e Quarteto compartilham cada chute entre duas ou quatro soluções distintas e deixam de preencher os tabuleiros já resolvidos. As cores do teclado mostram cada tabuleiro separadamente. Contagem nunca revela a posição das cores nem usa as marcações verdadeiras no teclado; as cores nas letras são apenas anotações clicáveis do jogador, salvas ao recarregar. Fixas exige cada letra verde nas tentativas seguintes, tanto na interface quanto na validação.

Entre usa a ordem das grafias normalizadas do dicionário local completo. Os extremos iniciais são AAAAA/ZZZZZ, com indicação de 50%. Chutes válidos fora do intervalo são aceitos, mas somente palavras mais próximas da resposta substituem os limites. As distâncias são porcentagens do dicionário completo, exibidas com duas casas decimais, e o ponto marca a posição relativa da resposta no intervalo. Nenhum prefixo é preenchido ou protegido. A tela mostra somente os melhores limites, sem lista de tentativas. O jogo foi inspirado em [Betweenle](https://betweenle.com/), com essas adaptações. Contagem segue a ideia de feedback agregado da referência [Word500](https://www.word500.com/), com as cores adaptadas ao pedido.

Mentiroso altera exatamente uma das cinco marcações verdadeiras para outra cor em cada chute errado, com sorteio determinístico por data e tentativa. O teclado permanece neutro. Uma resposta exata vence com todas as letras verdes. Compartilhamentos de Contagem contêm apenas totais; os de Mentiroso usam as cores exibidas.

Raridade usa o save `rarity-timed-v1`, independente da versão anterior sem relógio. O botão Começar inicia o primeiro prazo de vinte segundos. Responder ou pular pausa o jogo até avançar, quando começa outro prazo. Um prazo absoluto salvo no navegador impede reiniciar os vinte segundos ao recarregar; expirar marca uma única pergunta como zero, inclusive se o usuário estava em outra aba. O histórico anterior é preservado.
