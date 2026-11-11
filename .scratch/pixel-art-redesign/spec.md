# Redesign do portfólio com pixel art

Status: ready-for-human

## Objetivo informado

Refatorar a aparência do portfólio de Andrei Rech com inspiração em https://ohnyfans.com, incorporando pixel art, mais personalidade e interações.

## Estado da discussão

Entrevista realizada com `grill-with-docs`, `grilling` e `domain-modeling`. Direção visual, escopo, navegação, contribuições, caixas, inventário e catálogo foram definidos. O usuário confirmou o entendimento compartilhado e autorizou a implementação.

## Contexto existente

- O portfólio apresenta atuação em iOS e full-stack, projetos, experiência, informações pessoais e contato.
- Há conteúdo em português e inglês.
- A configuração atual exporta um site estático, com workflow de deploy para GitHub Pages. A preferência de idioma já é salva no navegador.
- O código já contém animações de entrada, movimento das letras do nome, cursor personalizado e carrossel de projetos com arraste.
- A especificação anterior está em `.scratch/cowboy-bebop-redesign/spec.md`. O código atual contém a identidade noir, colagem, texturas e efeitos de glitch descritos nela. O usuário confirmou que o novo redesign substitui essa direção visual.
- A leitura textual da referência mostra ferramentas, jogos, soundboard e conteúdo pessoal da comunidade. A captura fornecida pelo usuário mostra títulos em pixel, texto corrido sem serifa, fundo escuro e um gráfico de atividade em blocos. A inspeção visual das demais áreas do site ainda está pendente.

## Decisões confirmadas

- Usar a branch `main` como base da futura refatoração. Na conferência local, a branch ativa já é `main`, no commit `4d9403e`.
- Manter informações importantes explícitas, com acesso independente das interações.
- Oferecer interações opcionais para conhecer mais sobre Andrei ou se divertir. A existência dessas interações não deve impor uma jornada de jogo ao visitante.
- O conjunto da primeira entrega e as regras principais das caixas e do gráfico estão definidos. Os minijogos posteriores precisarão de especificações próprias.
- Redesign visual total, substituindo a identidade noir e de colagem pela direção de interface retrô completa. A linguagem pixel orientará tipografia de destaque, bordas, botões e ilustrações, mantendo navegação convencional e textos confortáveis de ler.
- Entrega dividida em etapas. A primeira inclui o redesign completo, o gráfico de contribuições e as caixas com customizações. Os minijogos ficam para etapas posteriores.
- Na primeira entrega, a abertura de caixas será livre e ilimitada. O visitante poderá abrir quantas quiser, sem precisar concluir atividades ou aguardar reposição.
- As caixas da primeira entrega oferecerão três tipos de customização: paletas de cores do site, cursores em pixel art e companheiros em pixel art que aparecem em um canto e reagem ao clique. O catálogo confirmado tem 12 itens, detalhados abaixo.
- Haverá um inventário para guardar as recompensas. A aplicação dos itens será manual, por escolha do visitante, em vez de automática a cada abertura de caixa.
- O inventário e as customizações aplicadas serão salvos no navegador, sem login ou sincronização entre dispositivos. Retornar pelo mesmo navegador preserva a coleção; limpar os dados do site apaga esse progresso. Outro navegador ou dispositivo terá uma coleção independente.
- As caixas poderão sortear itens repetidos. O inventário mostrará a quantidade obtida de cada item.
- A home apresentará todas as áreas do portfólio, incluindo as experiências interativas. Clicar nos acessos das interações poderá levar a páginas próprias, como na referência inicial. A navbar também oferecerá acesso às áreas interativas. Essa organização não implica renderizar a experiência completa de cada jogo ou do inventário dentro da home.
- O gráfico representará contribuições do GitHub, não apenas commits. O rótulo no site deve refletir essa definição.
- Na primeira entrega, o gráfico mostrará os últimos 12 meses na home. Passar o mouse ou tocar em um dia exibirá sua contagem de contribuições, e haverá um link para o perfil de Andrei no GitHub. Não será incluída uma página própria de histórico por ano nesta etapa.
- O gráfico terá atualização diária automática, conforme a recomendação aceita pelo usuário ao pedir atualização automática. Mostrará quando os dados foram atualizados e manterá os últimos dados reais disponíveis caso uma atualização falhe.
- A aparência padrão seguirá a captura fornecida: fundo carvão, texto claro, títulos em coral e azul vivo nos destaques. Títulos usarão linguagem pixel e textos corridos usarão uma fonte sem serifa legível. As paletas obtidas nas caixas oferecerão outras combinações.
- Andrei será representado por fotografia real, em vez de um retrato em pixel art. A linguagem pixel continuará nos elementos da interface e nas customizações.
- A home apresentará os projetos em uma interface de inspeção inspirada no CS2. Uma lista lateral mostrará nomes e categorias; selecionar um projeto exibirá uma prévia grande, screenshots e um resumo das contribuições de Andrei. Haverá troca de imagem, ampliação de detalhes, acesso à página do projeto e transições curtas em pixel. A adaptação para telas pequenas deve manter os projetos fáceis de encontrar.
- A apresentação dos trabalhos será chamada de Projetos. Inventário continuará designando a coleção de customizações do visitante, evitando confundir trabalhos profissionais com recompensas das caixas.
- O catálogo inicial de companheiros incluirá uma galinha como referência ao CS2, um lobo de fantasia inspirado em The Witcher e um dado D20 animado para representar RPG de mesa. Cada um terá uma reação ao clique.
- A abertura de caixas usará uma roleta horizontal curta, inspirada no CS2, com itens passando por um marcador central e desacelerando até a recompensa. Haverá opção de pular a animação. A recompensa irá para o inventário e a tela do resultado oferecerá a opção de equipá-la.
- As caixas usarão as sete faixas da nova referência fornecida pelo usuário: Consumer Grade em branco; Industrial Grade em azul-claro; Mil-Spec em azul; Restricted em roxo; Classified em rosa; Covert em vermelho; e a faixa especial dourada, identificada na imagem como "★ Facas e luvas". Essa exigência substitui as quatro raridades e a distribuição anterior. Referência local: `docs/references/pixel-art/rarity-reference.png`.
- Os tipos de recompensa confirmados continuam sendo paletas, cursores e companheiros. A referência de raridades não confirma novos tipos de recompensa.
- As chances das sete faixas estão confirmadas: Consumer Grade 35%, Industrial Grade 25%, Mil-Spec 20%, Restricted 10%, Classified 6%, Covert 3% e faixa dourada 1%.

## Etapas confirmadas

### Primeira entrega

- Redesign visual completo do portfólio.
- Gráfico de contribuições do GitHub de Andrei inspirado na referência fornecida.
- Abertura de caixas com raridades e customizações do site.
- Inventário com aplicação manual das customizações obtidas.
- Apresentação de todas as áreas na home, com acessos às interações e navegação pela navbar.
- Apresentação de projetos em uma interface de inspeção inspirada no CS2.

### Etapas posteriores

- Minijogo de música.
- Minijogo de animes obscuros.
- Jogos relacionados a The Witcher e RPG de mesa.
- Possível ligação entre minijogos e recompensas, ainda sem decisão.

A ordem dos minijogos e suas regras ainda não foram decididas. A divisão em etapas não encerra a entrevista nem autoriza iniciar a implementação antes da confirmação de entendimento compartilhado.

## Experiências propostas pelo usuário

- CS2: abertura livre e ilimitada de caixas com as sete faixas de raridade da referência do usuário e recompensas de paletas, cursores e companheiros em pixel art. As recompensas vão para um inventário salvo no navegador e o visitante escolhe quando aplicá-las. Itens repetidos incrementam a quantidade no inventário. As chances e o catálogo estão confirmados nas tabelas abaixo.
- Música: adivinhar músicas de que Andrei gosta, possivelmente selecionadas de uma playlist pessoal do Spotify. Referência: https://playdaily.org/songless. A referência permite reconhecer músicas por trechos que o jogador pode ampliar; não implica adotar suas regras completas. A playlist e a fonte de áudio ainda não foram definidas.
- Anime: desafio de citar animes tão obscuros quanto possível, inspirado em https://playdaily.org/krillion. A referência original pontua respostas incomuns a perguntas abertas; a adaptação proposta pelo usuário é específica de anime. Catálogo, validação e medida de obscuridade ainda não foram definidos.
- Contribuições: visualização das contribuições do GitHub de Andrei nos últimos 12 meses, inspirada na captura do Rejuicer tracker fornecida pelo usuário. Referência local: `docs/references/pixel-art/commit-tracker-reference.png`. Passar o mouse ou tocar em um dia mostra sua contagem; um link leva ao perfil no GitHub. A atualização será diária e automática, com indicação da data e preservação dos últimos dados reais em caso de falha. A forma de obter os dados ainda precisa ser definida na implementação. Referência da métrica: https://docs.github.com/en/account-and-profile/reference/profile-contributions-reference.
- The Witcher: algum jogo relacionado ao universo, para etapa posterior. Mecânica ainda em aberto.
- RPG de mesa: algum jogo relacionado ao interesse de Andrei, para etapa posterior. Sistema, ambientação e mecânica ainda em aberto.

## Catálogo inicial confirmado

O catálogo distribui 12 recompensas nas sete faixas, com quatro paletas, quatro cursores e quatro companheiros. O quarto companheiro é uma variante dourada do D20. O usuário confirmou os itens, sua distribuição e a regra de sorteio.

| Faixa            | Recompensas                                                            |
| ---------------- | ---------------------------------------------------------------------- |
| Consumer Grade   | Paleta Floresta, verde e creme sobre fundo escuro; cursor Seta pixel   |
| Industrial Grade | Paleta Violeta, lilás sobre fundo roxo escuro; cursor Mira             |
| Mil-Spec         | Companheiro Galinha                                                    |
| Restricted       | Paleta Fogueira, âmbar e cobre sobre carvão; cursor Espada             |
| Classified       | Companheiro Lobo de fantasia                                           |
| Covert           | Paleta Aurora, ciano e rosa sobre azul escuro; companheiro D20 animado |
| ★ Facas e luvas  | Cursor Faca dourada; companheiro D20 dourado                           |

O sorteio escolhe primeiro a faixa pelas chances confirmadas e, dentro dela, cada item disponível tem a mesma chance. As chances da tabela seguinte são por faixa, não por item individual.

## Chances confirmadas para as sete faixas

| Faixa            | Cor        | Chance |
| ---------------- | ---------- | ------ |
| Consumer Grade   | Branco     | 35%    |
| Industrial Grade | Azul-claro | 25%    |
| Mil-Spec         | Azul       | 20%    |
| Restricted       | Roxo       | 10%    |
| Classified       | Rosa       | 6%     |
| Covert           | Vermelho   | 3%     |
| ★ Facas e luvas  | Dourado    | 1%     |

São chances próprias do portfólio, sem pretensão de reproduzir probabilidades oficiais do CS2. A distribuição anterior de quatro raridades está superada.

As sugestões não confirmam multiplayer, ranking público, contas de visitante ou uma relação de recompensas entre os jogos.

## Regras complementares aprovadas

Os pontos abaixo foram apresentados na consolidação e aprovados pelo usuário junto do conjunto.

- Preservar os fatos, projetos, experiências, links e conteúdo profissional existentes em português e inglês. A apresentação e a redação das instruções de uso podem mudar para acompanhar a nova interface.
- Organizar a home com apresentação e atuação de Andrei, inspeção de projetos, sobre e experiência, gráfico de contribuições, prévias de caixas e inventário e contato. Manter nome, atuação e acesso a projetos e contato claros desde a apresentação.
- Usar páginas próprias para a experiência completa de caixas e inventário, com prévias e acessos na home e navegação pela navbar. As páginas de detalhes dos projetos também recebem a nova identidade.
- A aparência padrão está disponível desde a primeira visita. O visitante pode voltar a ela ou remover uma customização sem perder os itens colecionados.
- Permitir uma paleta, um cursor e um companheiro equipados por vez. As escolhas se aplicam à home e às demais páginas e persistem ao recarregar.
- Oferecer opção de ocultar o companheiro. Em telas de toque, manter a interação com o companheiro e a coleção de cursores, usando o comportamento de ponteiro apropriado ao dispositivo.
- Respeitar a preferência de movimento reduzido. As interações devem funcionar com teclado e toque, sem depender de hover, arraste ou animações para acessar informação importante. O companheiro não pode bloquear conteúdo ou controles.
- Uma abertura gera uma recompensa. Pular a animação revela o mesmo resultado, sem sortear de novo ou conceder cópias adicionais por cliques repetidos.
- Se o armazenamento do navegador estiver indisponível, permitir o uso durante a sessão e explicar que a coleção não poderá ser salva. Dados locais inválidos não podem impedir a leitura do portfólio.
- Manter a publicação estática existente. Obter os dados reais de contribuições em uma rotina de atualização compatível com essa estrutura, com credenciais apenas no ambiente de automação, caso necessárias. Não incluir dados fictícios no gráfico.
- Caso ainda não exista um conjunto de dados válido de contribuições, mostrar um estado de indisponibilidade e o link para o GitHub. Havendo dados anteriores, preservá-los com a data da última atualização bem-sucedida.
- Sons, contas, sincronização, multiplayer, rankings, moedas e trocas não integram a primeira entrega. Os minijogos posteriores não precisam aparecer como controles sem função.

## Critérios de aceite

- A home e as páginas de projetos usam a nova identidade visual, com foto real e textos legíveis em português e inglês.
- As informações profissionais são acessíveis sem abrir caixas, equipar itens ou usar um minijogo.
- A inspeção de projetos permite selecionar trabalhos, explorar imagens e abrir detalhes em desktop e celular.
- As sete faixas usam os nomes e cores da referência. Suas chances somam 100%, e todo resultado pertence ao catálogo confirmado.
- A roleta permite pular a animação e credita exatamente uma recompensa por abertura. Aberturas são livres e ilimitadas.
- Repetidos incrementam a quantidade do item. Equipar uma customização não consome a coleção.
- Inventário e itens equipados persistem no navegador, sem login. Voltar ao padrão preserva a coleção.
- Os companheiros têm reação ao clique ou toque e podem ser ocultados.
- O gráfico exibe os últimos 12 meses de contribuições, contagem por dia, data de atualização e link para o GitHub.
- A atualização diária automática preserva os últimos dados reais em caso de falha.
- Navegação, projetos, caixas e inventário funcionam com teclado e toque, e a preferência de movimento reduzido é respeitada.
- Verificar build estático, lint e testes pertinentes à alteração. Cobrir com testes as regras de sorteio, contagem de repetidos, persistência e concessão única de recompensa, evitando testes frágeis baseados em frequências aleatórias.

## Fechamento da entrevista

O usuário respondeu "Sim" à confirmação do conjunto, incluindo as regras complementares e os critérios de aceite, e em seguida pediu a aplicação de `issue-to-pr` e de suas skills de design. A entrevista está encerrada e a implementação autorizada.

## Comments

- O usuário esclareceu que deseja informações importantes explícitas e exploração opcional para saber mais sobre ele ou se divertir. Também determinou que a refatoração deve partir da `main`.
- O usuário escolheu a direção de interface retrô completa e confirmou que deseja um redesign total.
- O usuário propôs referências pessoais de CS2, música, anime, The Witcher e RPG de mesa, além de um gráfico com seus commits.
- O usuário aceitou a recomendação de dividir a entrega em etapas, começando pelo redesign, gráfico de commits e caixas com customizações.
- O usuário escolheu abertura livre e ilimitada de caixas na primeira entrega.
- O usuário aceitou os três tipos de recompensa recomendados: paletas, cursores e companheiros em pixel art.
- O usuário escolheu ter um inventário, aceitando a recomendação de aplicação manual dos itens.
- O usuário escolheu salvar o inventário no navegador, sem contas ou sincronização entre dispositivos.
- O usuário aceitou itens repetidos, exibidos com quantidade no inventário.
- O usuário definiu que todas as áreas devem aparecer na home, com possibilidade de abrir páginas próprias ao clicar e acesso às áreas interativas pela navbar.
- O usuário escolheu contribuições como métrica do gráfico do GitHub.
- O usuário aceitou a paleta padrão inspirada na captura: carvão, texto claro, títulos em coral e destaques azuis, com títulos em pixel e texto corrido sem serifa.
- O usuário escolheu usar fotografia real para sua representação no portfólio.
- Ao discutir alternativas à grade e ao carrossel, o usuário escolheu a inspeção de projetos inspirada no CS2. As alternativas de desktop retrô e mapa da trajetória não foram escolhidas.
- O usuário aceitou a recomendação de mostrar os últimos 12 meses de contribuições na home, com contagem por dia e link para o GitHub.
- O usuário aceitou o trio inicial de companheiros: galinha, lobo de fantasia e D20 animado.
- O usuário escolheu a roleta para a abertura das caixas.
- O usuário aceitou a distribuição de raridades proposta: Comum 60%, Raro 25%, Épico 12% e Lendário 3%.
- Ao ser apresentada a recomendação de atualização diária automática das contribuições, o usuário confirmou que deseja atualização automática. A proposta diária foi mantida e explicitada na resposta seguinte.
- Ao revisar o catálogo proposto, o usuário exigiu as sete faixas de raridade da imagem fornecida, substituindo os quatro níveis e suas chances anteriormente aceitos. O catálogo de 12 itens apresentado não foi confirmado.
- O usuário confirmou as chances propostas para as sete faixas: 35%, 25%, 20%, 10%, 6%, 3% e 1%, respectivamente.
- O usuário confirmou o catálogo revisado de 12 itens e a escolha equiprovável dos itens dentro da faixa sorteada.
- A especificação foi consolidada para revisão final. Nenhum arquivo de implementação foi alterado durante a entrevista.

- O usuário confirmou o entendimento compartilhado do conjunto e pediu a execução com `issue-to-pr`, incluindo as skills de design.

- Primeira entrega implementada e revisada, com evidências em `docs/evidence/pixel-art/validation.md`. Minijogos posteriores permanecem fora desta entrega.
