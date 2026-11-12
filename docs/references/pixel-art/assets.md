# Origem das artes

Os companheiros foram gerados com a ferramenta integrada `image_gen`, seguindo a skill `imagegen`. Os PNGs originais estão em `companions/`. As versões usadas pela interface estão em `public/collectibles/companions/`, em WebP lossless com dimensão máxima de 256 pixels e redução por nearest-neighbor. As quatro versões de produção somam aproximadamente 122 KiB. A fotografia de Andrei e as imagens dos projetos são os arquivos existentes no repositório.

Os cursores SVG e a caixa SVG são gráficos geométricos nativos do projeto, em `public/collectibles/cursors/` e `public/collectibles/case.svg`.

## Prompts usados

Cada geração usou o prefixo e o sufixo abaixo, com um assunto específico por arquivo. Foi solicitada transparência real nas quatro chamadas.

Prefixo: "Use case: stylized-concept. Asset type: isolated web-game companion sprite."

- `chicken.png`: "A charming white chicken with red comb and orange feet, in 3/4 side view, standing, facing left."
- `wolf.png`: "A little slate-gray fantasy wolf with pointed ears, a fluffy tail, pale silver fur accents and a tiny round silver medallion. Standing in 3/4 side view, facing left. Original character, no logo."
- `d20.png`: "A chunky purple twenty-sided tabletop RPG die character, standing on two tiny feet, with simple expressive eyes and a clearly legible 20 on its central triangular face."
- `gold-d20.png`: "A chunky golden twenty-sided tabletop RPG die character with warm gold facets, a clearly legible 20 on its central triangular face, two tiny feet and expressive eyes. A very small sparkle beside it."

Sufixo: "Crisp authentic 32x32 pixel-art sprite, limited 8-color palette, strict square pixel grid, enlarged nearest-neighbor, absolutely no smooth edges or anti-aliasing, no 3D rendering. Single centered character occupying 75 percent of square canvas, fully visible silhouette with even transparent margins. Cute but with clear recognizable features at 64px display size. Entire background genuinely transparent. No ground, no shadow, no frame, no text except requested die number."
