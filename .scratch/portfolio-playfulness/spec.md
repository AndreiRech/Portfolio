# Portfólio mais vivo e jogo de memória

Base de revisão: `e446f2afede28d1bd7dac408a1812c8d9c7a69c1`. Branch: `feature/portfolio-playfulness`. PR dependente de #2, com base `feature/pixel-interactions`.

## Aceite

- Companheiros ativos começam passeando, com a arte orientada no sentido do deslocamento. O menu começa recolhido e oferece as ações existentes.
- Descansar e ocultar levam o companheiro de volta ao seu espaço com deslocamento visível. Buscar um pixel retorna e retoma o passeio. Abrir ou fechar o menu não interrompe o passeio.
- Movimento reduzido mantém as ações no lugar, inclusive ao mudar a preferência durante busca ou retorno. Respeitar pausa, ocultação, teclado, resize e limites de tela.
- Remover os cinco sinais e a conjuração. Substituir o painel por um jogo de memória de quatro cores numeradas, com reprodução, entrada na ordem, progressão, erro, reinício e recorde da sessão. O medalhão permanece como companheiro colecionável, sem conjurar sinais.
- Hero sem fotografia, com projetos reais em destaque e microinterações de seleção, hover, foco e clique. Manter informações profissionais acessíveis sem jogar.
- Microinterações adicionais em navegação, projetos e ações, com cancelamento de animações e respeito a movimento reduzido.
- Calendário de contribuições com faixas absolutas 0, 1-5, 6-15, 16-40 e 41+, independentes dos picos. Mostrar os intervalos da legenda e preservar totais e datas reais.
- Português e inglês, desktop 1440 px, mobile 390 e 320 px, testes de regressão, lint, build estático, revisão e evidências da aplicação renderizada.

## Referência

[OhnyFans](https://ohnyfans.com), capturado e inspecionado em 11/11/2026, desktop 1440 × 1000 e mobile 390 × 844. Hero assimétrico com tipografia pixel de alto contraste, um objeto interativo grande, respostas táteis nos botões e detalhes que convidam à exploração. O café reage ao clique. Aplicar esses padrões aos projetos e companheiros originais, sem copiar conteúdo ou artes da referência. Preservar os tokens carvão/coral e a tipografia do portfólio. Intensidade de movimento 6, densidade 5.

## Diagnóstico e validação

A reprodução no navegador retornou `defaultWalks: false`, `chickenWalksBackwards: true` e um dia de 23 contribuições com `data-level=1`. A arte da galinha está voltada para a esquerda; o transform deve refletir isso. O repouso anterior troca a posição e oculta o sprite imediatamente. O calendário usa faixas relativas fornecidas pelo GitHub.

O jogo usa somente estado da sessão. Inventário continua com IDs de catálogo e sem informações sensíveis, ASVS 14.3.3. Não alterar dependências, comunicação de rede, autenticação ou dados profissionais. Reutilizar testes existentes e revisar o diff por exposição de dados. Scanners ausentes não serão declarados aprovados.
