// ============================================================
// shared.js — Abrarr Tallks Portfolio
// Firebase init + all data fetchers + DOM utilities
// Loaded as <script type="module"> on every page
// ============================================================

import { initializeApp, getApps }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, getDoc, doc,
  addDoc, updateDoc, deleteDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── RE-EXPORT Firestore + Auth for admin/pages ───────────────────────
export {
  getFirestore, collection, getDocs, getDoc, doc,
  addDoc, updateDoc, deleteDoc, setDoc, serverTimestamp,
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
};

// ── FIREBASE CONFIG (embedded directly — no race condition with window scripts) ──
const _FIREBASE_CONFIG = {
  apiKey:            "AIzaSyCe-nA6VroEVYsrFjRTAb9z-Gl7xFM7cTo",
  authDomain:        "abrarrtallks-portfolio.firebaseapp.com",
  projectId:         "abrarrtallks-portfolio",
  storageBucket:     "abrarrtallks-portfolio.firebasestorage.app",
  messagingSenderId: "608768794442",
  appId:             "1:608768794442:web:4990ae2ded872a203b6bb3"
};

// ── FIREBASE INIT ────────────────────────────────────────────────────
let _db = null, _auth = null;

try {
  const app = getApps().length ? getApps()[0] : initializeApp(_FIREBASE_CONFIG);
  _db   = getFirestore(app);
  _auth = getAuth(app);
} catch (e) {
  console.warn("[shared.js] Firebase init failed:", e.message);
}

export const db   = _db;
export const auth = _auth;
export const isFirebaseReady = !!_db;

// ── STRING UTILS ─────────────────────────────────────────────────────
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g,
    c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

export function truncate(s, n) {
  const str = String(s ?? '');
  return str.length > n ? str.slice(0, n) + '…' : str;
}

export function normalizeImageUrl(url) {
  if (!url) return '';
  const m = url.match(/drive\.google\.com\/file\/d\/([^\/\?]+)/);
  if (m) return `https://drive.google.com/uc?export=view&id=${m[1]}`;
  return url;
}

// ── TOAST ────────────────────────────────────────────────────────────
let _toastTimer;
export function toast(msg, type = '') {
  let el = document.getElementById('_toast');
  if (!el) {
    el = document.createElement('div');
    el.id = '_toast';
    el.style.cssText = `position:fixed;top:80px;right:20px;padding:12px 18px;border-radius:10px;
      font-family:inherit;font-size:14px;font-weight:500;color:#fff;z-index:99999;
      opacity:0;transform:translateY(-10px);transition:opacity .2s,transform .2s;pointer-events:none;
      max-width:320px;box-shadow:0 8px 24px rgba(0,0,0,.18);`;
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.background = type === 'error' ? '#dc2626' : type === 'ok' ? '#16a34a' : '#0f172a';
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-10px)';
  }, 3200);
}

// ── MOBILE NAV ────────────────────────────────────────────────────────
export function initNav() {
  const btn   = document.getElementById('menuBtn');
  const links = document.getElementById('navLinks');
  const nav   = document.querySelector('.navbar');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    btn.textContent = open ? '✕' : '☰';
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    btn.textContent = '☰';
  }));
  if (nav) window.addEventListener('scroll', () =>
    nav.classList.toggle('scrolled', window.scrollY > 8), { passive: true });
}

// ── SORT HELPERS ─────────────────────────────────────────────────────
function sortByOrder(arr) {
  return [...arr].sort((a,b) => (Number(a.order)||999) - (Number(b.order)||999));
}
function sortByDate(arr) {
  return [...arr].sort((a,b) => (b.date||'').localeCompare(a.date||''));
}

// ── FALLBACK DATA ─────────────────────────────────────────────────────
export const FALLBACK_PROJECTS = [
  { id:"f1",  title:"Aadi Tour & Travel",     category:"travel",   status:"live", order:1,
    description:"Full-featured Kashmir tour & travel agency website with package listings, gallery, customer reviews and WhatsApp booking integration.",
    tags:["HTML/CSS/JS","SEO","Travel","WhatsApp Booking"],
    image:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    url:"https://aaditourandtravel.com/" },
  { id:"f2",  title:"Kashmir Sin Than Top T&T", category:"travel", status:"live", order:2,
    description:"Professional Kashmir travel agency website featuring adventure tours, trek packages and snow destinations.",
    tags:["HTML/CSS/JS","SEO","Adventure Tours","Kashmir"],
    image:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    url:"https://kashmirsinthantoptourandtravels.com/" },
  { id:"f3",  title:"Kashmir Hosts",           category:"hotel",   status:"live", order:3,
    description:"Premium Kashmir hospitality platform showcasing local stays, unique experiences and booking enquiries.",
    tags:["HTML/CSS/JS","Hospitality","Local SEO","Booking"],
    image:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    url:"https://kashmirhosts.com/" },
  { id:"f4",  title:"Sunseeker Travels",        category:"travel",  status:"live", order:4,
    description:"Modern travel agency website with destination showcasing, customised tour packages and integrated enquiry forms.",
    tags:["HTML/CSS/JS","Travel","SEO","Responsive"],
    image:"https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
    url:"https://sunseekerstravels.com/" },
  { id:"f5",  title:"TripTunes5",               category:"travel",  status:"live", order:5,
    description:"Dynamic travel website for curated trip experiences with destination guides and a modern booking flow.",
    tags:["HTML/CSS/JS","Travel","Animations","Mobile-First"],
    image:"https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
    url:"https://triptunes5.com/" },
  { id:"f6",  title:"Heavenly Horizon Tours",   category:"travel",  status:"live", order:6,
    description:"Elegant tour & travel agency website for premium Kashmir experiences and luxury travel packages.",
    tags:["HTML/CSS/JS","Admin Panel","Premium Travel","SEO"],
    image:"https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
    url:"https://heavenlyhorizontours.com/" },
  { id:"f7",  title:"King Sports KS",           category:"sports",  status:"live", order:7,
    description:"Professional sports brand website for a Kashmir sports business with product showcasing and mobile-first design.",
    tags:["HTML/CSS/JS","Sports Brand","E-Commerce Ready","Kashmir"],
    image:"https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
    url:"https://kingsportsks.com/" },
  { id:"f8",  title:"Olympia Sathena",          category:"sports",  status:"live", order:8,
    description:"Sports and fitness brand website showcasing products, team achievements and training programs.",
    tags:["HTML/CSS/JS","Sports","Fitness","Brand"],
    image:"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    url:"https://olympiasathena.com/" },
  { id:"f9",  title:"Vellfire Holidays",        category:"travel",  status:"live", order:9,
    description:"Complete holiday package website with package cards, testimonials, WhatsApp enquiry and a destination gallery.",
    tags:["HTML/CSS/JS","Holidays","Packages","SEO"],
    image:"https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
    url:"https://vellfireholidays.com/" },
  { id:"f10", title:"Lake House Palace",        category:"hotel",   status:"live", order:10,
    description:"Luxury hotel and palace website with room gallery, amenities showcase and booking enquiry integration.",
    tags:["HTML/CSS/JS","Hotel","Luxury","Dal Lake"],
    image:"https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
    url:"https://lakehousepalace.in/" },
  { id:"f11", title:"Kashmir Glide",            category:"travel",  status:"live", order:11,
    description:"Shikara ride and water activity tourism website for Dal Lake, Kashmir with WhatsApp booking.",
    tags:["HTML/CSS/JS","Shikara","Dal Lake","Tourism"],
    image:"https://images.unsplash.com/photo-1588417699763-a83b1bdd62fd?w=800&q=80",
    url:"https://kashmirglide.com/" },
  { id:"f12", title:"Kashmir Hotel Booking",   category:"hotel",   status:"live", order:12,
    description:"Custom hotel booking platform for a Kashmir houseboat client, optimised for local search and mobile.",
    tags:["HTML/CSS/JS","Booking","Houseboat","Local SEO"],
    image:"https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
    url:"https://hotel-booking-website-kzub.vercel.app" },
  { id:"f13", title:"Kashmir Dry Fruit Store", category:"ecommerce",status:"live", order:13,
    description:"Online store for Kashmir dry fruits and handicrafts with SEO product pages and WhatsApp checkout.",
    tags:["HTML/CSS/JS","E-Commerce","Kashmir Products","SEO"],
    image:"https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    url:"https://dryfruit-store0101.netlify.app/" },
  { id:"f14", title:"Zabuka Technologies",     category:"business", status:"live", order:14,
    description:"Corporate tech company website with professional multi-page design, services showcase and team profiles.",
    tags:["HTML/CSS/JS","Corporate","Tech","Multi-Page"],
    image:"https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    url:"https://zabukatechnologies.in/" },
  { id:"f15", title:"rebrar.in — Web Agency",  category:"agency",  status:"live", order:15,
    description:"My flagship web design & development company. Custom websites for businesses, startups and brands across India.",
    tags:["Web Agency","Custom Dev","Branding","SEO"],
    image:"https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&q=80",
    url:"https://rebrar.in" },
  { id:"f16", title:"MBP — My Business Promotion", category:"agency", status:"live", order:16,
    description:"My SEO & digital marketing company — local SEO, geo-targeting, schema markup and content strategy.",
    tags:["SEO","Local SEO","Marketing","Schema"],
    image:"https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    url:"https://makemetop.in" }
];

export const FALLBACK_HERO_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80",
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80"
];

export const FALLBACK_UPDATES = [
  { id:"u1", title:"Kashmir Glide is Live 🎉", body:"Shikara ride website now live with WhatsApp booking and Dal Lake packages.", date:"2025-09-12" },
  { id:"u2", title:"SEO Wins for J&K Clients", body:"Multiple travel sites now ranking page 1 of Google for Kashmir tourism keywords.", date:"2025-08-28" }
];

export const FALLBACK_STATS = { years:4, projects:20, companies:2, satisfaction:100 };

export const FALLBACK_BLOGS = [
  { id:"b1", title:"How to Rank on Google in Srinagar, Kashmir (2025)", category:"Local SEO",
    date:"2025-09-01", readtime:"8 min", slug:"blog-local-seo-kashmir.html",
    excerpt:"Step-by-step guide to ranking your local business on Google in Srinagar, J&K — GMB, schema, geo-tags and keyword strategy.",
    image:"https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&q=80" },
  { id:"b2", title:"What Every Kashmir Travel Website Must Have", category:"Web Design",
    date:"2025-08-01", readtime:"7 min", slug:"blog-travel-website-kashmir.html",
    excerpt:"Features every tour operator and travel agency website in J&K needs to convert visitors into bookings.",
    image:"https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=700&q=80" },
  { id:"b3", title:"How Much Does a Website Cost in India in 2025?", category:"Pricing",
    date:"2025-07-01", readtime:"6 min", slug:"blog-website-cost-india.html",
    excerpt:"Transparent breakdown of web design costs in India — landing pages to full e-commerce. Real prices.",
    image:"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&q=80" },
  { id:"b4", title:"7 SEO Mistakes Small Businesses in India Are Making", category:"SEO",
    date:"2025-06-01", readtime:"9 min", slug:"blog-seo-mistakes-india.html",
    excerpt:"Common SEO errors costing Indian businesses Google rankings — and how to fix every one of them.",
    image:"https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=700&q=80" }
];

// ── DATA FETCHERS ─────────────────────────────────────────────────────
export async function fetchProjects() {
  if (!_db) return FALLBACK_PROJECTS;
  try {
    const snap = await getDocs(collection(_db, "projects"));
    if (snap.empty) return FALLBACK_PROJECTS;
    return sortByOrder(snap.docs.map(d => ({ id:d.id, ...d.data() })));
  } catch(e) {
    console.warn("[fetchProjects]", e.message);
    return FALLBACK_PROJECTS;
  }
}

export async function fetchHeroImages() {
  if (!_db) return FALLBACK_HERO_IMAGES;
  try {
    const snap = await getDoc(doc(_db, "site", "hero"));
    return (snap.exists() && snap.data().images?.length)
      ? snap.data().images : FALLBACK_HERO_IMAGES;
  } catch { return FALLBACK_HERO_IMAGES; }
}

export async function fetchUpdates() {
  if (!_db) return FALLBACK_UPDATES;
  try {
    const snap = await getDocs(collection(_db, "updates"));
    if (snap.empty) return FALLBACK_UPDATES;
    return sortByDate(snap.docs.map(d => ({ id:d.id, ...d.data() })));
  } catch(e) {
    console.warn("[fetchUpdates]", e.message);
    return FALLBACK_UPDATES;
  }
}

export async function fetchStats() {
  if (!_db) return FALLBACK_STATS;
  try {
    const snap = await getDoc(doc(_db, "site", "stats"));
    return snap.exists() ? { ...FALLBACK_STATS, ...snap.data() } : FALLBACK_STATS;
  } catch { return FALLBACK_STATS; }
}

export async function fetchBlogs() {
  if (!_db) return FALLBACK_BLOGS;
  try {
    const snap = await getDocs(collection(_db, "blogs"));
    if (snap.empty) return FALLBACK_BLOGS;
    const firebasePosts = sortByDate(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    // Merge: firebase posts first, then fallback (avoid duplicates by slug)
    const fbSlugs = new Set(firebasePosts.map(p => p.slug || p.id));
    const merged  = [...firebasePosts,
      ...FALLBACK_BLOGS.filter(b => !fbSlugs.has(b.slug))];
    return merged;
  } catch(e) {
    console.warn("[fetchBlogs]", e.message);
    return FALLBACK_BLOGS;
  }
}

// ── WHATSAPP FLOAT HTML ───────────────────────────────────────────────
export const WA_FLOAT = `
<a href="https://wa.me/917051078832" class="whatsapp-float" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
  <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
</a>`;

// ── SOCIAL SVGs ────────────────────────────────────────────────────────
export const SOCIAL_LINKS = `
<div class="social-links-bottom">
  <a href="https://www.instagram.com/_abrarrtallks_" target="_blank" rel="noopener" aria-label="Instagram" class="social-link">
    <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
  </a>
  <a href="https://www.facebook.com/share/1DxT8PXbkd/" target="_blank" rel="noopener" aria-label="Facebook" class="social-link">
    <svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  </a>
  <a href="https://youtube.com/@abrarrtallks" target="_blank" rel="noopener" aria-label="YouTube" class="social-link">
    <svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  </a>
  <a href="https://wa.me/917051078832" target="_blank" rel="noopener" aria-label="WhatsApp" class="social-link">
    <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
  </a>
</div>`;

// ── SHARED FOOTER HTML ─────────────────────────────────────────────────
export function footerHTML(activePage = '') {
  return `
<footer class="main-footer" role="contentinfo">
  <div class="footer-grid">
    <div class="footer-col">
      <h4>Abrarr Tallks</h4>
      <p>Professional <strong>web designer</strong> &amp; <strong>SEO expert</strong> based in Srinagar, Kashmir. CEO of
        <a href="https://rebrar.in" target="_blank" rel="noopener" class="external">rebrar.in</a> &amp;
        <a href="https://makemetop.in" target="_blank" rel="noopener" class="external">MBP</a>.
        Building fast, ranked websites for businesses across India and globally.</p>
    </div>
    <div class="footer-col">
      <h4>Site Map</h4>
      <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="portfolio.html">Portfolio</a></li>
        <li><a href="services.html">Services</a></li>
        <li><a href="pricing.html">Pricing</a></li>
        <li><a href="blog.html">Blog</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Useful Links</h4>
      <ul>
        <li><a href="https://rebrar.in" target="_blank" rel="noopener" class="external">rebrar.in</a></li>
        <li><a href="https://makemetop.in" target="_blank" rel="noopener" class="external">MBP — My Business Promotion</a></li>
        <li><a href="https://aaditourandtravel.com/" target="_blank" rel="noopener" class="external">Aadi Tour &amp; Travel</a></li>
        <li><a href="https://kashmirhosts.com/" target="_blank" rel="noopener" class="external">Kashmir Hosts</a></li>
        <li><a href="https://kashmirglide.com/" target="_blank" rel="noopener" class="external">Kashmir Glide</a></li>
        <li><a href="https://lakehousepalace.in/" target="_blank" rel="noopener" class="external">Lake House Palace</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Verified Profiles</h4>
      <ul>
        <li><a href="https://www.instagram.com/_abrarrtallks_" target="_blank" rel="noopener" class="external">Instagram</a></li>
        <li><a href="https://youtube.com/@abrarrtallks" target="_blank" rel="noopener" class="external">YouTube</a></li>
        <li><a href="https://www.facebook.com/share/1DxT8PXbkd/" target="_blank" rel="noopener" class="external">Facebook</a></li>
        <li><a href="https://t.me/abrarrtallks" target="_blank" rel="noopener" class="external">Telegram</a></li>
        <li><a href="https://wa.me/917051078832" target="_blank" rel="noopener" class="external">WhatsApp</a></li>
        <li><a href="privacy.html">Privacy Policy</a></li>
        <li><a href="refund.html">Refund Policy</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Contact</h4>
      <ul>
        <li>📍 Srinagar, J&amp;K — 191101, India</li>
        <li>📞 <a href="tel:+917051078832">+91 7051078832</a></li>
        <li>📧 <a href="mailto:abrar@abrartallks-portfolio.co.in">abrar@abrartallks-portfolio.co.in</a></li>
      </ul>
    </div>
  </div>
  ${SOCIAL_LINKS}
  <div class="footer-bottom">
    <p>© 2025 Abrarr Tallks — Abrar Ali. All Rights Reserved.</p>
    <p>Best <strong>web designer in Kashmir</strong> · CEO: <a href="https://rebrar.in" target="_blank" rel="noopener">rebrar.in</a> &amp; MBP · 📍 Srinagar, J&amp;K – 191101, India</p>
  </div>
</footer>`;
}

// ── SHARED NAVBAR HTML ─────────────────────────────────────────────────
export function navHTML(active = 'home') {
  const links = [
    ['index.html',     'home',      'Home'],
    ['services.html',  'services',  'Services'],
    ['portfolio.html', 'portfolio', 'Portfolio'],
    ['pricing.html',   'pricing',   'Pricing'],
    ['blog.html',      'blog',      'Blog'],
    ['about.html',     'about',     'About'],
    ['contact.html',   'contact',   'Contact'],
  ];
  return `
<nav class="navbar" role="navigation" aria-label="Main Navigation">
  <div class="nav-container">
    <a href="index.html" class="brand-logo" aria-label="Abrarr Tallks Home">
      <span class="brand-main">Abrarr <span>Tallks</span></span>
      <span class="brand-sub">Web Design · Srinagar, J&amp;K</span>
    </a>
    <div class="nav-links" id="navLinks">
      ${links.map(([href,key,label]) =>
        `<a href="${href}"${active===key?' class="active"':''}>${label}</a>`
      ).join('\n      ')}
      <a href="https://wa.me/917051078832?text=Hi%20Abrar%2C%20I%20want%20to%20build%20a%20website." target="_blank" rel="noopener" class="nav-cta">Get Quote</a>
    </div>
    <button class="menu-btn" id="menuBtn" aria-label="Toggle Menu" aria-expanded="false">☰</button>
  </div>
</nav>`;
}
