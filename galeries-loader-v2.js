// GALERIES LOADER - Charge les photos depuis Netlify CMS
// Ce script lit les fichiers .md dans /galeries/ et affiche les photos

// Fonction pour parser le contenu des fichiers .md (format ligne par ligne)
function parseFrontMatter(content) {
  // D'abord essayer le format YAML standard avec ---
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---/;
  const match = content.match(frontMatterRegex);
  
  if (match) {
    const frontMatter = {};
    const lines = match[1].split('\n');
    
    lines.forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > -1) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();
        
        // Enlever les guillemets
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        }
        
        frontMatter[key] = value;
      }
    });
    
    return frontMatter;
  }
  
  // Sinon, parser le format ligne par ligne (sans ---)
  const lines = content.trim().split('\n');
  
  if (lines.length < 7) return null; // Pas assez de lignes
  
  // Format attendu :
  // Ligne 0: galerie
  // Ligne 1: title
  // Ligne 2: description
  // Ligne 3: image
  // Ligne 4: price
  // Ligne 5: edition
  // Ligne 6: format
  // Ligne 7: date
  
  return {
    galerie: lines[0] ? lines[0].trim() : '',
    title: lines[1] ? lines[1].trim() : '',
    description: lines[2] ? lines[2].trim() : '',
    image: lines[3] ? lines[3].trim() : '',
    price: lines[4] ? lines[4].trim() : '',
    edition: lines[5] ? lines[5].trim() : '',
    format: lines[6] ? lines[6].trim() : '',
    date: lines[7] ? lines[7].trim() : ''
  };
}

// Fonction pour charger toutes les photos d'une galerie
async function loadGaleriePhotos(galerieName) {
  try {
    // Récupérer la liste des fichiers depuis GitHub
    const response = await fetch(`https://api.github.com/repos/sylvainblanchoud77-png/blanchoud-photography/contents/galeries`);
    
    if (!response.ok) {
      console.error('Erreur lors du chargement des galeries');
      return [];
    }
    
    const files = await response.json();
    const photos = [];
    
    // Charger chaque fichier .md
    for (const file of files) {
      if (file.name.endsWith('.md')) {
        const contentResponse = await fetch(file.download_url);
        const content = await contentResponse.text();
        const data = parseFrontMatter(content);
        
        if (data && data.galerie && data.galerie.toLowerCase() === galerieName.toLowerCase()) {
          photos.push({
            title: data.title || 'Sans titre',
            image: data.image || '',
            description: data.description || '',
            price: data.price || '',
            edition: data.edition || '3/3 disponibles',
            format: data.format || '100 x 70 cm',
            date: data.date || ''
          });
        }
      }
    }
    
    // Trier par date (plus récent en premier)
    photos.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return photos;
    
  } catch (error) {
    console.error('Erreur lors du chargement des photos:', error);
    return [];
  }
}

// Fonction pour afficher les photos dans la galerie
function displayPhotos(photos, containerSelector) {
  const container = document.querySelector(containerSelector);
  
  if (!container) {
    console.error('Container not found:', containerSelector);
    return;
  }
  
  if (photos.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: #8B7355;">
        <p style="font-size: 18px; margin-bottom: 20px;">Aucune photo dans cette galerie pour le moment.</p>
        <p style="font-size: 14px; opacity: 0.7;">Les photos seront bientôt ajoutées.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = '';
  
  photos.forEach(photo => {
    const photoElement = document.createElement('div');
    photoElement.className = 'galerie-photo-item';
    photoElement.style.cssText = `
      margin-bottom: 60px;
      opacity: 0;
      animation: fadeIn 0.6s ease forwards;
    `;
    
    photoElement.innerHTML = `
      <div class="photo-container" style="margin-bottom: 20px; position: relative; overflow: hidden; background: #F5F5F0;">
        <img src="${photo.image}" 
             alt="${photo.title}" 
             style="width: 100%; height: auto; display: block; cursor: pointer; transition: transform 0.3s ease;"
             onclick="openLightbox('${photo.image}', '${photo.title}')">
      </div>
      <div class="photo-info" style="padding: 0 20px;">
        <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 24px; color: #2C2C2C; margin-bottom: 10px;">
          ${photo.title}
        </h3>
        ${photo.description ? `
          <p style="font-size: 15px; color: #666; line-height: 1.6; margin-bottom: 15px;">
            ${photo.description}
          </p>
        ` : ''}
        <div style="display: flex; flex-wrap: wrap; gap: 20px; font-size: 14px; color: #8B7355;">
          ${photo.format ? `<span><strong>Format:</strong> ${photo.format}</span>` : ''}
          ${photo.edition ? `<span><strong>Édition:</strong> ${photo.edition}</span>` : ''}
          ${photo.price ? `<span><strong>Prix:</strong> CHF ${photo.price}</span>` : ''}
        </div>
      </div>
    `;
    
    container.appendChild(photoElement);
  });
  
  // Ajouter l'animation CSS
  if (!document.getElementById('galerie-animations')) {
    const style = document.createElement('style');
    style.id = 'galerie-animations';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .photo-container img:hover {
        transform: scale(1.02);
      }
    `;
    document.head.appendChild(style);
  }
}

// Fonction pour ouvrir la lightbox
function openLightbox(imageUrl, title) {
  // Créer la lightbox si elle n'existe pas
  let lightbox = document.getElementById('photo-lightbox');
  
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'photo-lightbox';
    lightbox.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      cursor: pointer;
    `;
    
    lightbox.innerHTML = `
      <div style="max-width: 90%; max-height: 90%; position: relative;">
        <img id="lightbox-image" src="" alt="" style="max-width: 100%; max-height: 90vh; display: block; margin: 0 auto;">
        <p id="lightbox-title" style="color: white; text-align: center; margin-top: 20px; font-size: 18px;"></p>
        <button style="position: absolute; top: -40px; right: 0; background: none; border: none; color: white; font-size: 40px; cursor: pointer; padding: 10px;">×</button>
      </div>
    `;
    
    document.body.appendChild(lightbox);
    
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox || e.target.tagName === 'BUTTON') {
        lightbox.style.display = 'none';
      }
    });
  }
  
  // Afficher l'image
  document.getElementById('lightbox-image').src = imageUrl;
  document.getElementById('lightbox-title').textContent = title;
  lightbox.style.display = 'flex';
}

// Fonction d'initialisation
async function initGalerie() {
  // Détecter quelle galerie afficher via le hash de l'URL
  const hash = window.location.hash.substring(1); // Enlever le #
  
  if (!hash) {
    console.log('Aucune galerie sélectionnée');
    return;
  }
  
  // Afficher un loader
  const container = document.querySelector('#galerie-photos-container');
  if (container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: #8B7355;">
        <p style="font-size: 18px;">Chargement des photos...</p>
      </div>
    `;
  }
  
  // Charger et afficher les photos
  const photos = await loadGaleriePhotos(hash);
  displayPhotos(photos, '#galerie-photos-container');
}

// Initialiser au chargement de la page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGalerie);
} else {
  initGalerie();
}

// Réinitialiser quand le hash change
window.addEventListener('hashchange', initGalerie);
