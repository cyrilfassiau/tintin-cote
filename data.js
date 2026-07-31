


const ALBUMS = [
  { slug: 'tintin-au-pays-des-soviets',  titre: 'Tintin au pays des Soviets',   annee: 1930, eo: 42000, nb: true  },
  { slug: 'tintin-au-congo',             titre: 'Tintin au Congo',              annee: 1931, eo: 22000, nb: true  },
  { slug: 'tintin-en-amerique',          titre: 'Tintin en Amérique',           annee: 1932, eo: 26000, nb: true  },
  { slug: 'les-cigares-du-pharaon',      titre: 'Les Cigares du Pharaon',       annee: 1934, eo: 14000, nb: true  },
  { slug: 'le-lotus-bleu',               titre: 'Le Lotus bleu',                annee: 1936, eo: 18000, nb: true  },
  { slug: 'l-oreille-cassee',            titre: "L'Oreille cassée",             annee: 1937, eo: 7200,  nb: true  },
  { slug: 'l-ile-noire',                 titre: "L'Île Noire",                  annee: 1938, eo: 6800,  nb: true  },
  { slug: 'le-sceptre-d-ottokar',        titre: "Le Sceptre d'Ottokar",         annee: 1939, eo: 6400,  nb: true  },
  { slug: 'le-crabe-aux-pinces-d-or',    titre: "Le Crabe aux pinces d'or",     annee: 1941, eo: 5600,  nb: true  },
  { slug: 'l-etoile-mysterieuse',        titre: "L'Étoile mystérieuse",         annee: 1942, eo: 2400,  nb: false },
  { slug: 'le-secret-de-la-licorne',     titre: 'Le Secret de la Licorne',      annee: 1943, eo: 2600,  nb: false },
  { slug: 'le-tresor-de-rackham-le-rouge', titre: 'Le Trésor de Rackham le Rouge', annee: 1944, eo: 2300, nb: false },
  { slug: 'les-7-boules-de-cristal',     titre: 'Les 7 Boules de cristal',      annee: 1948, eo: 1500,  nb: false },
  { slug: 'le-temple-du-soleil',         titre: 'Le Temple du Soleil',          annee: 1949, eo: 1350,  nb: false },
  { slug: 'tintin-au-pays-de-l-or-noir', titre: "Tintin au pays de l'or noir",  annee: 1950, eo: 1250,  nb: false },
  { slug: 'objectif-lune',               titre: 'Objectif Lune',                annee: 1953, eo: 950,   nb: false },
  { slug: 'on-a-marche-sur-la-lune',     titre: 'On a marché sur la Lune',      annee: 1954, eo: 900,   nb: false },
  { slug: 'l-affaire-tournesol',         titre: "L'Affaire Tournesol",          annee: 1956, eo: 780,   nb: false },
  { slug: 'coke-en-stock',               titre: 'Coke en stock',                annee: 1958, eo: 700,   nb: false },
  { slug: 'tintin-au-tibet',             titre: 'Tintin au Tibet',              annee: 1960, eo: 640,   nb: false },
  { slug: 'les-bijoux-de-la-castafiore', titre: 'Les Bijoux de la Castafiore',  annee: 1963, eo: 420,   nb: false },
  { slug: 'vol-714-pour-sydney',         titre: 'Vol 714 pour Sydney',          annee: 1968, eo: 260,   nb: false },
  { slug: 'tintin-et-les-picaros',       titre: 'Tintin et les Picaros',        annee: 1976, eo: 130,   nb: false },
  { slug: 'tintin-et-l-alph-art',        titre: "Tintin et l'Alph-Art",         annee: 1986, eo: 90,    nb: false }
];


const SERIES = {
  P: {
    code: 'P', nom: 'Série P', periode: '1930 – 1934',
    resume: 'Quatrième plat « Éditions du Petit Vingtième ».',
    detail: 'Les tout premiers albums, publiés avant le passage chez Casterman. Extrêmement rares, très recherchés. Attention aux fac-similés.',
    couleur: '#891245'
  },
  A: {
    code: 'A', nom: 'Série A', periode: '1937 – 1945',
    resume: 'Tintin et Milou, le doigt levé.',
    detail: 'Albums Casterman en noir et blanc, puis les premières éditions couleurs. Le dos, les pages de garde et la page 62 permettent d’affiner la datation.',
    couleur: '#BE4949'
  },
  B: {
    code: 'B', nom: 'Série B', periode: '1945 – 1975',
    resume: 'Illustration avec Haddock, Tournesol, les Dupondt…',
    detail: 'La série la plus vaste (B1 à B42). Mono-colonne jusqu’en 1951, puis deux colonnes de titres. C’est ici que se joue l’essentiel du marché.',
    couleur: '#187EAC'
  },
  C: {
    code: 'C', nom: 'Série C', periode: '1976 – 2010',
    resume: 'Mosaïque des couvertures de tous les albums.',
    detail: 'Rééditions modernes. Peu recherchées individuellement, mais certaines variantes gardent une vraie valeur.',
    couleur: '#FCAC51'
  },
  D: {
    code: 'D', nom: 'Série D', periode: '2011 → aujourd’hui',
    resume: 'Mosaïque sur la moitié du quatrième plat.',
    detail: 'Éditions courantes, code-barres systématique. Valeur proche du prix neuf, sauf tirages spéciaux.',
    couleur: '#727272'
  }
};


const VARIANTES = [
  ['P1', 1930], ['P2', 1932], ['P3', 1934],
  ['A1', 1937], ['A2', 1938], ['A3', 1939], ['A20', 1940], ['A21', 1941],
  ['A22', 1942], ['A23', 1943], ['A24', 1944], ['A25', 1945],
  ['B1', 1946], ['B2', 1947], ['B3', 1948], ['B4', 1949], ['B5', 1950],
  ['B6', 1951], ['B7', 1952], ['B8', 1953], ['B11', 1954], ['B12', 1955],
  ['B13', 1956], ['B14', 1957], ['B16', 1958], ['B18', 1959], ['B20', 1960],
  ['B21', 1961], ['B22', 1962], ['B23', 1963], ['B24', 1964], ['B25', 1965],
  ['B26', 1966], ['B27', 1967], ['B28', 1968], ['B29', 1969], ['B30', 1970],
  ['B31', 1971], ['B33', 1972], ['B35', 1973], ['B38', 1974], ['B42', 1975],
  ['C1', 1976], ['C2', 1979], ['C3', 1982], ['C4', 1986], ['C5', 1990],
  ['C6', 1995], ['C7', 2000], ['C8', 2005], ['C9', 2009],
  ['D1', 2011], ['D2', 2015], ['D3', 2019], ['D4', 2023]
].map(([code, annee]) => ({ code, annee, serie: code[0] }));


const ETATS = [
  { code: 'N',  nom: 'Neuf',          coef: 1.35, desc: 'Aucune marque sur les plats ni sur les bords, coiffes intactes, intérieur parfait.' },
  { code: 'TBE', nom: 'Très bon état', coef: 1.00, desc: 'Proche du neuf : plats légèrement matifiés, un coin très légèrement tapé.', ref: true },
  { code: 'BE', nom: 'Bon état',      coef: 0.62, desc: 'Bien conservé et manipulé avec soin : plats matifiés, rayures, pliures légères.' },
  { code: 'EM', nom: 'État moyen',    coef: 0.34, desc: 'Accumulation de défauts, léger décollement des pages, coiffes usées.' },
  { code: 'ME', nom: 'Mauvais état',  coef: 0.11, desc: 'Couverture abîmée, pages manquantes ou déchirées, dos fragilisé.' }
];


const OPTIONS = [
  { code: 'dos-toile',  nom: 'Dos rond toilé',        aide: 'Toile rouge ou bleue collée sur le dos — typique des séries A et B anciennes.', mod: 0.18, series: ['P', 'A', 'B'] },
  { code: 'garde-bleu', nom: 'Pages de garde bleu foncé', aide: 'Les gardes bleu foncé précèdent les gardes bleu clair.', mod: 0.12, series: ['A', 'B'] },
  { code: 'jaquette',   nom: 'Jaquette d’origine',    aide: 'Présente sur certains tirages, elle est presque toujours perdue.', mod: 0.25, series: ['A', 'B'] },
  { code: 'dedicace',   nom: 'Dédicace ou dessin d’Hergé', aide: 'Authentification obligatoire — la surcote peut être considérable.', mod: 1.40, series: ['P', 'A', 'B', 'C'] },
  { code: 'ex-libris',  nom: 'Ex-libris / tirage de tête', aide: 'Tirage limité accompagné d’une pièce signée et numérotée.', mod: 0.45, series: ['C', 'D'] }
];
