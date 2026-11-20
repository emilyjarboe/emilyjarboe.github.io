/* Travels: an interactive world map.
   Visited countries are bronze. Clicking one (on the map or in the list below it)
   zooms the map in and opens a panel with photos from that trip. */
(function () {
  'use strict';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  window.TravelMap = { init: init };

  function init(root, data, opts) {
    opts = opts || {};
    var g = window.gsap;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var countries = data.countries;
    var FULL = { x: 0, y: 0, w: 1000, h: 500 };
    var view = { x: FULL.x, y: FULL.y, w: FULL.w, h: FULL.h };
    var active = -1, photoIdx = 0;

    root.innerHTML =
      '<div class="travel__stage">' +
        '<div class="travel__map" aria-label="World map of countries visited"><p class="mono soft travel__loading">Loading map…</p></div>' +
        '<div class="travel__tip mono" aria-hidden="true"></div>' +
        '<aside class="travel__panel" aria-live="polite" hidden></aside>' +
      '</div>' +
      '<div class="travel__list" role="list">' + countries.map(function (c, i) {
        return '<button type="button" class="travel__chip mono" role="listitem" data-i="' + i + '" aria-pressed="false">' + esc(c.name) + '</button>';
      }).join('') + '</div>';

    var mapBox = root.querySelector('.travel__map'), tip = root.querySelector('.travel__tip'), panel = root.querySelector('.travel__panel');
    var chips = root.querySelectorAll('.travel__chip');
    var svg = null, meta = {};

    Promise.all([
      fetch(opts.svg || 'data/world.svg').then(function (r) { return r.text(); }),
      fetch(opts.meta || 'data/world-meta.json').then(function (r) { return r.json(); })
    ]).then(function (res) {
      mapBox.innerHTML = res[0];
      meta = res[1];
      svg = mapBox.querySelector('svg');
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', 'World map. Visited: ' + countries.map(function (c) { return c.name; }).join(', '));
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      var dots = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      dots.setAttribute('class', 'travel__dots');
      countries.forEach(function (c, i) {
        var key = c.map || c.name;
        svg.querySelectorAll('path[data-name="' + key + '"]:not([data-far])').forEach(function (p) {
          p.classList.add('is-visited'); p.dataset.i = i;
        });
        var m = meta[key];
        if (!m) { console.warn('Travels: no map shape named "' + key + '"'); return; }
        var bw = m.b[2] - m.b[0], bh = m.b[3] - m.b[1];
        if (bw < 16 && bh < 16) {   // small country: add a dot so it's easy to see and click
          var dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          dot.setAttribute('cx', m.c[0]); dot.setAttribute('cy', m.c[1]); dot.setAttribute('r', 2.6);
          dot.setAttribute('class', 'travel__dot'); dot.dataset.i = i;
          dots.appendChild(dot);
        }
      });
      svg.appendChild(dots);

      svg.addEventListener('click', function (e) {
        var t = e.target.closest('[data-i]');
        if (t) open(+t.dataset.i); else if (active > -1) close();
      });
      svg.addEventListener('mousemove', function (e) {
        var t = e.target.closest('[data-i]');
        if (!t || active > -1) { tip.classList.remove('is-on'); return; }
        var r = root.querySelector('.travel__stage').getBoundingClientRect();
        tip.textContent = countries[+t.dataset.i].name;
        tip.style.left = (e.clientX - r.left) + 'px'; tip.style.top = (e.clientY - r.top) + 'px';
        tip.classList.add('is-on');
      });
      svg.addEventListener('mouseleave', function () { tip.classList.remove('is-on'); });
    }).catch(function () {
      mapBox.innerHTML = '<p class="mono soft travel__loading">The map could not load. Use the country list below.</p>';
    });

    chips.forEach(function (b) { b.addEventListener('click', function () { var i = +b.dataset.i; if (i === active) close(); else open(i); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && active > -1) close(); });

    function setView(v) { if (svg) svg.setAttribute('viewBox', [v.x, v.y, v.w, v.h].map(function (n) { return Math.round(n * 10) / 10; }).join(' ')); }
    function zoomTo(target) {
      if (!svg) return;
      if (!g || reduce) { view = target; setView(view); return; }
      g.to(view, { x: target.x, y: target.y, w: target.w, h: target.h, duration: 1.1, ease: 'power3.inOut', onUpdate: function () { setView(view); } });
    }
    function boxFor(c) {
      var m = meta[c.map || c.name]; if (!m) return FULL;
      var cx = (m.b[0] + m.b[2]) / 2, cy = (m.b[1] + m.b[3]) / 2;
      var w = Math.max((m.b[2] - m.b[0]) * 2.4, (m.b[3] - m.b[1]) * 2.4 * 2, 60);
      var h = w / 2;
      return { x: cx - w / 2, y: cy - h / 2, w: w, h: h };
    }

    function open(i) {
      var c = countries[i]; if (!c) return;
      active = i; photoIdx = 0;
      tip.classList.remove('is-on');
      root.classList.add('is-open');
      if (svg) {
        svg.classList.add('is-zoomed');
        svg.querySelectorAll('.is-active').forEach(function (el) { el.classList.remove('is-active'); });
        svg.querySelectorAll('[data-i="' + i + '"]').forEach(function (el) { el.classList.add('is-active'); });
      }
      chips.forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.i === i)); });
      renderPanel();
      zoomTo(boxFor(c));
      if (opts.onOpen) opts.onOpen(c);
    }
    function close() {
      active = -1;
      root.classList.remove('is-open');
      if (svg) { svg.classList.remove('is-zoomed'); svg.querySelectorAll('.is-active').forEach(function (el) { el.classList.remove('is-active'); }); }
      chips.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      if (g && !reduce) g.to(panel, { opacity: 0, x: 24, duration: 0.3, onComplete: function () { panel.hidden = true; } });
      else panel.hidden = true;
      zoomTo(FULL);
    }

    function renderPanel() {
      var c = countries[active], n = countries.length;
      var photos = c.photos || [];
      var stack = c.noPhotos ? (c.when || c.note ? '' : '<p class="mono soft">Stamp collected</p>') : photos.length
        ? '<div class="travel__stack">' + photos.map(function (p, k) {
            return '<figure class="travel__photo" data-k="' + k + '"><img src="' + esc(p.src) + '" alt="' + esc(p.alt) + '" style="object-position:' + esc(p.focus || '50% 50%') + '" loading="lazy"></figure>';
          }).join('') + '</div>' +
          (photos.length > 1 ? '<div class="travel__photonav"><button type="button" class="mv-toggle" data-photo="-1" aria-label="Previous photo">←</button><span class="mono soft"><span class="travel__count">1</span> / ' + photos.length + '</span><button type="button" class="mv-toggle" data-photo="1" aria-label="Next photo">→</button></div>' : '')
        : '<div class="travel__empty mono soft">Photos coming soon</div>';
      panel.innerHTML =
        '<div class="travel__panelhead">' +
          '<button type="button" class="travel__back mono" data-act="close">← All countries</button>' +
          '<span class="mono soft">' + String(active + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0') + '</span>' +
        '</div>' +
        '<h3 class="travel__name"><em>' + esc(c.name) + '</em></h3>' +
        (c.when ? '<p class="mono soft">' + esc(c.when) + '</p>' : '') +
        (c.note ? '<p class="travel__note">' + esc(c.note) + '</p>' : '') +
        stack +
        '<div class="travel__nav">' +
          '<button type="button" class="travel__back mono" data-act="prev">← ' + esc(countries[(active - 1 + n) % n].name) + '</button>' +
          '<button type="button" class="travel__back mono" data-act="next">' + esc(countries[(active + 1) % n].name) + ' →</button>' +
        '</div>';
      panel.hidden = false;
      panel.querySelectorAll('[data-act]').forEach(function (b) {
        b.addEventListener('click', function () {
          var a = b.dataset.act;
          if (a === 'close') close();
          if (a === 'prev') open((active - 1 + n) % n);
          if (a === 'next') open((active + 1) % n);
        });
      });
      panel.querySelectorAll('[data-photo]').forEach(function (b) {
        b.addEventListener('click', function () { showPhoto(photoIdx + (+b.dataset.photo)); });
      });
      layoutStack(false);
      if (g && !reduce) g.fromTo(panel, { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out', delay: 0.15 });
    }

    // Layered photo stack: the current photo on top, the next ones peeking out behind, more see-through
    function layoutStack(animate) {
      var figs = panel.querySelectorAll('.travel__photo'), n = figs.length;
      figs.forEach(function (f, k) {
        var depth = (k - photoIdx + n) % n;
        var vars = { x: depth * 18, y: depth * -14, rotation: depth ? (depth % 2 ? 2.5 : -2) : 0, opacity: [1, 0.55, 0.3][depth] || 0, zIndex: n - depth, scale: 1 - depth * 0.04 };
        if (g && animate && !reduce) g.to(f, Object.assign({ duration: 0.55, ease: 'power3.out' }, vars));
        else if (g) g.set(f, vars);
        else { f.style.zIndex = n - depth; f.style.opacity = vars.opacity; }
      });
      var cnt = panel.querySelector('.travel__count'); if (cnt) cnt.textContent = photoIdx + 1;
    }
    function showPhoto(k) {
      var n = (countries[active].photos || []).length; if (!n) return;
      photoIdx = (k + n) % n; layoutStack(true);
    }
  }
})();
