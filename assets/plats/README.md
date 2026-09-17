# Visuels des 2e plats

Un fichier PNG par **code de 2e plat** — pas par variante : un B24 est le même
2e plat quel que soit l'album, donc 102 fichiers couvrent les 809 variantes.

## Nommage

Le nom du fichier est le code du plat en minuscules, tout caractère non
alphanumérique devenant un tiret (voir `fichierPlat()` dans `app.js`) :

| Code au 2e plat | Fichier attendu        |
|-----------------|------------------------|
| `B24`           | `b24.png`              |
| `A18`           | `a18.png`              |
| `P6 bis`        | `p6-bis.png`           |
| `B22 zéro`      | `b22-zero.png`         |
| `C1 à C6 bis`   | `c1-a-c6-bis.png`      |
| `blanc`         | `blanc.png`            |

Format conseillé : portrait, ratio proche de 88 × 112 (l'aperçu recadre en
`object-fit: cover`), 430 × 548 px suffit largement.

Tant qu'un fichier est absent, l'aperçu affiche la vignette dessinée par
`platSVG()` et la mention « Visuel à venir ».

## Exception : un visuel pour une seule variante

Si une variante précise mérite son propre visuel, passez un 7e argument à `E()`
dans `data.js` :

```js
E(1946, 'B1', 'DJ', 'EO couleurs…', 1500, true, 'assets/plats/b1-eo-congo.png')
```
