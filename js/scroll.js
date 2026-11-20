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
  document.title = S.name === 'Your Name' ? 'Personal Website' : S.name;
  document.querySelectorAll('[data-name]').forEach(function (el) { el.textContent = S.name; });

  var H = S.home;
  set('home', '<div class="wrap">' +
    '<div class="hero__meta mono"><span>' + esc(S.issue) + '</span><span class="hero__meta-r">A personal journal</span></div>' +
    '<div class="hero__stage layer">' +
      '<div class="hero__frame layer__main"><picture><source media="(max-width: 600px)" srcset="' + esc(H.photoPhone) + '">' +
        '<img src="' + esc(H.photo) + '" alt="' + esc(H.photoAlt) + '" width="2000" height="1333" fetchpriority="high"></picture></div>' +
      '<h1 class="hero__name"><span class="ln">' + esc(H.greeting) + '</span><span class="ln"><em>' + esc(S.name) + '</em></span></h1>' +
    '</div>' +
    '<div class="hero__under"><p class="lede">' + esc(H.tagline) + '</p>' + label('01', 'Scroll') + '</div>' +
  '</div>');

  var A = S.about;
  set('about', '<div class="wrap">' +
    '<div class="sec__head">' + label('02', 'About') + '</div>' +
    '<div class="about">' +
      '<figure class="about__photos layer">' +
        '<div class="layer__ghost" data-speed="-8"><img src="' + esc(A.ghost) + '" alt="" width="2000" height="1333" loading="lazy"></div>' +
        '<div class="layer__main"><img src="' + esc(A.photo) + '" alt="' + esc(A.photoAlt) + '" width="1000" height="1250" loading="lazy"></div>' +
        '<figcaption class="mono">' + esc(A.caption) + '</figcaption>' +
      '</figure>' +
      '<div class="about__text">' +
        '<h2 id="about-h" class="reveal">' + rich(A.title) + '</h2>' +
        '<p class="lede reveal">' + esc(A.lede) + '</p>' +
        '<dl class="facts reveal">' + A.facts.map(function (f) { return '<div><dt class="mono">' + esc(f.label) + '</dt><dd>' + rich(f.value) + '</dd></div>'; }).join('') + '</dl>' +
        '<div class="reveal stack"><h3>Three things about me</h3><ol class="three">' +
          A.three.map(function (t, i) { return '<li><span class="n">' + ['i.', 'ii.', 'iii.', 'iv.', 'v.'][i] + '</span><span>' + esc(t) + '</span></li>'; }).join('') +
        '</ol></div>' +
        '<div class="reveal stack"><h3>Experience</h3><ul class="exp">' +
          A.experience.map(function (e) { return '<li><span class="exp__role">' + esc(e.role) + ' <em>· ' + esc(e.place) + '</em></span><span class="mono soft">' + esc(e.dates) + '</span></li>'; }).join('') +
        '</ul></div>' +
        '<div class="row reveal">' + linkBtn(A.resume, 'Download resume', false) + linkBtn(A.linkedin, 'LinkedIn', true, true) + '</div>' +
      '</div>' +
    '</div>' +
  '</div>');

  var R = S.rover;
  var collage = [0, 1, 2].map(function (i) {
    var src = R.photos[i];
    var speed = [-6, 8, 14][i];
    return src ? '<div class="ph" data-speed="' + speed + '"><img src="' + esc(src) + '" alt="A dog on a Rover walk" loading="lazy"></div>'
               : '<div class="ph mono" data-speed="' + speed + '">Walk photo</div>';
  }).join('');
  set('rover', '<div class="wrap">' +
    '<div class="sec__head">' + label('03', 'Rover') + '<h2 id="rover-h" class="reveal">' + rich(R.title) + '</h2></div>' +
    '<div class="rover">' +
      '<div class="rover__text">' +
        '<div class="stats reveal">' + R.stats.map(function (s) { return '<div><b>' + esc(s.value) + '</b><span class="mono soft">' + esc(s.label) + '</span></div>'; }).join('') + '</div>' +
        R.reviews.map(function (r, i) {
          return '<blockquote class="quote reveal' + (i ? ' quote--small' : '') + '"><p>“' + esc(r.quote) + '”</p><span class="mono soft">— ' + esc(r.by) + '</span></blockquote>';
        }).join('') +
        '<div>' + linkBtn(R.profile, 'Book me on Rover', false, true) + '</div>' +
      '</div>' +
      '<div class="collage" aria-label="Photos from Rover walks">' + collage + '</div>' +
    '</div>' +
  '</div>');

  var T = S.travels;
  set('travels', '<div class="wrap">' +
    '<div class="sec__head">' + label('04', 'Travels') + '<h2 id="travels-h" class="reveal">' + rich(T.title) + '</h2>' +
      (T.intro ? '<p class="lede reveal">' + esc(T.intro) + '</p>' : '') + '</div>' +
    '<div class="travel" id="travel-map"></div>' +
  '</div>');
  if (window.TravelMap) TravelMap.init(document.getElementById('travel-map'), T, { svg: 'data/world.svg', meta: 'data/world-meta.json' });

  var C = S.contact;
  var contactLinks = [
    C.email ? '<li><a class="link" href="mailto:' + esc(C.email) + '">' + esc(C.email) + '</a></li>' : '<li class="is-pending">Email</li>',
    C.linkedin ? '<li><a class="link" href="' + esc(C.linkedin) + '" target="_blank" rel="noopener">LinkedIn</a></li>' : '<li class="is-pending">LinkedIn</li>',
    C.instagram ? '<li><a class="link" href="' + esc(C.instagram) + '" target="_blank" rel="noopener">Instagram</a></li>' : ''
  ].join('');
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

  /* ---------- motion ---------- */
  var links = document.querySelectorAll('.topnav a[data-sec]');
  function setActive(id) { links.forEach(function (a) { a.classList.toggle('is-active', a.dataset.sec === id); }); }
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll('[data-pose]').forEach(function (sec) {
    ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onToggle: function (self) { if (self.isActive && mav) mav.setPose(sec.dataset.pose); } });
  });
  ['home', 'about', 'rover', 'travels'].forEach(function (id) {
    ScrollTrigger.create({ trigger: '#' + id, start: 'top 45%', end: 'bottom 45%', onToggle: function (self) { if (self.isActive) setActive(id); } });
  });

  if (window.Maverick && Maverick.reduceMotion) return;

  gsap.from('.hero__frame img', { scale: 1.08, duration: 1.8, ease: 'power3.out' });
  gsap.from('.hero__name .ch', { yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: 0.04, delay: 0.2 });

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
