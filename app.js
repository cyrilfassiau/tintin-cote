



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




const PLANCHER = {
  P: () => 2500,
  A: () => 220,
  B: y => 90 - (y - 1946) * 1.3,
  C: y => 34 - (y - 1976) * 0.55,
  D: y => 14 - (y - 2011) * 0.2
};


function editions(album) {
  let plafond = Infinity;
  return VARIANTES
    .filter(v => v.annee >= album.annee && (v.serie !== 'P' || album.annee <= 1934))
    .filter(v => v.serie !== 'A' || album.nb || album.annee >= 1942)
    .map(v => {
      const rnd = seeded(album.slug + v.code);
      const age = v.annee - album.annee;
      const brut = album.eo * Math.exp(-0.145 * age) * (0.9 + rnd() * 0.24);
     
      const valeur = Math.max(PLANCHER[v.serie](v.annee), Math.min(brut, plafond));
      plafond = valeur;
      return {
        code: v.code, serie: v.serie, annee: v.annee, cote: arrondi(valeur),
        eo: age === 0,
        ventes: 3 + Math.floor(rnd() * 26),
        tendance: Math.round((rnd() * 30 - 8) * 10) / 10
      };
    });
}

const editionsSerie = (album, serie) => editions(album).filter(e => e.serie === serie);
const seriesDispo = album => ['P', 'A', 'B', 'C', 'D'].filter(s => editionsSerie(album, s).length);



function estimer(album, edition, etatCode, optionsCochees) {
  const etat = ETATS.find(e => e.code === etatCode);
  const base = edition.cote;
  const apresEtat = base * etat.coef;
  const mods = OPTIONS
    .filter(o => optionsCochees.includes(o.code))
    .map(o => ({ nom: o.nom, montant: apresEtat * o.mod }));
  const total = apresEtat + mods.reduce((s, m) => s + m.montant, 0);
  return {
    base, etat, apresEtat, mods,
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
    `<svg class="plat" viewBox="0 0 88 112" role="img" aria-label="Quatrième plat ${serie}">
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
  let g = '';
  for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++)
    g += `<rect x="${8 + k * 15}" y="${8 + r * 16.5}" width="12" height="13.5" rx="1" fill="${c}" opacity="${0.3 + ((r + k) % 4) * 0.16}"/>`;
  g += `<g transform="translate(24,74)">${Array.from({ length: 16 }, (_, i) =>
    `<rect x="${i * 2.4}" y="0" width="${i % 3 ? 1 : 1.8}" height="20" fill="#222" opacity=".7"/>`).join('')}</g>`;
  return cadre(g, '#f4f6f7');
}



function ventesComparables(album, edition, etat) {
  const rnd = seeded(album.slug + edition.code + etat.code);
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

function courbeSVG(album, edition) {
  const rnd = seeded(album.slug + edition.code + 'trend');
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
  options: [],
  collection: JSON.parse(localStorage.getItem('cote-collection') || '[]')
};

const app = $('#app');

function go(vue, slug) {
  state.vue = vue; state.slug = slug || null;
  state.serie = state.edition = state.etat = null; state.options = [];
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
          Ce qui compte, c’est le <b>quatrième plat</b>, l’édition exacte et l’état de conservation.
          Notre estimateur vous guide pas à pas, album par album.</p>
        <div class="figures">
          <div class="figure"><div class="n">24</div><div class="l">albums couverts</div></div>
          <div class="figure"><div class="n">312</div><div class="l">éditions référencées</div></div>
         
        </div>
      </div>
      <div>
        <div class="cards" style="margin:0">
          <ul class="steps">
            <li><span class="n">1</span><span><span class="t">Je choisis mon album</span>
              <span class="d">Parmi les 24 aventures, de Soviets à l’Alph-Art.</span></span></li>
            <li><span class="n">2</span><span><span class="t">J’identifie mon édition</span>
              <span class="d">Le quatrième plat, puis la variante précise.</span></span></li>
            <li><span class="n">3</span><span><span class="t">Je décris mon exemplaire</span>
              <span class="d">Dos, pages de garde, jaquette, puis l’état.</span></span></li>
            <li><span class="n">4</span><span><span class="t">J’obtiens sa cote</span>
              <span class="d">Une fourchette argumentée, avec les ventes comparables.</span></span></li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="app-content finder">
    <p class="global-text" style="margin:35px 0 0;max-width:900px">L’<b>année du copyright</b> indiquée dans
      le livre <b>n’est pas toujours celle de l’impression</b> de l’album&nbsp;: fiez-vous au <b>deuxième plat</b>
      pour dater votre édition. Les cotes sont données pour un album en <b>état neuf</b>&nbsp;; s’il est usé,
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
        <h3 class="global-small-title">Le quatrième plat</h3>
        <p class="global-tiny-text">C’est l’arrière de l’album, où figure la liste des titres d’Hergé. À ne pas
          confondre avec le dos, seul visible une fois l’album rangé. C’est lui qui date réellement l’édition.</p>
      </div>
      <div class="cards">
        <h3 class="global-small-title">Le dos et les gardes</h3>
        <p class="global-tiny-text">Dos rond toilé, couleur des pages de garde, présence d’une jaquette : autant de
          détails qui séparent deux exemplaires d’apparence identique — et parfois du simple au triple.</p>
      </div>
      <div class="cards">
        <h3 class="global-small-title">L’état de conservation</h3>
        <p class="global-tiny-text">Le facteur le plus déterminant. Entre un exemplaire neuf et le même en état
          moyen, la cote peut être divisée par quatre. Les coiffes et les coins se regardent en premier.</p>
      </div>
    </div>
  </section>`;
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
    { t: 'Quatrième plat', ok: !!state.serie, now: !state.serie },
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
          <span class="tag">Séries ${series.join(', ')}</span>
          <span class="tag">Cote EO&nbsp;: ${eur(a.eo)}</span>
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
    ${state.edition ? blocOptions(a) : ''}
    ${state.edition ? blocEtat(a) : ''}
    ${state.etat ? blocResultat(a) : ''}
    ${state.etat ? blocArgus(a) : ''}
  </div>`;
}

function blocSerie(a, series) {
  return `
  <div class="q" id="q-serie">
    <span class="step">Étape 1</span>
    <h2 class="global-sub-title">Quel est le quatrième plat de votre album&nbsp;?</h2>
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
  return `
  <div class="q" id="q-edition">
    <span class="step">Étape 2</span>
    <h2 class="global-sub-title">Quelle variante exactement&nbsp;?</h2>
    <p class="global-text">${S.detail} Repérez le dernier titre annoncé au quatrième plat&nbsp;: il donne l’année de tirage.</p>
    <div class="vars">
      ${list.map(e => `
        <button class="var ${state.edition && state.edition.code === e.code ? 'on' : ''}" data-edition="${e.code}">
          <b>${e.code}</b><span>${e.annee}${e.eo ? ' · EO' : ''}</span></button>`).join('')}
    </div>
    
  </div>`;
}

function blocOptions(a) {
  const dispo = OPTIONS.filter(o => o.series.includes(state.serie));
  if (!dispo.length) return '';
  return `
  <div class="q" id="q-options">
    <span class="step">Étape 3</span>
    <h2 class="global-sub-title">Votre exemplaire présente-t-il ces caractéristiques&nbsp;?</h2>
    <p class="global-text">Facultatif, mais c’est souvent là que se creuse l’écart entre deux exemplaires de la même édition.</p>
    <div class="opts">
      ${dispo.map(o => {
        const on = state.options.includes(o.code);
        return `<button class="opt ${on ? 'on' : ''}" data-option="${o.code}">
          <span class="box">✓</span>
          
          <span class="oa">${o.aide}</span></span></button>`;
      }).join('')}
    </div>
  </div>`;
}

function blocEtat(a) {
  return `
  <div class="q" id="q-etat">
    <span class="step">Étape 4</span>
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
  const est = estimer(a, state.edition, state.etat, state.options);
  const ventes = ventesComparables(a, state.edition, est.etat);
  const conf = Math.min(5, Math.max(2, Math.round(est.ventes / 6) + 1));
  const up = est.tendance >= 0;

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
          <div class="rng">${est.ventes} ventes observées<br>sur 24 mois</div>
        </div>
      </div>

      <div class="body">
        <div class="recap">
          <span><b>${esc(a.titre)}</b></span>
          <span>${SERIES[state.edition.serie].nom} — ${state.edition.code} (${state.edition.annee})</span>
          <span>${est.etat.nom}</span>
          ${est.mods.map(m => `<span>${m.nom}</span>`).join('')}
        </div>

        <div class="calc">
          <div class="r"><span>Cote de référence — ${state.edition.code}, très bon état</span><span>${eur(est.base)}</span></div>
          <div class="r"><span>État «&nbsp;${est.etat.nom}&nbsp;» — coefficient ${est.etat.coef.toFixed(2).replace('.', ',')}</span><span>${eur(est.apresEtat)}</span></div>
          ${est.mods.map(m => `<div class="r mod"><span>${m.nom}</span><span>+ ${eur(m.montant)}</span></div>`).join('')}
          <div class="r tot"><span>Estimation</span><span>${eur(est.total)}</span></div>
        </div>

        <div class="res2">
          <div>
            <h3 class="global-small-title">Ventes comparables récentes</h3>
            <div class="sales-wrap">
              <table class="sales">
                <thead><tr><th>Date</th><th>Canal</th><th>État</th><th>Prix</th></tr></thead>
                <tbody>${ventes.map(v => `<tr>
                  <td>${v.date}</td><td>${v.lieu}</td>
                  <td><span class="st">${v.code}</span></td><td>${eur(v.prix)}</td></tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h3 class="global-small-title">Évolution de la cote</h3>
            <div class="trend">
              <div class="th">
                <span class="tl">${state.edition.code} en très bon état · 6 ans</span>
             
              </div>
              ${courbeSVG(a, state.edition)}
            </div>
          </div>
        </div>

        <div class="cta">
          <button class="button blue" data-add>Ajouter à ma collection</button>
          <button class="button white" data-print>Télécharger l’estimation (PDF)</button>
          <button class="button white" data-expert>Demander une expertise</button>
          <button class="button sand" data-reset>Recommencer</button>
        </div>

        <p class="legal">Estimation indicative fondée sur les ventes publiques observées, les catalogues de libraires
          spécialisés et les cotations de référence. Elle ne constitue ni une offre d’achat, ni une expertise
          contradictoire. Un exemplaire exceptionnel (dédicace authentifiée, provenance documentée) peut sortir
          largement de cette fourchette.</p>
      </div>
    </div>
  </div>`;
}

function blocArgus(a) {
  const list = editions(a).filter(e => e.code === state.edition.code);
  return `
  <div class="argus">
    <div class="sec-head">
      <h2 class="global-sub-title">Argus complet — ${esc(a.titre)}</h2>
      <span class="note">Cotes pour un exemplaire en très bon état, hors options</span>
    </div>
    <div class="argus-wrap scroll-x">
      <table>
        <thead><tr>
          <th>Édition</th><th>Série</th><th>Année</th>
          ${ETATS.map(e => `<th>${e.nom}</th>`).join('')}<th>Ventes</th>
        </tr></thead>
        <tbody>
          ${list.map(e => `<tr>
            <td class="code">${e.code}${e.eo ? ' <span class="eo">EO</span>' : ''}</td>
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
    edition: state.edition.code, annee: state.edition.annee,
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

  const carte = hit('[data-slug]');
  if (carte) { go('album', carte.dataset.slug); return; }

  const s = hit('[data-serie]');
  if (s) {
    state.serie = s.dataset.serie; state.edition = null; state.etat = null; state.options = [];
    render(); scrollVers('q-edition'); return;
  }

  const e = hit('[data-edition]');
  if (e) {
    const a = albumBySlug(state.slug);
    state.edition = editions(a).find(x => x.code === e.dataset.edition);
    state.etat = null; render(); scrollVers('q-options'); return;
  }

  const o = hit('[data-option]');
  if (o) {
    const c = o.dataset.option;
    state.options = state.options.includes(c) ? state.options.filter(x => x !== c) : [...state.options, c];
    render(); scrollVers(state.etat ? 'q-resultat' : 'q-options'); return;
  }

  const et = hit('[data-etat]');
  if (et) { state.etat = et.dataset.etat; render(); scrollVers('q-resultat'); return; }

  if (hit('[data-reset]')) {
    state.serie = state.edition = state.etat = null; state.options = [];
    render(); scrollVers('q-serie'); return;
  }

  if (hit('[data-add]')) {
    const a = albumBySlug(state.slug);
    ajouterCollection(a, estimer(a, state.edition, state.etat, state.options));
    return;
  }
  if (hit('[data-print]')) { toast('Maquette — la génération du PDF n’est pas branchée'); return; }
  if (hit('[data-expert]')) { toast('Maquette — le formulaire d’expertise n’est pas branché'); return; }
  if (hit('[data-noop]')) { toast('Maquette — écran non branché'); return; }

  if (hit('#open-coll')) { renderDrawer(); $('#drawer').classList.add('open'); $('#scrim').classList.add('open'); return; }
  if (hit('#close-coll') || t.id === 'scrim') { $('#drawer').classList.remove('open'); $('#scrim').classList.remove('open'); return; }

  const del = hit('[data-del]');
  if (del) { state.collection.splice(+del.dataset.del, 1); sauverCollection(); renderDrawer(); return; }
});

document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape') { $('#drawer').classList.remove('open'); $('#scrim').classList.remove('open'); }
});

render();
renderDrawer();
