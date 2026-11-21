/* The illustrated bookshelf on the Lately page.
   images/shelf/bookcase.webp is the whole case; each favorite book is a
   cut-out spine (book-N.webp) laid back over its slot. Hover, focus or tap a
   spine and it slides up off the shelf while the card shows a drawn cover.
   Positions come from tools/cut_shelf.py (percent of the bookcase image). */
(function () {
  'use strict';

  var SPINES = {
    1: { l: 49.786, t: 40.289, w: 3.319, h: 10.674 },
    2: { l: 18.308, t: 68.86, w: 4.176, h: 11.958 },
    3: { l: 40.364, t: 39.727, w: 3.212, h: 11.236 },
    4: { l: 41.328, t: 25.281, w: 3.212, h: 11.156 }
  };
  var GLOBE = { l: 18.9, t: 38.3, w: 14, h: 12.7 };
  var HOUSE = { l: 61.2, t: 54.7, w: 9.6, h: 11.5 };

  var MOTIFS = {
    books: '<path d="M14 44h36M16 44V30h10v14M27 44V24h9v20M37 44l4-17 8 2-4 17"/><path d="M18 34h6M29 29h5M29 39h5"/>',
    mountains: '<path d="M8 44l14-20 8 10 8-14 18 24z"/><path d="M34 26l4 6 4-4"/><circle cx="48" cy="16" r="4"/>',
    feather: '<path d="M18 48C22 30 34 16 50 12c-2 16-14 30-30 34z"/><path d="M14 52L40 22"/><path d="M26 38l-6-2M31 32l-6-2M36 26l-5-2"/>',
    suitcase: '<rect x="12" y="22" width="40" height="26" rx="3"/><path d="M25 22v-6h14v6M12 32h40M22 22v26M42 22v26"/>'
  };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pos(p) { return 'left:' + p.l + '%;top:' + p.t + '%;width:' + p.w + '%;height:' + p.h + '%'; }

  function cover(b) {
    return '<div class="cover" style="--cloth:' + esc(b.cloth || '#5a4a3a') + '">' +
      '<span class="cover__title">' + esc(b.title) + '</span>' +
      '<svg class="cover__motif" viewBox="0 0 64 64" aria-hidden="true" focusable="false">' + (MOTIFS[b.motif] || MOTIFS.books) + '</svg>' +
      '<span class="cover__by">' + esc(b.by) + '</span>' +
    '</div>';
  }

  function init(root, books, opts) {
    opts = opts || {};
    var base = opts.base || 'images/shelf/';
    var g = window.gsap;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    books = books.filter(function (b) { return SPINES[b.spine]; });

    root.innerHTML =
      '<div class="shelf">' +
        '<div class="shelf__case">' +
          '<img class="shelf__img" src="' + base + 'bookcase.webp" alt="An illustrated wooden bookcase full of old cloth-bound books, with a plant, a globe, candles and a little canal house" width="934" height="1246" loading="lazy">' +
          books.map(function (b, i) {
            return '<button type="button" class="shelf__book" data-i="' + i + '" style="' + pos(SPINES[b.spine]) + '" aria-label="' + esc(b.title + ' by ' + b.by) + '" aria-controls="shelf-card">' +
              '<span class="shelf__lift"><span class="shelf__ribbon" aria-hidden="true"></span><img src="' + base + 'book-' + b.spine + '.webp" alt=""></span></button>';
          }).join('') +
          '<a class="shelf__spot" href="index.html#travels" style="' + pos(GLOBE) + '"><span class="shelf__tag mono">Where I’ve been →</span></a>' +
          '<a class="shelf__spot" href="index.html#travels/denmark" style="' + pos(HOUSE) + '"><span class="shelf__tag mono">Denmark →</span></a>' +
        '</div>' +
        '<div class="shelf__card" id="shelf-card" aria-live="polite"></div>' +
      '</div>';

    var card = root.querySelector('.shelf__card');
    var btns = Array.prototype.slice.call(root.querySelectorAll('.shelf__book'));
    var current = -1;

    function hint() {
      card.innerHTML =
        '<div class="cover cover--empty" aria-hidden="true"><span class="mono">?</span></div>' +
        '<div class="shelf__text"><p class="mono soft">' + books.length + ' favorites on the shelf</p>' +
        '<p class="shelf__hint">Pull a book with a ribbon off the shelf.</p>' + nav() + '</div>';
      wireNav();
    }
    function nav() {
      return '<div class="shelf__nav"><button type="button" class="shelf__arrow mono" data-step="-1" aria-label="Previous book">‹</button>' +
        '<span class="mono soft">' + (current > -1 ? (current + 1) + ' / ' + books.length : '— / ' + books.length) + '</span>' +
        '<button type="button" class="shelf__arrow mono" data-step="1" aria-label="Next book">›</button></div>';
    }
    function wireNav() {
      card.querySelectorAll('[data-step]').forEach(function (a) {
        a.addEventListener('click', function () {
          var n = current < 0 ? (+a.dataset.step > 0 ? 0 : books.length - 1) : (current + +a.dataset.step + books.length) % books.length;
          select(n, true);
        });
      });
    }
    function render(i) {
      var b = books[i];
      card.innerHTML = cover(b) +
        '<div class="shelf__text"><p class="mono soft">Favorite no. ' + (i + 1) + '</p>' +
        '<h3 class="shelf__title"><em>' + esc(b.title) + '</em></h3>' +
        '<p class="mono soft">' + esc(b.by) + '</p>' +
        '<p class="shelf__line">' + esc(b.line) + '</p>' + nav() + '</div>';
      wireNav();
      if (g && !reduce) {
        g.fromTo(card.querySelector('.cover'), { y: 14, rotation: -2, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });
        g.fromTo(card.querySelector('.shelf__text'), { opacity: 0.2 }, { opacity: 1, duration: 0.4 });
      }
    }
    function lift(i, up) {
      var el = btns[i] && btns[i].querySelector('.shelf__lift');
      if (!el) return;
      btns[i].classList.toggle('is-up', up);
      if (g && !reduce) g.to(el, { yPercent: up ? -24 : 0, rotation: up ? -4 : 0, duration: up ? 0.35 : 0.3, ease: up ? 'back.out(1.6)' : 'power2.inOut', overwrite: true });
    }
    function select(i, fromNav) {
      if (i !== current) {
        if (current > -1) lift(current, false);
        current = i;
        render(i);
      }
      lift(i, true);
      if (fromNav && window.matchMedia('(max-width: 860px)').matches) {
        // on phones, keep the card in view (it sits under the shelf)
        card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
      }
    }

    btns.forEach(function (btn, i) {
      btn.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') select(i); });
      btn.addEventListener('focus', function () { select(i); });
      btn.addEventListener('click', function () { select(i); });
      btn.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') lift(i, false); });
      btn.addEventListener('blur', function () { lift(i, false); });
    });
    hint();

    // ribbons sway once when the shelf scrolls into view
    if (g && !reduce && window.ScrollTrigger) {
      g.from(root.querySelectorAll('.shelf__ribbon'), { rotation: 18, transformOrigin: '50% 100%', duration: 1.4, ease: 'elastic.out(1, 0.35)', stagger: 0.12, scrollTrigger: { trigger: root, start: 'top 70%' } });
    }
  }

  /* ---------- the skincare tray ----------
     images/shelf/skincare.webp is the whole tray; skin-N.webp is the visible part
     of product N (routine order), cut by tools/cut_skin.py. Each product has a
     clip-path-shaped button for its exact outline, so overlapping bottles pick right. */
  var PRODUCTS = {
    1: { l: 15.939, t: 0.089, w: 23.954, h: 73.75, clip: '0.0% 2.06%, 3.72% 0.48%, 17.84% 0.0%, 66.17% 0.0%, 69.89% 1.45%, 69.14% 5.08%, 68.77% 19.37%, 74.35% 19.85%, 76.58% 22.03%, 76.58% 27.85%, 92.19% 28.09%, 97.77% 29.3%, 99.63% 31.72%, 99.63% 98.31%, 95.91% 99.88%, 4.83% 99.88%, 0.74% 98.31%, 0.0% 31.72%, 1.86% 29.3%, 6.69% 28.09%, 22.3% 27.85%, 22.3% 22.03%, 24.54% 19.85%, 33.46% 19.37%, 33.46% 5.33%, 17.84% 5.08%, 4.83% 5.33%, 0.37% 3.87%' },
    2: { l: 59.216, t: 51.339, w: 31.077, h: 24.732, clip: '0.0% 8.3%, 1.15% 3.61%, 4.87% 1.08%, 14.9% 0.0%, 83.67% 0.0%, 95.7% 1.44%, 98.85% 5.05%, 99.71% 20.94%, 99.43% 93.14%, 97.99% 97.47%, 93.7% 99.64%, 6.3% 99.64%, 2.01% 97.47%, 0.29% 93.14%' },
    3: { l: 36.064, t: 20.804, w: 19.858, h: 55.179, clip: '50.22% 0.0%, 56.95% 0.49%, 62.78% 2.43%, 65.92% 5.66%, 65.92% 18.61%, 81.61% 19.09%, 82.51% 36.89%, 87.0% 38.83%, 94.17% 41.26%, 98.65% 44.5%, 99.55% 48.54%, 99.55% 96.28%, 95.96% 98.71%, 88.34% 99.84%, 9.87% 99.84%, 3.14% 98.71%, 0.0% 96.28%, 0.0% 48.54%, 1.79% 44.5%, 6.28% 41.42%, 13.45% 38.83%, 18.83% 36.89%, 18.83% 19.09%, 33.63% 18.61%, 33.63% 5.66%, 36.77% 2.43%, 42.6% 0.49%' },
    4: { l: 50.312, t: 14.107, w: 28.94, h: 60.893, clip: '0.0% 1.03%, 2.15% 0.0%, 97.54% 0.0%, 99.69% 1.03%, 99.69% 4.84%, 97.54% 5.72%, 90.46% 98.97%, 88.31% 99.85%, 22.77% 99.85%, 20.31% 98.97%, 2.15% 5.72%, 0.0% 4.84%' },
  };
  var STACK = { 1: 1, 4: 2, 3: 3, 2: 4 };   // back to front: cleanser, tube, serum, jar

  function initSkin(root, steps, list, opts) {
    opts = opts || {};
    var base = opts.base || 'images/shelf/';
    var g = window.gsap;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var html = '<div class="tray">' +
      '<img class="tray__img" src="' + base + 'skincare.webp" alt="An illustrated cream tray holding my four skincare products, with sprigs of baby\u2019s breath" width="1123" height="1120" loading="lazy">' +
      '<span class="tray__veil" aria-hidden="true" style="-webkit-mask-image:url(' + base + 'skincare.webp);mask-image:url(' + base + 'skincare.webp)"></span>';
    steps.forEach(function (st, i) {
      var P = PRODUCTS[i + 1]; if (!P) return;
      html += '<img class="tray__lift" data-i="' + i + '" src="' + base + 'skin-' + (i + 1) + '.webp" alt="" style="' + pos(P) + ';z-index:' + (5 + STACK[i + 1]) + '">';
    });
    steps.forEach(function (st, i) {
      var P = PRODUCTS[i + 1]; if (!P) return;
      html += '<button type="button" class="tray__spot" data-i="' + i + '" style="' + pos(P) + ';clip-path:polygon(' + P.clip + ');z-index:' + (20 + STACK[i + 1]) + '" aria-label="' + esc('Step ' + (i + 1) + ', ' + st.step + ': ' + st.product) + '"></button>';
    });
    html += '<span class="tray__tag mono" aria-hidden="true"></span></div>';
    root.innerHTML = html;

    var tray = root.querySelector('.tray'), tag = root.querySelector('.tray__tag');
    var lifts = root.querySelectorAll('.tray__lift'), spots = root.querySelectorAll('.tray__spot');
    var rows = list ? list.querySelectorAll('.skin__step') : [];
    var current = -1, lastOn = 0;

    function on(i) {
      if (i === current) return;
      off();
      current = i; lastOn = Date.now();
      var P = PRODUCTS[i + 1], st = steps[i], lift = lifts[i];
      tray.classList.add('is-active');
      lift.classList.add('is-on');
      if (rows[i]) rows[i].classList.add('is-on');
      tag.innerHTML = 'Step ' + (i + 1) + ' · ' + esc(st.step) + (st.tag ? ' <b>' + esc(st.tag) + '</b>' : '');
      tag.style.left = (P.l + P.w / 2) + '%';
      tag.style.top = P.t + '%';
      tag.classList.add('is-on');
      if (g && !reduce) {
        g.killTweensOf(lift);
        g.timeline()
          .to(lift, { y: -10, duration: 0.25, ease: 'power2.out' })
          .to(lift, { rotation: -2, duration: 0.09, ease: 'sine.inOut' })
          .to(lift, { rotation: 2, duration: 0.12, ease: 'sine.inOut', yoyo: true, repeat: 1 })
          .to(lift, { rotation: 0, duration: 0.1, ease: 'sine.out' });
      }
    }
    function off() {
      if (current < 0) return;
      var lift = lifts[current];
      lift.classList.remove('is-on');
      if (rows[current]) rows[current].classList.remove('is-on');
      if (g && !reduce) { g.killTweensOf(lift); g.to(lift, { y: 0, rotation: 0, duration: 0.25, ease: 'power2.inOut' }); }
      tray.classList.remove('is-active'); tag.classList.remove('is-on');
      current = -1;
    }
    function bind(el, i) {
      // mouse hover opens and closes it; touch uses taps (phones fire a fake mouseleave after a tap)
      el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') on(i); });
      el.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') off(); });
      el.addEventListener('focus', function () { on(i); });
      el.addEventListener('blur', off);
      // a tap fires hover + focus + click together, so only a second, later tap closes it
      el.addEventListener('click', function () { if (current === i && Date.now() - lastOn > 450) off(); else on(i); });
    }
    spots.forEach(function (b) { bind(b, +b.dataset.i); });
    Array.prototype.forEach.call(rows, function (r, i) {
      if (!PRODUCTS[i + 1]) return;
      r.tabIndex = 0;
      bind(r, i);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') off(); });
    document.addEventListener('click', function (e) { if (current > -1 && !root.contains(e.target) && !(list && list.contains(e.target))) off(); });
  }

  window.Bookshelf = { init: init };
  window.SkinShelf = { init: initSkin };
})();
