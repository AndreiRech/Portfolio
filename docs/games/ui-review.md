# Revisão da aba de jogos

Revisão de 12/11/2026, incluindo os sete modos de Termo, Conexo, Palavra cruzada, Raridade, Cores, Escala, Sudoku, Campo minado, Músicas, Mais ou menos, Duelo D20, Sinais e o painel de Companheiros.

## Padrões aplicados

| Elemento | Padrão |
| --- | --- |
| Títulos dos painéis | Pixelify Sans, 26–34 px, centralizados |
| Abas diárias e dificuldade | Pixelify Sans, controles de pelo menos 44 px |
| Letras e números de tabuleiro | Pixelify Sans, tamanho proporcional à casa |
| Instruções, pistas, medidas e mensagens | DM Sans |
| Ações principais e secundárias | DM Sans, altura mínima de 44 px e foco visível |
| Ajuda | Recolhida, junto ao título do jogo |
| Painéis | Mesmo fundo, borda, sombra e espaçamento por largura de tela |
| Resultados de rodada | Pontos em pixel, explicação em DM Sans |
| Cinco rodadas diárias | Indicadores de rodada com o mesmo tratamento em Raridade, Cores e Escala |

A divisão entre fontes segue a função do texto. Pistas e palavras longas precisam de leitura contínua; as peças de Termo, Sudoku, cruzadas e Campo minado mantêm a fonte pixel.

## Correções nos desafios novos

- Cores: a amostra encolhia porque seu contêiner flexível dependia da largura do texto. O componente agora usa largura explícita, amostra de 180–250 px de altura e comparação em duas colunas no resultado.
- Os três controles HSL têm trilhas que mostram a variação da respectiva propriedade, rótulos ligados aos campos, valores numéricos e foco visível.
- Escala: desenhos geométricos substituídos por silhuetas vetoriais de domínio público. As fontes e licenças estão em [scale-silhouettes.md](scale-silhouettes.md).
- As silhuetas preservam suas proporções e têm os limites normalizados à linha de base. A girafa tem o pescoço erguido e o urso está em pé, conforme as medidas usadas pelo jogo.
- O controle de escala inclui ajustes por slider, teclado e botões de diminuir/aumentar. A referência mostra sua altura; a altura do objeto a estimar aparece após confirmar.
- A resposta correta usa sobreposição verde e legenda textual. As medidas dos animais continuam sendo valores típicos aproximados, conforme explicado na ajuda.

## Validação visual

Os 19 painéis/modos foram abertos em 1440×1100 e 390×844. Nenhum apresentou rolagem horizontal da página. Os títulos usaram Pixelify Sans e os botões de ação presentes usaram DM Sans. Relatórios de medidas em `.scratch/games-ui-review/validation/`.

Os jogos de tabuleiro compartilham casas, cores de feedback, bordas e ações. Músicas e Mais ou menos preservam as diferenças necessárias aos seus conteúdos, usando o mesmo painel, seletores e botões. Sinais e Duelo preservam suas ilustrações e controles específicos.

Companheiros é um painel de customização, sem regra de jogo; por isso não recebe ajuda de partida. O Duelo foi revisado no estado bloqueado e nos estados com companheiro.

## Conquistas

Foram acrescentadas oito conquistas ao catálogo existente, com nomes e dicas em português e inglês. Os desbloqueios são idempotentes, preservam os anteriores e aparecem no inventário.

| Jogo | Conclusão | Desempenho |
| --- | --- | --- |
| Campo minado | Vencer uma partida | Vencer no Difícil |
| Sudoku | Resolver sem revelar | Resolver no Difícil sem erros nem dicas |
| Cores | Encerrar as cinco rodadas | Pelo menos 95 pontos em uma rodada |
| Escala | Encerrar as cinco rodadas | Pelo menos 95 pontos em uma rodada |

## Resultado das verificações

- 118 testes automatizados aprovados, incluindo persistência e idempotência das novas conquistas.
- TypeScript, ESLint e Prettier aprovados.
- Build estático aprovado com `npm run build -- --webpack`. O compilador Turbopack depende de uma porta interna bloqueada neste ambiente.
- Os oito desbloqueios foram exercitados numa sessão de navegador isolada. Cores e Escala foram concluídos com os controles reais, Campo minado foi vencido no Fácil e no Difícil com uma semente de teste conhecida, e Sudoku usou uma grade resolvida de teste para validar o estado de vitória.
- O inventário mostrou as oito conquistas novas, com 20 conquistas no total. Os desbloqueios permaneceram após recarregar a página.
- Nenhum erro de JavaScript foi reportado pelo navegador nos cenários verificados.

## Ajustes finais e recordes

- Navegação principal e diários usam o mesmo estilo de botões em pixel. Jogos diários expande ou recolhe os modos, sem link de volta nessa barra e sem marcadores de vitória ou derrota nas abas.
- Cada variante do Termo tem seu próprio título principal e uma frase no painel. Entre mantém apenas os limites mais próximos, inclusive após chutes piores e recargas, e não mostra a lista de tentativas.
- O resultado diário informa vitória ou derrota com texto, ícone e cor. Vitórias usam a chuva de pixels do Raridade, desativada com movimento reduzido. Conexo aparece como Connected em inglês.
- Cores posiciona os controles ao lado da amostra no desktop e usa uma amostra compacta no celular. Cores e Escala exibem pontuações maiores, com quatro faixas de cor e rótulos.
- A palavra cruzada mostra "Conferir resposta final" quando a grade está preenchida. Uma grade com erro continua editável; uma grade correta só declara vitória após essa conferência.
- Sudoku tem o botão Nova partida junto aos recursos, sem esticar além da grade. Sudoku e Campo minado registram o menor tempo de vitória por dificuldade; novas partidas e recargas preservam os recordes.
- D20 mostra a sequência atual e a maior sequência de vitórias. Uma batalha encerrada conta uma vez; derrotas e abandono seguido de outra batalha interrompem a sequência atual.
- Músicas mostra título, ajuda e playlists nessa ordem.

A verificação final passou em 125 testes, TypeScript, Prettier e ESLint. O build estático foi validado com Webpack. No navegador isolado foram conferidos os fluxos de vitória e derrota, validação final da cruzada, persistência dos tempos após nova partida e recarga e incremento único da sequência do D20. A navegação e os controles do Sudoku foram conferidos em 390 e 320 px, sem rolagem horizontal da página.
