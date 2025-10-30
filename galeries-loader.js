function parseFrontMatter(content) {
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
  return null;
}

async function loadGaleriePhotos(galerieName) {
  try {
    const response = await fetch('https://api.github.com/repos/sylvainblanchoud77-png/blanchoud-photography/contents/galeries/' + galerieName);
    if (!response.ok) {
      return [];
    }
    const files = await response.json();
    const photos = [];
    for (const file of files) {
      if (file.name.endsWith('.md')) {
        try {
          const contentResponse = await fetch(file.download_url);
          const content = await contentResponse.text();
          const data = parseFrontMatter(content);
          if (data && data.image) {
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
        } catch (error) {
          continue;
        }
      }
    }
    photos.sort((a, b) => new Date(b.date) - new Date(a.date));
    return photos;
  } catch (error) {
    return [];
  }
}

function displayPhotos(photos, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    return;
  }
  if (photos.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:60px 20px;color:#8B7355"><p style="font-size:18px">Aucune photo dans cette galerie pour le moment.</p></div>';
    return;
  }
  container.innerHTML = '';
  photos.forEach(photo => {
    const div = document.createElement('div');
    div.style.cssText = 'margin-bottom:60px;opacity:0;animation:fadeIn 0.6s ease forwards';
    const img = document.createElement('img');
    img.src = photo.image;
    img.alt = photo.title;
    img.style.cssText = 'width:100%;height:auto;display:block;cursor:pointer;transition:transform 0.3s ease';
    img.onclick = function() {
      openLightbox(photo.image, photo.title);
    };
    const imgContainer = document.createElement('div');
    imgContainer.style.cssText = 'margin-bottom:20px;position:relative;overflow:hidden;background:#F5F5F0';
    imgContainer.appendChild(img);
    const info = document.createElement('div');
    info.style.cssText = 'padding:0 20px';
    const title = document.createElement('h3');
    title.style.cssText = 'font-family:Cormorant Garamond,serif;font-size:24px;color:#2C2C2C;margin-bottom:10px';
    title.textContent = photo.title;
    info.appendChild(title);
    if (photo.description) {
      const desc = document.createElement('p');
      desc.style.cssText = 'font-size:15px;color:#666;line-height:1.6;margin-bottom:15px';
      desc.textContent = photo.description;
      info.appendChild(desc);
    }
    const details = document.createElement('div');
    details.style.cssText = 'display:flex;flex-wrap:wrap;gap:20px;font-size:14px;color:#8B7355';
    if (photo.format) {
      const fmt = document.createElement('span');
      fmt.innerHTML = '<strong>Format:</strong> ' + photo.format;
      details.appendChild(fmt);
    }
    if (photo.edition) {
      const ed = document.createElement('span');
      ed.innerHTML = '<strong>Edition:</strong> ' + photo.edition;
      details.appendChild(ed);
    }
    if (photo.price) {
      const pr = document.createElement('span');
      pr.innerHTML = '<strong>Prix:</strong> CHF ' + photo.price;
      details.appendChild(pr);
    }
    info.appendChild(details);
    div.appendChild(imgContainer);
    div.appendChild(info);
    container.appendChild(div);
  });
  if (!document.getElementById('galerie-animations')) {
    const style = document.createElement('style');
    style.id = 'galerie-animations';
    style.textContent = '@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(style);
  }
}

function openLightbox(imageUrl, title) {
  let lightbox = document.getElementById('photo-lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'photo-lightbox';
    lightbox.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:10000;display:flex;align-items:center;justify-content:center;padding:40px;cursor:pointer';
    const inner = document.createElement('div');
    inner.style.cssText = 'max-width:90%;max-height:90%;position:relative';
    const img = document.createElement('img');
    img.id = 'lightbox-image';
    img.style.cssText = 'max-width:100%;max-height:90vh;display:block;margin:0 auto';
    const titleEl = document.createElement('p');
    titleEl.id = 'lightbox-title';
    titleEl.style.cssText = 'color:white;text-align:center;margin-top:20px;font-size:18px';
    const btn = document.createElement('button');
    btn.textContent = '×';
    btn.style.cssText = 'position:absolute;top:-40px;right:0;background:none;border:none;color:white;font-size:40px;cursor:pointer;padding:10px';
    inner.appendChild(img);
    inner.appendChild(titleEl);
    inner.appendChild(btn);
    lightbox.appendChild(inner);
    document.body.appendChild(lightbox);
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox || e.target.tagName === 'BUTTON') {
        lightbox.style.display = 'none';
      }
    });
  }
  document.getElementById('lightbox-image').src = imageUrl;
  document.getElementById('lightbox-title').textContent = title;
  lightbox.style.display = 'flex';
}

async function initGalerie() {
  const hash = window.location.hash.substring(1);
  if (!hash) {
    return;
  }
  const container = document.querySelector('#galerie-photos-container');
  if (container) {
    container.innerHTML = '<div style="text-align:center;padding:60px 20px;color:#8B7355"><p style="font-size:18px">Chargement des photos...</p></div>';
  }
  const photos = await loadGaleriePhotos(hash);
  displayPhotos(photos, '#galerie-photos-container');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGalerie);
} else {
  initGalerie();
}

window.addEventListener('hashchange', initGalerie);
