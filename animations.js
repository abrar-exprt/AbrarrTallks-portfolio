/*!
 * animations.js — triggers .reveal / .reveal-group animations defined
 * in animations.css as elements scroll into view. Degrades gracefully
 * and respects prefers-reduced-motion.
 */
(function () {
  "use strict";

  function showAllImmediately() {
    document.querySelectorAll(".reveal, .reveal-group").forEach(function (el) {
      el.classList.add("in-view");
    });
  }

  if (!("IntersectionObserver" in window)) {
    showAllImmediately();
    return;
  }

  var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    showAllImmediately();
    return;
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Stagger children inside .reveal-group containers
    document.querySelectorAll(".reveal-group").forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.style.setProperty("--d", (i * 90) + "ms");
      });
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".reveal, .reveal-group").forEach(function (el) {
      observer.observe(el);
    });
  });
})();
