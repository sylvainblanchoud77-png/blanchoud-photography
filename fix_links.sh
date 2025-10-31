#!/usr/bin/env bash
set -euo pipefail

# Exécuter depuis la racine du dépôt
echo "🔧 Remplacement des liens 'galeries' → 'galerie'…"

# macOS/BSD sed (-i '') et GNU sed (-i)
if sed --version >/dev/null 2>&1; then
  SED="sed -i"
else
  SED="sed -i ''"
fi

# 1) Remplacer les liens fautifs (relatifs et absolus)
find . -type f -name "*.html" -print0 | xargs -0 $SED   -e 's|href="galeries\.html"|href="galerie.html"|g'   -e 's|href="/galeries\.html"|href="/galerie.html"|g'   -e 's|href="/blanchoud-photography/galeries\.html"|href="/blanchoud-photography/galerie.html"|g'

echo "✅ Terminé. Pensez à ajouter un alias galeries.html si des liens externes existent déjà."
