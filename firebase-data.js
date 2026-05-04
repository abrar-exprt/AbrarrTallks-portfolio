// ============================================================
// FIREBASE DATA LAYER — Abrarr Tallks Portfolio
// Self-contained: reads config from window.SITE_CONFIG,
// initialises Firebase itself, exports fetchers + CRUD helpers.
// Falls back to static data on ANY error or missing config.
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

// ── RE-EXPORT Firestore helpers so admin/pages can import them ──────
export {
  collection, getDocs, getDoc, doc,
  addDoc, updateDoc, deleteDoc, setDoc, serverTimestamp,
  signInWithEmailAndPassword, onAuthStateChanged, signOut
};

// ── INIT ────────────────────────────────────────────────────────────
// Read config from window.SITE_CONFIG (set by firebase-config.js
// loaded as a plain <script> before this module).
// Wait for DOMContentLoaded just in case config script is deferred.

let _db   = null;
let _auth = null;

function _tryInit () {
  try {
    const cfg = window.SITE_CONFIG?.firebase;
    if (!cfg || !cfg.apiKey || cfg.apiKey === "YOUR_API_KEY") return;
    const app = getApps().length ? getApps()[0] : initializeApp(cfg);
    _db   = getFirestore(app);
    _auth = getAuth(app);
  } catch (err) {
    console.warn("[firebase-data] Init failed:", err.message);
  }
}

// Run immediately (firebase-config.js is a sync script loaded before this module)
_tryInit();

export function getDb()   { return _db;   }
export function getAuth_() { return _auth; }

// Convenience named exports used by portfolio/index pages
export { _db as db, _auth as auth };

// ── FALLBACK DATA ───────────────────────────────────────────────────
export const FALLBACK_PROJECTS = [
  { id:"f1",  title:"Aadi Tour & Travel",
    category:"travel",   status:"live",
    description:"Full-featured Kashmir tour & travel agency website with package listings, gallery, customer reviews and WhatsApp booking integration. SEO-optimised for Kashmir tourism keywords.",
    tags:["HTML/CSS/JS","SEO","Travel","WhatsApp Booking"],
    image:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    url:"https://aaditourandtravel.com/", order:1 },
  { id:"f2",  title:"Kashmir Sin Than Top T&T",
    category:"travel",   status:"live",
    description:"Professional Kashmir travel agency website featuring adventure tours, trek packages, snow destinations and complete itinerary showcasing for Sin Than Top region.",
    tags:["HTML/CSS/JS","SEO","Adventure Tours","Kashmir"],
    image:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    url:"https://kashmirsinthantoptourandtravels.com/", order:2 },
  { id:"f3",  title:"Kashmir Hosts",
    category:"hotel",    status:"live",
    description:"Premium Kashmir hospitality platform showcasing local stays, unique experiences and booking enquiries.",
    tags:["HTML/CSS/JS","Hospitality","Local SEO","Booking"],
    image:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    url:"https://kashmirhosts.com/", order:3 },
  { id:"f4",  title:"Sunseeker Travels",
    category:"travel",   status:"live",
    description:"Modern travel agency website with stunning destination showcasing, customised tour packages and integrated enquiry forms.",
    tags:["HTML/CSS/JS","Travel","SEO","Responsive"],
    image:"https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
    url:"https://sunseekerstravels.com/", order:4 },
  { id:"f5",  title:"TripTunes5",
    category:"travel",   status:"live",
    description:"Dynamic travel website designed for curated trip experiences, featuring destination guides, travel packages and a modern booking flow.",
    tags:["HTML/CSS/JS","Travel","Animations","Mobile-First"],
    image:"https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
    url:"https://triptunes5.com/", order:5 },
  { id:"f6",  title:"Heavenly Horizon Tours",
    category:"travel",   status:"live",
    description:"Elegant tour & travel agency website with a focus on premium Kashmir experiences, helicopter tours and luxury travel packages.",
    tags:["HTML/CSS/JS","Admin Panel","Premium Travel","SEO"],
    image:"https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
    url:"https://heavenlyhorizontours.com/", order:6 },
  { id:"f7",  title:"King Sports KS",
    category:"sports",   status:"live",
    description:"Professional sports brand website for a Kashmir sports business. Features product showcasing, sports gear listings and an energetic mobile-first design.",
    tags:["HTML/CSS/JS","Sports Brand","E-Commerce Ready","Kashmir"],
    image:"https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
    url:"https://kingsportsks.com/", order:7 },
  { id:"f8",  title:"Olympia Sathena",
    category:"sports",   status:"live",
    description:"Sports and fitness brand website with a powerful design language. Showcases products, team achievements and training programs.",
    tags:["HTML/CSS/JS","Sports","Fitness","Brand"],
    image:"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    url:"https://olympiasathena.com/", order:8 },
  { id:"f9",  title:"Vellfire Holidays",
    category:"travel",   status:"live",
    description:"Complete holiday package website for domestic and international tours with package cards, testimonials and WhatsApp enquiry.",
    tags:["HTML/CSS/JS","Holidays","Packages","SEO"],
    image:"https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
    url:"https://vellfireholidays.com/", order:9 },
  { id:"f10", title:"Lake House Palace",
    category:"hotel",    status:"live",
    description:"Luxury hotel and palace website for a premium Kashmir property with room gallery, amenities showcase and booking enquiry.",
    tags:["HTML/CSS/JS","Hotel","Luxury","Dal Lake"],
    image:"https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
    url:"https://lakehousepalace.in/", order:10 },
  { id:"f11", title:"Kashmir Glide",
    category:"travel",   status:"live",
    description:"Shikara ride and water activity tourism website for Dal Lake, Kashmir with package listings and direct WhatsApp booking.",
    tags:["HTML/CSS/JS","Shikara","Dal Lake","Tourism"],
    image:"https://images.unsplash.com/photo-1588417699763-a83b1bdd62fd?w=800&q=80",
    url:"https://kashmirglide.com/", order:11 },
  { id:"f12", title:"Kashmir Hotel Booking App",
    category:"hotel",    status:"live",
    description:"Custom hotel booking platform for a Kashmir houseboat client, optimised for local search and mobile users.",
    tags:["HTML/CSS/JS","Booking","Houseboat","Local SEO"],
    image:"https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
    url:"https://hotel-booking-website-kzub.vercel.app", order:12 },
  { id:"f13", title:"Kashmir Dry Fruit Store",
    category:"ecommerce",status:"live",
    description:"Online store for local Kashmir dry fruits and handicrafts with SEO-friendly product pages and WhatsApp checkout.",
    tags:["HTML/CSS/JS","E-Commerce","Kashmir Products","SEO"],
    image:"https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    url:"https://dryfruit-store0101.netlify.app/", order:13 },
  { id:"f14", title:"Zabuka Technologies",
    category:"business", status:"live",
    description:"Corporate tech company website with clean professional multi-page design, services showcase and team profile sections.",
    tags:["HTML/CSS/JS","Corporate","Tech","Multi-Page"],
    image:"https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    url:"https://zabukatechnologies.in/", order:14 },
  { id:"f15", title:"rebrar.in — Web Agency",
    category:"agency",   status:"live",
    description:"My flagship web design & development company. Custom website solutions for businesses, startups and brands across India.",
    tags:["Web Agency","Custom Dev","Branding","SEO"],
    image:"https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&q=80",
    url:"https://rebrar.in", order:15 },
  { id:"f16", title:"MBP — My Business Promotion",
    category:"agency",   status:"live",
    description:"My SEO & digital marketing company focused on ranking businesses on Google — local SEO, geo-targeting, schema markup and full content strategy.",
    tags:["SEO","Local SEO","Marketing","Schema"],
    image:"https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    url:"https://makemetop.in", order:16 }
];

export const FALLBACK_HERO_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80",
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80",
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80"
];

export const FALLBACK_UPDATES = [
  { id:"u1", title:"New Travel Project Launched",
    body:"Kashmir Glide shikara website is live with WhatsApp booking.", date:"2025-09-12" },
  { id:"u2", title:"SEO Wins for Local Clients",
    body:"Multiple J&K travel sites now ranking on page 1 of Google.", date:"2025-08-28" }
];

export const FALLBACK_STATS = { years:4, projects:20, companies:2, satisfaction:100 };

// ── HELPERS ─────────────────────────────────────────────────────────
export function normalizeImageUrl(url) {
  if (!url) return "";
  const m = url.match(/drive\.google\.com\/file\/d\/([^\/\?]+)/);
  if (m) return `https://drive.google.com/uc?export=view&id=${m[1]}`;
  return url;
}

// Sort projects by order field client-side (avoids needing a Firestore composite index)
function sortByOrder(arr) {
  return [...arr].sort((a, b) => (Number(a.order) || 999) - (Number(b.order) || 999));
}

// ── FETCH PROJECTS ───────────────────────────────────────────────────
export async function fetchProjects() {
  if (!_db) return FALLBACK_PROJECTS;
  try {
    // Use plain getDocs without orderBy — sort client-side to avoid index requirement
    const snap = await getDocs(collection(_db, "projects"));
    if (snap.empty) return FALLBACK_PROJECTS;
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return sortByOrder(docs);
  } catch (err) {
    console.warn("[fetchProjects] error, using fallback:", err.message);
    return FALLBACK_PROJECTS;
  }
}

// ── FETCH HERO IMAGES ────────────────────────────────────────────────
export async function fetchHeroImages() {
  if (!_db) return FALLBACK_HERO_IMAGES;
  try {
    const snap = await getDoc(doc(_db, "site", "hero"));
    if (snap.exists() && Array.isArray(snap.data().images) && snap.data().images.length) {
      return snap.data().images;
    }
    return FALLBACK_HERO_IMAGES;
  } catch (err) {
    console.warn("[fetchHeroImages] error:", err.message);
    return FALLBACK_HERO_IMAGES;
  }
}

// ── FETCH UPDATES ────────────────────────────────────────────────────
export async function fetchUpdates() {
  if (!_db) return FALLBACK_UPDATES;
  try {
    const snap = await getDocs(collection(_db, "updates"));
    if (snap.empty) return FALLBACK_UPDATES;
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // Sort by date descending client-side
    return docs.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  } catch (err) {
    console.warn("[fetchUpdates] error:", err.message);
    return FALLBACK_UPDATES;
  }
}

// ── FETCH STATS ──────────────────────────────────────────────────────
export async function fetchStats() {
  if (!_db) return FALLBACK_STATS;
  try {
    const snap = await getDoc(doc(_db, "site", "stats"));
    if (snap.exists()) return { ...FALLBACK_STATS, ...snap.data() };
    return FALLBACK_STATS;
  } catch {
    return FALLBACK_STATS;
  }
}
