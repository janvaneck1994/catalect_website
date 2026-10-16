/* --------------------------------------------------------------------------
   catalect — generative hero field

   Layered contour lines around a calm centre, evoking a substrate binding
   pocket. The figure itself is deterministic: the same scaffold renders on
   every visit. It then breathes — a slow radial pulse and an even slower
   twist, both offset layer by layer so the motion travels through the stack.
   -------------------------------------------------------------------------- */
(function () {
  'use strict';

  var canvas = document.querySelector('[data-hero-field]');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var TAU = Math.PI * 2;

  var LAYERS = 118;
  var SEGMENTS = 240;

  var BREATH = 0.078;             /* radial pulse, as a fraction of radius */
  var TWIST = 0.1;                /* radians of counter-rotation */
  var BREATH_PERIOD = 6500;       /* ms for one full breath */
  var TWIST_PERIOD = 9500;
  var INTRO_MS = 850;
  var FRAME_MS = 1000 / 30;       /* the motion is slow; 30fps is plenty */
  var PAD = 3;

  /* Mulberry32 — small deterministic PRNG so the artwork never shifts. */
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Harmonics give each contour its organic wobble; phases drift layer by
     layer so the stack reads as a single sweeping volume. */
  function buildHarmonics(seed) {
    var rand = rng(seed);
    return [2, 3, 4, 6, 9].map(function (f, i) {
      return {
        freq: f,
        weight: (1 / (1 + i * 1.15)) * (0.7 + rand() * 0.6),
        phase: rand() * TAU,
        drift: (rand() - 0.5) * 9.5
      };
    });
  }

  var harmonics = buildHarmonics(20240917);
  var layers = [];
  var width = 0;
  var height = 0;

  /* Each layer is stored as offsets from the centre of the field, which lets
     a frame pulse and rotate it with two multiplies per point. */
  function buildLayers(boxW, boxH) {
    var reference = Math.min(boxW, boxH);
    var inner = reference * 0.135;
    var outer = reference * 0.465;
    var maxX = 0;
    var maxY = 0;
    var i, s;

    layers = [];

    for (i = 0; i < LAYERS; i++) {
      var t = i / (LAYERS - 1);
      var radius = inner + (outer - inner) * Math.pow(t, 0.92);
      var amp = 0.055 + 0.26 * Math.pow(t, 1.9);
      var dirs = new Float32Array((SEGMENTS + 1) * 2);

      for (s = 0; s <= SEGMENTS; s++) {
        var a = (s / SEGMENTS) * TAU;
        var n = 0;

        for (var h = 0; h < harmonics.length; h++) {
          var harm = harmonics[h];
          n += harm.weight * Math.sin(harm.freq * a + harm.phase + t * harm.drift * TAU);
        }

        /* Flatten the field along y so it sits broad rather than upright. */
        var r = radius * (1 + amp * n);
        var dx = Math.cos(a) * r;
        var dy = Math.sin(a) * r * 0.86;

        dirs[s * 2] = dx;
        dirs[s * 2 + 1] = dy;

        if (Math.abs(dx) > maxX) maxX = Math.abs(dx);
        if (Math.abs(dy) > maxY) maxY = Math.abs(dy);
      }

      layers.push({ dirs: dirs, t: t });
    }

    if (maxX <= 0 || maxY <= 0) return;

    /* Fill the box, so the figure takes its proportions from the CSS ratio. */
    var roomX = (boxW / 2 - PAD) / (1 + BREATH);
    var roomY = (boxH / 2 - PAD) / (1 + BREATH);
    var cosT = Math.cos(TWIST);
    var sinT = Math.sin(TWIST);

    var scaleX = roomX / maxX;
    var scaleY = roomY / maxY;

    /* Then measure what the twist actually costs. Taking the extremes of both
       axes together would assume one point holds both, which no point does;
       walking the points keeps the figure close to the edges. */
    var swungX = 0;
    var swungY = 0;

    for (i = 0; i < layers.length; i++) {
      var pts = layers[i].dirs;
      for (s = 0; s < pts.length; s += 2) {
        var ax = Math.abs(pts[s]) * scaleX;
        var ay = Math.abs(pts[s + 1]) * scaleY;
        var bx = ax * cosT + ay * sinT;
        var by = ax * sinT + ay * cosT;
        if (bx > swungX) swungX = bx;
        if (by > swungY) swungY = by;
      }
    }

    var room = Math.min(roomX / swungX, roomY / swungY);
    scaleX *= room;
    scaleY *= room;

    for (i = 0; i < layers.length; i++) {
      var d = layers[i].dirs;
      for (s = 0; s < d.length; s += 2) {
        d[s] *= scaleX;
        d[s + 1] *= scaleY;
      }
    }
  }

  function paint(progress, clock) {
    var cx = width / 2;
    var cy = height / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i];
      var appear = (progress - layer.t * 0.55) / 0.45;
      if (appear <= 0) continue;
      if (appear > 1) appear = 1;

      var breath = 1 + BREATH * Math.sin(clock * (TAU / BREATH_PERIOD) + layer.t * TAU * 0.9);
      var angle = TWIST * Math.sin(clock * (TAU / TWIST_PERIOD) + layer.t * TAU * 0.6);
      var ca = Math.cos(angle) * breath;
      var sa = Math.sin(angle) * breath;

      /* Mid-stack lines carry the most weight; the outer ends hold their
         weight further out and only wash out at the very edge. */
      var falloff = 1 - Math.pow(Math.abs(layer.t - 0.52) / 0.74, 2);
      if (falloff < 0.12) falloff = 0.12;

      var d = layer.dirs;
      ctx.beginPath();
      for (var s = 0; s <= SEGMENTS; s++) {
        var dx = d[s * 2];
        var dy = d[s * 2 + 1];
        var x = cx + dx * ca - dy * sa;
        var y = cy + dx * sa + dy * ca;
        if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();

      var hue = 104 - layer.t * 18;
      var light = 34 + layer.t * 14;
      ctx.strokeStyle = 'hsla(' + hue + ', 38%, ' + light + '%, ' + (0.30 * falloff * appear).toFixed(3) + ')';
      ctx.lineWidth = 0.55 + (1 - layer.t) * 0.35;
      ctx.stroke();
    }
  }

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var clock = 0;          /* advances only while animating, so pausing never jumps */
  var intro = 0;
  var lastTick = 0;
  var lastFrame = 0;
  var rafId = null;
  var painted = false;
  var inView = true;

  function frame(now) {
    rafId = requestAnimationFrame(frame);

    var delta = lastTick ? Math.min(now - lastTick, 100) : 0;
    lastTick = now;

    if (now - lastFrame < FRAME_MS) return;
    lastFrame = now;

    clock += delta;
    if (intro < 1) intro = Math.min(intro + delta / INTRO_MS, 1);

    var p = intro < 1 ? intro * intro * (3 - 2 * intro) : 1;
    paint(p, clock);
    painted = true;
  }

  function play() {
    if (rafId !== null || reduced.matches) return;
    if (!inView || document.visibilityState !== 'visible') return;
    lastTick = 0;
    lastFrame = 0;
    rafId = requestAnimationFrame(frame);
  }

  function pause() {
    if (rafId === null) return;
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  function render(restart) {
    var rect = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(rect.width, 1);
    height = Math.max(rect.height, 1);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    buildLayers(width, height);

    if (restart) intro = 0;

    if (reduced.matches || document.visibilityState !== 'visible') {
      intro = 1;
      paint(1, clock);
      painted = true;
      return;
    }

    if (rafId === null) {
      paint(intro < 1 ? 0 : 1, clock);
      play();
    }
  }

  /* Whatever happens with timers, the hero must never sit empty. */
  setTimeout(function () { if (!painted) { intro = 1; paint(1, clock); painted = true; } }, 500);

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { render(false); }, 150);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') play(); else pause();
  });

  if (typeof reduced.addEventListener === 'function') {
    reduced.addEventListener('change', function () {
      if (reduced.matches) { pause(); intro = 1; paint(1, clock); } else play();
    });
  }

  /* No reason to animate a hero that has been scrolled past. */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (inView) play(); else pause();
    }, { threshold: 0 }).observe(canvas);
  }

  render(true);
})();
