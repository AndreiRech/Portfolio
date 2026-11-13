import type { ClueEntry } from "../model/crossword.ts";

// Original clues: indirect definitions, polysemy and general knowledge.
const BANK = `
SOL|Astro que dá nome a uma clave
MAR|Foi atravessado a pé no relato do Êxodo
LUA|Inspira lunáticos e marca marés
RIO|Pode ter leito sem nunca dormir
MEL|Produto da apicultura, não da polinização
CHA|Infusão que dá nome a uma reunião social
OVO|Célula inicial ou argumento de uma velha pergunta
RUA|Logradouro que pode acabar em beco
FIM|Arremate de uma narrativa
LAR|Morada, em registro afetivo
ASA|Apêndice de ave ou de uma xícara
GOL|Feito que muda o placar no futebol
REI|Peça cujo xeque-mate encerra a partida
LEI|Norma que a sanção pode pôr em vigor
NOZ|Fruto que dá nome a uma peça da garganta
PAZ|Objeto de um armistício
VOZ|Pode ser passiva sem ficar calada
ANO|Intervalo de uma translação terrestre
DIA|Unidade que também pode designar só a parte clara
UVA|Matéria-prima do mosto na vinicultura
OCA|Moradia coletiva de certos povos originários
ECO|Resposta acústica sem interlocutor
ELO|Unidade de uma corrente, concreta ou figurada
ERA|Divisão do tempo geológico acima do período
IMA|Tem polos, embora não seja um planeta
IRA|Pecado capital associado ao furor
NAU|Embarcação das grandes navegações
SAL|Pode ser grosso, de fruta ou de cozinha
SER|Verbo que exprime identidade
SUL|Rumo oposto ao setentrião
TOM|Altura musical ou maneira de falar
VIA|Caminho; no plural, pode significar exemplares de documento
AZO|Ocasião favorável, na expressão "dar ___"
FEL|Amargor associado à bile
GAS|Estado físico sem forma nem volume próprios
LIS|Flor heráldica ligada à monarquia francesa
ORA|Conjunção que alterna argumentos ou forma do verbo orar
OVA|Massa de ovos de certos peixes
PAR|Número divisível por dois ou título de nobreza
PUA|Ponta que perfura; também, instrumento de carpinteiro
RES|Cabeça de gado, no singular
ZEN|Escola budista associada à meditação sentada
ALMA|Essência de algo ou interior de um cano de arma
ARCO|Trecho de circunferência ou arma que dispara flechas
ARTE|Ofício, engenho ou uma das belas expressões humanas
ATOR|Intérprete ou participante de um processo social
BASE|Pode neutralizar um ácido ou sustentar um edifício
BICO|Parte da ave que também designa trabalho ocasional
BODE|Animal que pode virar expiatório
BOLA|Pode ser de cristal ou dividida em campo
CABO|Graduação militar, acidente geográfico ou fio condutor
CAMA|Lugar que se faz antes de nele se deitar
CANA|Pode produzir açúcar ou designar prisão na gíria
CANO|Conduto ou calote, em uso coloquial
CAPA|Protege um livro ou oculta um disfarce
CARA|Uma face da moeda que não é coroa
CASA|Morada ou uma posição no tabuleiro
CEIA|Refeição que sucede o jantar em certas tradições
CELA|Aposento monástico ou prisional
CERA|Matéria das velas e dos favos
COLA|Une superfícies ou ajuda ilícita numa prova
COLO|Parte entre ombros e cabeça; também, regaço
CONE|Sólido obtido ao girar um triângulo retângulo por um cateto
CORO|Conjunto de vozes que pode falar em uníssono
DADO|Informação ou sólido usado em jogos de azar
DAMA|Peça que se move como torre e bispo no xadrez
DATA|Pode ser magna, venia ou de nascimento
DOSE|Quantidade prescrita de um medicamento
DUNA|Relevo que o vento constrói com areia
EIXO|Reta de rotação ou peça que sustenta rodas
ERMO|Lugar desabitado, em linguagem literária
FADO|Destino ou gênero musical lusitano
FARO|Olfato apurado ou aptidão para perceber oportunidades
FATO|Acontecimento verificável, em vez de mera opinião
FENO|Forragem obtida pela secagem de gramíneas
FETO|Estágio de desenvolvimento posterior ao embrionário
FILA|Pode ser indiana sem ter relação com a Índia
FITA|Película cinematográfica, em uso antigo
FOCO|Ponto de convergência ou centro de atenção
FOGO|Um dos quatro elementos da tradição clássica
FOME|É saciada, mas pode ser de saber
FONTE|Origem de uma notícia ou desenho de letras
FORO|Âmbito de competência de um juízo
FOSSO|Escavação defensiva ou separação profunda
FREI|Tratamento que antecede o nome de um religioso
FUGA|Forma musical contrapontística ou evasão
FUSO|Objeto da fiandeira que também divide horários
GALO|Ave que também pode surgir depois de uma pancada
GAMA|Série de possibilidades ou terceira letra grega
GATO|Pode ser felino, ligação clandestina ou erro tipográfico
GELO|Quebra-se numa conversa sem baixar a temperatura
GENE|Unidade hereditária presente nos cromossomos
GUME|Parte cortante de uma lâmina
HERA|Trepadeira cujo nome coincide com o de uma deusa grega
HINO|Composição que pode ser nacional ou litúrgica
IATE|Embarcação de recreio, geralmente luxuosa
ILHA|Terra cercada de água, ou área isolada numa cozinha
IRIS|Controla a entrada de luz nos olhos
JOGO|Pode ser de cintura sem haver competição
JUGO|Canga que também simboliza opressão
JURI|Conselho que julga determinados crimes
LAGO|Depressão ocupada por água sem ligação obrigatória com o mar
LAMA|Mistura de terra e água que também mancha reputações
LEME|Peça que governa o rumo de uma embarcação
LIMA|Ferramenta abrasiva ou fruto cítrico
LIRA|Instrumento de cordas associado a Orfeu
LODO|Sedimento fino de ambientes aquáticos
LUME|Claridade ou fogo, em registro literário
LUVA|Peça que pode ser de pelica, na expressão diplomática
MALA|Volume de viagem que pode ser direta na publicidade
MATO|Vegetação espontânea ou primeira pessoa de matar
MEIO|Pode ser termo, campo ou ambiente
MESA|Móvel que também dirige uma assembleia
META|Alvo de um planejamento
MICA|Mineral que se separa em lâminas finas
MITO|Narrativa fundadora ou crença sem comprovação
MOLA|Armazena energia por deformação elástica
MORA|Atraso no cumprimento de uma obrigação
MOTE|Tema de uma glosa ou ponto de partida de uma criação
MURO|Pode ser das Lamentações ou de arrimo
NATA|Camada gordurosa do leite ou elite de um grupo
NAVE|Embarcação espacial ou setor central de uma igreja
NEXO|Vínculo lógico entre ideias
NODO|Ponto de interseção de uma rede
NOME|Pode ser próprio sem indicar posse
NOTA|Pode ser fiscal, musical ou de rodapé
NULO|Sem efeito jurídico ou sem valor numérico
ODRE|Recipiente de couro usado para transportar vinho
OLMO|Árvore que dá nome a um gênero de madeira
ONDA|Pode ser eletromagnética sem movimentar água
OPUS|Designação latina de uma obra musical catalogada
ORBE|Esfera ou mundo, em linguagem literária
OURO|Metal cujo símbolo químico é Au
PALA|Parte do boné que protege os olhos
PAPA|Pontífice ou alimento de consistência pastosa
PARE|Ordem inscrita numa placa octogonal
PENA|Pode ser de ave, de prisão ou de compaixão
PICO|Cume, bico de ave ou ponto máximo de uma curva
PINO|Peça cilíndrica de fixação
PIRA|Fogueira cerimonial ou olímpica
PISO|Revestimento do chão ou valor mínimo de remuneração
PIVO|Ponto de rotação ou posição no basquete
POLO|Extremo magnético ou centro de atração
POMO|Fruto simbólico da discórdia
POTE|Recipiente que pode guardar ouro no fim do arco-íris
PROA|Parte dianteira de uma embarcação
RAMA|Conjunto de ramos e folhas de uma planta
RAMO|Galho ou setor de atividade
RATO|Roedor que pode ser de biblioteca
REDE|Entrelaçado de fios ou conjunto de conexões
REMO|Implemento de propulsão que também nomeia um esporte
RETO|Segmento do intestino ou aquilo que não se curva
RIMA|Consonância entre terminações de versos
RITO|Sequência cerimonial de uma tradição
ROCA|Instrumento manual de fiar
ROTA|Caminho previsto ou derrota desordenada
RUMO|Direção escolhida, concreta ou figurada
SAGA|Narrativa longa ligada a uma linhagem ou herói
SALA|Dependência que pode ser de aula, estar ou audiência
SEDE|Pode ser de água ou endereço de uma instituição
SEIO|Concavidade, interior ou glândula mamária
SELO|Marca de autenticação ou comprovante de postagem
SENA|Conjunto de seis acertos de uma loteria
SINA|Destino que se supõe inevitável
SINO|Instrumento que possui badalo
SISA|Antigo tributo sobre transmissão de imóveis
SOMA|Resultado de uma adição ou corpo de um organismo
SONO|Estado alterado durante a fase REM
SOPRO|Coluna de ar que produz som em certos instrumentos
TACO|Pode ir ao chão, à mesa ou a uma partida de sinuca
TALO|Haste que sustenta uma folha ou flor
TARA|Peso da embalagem descontado do peso bruto
TEIA|Trama da aranha ou enredo de intrigas
TELA|Suporte do pintor ou área de exibição digital
TEOR|Conteúdo de um documento ou concentração de uma substância
TESE|Proposição defendida ou trabalho de doutorado
TETO|Limite superior de gastos ou cobertura interna
TINO|Discernimento que falta a quem age sem juízo
TIRO|Pode ser de meta, de letra ou ao alvo
TOGA|Vestimenta cerimonial de magistrados
TOMO|Volume de uma obra dividida em partes
TRIO|Formação de três músicos ou cantores
TUBO|Sólido oco por onde pode passar um fluido
URNA|Recebe votos ou cinzas funerárias
VAGA|Posto disponível ou movimento de uma onda
VALE|Depressão entre elevações ou documento de crédito
VARA|Unidade judiciária ou haste usada no salto
VEIA|Vaso de retorno sanguíneo ou aptidão artística
VELA|Pode iluminar uma vigília ou impulsionar um barco
VERO|Verdadeiro, em registro literário
VETO|Recusa formal que impede uma aprovação
VIGA|Elemento estrutural submetido principalmente à flexão
VILA|Povoação de categoria historicamente inferior à cidade
VOTO|Pode ser secreto, de confiança ou religioso
XALE|Peça de tecido usada sobre os ombros
XISTO|Rocha metamórfica com estrutura laminar
ABACO|Instrumento de cálculo anterior às calculadoras
ACASO|O que não obedece a uma intenção aparente
ACERVO|Conjunto de bens de um museu ou biblioteca
ACIDO|Substância que doa prótons segundo Brønsted
ADAGIO|Andamento musical lento ou provérbio tradicional
ADENDO|Acréscimo posterior ao texto original
AFORISMO|Máxima breve que condensa uma reflexão
AGORA|Instante presente ou praça pública da Grécia antiga, sem acento
ALIBI|Prova de que o suspeito estava em outro lugar
ALUDE|Massa de neve que despenca de uma encosta
AMBAR|Resina fóssil que pode aprisionar insetos
AMPERE|Unidade de corrente elétrica no SI
ANAFORA|Repetição de palavras no começo de frases sucessivas
ANATEMA|Condenação solene ou excomunhão
ANEXO|Documento juntado a outro ou dependência contígua
ANTITESE|Figura de linguagem que aproxima ideias opostas
APATIA|Ausência de interesse ou de reação afetiva
APICE|Ponto culminante de uma trajetória
APOGEU|Ponto orbital mais distante da Terra
ARAME|Fio metálico usado em cercas
ARAUTO|Mensageiro que fazia proclamações oficiais
ARCADIA|Lugar idealizado de vida pastoril
ARESTA|Interseção de duas faces de um poliedro
ARGILA|Matéria plástica que a queima transforma em cerâmica
ARQUIVO|Conjunto documental ou unidade de dados digitais
ARROIO|Curso de água pequeno, especialmente no Sul do Brasil
ASTROLABIO|Instrumento antigo para medir a altura dos astros
ATAVISMO|Reaparecimento de um traço ancestral
ATIMO|Intervalo de tempo extremamente breve
ATLAS|Titã condenado a sustentar o céu
AXIOMA|Proposição aceita como ponto de partida de uma teoria
AZIMUTE|Ângulo horizontal medido a partir do norte
BALAUSTRE|Pequena coluna que integra um parapeito
BARLAVENTO|Lado de onde sopra o vento
BASILICA|Igreja distinguida por um título honorífico pontifício
BAUXITA|Principal minério de que se extrai alumínio
BIGORNA|Bloco de ferro usado pelo ferreiro
BISSETRIZ|Semirreta que divide um ângulo em dois iguais
BRASAO|Composição de símbolos heráldicos
CADINHO|Recipiente resistente usado para fundir metais
CANONE|Conjunto de obras consideradas modelares
CATARSE|Purificação emocional associada à experiência trágica
ZENITE|Ponto da esfera celeste diretamente acima do observador
CETRO|Bastão que simboliza o poder de um soberano
CINISMO|Escola filosófica de Diógenes ou desfaçatez moral
CLAUSTRO|Pátio cercado por galerias num mosteiro
CLIVAGEM|Tendência de um mineral a partir-se segundo certos planos
COESO|Cujas partes mantêm ligação firme
COGNATO|Vocábulo que compartilha origem com outro
COROLARIO|Consequência imediata de um teorema
CUPULA|Cobertura em forma de abóbada ou direção de uma organização
DADIVA|Aquilo que se oferece sem exigir compensação
DECORO|Compostura exigida no exercício de um cargo
DELTA|Letra grega que nomeia uma foz ramificada
DIAPASAO|Fornece uma frequência de referência para afinar instrumentos
DITONGO|Encontro de vogal e semivogal na mesma sílaba
EBANO|Madeira escura e densa, valiosa na marcenaria
ECLETICO|Que reúne ou aprecia tendências distintas
EFIGIE|Representação de uma pessoa em moeda ou monumento
ELIPSE|Curva cônica ou omissão de um termo recuperável
EMPATIA|Capacidade de compreender a perspectiva alheia
ENTALPIA|Grandeza termodinâmica representada por H
ENTROPIA|Grandeza associada à dispersão de energia num sistema
EPIFANIA|Manifestação súbita de uma compreensão
EPITETO|Qualificação acrescentada ao nome de alguém
ERARIO|Conjunto dos recursos financeiros do Estado
ERUDITO|Dotado de conhecimento amplo adquirido pelo estudo
ESBOCO|Primeira forma de uma obra ainda incompleta
ESCARPA|Encosta de declive acentuado
ESPECTRO|Distribuição de frequências ou aparição fantasmagórica
ESTIGMA|Marca de desonra ou parte receptora do pólen
ESTOICO|Seguidor da escola de Zenão de Cítio
ETIMO|Forma linguística que deu origem a uma palavra
EXEGESE|Interpretação minuciosa de um texto, sobretudo religioso
EXODO|Saída em massa de uma população
FALACIA|Raciocínio enganoso com aparência de validade
FATUO|Vaidoso e presunçoso; pode qualificar um fogo ilusório
FENDA|Abertura estreita numa superfície
FEUDO|Domínio territorial característico da sociedade medieval
FILAO|Veio mineral ou oportunidade lucrativa
FONEMA|Menor unidade sonora capaz de distinguir significados
FRISO|Faixa ornamental na parte superior de uma parede
FULCRO|Ponto de apoio de uma alavanca
FURTIVO|Que procura passar despercebido
GABARITO|Molde de referência ou relação de respostas corretas
GAIOLA|Estrutura de Faraday que bloqueia campos elétricos externos
GEODO|Cavidade rochosa revestida internamente de cristais
GLOSA|Comentário explicativo ou recusa de uma despesa
GNOMON|Haste cuja sombra indica as horas num relógio solar
GRALHA|Ave ou erro de composição tipográfica
HABITAT|Ambiente natural de uma espécie
HEGEMONIA|Predomínio de um grupo sobre os demais
HIATO|Encontro de vogais em sílabas distintas
HUMUS|Matéria orgânica decomposta que enriquece o solo
ICONE|Imagem religiosa ou representação gráfica de uma função
IDILIO|Narrativa ou situação de amor terno e idealizado
ILACAO|Conclusão extraída de fatos ou premissas
IMANENTE|Que pertence à própria natureza de algo
IMPASSE|Situação em que nenhuma saída parece disponível
INCISO|Subdivisão de um artigo de lei marcada por algarismo romano
INERCIA|Resistência à mudança do estado de movimento
INOCUO|Que não causa dano nem produz efeito
INSIGNE|Notável por mérito ou excelência
ISTMO|Faixa de terra que liga duas porções continentais
JASPE|Variedade opaca de quartzo usada como pedra ornamental
JURISDICAO|Poder de aplicar o direito a um caso concreto
LACONICO|Que se exprime com poucas palavras
LASTRO|Peso que dá estabilidade a uma embarcação
LATENCIA|Intervalo entre um estímulo e sua resposta
LEGADO|Herança material ou intelectual deixada a sucessores
LEMA|Proposição auxiliar usada para demonstrar um teorema
LEXICO|Conjunto de palavras de uma língua
LIAME|Vínculo que une pessoas, fatos ou ideias
LIMIAR|Soleira de uma porta ou ponto inicial de uma percepção
LINFA|Líquido que circula nos vasos do sistema linfático
LITOTE|Figura que afirma uma ideia pela negação de seu contrário
LUDICO|Relacionado ao brincar e aos jogos
MALEAVEL|Que pode ser reduzido a lâminas sem se romper
MATRIZ|Arranjo de números em linhas e colunas
MEANDRO|Curva sinuosa no percurso de um rio
MERIDIANO|Semicírculo imaginário que liga os polos terrestres
METAFORA|Transferência de sentido por semelhança implícita
METONIMIA|Substituição de um termo por outro de relação próxima
METRICA|Estudo da medida dos versos
MIMETISMO|Semelhança adaptativa de um organismo com outro ou com o meio
MONOLITO|Monumento feito de um único bloco de pedra
MORFEMA|Menor unidade linguística portadora de significado
NADIR|Ponto celeste diametralmente oposto ao zênite
NEBULOSA|Nuvem interestelar de gás e poeira
NEOLOGISMO|Palavra ou acepção recém-criada
NIMBO|Nuvem de chuva ou auréola em imagens religiosas
NOMADE|Que se desloca sem residência fixa
NUANCE|Diferença sutil de tonalidade ou de sentido
OBICE|Aquilo que impede ou dificulta uma ação
OBLIQUO|Inclinado em relação a uma referência
OCASO|Poente de um astro ou decadência de um poder
OLARIA|Oficina que fabrica peças de barro cozido
ONIRICO|Relativo aos sonhos
OPROBRIO|Desonra pública que provoca vergonha
ORACULO|Resposta divina ou lugar em que era consultada
ORVALHO|Condensação do vapor de água sobre superfícies frias
OSMOSE|Passagem de solvente por membrana semipermeável
OSTRACISMO|Exílio político ateniense ou afastamento social
OXIMORO|União de palavras de sentidos contraditórios
PALINDROMO|Expressão que se lê igualmente nos dois sentidos
PANACEIA|Remédio a que se atribui a cura de todos os males
PARADOXO|Afirmação aparentemente contraditória que desafia a intuição
PARCIMONIA|Economia no uso de recursos ou explicações
PATINA|Película que o tempo forma sobre metais e outras superfícies
PENUMBRA|Região parcialmente iluminada entre luz e sombra
PERIGEU|Ponto orbital mais próximo da Terra
PERIPLO|Viagem marítima em torno de um território
PETRIFICAR|Transformar em pedra ou paralisar de espanto
PIGMENTO|Substância responsável por uma coloração
PINACOTECA|Coleção ou museu de pinturas
PLASMA|Parte líquida do sangue ou gás ionizado
PLEONASMO|Redundância de termos numa expressão
PREAMBULO|Texto introdutório de uma lei ou tratado
PREMISSA|Proposição de que parte um raciocínio
PRISMA|Sólido óptico que pode decompor a luz branca
PROLIXO|Que emprega mais palavras do que o necessário
PROPOSICAO|Enunciado que pode ser verdadeiro ou falso
QUIMERA|Monstro mitológico ou sonho impossível
QUINHAO|Parte que cabe a alguém numa divisão
RAVINA|Sulco profundo aberto pela erosão da água
RECIFE|Formação submersa ou aflorante que oferece risco à navegação
REDUTO|Último local de resistência ou abrigo
REFRACAO|Mudança de direção de uma onda ao passar entre meios
RELEVO|Conjunto das formas da superfície terrestre
REQUIEM|Composição musical ligada à missa pelos mortos
RETORICA|Arte de construir um discurso persuasivo
RIZOMA|Caule subterrâneo de crescimento horizontal
RUBRICA|Assinatura abreviada ou título de uma categoria contábil
RUPIA|Moeda usada na Índia e no Sri Lanka
SARCASMO|Ironia mordaz usada para ridicularizar
SECESSAO|Separação política de parte de um território
SEIXO|Fragmento de rocha arredondado pelo desgaste
SEMANTICA|Estudo linguístico dos significados
SILOGISMO|Raciocínio dedutivo composto de duas premissas e uma conclusão
SIMBIOSE|Associação íntima e duradoura entre organismos de espécies distintas
SINAPSE|Região de comunicação entre neurônios
SINEDOQUE|Figura que emprega a parte pelo todo ou o todo pela parte
SINTAXE|Estudo das relações entre termos de uma oração
SISMO|Abalo da crosta terrestre
SOBERBA|Orgulho excessivo, contado entre os pecados capitais
SOLSTICIO|Instante que marca a máxima declinação solar ao norte ou ao sul
SONETO|Poema tradicionalmente composto de catorze versos
SOPESAR|Avaliar o peso ou considerar cuidadosamente
SOTAVENTO|Lado protegido do vento
SUBLIME|Aquilo que inspira elevação ou grandeza estética
TACITO|Que se entende sem ter sido expresso
TALUDE|Superfície inclinada que limita uma escavação ou aterro
TANGENTE|Reta que toca uma curva num ponto sem atravessá-la localmente
TEOREMA|Proposição que exige demonstração a partir de hipóteses
TIMBRE|Qualidade que distingue sons da mesma altura e intensidade
TORPOR|Estado de redução da atividade ou da sensibilidade
TRAMA|Fios transversais de um tecido ou enredo de uma narrativa
TREGUA|Suspensão temporária das hostilidades
TRIBUTO|Prestação obrigatória ao Estado ou homenagem
TROPISMO|Crescimento orientado em resposta a um estímulo externo
TUNDRA|Bioma frio com vegetação baixa e solo frequentemente congelado
UMBRAL|Entrada ou limiar de uma porta
UNISSONO|Execução de uma mesma altura musical por várias vozes
UTOPIA|Projeto de sociedade ideal cuja realização parece impossível
VASSALO|Quem devia fidelidade e serviços a um senhor feudal
VATICINIO|Predição de um acontecimento futuro
VERBETE|Unidade de consulta de um dicionário ou enciclopédia
VERNACULO|Próprio da língua de um país
VERTICE|Ponto comum a arestas de um poliedro
VESTIGIO|Indício deixado por algo que já passou
VIES|Tendência que pode distorcer uma interpretação
VITRAL|Painel formado por peças de vidro colorido
VOLATIL|Que evapora facilmente ou muda com rapidez
ZEUGMA|Omissão de um termo já expresso anteriormente
`;
export const CHALLENGING_CLUES: ClueEntry[] = BANK.trim()
  .split("\n")
  .map((line) => {
    const [answer, clue] = line.split("|");
    return { answer, clue };
  });
