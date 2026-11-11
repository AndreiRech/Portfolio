# Hero com D20 interativo

PR: [#3](https://github.com/AndreiRech/Portfolio/pull/3). Revisão a partir de `57b44f4f8e44536b5e9ce7a216bbe6029d906b5b`. Implementação em `5495b5c3adbc919ba2bd84457d2e30b82a8d76f4`.

O Hero usa uma cena aberta com o D20 original do catálogo. Clique, Enter/Espaço ou arraste e solte rolam o dado. O resultado entre 1 e 20 é anunciado e desenhado ao lado; 1 e 20 recebem mensagens próprias. A imagem não concede itens nem altera o inventário. Os projetos continuam acessíveis pelo CTA principal e pela seção própria.

## Validação

- `npm run lint`, `npm test`, `npm run build`, TypeScript e `git diff --check` passaram. A suíte existente mantém 25 testes aprovados. Não há dependências ou alterações de CI novas.
- Exportação real em 1440 × 1000, 390 × 844 e 320 × 844, em português e inglês. Sem card ou fotografia no Hero.
- Clique e Enter/Espaço concluíram rolagens. Arraste real do mouse mostrou `translate(60px, -45px) rotate(15deg)` antes da soltura e retornou o transform ao valor vazio após o quique.
- Perda de captura durante um arraste devolveu o dado ao lugar, manteve o resultado anterior e terminou com `aria-busy=false`.
- Cinco cliques em sequência geraram somente uma atualização de resultado. Os estados 20/acerto crítico e 1/falha crítica foram exercitados com uma fonte aleatória controlada apenas no navegador de QA e restaurada depois. O código entregue continua usando `Math.random`.
- Movimento reduzido testado antes da ação e durante uma rolagem confirmada como ativa. A alteração concluiu a rolagem uma vez e deixou zero animações em execução. O gesto continua disponível sem deslocamento animado.
- Em 320 px, a largura máxima do documento permaneceu em 320 px ao longo de 65 frames de uma rolagem. O resultado foi reposicionado para não cobrir a arte.
- Axe 4.12.1: zero violações no Hero. Até dois testes de contraste ficaram inconclusivos por número isolado e sobreposição da caixa transparente do PNG. Inspeção visual e cálculo dos tokens confirmaram contraste de 5,40:1 para coral, 8,22:1 para texto secundário e 10,34:1 para o crítico dourado sobre o fundo padrão.
- Console de erros da página vazio após os fluxos.

Uma reinicialização do navegador deixou a primeira tentativa de capturas mobile numa aba vazia. Os testes que falharam nessa tentativa foram descartados; a aba foi restaurada e todos os fluxos afetados foram repetidos com sucesso. As imagens entregues foram abertas e inspecionadas.

## Revisão

Os eixos Standards e Spec de `code-review` revisaram o delta contra o requisito atualizado, sem achados. A revisão de Web Interface Guidelines conferiu semântica nativa do botão, foco, resultado acessível, alternativa ao arraste, cleanup e movimento reduzido. O D20 limita o arraste e usa WAAPI, sem atualizar React a cada movimento. O objeto é apresentado sem moldura; o contorno na captura de crítico é o foco do teclado.

Sem novas escritas no armazenamento, requisições externas, autenticação ou dados de entrada persistidos. Scanners adicionais de SAST/SCA/segredos não foram executados e não são declarados aprovados.

## Desempenho

Lighthouse 13.6.0, navegador isolado e perfil mobile simulado no servidor HTTP local: desempenho 78, acessibilidade 100, boas práticas 100 e SEO 100. LCP 5,7 s, CLS 0 e TBT 120 ms. O LCP continua acima de 2,5 s. O servidor de teste não aplica compressão nem cache persistente; esta medição não comprova desempenho em produção.

## Evidências

- [Desktop](desktop.png): composição aberta em português.
- [Acerto crítico e foco do teclado](critical-desktop.png): resultado 20, inglês.
- [Mobile 390 px](mobile-390.png): resultado e ação em português.
- [Mobile 320 px](mobile-320.png): resultado e textos sem corte.
- [Gravação do arraste e teclado](roll-and-drag.webm): deslocamento, soltura, quique e rolagem por Enter.

Os servidores de desenvolvimento em http://127.0.0.1:3001 e exportação em http://127.0.0.1:3002 ficam disponíveis para teste, com dados do repositório e sem credenciais. As rolagens ficam somente no estado da página.
