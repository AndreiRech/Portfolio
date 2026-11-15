// Builds the Termo word lists from fserb/pt-br (MIT), the lexicon behind the
// original Termo: a lexicon, verb conjugations and corpus frequency scores.

/** Five letters, Portuguese accents allowed. */
const WORD = /^[a-záàâãéêíóôõúç]{5}$/;

export const stripAccents = (word) => word.normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * Common words that make poor daily answers: names and places, loanwords,
 * spellings from Portugal, abbreviations, slurs and profanity.
 */
export const EXCLUDED = new Set(
  `maria jesus bruno goiás japão china braga vasco sousa chico índia césar nunes
  moura piauí chile celso egito abreu marte júlio diogo marta joana laura mauro
  penha síria queen weber angra adobe henry diana milão bauru simão amapá guiné
  couto nobel timão ibope judas macau siena lúcio jeová lauro dante romeu dunga
  tietê cotia elena ávila tarso gávea cairo congo mafra póvoa bangu lobão apolo
  bessa araxá barça caicó erica vilar romão tatuí tróia túlio rolim ítalo antão
  célio xangô óscar piraí alana vanda islão creta avaré aruba leone jango parma
  copel édipo acari trofa umbro irina matão jacuí iansã caeté timbó jataí ceres
  betel ícaro torga tirso berta boris otávio guaçu tutti hasta troia mirim
  light black login flash drive mouse jeans laser ultra color multi green skate
  stand blues crack cache cover staff clean break combo trans sedan nylon grill
  hobby rally front paper pixel close lobby remix round swing coach xerox rugby
  match reiki drink apart strip relax still rouge mixer derby ferry botox error
  buggy gnome novel train jumbo input blast modus penny catch sheik lycra kraft
  coupé mango honor blend suede crush tecno rebel dolly swell hedge plush squid
  shoyu chili ethos twist logon tetra timer hacer slide short spray modem infra
  micro hidro neuro proto ratio flame alter major cupom porno pornô drops caput
  recta facto tecto betão logar loiça zinho praca impar uréia jóias numas cousa
  merda porra bunda tesão foder bosta viado pênis seios fezes orgia sêmen tetas
  vulva corno bicha nudez jihad reich aedes lepra útero cólon fecal anais cusco
  sarro zorra rabão rasto pimba pirex trips girão rasca sanca coura dinda sinhá
  ibero anglo óbice cariz donde carte chica crato fraga souto veiga timor tesla
  toner trial guião duche quota corsa veras grado roque modal veado judeu táxis
  gibis netos novos secos altos autos artes bocas copas copos damas dores ervas
  esses fiéis fogos gases horas luvas meias olhos ossos patos ramos unhas dados
  todos delas epóxi mento ganga batel basal maçom cisto régia sacro marra
  blush blitz retro refil babel áries curry hindu hindi sioux flush foyer
  tweed curie emoji deprê clown yacht husky higgs gauss kanji slack`.split(
    /\s+/,
  ),
);

/**
 * Answers are lexicon entries (not verb forms or plurals) ordered by corpus
 * frequency; guesses also accept conjugations and plurals.
 */
export function buildWordLists(
  { lexicon, conjugations, frequency },
  size = 700,
) {
  const lexical = lexicon.filter((word) => WORD.test(word));
  const lexiconSet = new Set(lexicon);
  const verbs = new Set(conjugations.filter((word) => WORD.test(word)));
  const plurals = lexicon
    .map((word) => `${word}s`)
    .filter((word) => WORD.test(word));
  const answers = lexical
    .filter(
      (word) =>
        frequency.has(word) &&
        !verbs.has(word) &&
        !EXCLUDED.has(word) &&
        !(word.endsWith("s") && lexiconSet.has(word.slice(0, -1))),
    )
    .sort((a, b) => frequency.get(a) - frequency.get(b))
    .slice(0, size)
    .sort((a, b) => a.localeCompare(b, "pt"));
  // One spelling per unaccented key: the answer's, else the most frequent.
  const byKey = new Map();
  const rank = (word) =>
    answers.includes(word) ? -1 : (frequency.get(word) ?? Infinity);
  for (const word of [...lexical, ...verbs, ...plurals]) {
    const key = stripAccents(word);
    const known = byKey.get(key);
    if (!known || rank(word) < rank(known)) byKey.set(key, word);
  }
  const answerKeys = new Set(answers.map(stripAccents));
  const valid = [...byKey.values()]
    .filter((word) => !answerKeys.has(stripAccents(word)))
    .sort((a, b) => a.localeCompare(b, "pt"));
  return { answers, valid };
}
