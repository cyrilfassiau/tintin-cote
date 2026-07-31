# Cote des albums — maquette Tintin.com

Maquette locale de la nouvelle version de l’espace « cote des albums » de
[tintin.com/fr/collectors](https://www.tintin.com/fr/collectors), reprenant le principe
de simulateur pas à pas de [cote-bd.fr](https://www.cote-bd.fr/).

## Lancer

```bash
cd tintin-cote && python3 -m http.server 4321
```

Puis ouvrir <http://localhost:4321>. Le fichier `index.html` s’ouvre aussi directement
par double-clic (aucun `fetch`, aucun module ES).

## Ce que fait la maquette

Le principe de cote-bd.fr, en quatre étapes au lieu de trois :

1. **Choix de l’album** — grille des 24 aventures, recherche et filtres (décennie, noir & blanc, cote).
2. **Quatrième plat** — cartes visuelles des séries P / A / B / C / D, avec période et repères d’identification.
3. **Variante précise** — B1 … B42, C1 … C9, etc., datées ; puis les caractéristiques de l’exemplaire
   (dos rond toilé, pages de garde, jaquette, dédicace, tirage de tête).
4. **État de conservation** — Neuf, TBE, Bon état, État moyen, Mauvais état, avec le coefficient appliqué.

Le résultat va plus loin que cote-bd.fr :

- valeur estimée **et** fourchette de marché ;
- **le détail du calcul** (cote de référence → coefficient d’état → majorations), pour que le chiffre
  soit compris et pas seulement subi ;
- **ventes comparables** récentes et **courbe d’évolution** sur six ans ;
- indice de fiabilité fondé sur le nombre de ventes observées ;
- **argus complet** de l’album : toutes les éditions × tous les états dans un seul tableau ;
- **« Ma collection »** — les estimations conservées dans le navigateur, avec valeur totale.

## Design

La charte est celle du site réel, extraite de `css_v76.css` de tintin.com :

- fontes **Myriad Pro** du site (`regular`, `semibold`, `semicondensed`, `boldcondensed`),
  téléchargées dans `assets/fonts/` ;
- couleurs : bleu `#187EAC`, bleu clair `#28B7DF`, sable `#F6F4EF`, filets `#E3E3E3`,
  texte courant `#727272`, bordeaux/or `#891245` + `#F1DF96` ;
- composants repris à l’identique : `app-header2` (logo + boutons ronds), `app-header3`
  (onglets soulignés), `menuTop` (onglets à icônes), `.button` (blue / white / sand / gold2),
  blocs `.cards`, échelle typographique `global-title` / `global-sub-title` / `global-text` ;
- l’onglet « Cote des albums » a été ajouté dans la barre Tintinophiles, à côté de « Collectionneurs ».

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Ossature : en-têtes, menus, pied de page, tiroir collection |
| `styles.css` | Charte tintin.com + composants de l’estimateur |
| `data.js` | Albums, séries, variantes, états, options — **données de démonstration** |
| `app.js` | Calcul des cotes, rendu des vues, interactions |
| `assets/covers/` | Les 24 couvertures (CDN tintin.com) |
| `assets/fonts/` | Myriad Pro (CDN tintin.com) |
| `assets/ui/` | Logos et icônes de menu (CDN tintin.com) |

## Limites

**Tous les montants sont fictifs.** Ils sont générés à partir d’une cote d’édition originale
par album, d’une décroissance exponentielle par année de tirage et d’un aléa déterministe
(la même édition donne toujours le même chiffre). Ils servent à valider l’interface, pas à
estimer un album réel — un vrai référentiel devra être alimenté par les ventes publiques,
les libraires spécialisés et le BDM.

Le référentiel des variantes est simplifié : une même liste P/A/B/C/D est appliquée à tous
les albums selon leur année de parution, alors qu’en réalité chaque titre a sa propre
séquence de quatrièmes plats.

Boutons non branchés : PDF, demande d’expertise, envoi de photo, connexion, changement de langue.
