/* Builds the main page from js/content.js, then adds the motion:
   letter-by-letter name, section reveals, light parallax, nav highlight,
   and Maverick's pose changes per section. */
(function () {
  'use strict';
  var S = window.SITE;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rich(s) { return esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>'); }   // *word* -> cursive italic
  function label(num, text) { return '<div class="sec-label mono"><span class="num">' + num + '</span><span class="rule"></span><span>' + esc(text) + '</span></div>'; }
  function linkBtn(href, text, ghost, ext) {
    var cls = 'btn' + (ghost ? ' btn--ghost' : '');
    if (!href) return '<span class="' + cls + ' is-pending" title="Link coming soon">' + esc(text) + '</span>';
    return '<a class="' + cls + '" href="' + esc(href) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + esc(text) + '</a>';
  }
  function set(id, html) { var el = document.getElementById(id); if (el) el.innerHTML = html; }

  /* ---------- render ---------- */
  var FULL = S.fullName || S.name;
  document.title = FULL;
  document.querySelectorAll('[data-name]').forEach(function (el) { el.textContent = FULL; });
  function linked(s) {
    return esc(s).replace(/\[([^\]]+)\]\((#[\w-]+)\)/g, function (m, text, href) {
      if (href === '#maverick') return '<button type="button" class="link link--inline link--btn" data-say-hi>' + text + '</button>';
      return '<a class="link link--inline" href="' + href + '">' + text + '</a>';
    });
  }
  function paras(v, cls) { return [].concat(v || []).map(function (p) { return '<p class="' + cls + ' reveal">' + linked(p) + '</p>'; }).join(''); }

  var H = S.home;
  set('home', '<div class="wrap">' +
    '<div class="hero__meta mono"><span>' + esc(S.issue) + '</span><span class="hero__meta-r">A personal journal</span></div>' +
    '<div class="hero__stage layer">' +
      '<div class="hero__frame layer__main"><picture><source media="(max-width: 600px)" srcset="' + esc(H.photoPhone) + '">' +
        '<img src="' + esc(H.photo) + '" alt="' + esc(H.photoAlt) + '" width="2000" height="1333" fetchpriority="high"></picture></div>' +
      '<h1 class="hero__name"><span class="ln">' + esc(FULL.split(' ')[0]) + '</span><span class="ln"><em>' + esc(FULL.split(' ').slice(1).join(' ')) + '</em></span></h1>' +
    '</div>' +
    '<div class="hero__under"><p class="lede">' + esc(H.tagline) + '</p>' + label('01', 'Scroll') + '</div>' +
  '</div>');

  var A = S.about;
  set('about', '<div class="wrap">' +
    '<div class="sec__head">' + label('02', 'About') + '</div>' +
    '<div class="about">' +
      '<figure class="about__photos layer">' +
        '<div class="layer__main"><img src="' + esc(A.photo) + '" alt="' + esc(A.photoAlt) + '" width="1000" height="1250" loading="lazy"></div>' +
      '</figure>' +
      '<div class="about__text">' +
        '<h2 id="about-h" class="reveal">' + rich(A.title) + '</h2>' +
        '<div class="about__intro reveal"><p class="about__hello">' + esc(A.hello) + '</p>' +
          A.paragraphs.map(function (p) { return '<p class="lede">' + linked(p) + '</p>'; }).join('') + '</div>' +
        '<dl class="facts facts--' + A.facts.length + ' reveal">' + A.facts.map(function (f) { return '<div><dt class="mono">' + esc(f.label) + '</dt><dd>' + rich(f.value) + '</dd></div>'; }).join('') + '</dl>' +
        '<div class="row reveal">' + linkBtn(A.resume, 'Download resume', false, true) + linkBtn(A.linkedin, 'LinkedIn', true, true) + '<span data-email-btn></span></div>' +
      '</div>' +
    '</div>' +
  '</div>');

  var R = S.rover;
  var walkPhotos = [0, 1, 2].map(function (i) {
    var src = R.photos[i];
    return src ? '<div class="ph"><img src="' + esc(src) + '" alt="' + esc((R.photoAlts || [])[i] || 'A dog on a Rover walk') + '" loading="lazy"></div>'
               : '<div class="ph mono">Walk photo</div>';
  }).join('');
  set('rover', '<div class="wrap">' +
    '<div class="sec__head">' + label('03', 'Rover') + '<h2 id="rover-h" class="reveal">' + rich(R.title) + '</h2>' +
      (R.intro ? '<p class="sec__quip reveal">' + esc(R.intro) + '</p>' : '') + '</div>' +
    '<div class="walk">' +
      '<svg class="walk__svg" aria-hidden="true" focusable="false"></svg>' +
      '<div class="walk__row walk__stats-row"><span class="walk__stop mono soft">Stop 1 · The numbers</span>' +
        '<div class="stats stats--' + R.stats.length + '">' + R.stats.map(function (s) { return '<div><b>' + esc(s.value) + '</b><span class="mono soft">' + esc(s.label) + '</span></div>'; }).join('') + '</div>' +
        (R.badges && R.badges.length ? '<ul class="walk__badges">' + R.badges.map(function (b) { return '<li class="tag">' + esc(b) + '</li>'; }).join('') + '</ul>' : '') +
      '</div>' +
      '<div class="walk__row walk__reviews"><span class="walk__stop mono soft">Stop 2 · What owners say</span>' +
        '<div class="walk__quotes">' + R.reviews.map(function (r, i) {
          return '<blockquote class="quote' + (R.reviews.length === 1 ? ' quote--solo' : (i ? ' quote--small' : '')) + '"><p>“' + esc(r.quote) + '”</p><span class="mono soft">— ' + esc(r.by) + '</span></blockquote>';
        }).join('') + '</div>' +
      '</div>' +
      '<div class="walk__row walk__photos-row"><span class="walk__stop mono soft">Stop 3 · Out on walks</span>' +
        '<div class="walk__photos" aria-label="Photos from Rover walks">' + walkPhotos + '</div>' +
      '</div>' +
      '<div class="walk__row walk__end"><span class="walk__stop mono soft">Last stop</span>' +
        linkBtn(R.profile, 'Book me on Rover', false, true) +
      '</div>' +
    '</div>' +
  '</div>');

  var T = S.travels;
  set('travels', '<div class="wrap">' +
    '<div class="sec__head">' + label('04', 'Travels') + '<h2 id="travels-h" class="reveal">' + rich(T.title) + '</h2>' +
      '<div class="sec__intro">' + paras(T.intro, 'lede') + '</div></div>' +
    '<div class="travel" id="travel-map"></div>' +
  '</div>');
  if (window.TravelMap) TravelMap.init(document.getElementById('travel-map'), T, { svg: 'data/world.svg', meta: 'data/world-meta.json' });

  var X = S.latelyCta;
  if (X) set('next', '<div class="wrap">' +
    '<a class="cta" href="' + esc(X.href) + '">' +
      '<span class="cta__lead">' + esc(X.lead) + '</span>' +
      '<span class="cta__word"><span class="cta__letters">' + esc(X.word).split('').map(function (c) { return '<span class="ch">' + c + '</span>'; }).join('') + '</span>' +
        '<span class="cta__arrow mono" aria-hidden="true">→</span></span>' +
      '<span class="cta__open mono soft">Open</span>' +
    '</a>' +
  '</div>');

  var C = S.contact;
  var EMAIL = C.email && typeof C.email === 'object' ? C.email.user + '@' + C.email.domain : (C.email || '');
  var contactLinks = [
    EMAIL ? '<li><a class="link" href="mailto:' + esc(EMAIL) + '">' + esc(EMAIL) + '</a></li>' : '<li class="is-pending">Email</li>',
    C.linkedin ? '<li><a class="link" href="' + esc(C.linkedin) + '" target="_blank" rel="noopener">LinkedIn</a></li>' : '<li class="is-pending">LinkedIn</li>',
    C.instagram ? '<li><a class="link" href="' + esc(C.instagram) + '" target="_blank" rel="noopener">Instagram</a></li>' : ''
  ].join('');
  document.querySelectorAll('[data-email-btn]').forEach(function (el) { el.outerHTML = EMAIL ? linkBtn('mailto:' + EMAIL, 'Email me', true) : ''; });
  set('footer-links', contactLinks + '<li><a class="link" href="lately.html">Lately →</a></li>');
  set('footer-note', (S.illustrationCredit ? esc(S.illustrationCredit) + ' · ' : '') + 'Last updated ' + esc(S.updated));

  /* ---------- name letters (keeps the italic) ---------- */
  document.querySelectorAll('.hero__name .ln').forEach(function (ln) {
    (function split(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split('').forEach(function (c) { var s = document.createElement('span'); s.className = 'ch'; s.textContent = c === ' ' ? ' ' : c; frag.appendChild(s); });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) split(child);
      });
    })(ln);
  });

  /* ---------- Maverick ---------- */
  var mav = window.Maverick ? Maverick.mount({ base: 'images/maverick/', pose: 'walk' }) : null;
  document.querySelectorAll('.mv-toggle').forEach(function (b) { if (window.Maverick) Maverick.bindToggle(b); });
  document.querySelectorAll('[data-say-hi]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!mav || document.documentElement.classList.contains('mv-hidden')) return;
      mav.say('Hi, I\u2019m Maverick!');
    });
  });
  var walkEl = document.querySelector('#rover .walk');
  if (walkEl && window.RoverTrail) RoverTrail.init(walkEl, { base: 'images/maverick/', mav: mav });

  /* ---------- motion ---------- */
  var links = document.querySelectorAll('.topnav a[data-sec]');
  function setActive(id) { links.forEach(function (a) { a.classList.toggle('is-active', a.dataset.sec === id); }); }
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll('section[data-pose]').forEach(function (sec) {
    ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onToggle: function (self) { if (self.isActive && mav) mav.setPose(sec.dataset.pose); } });
  });
  ['home', 'about', 'rover', 'travels'].forEach(function (id) {
    ScrollTrigger.create({ trigger: '#' + id, start: 'top 45%', end: 'bottom 45%', onToggle: function (self) { if (self.isActive) setActive(id); } });
  });

  if (window.Maverick && Maverick.reduceMotion) return;

  gsap.from('.hero__frame img', { scale: 1.08, duration: 1.8, ease: 'power3.out' });
  gsap.from('.hero__name .ch', { yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: 0.04, delay: 0.2 });

  if (document.querySelector('.cta')) {
    gsap.from('.cta__letters .ch', { yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: 0.06, scrollTrigger: { trigger: '.cta', start: 'top 80%' } });
    gsap.from('.cta__lead, .cta__open', { y: 16, opacity: 0.35, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.cta', start: 'top 85%' } });
  }
  gsap.utils.toArray('.sec-label .rule').forEach(function (r) {
    gsap.from(r, { scaleX: 0, duration: 1, ease: 'power3.inOut', scrollTrigger: { trigger: r, start: 'top 90%' } });
  });
  gsap.utils.toArray('.reveal').forEach(function (el) {
    gsap.from(el, { y: 28, opacity: 0.35, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  gsap.utils.toArray('[data-speed]').forEach(function (el) {
    var sp = parseFloat(el.dataset.speed);
    gsap.fromTo(el, { yPercent: sp }, { yPercent: -sp, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
})();
