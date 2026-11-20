/* The Rover walk: a dotted leash-red trail that winds through the Rover section
   like a walking route, with a tennis ball at each stop. As you scroll, the trail
   draws itself and Maverick walks along it (legs stepping, turning at the bends).
   The corner Maverick steps away while this one is out on the walk. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  function ballSVG(cx, cy, r) {
    return '<g class="walk__ball" transform="translate(' + cx + ' ' + cy + ')"><g class="walk__ballin">' +
      '<circle r="' + r + '" class="walk__ballfill"/>' +
      '<path d="M' + (-r * 0.8) + ' ' + (-r * 0.55) + ' Q 0 0 ' + (-r * 0.8) + ' ' + (r * 0.55) + ' M' + (r * 0.8) + ' ' + (-r * 0.55) + ' Q 0 0 ' + (r * 0.8) + ' ' + (r * 0.55) + '" class="walk__seam"/>' +
      '</g></g>';
  }

  window.RoverTrail = { init: init };

  function init(walk, opts) {
    opts = opts || {};
    var g = window.gsap, ST = window.ScrollTrigger;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var svg = walk.querySelector('.walk__svg');
    var rows = Array.prototype.slice.call(walk.querySelectorAll('.walk__row'));
    var dog = window.Maverick ? Maverick.walker(walk, { base: opts.base }) : null;
    var path, reveal, len = 0, ballAt = [], balls = [], progress = reduce ? 1 : 0, lastX = null;

    function build() {
      var W = walk.clientWidth, H = walk.clientHeight;
      var small = window.innerWidth < 640;
      var lane = small ? 12 : 26, r = small ? 22 : 40;
      var L = lane, R = W - lane;
      var wr = walk.getBoundingClientRect();
      var box = rows.map(function (el) { var b = el.getBoundingClientRect(); return { top: b.top - wr.top, bottom: b.bottom - wr.top }; });
      var bands = box.map(function (b, i) { return Math.round(((i ? box[i - 1].bottom : 0) + b.top) / 2); });
      var btn = walk.querySelector('.walk__end .btn');
      var bx = btn ? btn.getBoundingClientRect().left - wr.left + btn.offsetWidth / 2 : W / 2;

      // the route: down the left lane, then back and forth across each band (switchbacks),
      // gently wavy, rounded at the corners; it ends above the "Book me on Rover" button
      var d = 'M ' + L + ' 0', x = L, pts = [];
      bands.forEach(function (y, i) {
        var last = i === bands.length - 1;
        var toX = last ? bx : (i % 2 === 0 ? R : L);
        var dir = toX > x ? 1 : -1;
        d += ' L ' + x + ' ' + (y - r) + ' Q ' + x + ' ' + y + ' ' + (x + dir * r) + ' ' + y;   // corner into the band
        var start = x + dir * r, end = last ? toX : toX - dir * r;
        var n = Math.max(1, Math.round(Math.abs(end - start) / (small ? 70 : 120)));
        for (var k = 1; k <= n; k++) {                                                          // wavy crossing
          var x1 = start + (end - start) * k / n, xm = start + (end - start) * (k - 0.5) / n;
          d += ' Q ' + xm.toFixed(1) + ' ' + (y + (k % 2 ? -6 : 6)) + ' ' + x1.toFixed(1) + ' ' + y;
        }
        pts.push({ x: start + (end - start) * (last ? 1 : 0.5), y: y });                          // the stop's tennis ball
        if (!last) {
          d += ' Q ' + toX + ' ' + y + ' ' + toX + ' ' + (y + r);                                 // corner down the side
          x = toX;
        }
      });

      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.setAttribute('width', W); svg.setAttribute('height', H);
      var ballR = small ? 8 : 11;
      svg.innerHTML =
        '<defs><mask id="walk-reveal" maskUnits="userSpaceOnUse" x="0" y="0" width="' + W + '" height="' + H + '">' +
          '<path class="walk__reveal" d="' + d + '"/></mask></defs>' +
        '<path class="walk__trail" d="' + d + '" mask="url(#walk-reveal)"/>' +
        pts.map(function (p) { return ballSVG(p.x.toFixed(1), p.y, ballR); }).join('');
      path = svg.querySelector('.walk__trail');
      reveal = svg.querySelector('.walk__reveal');
      len = path.getTotalLength();
      reveal.style.strokeDasharray = len + ' ' + len;
      balls = Array.prototype.slice.call(svg.querySelectorAll('.walk__ball'));
      // how far along the trail each ball sits
      ballAt = pts.map(function (p) {
        var best = 0, bestD = Infinity;
        for (var s = 0; s <= len; s += 6) {
          var q = path.getPointAtLength(s), dd = (q.x - p.x) * (q.x - p.x) + (q.y - p.y) * (q.y - p.y);
          if (dd < bestD) { bestD = dd; best = s; }
        }
        return best;
      });
      lastX = null;
      update(progress, true);
    }

    function update(p, silent) {
      progress = p;
      var drawn = Math.max(0.001, p * len);
      reveal.style.strokeDashoffset = (len - drawn).toFixed(1);
      balls.forEach(function (b, i) {
        var on = drawn >= ballAt[i] - 4;
        if (on !== b.classList.contains('is-on')) {
          b.classList.toggle('is-on', on);
          if (on && g && !reduce && !silent) g.fromTo(b.firstChild, { scale: 0.2 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
        }
      });
      if (!dog) return;
      var pt = path.getPointAtLength(drawn);
      if (lastX !== null && Math.abs(pt.x - lastX) > 0.6) dog.face(pt.x > lastX ? 1 : -1);
      lastX = pt.x;
      dog.place(pt.x, pt.y);
      if (!silent) dog.nudge();
    }

    build();
    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(build, 150); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
    window.addEventListener('load', build);

    if (!g || !ST || reduce) { update(1, true); return; }
    ST.create({
      trigger: walk, start: 'top 70%', end: 'bottom 75%', scrub: 0.6,
      onUpdate: function (self) { update(self.progress); }
    });
    // the corner Maverick steps away while this one is out on the walk
    if (opts.mav) ST.create({ trigger: walk.closest('section') || walk, start: 'top 60%', end: 'bottom 40%', onToggle: function (self) { opts.mav.setAway(self.isActive); } });
  }
})();
