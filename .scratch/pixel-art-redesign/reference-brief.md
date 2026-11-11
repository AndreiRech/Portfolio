# Referência e direção de design

Base: `4d9403efecc80adf6392d69e96e70f059e1e9ccc`, branch `main`. Implementação em `feature/pixel-art-redesign`.

Fontes inspecionadas: captura do Rejuicer tracker fornecida pelo usuário, tabela de raridades fornecida pelo usuário e https://ohnyfans.com em navegador real a 1440 × 1000 durante esta sessão. Capturas em `docs/references/pixel-art/`. A referência ao vivo abriu em tema claro; a adaptação escura foi explicitamente escolhida pelo usuário.

Fatos visuais: tipografia de destaque em pixel com traço regular, corpo sem serifa, alinhamento predominantemente à esquerda, áreas retangulares planas, espaçamento generoso entre seções, navegação compacta horizontal e ilustrações em blocos. A captura escura usa fundo carvão, painéis um pouco mais claros, coral nos títulos e azul nos blocos de atividade. Raridades têm nomes e cores da tabela fornecida.

Direção: portfólio de desenvolvedor para leitura profissional rápida e exploração opcional. DESIGN_VARIANCE 6, MOTION_INTENSITY 5, VISUAL_DENSITY 4. CSS nativo e Tailwind existentes, sem introduzir um design system externo. Títulos Pixelify Sans e corpo DM Sans. Cores base: carvão #1c1d1f, painel #25272a, texto #e6e7eb, texto secundário #b2b5bd, coral #e56d68 e azul #5967ff.

Composição: apresentação textual à esquerda e fotografia real à direita; inspeção de projetos com seleção lateral e prévia grande; sobre e experiência; calendário de contribuições; prévias de caixas e inventário; contato. Páginas de caixas e inventário compartilham o mesmo cabeçalho, tipografia e paleta. Em telas pequenas, os controles ficam acima da prévia e a navegação recolhe em menu.

Movimento motivado: transição curta ao selecionar projeto, roleta para representar o sorteio e reação do companheiro ao clique. Redução de movimento substitui deslocamentos por revelação direta. Sem transformar a leitura do portfólio em jogo obrigatório.

Controles selecionados: ASVS 1.5.2 e 2.2.1 para allowlist de IDs, tipos e limites ao ler a coleção; 2.3.1 e 2.3.3 para uma concessão por abertura; 14.3.3 para guardar apenas preferências e contagens não sensíveis. Dados do GitHub serão validados antes de substituir a última captura real. Credenciais não integram o bundle.
