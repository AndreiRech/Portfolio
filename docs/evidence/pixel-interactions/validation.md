# Validação das interações em pixel

Base de revisão: `89096e6b92edab39346dedf6d0bada0f712b7a89`. Branch: `feature/pixel-interactions`. PR depende do redesign no PR #1 e tem como base `feature/pixel-art-redesign`.

## Checks

| Check | Resultado |
| --- | --- |
| `npm test` | 18 testes passaram. Novos casos cobrem migração lobo/medalhão, combinação e limite das quantidades, rejeição de dados inválidos, conservação do equipamento, limites em desktop/mobile/landscape e deslocamento sem ultrapassar o alvo. |
| `npm run lint` | Passou, sem avisos. |
| `npm run build` | Passou com Turbopack, TypeScript e exportação estática de todas as rotas. A primeira tentativa dentro do sandbox falhou ao abrir uma porta interna; o cache dessa tentativa foi removido antes da execução com permissão de rede/processos. |
| `npm run build -- --webpack` | Também passou durante a validação, antes dos últimos ajustes de repouso. O build padrão foi repetido após esses ajustes. |
| `git diff --check` | Passou. |
| Axe 4.12.1 | Zero violações no playground e nos controles dos companheiros. Uma regra de contraste inconclusiva por escopo: símbolos decorativos/fundo com pseudo-elemento no playground e detecção de sobreposição no painel fixo. Conferência visual confirmou textos claros sobre fundo opaco e ausência de texto cortado nos estados capturados. Um contraste insuficiente no hover selecionado foi corrigido antes da captura final. |

Os avisos `MODULE_TYPELESS_PACKAGE_JSON` nos testes e `module.register()` no build vêm do runtime Node e não impediram as verificações. Não foram alteradas dependências ou configurações de CI. SAST, SCA e scan de segredos não foram executados nesta tarefa; não são declarados aprovados.

## Fluxos observados na exportação estática

- Desktop 1440 × 1000, mobile 390 × 844 e largura de 320 px, sem overflow horizontal. O painel permite rolagem até o rodapé, que fica acima dos controles. Em repouso o sprite fica no painel e não cobre botões do conteúdo.
- Seleção dos cinco sinais com efeitos diferentes. Botão de conjuração acionado com foco e Enter. Nome e resultado disponíveis em região de status.
- Galinha passeando e seguindo o ponteiro com deslocamento observado em frames sucessivos, busca concluída com um pixel creditado, carinho, descanso e ocultação. Movimentos usam transform e refs, sem renderizações React a cada frame.
- D20 com resultado de 1 a 20 anunciado e desenhado; medalhão conjura Quen. Seleção dos quatro companheiros no campo de treino.
- Preferência de movimento reduzido ativada antes da ação e durante uma busca. A busca em andamento conclui uma vez, remove o alvo e recolhe o pet ao painel. Estado final sem animações em execução. Passear e seguir ficam desativados com explicação visível; ações permanecem utilizáveis.
- Coleção de QA legada com `wolf: 3`, galinha e D20. O inventário mostrou três medalhões, manteve o equipamento e não fez requisições à arte removida. Equipar a galinha normalizou a coleção persistida; recarregar restaurou esse equipamento.
- Experiência temporária sem concessão de item ou gravação da prévia no inventário. Navegação SPA ao inventário e equipamento de um item encerraram a prévia.
- Idioma inglês e português verificados nos controles e no playground. Sem erros de página reportados pelo navegador.

Dados de QA foram preparados apenas no navegador isolado, na origem local da exportação. A coleção dos visitantes e os dados profissionais não foram alterados. Nenhuma credencial é necessária.

## Standards

Revisão paralela conforme `code-review`: zero violações documentadas e zero achados substanciais de manutenção.

## Spec

Revisão paralela: inicialmente sugeriu tratar a mudança de preferência de movimento durante a busca. Corrigido e reavaliado sem pendências. A revisão visual adicional encontrou o sprite em repouso sobre um botão do conteúdo; o sprite agora se recolhe ao painel e mantém sua ação acessível nele. Reavaliação sem lacunas de aceite.

Total final: 0 achados de padrões; 0 lacunas de especificação.

## Evidências

| Arquivo | Estado |
| --- | --- |
| [before-desktop.png](before-desktop.png) | Referência da aplicação antes das alterações |
| [home-desktop.png](home-desktop.png) | Detalhes adicionais em pixel na home, inglês |
| [playground-desktop.png](playground-desktop.png) | Sinais e seleção de companheiros, português |
| [playground-mobile.png](playground-mobile.png) | Sinais em 390 px |
| [pet-controls-desktop.png](pet-controls-desktop.png) | Busca concluída e controles da galinha |
| [d20-desktop.png](d20-desktop.png) | Resultado de rolagem do D20 |
| [medallion-mobile.png](medallion-mobile.png) | Medalhão em modo de visita |
| [migrated-inventory-mobile.png](migrated-inventory-mobile.png) | Equipamento migrado e sprite recolhido no painel |
| [reduced-motion-mobile.png](reduced-motion-mobile.png) | Busca concluída com movimento reduzido |
| [signs-and-companions.webm](signs-and-companions.webm) | Cinco sinais por teclado, passeio, seguir, busca e D20 |

Capturas e gravação vêm da aplicação renderizada. O medalhão em `public/collectibles/companions/medallion.svg` é uma ilustração vetorial original construída em blocos, com aro e cabeça metálica; substitui o animal do catálogo. As referências históricas do redesign anterior continuam documentadas separadamente.

## Ambiente manual

- Desenvolvimento: http://127.0.0.1:3001
- Exportação estática: http://127.0.0.1:3002/#playground
- Servidores e aba de teste mantidos abertos. Dados profissionais e contribuições existentes; inventário local por navegador. Sem credenciais.
