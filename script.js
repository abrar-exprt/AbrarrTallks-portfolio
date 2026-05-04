// ===== MOBILE NAV =====
const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');

if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('show');
    menuBtn.textContent = navLinks.classList.contains('show') ? '✕' : '☰';
  });

  // Close menu on link click
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('show');
      menuBtn.textContent = '☰';
    });
  });
}

// ===== PRICING CALCULATOR =====
const priceMap = {
  basic: { label: "Basic Website (3-5 Pages)", price: 2499 },
  business: { label: "Business Website (5-8 Pages)", price: 4999 },
  ecommerce: { label: "E-Commerce Store", price: 8999 },
  portfolio: { label: "Portfolio / Personal Website", price: 1999 },
  blog: { label: "Blog / News Website", price: 3499 },
  course: { label: "Online Course Website", price: 6999 },
  booking: { label: "Hotel / Travel Booking Site", price: 7499 },
  landing: { label: "Landing Page / Sales Page", price: 1499 },
};

const priceSelect = document.getElementById('priceSelect');
const priceDisplay = document.getElementById('priceDisplay');
const bookNowBtn = document.getElementById('bookNowBtn');

if (priceSelect) {
  priceSelect.addEventListener('change', () => {
    const key = priceSelect.value;
    if (key && priceMap[key]) {
      const item = priceMap[key];
      priceDisplay.innerHTML = `Starting at <span>₹${item.price.toLocaleString('en-IN')}</span>`;
      if (bookNowBtn) {
        bookNowBtn.href = `https://wa.me/917051078832?text=Hi%20Abrar%2C%20I%20want%20to%20book%20a%20${encodeURIComponent(item.label)}`;
      }
    } else {
      priceDisplay.innerHTML = 'Select a package above';
    }
  });
}

// ===== WHATSAPP POPUP =====
const popup = document.getElementById("waPopup");
const closeBtn = document.getElementById("waClose");

const FIRST_VISIT_KEY = "wa_first_shown";
const LAST_SHOWN_TIME = "wa_last_time";

function showPopup() {
  if (popup) {
    popup.style.display = "flex";
    sessionStorage.setItem(FIRST_VISIT_KEY, "true");
    sessionStorage.setItem(LAST_SHOWN_TIME, Date.now());
  }
}

if (popup && !sessionStorage.getItem(FIRST_VISIT_KEY)) {
  setTimeout(showPopup, 5000);
}

function canShowAgain() {
  const lastTime = sessionStorage.getItem(LAST_SHOWN_TIME);
  if (!lastTime) return true;
  return (Date.now() - lastTime) > 30000;
}

if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    popup.style.display = "none";
    setTimeout(() => { if (canShowAgain()) showPopup(); }, 30000);
  });
}

if (popup) {
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      popup.style.display = "none";
    }
  });
}

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll(
  '.service-card, .template-card, .why-box, .how-card, .project-card, .skill-item'
).forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// ===== SKILL BARS ANIMATION =====
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-fill').forEach(bar => {
        const width = bar.getAttribute('data-width');
        setTimeout(() => { bar.style.width = width; }, 200);
      });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const skillsSection = document.querySelector('.skills-section');
if (skillsSection) {
  // Initialize widths to 0
  skillsSection.querySelectorAll('.skill-fill').forEach(bar => {
    bar.style.width = '0%';
  });
  skillObserver.observe(skillsSection);
}

// ===== ACTIVE NAV LINK =====
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 100) {
      current = section.getAttribute('id');
    }
  });
  navAnchors.forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === `#${current}`) {
      a.classList.add('active');
    }
  });
}, { passive: true });

// ===== COUNTER ANIMATION =====
function animateCounter(el, target, duration = 1500) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current) + (el.dataset.suffix || '');
  }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('[data-count]').forEach(el => {
        animateCounter(el, parseInt(el.dataset.count));
      });
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) counterObserver.observe(heroStats);
