# Silhuetas do Size it up

Todas as 142 silhuetas são pixel art original, desenhada para o portfólio. Não há imagens externas, licenças de terceiros nem requisições durante a partida. Personagens são fan art em silhueta; as marcas pertencem aos seus donos.

## Formato

Cada item fica em `src/features/games/perception/data/scale/` como uma grade de texto: `#` é pixel preenchido e `.` é vazio. A altura da grade corresponde à altura do objeto. A linha de baixo encosta no chão e a de cima marca a medida do rótulo. A largura sai da própria grade, então a proporção é a do desenho.

`model/pixelSilhouette.ts` transforma a grade em dois caminhos SVG:

- o preenchimento, com um retângulo por sequência horizontal de pixels;
- o contorno da resposta correta, só com as bordas entre pixel cheio e vazio, para o traço não marcar costuras dentro do sprite.

O teste do catálogo exige grades retangulares e aparadas (sem linhas ou colunas vazias nas bordas), no mínimo 9 linhas, largura de até 4,5 vezes a altura e pelo menos 10 comparações possíveis por item.

## Regras de desenho

- Perfil ou frente, nunca na diagonal: a medida vertical precisa ser a altura real.
- Um objeto por silhueta. Grupos, vistas de cima e ícones vazados não entram.
- Os furos são permitidos quando ajudam a reconhecer (janelas, arcos, rosto do Creeper).
- A altura vale para o topo do desenho: orelhas do cavalo, antena do Empire State, cabeça do Titã acima da Muralha.

## Comparações

Um par só entra quando a razão entre as alturas é de no máximo 8, o limite do controle. As 142 silhuetas formam 4.269 pares não ordenados (antes eram 3.552 com 100 ícones). Cada dia sorteia cinco pares distintos e escolhe o lado de cada um. O sorteio usa a semente `scale-v3` e o progresso salvo usa `perception-scale-v3`, para palpites antigos não serem pontuados contra pares novos. O histórico já registrado não muda.

As alturas são valores típicos aproximados. Medidas de ficção usam a fonte oficial quando ela existe (Pokédex, wiki do Minecraft, estátua do Gundam em Yokohama) e trazem "estimado" no rótulo quando não existe.

## Catálogo

### Monumentos e construções (34) — `landmarks.ts`

| Shape                  | Rótulo                              | Altura (m) | Grade |
| ---------------------- | ----------------------------------- | ---------- | ----- |
| great-pyramid          | Grande Pirâmide de Gizé             | 139        | 33×22 |
| great-sphinx           | Grande Esfinge de Gizé              | 20         | 40×18 |
| el-castillo            | El Castillo, Chichén Itzá           | 30         | 37×20 |
| tikal-temple           | Templo I de Tikal (maia)            | 47         | 23×34 |
| babylon-ziggurat       | Zigurate da Babilônia (estimado)    | 91         | 41×26 |
| ishtar-gate            | Portão de Ishtar, Babilônia         | 14         | 29×20 |
| colosseum              | Coliseu de Roma                     | 48         | 49×18 |
| parthenon              | Partenon                            | 14         | 31×16 |
| eiffel-tower           | Torre Eiffel                        | 330        | 17×43 |
| burj-khalifa           | Burj Khalifa                        | 828        | 13×48 |
| empire-state           | Empire State Building (antena)      | 443        | 13×44 |
| statue-of-liberty      | Estátua da Liberdade (com pedestal) | 93         | 11×34 |
| christ-the-redeemer    | Cristo Redentor (com pedestal)      | 38         | 21×26 |
| big-ben                | Big Ben                             | 96         | 9×40  |
| leaning-tower          | Torre de Pisa                       | 56         | 14×32 |
| taj-mahal              | Taj Mahal                           | 73         | 47×32 |
| moai                   | Moai da Ilha de Páscoa              | 4          | 12×26 |
| stonehenge             | Trílito de Stonehenge               | 7,3        | 15×13 |
| arc-de-triomphe        | Arco do Triunfo                     | 50         | 21×20 |
| space-needle           | Space Needle                        | 184        | 15×38 |
| tokyo-skytree          | Tokyo Skytree                       | 634        | 9×48  |
| cn-tower               | CN Tower                            | 553        | 11×45 |
| petronas-towers        | Torres Petronas                     | 452        | 25×44 |
| saturn-v               | Foguete Saturn V                    | 111        | 11×41 |
| sagrada-familia        | Sagrada Família                     | 172        | 39×44 |
| london-eye             | London Eye                          | 135        | 36×38 |
| golden-gate            | Torre da Golden Gate                | 227        | 13×44 |
| sugarloaf              | Pão de Açúcar                       | 396        | 34×29 |
| taipei-101             | Taipei 101                          | 508        | 15×50 |
| one-world-trade-center | One World Trade Center              | 541        | 11×48 |
| shanghai-tower         | Shanghai Tower                      | 632        | 13×52 |
| gateway-arch           | Gateway Arch, St. Louis             | 192        | 33×33 |
| washington-monument    | Monumento a Washington              | 169        | 5×40  |
| brasilia-cathedral     | Catedral de Brasília                | 40         | 29×21 |

### Personagens geek (23) — `characters.ts`

| Shape          | Rótulo                               | Altura (m) | Grade |
| -------------- | ------------------------------------ | ---------- | ----- |
| pikachu        | Pikachu                              | 0,4        | 28×25 |
| bulbasaur      | Bulbasaur                            | 0,7        | 27×18 |
| charizard      | Charizard                            | 1,7        | 30×23 |
| snorlax        | Snorlax                              | 2,1        | 22×22 |
| jigglypuff     | Jigglypuff                           | 0,5        | 18×18 |
| gengar         | Gengar                               | 1,5        | 22×19 |
| onix           | Onix                                 | 8,8        | 30×36 |
| pickle-rick    | Pickle Rick (estimado)               | 0,12       | 12×24 |
| yoda           | Mestre Yoda                          | 0,66       | 22×20 |
| darth-vader    | Darth Vader                          | 2,02       | 15×27 |
| r2-d2          | R2-D2                                | 1,09       | 17×20 |
| chewbacca      | Chewbacca                            | 2,28       | 14×27 |
| at-at          | AT-AT                                | 22,5       | 36×29 |
| gundam         | Gundam RX-78-2 (estátua de Yokohama) | 18         | 19×31 |
| godzilla       | Godzilla (2014)                      | 108        | 31×28 |
| colossal-titan | Titã Colossal sobre a Muralha        | 60         | 32×30 |
| creeper        | Creeper                              | 1,7        | 8×26  |
| enderman       | Enderman                             | 2,9        | 12×46 |
| iron-golem     | Golem de Ferro                       | 2,7        | 18×22 |
| ghast          | Ghast (com tentáculos)               | 5,5        | 16×22 |
| mario          | Mario (estimado)                     | 1,55       | 13×19 |
| sonic          | Sonic                                | 1          | 20×20 |
| master-chief   | Master Chief (com armadura)          | 2,18       | 15×27 |

### Animais e natureza (35) — `creatures.ts`

| Shape         | Rótulo                          | Altura (m) | Grade |
| ------------- | ------------------------------- | ---------- | ----- |
| human         | Pessoa adulta                   | 1,7        | 13×29 |
| elephant      | Elefante africano               | 3,2        | 35×23 |
| giraffe       | Girafa adulta                   | 5          | 33×37 |
| cat           | Gato sentado                    | 0,3        | 16×19 |
| dog           | Cão labrador                    | 0,75       | 28×19 |
| horse         | Cavalo                          | 2,2        | 35×26 |
| cow           | Vaca                            | 1,5        | 33×20 |
| hippo         | Hipopótamo                      | 1,5        | 32×14 |
| bear          | Urso-pardo em pé                | 2,4        | 16×24 |
| frog          | Sapo sentado                    | 0,06       | 18×13 |
| pigeon        | Pombo                           | 0,25       | 17×15 |
| kiwi          | Kiwi                            | 0,35       | 21×13 |
| penguin       | Pinguim-imperador               | 1,15       | 11×24 |
| ostrich       | Avestruz                        | 2,5        | 22×29 |
| flamingo      | Flamingo                        | 1,3        | 13×28 |
| owl           | Coruja-das-neves                | 0,55       | 18×18 |
| chicken       | Galinha                         | 0,4        | 16×16 |
| rabbit        | Coelho sentado                  | 0,3        | 12×19 |
| mouse         | Camundongo                      | 0,04       | 20×10 |
| snail         | Caracol                         | 0,03       | 22×12 |
| gorilla       | Gorila em pé                    | 1,7        | 18×22 |
| kangaroo      | Canguru-vermelho                | 1,5        | 16×22 |
| camel         | Dromedário                      | 2,2        | 32×21 |
| rhino         | Rinoceronte-branco              | 1,8        | 32×14 |
| llama         | Lhama                           | 1,8        | 21×21 |
| t-rex         | Tiranossauro rex                | 4          | 41×20 |
| brachiosaurus | Braquiossauro                   | 13         | 15×27 |
| pine-tree     | Pinheiro jovem                  | 4          | 15×20 |
| palm-tree     | Coqueiro                        | 25         | 20×23 |
| sequoia       | Sequoia-gigante General Sherman | 84         | 11×26 |
| saguaro       | Cacto saguaro                   | 12         | 16×24 |
| sunflower     | Girassol                        | 2          | 13×25 |
| mushroom      | Cogumelo amanita                | 0,15       | 18×13 |
| apple         | Maçã                            | 0,08       | 15×14 |
| pineapple     | Abacaxi com coroa               | 0,3        | 12×18 |

### Veículos e objetos (50) — `objects.ts`

| Shape           | Rótulo                                | Altura (m) | Grade |
| --------------- | ------------------------------------- | ---------- | ----- |
| car             | Carro compacto                        | 1,45       | 30×12 |
| van             | Van de passageiros                    | 2          | 32×18 |
| bus             | Ônibus urbano                         | 3,2        | 50×17 |
| double-decker   | Ônibus de dois andares                | 4,4        | 40×24 |
| truck           | Caminhão de carga                     | 3,8        | 48×20 |
| motorcycle      | Motocicleta                           | 1,1        | 32×18 |
| bicycle         | Bicicleta adulta                      | 1,05       | 32×20 |
| tractor         | Trator agrícola                       | 2,7        | 34×27 |
| sailboat        | Veleiro                               | 10         | 30×40 |
| boeing-747      | Boeing 747                            | 19,4       | 64×18 |
| titanic         | Titanic (quilha ao topo das chaminés) | 53         | 80×18 |
| hot-air-balloon | Balão de ar quente                    | 22         | 21×34 |
| door            | Porta padrão                          | 2,1        | 9×21  |
| wine-bottle     | Garrafa de vinho                      | 0,3        | 7×20  |
| water-bottle    | Garrafa de água de 500 ml             | 0,21       | 7×17  |
| soda-can        | Lata de refrigerante                  | 0,122      | 9×13  |
| mug             | Caneca                                | 0,1        | 13×9  |
| wine-glass      | Taça de vinho                         | 0,22       | 9×16  |
| blender         | Liquidificador                        | 0,4        | 11×17 |
| toilet          | Vaso sanitário com caixa              | 0,75       | 11×17 |
| chair           | Cadeira de jantar                     | 0,9        | 10×15 |
| couch           | Sofá                                  | 0,85       | 24×12 |
| fridge          | Geladeira duplex                      | 1,8        | 12×19 |
| washing-machine | Máquina de lavar                      | 0,85       | 16×17 |
| floor-lamp      | Luminária de chão                     | 1,6        | 15×24 |
| desk-lamp       | Luminária de mesa                     | 0,45       | 11×14 |
| traffic-cone    | Cone de trânsito                      | 0,7        | 13×16 |
| fire-hydrant    | Hidrante                              | 0,6        | 9×14  |
| street-lamp     | Poste de luz                          | 6          | 9×30  |
| phone-booth     | Cabine telefônica de Londres          | 2,5        | 11×22 |
| basketball-hoop | Cesta de basquete (topo da tabela)    | 3,95       | 16×31 |
| suitcase        | Mala de viagem                        | 0,65       | 14×20 |
| guitar          | Violão                                | 1          | 9×28  |
| basketball      | Bola de basquete                      | 0,24       | 16×16 |
| soccer-ball     | Bola de futebol                       | 0,22       | 15×15 |
| tennis-ball     | Bola de tênis                         | 0,067      | 12×12 |
| bowling-pin     | Pino de boliche                       | 0,38       | 7×16  |
| chess-pawn      | Peão de xadrez                        | 0,05       | 7×11  |
| chess-king      | Rei de xadrez                         | 0,095      | 7×14  |
| smartphone      | Celular                               | 0,15       | 9×17  |
| game-boy        | Game Boy                              | 0,148      | 13×17 |
| arcade-cabinet  | Fliperama                             | 1,8        | 14×24 |
| rubiks-cube     | Cubo mágico                           | 0,057      | 11×11 |
| d20             | Dado D20                              | 0,02       | 15×16 |
| lego-minifigure | Minifigura LEGO                       | 0,04       | 11×22 |
| rubber-duck     | Patinho de borracha                   | 0,1        | 14×12 |
| pencil          | Lápis                                 | 0,19       | 7×24  |
| hammer          | Martelo                               | 0,32       | 11×18 |
| lightbulb       | Lâmpada                               | 0,11       | 13×15 |
| toilet-paper    | Rolo de papel higiênico               | 0,1        | 10×12 |
