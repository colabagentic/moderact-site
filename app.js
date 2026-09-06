/* Moderact — no dependencies. Coordinate readout, section reveal, dossier flip, year. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;

  // Reveal only when JS runs; without JS nothing is hidden.
  root.classList.add('js');

  // Year in the footer.
  var y = doc.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());

  // Coordinate readout (static 000 on touch and under reduced motion).
  var cx = doc.getElementById('cx'), cy = doc.getElementById('cy');
  if (cx && cy && !reduce && !coarse) {
    var pad = function (n) { n = Math.max(0, Math.min(999, Math.round(n))); return (n < 10 ? '00' : n < 100 ? '0' : '') + n; };
    var pending = false, lx = 0, ly = 0;
    doc.addEventListener('pointermove', function (e) {
      lx = e.clientX; ly = e.clientY;
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        cx.textContent = pad(lx / window.innerWidth * 999);
        cy.textContent = pad(ly / window.innerHeight * 999);
        pending = false;
      });
    }, { passive: true });
  }

  // One-time settle-in reveal per section.
  var items = doc.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    for (var i = 0; i < items.length; i++) items[i].classList.add('in');
  } else {
    var io = new IntersectionObserver(function (entries) {
      for (var j = 0; j < entries.length; j++) {
        if (entries[j].isIntersecting) { entries[j].target.classList.add('in'); io.unobserve(entries[j].target); }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    for (var k = 0; k < items.length; k++) io.observe(items[k]);
  }

  // Dossier card: click / tap / Enter / Space toggles; hover and focus are handled in CSS.
  var d = doc.querySelector('.dossier');
  if (d) {
    var toggle = function () {
      var on = d.classList.toggle('is-flipped');
      d.setAttribute('aria-pressed', on ? 'true' : 'false');
    };
    d.addEventListener('click', toggle);
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  }
})();
