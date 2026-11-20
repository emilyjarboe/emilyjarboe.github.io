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
      btn.addEventListener('mouseenter', function () { select(i); });
      btn.addEventListener('focus', function () { select(i); });
      btn.addEventListener('click', function () { select(i); });
      btn.addEventListener('mouseleave', function () { lift(i, false); });
      btn.addEventListener('blur', function () { lift(i, false); });
    });
    hint();

    // ribbons sway once when the shelf scrolls into view
    if (g && !reduce && window.ScrollTrigger) {
      g.from(root.querySelectorAll('.shelf__ribbon'), { rotation: 18, transformOrigin: '50% 100%', duration: 1.4, ease: 'elastic.out(1, 0.35)', stagger: 0.12, scrollTrigger: { trigger: root, start: 'top 70%' } });
    }
  }

  window.Bookshelf = { init: init };
})();
