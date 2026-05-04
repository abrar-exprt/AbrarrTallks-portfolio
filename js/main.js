// ============================================================
// main.js — Page-specific logic
// Imported by index.html, portfolio.html, blog.html
// ============================================================
import {
  initNav, esc, truncate, normalizeImageUrl, toast,
  fetchProjects, fetchHeroImages, fetchUpdates, fetchStats, fetchBlogs,
  FALLBACK_PROJECTS, FALLBACK_HERO_IMAGES
} from "./shared.js";

// ── ALWAYS INIT NAV ───────────────────────────────────────────────────
initNav();

const PAGE = document.body.dataset.page || '';

// ============================================================
// HOME PAGE
// ============================================================
if (PAGE === 'home') {

  /* UPDATES TICKER */
  async function initUpdatesTicker() {
    const bar   = document.getElementById('updates-bar');
    const track = document.getElementById('updates-track');
    if (!bar || !track) return;
    try {
      const updates = await fetchUpdates();
      if (!updates.length) { bar.style.display = 'none'; return; }
      const html = updates.map(u =>
        `<span class="update-chip">
          <span class="chip-badge">${esc(u.date||'')}</span>
          ${esc(u.title)}
        </span>`
      ).join('');
      // duplicate for seamless loop
      track.innerHTML = html + html;
      bar.style.display = 'block';
    } catch(e) {
      bar.style.display = 'none';
    }
  }

  // Close button
  const closeBar = document.getElementById('updates-close');
  if (closeBar) {
    closeBar.addEventListener('click', () => {
      const bar = document.getElementById('updates-bar');
      if (bar) { bar.style.display = 'none'; sessionStorage.setItem('updates-closed','1'); }
    });
    // Don't show if user already closed this session
    if (sessionStorage.getItem('updates-closed') === '1') {
      const bar = document.getElementById('updates-bar');
      if (bar) bar.style.display = 'none';
    } else {
      initUpdatesTicker();
    }
  } else {
    initUpdatesTicker();
  }

  /* MARQUEE */
  async function initMarquee() {
    const track = document.getElementById('marqueeTrack');
    if (!track) return;
    const images = await fetchHeroImages();
    const html   = images.map(url =>
      `<div class="marquee-item">
        <img src="${esc(normalizeImageUrl(url))}" loading="lazy"
          alt="Web design project — Abrar Ali portfolio"
          onerror="this.parentNode.style.display='none'">
      </div>`
    ).join('');
    track.innerHTML = html + html; // duplicate for seamless loop
  }

  /* HOME PROJECTS */
  async function initHomeProjects() {
    const grid = document.getElementById('homeProjectsGrid');
    if (!grid) return;

    // Skeleton
    grid.innerHTML = Array(6).fill(`
      <div class="pcard">
        <div class="pcard-thumb skeleton" style="aspect-ratio:16/10"></div>
        <div class="pcard-body">
          <div class="skeleton" style="height:12px;width:55%;border-radius:6px;margin-bottom:12px"></div>
          <div class="skeleton" style="height:16px;width:88%;border-radius:6px;margin-bottom:8px"></div>
          <div class="skeleton" style="height:13px;width:70%;border-radius:6px"></div>
        </div>
      </div>`).join('');

    const projects = await fetchProjects();
    const top6 = projects.slice(0, 6);
    if (!top6.length) { grid.innerHTML = '<p class="empty-state">No projects yet.</p>'; return; }

    const fallback = 'https://images.unsplash.com/photo-1487014679447-9f8336841d58?w=600&q=80';
    grid.innerHTML = top6.map(p => `
      <article class="pcard">
        <div class="pcard-thumb">
          <img src="${esc(normalizeImageUrl(p.image)||fallback)}"
               alt="${esc(p.title)} — web design project"
               loading="lazy"
               onerror="this.src='${fallback}'">
          <span class="pcard-status${p.status==='draft'?' draft':''}">${esc(p.status||'live')}</span>
        </div>
        <div class="pcard-body">
          <span class="pcard-cat">${esc(p.category||'web')}</span>
          <h3>${esc(p.title)}</h3>
          <p>${esc(truncate(p.description||'',120))}</p>
          ${p.url?`<a href="${esc(p.url)}" target="_blank" rel="noopener" class="pcard-link">Visit Live →</a>`:''}
        </div>
      </article>`).join('');
  }

  /* PRICING */
  const priceSelect = document.getElementById('priceSelect');
  if (priceSelect) {
    const prices = {
      landing:   '₹4,999 – ₹9,999 · Landing Page',
      portfolio: '₹5,999 – ₹12,999 · Portfolio / Personal',
      basic:     '₹7,999 – ₹15,999 · Basic Website (3–5 pages)',
      blog:      '₹9,999 – ₹18,999 · Blog / News Website',
      business:  '₹12,999 – ₹24,999 · Business Website',
      course:    '₹15,999 – ₹29,999 · Course / Education Site',
      booking:   '₹18,999 – ₹34,999 · Hotel / Travel Booking Site',
      ecommerce: '₹22,999 – ₹45,999 · E-Commerce Store'
    };
    priceSelect.addEventListener('change', function () {
      document.getElementById('priceDisplay').textContent = prices[this.value] || 'Select a package above';
    });
  }

  initMarquee();
  initHomeProjects();
}

// ============================================================
// PORTFOLIO PAGE
// ============================================================
if (PAGE === 'portfolio') {
  let allProjects  = [];
  let activeFilter = 'all';

  function renderCards() {
    const grid = document.getElementById('portfolioGrid');
    if (!grid) return;
    const list = activeFilter === 'all'
      ? allProjects
      : allProjects.filter(p => (p.category||'').toLowerCase() === activeFilter);

    if (!list.length) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1">No projects in this category yet.</div>';
      return;
    }
    const fallback = 'https://images.unsplash.com/photo-1487014679447-9f8336841d58?w=600&q=80';
    const tags_arr = p => Array.isArray(p.tags)
      ? p.tags : String(p.tags||'').split(',').map(t=>t.trim()).filter(Boolean);

    grid.innerHTML = list.map(p => `
      <article class="pcard">
        <div class="pcard-thumb">
          <img src="${esc(normalizeImageUrl(p.image)||fallback)}"
               alt="${esc(p.title)} — web design Kashmir"
               loading="lazy"
               onerror="this.src='${fallback}'">
          <span class="pcard-status${p.status==='draft'?' draft':''}">${esc(p.status||'live')}</span>
        </div>
        <div class="pcard-body">
          <span class="pcard-cat">${esc(p.category||'web')}</span>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.description||'')}</p>
          ${tags_arr(p).length
            ? `<div class="pcard-tags">${tags_arr(p).slice(0,4).map(t=>`<span class="ptag">${esc(t)}</span>`).join('')}</div>`
            : ''}
          ${p.url?`<a href="${esc(p.url)}" target="_blank" rel="noopener" class="pcard-link">Visit Live Site →</a>`:''}
        </div>
      </article>`).join('');
  }

  function showSkeletons() {
    const grid = document.getElementById('portfolioGrid');
    if (!grid) return;
    grid.innerHTML = Array(8).fill(`
      <div class="pcard">
        <div class="pcard-thumb skeleton" style="aspect-ratio:16/10"></div>
        <div class="pcard-body">
          <div class="skeleton" style="height:12px;width:50%;border-radius:6px;margin-bottom:12px"></div>
          <div class="skeleton" style="height:16px;width:90%;border-radius:6px;margin-bottom:8px"></div>
          <div class="skeleton" style="height:13px;width:70%;border-radius:6px"></div>
        </div>
      </div>`).join('');
  }

  // Filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderCards();
    });
  });

  // Load
  (async () => {
    showSkeletons();
    const [projects, stats] = await Promise.all([fetchProjects(), fetchStats()]);
    allProjects = projects;
    // Stats
    ['statProjects','statYears','statCompanies','statSatisfaction'].forEach((id,i) => {
      const el = document.getElementById(id);
      if (!el) return;
      const vals = [stats.projects||20, stats.years||4, stats.companies||2, stats.satisfaction||100];
      const suffixes = ['+','+','','%'];
      el.textContent = vals[i] + suffixes[i];
    });
    renderCards();
  })();
}

// ============================================================
// BLOG PAGE
// ============================================================
if (PAGE === 'blog') {
  async function initBlog() {
    const grid = document.getElementById('blogGrid');
    if (!grid) return;

    grid.innerHTML = Array(4).fill(`
      <div class="blog-card">
        <div class="blog-thumb skeleton" style="aspect-ratio:16/9"></div>
        <div class="blog-body">
          <div class="skeleton" style="height:12px;width:40%;border-radius:6px;margin-bottom:12px"></div>
          <div class="skeleton" style="height:18px;width:85%;border-radius:6px;margin-bottom:8px"></div>
          <div class="skeleton" style="height:13px;width:70%;border-radius:6px"></div>
        </div>
      </div>`).join('');

    const blogs = await fetchBlogs();
    grid.innerHTML = blogs.map(b => {
      // Firebase posts have content, fallback posts have a static .html slug
      const href = b.isDynamic
        ? `blog-post.html?id=${esc(b.id)}`
        : (b.slug || '#');
      const img = normalizeImageUrl(b.image) || 'https://images.unsplash.com/photo-1487014679447?w=700&q=80';
      return `
        <article class="blog-card">
          <a href="${esc(href)}" class="blog-thumb">
            <img src="${esc(img)}" alt="${esc(b.title)}" loading="lazy"
              onerror="this.src='https://images.unsplash.com/photo-1487014679447?w=700&q=80'">
          </a>
          <div class="blog-body">
            <span class="blog-cat">${esc(b.category||'Blog')}</span>
            <h2><a href="${esc(href)}">${esc(b.title)}</a></h2>
            <p>${esc(truncate(b.excerpt||b.body||'',140))}</p>
            <div class="blog-meta">
              <div class="blog-author-ava">A</div>
              <span>Abrar Ali</span>
              <span>·</span><span>${esc(b.date||'')}</span>
              ${b.readtime?`<span>·</span><span>${esc(b.readtime)}</span>`:''}
            </div>
            <a href="${esc(href)}" class="blog-read">Read Article →</a>
          </div>
        </article>`;
    }).join('');
  }
  initBlog();
}
