# Validação do portfólio e das interações

Data: 11/11/2026. Branch `feature/portfolio-playfulness`, base de revisão `e446f2afede28d1bd7dac408a1812c8d9c7a69c1`, dependente do PR #2 com base `feature/pixel-interactions`. [Especificação](../../../.scratch/portfolio-playfulness/spec.md).

## Resultado

| Critério | Evidência observada |
| --- | --- |
| Orientação | Galinha voltada para a esquerda na arte original. Escala positiva ao caminhar para a esquerda e negativa ao caminhar para a direita. D20 e medalhão não espelham a arte; os dados giram conforme o deslocamento. |
| Retorno | Descansar e ocultar iniciam o estado `return`. O sprite continua visível até chegar ao painel. No teste do navegador, percorreu aproximadamente 18 px em 120 ms; só depois de chegar foi recolhido. |
| Passeio e menu | Os quatro companheiros iniciaram em `roam`, com menu recolhido. Abrir e fechar o menu, inclusive com Enter e Escape, manteve o passeio. O sprite é decorativo e deixa cliques passarem para o conteúdo; suas ações ficam no menu fixo. Buscar um pixel creditou uma unidade, retornou ao painel e retomou o passeio. |
| Memória | Sinais e conjuração removidos. Quatro cores numeradas, reprodução, entrada bloqueada durante demonstração, sequência acumulada, acerto, erro, reinício, replay e recorde da sessão. Duas rodadas concluídas, primeira com teclado real e segunda com cliques. Replay validado no mobile em português. |
| Hero e microinterações | Fotografia removida. Projetos reais selecionáveis com prévia e link, atalho para a galinha e para o jogo. Conferidos hover, foco, seleção e respostas de clique. Revelações de seções usam IntersectionObserver/WAAPI e não ocultam conteúdo quando JavaScript está ausente. |
| Contribuições | Dados originais preservados. Cinco faixas absolutas e legenda numérica. Dias entre 20 e 29 contribuições apresentaram nível 3, mesmo com dias de centenas de contribuições. |
| Movimento reduzido | Ativado antes das ações e durante uma busca. A busca terminou uma vez, recolheu o sprite e deixou zero animações em execução. Passear/seguir desativados, reações e busca continuam no lugar. O status inicial informa descanso. |
| Inventário | Experimentar e ocultar as quatro prévias não mudou o valor persistido do inventário. Um teste com armazenamento em memória confirma que ocultar um companheiro equipado mantém as duas unidades após recarregar o store. |

Português e inglês conferidos. Viewports 1440 × 1000, 1024 × 900, 390 × 844 e 320 × 844 sem overflow horizontal. Nome, número e cor dos botões do jogo permanecem legíveis no mobile. O menu dos companheiros tem altura limitada e rolagem própria para telas menores. A gravação mostra as transições; os prints isolados não são usados como prova de movimento.

## Checks executados

| Check | Resultado |
| --- | --- |
| `npm test` | 25 testes passaram, incluindo orientação, limites/deslocamento, sequência e transições do jogo, faixas do calendário, inventário e migração. |
| `npm run lint` | Passou sem avisos. |
| `npx tsc --noEmit` | Passou durante implementação; o build final também executou TypeScript. |
| `npm run build` | Passou com Turbopack e exportação estática de todas as 11 páginas. |
| `git diff --check` | Passou. |
| Axe 4.12.1 | Zero violações no Hero, playground e controles. Playground teve dois elementos decorativos de estrelas com contraste inconclusivo, revisados visualmente. Hero e controles não tiveram verificações inconclusivas. |
| Console e page errors | Vazios após limpar a sessão e percorrer os fluxos da exportação. |
| Lighthouse 13.6.0 | Sessão isolada, perfil mobile com throttling simulado: desempenho 78, acessibilidade 100, boas práticas 100 e SEO 100. FCP 1,4 s, LCP 6,1 s, CLS 0, TBT 80 ms. |

Os avisos `MODULE_TYPELESS_PACKAGE_JSON` e `module.register()` já existiam no runtime e não impediram os checks. Não foram alteradas dependências ou CI. O workflow remoto só dispara para PRs com base `main`; este PR dependente usa os mesmos gates executados localmente.

### Limites da validação

O LCP móvel simulado de 6,1 s ainda supera a meta de 2,5 s. O servidor HTTP local não habilita compressão nem cache persistente, e esta medição não comprova desempenho em produção. As miniaturas dos cinco logos reduziram cerca de 1,8 MiB de transferência na home; os originais permanecem no repositório. O resumo da medição está em [lighthouse-summary.json](lighthouse-summary.json).

Uma primeira execução de QA mobile concorreu com o Lighthouse no mesmo navegador e perdeu o estado do jogo. Ela não foi considerada aprovada. Os fluxos foram repetidos isoladamente com sucesso; a medição final usou outro navegador sem idioma ou coleção salvos.

A revisão automática rejeitou um roteiro que sobrescreveria e apagaria o inventário persistido sem restaurá-lo. Esse roteiro não executou. A alternativa aprovada usa somente leitura do inventário nas prévias do navegador e armazenamento em memória no teste de ocultação. Nenhuma coleção do usuário foi sobrescrita.

## Segurança

O jogo mantém somente estado React na sessão atual. Sem novas requisições externas, autenticação, entradas HTML, dependências ou segredos. O inventário continua limitado a itens públicos de catálogo, conforme ASVS 14.3.3. Os testes existentes de dados inválidos, quantidades, ownership e migração passaram. SAST, SCA e scanner de segredos adicionais não foram executados e não são declarados aprovados; não são gates deste repositório para esta mudança. O diff foi revisado por exposição de dados e mudanças de rede.

## Standards

Revisão paralela conforme `code-review`. Zero violações documentadas. Dois julgamentos iniciais foram corrigidos: metadados repetidos de ações foram centralizados e a legenda do calendário recebeu papel de grupo acessível. Reavaliação sem achados. O delta final de status em movimento reduzido, teste com armazenamento em memória e sprite sem captura de cliques foi reavaliado pelos dois revisores, sem novos achados.

## Spec

Revisão paralela contra a especificação local, sem lacunas de aceite ou escopo adicional indevido. O delta de acessibilidade, orientação dos dados e otimização dos logos foi reavaliado sem regressões. Resultado final: 0 achados de padrões; 0 lacunas de especificação.

## Evidências

| Arquivo | Estado e viewport |
| --- | --- |
| [before-desktop.png](before-desktop.png) | Captura inicial da home, 1440 px. A fotografia ainda estava carregando nessa captura. |
| [home-desktop.png](home-desktop.png) | Hero final sem fotografia, português, 1440 px. |
| [home-mobile.png](home-mobile.png) | Hero em português, 390 px. |
| [companion-controls-desktop.png](companion-controls-desktop.png) | Seleção de Cerne, galinha passeando e menu aberto, 1440 px. |
| [playground-desktop.png](playground-desktop.png) | Jogo de memória e seleção de D20, 1440 px. |
| [memory-success-desktop.png](memory-success-desktop.png) | Rodada acertada pelo teclado, inglês. |
| [memory-mobile.png](memory-mobile.png) | Entrada da sequência e replay em português, 390 px. |
| [playground-320.png](playground-320.png) | Cores, números e ações em 320 px. |
| [d20-mobile.png](d20-mobile.png) | Resultado do D20 no menu, 390 px. |
| [reduced-motion-mobile.png](reduced-motion-mobile.png) | Ações no lugar, movimento desativado e pixel coletado, 390 px. |
| [contributions-desktop.png](contributions-desktop.png) | Cinco intensidades de contribuição e legenda, 1440 px. |
| [interactions.webm](interactions.webm) | Seleção e hover no Hero, passeio, retorno e jogo por teclado/cliques. |
| [interactions.contact-sheet.png](interactions.contact-sheet.png) | Resumo de frames da gravação. Os retângulos vermelhos são anotações de diferença da ferramenta e não pertencem à interface. |

Todas as capturas foram abertas e inspecionadas. Não foram usados mockups ou imagens geradas como evidência de implementação.

## Ambiente manual

- Desenvolvimento: http://127.0.0.1:3001
- Exportação validada: http://127.0.0.1:3002
- Dados profissionais e calendário existentes no repositório; inventário por navegador e recorde do jogo apenas na sessão do componente. Nenhuma credencial necessária.
- Aplicações e abas de teste mantidas abertas. Não houve merge, release ou deploy.
