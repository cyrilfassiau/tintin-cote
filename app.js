



const $ = (sel, ctx = document) => ctx.querySelector(sel);

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function seeded(key) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const eur = n => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);


function arrondi(v) {
  if (v >= 10000) return Math.round(v / 500) * 500;
  if (v >= 2000) return Math.round(v / 100) * 100;
  if (v >= 500) return Math.round(v / 50) * 50;
  if (v >= 100) return Math.round(v / 10) * 10;
  if (v >= 30) return Math.round(v / 5) * 5;
  return Math.max(6, Math.round(v));
}


function prixVente(v) {
  if (v >= 5000) return Math.round(v / 100) * 100;
  if (v >= 1000) return Math.round(v / 25) * 25;
  if (v >= 200) return Math.round(v / 5) * 5;
  return Math.max(5, Math.round(v));
}

const albumBySlug = slug => ALBUMS.find(a => a.slug === slug);
const cover = a => `assets/covers/${a.slug}.png`;




const serieDe = plat => plat === 'blanc' ? 'V' : plat[0];
const nomPlat = e => e.plat === 'blanc' ? '2e plat blanc' : `2e plat ${e.plat}`;
const codePlat = e => e.plat === 'blanc' ? 'Blanc' : e.plat;

// Une variante sans cote (cote: null dans data.js) reste listée — elle sert à identifier
// l'exemplaire — mais ne peut pas être estimée, faute de montant de référence à pondérer
// par l'état. Deux situations très différentes derrière ce même vide, à expliciter :
//   • le catalogue BDM ne lui attribue volontairement aucune cote (édition douteuse) ;
//   • la cote existe mais n'a pas encore été reprise dans nos données.
const MOTIFS_SANS_COTE = {
  doute: {
    une: 'Le catalogue BDM ne donne aucune cote à cette variante, dont l’existence même est mise en doute. Elle est listée à titre documentaire.',
    plusieurs: 'Le catalogue BDM ne leur donne aucune cote&nbsp;: leur existence même est mise en doute. Elles sont listées à titre documentaire.'
  },
  nonReleve: {
    une: 'La cote de cette variante n’a pas encore été relevée dans nos données. Elle deviendra sélectionnable dès qu’elle sera renseignée.',
    plusieurs: 'Leur cote n’a pas encore été relevée dans nos données. Elles deviendront sélectionnables dès qu’elles seront renseignées.'
  }
};
const motifSansCote = e => /mise en doute/i.test(e.desc || '') ? 'doute' : 'nonReleve';

// Cotes et descriptions issues de data.js ; ventes et tendance restent simulées.
function editions(album) {
  return album.editions.map((e, i) => {
    const rnd = seeded(album.slug + i);
    return {
      ...e, id: String(i), serie: serieDe(e.plat),
      ventes: 3 + Math.floor(rnd() * 26),
      tendance: Math.round((rnd() * 30 - 8) * 10) / 10
    };
  });
}

const editionsSerie = (album, serie) => editions(album).filter(e => e.serie === serie);
const seriesDispo = album => Object.keys(SERIES).filter(s => editionsSerie(album, s).length);
const coteEO = album => {
  const eo = album.editions.filter(e => e.eo && e.cote != null);
  return eo.length ? Math.max(...eo.map(e => e.cote)) : null;
};
const nbEditions = () => ALBUMS.reduce((n, a) => n + a.editions.length, 0);



function estimer(album, edition, etatCode) {
  const etat = ETATS.find(e => e.code === etatCode);
  const base = edition.cote;
  const apresEtat = base * etat.coef;
  const total = apresEtat;
  return {
    base, etat, apresEtat,
    total: arrondi(total),
    bas: arrondi(total * 0.82),
    haut: arrondi(total * 1.24),
    ventes: edition.ventes,
    tendance: edition.tendance
  };
}



function platSVG(serie) {
  const c = SERIES[serie].couleur;
  const cadre = (inner, fond) =>
    `<svg class="plat" viewBox="0 0 88 112" role="img" aria-label="2e plat ${serie}">
       <rect x="1" y="1" width="86" height="110" rx="3" fill="${fond}" stroke="rgba(0,0,0,.16)"/>
       ${inner}
     </svg>`;
  const lignes = (x, y, n, w, gap = 6) =>
    Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${y + i * gap}" width="${w}" height="2.4" rx="1.2" fill="rgba(0,0,0,.3)"/>`).join('');

  if (serie === 'P') {
    return cadre(`<rect x="10" y="14" width="68" height="30" rx="2" fill="rgba(255,255,255,.55)"/>
      ${lignes(16, 24, 3, 56, 7)}${lignes(16, 56, 6, 56)}`, '#e6d3c2');
  }
  if (serie === 'A') {
    return cadre(`<circle cx="26" cy="34" r="13" fill="${c}" opacity=".85"/>
      <rect x="24.5" y="14" width="3" height="10" rx="1.5" fill="${c}"/>
      ${lignes(46, 22, 4, 28)}${lignes(14, 60, 8, 60, 5.6)}`, '#f2ece2');
  }
  if (serie === 'B') {
    const tetes = [0, 1, 2, 3].map(i => `<circle cx="${16 + i * 19}" cy="26" r="8" fill="${c}" opacity="${0.45 + i * 0.16}"/>`).join('');
    return cadre(`${tetes}${lignes(10, 46, 9, 32, 6)}${lignes(48, 46, 9, 32, 6)}`, '#e9f1f5');
  }
  if (serie === 'C') {
    let g = '';
    for (let r = 0; r < 6; r++) for (let k = 0; k < 5; k++)
      g += `<rect x="${8 + k * 15}" y="${8 + r * 16.5}" width="12" height="13.5" rx="1" fill="${c}" opacity="${0.3 + ((r + k) % 4) * 0.17}"/>`;
    return cadre(g, '#fdf6ea');
  }
  return cadre('', '#f7f5f0');
}


// Aperçu photographique du 2e plat, affiché au survol d'une variante (étape 2).
// Le visuel est indexé sur le CODE du plat, pas sur la variante : un B24 est le même
// 2e plat quel que soit l'album. 102 fichiers couvrent donc les 809 variantes.
//   assets/plats/b24.png, assets/plats/a18.png, assets/plats/p6-bis.png, assets/plats/blanc.png…
// Pour forcer un visuel sur une seule variante, passez un 7e argument à E() dans data.js.
// Tant qu'un fichier manque, la vignette dessinée par platSVG() sert de repère.
const fichierPlat = code => code
  .toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const imagePlat = e => e.img || `assets/plats/${fichierPlat(codePlat(e))}.png`;

let apercuEl = null, apercuCible = null;

function montrerApercu(btn, e) {
  if (!apercuEl) {
    apercuEl = document.createElement('div');
    apercuEl.className = 'plat-preview';
    document.body.appendChild(apercuEl);
  }
  apercuEl.classList.remove('has-img');
  apercuEl.innerHTML = `
    <div class="pp-viz">
      ${platSVG(serieDe(e.plat))}
      <img alt="2e plat ${esc(codePlat(e))}">
    </div>
    <span class="ppt">${nomPlat(e)}</span>
    <span class="ppd">${e.annee}${e.dos ? ' · ' + SIGLES_DOS[e.dos] : ''}</span>
    <span class="ppn">Visuel à venir — repère ${SERIES[serieDe(e.plat)].nom}</span>`;

  const img = apercuEl.querySelector('img');
  img.addEventListener('load', () => apercuEl.classList.add('has-img'));
  img.src = imagePlat(e);

  apercuCible = btn;
  placerApercu();
  apercuEl.classList.add('on');
}

function placerApercu() {
  if (!apercuCible || !apercuEl) return;
  const r = apercuCible.getBoundingClientRect();
  const w = apercuEl.offsetWidth, h = apercuEl.offsetHeight;
  const x = Math.min(r.right + 16, window.innerWidth - w - 12);
  const y = Math.min(Math.max(12, r.top + r.height / 2 - h / 2), window.innerHeight - h - 12);
  apercuEl.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
}

function cacherApercu() {
  apercuCible = null;
  if (apercuEl) apercuEl.classList.remove('on');
}


// INUTILISÉE — les blocs « Ventes comparables » et « Évolution de la cote » ont été retirés
// de l'écran de résultat. Conservée ici, avec courbeSVG(), pour pouvoir les réactiver.
function ventesComparables(album, edition, etat) {
  const rnd = seeded(album.slug + edition.id + etat.code);
  const sites = ['Vente aux enchères — Paris', 'Libraire spécialisé', 'Enchères en ligne', 'Salon du livre ancien', 'Vente privée'];
  const etats = ETATS.filter(e => Math.abs(e.coef - etat.coef) < 0.45);
 
  const mois = [2, 7, 12, 18].map(m => m + Math.floor(rnd() * 3));
  return mois.map((recul, i) => {
    const e = etats[i % etats.length];
    const d = new Date(2026, 6 - recul, 1 + Math.floor(rnd() * 27));
    return {
      date: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      lieu: sites[Math.floor(rnd() * sites.length)],
      etat: e.nom, code: e.code,
      prix: prixVente(edition.cote * e.coef * (0.74 + rnd() * 0.58))
    };
  }).sort((a, b) => b.prix - a.prix);
}

// INUTILISÉE — voir la note sur ventesComparables().
function courbeSVG(album, edition) {
  const rnd = seeded(album.slug + edition.id + 'trend');
  const n = 7, pts = [];
  let v = 100;
  for (let i = 0; i < n; i++) { pts.push(v); v *= 1 + (edition.tendance / 100 / n) + (rnd() - 0.5) * 0.06; }
  const min = Math.min(...pts), max = Math.max(...pts), w = 300, h = 76;
  const xy = pts.map((p, i) => [8 + (i * (w - 16)) / (n - 1), h - 8 - ((p - min) / (max - min || 1)) * (h - 22)]);
  const d = xy.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const up = edition.tendance >= 0;
  const col = up ? '#2FC115' : '#BE4949';
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:${h}px" aria-hidden="true">
    <path d="${d} L ${w - 8} ${h} L 8 ${h} Z" fill="${col}" opacity=".08"/>
    <path d="${d}" fill="none" stroke="${col}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${xy[n - 1][0].toFixed(1)}" cy="${xy[n - 1][1].toFixed(1)}" r="4" fill="${col}"/>
  </svg>
  <div class="ax"><span>2020</span><span>2026</span></div>`;
}




const state = {
  vue: 'accueil',
  slug: null,
  serie: null,
  edition: null,
  etat: null,
  collection: JSON.parse(localStorage.getItem('cote-collection') || '[]')
};

const app = $('#app');

function go(vue, slug) {
  state.vue = vue; state.slug = slug || null;
  state.serie = state.edition = state.etat = null;
  window.scrollTo({ top: 0, behavior: 'instant' });
  render();
}



function vueAccueil() {
  const liste = ALBUMS;

  return `
  <section class="app-content intro">
    <div class="intro-grid">
      <div>
        <h1 class="global-title">Quelle est la cote de votre album Tintin&nbsp;?</h1>
        <p class="global-text">Un album ne vaut ni par sa date de copyright, ni par son dépôt légal.
          Ce qui compte, c’est le <b>2e plat</b>, l’édition exacte et l’état de conservation.
          Notre estimateur vous guide pas à pas, album par album.</p>
        <div class="figures">
          <div class="figure"><div class="n">${ALBUMS.length}</div><div class="l">albums couverts</div></div>
          <div class="figure"><div class="n">${nbEditions()}</div><div class="l">éditions référencées</div></div>

        </div>
      </div>
      <div>
        <div class="cards" style="margin:0">
          <ul class="steps">
            <li><span class="n">1</span><span><span class="t">Je choisis mon album</span>
              <span class="d">Parmi les 24 aventures, de Soviets à l’Alph-Art.</span></span></li>
            <li><span class="n">2</span><span><span class="t">J’identifie mon édition</span>
              <span class="d">Le 2e plat, puis la variante précise.</span></span></li>
            <li><span class="n">3</span><span><span class="t">J’évalue son état</span>
              <span class="d">Coiffes, coins et plats, du neuf au mauvais état.</span></span></li>
            <li><span class="n">4</span><span><span class="t">J’obtiens sa cote</span>
              <span class="d">Une fourchette de marché, détaillée ligne par ligne.</span></span></li>
          </ul>
        </div>
      </div>
    </div>
    ${encartParties()}
  </section>

  <section class="app-content finder">
    <p class="global-text" style="margin:35px 0 0;max-width:900px">L’<b>année du copyright</b> indiquée dans
      le livre <b>n’est pas toujours celle de l’impression</b> de l’album&nbsp;: fiez-vous au <b>2e plat</b>
      pour dater votre édition. Les cotes sont données pour un album en <b>très bon état (TBE)</b>&nbsp;;
      en <b>état neuf</b>, elle augmente <b>de 200 à 300&nbsp;%</b> selon les titres, et s’il est usé,
      sa cote <b>diminue d’au moins 50&nbsp;%</b>.</p>

    <div class="sec-head">
      <h2 class="global-sub-title">${liste.length} titre${liste.length > 1 ? 's' : ''}</h2>
      <span class="note">Mise à jour&nbsp;: juillet 2026</span>
    </div>

    <div class="albums">${liste.map(carteAlbum).join('')}</div>
  </section>

  <section class="app-content" style="padding-top:45px;padding-bottom:10px">
    <h2 class="global-sub-title">Bien identifier son album</h2>
    <div class="cols3">
      <div class="cards">
        <h3 class="global-small-title">Le 2e plat</h3>
        <p class="global-tiny-text">C’est l’arrière de l’album, où figure la liste des titres d’Hergé (A18, B24, C3…).
          À ne pas confondre avec le dos, seul visible une fois l’album rangé. C’est lui qui date réellement l’édition.</p>
      </div>
      <div class="cards">
        <h3 class="global-small-title">Le dos et les gardes</h3>
        <p class="global-tiny-text">Dos rouge, bleu, jaune ou imprimé, gardes bleu foncé ou bleu clair, numéro
          d’imprimeur Danel : autant de détails qui séparent deux exemplaires d’apparence identique.</p>
      </div>
      <div class="cards">
        <h3 class="global-small-title">L’état de conservation</h3>
        <p class="global-tiny-text">Le facteur le plus déterminant. Les cotes sont données en très bon état&nbsp;;
          un exemplaire en état neuf vaut 200 à 300&nbsp;% de plus. Les coiffes et les coins se regardent en premier.</p>
      </div>
    </div>
  </section>`;
}

// Repères du modèle 3D (assets/models/album.glb, unités en mètres).
// position / normale : point d'ancrage sur le modèle ; vue : orbite caméra « theta phi ».
// En remplaçant le modèle, ajustez positions et normales à sa géométrie.
const PARTIES = [
  { nom: 'Premier plat', desc: 'La couverture, avec l’illustration et le titre.',
    position: '0.02 0.03 0.0068', normale: '0 0 1', vue: '0deg 80deg' },
  { nom: '2e plat', desc: 'L’arrière de l’album, avec la liste des titres&nbsp;: il date l’édition.',
    position: '0.02 0 -0.0068', normale: '0 0 -1', vue: '180deg 80deg' },
  { nom: 'Dos', desc: 'La partie visible quand l’album est rangé dans une bibliothèque.',
    position: '-0.115 0 0', normale: '-1 0 0', vue: '-65deg 80deg' },
  { nom: 'Coiffes', desc: 'Le haut et le bas du dos, premières zones à s’user.',
    position: '-0.115 0.151 0', normale: '-0.7 0.7 0', vue: '-55deg 40deg' },
  { nom: 'Mors', desc: 'La charnière entre le dos et les plats&nbsp;; elle se fend à l’usage.',
    position: '-0.1125 -0.07 0.0065', normale: '-0.7 0 0.7', vue: '-40deg 75deg' },
  { nom: 'Tranches', desc: 'Les bords des pages&nbsp;: tête, queue et gouttière (côté ouverture).',
    position: '0.111 -0.02 0', normale: '1 0 0', vue: '60deg 70deg' },
  { nom: 'Coins', desc: 'Les angles des plats, souvent émoussés ou «&nbsp;tapés&nbsp;».',
    position: '0.1135 -0.151 0.0065', normale: '0.6 -0.6 0.5', vue: '35deg 95deg' }
];
const VUE_INITIALE = '-30deg 70deg auto';

function encartParties() {
  return `
  <div class="cards parties">
    <div class="ph">
      <h2 class="global-small-title">Les parties d’un album</h2>
      <p class="global-tiny-text">Faites tourner l’album avec la souris, ou cliquez sur une partie pour la voir.</p>
    </div>
    <model-viewer id="album-3d" class="viewer" src="assets/models/album.glb" alt="Modèle 3D d’un album"
      camera-controls disable-zoom touch-action="pan-y" interaction-prompt="none" shadow-intensity="1"
      camera-orbit="${VUE_INITIALE}" min-camera-orbit="auto 5deg auto" max-camera-orbit="auto 175deg auto">
      ${PARTIES.map((p, i) => `
        <button class="hotspot" slot="hotspot-${i}" data-partie="${i}" data-position="${p.position}"
          data-normal="${p.normale}" data-visibility-attribute="visible" title="${p.nom}">${i + 1}</button>`).join('')}
    </model-viewer>
    <div class="pl">
      <ol class="legende">
        ${PARTIES.map((p, i) => `
          <li><button data-partie="${i}"><span class="n">${i + 1}</span>
            <span><span class="t">${p.nom}</span><span class="d">${p.desc}</span></span></button></li>`).join('')}
      </ol>
      <p class="global-tiny-text">À l’intérieur, les <b>pages de garde</b> (bleu foncé, bleu clair, grises ou
        blanches selon les éditions) sont collées au revers des plats.</p>
    </div>
  </div>`;
}

function montrerPartie(i) {
  const mv = $('#album-3d');
  if (!mv) return;
  document.querySelectorAll('[data-partie]').forEach(el => el.classList.toggle('on', el.dataset.partie === String(i)));
  mv.cameraOrbit = `${PARTIES[i].vue} auto`;
}

function carteAlbum(a) {
  return `
  <button class="album" data-slug="${a.slug}">
    <span class="shell">
      <img src="${cover(a)}" alt="Couverture de ${esc(a.titre)}" loading="lazy">
    </span>
    <span class="t">${esc(a.titre)}</span>
  </button>`;
}



function vueAlbum() {
  const a = albumBySlug(state.slug);
  const series = seriesDispo(a);
  const etapes = [
    { t: 'Album', ok: true, now: false },
    { t: '2e plat', ok: !!state.serie, now: !state.serie },
    { t: 'Édition précise', ok: !!state.edition, now: !!state.serie && !state.edition },
    { t: 'État', ok: !!state.etat, now: !!state.edition && !state.etat },
    { t: 'Estimation', ok: false, now: !!state.etat }
  ];

  return `
  <div class="app-content" style="padding-bottom:50px">
    <div class="crumbs"><button data-home>Cote des albums</button><span>›</span>${esc(a.titre)}</div>

    <div class="album-head">
      <div class="cover"><img src="${cover(a)}" alt="Couverture de ${esc(a.titre)}"></div>
      <div>
        <h1 class="global-title">${esc(a.titre)}</h1>
        <div class="tags">
          <span class="tag">Première parution en album&nbsp;: ${a.annee}</span>
          <span class="tag">${editions(a).length} éditions référencées</span>
          <span class="tag">Séries ${series.map(s => SERIES[s].code === 'V' ? '2e plat blanc' : s).join(', ')}</span>
          ${coteEO(a) != null ? `<span class="tag">Cote EO (TBE)&nbsp;: ${eur(coteEO(a))}</span>` : ''}
        </div>
        <p class="global-text" style="font-size:18px;line-height:24px;margin:0">Renseignez les caractéristiques de
          votre exemplaire. Chaque réponse affine la fourchette&nbsp;; vous pouvez revenir en arrière à tout moment.</p>
      </div>
    </div>

    <div class="progress">
      ${etapes.map((e, i) => `
        <div class="i ${e.now ? 'now' : e.ok ? 'done' : ''}">
          <span class="dot">${e.ok && !e.now ? '✓' : i + 1}</span>${e.t}</div>`).join('')}
    </div>

    ${blocSerie(a, series)}
    ${state.serie ? blocEdition(a) : ''}
    ${state.edition ? blocEtat(a) : ''}
    ${state.etat ? blocResultat(a) : ''}
    ${state.etat ? blocArgus(a) : ''}
  </div>`;
}

function blocSerie(a, series) {
  return `
  <div class="q" id="q-serie">
    <span class="step">Étape 1</span>
    <h2 class="global-sub-title">Quel est le 2e plat de votre album&nbsp;?</h2>
    <p class="global-text">Retournez l’album&nbsp;: la mise en page de la liste des titres d’Hergé indique la série.
       Ne vous fiez ni au copyright, ni au dépôt légal.</p>
    <div class="series">
      ${series.map(s => {
        const S = SERIES[s], on = state.serie === s;
        return `<button class="serie ${on ? 'on' : ''}" data-serie="${s}">
          <span class="viz">${platSVG(s)}</span>
          <span class="body">
            <span class="st">${S.nom}</span>
            <span class="sp">${S.periode}</span>
            <span class="sr">${S.resume}</span>
          </span></button>`;
      }).join('')}
    </div>
  </div>`;
}

function blocEdition(a) {
  const list = editionsSerie(a, state.serie);
  const S = SERIES[state.serie];
  const indispo = list.filter(e => e.cote == null);
  const sansCote = indispo.length;
  // Le motif majoritaire est énoncé une fois dans l'encadré, plutôt que répété à l'identique
  // sur chaque ligne ; seules les variantes qui font exception portent leur propre explication.
  const compte = {};
  indispo.forEach(e => { const m = motifSansCote(e); compte[m] = (compte[m] || 0) + 1; });
  const motifDominant = Object.keys(compte).sort((x, y) => compte[y] - compte[x])[0] || null;
  const exceptions = sansCote - (compte[motifDominant] || 0);
  return `
  <div class="q" id="q-edition">
    <span class="step">Étape 2</span>
    <h2 class="global-sub-title">Quelle variante exactement&nbsp;?</h2>
    <p class="global-text">${S.detail} Repérez le code imprimé au 2e plat, puis la couleur du dos, les gardes
       et le numéro d’imprimeur.</p>
    ${sansCote ? `
    <p class="nc-note">${sansCote === list.length
        ? `<b>Aucune des ${list.length} variantes de cette série n’a de cote disponible</b> pour le moment.`
        : `<b>${sansCote} variante${sansCote > 1 ? 's' : ''} sur ${list.length}
           n’${sansCote > 1 ? 'ont' : 'a'} pas de cote disponible</b>${sansCote > 1 ? '' : ''}.`}
       Elle${sansCote > 1 ? 's' : ''} ne peu${sansCote > 1 ? 'vent' : 't'} donc pas être
       estimée${sansCote > 1 ? 's' : ''}, et ${sansCote > 1 ? 'apparaissent' : 'apparaît'} en grisé, encadrée${sansCote > 1 ? 's' : ''}
       de pointillés&nbsp;: nous ${sansCote > 1 ? 'les' : 'la'} laissons visible${sansCote > 1 ? 's' : ''} pour que vous
       puissiez malgré tout identifier votre exemplaire.
       <span class="ncm">${MOTIFS_SANS_COTE[motifDominant][compte[motifDominant] > 1 ? 'plusieurs' : 'une']}${exceptions
         ? ` <i>(${exceptions} exception${exceptions > 1 ? 's' : ''} dans cette liste, signalée${exceptions > 1 ? 's' : ''} ligne par ligne.)</i>`
         : ''}</span></p>` : ''}
    <div class="opts editions">
      ${list.map(e => `
        <button class="opt ${state.edition && state.edition.id === e.id ? 'on' : ''}" data-edition="${e.id}"
          ${e.cote == null ? 'aria-disabled="true"' : ''}>
          <span class="txt">
            <span class="ot">${nomPlat(e)} <em>· ${e.annee}${e.eo ? ' · EO' : ''}${e.dos ? ' · ' + SIGLES_DOS[e.dos] : ''}</em></span>
            ${e.desc ? `<span class="oa">${e.desc}</span>` : ''}
            ${e.cote == null && motifSansCote(e) !== motifDominant
              ? `<span class="nc-why">${MOTIFS_SANS_COTE[motifSansCote(e)].une}</span>` : ''}
          </span>
          ${e.cote == null ? '<span class="oc">Cote absente</span>' : ''}</button>`).join('')}
    </div>

  </div>`;
}

function blocEtat(a) {
  return `
  <div class="q" id="q-etat">
    <span class="step">Étape 3</span>
    <h2 class="global-sub-title">Dans quel état est-il&nbsp;?</h2>
    <p class="global-text">Regardez d’abord les coiffes (haut et bas du dos), puis les coins et l’aspect des plats.
       Soyez sévère&nbsp;: c’est ainsi que jugera l’acheteur.</p>
    <div class="etats">
      ${ETATS.map(e => `
        <button class="etat ${state.etat === e.code ? 'on' : ''}" data-etat="${e.code}">
          ${e.ref ? '<span class="ref">RÉFÉRENCE</span>' : ''}
          <span class="et">${e.nom}</span>
         
          <span class="ed">${e.desc}</span></button>`).join('')}
    </div>
  </div>`;
}

function blocResultat(a) {
  const est = estimer(a, state.edition, state.etat);
  const conf = Math.min(5, Math.max(2, Math.round(est.ventes / 6) + 1));

  return `
  <div class="q" id="q-resultat">
    <span class="step">Résultat</span>
    <h2 class="global-sub-title">L’estimation de votre exemplaire</h2>
    <div class="result">
      <div class="head">
        <div>
          <div class="lbl">Valeur estimée</div>
          <div class="val">${eur(est.total)}</div>
          <div class="rng">Fourchette de marché&nbsp;: ${eur(est.bas)} – ${eur(est.haut)}</div>
        </div>
        <div class="conf">
          <div class="lbl">Fiabilité</div>
          <div class="dots">${Array.from({ length: 5 }, (_, i) => `<i class="${i < conf ? 'on' : ''}"></i>`).join('')}</div>
        </div>
      </div>

      <div class="body">
        <div class="recap">
          <span><b>${esc(a.titre)}</b></span>
          <span>${nomPlat(state.edition)} (${state.edition.annee})${state.edition.dos ? ' · ' + SIGLES_DOS[state.edition.dos] : ''}</span>
          <span>${est.etat.nom}</span>
        </div>

        <div class="calc">
          <div class="r"><span>Cote de référence — ${nomPlat(state.edition)}, très bon état</span><span>${eur(est.base)}</span></div>
          <div class="r"><span>État «&nbsp;${est.etat.nom}&nbsp;» — coefficient ${est.etat.coef.toFixed(2).replace('.', ',')}</span><span>${eur(est.apresEtat)}</span></div>
          <div class="r tot"><span>Estimation</span><span>${eur(est.total)}</span></div>
        </div>

        <div class="cta">
          <button class="button blue" data-add>Ajouter à ma collection</button>
          <button class="button sand" data-reset>Recommencer</button>
        </div>

        <p class="legal">Cote de référence issue du catalogue BDM (très bon état). Cette estimation ne constitue
          ni une offre d’achat, ni une expertise contradictoire. Un exemplaire exceptionnel (dédicace authentifiée,
          provenance documentée) peut sortir largement de cette fourchette.</p>
      </div>
    </div>
  </div>`;
}

function blocArgus(a) {
  const list = editions(a).filter(e => e.id === state.edition.id);
  return `
  <div class="argus">
    <div class="sec-head">
      <h2 class="global-sub-title">Argus complet — ${esc(a.titre)}</h2>
      <span class="note">Cotes pour un exemplaire en très bon état</span>
    </div>
    <div class="argus-wrap scroll-x">
      <table>
        <thead><tr>
          <th>2e plat</th><th>Série</th><th>Année</th>
          ${ETATS.map(e => `<th>${e.nom}</th>`).join('')}<th>Ventes</th>
        </tr></thead>
        <tbody>
          ${list.map(e => `<tr>
            <td class="code">${codePlat(e)}${e.eo ? ' <span class="eo">EO</span>' : ''}</td>
            <td><span class="sdot" style="background:${SERIES[e.serie].couleur}"></span>${SERIES[e.serie].nom}</td>
            <td>${e.annee}</td>
            ${ETATS.map(et => `<td class="${et.code === state.etat ? 'ref' : ''}">${eur(arrondi(e.cote * et.coef))}</td>`).join('')}
            <td>${e.ventes}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}



function sauverCollection() {
  localStorage.setItem('cote-collection', JSON.stringify(state.collection));
  majCompteur();
}

function majCompteur() {
  const n = state.collection.length;
  const el = $('#coll-count');
  if (el) { el.textContent = n; el.style.display = n ? '' : 'none'; }
}

function ajouterCollection(a, est) {
  state.collection.push({
    slug: a.slug, titre: a.titre,
    edition: nomPlat(state.edition), annee: state.edition.annee,
    etat: est.etat.nom, valeur: est.total
  });
  sauverCollection(); renderDrawer(); toast('Ajouté à votre collection');
}

function renderDrawer() {
  const total = state.collection.reduce((s, i) => s + i.valeur, 0);
  $('#drawer-body').innerHTML = state.collection.length
    ? state.collection.map((i, k) => `
      <div class="coll">
        <img src="assets/covers/${i.slug}.png" alt="">
        <div><div class="ct">${esc(i.titre)}</div>
          <div class="cs">${i.edition} (${i.annee}) · ${i.etat}</div></div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="cv">${eur(i.valeur)}</span>
          <button class="cx" data-del="${k}" title="Retirer">×</button></div>
      </div>`).join('')
    : `<p class="global-tiny-text" style="padding:20px 0">Votre collection est vide.
         Estimez un album, puis ajoutez-le pour suivre sa valeur.</p>`;
  $('#drawer-total').textContent = eur(total);
}

let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 2200);
}



function render() {
  cacherApercu();
  app.innerHTML = state.vue === 'accueil' ? vueAccueil() : vueAlbum();
  majCompteur();
}

function scrollVers(id) {
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: 'smooth' });
  });
}

document.addEventListener('click', ev => {
  const t = ev.target;
  const hit = sel => t.closest(sel);

  if (hit('[data-home]') || hit('[data-logo]')) { ev.preventDefault(); go('accueil'); return; }

  const partie = hit('[data-partie]');
  if (partie) { montrerPartie(+partie.dataset.partie); return; }

  const carte = hit('[data-slug]');
  if (carte) { go('album', carte.dataset.slug); return; }

  const s = hit('[data-serie]');
  if (s) {
    state.serie = s.dataset.serie; state.edition = null; state.etat = null;
    render(); scrollVers('q-edition'); return;
  }

  const e = hit('[data-edition]');
  if (e) {
    // Variante sans cote au catalogue : survolable pour son 2e plat, mais pas sélectionnable.
    if (e.getAttribute('aria-disabled') === 'true') return;
    const a = albumBySlug(state.slug);
    state.edition = editions(a).find(x => x.id === e.dataset.edition);
    state.etat = null; render(); scrollVers('q-etat'); return;
  }

  const et = hit('[data-etat]');
  if (et) { state.etat = et.dataset.etat; render(); scrollVers('q-resultat'); return; }

  if (hit('[data-reset]')) {
    state.serie = state.edition = state.etat = null;
    render(); scrollVers('q-serie'); return;
  }

  if (hit('[data-add]')) {
    const a = albumBySlug(state.slug);
    ajouterCollection(a, estimer(a, state.edition, state.etat));
    return;
  }
  if (hit('[data-noop]')) { toast('Maquette — écran non branché'); return; }

  if (hit('#open-coll')) { renderDrawer(); $('#drawer').classList.add('open'); $('#scrim').classList.add('open'); return; }
  if (hit('#close-coll') || t.id === 'scrim') { $('#drawer').classList.remove('open'); $('#scrim').classList.remove('open'); return; }

  const del = hit('[data-del]');
  if (del) { state.collection.splice(+del.dataset.del, 1); sauverCollection(); renderDrawer(); return; }
});

// Aperçu du 2e plat au survol d'une variante. Sans effet sur écran tactile ou étroit,
// où le panneau n'aurait pas la place de s'afficher à côté de la liste.
const survolPossible = () =>
  window.matchMedia('(hover: hover)').matches && window.innerWidth > 1000;

document.addEventListener('mouseover', ev => {
  const btn = ev.target.closest && ev.target.closest('#q-edition .opt');
  if (btn === apercuCible) return;
  if (!btn || !survolPossible()) { cacherApercu(); return; }
  const a = albumBySlug(state.slug);
  const e = a && editions(a).find(x => x.id === btn.dataset.edition);
  if (e) montrerApercu(btn, e);
});

window.addEventListener('scroll', placerApercu, { passive: true });
window.addEventListener('resize', cacherApercu);

document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape') {
    cacherApercu();
    $('#drawer').classList.remove('open'); $('#scrim').classList.remove('open');
  }
});

render();
renderDrawer();
