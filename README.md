# Blanchoud Photography — Site statique GitHub Pages

Ce site lit **en direct** vos images (`/images`) et billets Markdown (`/blog`) depuis ce dépôt via l'API GitHub. Aucun build, aucun framework.

## Déploiement (GitHub Pages)
1. Copiez tout ce dossier à la racine du dépôt `blanchoud-photography`.
2. Dans **Settings → Pages** : *Build and deployment* → **Deploy from a branch**, **Branch: `main`**, **/root**.
3. Attendez l'URL `https://<user>.github.io/<repo>/`.

## Contenu
- Placez les images dans **`/images`** (JPEG/PNG/WebP).
- Placez les billets dans **`/blog`** au format `.md`.
- La galerie et le journal se mettent à jour automatiquement.

## Config rapide
- Éditez `index.html` → `window.__CONFIG__` si vous changez d'utilisateur/dépôt.
- Ajustez la palette dans `styles.css` (section `:root`).

## Accessibilité & perf
- Contrastes conformes WCAG 2.2 AA, navigation clavier, focus visibles.
- Core Web Vitals : CSS unique, JS minimal, lazy loading, cache via Service Worker.
