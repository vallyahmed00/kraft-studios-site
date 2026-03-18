/* ============================================================
   KRAFT STUDIOS – script.js
   - Three.js 3D aperture model in hero canvas
   - Navbar scroll behavior
   - Mobile hamburger
   - IntersectionObserver scroll reveals
   - Admin panel (password-gated, localStorage)
   - Drag & drop / click file upload
   - Gallery filter + lightbox
   - Booking form
   ============================================================ */

/* ─── 1. THREE.JS HERO LOGO ─── */
(function init3D() {
  const canvas = document.getElementById('logoCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 50);
  camera.position.set(0, 0, 5);

  // Background rim light
  const backLight = new THREE.DirectionalLight(0xffffff, 0.35);
  backLight.position.set(0, 0, -4);
  scene.add(backLight);

  const keyLight = new THREE.SpotLight(0xfff1dd, 1.4, 18, Math.PI / 4, 0.4, 1);
  keyLight.position.set(4, 5, 5);
  scene.add(keyLight);
  scene.add(keyLight.target);

  const fillLight = new THREE.SpotLight(0xff4b3a, 0.9, 16, Math.PI / 3, 0.6, 1);
  fillLight.position.set(-3, -2, 4);
  scene.add(fillLight);
  scene.add(fillLight.target);

  // Sculptural centerpiece (no external assets required)
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xc9a84c,
    metalness: 0.95,
    roughness: 0.12,
  });

  const ghostMat = new THREE.MeshBasicMaterial({
    color: 0xc9a84c,
    wireframe: true,
    opacity: 0.07,
    transparent: true,
  });

  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.05, 20, 120), goldMat);
  scene.add(ring1);

  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.035, 16, 90), goldMat);
  scene.add(ring2);

  const bladeGroup = new THREE.Group();
  const N = 7;
  for (let i = 0; i < N; i++) {
    const blade = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.14, 0.44, 3), goldMat);
    const a = (i / N) * Math.PI * 2;
    blade.position.set(Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0);
    blade.rotation.z = a + Math.PI / 2;
    bladeGroup.add(blade);
  }
  scene.add(bladeGroup);

  const ghost = new THREE.Mesh(new THREE.IcosahedronGeometry(1.8, 1), ghostMat);
  scene.add(ghost);

  const centre = new THREE.Mesh(new THREE.SphereGeometry(0.18, 32, 32), goldMat);
  scene.add(centre);

  // Mouse parallax
  let mx = 0, my = 0;
  window.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  const clock = new THREE.Clock();
  function tick() {
    requestAnimationFrame(tick);
    const t = clock.getElapsedTime();

    ring1.rotation.z = t * 0.22;
    ring1.rotation.x = Math.sin(t * 0.18) * 0.15;

    ring2.rotation.z = -t * 0.38;
    ring2.rotation.y = Math.cos(t * 0.2) * 0.1;

    bladeGroup.rotation.z = t * 0.55;

    ghost.rotation.y = t * 0.09;
    ghost.rotation.x = t * 0.06;

    scene.rotation.x += (my * 0.18 - scene.rotation.x) * 0.05;
    scene.rotation.y += (mx * 0.28 - scene.rotation.y) * 0.05;

    renderer.render(scene, camera);
  }
  tick();
})();

/* ─── 2. NAVBAR ─── */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

/* ─── 3. HAMBURGER / MOBILE MENU ─── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
}
if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);

function closeMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}

/* ─── 3b. ENQUIRE POPOVER ─── */
const enquireBtn = document.getElementById('enquireBtn');
const enquirePopover = document.getElementById('enquirePopover');

function closeEnquire() {
  if (!enquirePopover || !enquireBtn) return;
  enquirePopover.classList.remove('open');
  enquireBtn.setAttribute('aria-expanded', 'false');
}

function toggleEnquire() {
  if (!enquirePopover || !enquireBtn) return;
  const isOpen = enquirePopover.classList.toggle('open');
  enquireBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

// Allow inline onclick in HTML without breaking pages that don't have it
window.__closeEnquire = closeEnquire;

if (enquireBtn && enquirePopover) {
  enquireBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleEnquire();
  });

  document.addEventListener('click', (e) => {
    const t = e.target;
    const clickedInside = enquirePopover.contains(t) || enquireBtn.contains(t);
    if (!clickedInside) closeEnquire();
  }, { capture: true });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeEnquire();
  });
}

/* ─── 4. SCROLL REVEAL ─── */
const revealEls = document.querySelectorAll('.reveal');
const ro = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const delay = (i * 60) + 'ms';
      entry.target.style.transitionDelay = delay;
      entry.target.classList.add('visible');
      ro.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => ro.observe(el));

/* ─── 5. GALLERY STATE ─── */
let galleryItems = [];
try { galleryItems = JSON.parse(localStorage.getItem('ks_gallery') || '[]'); } catch (e) { galleryItems = []; }
let pendingFiles = [];
let activeCat = 'All';
let lightboxIdx = 0;

function saveGallery() {
  try { localStorage.setItem('ks_gallery', JSON.stringify(galleryItems)); } catch (e) { }
}

async function pushGalleryToServer() {
  try {
    await fetch('/.netlify/functions/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(galleryItems),
    });
  } catch (e) {
    console.error('Failed to sync gallery to server', e);
  }
}

/* ─── 6. RENDER GALLERY ─── */
function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  const empty = document.getElementById('galleryEmpty');
  const filters = document.getElementById('filterWrap');
  if (!grid || !empty) return;

  // Clear existing items
  grid.querySelectorAll('.gallery-item').forEach(el => el.remove());
  grid.querySelector('#catEmpty')?.remove();

  if (galleryItems.length === 0) {
    empty.style.display = '';
    if (filters) filters.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  if (filters) filters.style.display = '';

  const filtered = activeCat === 'All'
    ? galleryItems
    : galleryItems.filter(i => i.cat === activeCat);

  if (filtered.length === 0) {
    const msg = document.createElement('div');
    msg.className = 'gallery-empty';
    msg.id = 'catEmpty';
    msg.innerHTML = '<p>No items in this category yet.</p>';
    grid.appendChild(msg);
    return;
  }

  filtered.forEach(item => {
    const globalIdx = galleryItems.indexOf(item);
    const el = document.createElement('div');
    el.className = 'gallery-item';
    el.addEventListener('click', () => openLightbox(globalIdx));

    if (item.type === 'video') {
      el.innerHTML = `
        <video src="${item.src}" muted loop preload="metadata"></video>
        <div class="gallery-item-overlay"><span class="gallery-item-caption">${item.caption || ''}</span></div>
        <span class="video-badge">Video</span>
      `;
      const v = el.querySelector('video');
      el.addEventListener('mouseenter', () => v.play());
      el.addEventListener('mouseleave', () => { v.pause(); v.currentTime = 0; });
    } else {
      el.innerHTML = `
        <img src="${item.src}" alt="${item.caption || 'Kraft Studios photo'}" loading="lazy" />
        <div class="gallery-item-overlay"><span class="gallery-item-caption">${item.caption || ''}</span></div>
      `;
    }
    grid.appendChild(el);
  });

  renderAdminThumbs();
}

async function initGallery() {
  try {
    const res = await fetch('/.netlify/functions/gallery');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        galleryItems = data.map(d => ({
          src: d.src,
          type: d.type || 'image',
          caption: d.caption || '',
          cat: d.cat || 'All',
        }));
        saveGallery();
      }
    }
  } catch (e) {
    console.warn('Falling back to local gallery cache', e);
  }
  renderGallery();
}

/* ─── 7. FILTER BUTTONS ─── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCat = btn.dataset.cat;
    renderGallery();
  });
});

/* ─── 8. LIGHTBOX ─── */
function openLightbox(index) {
  lightboxIdx = index;
  showLightboxItem();
  document.getElementById('lightbox').classList.add('open');
  document.getElementById('lightboxOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function showLightboxItem() {
  const item = galleryItems[lightboxIdx];
  const img = document.getElementById('lightboxImg');
  const vid = document.getElementById('lightboxVid');
  const cap = document.getElementById('lightboxCaption');

  if (item.type === 'video') {
    img.style.display = 'none';
    vid.style.display = 'block';
    vid.src = item.src;
  } else {
    vid.style.display = 'none';
    vid.src = '';
    img.style.display = 'block';
    img.src = item.src;
    img.alt = item.caption || '';
  }
  cap.textContent = item.caption || '';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.getElementById('lightboxOverlay').classList.remove('open');
  const vid = document.getElementById('lightboxVid');
  vid.pause?.();
  vid.src = '';
  document.body.style.overflow = '';
}

function lightboxNav(dir) {
  lightboxIdx = (lightboxIdx + dir + galleryItems.length) % galleryItems.length;
  showLightboxItem();
}

document.addEventListener('keydown', e => {
  const lb = document.getElementById('lightbox');
  if (!lb || !lb.classList.contains('open')) return;
  if (e.key === 'ArrowRight') lightboxNav(1);
  if (e.key === 'ArrowLeft') lightboxNav(-1);
  if (e.key === 'Escape') closeLightbox();
});

/* ─── 9. ADMIN PANEL ─── */
const ADMIN_PASSWORD = 'kraftstudios2026';

function toggleAdminPanel() {
  const panel = document.getElementById('adminPanel');
  const overlay = document.getElementById('adminOverlay');
  const isOpen = panel.classList.contains('open');

  if (isOpen) {
    panel.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  } else {
    panel.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function checkAdminPass() {
  const val = document.getElementById('adminPassInput').value;
  const err = document.getElementById('adminError');
  if (val === ADMIN_PASSWORD) {
    document.getElementById('adminGate').style.display = 'none';
    document.getElementById('adminControls').style.display = 'block';
    err.textContent = '';
    renderAdminThumbs();
  } else {
    err.textContent = 'Incorrect password.';
    document.getElementById('adminPassInput').value = '';
    document.getElementById('adminPassInput').focus();
  }
}

const adminPassInput = document.getElementById('adminPassInput');
if (adminPassInput) {
  adminPassInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') checkAdminPass();
  });
}

/* ─── 10. FILE UPLOAD ─── */
const fileInput = document.getElementById('fileInput');
const uploadZone = document.getElementById('uploadZone');

if (fileInput) fileInput.addEventListener('change', e => processFiles(Array.from(e.target.files)));

if (uploadZone) {
  uploadZone.addEventListener('dragover', e => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
  });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
  uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files).filter(f =>
      f.type.startsWith('image/') || f.type.startsWith('video/')
    );
    processFiles(files);
  });
}

function processFiles(files) {
  if (!files.length) return;
  pendingFiles = [];
  const preview = document.getElementById('adminPreview');
  if (!preview) return;
  preview.innerHTML = '';

  let loaded = 0;
  files.forEach(file => {
    const reader = new FileReader();
    const isVideo = file.type.startsWith('video/');

    reader.onload = ev => {
      pendingFiles.push({ src: ev.target.result, type: isVideo ? 'video' : 'image', name: file.name });

      const wrap = document.createElement('div');
      wrap.className = 'admin-preview-item';
      wrap.innerHTML = isVideo
        ? `<video src="${ev.target.result}" muted></video>`
        : `<img src="${ev.target.result}" alt="" />`;
      preview.appendChild(wrap);

      if (++loaded === files.length) {
        document.getElementById('captionRow').style.display = 'flex';
      }
    };
    reader.readAsDataURL(file);
  });

  if (fileInput) fileInput.value = '';
}

function addToGallery() {
  if (!pendingFiles.length) return;
  const caption = document.getElementById('captionInput').value.trim();
  const cat = document.getElementById('categorySelect').value;

  pendingFiles.forEach(f => galleryItems.push({ src: f.src, type: f.type, caption, cat }));
  saveGallery();
  renderGallery();

  pushGalleryToServer();

  pendingFiles = [];
  document.getElementById('adminPreview').innerHTML = '';
  document.getElementById('captionInput').value = '';
  document.getElementById('captionRow').style.display = 'none';

  showToast('Added to gallery');
}

/* ─── 11. ADMIN THUMBS ─── */
function renderAdminThumbs() {
  const container = document.getElementById('adminThumbs');
  if (!container) return;
  container.innerHTML = '';

  if (!galleryItems.length) {
    container.innerHTML = '<p style="color:var(--stone);font-size:0.825rem;">Nothing here yet.</p>';
    return;
  }

  galleryItems.forEach((item, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'admin-thumb-item';
    wrap.innerHTML = item.type === 'video'
      ? `<video src="${item.src}" muted></video>`
      : `<img src="${item.src}" alt="${item.caption || ''}" />`;

    const del = document.createElement('button');
    del.className = 'admin-thumb-del';
    del.title = 'Remove';
    del.textContent = '✕';
    del.addEventListener('click', () => {
      galleryItems.splice(i, 1);
      saveGallery();
      renderGallery();
    });

    wrap.appendChild(del);
    container.appendChild(wrap);
  });
}

/* ─── 12. EXPORT / IMPORT ─── */
function exportGalleryData() {
  const blob = new Blob([JSON.stringify(galleryItems, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'kraftstudios_gallery_backup.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importGalleryData() {
  document.getElementById('importInput').click();
}

function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (Array.isArray(data)) {
        galleryItems = data;
        saveGallery();
        renderGallery();
        showToast('Gallery restored');
      }
    } catch {
      showToast('Could not read that file', true);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

/* ─── 13. TOAST ─── */
function showToast(msg, isError = false) {
  document.querySelector('.kk-toast')?.remove();
  const toast = document.createElement('div');
  toast.className = 'kk-toast';
  toast.textContent = msg;
  toast.style.background = isError ? '#8b2020' : 'var(--ink-3)';
  toast.style.color = isError ? '#fff' : 'var(--text)';
  toast.style.border = `1px solid ${isError ? '#d25f5f' : 'var(--line)'}`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; }, 2400);
  setTimeout(() => toast.remove(), 2800);
}

/* ─── 14. BOOKING FORM ─── */
function submitBooking(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const ok = document.getElementById('formSuccess');

  btn.textContent = 'Sending…';
  btn.disabled = true;

  const data = Object.fromEntries(new FormData(e.target));

  fetch('/.netlify/functions/booking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then(res => {
      if (!res.ok) throw new Error('Request failed');
      return res.json().catch(() => ({}));
    })
    .then(() => {
      e.target.reset();
      btn.style.display = 'none';
      ok.style.display = 'block';
    })
    .catch(err => {
      console.error('Booking submit failed', err);
      btn.textContent = 'Send enquiry';
      btn.disabled = false;
      showToast('Could not send right now. Please try again.', true);
    });
}

/* ─── 15. INIT ─── */
initGallery();
