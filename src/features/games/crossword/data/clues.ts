import { CHALLENGING_CLUES } from "./challenging.ts";
import type { ClueEntry } from "../model/crossword.ts";

/**
 * Word bank for the daily crossword: answer (letters only, without accents,
 * as Brazilian crosswords print them) and its clue. Each day the generator
 * draws from this list, so adding entries adds variety.
 */
const BANK = `
SOL|Estrela no centro do nosso sistema
MAR|Grande extensão de água salgada
LUA|Satélite natural da Terra
RIO|Curso de água doce que deságua no mar
MEL|Doce produzido pelas abelhas
CHA|Bebida feita com folhas em infusão
OVO|Posto pela galinha
RUA|Via pública com calçadas
FIM|O contrário de começo
LAR|Casa, morada, família
ASA|Permite que a ave voe
GOL|O objetivo de uma partida de futebol
REI|Monarca que usa coroa
LEI|Regra aprovada pelo Legislativo
NOZ|Fruto seco de casca dura
PAZ|Ausência de guerra
VOZ|Som que sai da garganta ao falar
ANO|Doze meses
DIA|Vinte e quatro horas
UVA|Fruta usada para fazer vinho
OCA|Habitação indígena tradicional
NEVE|Chuva congelada em flocos
CASA|Lugar onde se mora
GATO|Felino doméstico que mia
BOLA|Rola no campo de futebol
MESA|Móvel com tampo e pernas para refeições
FOGO|Produz chama e calor
VELA|Ilumina com um pavio aceso
NAVE|Veículo espacial
ILHA|Porção de terra cercada de água
ROSA|Flor com espinhos no caule
LAGO|Água parada cercada de terra
ONDA|Movimento da água que quebra na praia
NOTA|Dó, ré ou mi
PATO|Ave que faz quá-quá
SAPO|Anfíbio que coaxa
LOBO|Uiva para a lua
URSO|Grande mamífero que hiberna
LEAO|O rei da selva
TATU|Animal com carapaça que cava buracos
BOTO|Golfinho de água doce da Amazônia
ARCO|Usado com flechas
REDE|Para dormir na varanda ou pescar
PIPA|Voa no céu presa a uma linha
DADO|Cubo com faces numeradas de um a seis
MAPA|Representação de um território no papel
CAFE|Bebida que espanta o sono
SUCO|Bebida feita de fruta espremida
BOLO|Doce de aniversário
MILHO|Grão da pamonha e da pipoca
ARROZ|Acompanha o feijão no prato
FEIJAO|Base da feijoada
QUEIJO|Feito com leite coalhado
PIPOCA|Estoura na panela e acompanha o cinema
LIVRO|Tem capa, páginas e história
CARTA|Mensagem escrita enviada pelo correio
TREM|Anda sobre trilhos
CARRO|Veículo com quatro rodas e volante
BARCO|Navega pelas águas
AVIAO|Voa levando passageiros
PONTE|Liga duas margens de um rio
TORRE|Construção alta e estreita
CHAVE|Abre fechaduras
PORTA|Abre e fecha a entrada de um cômodo
JANELA|Abertura na parede para luz e ar
TELHADO|Cobre a casa
ESCADA|Tem degraus
RELOGIO|Marca as horas
ESPELHO|Reflete a sua imagem
CADEIRA|Assento com encosto
SOFA|Assento estofado da sala
CAMA|Móvel onde se dorme
FOGAO|Tem bocas e forno
PANELA|Vai ao fogo para cozinhar
GARFO|Talher com dentes
FACA|Talher que corta
COLHER|Talher para sopa
PRATO|Onde se serve a comida
COPO|Recipiente para beber
TOALHA|Seca o corpo depois do banho
SABAO|Faz espuma e limpa
ESCOVA|Usada nos dentes ou no cabelo
PENTE|Desembaraça o cabelo
LAPIS|Escreve e pode ser apagado
CANETA|Escreve com tinta
CADERNO|Folhas pautadas da escola
REGUA|Mede e traça linhas retas
MOCHILA|Bolsa levada nas costas
ESCOLA|Lugar onde se estuda
PROFESSOR|Quem ensina
ALUNO|Quem aprende na escola
MEDICO|Profissional que cuida da saúde
PADEIRO|Profissional que faz pão
PILOTO|Quem comanda o avião
CARTEIRO|Entrega as correspondências
BOMBEIRO|Apaga incêndios
JUIZ|Apita o jogo ou julga no tribunal
PINTOR|Artista do pincel
CANTOR|Artista da voz
POETA|Quem escreve versos
ATOR|Interpreta personagens
PALCO|Onde os artistas se apresentam
CINEMA|Sala de exibição de filmes
TEATRO|Arte encenada ao vivo
MUSICA|Arte dos sons
SAMBA|Ritmo do carnaval carioca
FORRO|Ritmo nordestino de sanfona e zabumba
FREVO|Dança pernambucana com sombrinha
VIOLAO|Instrumento de seis cordas
PIANO|Instrumento de teclas pretas e brancas
FLAUTA|Instrumento de sopro
TAMBOR|Instrumento de percussão
SANFONA|Acordeão do forró
CARNAVAL|Festa popular de fevereiro
NATAL|Festa de 25 de dezembro
PASCOA|Festa dos ovos de chocolate
FERIAS|Período de descanso do trabalho
PRAIA|Areia à beira-mar
AREIA|Grãos finos da praia
CONCHA|Casca de molusco achada na praia
ESTRELA|Brilha no céu à noite
PLANETA|Marte é um deles
COMETA|Astro com cauda luminosa
GALAXIA|A Via Láctea é uma
NUVEM|Fica no céu e pode trazer chuva
CHUVA|Água que cai do céu
VENTO|Ar em movimento
TROVAO|Barulho que vem depois do raio
RAIO|Descarga elétrica de uma tempestade
INVERNO|Estação mais fria do ano
VERAO|Estação mais quente do ano
OUTONO|Estação em que as folhas caem
FLORESTA|Mata densa cheia de árvores
ARVORE|Tem tronco, galhos e folhas
FOLHA|Parte verde da planta
RAIZ|Fica sob a terra e nutre a planta
SEMENTE|Plantada, vira árvore
FLOR|Parte colorida e perfumada da planta
CACTO|Planta do deserto cheia de espinhos
MONTANHA|Grande elevação de terra
VULCAO|Montanha que expele lava
DESERTO|Região seca e de pouca chuva
OCEANO|Atlântico ou Pacífico
CACHOEIRA|Queda d'água
PEIXE|Vive na água e respira por guelras
BALEIA|O maior mamífero do mar
TUBARAO|Peixe predador de dentes afiados
POLVO|Molusco de oito braços
SIRI|Crustáceo parecido com o caranguejo
CAVALO|Animal que relincha
VACA|Dá leite e faz mu
PORCO|Animal que vive na lama e faz oinc
GALINHA|Ave que bota ovos
OVELHA|Dá lã e faz mé
COELHO|Orelhudo que come cenoura
MACACO|Primata que pula de galho em galho
GIRAFA|Animal de pescoço mais longo
ZEBRA|Cavalo listrado da savana
ELEFANTE|Tem tromba e presas de marfim
TIGRE|Felino listrado
ONCA|Maior felino das Américas
ARARA|Ave colorida de bico curvo
TUCANO|Ave de bico grande e colorido
CORUJA|Ave noturna de olhos grandes
PINGUIM|Ave que não voa e vive no frio
ABELHA|Inseto que faz mel
FORMIGA|Inseto que vive em formigueiro
BORBOLETA|Inseto de asas coloridas
ARANHA|Tece teias
COBRA|Réptil sem pernas
JACARE|Réptil dos rios do Pantanal
TARTARUGA|Réptil de casco duro
CORACAO|Órgão que bombeia o sangue
CEREBRO|Órgão do pensamento
PULMAO|Órgão da respiração
OSSO|Forma o esqueleto
DENTE|Usado para mastigar
OLHO|Órgão da visão
NARIZ|Órgão do olfato
ORELHA|Parte externa do ouvido
BOCA|Por onde se come e se fala
MAO|Tem cinco dedos
JOELHO|Articulação no meio da perna
OMBRO|Articulação entre o braço e o tronco
CABELO|Cresce na cabeça
SANGUE|Líquido vermelho que circula no corpo
SAUDE|Estado de quem está bem
ALEGRIA|Sentimento de felicidade
SAUDADE|Falta que sentimos de alguém
AMOR|Sentimento profundo de afeto
MEDO|Sentimento diante do perigo
SONO|Vontade de dormir
SONHO|O que se vê enquanto se dorme
TEMPO|Passa sem parar
HORA|Sessenta minutos
MINUTO|Sessenta segundos
SEMANA|Sete dias
JANEIRO|Primeiro mês do ano
DOMINGO|Dia de descanso que encerra a semana
MANHA|Parte do dia antes do almoço
NOITE|Quando o céu fica escuro
BRASIL|País do futebol e do samba
BAHIA|Estado do acarajé
RECIFE|Capital de Pernambuco
MANAUS|Capital do Amazonas
BELEM|Capital do Pará
PARIS|Capital da França
ROMA|Capital da Itália
LISBOA|Capital de Portugal
TOQUIO|Capital do Japão
LONDRES|Capital da Inglaterra
EGITO|País das pirâmides de Gizé
ITALIA|País da pizza e da massa
JAPAO|País do sushi
CHILE|País longo e estreito da América do Sul
PERU|País de Machu Picchu
FUTEBOL|Esporte mais popular do Brasil
VOLEI|Esporte jogado com rede e seis por time
TENIS|Esporte de raquete
XADREZ|Jogo de reis, rainhas e peões
DAMAS|Jogo de tabuleiro com peças que comem na diagonal
GOLEIRO|Defende o gol
ESTADIO|Arena dos grandes jogos
MEDALHA|Prêmio dos atletas no pódio
CORRIDA|Prova de velocidade
NATACAO|Esporte praticado na piscina
SKATE|Prancha com quatro rodinhas
BICICLETA|Tem pedais e duas rodas
CAMISA|Peça de roupa com botões
CALCA|Peça de roupa com duas pernas
SAIA|Peça de roupa sem pernas presa na cintura
MEIA|Vai no pé antes do sapato
SAPATO|Calçado social
CHINELO|Calçado de praia
CHAPEU|Vai na cabeça para proteger do sol
OCULOS|Ajuda a enxergar melhor
ANEL|Joia usada no dedo
COROA|Usada pelo rei na cabeça
TESOURO|Baú cheio de ouro
PIRATA|Navegante que saqueia navios
CASTELO|Morada de reis com torres
DRAGAO|Criatura que cospe fogo
FADA|Ser mágico com varinha e asas
BRUXA|Voa numa vassoura
MAGIA|Poder sobrenatural
ESPADA|Arma de lâmina longa
ESCUDO|Protege na batalha
HEROI|Salva o dia
ROBO|Máquina que imita o ser humano
CODIGO|O que um programador escreve
TECLADO|Tem teclas para digitar
MOUSE|Move o cursor da tela
TELA|Onde aparecem as imagens do computador
INTERNET|Rede mundial de computadores
SENHA|Protege a sua conta
CELULAR|Telefone que cabe no bolso
FOTO|Imagem registrada pela câmera
VIDEO|Imagens em movimento gravadas
JOGO|Partida com regras e vencedor
PIXEL|Menor ponto de uma imagem digital
DIGITO|Algarismo de zero a nove
NUMERO|Usado para contar
ZERO|Número que vem antes do um
DUZIA|Doze unidades
METADE|Cada uma das duas partes iguais
TRIANGULO|Figura de três lados
CIRCULO|Figura redonda
QUADRADO|Figura de quatro lados iguais
AZUL|Cor do céu num dia limpo
VERDE|Cor da grama
AMARELO|Cor da banana madura
VERMELHO|Cor do morango
ROXO|Cor da berinjela
BRANCO|Cor da neve
PRETO|Cor do carvão
OURO|Metal precioso e dourado
PRATA|Metal da medalha de segundo lugar
FERRO|Metal que enferruja
PEDRA|Pedaço de rocha
BANANA|Fruta amarela que o macaco adora
MANGA|Fruta tropical de caroço grande
LIMAO|Fruta azeda da limonada
LARANJA|Fruta cítrica do suco matinal
ABACAXI|Fruta com coroa e casca espinhosa
MELANCIA|Fruta grande, verde por fora e vermelha por dentro
MORANGO|Fruta vermelha com sementes por fora
COCO|Tem água dentro
CAJU|Fruto cuja castanha fica do lado de fora
ACAI|Fruto roxo da Amazônia servido na tigela
CENOURA|Raiz laranja que o coelho come
BATATA|Vira purê ou fritas
TOMATE|Base do molho da macarronada
CEBOLA|Faz chorar quando é cortada
ALHO|Tempero de dentes brancos
SAL|Tempero que vem do mar
ACUCAR|Adoça o café
FARINHA|Pó usado para fazer pão
LEITE|Bebida branca tirada da vaca
MANTEIGA|Passada no pão quente
PIZZA|Redonda, com queijo e fatias
SOPA|Prato quente servido em tigela
SALADA|Prato de folhas e legumes
CHURRASCO|Carne assada na brasa
FEIJOADA|Prato com feijão preto e carnes
COXINHA|Salgado de frango em forma de gota
PASTEL|Salgado frito vendido na feira
BRIGADEIRO|Docinho de chocolate com granulado
PUDIM|Sobremesa com calda de caramelo
SORVETE|Doce gelado servido na casquinha
CHOCOLATE|Feito de cacau
BISCOITO|Bolacha
ABACATE|Fruta verde da vitamina e do guacamole
ABOBORA|Legume laranja do Halloween
AGULHA|Usada com linha para costurar
AGUIA|Ave de rapina símbolo de poder
ALFACE|Folha verde básica da salada
ALMOFADA|Travesseiro pequeno do sofá
AMIGO|Pessoa querida com quem contamos
ANJO|Ser celestial com asas
ANTENA|Capta sinal de rádio ou TV
APITO|Sopra o juiz para marcar falta
ARCOIRIS|Faixa colorida no céu depois da chuva
ARMARIO|Móvel onde se guardam roupas
ASTRONAUTA|Viaja ao espaço
ATLAS|Livro de mapas
AVENIDA|Rua larga e movimentada
AVO|Pai do pai ou da mãe
AZEITE|Óleo feito de azeitonas
BAILE|Festa com dança
BALANCA|Mede o peso
BALAO|Sobe cheio de gás ou de ar
BALDE|Carrega água
BANCO|Assento da praça ou lugar do dinheiro
BANHO|Lavagem do corpo no chuveiro
BARBA|Pelos do rosto masculino
BARRIGA|Parte da frente do corpo, abaixo do peito
BATERIA|Instrumento de baquetas ou fonte de energia do celular
BEIJO|Carinho feito com os lábios
BERCO|Cama do bebê
BIBLIOTECA|Lugar com muitos livros para emprestar
BIGODE|Pelos acima do lábio
BILHETE|Passagem ou pequena mensagem
BOLSA|Carregada no ombro ou mercado de ações
BONECA|Brinquedo em forma de gente
BORRACHA|Apaga o lápis
BOTA|Calçado de cano alto
BRINCO|Joia da orelha
BRINQUEDO|Objeto para a criança se divertir
BRISA|Vento leve e fresco
BUZINA|Faz barulho no carro
CABRA|Animal que dá leite e tem chifres
CACHORRO|Melhor amigo do homem
CAFEZINHO|Xícara pequena de café
CAIXA|Embalagem de papelão
CALENDARIO|Mostra os dias do ano
CAMELO|Animal do deserto com corcovas
CAMINHAO|Veículo grande de carga
CAMPAINHA|Toca quando chega visita
CANGURU|Animal australiano que pula e tem bolsa
CANOA|Barco estreito movido a remo
CAPACETE|Protege a cabeça do motociclista
CAPIVARA|Maior roedor do mundo
CARACOL|Molusco que carrega a casa nas costas
CARANGUEJO|Crustáceo que anda de lado
CARIMBO|Marca papéis com tinta
CARNEIRO|Macho da ovelha
CARRINHO|Brinquedo com rodas
CARTAZ|Anúncio colado na parede
CASACO|Agasalho para o frio
CASAMENTO|Cerimônia de união de noivos
CASTANHA|Fruto seco do caju ou do Pará
CAVERNA|Abrigo natural na rocha
CEGONHA|Ave que, na lenda, traz os bebês
CENTOPEIA|Bicho de muitas patas
CERCA|Delimita o terreno
CEREJA|Fruta vermelha do topo do bolo
CHAMINE|Por onde sai a fumaça
CHICLETE|Goma de mascar
CHUPETA|Acalma o bebê
CIDADE|Aglomerado urbano
CIGARRA|Inseto que canta no verão
CINTO|Segura a calça na cintura
CIRCO|Espetáculo de palhaços e trapezistas
CLARINETE|Instrumento de sopro de madeira
CLIENTE|Quem compra na loja
COLAR|Joia do pescoço
COLINA|Pequena elevação de terra
COMIDA|O que se come
COMPUTADOR|Máquina com teclado e tela
CONVITE|Chamado para uma festa
COPA|Torneio mundial de futebol
CORDA|Usada para pular ou amarrar
CORREIO|Entrega cartas e encomendas
CORTINA|Tapa a janela
COSTURA|União de tecidos com linha
COTOVELO|Articulação do meio do braço
COUVE|Verdura que acompanha a feijoada
COZINHA|Cômodo onde se prepara a comida
CRAVO|Flor ou tempero de cheiro forte
CRIANCA|Pessoa pequena, antes da adolescência
CUPIM|Inseto que come madeira
CURATIVO|Cobre o machucado
DEDO|Temos dez nas mãos
DESENHO|Arte feita com lápis
DESFILE|Apresentação de moda ou de escola de samba
DETETIVE|Investiga mistérios
DIAMANTE|Pedra preciosa mais dura
DICIONARIO|Livro com o significado das palavras
DINHEIRO|Notas e moedas
DINOSSAURO|Réptil gigante extinto
DOCE|O contrário de salgado
DOMINO|Jogo de peças com pontos
DOUTOR|Título do médico
ECLIPSE|Quando a Lua esconde o Sol
EDIFICIO|Prédio
ELEVADOR|Sobe e desce entre andares
ENCHENTE|Transbordamento das águas
ENFERMEIRA|Cuida de pacientes no hospital
ENVELOPE|Guarda a carta
ESCORREGA|Brinquedo de parquinho para descer
ESPINAFRE|Verdura do Popeye
ESPONJA|Lava a louça
ESQUILO|Roedor que guarda nozes
ESTANTE|Móvel com prateleiras
ESTOJO|Guarda lápis e canetas
ESTRADA|Via entre cidades
FAROL|Ilumina o mar para os navios
FAZENDA|Propriedade rural
FERIADO|Dia sem trabalho
FERRUGEM|Mancha do ferro molhado
FESTA|Comemoração com amigos
FILME|Exibido no cinema
FITA|Tira de tecido para enfeitar presentes
FLECHA|Disparada pelo arco
FOCA|Mamífero marinho que bate palmas
FOGUETE|Leva astronautas ao espaço
FOGUEIRA|Fogo da festa junina
FONE|Usado para ouvir música
FORMIGUEIRO|Casa das formigas
FORNO|Assa o bolo
FRANGO|Carne de galinha
FRIGIDEIRA|Panela rasa para fritar
FRIO|Sensação do inverno
FUMACA|Sai do fogo
FUNIL|Ajuda a passar líquido para a garrafa
GAIOLA|Prende o passarinho
GALO|Canta de manhã
GARAGEM|Onde se guarda o carro
GARRAFA|Recipiente de vidro ou plástico com gargalo
GAVETA|Compartimento que puxa do móvel
GELADEIRA|Conserva os alimentos frios
GELO|Água congelada
GIZ|Escreve no quadro-negro
GLOBO|Esfera com o mapa do mundo
GOLFINHO|Mamífero marinho brincalhão
GOTA|Pingo de água
GRAVATA|Acessório do terno
GRILO|Inseto que canta à noite
GUARDANAPO|Limpa a boca à mesa
GUITARRA|Instrumento elétrico de cordas
HAMBURGUER|Sanduíche com carne moída
HIPOPOTAMO|Grande animal africano que vive na água
HOSPITAL|Lugar de tratamento médico
HOTEL|Hospedagem para viajantes
IGREJA|Templo cristão
IMA|Atrai o ferro
INDIO|Povo originário do Brasil
INSETO|Tem seis patas
IOGURTE|Leite fermentado
JACA|Fruta enorme de cheiro forte
JANTAR|Refeição da noite
JARDIM|Lugar com flores e plantas
JARRA|Serve o suco à mesa
JIBOIA|Cobra grande que aperta a presa
JORNAL|Traz as notícias do dia
JOVEM|Que tem pouca idade
JUDO|Luta japonesa de quimono
JUSTICA|Dar a cada um o que é seu
LADRAO|Quem rouba
LAGARTA|Vira borboleta
LAGARTIXA|Réptil pequeno que anda na parede
LAMPADA|Ilumina o cômodo
LANCHE|Refeição rápida da tarde
LANTERNA|Luz portátil a pilha
LATA|Embalagem de metal
LEGUME|Cenoura ou abobrinha, por exemplo
LEITURA|Ato de ler
LENCOL|Cobre o colchão
LIMONADA|Suco de limão com açúcar
LINHA|Fio de costura
LIXO|O que se joga fora
LOJA|Estabelecimento comercial
LUVA|Veste a mão
MACA|Fruta vermelha da Branca de Neve
MADEIRA|Material das árvores
MAGICO|Tira coelho da cartola
MALA|Leva roupas na viagem
MAQUIAGEM|Batom e base, por exemplo
MARTELO|Bate no prego
MASCARA|Esconde o rosto no carnaval
MELAO|Fruta de casca amarela e polpa doce
MERCADO|Onde se fazem compras
METRO|Trem subterrâneo
MICROFONE|Amplifica a voz do cantor
MINHOCA|Vive na terra e ajuda as plantas
MOEDA|Dinheiro de metal
MOINHO|Gira com o vento
MOLHO|Acompanha o macarrão
MONSTRO|Criatura assustadora
MORCEGO|Mamífero que voa à noite
MOSQUITO|Pica e zumbe no ouvido
MUSEU|Guarda obras de arte
NAVIO|Embarcação grande
NINHO|Casa dos passarinhos
NOIVA|Usa véu e grinalda
NOVELO|Bola de lã
OFICINA|Conserta carros
ONIBUS|Transporte coletivo
ORVALHO|Gotas na grama de manhã
OSTRA|Molusco que pode ter pérola
PACIENCIA|Virtude de quem sabe esperar
PADARIA|Vende pão
PAGINA|Folha do livro
PALHACO|Artista de nariz vermelho
PALITO|Limpa os dentes
PANDEIRO|Instrumento do samba com platinelas
PAPAGAIO|Ave que imita a fala
PARAQUEDAS|Abre durante o salto do avião
PARQUE|Área verde para passear
PASSAPORTE|Documento de viagem internacional
PATINS|Calçado com rodinhas
PAVAO|Ave de cauda colorida em leque
PEIXARIA|Vende peixes
PENEIRA|Separa o fino do grosso
PERFUME|Cheiro gostoso em frasco
PERGUNTA|Pede uma resposta
PIA|Onde se lava a louça
PICOLE|Sorvete no palito
PIJAMA|Roupa de dormir
PILHA|Fonte de energia do controle remoto
PIMENTA|Tempero que arde
PINCEL|Usado para pintar
PIPOQUEIRO|Vende pipoca na rua
PIRULITO|Doce no palito
PISCINA|Tanque para nadar
PLANTA|Ser vivo que faz fotossíntese
POMBO|Ave comum das praças
PORTAO|Entrada da casa
POTE|Recipiente com tampa
PRESENTE|Dado no aniversário
PREGO|Pregado com martelo
PRINCESA|Filha do rei
PROVA|Avaliação da escola
PULSEIRA|Joia do pulso
QUADRO|Pintura emoldurada
QUEIJADINHA|Docinho de coco e queijo
QUINTAL|Área livre atrás da casa
RAINHA|Esposa do rei
RAPOSA|Animal esperto de cauda peluda
RATO|Roedor que o gato persegue
RECEITA|Modo de preparo de um prato
REDACAO|Texto escrito na escola
REMO|Move a canoa
RESPOSTA|Vem depois da pergunta
RINOCERONTE|Animal com chifre no focinho
RODA|Faz o carro andar
ROUPA|O que se veste
SABONETE|Usado no banho
SACOLA|Leva as compras
SALA|Cômodo de estar
SALSICHA|Vai no cachorro-quente
SANDALIA|Calçado aberto
SAXOFONE|Instrumento de sopro do jazz
SEREIA|Metade mulher, metade peixe
SERROTE|Corta madeira
SETA|Indica a direção
SILENCIO|Ausência de barulho
SINO|Toca na torre da igreja
SOMBRA|Aparece quando bloqueamos a luz
SORRISO|Expressão de alegria
SOBREMESA|Doce depois do almoço
SUOR|Sai do corpo no calor
TABULEIRO|Base do xadrez
TAMBORIM|Pequeno instrumento de percussão do samba
TAPETE|Cobre o chão
TATUAGEM|Desenho na pele
TECIDO|Pano
TELEFONE|Usado para ligar
TELESCOPIO|Observa as estrelas
TELEVISAO|Aparelho de assistir programas
TEMPESTADE|Chuva forte com raios
TENDA|Barraca de acampamento
TERREMOTO|Tremor da terra
TESOURA|Corta papel
TIJOLO|Usado na construção de paredes
TINTA|Usada para pintar a parede
TIO|Irmão do pai ou da mãe
TOMADA|Onde se liga o aparelho
TORNEIRA|Abre a água da pia
TORRADA|Pão tostado
TRAVESSEIRO|Apoia a cabeça na cama
TREVO|Planta de quatro folhas da sorte
TRIGO|Grão da farinha
TROFEU|Taça do campeão
TUNEL|Passagem por baixo da terra
UNHA|Cresce na ponta do dedo
UNIFORME|Roupa igual de um time ou escola
UNIVERSO|Tudo que existe
VACINA|Protege contra doenças
VAGALUME|Inseto que brilha à noite
VARANDA|Área aberta da casa
VASSOURA|Varre o chão
VELHO|Que tem muita idade
VENTILADOR|Refresca o ambiente
VESTIDO|Roupa feminina inteira
VIAGEM|Ida a outro lugar
VIOLINO|Instrumento tocado com arco
VIZINHO|Mora ao lado
VOLANTE|Direção do carro
XICARA|Recipiente do café
XAMPU|Lava o cabelo
ZIPER|Fecho de dentinhos
ZOOLOGICO|Lugar para ver animais
ACARAJE|Bolinho baiano de feijão frito no dendê
TAPIOCA|Feita de goma de mandioca na frigideira
PAMONHA|Feita de milho verde na palha
FAROFA|Farinha temperada do churrasco
MOQUECA|Ensopado de peixe capixaba ou baiano
CUSCUZ|Feito de flocos de milho no vapor
GUARANA|Refrigerante de fruta amazônica
CACHACA|Destilado da cana
CAIPIRINHA|Drinque brasileiro com limão
CHIMARRAO|Mate gaúcho na cuia
CAPOEIRA|Luta e dança com berimbau
BERIMBAU|Instrumento de arco da capoeira
FUTSAL|Futebol jogado na quadra
SURFE|Esporte de prancha nas ondas
GOLEADA|Vitória por muitos gols
PENALTI|Cobrança de falta dentro da área
ESCANTEIO|Cobrança feita do canto do campo
TORCIDA|Grupo que apoia o time
MASCOTE|Personagem que representa o time
OLIMPIADA|Jogos mundiais a cada quatro anos
MARATONA|Corrida de 42 quilômetros
AMAZONIA|Maior floresta tropical do mundo
PANTANAL|Planície alagada de Mato Grosso
CERRADO|Bioma do Brasil central
CAATINGA|Bioma seco do Nordeste
IGUACU|Cataratas do Paraná
BRASILIA|Capital do Brasil
SALVADOR|Capital da Bahia
CURITIBA|Capital do Paraná
FORTALEZA|Capital do Ceará
GOIANIA|Capital de Goiás
VITORIA|Capital do Espírito Santo ou triunfo
ARACAJU|Capital de Sergipe
MACEIO|Capital de Alagoas
TERESINA|Capital do Piauí
PALMAS|Capital do Tocantins
CUIABA|Capital de Mato Grosso
MADRI|Capital da Espanha
BERLIM|Capital da Alemanha
PEQUIM|Capital da China
MOSCOU|Capital da Rússia
ATENAS|Capital da Grécia
CAIRO|Capital do Egito
OTTAWA|Capital do Canadá
BOGOTA|Capital da Colômbia
LIMA|Capital do Peru
QUITO|Capital do Equador
CANADA|País da folha de bordo
MEXICO|País dos tacos e do mariachi
GRECIA|Berço da democracia
INDIA|País do Taj Mahal
CHINA|País da Grande Muralha
FRANCA|País da Torre Eiffel
ARGENTINA|Vizinho do tango e do Messi
URUGUAI|País vizinho, campeão da primeira Copa
PORTUGAL|País de Camões
AFRICA|Continente do Saara
EUROPA|Continente de Paris e Roma
ASIA|Maior continente
OCEANIA|Continente da Austrália
ANTARTIDA|Continente gelado do polo sul
EQUADOR|Linha imaginária que divide a Terra
MERIDIANO|Linha imaginária de polo a polo
BUSSOLA|Aponta para o norte
GEISER|Jato de água quente que sai da terra
GELEIRA|Grande massa de gelo
PENINSULA|Terra cercada de água por três lados
ARQUIPELAGO|Conjunto de ilhas
LITORAL|Faixa de terra junto ao mar
PLANICIE|Terreno plano e extenso
SAVANA|Campo africano de leões e zebras
MERCURIO|Planeta mais próximo do Sol
VENUS|Planeta mais quente do sistema solar
MARTE|Planeta vermelho
JUPITER|Maior planeta do sistema solar
SATURNO|Planeta dos anéis
NETUNO|Planeta azul mais distante do Sol
GRAVIDADE|Força que nos prende ao chão
ATOMO|Menor parte de um elemento
MOLECULA|Conjunto de átomos ligados
CELULA|Unidade básica da vida
OXIGENIO|Gás que respiramos
CARBONO|Elemento do carvão e do diamante
ENERGIA|Capacidade de realizar trabalho
IMPULSO|Força repentina
MICROSCOPIO|Amplia coisas muito pequenas
LUPA|Lente de aumento
EXPERIENCIA|Teste de laboratório
FOSSIL|Resto de ser vivo preservado na rocha
VIRUS|Agente da gripe
BACTERIA|Micróbio de uma só célula
ESQUELETO|Conjunto dos ossos
MUSCULO|Tecido que se contrai para o movimento
ESTOMAGO|Órgão da digestão
FIGADO|Maior órgão interno do corpo
RIM|Órgão que filtra o sangue
VEIA|Leva o sangue de volta ao coração
TOSSE|Sintoma da gripe
FEBRE|Temperatura alta do corpo
ESPIRRO|Sai pelo nariz de repente
SOLUCO|Contração que faz "hic"
BOCEJO|Sinal de sono ou tédio
PALAVRA|Conjunto de letras com sentido
LETRA|A, B ou C
VOGAL|A, E, I, O ou U
FRASE|Conjunto de palavras com sentido completo
POEMA|Texto em versos
ROMANCE|Livro de ficção longo ou história de amor
CONTO|História curta
FABULA|História com animais e moral
LENDA|História popular passada de geração em geração
SACI|Menino de uma perna só do folclore
CURUPIRA|Protetor das matas com os pés para trás
IARA|Sereia dos rios do folclore
BOITATA|Cobra de fogo do folclore
CUCA|Bruxa jacaré do Sítio do Picapau
EMILIA|Boneca de pano do Sítio
PINOQUIO|Boneco cujo nariz cresce com a mentira
CINDERELA|Perdeu o sapatinho de cristal
RAPUNZEL|Princesa de tranças longas na torre
ALADIM|Dono da lâmpada mágica
MOGLI|Menino criado na selva por lobos
NARNIA|Mundo mágico atrás do guarda-roupa
HOGWARTS|Escola de magia de Harry Potter
GANDALF|Mago de O Senhor dos Anéis
YODA|Mestre Jedi verde
VADER|Darth do lado sombrio
MARIO|Encanador do videogame
SONIC|Ouriço azul veloz
PIKACHU|Pokémon elétrico amarelo
ZELDA|Princesa que dá nome à série de Link
TETRIS|Jogo de peças que caem
BARALHO|Conjunto de cartas
CORINGA|Carta curinga do baralho
PETECA|Brinquedo indígena com penas
PIAO|Brinquedo que gira
IOIO|Sobe e desce no barbante
BAMBOLE|Aro girado na cintura
AMARELINHA|Brincadeira de pular casas riscadas no chão
GUERRA|Conflito armado
VERDADE|O contrário de mentira
MENTIRA|O contrário de verdade
CORAGEM|O que falta ao medroso
PREGUICA|Vontade de não fazer nada ou animal lento
CIUME|Medo de perder quem se ama
ORGULHO|Satisfação consigo mesmo
VERGONHA|Faz o rosto ficar vermelho
SURPRESA|O que não se espera
ESPERANCA|Verde, a última que morre
FELICIDADE|Estado de quem está alegre
AMIZADE|Laço entre amigos
FAMILIA|Pais, filhos, avós
IRMAO|Filho dos mesmos pais
PRIMO|Filho do tio
SOBRINHO|Filho do irmão
NETO|Filho do filho
SOGRA|Mãe do cônjuge
PADRINHO|Testemunha do batismo
BEBE|Criança recém-nascida
ADOLESCENTE|Quem está entre a infância e a vida adulta
ANIVERSARIO|Dia em que se completa mais um ano
PARABENS|Cumprimento do aniversário
SEGUNDA|Primeiro dia útil da semana
SABADO|Dia do fim de semana antes do domingo
FEVEREIRO|Mês do carnaval
ABRIL|Mês da mentira no primeiro dia
JUNHO|Mês das festas juninas
OUTUBRO|Mês das crianças no Brasil
DEZEMBRO|Mês do Natal
PRIMAVERA|Estação das flores
MADRUGADA|Parte da noite antes do amanhecer
ALVORADA|Nascer do dia
CREPUSCULO|Luz do fim da tarde
SECULO|Cem anos
DECADA|Dez anos
MILENIO|Mil anos
RELAMPAGO|Clarão da tempestade
GRANIZO|Chuva de pedras de gelo
NEBLINA|Névoa baixa que tira a visão
FURACAO|Tempestade giratória gigante
TORNADO|Funil de vento destruidor
SECA|Longo período sem chuva
ORQUESTRA|Grupo grande de músicos
MAESTRO|Rege a orquestra
CORAL|Grupo que canta junto
BATUQUE|Ritmo de tambores
MELODIA|Sequência de notas da música
REFRAO|Parte da música que se repete
SHOW|Apresentação ao vivo
FESTIVAL|Evento com muitas atrações
PALHETA|Toca as cordas da guitarra
TECLA|Parte do piano que se aperta
CAMERA|Tira fotos
SELFIE|Foto de si mesmo
APLICATIVO|Programa do celular
MENSAGEM|Texto enviado a alguém
EMAIL|Correio eletrônico
SITE|Página na internet
DOWNLOAD|Baixar um arquivo
CARREGADOR|Recarrega o celular
PROGRAMA|Conjunto de instruções do computador
ALGORITMO|Sequência de passos para resolver um problema
IMPRESSORA|Põe no papel o que está na tela
MONITOR|Tela do computador
PLANILHA|Tabela de cálculos
ARQUIVO|Documento salvo
PASTA|Guarda arquivos ou creme dental
`;

export const INTRODUCTORY_CLUES: ClueEntry[] = BANK.trim()
  .split("\n")
  .map((line) => {
    const [answer, clue] = line.split("|");
    return { answer, clue };
  });

export const CLUES: ClueEntry[] = CHALLENGING_CLUES;
