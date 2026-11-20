/* Maverick the Great Pyrenees
   Illustrated poses (by your artist) animated with GSAP.
   Usage:
     var mav = Maverick.mount({ base: 'images/maverick/' });
     mav.setPose('sit');                 // walk | sit | playbow | lieup | stand | lieheart
     Maverick.bindToggle(buttonElement); // "Hide Maverick" / "Show Maverick"
*/
(function () {
  'use strict';

  // Source sizes (px) of each cut-out. Every pose is drawn at the same scale on the artist's sheet.
  var POSES = {
    walk:     { w: 539, h: 470, fx: true,  facing: 1 },
    sit:      { w: 356, h: 458, fx: false, facing: 0 },
    playbow:  { w: 512, h: 472, fx: true,  facing: 1 },
    lieup:    { w: 503, h: 352, fx: true,  facing: 0 },
    stand:    { w: 399, h: 549, fx: true,  facing: -1 },
    lieheart: { w: 533, h: 279, fx: true,  facing: 0 }
  };
  // Walking pose is split into a body and four legs (cut by art-source/rig_walk.py).
  // px/py = each leg's pivot (shoulder or hip) as % of the image; dir = swing direction in the stride.
  var WALK_LEGS = [
    { id: 'rf', px: 43.04, py: 63.83, dir: -1, front: false },  // back leg, far side
    { id: 'ff', px: 77.18, py: 66.38, dir: 1,  front: false },  // front leg, far side (raised paw)
    { id: 'body' },
    { id: 'rn', px: 18.55, py: 66.38, dir: 1,  front: true },   // back leg, near side
    { id: 'fn', px: 61.22, py: 67.66, dir: -1, front: true }    // front leg, near side
  ];
  var LINES = ['Woof!', "Hi, I'm Maverick!"];
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var instance = null;

  function scaleNow() { return window.innerWidth < 640 ? 0.19 : 0.36; }

  function mount(opts) {
    if (instance) return instance;
    opts = opts || {};
    var base = opts.base || 'images/maverick/';
    var g = window.gsap;

    var slot = document.createElement('div');
    slot.className = 'mv-slot';
    slot.innerHTML =
      '<div class="mv" role="button" tabindex="0" aria-label="Maverick the Great Pyrenees. Press to say hi.">' +
        '<div class="mv-bubble" aria-live="polite"></div>' +
        '<div class="mv-flip"></div>' +
      '</div>';
    document.body.appendChild(slot);

    var mv = slot.querySelector('.mv'), flip = slot.querySelector('.mv-flip'), bubble = slot.querySelector('.mv-bubble');
    var layers = {};
    Object.keys(POSES).forEach(function (name) {
      var p = POSES[name], wrap = document.createElement('div');
      wrap.className = 'mv-pose'; wrap.dataset.pose = name;
      var art;
      if (name === 'walk') {
        art = '<div class="mv-img mv-rig">' + WALK_LEGS.map(function (L) {
          return L.id === 'body'
            ? '<img src="' + base + 'walk-body.webp" alt="" draggable="false">'
            : '<img class="mv-leg" data-leg="' + L.id + '" src="' + base + 'walk-leg-' + L.id + '.webp" alt="" draggable="false">';
        }).join('') + '</div>';
      } else {
        art = '<img class="mv-img" src="' + base + name + '.webp" alt="" draggable="false">';
      }
      wrap.innerHTML = art + (p.fx ? '<img class="mv-fx" src="' + base + name + '-fx.webp" alt="" draggable="false">' : '');
      flip.appendChild(wrap);
      layers[name] = { wrap: wrap, img: wrap.querySelector('.mv-img'), fx: wrap.querySelector('.mv-fx') };
    });

    function size() {
      var s = scaleNow(), maxW = 0, maxH = 0;
      Object.keys(POSES).forEach(function (n) {
        var p = POSES[n], L = layers[n];
        L.wrap.style.width = Math.round(p.w * s) + 'px';
        L.wrap.style.height = Math.round(p.h * s) + 'px';
        maxW = Math.max(maxW, p.w * s); maxH = Math.max(maxH, p.h * s);
      });
      flip.style.width = Math.round(maxW) + 'px'; flip.style.height = Math.round(maxH) + 'px';
    }
    size();

    var current = null, loops = [], roamToken = 0;
    function killLoops() { loops.forEach(function (t) { t.kill(); }); loops = []; roamToken++; }
    function show(name) {
      Object.keys(layers).forEach(function (n) { layers[n].wrap.style.opacity = n === name ? 1 : 0; });
    }
    function setFacing(dir) { if (g) g.set(flip, { scaleX: dir }); else flip.style.transform = 'scaleX(' + dir + ')'; }

    // ---------- idle behaviour per pose ----------
    function idle(name) {
      var L = layers[name];
      if (!g || reduce) return;
      g.set([L.img, L.fx].filter(Boolean), { transformOrigin: '50% 100%' });
      if (name === 'walk') return roam();
      if (name === 'sit' || name === 'lieup') {
        loops.push(g.to(L.img, { scaleY: 1.015, duration: 1.7, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
        if (L.fx) loops.push(g.to(L.fx, { opacity: 0.25, duration: 0.6, yoyo: true, repeat: -1, repeatDelay: 2.2, ease: 'sine.inOut' }));
      }
      if (name === 'playbow') {
        var w = g.timeline({ repeat: -1, repeatDelay: 1.4 });
        w.to(L.img, { rotation: 2, duration: 0.12, yoyo: true, repeat: 5, ease: 'sine.inOut' })
         .to(L.fx, { opacity: 0.2, duration: 0.12, yoyo: true, repeat: 5 }, 0);
        loops.push(w);
      }
      if (name === 'stand') {
        var b = g.timeline({ repeat: -1, repeatDelay: 1.1 });
        b.to(L.wrap, { y: -12, duration: 0.22, ease: 'power2.out' }).to(L.wrap, { y: 0, duration: 0.3, ease: 'bounce.out' })
         .to(L.wrap, { y: -8, duration: 0.18, ease: 'power2.out' }).to(L.wrap, { y: 0, duration: 0.26, ease: 'bounce.out' });
        loops.push(b);
        if (L.fx) loops.push(g.to(L.fx, { rotation: 8, duration: 0.15, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      }
      if (name === 'lieheart') {
        loops.push(g.to(L.img, { scaleY: 1.02, duration: 1.9, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
        loops.push(g.fromTo(L.fx, { y: 0, scale: 1, opacity: 1 }, { y: -10, scale: 1.15, opacity: 0.55, transformOrigin: '50% 50%', duration: 1.4, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      }
    }

    // Walking: glide along the right part of the screen with a gentle bob, pause, turn, return.
    function roam() {
      var token = roamToken, L = layers.walk;
      // legs: diagonal pairs swing opposite each other around their hips and shoulders
      var legEls = WALK_LEGS.filter(function (d) { return d.id !== 'body'; }).map(function (d) {
        var el = L.img.querySelector('[data-leg="' + d.id + '"]');
        g.set(el, { transformOrigin: d.px + '% ' + d.py + '%', rotation: 0 });
        return { el: el, dir: d.dir };
      });
      var STEP = 0.36, SWING = 10;
      var gait = g.timeline({ repeat: -1, paused: true });
      legEls.forEach(function (l) {
        gait.fromTo(l.el, { rotation: -SWING * l.dir }, { rotation: SWING * l.dir, duration: STEP, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0);
      });
      loops.push(gait);
      var bob = g.to(L.wrap, { y: -3, duration: STEP / 2, yoyo: true, repeat: -1, ease: 'sine.inOut', paused: true });
      loops.push(bob);
      function walking(on) {
        if (on) { gait.resume(); bob.resume(); }
        else {
          gait.pause(); bob.pause();
          legEls.forEach(function (l) { g.to(l.el, { rotation: 0, duration: 0.25, ease: 'sine.out' }); });
          g.to(L.wrap, { y: 0, duration: 0.2 });
        }
      }
      if (L.fx) loops.push(g.to(L.fx, { opacity: 0.15, duration: 0.4, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      function leg(toX, then) {
        if (token !== roamToken) return;
        var from = g.getProperty(mv, 'x');
        setFacing(toX >= from ? 1 : -1);
        walking(true);
        loops.push(g.to(mv, { x: toX, duration: Math.max(1, Math.abs(toX - from) / 55), ease: 'sine.inOut', onComplete: function () {
          walking(false);
          loops.push(g.delayedCall(1.6, then));
        } }));
      }
      function cycle() {
        var far = window.innerWidth < 640 ? -48 : -Math.max(40, Math.min(window.innerWidth * 0.3, 420));   // short walks on phones, so he stays in the corner
        leg(far, function () { leg(0, cycle); });
      }
      cycle();
    }

    function setPose(name) {
      if (!POSES[name] || name === current) return;
      var prev = current; current = name;
      mv.dataset.pose = name;
      killLoops();
      Object.keys(layers).forEach(function (n) { if (g) g.set([layers[n].wrap, layers[n].img, layers[n].fx].filter(Boolean), { clearProps: 'transform' }); });
      if (!g || reduce || !prev) {
        show(name); setFacing(1);
        if (g && !reduce && name !== 'walk') g.set(mv, { x: 0 });
        idle(name);
        return;
      }
      // Only one Maverick at a time: stop any half-finished crossfade and hide every pose
      // except the one on screen now (a fast scroll can cut a crossfade short).
      var wraps = Object.keys(layers).map(function (n) { return layers[n].wrap; });
      g.killTweensOf(wraps);
      g.killTweensOf(mv);
      wraps.forEach(function (w) { w.style.opacity = w === layers[prev].wrap ? 1 : 0; });
      // hop, crossfade, land
      var t = g.timeline({ onInterrupt: function () { show(name); } });
      t.to(mv, { y: -22, duration: 0.2, ease: 'power2.out' })
       .to(layers[prev].wrap, { opacity: 0, duration: 0.22 }, 0.05)
       .to(layers[name].wrap, { opacity: 1, duration: 0.22 }, 0.12)
       .call(function () { setFacing(1); })
       .to(mv, { x: name === 'walk' ? g.getProperty(mv, 'x') : 0, duration: 0.35, ease: 'power2.inOut' }, 0)
       .to(mv, { y: 0, duration: 0.45, ease: 'bounce.out' }, 0.2)
       .call(function () { show(name); if (current === name) idle(name); });
      loops.push(t);
    }

    // ---------- interactions ----------
    var li = 0, timer;
    function say(text) {
      bubble.textContent = typeof text === 'string' ? text : LINES[li++ % LINES.length];
      bubble.classList.add('is-on');
      clearTimeout(timer);
      timer = setTimeout(function () { bubble.classList.remove('is-on'); }, 1800);
      if (g && !reduce) g.fromTo(flip, { y: 0 }, { y: -10, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out' });
    }
    mv.addEventListener('click', say);
    mv.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); say(); } });

    var resizeT;
    window.addEventListener('resize', function () {
      clearTimeout(resizeT);
      resizeT = setTimeout(function () { size(); if (current === 'walk') { var c = current; current = null; killLoops(); if (g) g.set(mv, { x: 0 }); setPose(c); } }, 200);
    });

    // Step away (e.g. while he walks the Rover trail) and come back
    function setAway(away) { slot.classList.toggle('is-away', !!away); }

    setPose(opts.pose || 'walk');
    instance = { el: mv, slot: slot, setPose: setPose, say: say, setAway: setAway, get pose() { return current; } };
    return instance;
  }

  function bindToggle(btn) {
    var label = btn.querySelector('span') || btn;
    function apply(hidden) {
      document.documentElement.classList.toggle('mv-hidden', hidden);
      btn.setAttribute('aria-pressed', String(hidden));
      label.textContent = hidden ? 'Show Maverick' : 'Hide Maverick';
    }
    var stored = false;
    try { stored = localStorage.getItem('hideMaverick') === '1'; } catch (e) {}
    apply(stored);
    btn.addEventListener('click', function () {
      var hidden = !document.documentElement.classList.contains('mv-hidden');
      apply(hidden);
      try { localStorage.setItem('hideMaverick', hidden ? '1' : '0'); } catch (e) {}
    });
  }

  // A second, free-standing walking Maverick (same rig and legs) that a page moves itself,
  // e.g. along the Rover trail. place(x, y) puts his paws at that point.
  function walker(container, opts) {
    opts = opts || {};
    var base = opts.base || 'images/maverick/', g = window.gsap, P = POSES.walk;
    var el = document.createElement('div');
    el.className = 'mv-walker';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="mv-walker__flip"><div class="mv-rig">' + WALK_LEGS.map(function (L) {
      return L.id === 'body'
        ? '<img src="' + base + 'walk-body.webp" alt="" draggable="false">'
        : '<img data-leg="' + L.id + '" src="' + base + 'walk-leg-' + L.id + '.webp" alt="" draggable="false">';
    }).join('') + '</div></div>';
    container.appendChild(el);
    var flip = el.firstChild, rig = flip.firstChild, w = 0, h = 0, facing = 1;
    function size() {
      var s = window.innerWidth < 640 ? 0.125 : 0.22;
      w = Math.round(P.w * s); h = Math.round(P.h * s);
      el.style.width = w + 'px'; el.style.height = h + 'px';
    }
    size(); window.addEventListener('resize', size);
    var gait = null, bob = null;
    if (g && !reduce) {
      var legs = WALK_LEGS.filter(function (d) { return d.id !== 'body'; }).map(function (d) {
        var leg = rig.querySelector('[data-leg="' + d.id + '"]');
        g.set(leg, { transformOrigin: d.px + '% ' + d.py + '%' });
        return { el: leg, dir: d.dir };
      });
      gait = g.timeline({ repeat: -1, paused: true });
      legs.forEach(function (l) { gait.fromTo(l.el, { rotation: -10 * l.dir }, { rotation: 10 * l.dir, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0); });
      bob = g.to(rig, { y: -2, duration: 0.15, yoyo: true, repeat: -1, ease: 'sine.inOut', paused: true });
    }
    var moving = false, stopT;
    function walking(on) {
      if (!gait || on === moving) return;
      moving = on;
      if (on) { gait.resume(); bob.resume(); }
      else { gait.pause(); bob.pause(); g.to(rig.querySelectorAll('[data-leg]'), { rotation: 0, duration: 0.25 }); g.to(rig, { y: 0, duration: 0.2 }); }
    }
    function face(dir) {
      if (!dir || dir === facing) return;
      facing = dir;
      if (g && !reduce) g.to(flip, { scaleX: dir, duration: 0.18, ease: 'power1.out' }); else flip.style.transform = 'scaleX(' + dir + ')';
    }
    // paws sit about 6% above the image's bottom edge (the ground shadow)
    function place(x, y) { el.style.transform = 'translate(' + Math.round(x - w / 2) + 'px,' + Math.round(y - h * 0.94) + 'px)'; }
    function nudge() { walking(true); clearTimeout(stopT); stopT = setTimeout(function () { walking(false); }, 180); }
    return { el: el, place: place, face: face, nudge: nudge, walking: walking, get width() { return w; } };
  }

  window.Maverick = { mount: mount, bindToggle: bindToggle, walker: walker, poses: POSES, reduceMotion: reduce };
})();
