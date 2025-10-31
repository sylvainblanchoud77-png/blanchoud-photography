const cfg = window.__CONFIG__ || {
  owner: "sylvainblanchoud77-png",
  repo: "blanchoud-photography",
  imagesDir: "images",
  blogDir: "blog",
  siteTitle: "Blanchoud Photography"
};
const GH = "https://api.github.com/repos/" + cfg.owner + "/" + cfg.repo + "/contents/";
const RAW = "https://raw.githubusercontent.com/" + cfg.owner + "/" + cfg.repo + "/main/";

function qs(sel, el=document){ return el.querySelector(sel); }
function fmtSize(bytes){ if(bytes==null) return ""; const u=['o','Ko','Mo','Go']; let i=0; while(bytes>=1024&&i<u.length-1){bytes/=1024;i++;} return bytes.toFixed(i?1:0)+' '+u[i]; }
function titleFromName(name){ return name.replace(/[-_]/g,' ').replace(/\.[^.]+$/,'').replace(/\b\w/g,m=>m.toUpperCase()); }
function fromQuery(){ return Object.fromEntries(new URLSearchParams(location.search).entries()); }

// Theme toggle
const toggle = qs('#themeToggle');
if (toggle) toggle.addEventListener('click', ()=>{
  const on = document.documentElement.classList.toggle('light');
  localStorage.setItem('theme', on ? 'light' : 'dark');
});
if (localStorage.getItem('theme')==='light') document.documentElement.classList.add('light');

// PWA
if ('serviceWorker' in navigator) { navigator.serviceWorker.register('sw.js').catch(()=>{}); }

// Home marquee
(async function buildHeroMarquee(){
  const wrap = qs('.hero-marquee'); if(!wrap) return;
  const files = await listDir(cfg.imagesDir);
  const row1 = document.createElement('div'); row1.className = 'marquee-row';
  const row2 = document.createElement('div'); row2.className = 'marquee-row';
  for (const f of files.slice(0, 20)) {
    const i = new Image(); i.src = RAW + f.path; i.alt = f.name;
    row1.appendChild(i.cloneNode());
    row2.appendChild(i.cloneNode());
  }
  wrap.append(row1, row2);
})();

// Gallery
(async function buildGallery(){
  const grid = qs('#grid'); if(!grid) return;
  const search = document.getElementById('search');
  const sortSel = document.getElementById('sort');
  const shuffleBtn = document.getElementById('shuffle');

  let items = await listDir(cfg.imagesDir);

  function render(view){
    grid.innerHTML = '';
    for (const f of view) {
      const fig = document.createElement('figure'); fig.className='card';
      const img = new Image(); img.loading='lazy'; img.alt = titleFromName(f.name);
      const src = RAW + f.path; img.src = src;
      img.addEventListener('click', ()=>openLightbox(src, img.alt));
      const cap = document.createElement('figcaption'); cap.className='caption';
      cap.textContent = img.alt + (f.size? ' — '+fmtSize(f.size):'');
      fig.append(img, cap); grid.appendChild(fig);
    }
  }

  function apply(){
    const term = (search?.value||'').toLowerCase();
    let view = [...items];
    if (term) view = view.filter(f => f.name.toLowerCase().includes(term));
    const s = sortSel?.value || 'name';
    view.sort((a,b)=> s==='size'? (b.size||0)-(a.size||0) : a.name.localeCompare(b.name,'fr'));
    render(view);
  }

  search?.addEventListener('input', apply);
  sortSel?.addEventListener('change', apply);
  shuffleBtn?.addEventListener('click', ()=>{ items.sort(()=>Math.random()-0.5); render(items); });
  apply();
})();

function openLightbox(src, alt){
  const dlg = document.getElementById('lightbox'); if(!dlg) return;
  const img = document.getElementById('lightboxImg'); img.src = src; img.alt = alt;
  document.getElementById('lightboxCaption').textContent = alt || '';
  dlg.showModal(); document.getElementById('closeLightbox').onclick = ()=>dlg.close();
}

// Blog list
(async function buildBlog(){
  const list = document.getElementById('posts'); if(!list) return;
  const posts = (await listDir(cfg.blogDir)).filter(f => /\.md$/i.test(f.name));
  posts.sort((a,b)=> a.name.localeCompare(b.name));
  for (const p of posts) {
    const a = document.createElement('a'); a.className='post-card';
    a.href = 'post.html?path=' + encodeURIComponent(p.path);
    a.innerHTML = `<h3>${titleFromName(p.name)}</h3><div class="meta">${fmtSize(p.size)}</div>`;
    list.appendChild(a);
  }
})();(async function buildBlog(){
  const list = document.getElementById('posts'); if(!list) return;
  const posts = (await listDir(cfg.blogDir)).filter(f => /\.md$/i.test(f.name));
  posts.sort((a,b)=> a.name.localeCompare(b.name,'fr'));

  if (!posts.length) {
    list.innerHTML = `
      <div class="post-card">
        <h3>Aucun billet pour le moment</h3>
        <div class="meta">Ajoute des fichiers .md dans /blog de ton dépôt</div>
      </div>`;
    return;
  }

  for (const p of posts) {
    const a = document.createElement('a'); a.className='post-card';
    a.href = 'post.html?path=' + encodeURIComponent(p.path);
    a.innerHTML = `<h3>${titleFromName(p.name)}</h3><div class="meta">${p.size? (Math.round(p.size/1024))+' Ko':''}</div>`;
    list.appendChild(a);
  }
})();


// Single post
(async function renderPost(){
  const article = document.getElementById('post'); if(!article) return;
  const q = fromQuery();
  if (!q.path) { article.innerHTML = '<p>Chemin manquant.</p>'; return; }
  const md = await fetch(RAW + q.path).then(r=>r.text()).catch(()=> '# Introuvable');
  article.innerHTML = marked.parse(md, { mangle:false, headerIds:false });
  const h1 = article.querySelector('h1'); if (h1) document.title = h1.textContent + ' — ' + (cfg.siteTitle||'');
})();

// GitHub API helper
// Liste récursive via Git Trees API
async function listDir(path){
  try{
    const api = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/git/trees/main?recursive=1`;
    const res = await fetch(api);
    if (!res.ok) return [];
    const { tree = [] } = await res.json();
    const norm = p => p.replace(/^\/+|\/+$/g,'') + '/';
    const base = norm(path);
    const isImage = p => /\.(jpe?g|png|webp|avif|gif|svg)$/i.test(p);
    const isMarkdown = p => /\.md$/i.test(p);

    // déduis le type selon le dossier ciblé
    const accept = path.startsWith('blog') ? isMarkdown : isImage;

    return tree
      .filter(e => e.type === 'blob' && e.path.startsWith(base) && accept(e.path))
      .map(e => ({
        name: e.path.split('/').pop(),
        size: e.size,
        path: e.path,
        url: `https://raw.githubusercontent.com/${cfg.owner}/${cfg.repo}/main/${e.path}`
      }));
  } catch(e){ console.error(e); return []; }
}
