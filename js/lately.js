/* Builds the Lately page from js/content.js (SITE.lately) and adds the motion:
   section reveals, favorites tabs, and Maverick's pose changes. */
(function () {
  'use strict';
  var S = window.SITE, L = S.lately;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rich(s) { return esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>'); }
  function label(num, text) { return '<div class="sec-label mono"><span class="num">' + num + '</span><span class="rule"></span><span>' + esc(text) + '</span></div>'; }
  function set(id, html) { var el = document.getElementById(id); if (el) el.innerHTML = html; }

  var FULL = S.fullName || S.name;
  document.title = FULL + ' · Lately';
  document.querySelectorAll('[data-name]').forEach(function (el) { el.textContent = FULL; });

  /* ---------- header ---------- */
  set('lately-top', '<div class="wrap">' +
    '<div class="sec__head">' + label('01', 'Lately') +
      '<h1 class="lately__title reveal">' + rich(L.title) + '</h1>' +
      '<p class="mono soft reveal">Updated ' + esc(L.updated) + '</p>' +
    '</div>' +
    '<div class="now">' + L.now.map(function (n) {
      var title = n.link ? '<a class="link" href="' + esc(n.link) + '">' + esc(n.title) + '</a>' : esc(n.title);
      return '<article class="now__item reveal"><span class="mono soft">' + esc(n.label) + '</span>' +
        '<h3 class="now__title"><em>' + title + '</em></h3>' +
        '<span class="mono soft now__by">' + esc(n.by) + '</span>' +
        (n.line ? '<p class="now__line">' + esc(n.line) + '</p>' : '') + '</article>';
    }).join('') + '</div>' +
  '</div>');

  /* ---------- Spotify ---------- */
  var sp = L.spotify;
  set('repeat', '<div class="wrap">' +
    '<div class="repeat">' +
      '<div class="repeat__text">' + label('02', 'Listening') +
        '<h2 class="reveal">On <em>repeat</em></h2>' +
        '<p class="lede reveal">The playlist I keep coming back to. Press play.</p>' +
        '<a class="link mono" href="' + esc(sp.url) + '" target="_blank" rel="noopener">Open in Spotify ↗</a>' +
      '</div>' +
      '<div class="repeat__player reveal">' +
        '<iframe title="Spotify playlist" src="' + esc(sp.embed) + '" width="100%" height="352" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>' +
      '</div>' +
    '</div>' +
  '</div>');

  /* ---------- favorites ---------- */
  set('favorites', '<div class="wrap">' +
    '<div class="sec__head">' + label('03', 'Favorites') + '<h2 class="reveal">All-time <em>favorites</em></h2></div>' +
    '<div class="tabs" role="tablist" aria-label="Favorites">' + L.favorites.map(function (f, i) {
      return '<button type="button" role="tab" class="tab mono" id="tab-' + i + '" aria-controls="panel-' + i + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' + esc(f.tab) + ' <span class="soft">' + f.items.length + '</span></button>';
    }).join('') + '</div>' +
    L.favorites.map(function (f, i) {
      return '<div class="fav" role="tabpanel" id="panel-' + i + '" aria-labelledby="tab-' + i + '"' + (i ? ' hidden' : '') + '><ul class="fav__list">' +
        f.items.map(function (it) {
          return '<li class="fav__item"><h3 class="fav__title">' + esc(it.title) + '</h3><span class="mono soft">' + esc(it.by) + '</span><p class="fav__line">' + esc(it.line) + '</p></li>';
        }).join('') + '</ul></div>';
    }).join('') +
  '</div>');

  /* ---------- skincare ---------- */
  var K = L.skincare;
  set('skincare', '<div class="wrap">' +
    '<div class="sec__head">' + label('04', 'Skincare') + '<h2 class="reveal">' + rich(K.title) + '</h2></div>' +
    '<div class="skin' + (K.photo ? ' has-photo' : '') + '">' +
      '<ol class="skin__steps">' + K.steps.map(function (s, i) {
        return '<li class="skin__step reveal"><span class="skin__n">' + (i + 1) + '</span>' +
          '<div><span class="mono soft">' + esc(s.step) + (s.tag ? ' <span class="tag">' + esc(s.tag) + '</span>' : '') + '</span>' +
          '<h3 class="skin__product">' + esc(s.product) + '</h3><p class="skin__line">' + esc(s.line) + '</p></div></li>';
      }).join('') + '</ol>' +
      (K.photo ? '<figure class="skin__photo layer"><div class="layer__ghost" data-speed="-6"><img src="' + esc(K.photo) + '" alt="" loading="lazy"></div><div class="layer__main"><img src="' + esc(K.photo) + '" alt="' + esc(K.photoAlt) + '" loading="lazy"></div></figure>' : '') +
    '</div>' +
  '</div>');

  /* ---------- footer ---------- */
  var C = S.contact;
  set('footer-links', [
    '<li><a class="link" href="index.html">← Main page</a></li>',
    C.email ? '<li><a class="link" href="mailto:' + esc(C.email) + '">' + esc(C.email) + '</a></li>' : '<li class="is-pending">Email</li>',
    C.linkedin ? '<li><a class="link" href="' + esc(C.linkedin) + '" target="_blank" rel="noopener">LinkedIn</a></li>' : '<li class="is-pending">LinkedIn</li>',
    C.instagram ? '<li><a class="link" href="' + esc(C.instagram) + '" target="_blank" rel="noopener">Instagram</a></li>' : ''
  ].join(''));
  set('footer-note', (S.illustrationCredit ? esc(S.illustrationCredit) + ' · ' : '') + 'Last updated ' + esc(S.updated));

  /* ---------- tabs ---------- */
  var g = window.gsap, reduce = window.Maverick && Maverick.reduceMotion;
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  function selectTab(i, focus) {
    tabs.forEach(function (t, k) {
      var on = k === i, panel = document.getElementById('panel-' + k);
      t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
      panel.hidden = !on;
      if (on && g && !reduce) g.fromTo(panel.querySelectorAll('.fav__item'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out' });
    });
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(i); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); selectTab((i + 1) % tabs.length, true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); selectTab((i - 1 + tabs.length) % tabs.length, true); }
    });
  });

  /* ---------- Maverick ---------- */
  var mav = window.Maverick ? Maverick.mount({ base: 'images/maverick/', pose: 'stand' }) : null;
  document.querySelectorAll('.mv-toggle').forEach(function (b) { if (window.Maverick) Maverick.bindToggle(b); });

  if (!g || !window.ScrollTrigger) return;
  g.registerPlugin(ScrollTrigger);
  document.querySelectorAll('[data-pose]').forEach(function (sec) {
    ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onToggle: function (self) { if (self.isActive && mav) mav.setPose(sec.dataset.pose); } });
  });
  if (reduce) return;
  g.utils.toArray('.sec-label .rule').forEach(function (r) {
    g.from(r, { scaleX: 0, duration: 1, ease: 'power3.inOut', scrollTrigger: { trigger: r, start: 'top 90%' } });
  });
  g.utils.toArray('.reveal').forEach(function (el) {
    g.from(el, { y: 28, opacity: 0.35, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  g.utils.toArray('[data-speed]').forEach(function (el) {
    var sp2 = parseFloat(el.dataset.speed);
    g.fromTo(el, { yPercent: sp2 }, { yPercent: -sp2, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
})();
