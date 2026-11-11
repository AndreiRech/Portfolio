# Validação do redesign pixel

Base de comparação: `4d9403efecc80adf6392d69e96e70f059e1e9ccc`, branch `main`.

## Checks executados

| Check | Resultado |
| --- | --- |
| `npm test` | 15 testes passaram. Incluem limites de raridade, alcance de todos os itens, concessão única, repetidos, propriedade para equipar, leitura inválida, persistência, armazenamento bloqueado, parsing do calendário, ano bissexto e recuperação da rotina diária. |
| `npm run lint` | Passou. Uma aspa JSX já existente nos dados de Clairfy foi escapada, preservando o texto. |
| `npm run build` | Passou com Next 16.4.6. Exportação estática da home, caixas, inventário e cinco páginas de projetos. |
| `npm run refresh:contributions` | Consulta pública real atualizou 365 dias. Parâmetros de intervalo foram removidos porque faziam o GitHub devolver um ano civil; o parser filtra os últimos 12 meses do calendário móvel. |
| `npm audit --omit=dev --json` | Zero avisos de produção após atualização do Next e das transitivas compatíveis. |
| `npm audit --json` | Restam sete avisos moderados de desenvolvimento na cadeia de `typescript-eslint` e `minimatch`. Nenhum alto ou crítico. Não foi forçada atualização de major. |
| Gitleaks 8.30.1 | Zero achados no diff atual, 49 arquivos de texto, sem histórico ou arquivos de ambiente ignorados. A chave pública do localStorage recebeu uma exceção local justificada por ser namespace, não credencial. |
| Axe 4.12.1 | Zero violações nas páginas de caixas, inventário e home. Caixas e inventário sem verificações inconclusivas. Na home, dois textos sobre imagens exigiram conferência manual de contraste; usam fundo escuro próprio e texto claro. |

SAST adicional com Semgrep ou CodeQL não foi executado. Não havia um gate SAST configurado neste repositório. A revisão dos dados externos e locais verificou allowlists, limites, ausência de HTML bruto renderizado e ausência de credenciais no bundle.

## Fluxos observados em navegador real

- Desktop 1440 × 1000 e mobile 390 × 844, incluindo menu móvel e ausência de overflow horizontal em caixas, inventário e detalhes de projeto.
- Seleção de Cerne no inspetor, troca de imagem, abertura da galeria, fechamento por Escape e retorno do foco ao botão de origem.
- Navegação da home para a página de detalhes e carregamento direto das rotas na exportação estática servida por HTTP.
- Abertura com roleta até a revelação, equipamento manual e inventário persistido após recarregar. Idioma PT e paleta Floresta também persistiram no teste.
- Cinco cliques rápidos concederam uma recompensa. Pular a animação manteve a mesma contagem e o resultado.
- Preferência de movimento reduzido revelou diretamente o resultado, sem roleta em movimento.
- Bloqueio de localStorage injetado apenas na aba isolada de QA mostrou o aviso e manteve o portfólio e as aberturas utilizáveis na sessão.
- Calendário com contagens reais. ArrowRight moveu o foco de 12 para 19 de novembro de 2025; clique e foco atualizam a contagem apresentada.
- Companheiro em uma área própria do cabeçalho. Em 390px, cabeçalho de 127px, dock com posição estática, sem sobrepor os controles do conteúdo. Reação contida no espaço reservado e opção de ocultar.

## Standards

Revisor paralelo de padrões: nenhum achado.

## Spec

Revisor paralelo de especificação: um achado inicial, o companheiro fixo poderia cobrir conteúdo. Corrigido movendo-o para uma área reservada do cabeçalho. Reavaliação sem achados residuais. A passagem manual também corrigiu o retorno do foco da galeria e o destaque da navbar com URLs terminadas em barra.

## Evidências visuais

As capturas são da aplicação renderizada. Os PNGs gerados por IA ficam separados em `docs/references/pixel-art/companions/`, com prompts em `assets.md`; eles não são evidência da implementação.

| Arquivo | Estado |
| --- | --- |
| [home-desktop.png](home-desktop.png) | Home padrão, desktop |
| [home-mobile.png](home-mobile.png) | Home padrão, mobile |
| [projects-desktop.png](projects-desktop.png) | Cerne selecionado no inspetor |
| [project-detail-desktop.png](project-detail-desktop.png) | Página de detalhes de Cerne |
| [project-detail-mobile.png](project-detail-mobile.png) | Detalhes e galeria no celular |
| [contributions-desktop.png](contributions-desktop.png) | Calendário com dados públicos reais |
| [case-result-desktop.png](case-result-desktop.png) | Resultado de uma abertura real |
| [cases-mobile.png](cases-mobile.png) | Página de caixas no celular |
| [roulette.webm](roulette.webm) | Abertura até a revelação, gravação da exportação estática |
| [inventory-empty-mobile.png](inventory-empty-mobile.png) | Inventário sem itens em uma origem de QA nova |
| [inventory-desktop.png](inventory-desktop.png) | Coleção de QA conhecida com itens equipados |
| [companion-mobile.png](companion-mobile.png) | Coleção de QA com companheiro no espaço reservado |
| [storage-unavailable.png](storage-unavailable.png) | Erro de armazenamento simulado na aba de QA |

A coleção conhecida das duas últimas capturas de inventário foi preparada apenas no navegador isolado para exercitar equipamento e repetidos. Não altera os dados profissionais nem os dados do GitHub. O estado de indisponibilidade do calendário sem histórico foi validado por integração; não foi capturado visualmente.

## Ambiente para revisão manual

- Desenvolvimento: http://127.0.0.1:3001
- Exportação estática: http://127.0.0.1:3002
- Dados profissionais existentes do repositório e calendário público de AndreiRech. Sem credenciais de teste.
- A coleção de cada navegador é independente. Os minijogos de música, anime, The Witcher e RPG continuam para etapas posteriores.
