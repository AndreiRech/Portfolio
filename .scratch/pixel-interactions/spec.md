# Interações em pixel e companheiros ativos

Base local: `89096e6b92edab39346dedf6d0bada0f712b7a89`, continuação do redesign existente. Branch de trabalho: `feature/pixel-interactions`. Base do PR: `feature/pixel-art-redesign`, já em revisão no PR #1. A expansão será um PR dependente para manter o diff restrito a esta tarefa.

## Pedido

Ampliar e melhorar as interações e a presença de pixels, substituir o lobo pelo medalhão da Escola do Lobo, incluir os sinais e dar movimento e funções aos companheiros. Sem Mobbin.

## Aceite

- Manter informações profissionais acessíveis e identidade carvão/coral/azul da aplicação renderizada, capturada em `docs/evidence/pixel-interactions/before-desktop.png`.
- Substituir a arte e o nome do lobo por um medalhão em pixel art, inclusive migrando quantidades e equipamento antigos sem perda de coleção.
- Cinco sinais selecionáveis com teclado/toque, nome, efeito distinto, conjuração repetível e resposta acessível.
- Área para experimentar companheiros sem alterar a propriedade do inventário; equipamento definitivo continua exigindo item obtido.
- Companheiros com passeio, seguir ponteiro/toque, buscar pixel, descansar, reação própria e ocultar. Dados podem rolar D20; medalhão pode conjurar. Controles não devem cobrir conteúdo no fim da página.
- Mais detalhes em pixel e feedback de clique/foco, sem dependências novas, efeitos limitados e cancelamento de animações ao desmontar.
- Português/inglês, mobile/desktop, teclado e movimento reduzido. Nenhum movimento automático obrigatório.
- Executar testes de migração e limites de movimento, lint, build estático e percorrer os fluxos no navegador com capturas e gravação.

## Segurança e riscos

Somente estado de customização público em localStorage, ASVS 14.3.3. IDs e quantidades continuam limitados ao catálogo; dados legados inválidos não entram na migração. Sem rede nova, conta, segredo, moeda ou backend. Riscos principais: pet sobre controles, movimento excessivo e perda do antigo lobo. Validar limites e resize, pausa, preferência de movimento e migração.

## Referência

A própria aplicação antes da alteração e assets já presentes em `docs/references/pixel-art/`. Manter tipografia e cores, usar bordas escalonadas, sprites, chão em tiles e efeitos em blocos. Intensidade de movimento 6, densidade 5; animação de deslocamento apenas por escolha do visitante.
