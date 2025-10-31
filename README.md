# Pack de correctifs — Blanchoud Photography (GitHub Pages)

Ce pack contient :
- `galeries.html` (alias de redirection vers `galerie.html`)
- Pages légales : `mentions-legales.html`, `confidentialite.html`, `cgv.html`
- Dossiers de galeries avec `index.html` : `galeries/valais/`, `galeries/paris/`, `galeries/neuchatel/`
- Script `fix_links.sh` pour corriger tous les href `galeries.html` → `galerie.html`

## Installation rapide

1. Décompressez le pack à la **racine du dépôt** `blanchoud-photography`.
2. Optionnel : lancez le script de correction des liens :

```bash
chmod +x fix_links.sh
./fix_links.sh
```

3. Ajoutez, validez et poussez :

```bash
git add .
git commit -m "Fix liens galerie + pages légales + alias redirection"
git push
```

4. Testez l’URL publique :
`https://sylvainblanchoud77-png.github.io/blanchoud-photography/`

## Notes
- Si vous utilisez des liens absolus (`/blanchoud-photography/...`), vous pouvez les garder.
- Pour des URLs propres (`/galeries/valais/`), éditez les fichiers et ajoutez vos œuvres.
- Si des liens externes pointent déjà vers `/galeries.html`, gardez l’alias `galeries.html` (inclus dans ce pack).
