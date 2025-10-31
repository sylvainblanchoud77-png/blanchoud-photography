# Blanchoud Photography — Starter Astro

## Installation
```bash
npm i
npm run dev
```

## Important
- Remplacez `public/css/prima.css` par **votre fichier CSS original** (prima.css).
- Copiez vos images dans `public/images/` (ou gardez votre structure et ajustez les chemins).
- Exécutez `npm run lint:paths` et `npm run lint:links` pour éviter 404 et problèmes de casse.

## Déploiement GitHub Pages
- Poussez sur `main`. Le workflow `.github/workflows/deploy.yml` publie automatiquement.

## Qualité
- Pa11y (a11y) et Lighthouse (perf/SEO) sont configurés (workflow `quality.yml` sur PR).
