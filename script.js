/* ==========================================================
   MOTOR - no necesitas editar este archivo.
   Todo se configura en lyrics.js
   ========================================================== */
 
/* ---------- 1) Datos a partir de LYRICS ---------- */
var WORDS = [], CHAR_TIMINGS = [], LINES_TEXT = [], HOLD_SET = [], HOLD_CYCLE = {};
 
(function buildData() {
  var cum = 0; // desplazamiento acumulado cuando CASCADE esta activo
  for (var li = 0; li < LYRICS.length; li++) {
    var texts = [];
    for (var wi = 0; wi < LYRICS[li].length; wi++) {
      var w = LYRICS[li][wi];
      var text = w[0];
      var start = w[1] * TIME_SCALE + (CASCADE ? cum : 0);
      var dur = w[2] * TIME_SCALE + DURATION_EXTRA;
      if (CASCADE) cum += DURATION_EXTRA;
      var style = w[3] || 'normal', font = w[4] || 'garamond', hold = w[5];
      var idx = WORDS.length;
      WORDS.push([text, start, dur, li, style, font]);
      texts.push(text);
      var chars = Array.from(text), n = chars.length, list = [], c;
      if (hold) {
        var step = (dur * 0.25) / n;
        for (c = 0; c < n; c++) list.push({ c: chars[c], t: start + c * step, hold: c === n - 1 });
        var remaining = start + dur - (start + (n - 1) * step);
        HOLD_SET.push(idx);
        HOLD_CYCLE[idx] = (typeof hold === 'number') ? hold : Math.min(2, Math.max(0.6, remaining / 1.5));
      } else {
        var step2 = dur / n;
        for (c = 0; c < n; c++) list.push({ c: chars[c], t: start + c * step2, hold: false });
      }
      CHAR_TIMINGS.push(list);
    }
    LINES_TEXT.push(texts.join(' '));
  }
})();
 
var LINES = [];
for (var i = 0; i < WORDS.length; i++) {
  var l = WORDS[i][3];
  if (!LINES[l]) LINES[l] = [];
  LINES[l].push(i);
}
 
var lastWord = WORDS[WORDS.length - 1];
var OUTRO_T = (OUTRO_AT !== null && OUTRO_AT !== undefined) ? OUTRO_AT : (lastWord[1] + lastWord[2] + 2.5);
 
/* ---------- 2) Estado ---------- */
var aud = document.getElementById('aud');
var activeLine = -1, inTransition = false, litSet = {}, heartsGone = false;
var offset = 0.0, startTime = null, usingTimer = false, holdingWW = null;
var showClock = false, outroShown = false, started = false;
var audStart = AUDIO_START; // segundo real del MP3 donde empieza la letra (se ajusta solo)
 
// Si el MP3 es mas corto que AUDIO_START, empieza desde 0
function pickStart() {
  return (isFinite(aud.duration) && aud.duration <= AUDIO_START + 1) ? 0 : AUDIO_START;
}
 
function $(id) { return document.getElementById(id); }
 
$('introTitle').textContent = TITLE;
$('introSub').textContent = SUBTITLE;
$('introFor').textContent = 'Para ' + DEDICATION_TO;
$('outTo').textContent = DEDICATION_TO;
$('outMsg').textContent = DEDICATION_MSG;
document.title = TITLE + ' - ' + SUBTITLE;
 
function getT() {
  if (!usingTimer) {
    if (aud.paused || aud.ended) return -1;
    return (aud.currentTime - audStart) + offset;
  }
  if (startTime === null) return -1;
  return ((performance.now() - startTime) / 1000) + offset;
}
 
/* ==========================================================
   ESPACIO: estrellas, corazones, estrellas fugaces
   ========================================================== */
var cv = $('space'), cx = cv.getContext('2d');
var W = 0, H = 0, stars = [], hearts = [], shooters = [], lastTs = 0, nextShoot = 2500;
var STAR_COLS = ['255,255,255', '200,220,255', '255,205,228', '230,212,255'];
 
function rnd(a, b) { return a + Math.random() * (b - a); }
 
function initSpace() {
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; H = window.innerHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  stars = [];
  var n = Math.min(Math.floor(W * H / 3200), 750);
  for (var k = 0; k < n; k++) {
    var layer = Math.random();
    stars.push({
      x: rnd(0, W), y: rnd(0, H),
      r: layer < .7 ? rnd(.3, .9) : (layer < .93 ? rnd(.9, 1.5) : rnd(1.5, 2.3)),
      sp: 2 + layer * 9,
      a: rnd(.4, 1), tw: rnd(.4, 2.2), ph: rnd(0, 6.28),
      col: STAR_COLS[Math.floor(Math.random() * STAR_COLS.length)]
    });
  }
  hearts = [];
  for (var h = 0; h < 16; h++) {
    hearts.push({ x: rnd(0, W), y: rnd(0, H), s: rnd(10, 26), sp: rnd(4, 14), a: rnd(.08, .25), ph: rnd(0, 6.28), dx: rnd(-6, 6) });
  }
}
 
function spawnShooter() {
  var x = rnd(W * .3, W * 1.05), y = rnd(-20, H * .45);
  var ang = rnd(.45, .75); // radianes hacia abajo-izquierda
  var sp = rnd(650, 950);
  shooters.push({ x: x, y: y, vx: -Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 0, max: rnd(.7, 1.2), len: rnd(90, 190) });
}
 
function drawSpace(ts) {
  var dt = Math.min((ts - lastTs) / 1000, .1); lastTs = ts;
  cx.clearRect(0, 0, W, H);
  var s, a, k;
  for (k = 0; k < stars.length; k++) {
    s = stars[k];
    s.x -= s.sp * dt * .35; s.y -= s.sp * dt * .1;
    if (s.x < -3) s.x = W + 3;
    if (s.y < -3) s.y = H + 3;
    a = s.a * (.55 + .45 * Math.sin(ts / 1000 * s.tw + s.ph));
    cx.fillStyle = 'rgba(' + s.col + ',' + a.toFixed(3) + ')';
    cx.beginPath(); cx.arc(s.x, s.y, s.r, 0, 6.2832); cx.fill();
    if (s.r > 1.4) {
      cx.fillStyle = 'rgba(' + s.col + ',' + (a * .18).toFixed(3) + ')';
      cx.beginPath(); cx.arc(s.x, s.y, s.r * 3.6, 0, 6.2832); cx.fill();
    }
  }
  // corazones de polvo estelar
  for (k = 0; k < hearts.length; k++) {
    var h = hearts[k];
    h.y -= h.sp * dt; h.x += h.dx * dt;
    if (h.y < -30) { h.y = H + 30; h.x = rnd(0, W); }
    a = h.a * (.6 + .4 * Math.sin(ts / 1000 * .9 + h.ph));
    cx.font = h.s + 'px serif';
    cx.fillStyle = 'rgba(255,120,175,' + a.toFixed(3) + ')';
    cx.fillText('♥', h.x, h.y);
  }
  // estrellas fugaces
  nextShoot -= dt * 1000;
  if (nextShoot <= 0) { spawnShooter(); nextShoot = rnd(3000, 7500); }
  for (k = shooters.length - 1; k >= 0; k--) {
    var sh = shooters[k];
    sh.life += dt; sh.x += sh.vx * dt; sh.y += sh.vy * dt;
    var f = 1 - sh.life / sh.max;
    if (f <= 0) { shooters.splice(k, 1); continue; }
    var nx = sh.vx / Math.hypot(sh.vx, sh.vy), ny = sh.vy / Math.hypot(sh.vx, sh.vy);
    var tx = sh.x - nx * sh.len, ty = sh.y - ny * sh.len;
    var g = cx.createLinearGradient(sh.x, sh.y, tx, ty);
    g.addColorStop(0, 'rgba(255,255,255,' + f.toFixed(3) + ')');
    g.addColorStop(.3, 'rgba(255,190,225,' + (f * .5).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(255,190,225,0)');
    cx.strokeStyle = g; cx.lineWidth = 2; cx.lineCap = 'round';
    cx.beginPath(); cx.moveTo(sh.x, sh.y); cx.lineTo(tx, ty); cx.stroke();
  }
  requestAnimationFrame(drawSpace);
}
 
/* ==========================================================
   COLLAGE DE FOTOS
   ========================================================== */
// [left %, top %, rotacion, escala]
var SLOTS_LAND = [
  [3, 6, -6, 1], [81, 5, 5, 1], [2, 37, 4, .95], [84, 36, -5, .95], [4, 67, -4, 1],
  [80, 66, 6, 1], [21, 2, 3, .85], [62, 2, -4, .85], [19, 76, -3, .85], [62, 77, 5, .85]
];
var SLOTS_PORT = [
  [3, 3, -5, 1], [36, 1, 4, 1], [70, 4, -4, 1], [3, 80, 4, 1], [36, 82, -3, 1], [70, 79, 5, 1]
];
 
var PH = [], frames = [], frameFoto = [], revealed = 0, nextPhoto = 0, rrSlot = 0, isPortrait = false;
 
function normPhotos() {
  PH = PHOTOS.map(function (p) { return (typeof p === 'string') ? { src: p, caption: '' } : p; });
}
 
function fillFrame(f, ph) {
  var pol = f.querySelector('.pol'), img = f.querySelector('img'), cap = f.querySelector('.cap');
  cap.textContent = (ph && ph.caption) || '';
  if (!ph || !ph.src) { pol.classList.add('ph'); img.removeAttribute('src'); return; }
  pol.classList.remove('ph');
  img.onerror = function () { pol.classList.add('ph'); };
  img.src = ph.src;
}
 
function rebuildCollage() {
  var box = $('collage');
  box.innerHTML = ''; frames = []; frameFoto = [];
  isPortrait = window.innerWidth < window.innerHeight;
  var slots = isPortrait ? SLOTS_PORT : SLOTS_LAND;
  var used = PH.length ? Math.min(slots.length, PH.length) : slots.length;
  for (var k = 0; k < used; k++) {
    var sl = slots[k];
    var f = document.createElement('div');
    f.className = 'frame';
    f.style.left = sl[0] + '%'; f.style.top = sl[1] + '%';
    f.style.setProperty('--r', sl[2] + 'deg');
    f.style.setProperty('--s', sl[3]);
    f.innerHTML = '<div class="pol" style="--d:' + (-Math.random() * 7).toFixed(2) + 's">' +
      '<div class="imgw"><img alt=""><div class="phtxt"><b>♥</b>tu foto aquí</div></div>' +
      '<div class="cap"></div></div>';
    fillFrame(f, PH[k] || null);
    frameFoto.push(k);
    if (k < revealed) { f.classList.add('instant', 'show'); }
    box.appendChild(f);
    frames.push(f);
  }
  nextPhoto = frames.length;
  rrSlot = 0;
}
 
function revealUpTo(n) {
  n = Math.min(n, frames.length);
  for (var k = revealed; k < n; k++) frames[k].classList.add('show');
  if (n > revealed) revealed = n;
}
 
// Si hay mas fotos que marcos, se van turnando
function rotatePhotos() {
  if (!started || revealed < frames.length || PH.length <= frames.length || !frames.length) return;
  var slot = rrSlot++ % frames.length;
  var f = frames[slot], pol = f.querySelector('.pol');
  pol.classList.add('swap');
  setTimeout(function () {
    var idx = nextPhoto % PH.length; nextPhoto++;
    frameFoto[slot] = idx;
    fillFrame(f, PH[idx]);
    pol.classList.remove('swap');
  }, 650);
}
setInterval(rotatePhotos, 6000);
 
window.addEventListener('resize', function () {
  initSpace();
  if ((window.innerWidth < window.innerHeight) !== isPortrait) rebuildCollage();
});
 
/* ==========================================================
   EFECTOS DE LETRA
   ========================================================== */
var hs = document.createElement('style');
hs.textContent = '@keyframes hf{0%{transform:translateY(0) scale(.4);opacity:0}10%{opacity:1;transform:translateY(-20px) scale(1)}100%{transform:translateY(-170px) translateX(var(--dx)) scale(.5);opacity:0}}';
document.head.appendChild(hs);
 
function spawnHearts(src) {
  if (!src) return;
  var r = src.getBoundingClientRect(), emo = ["♥", "❤", "♥", "♡"];
  for (var k = 0; k < 12; k++) {
    (function (k) {
      setTimeout(function () {
        var h = document.createElement('span');
        h.textContent = emo[Math.floor(Math.random() * emo.length)];
        var dx = (Math.random() - .5) * 120;
        h.style.cssText = 'position:fixed;pointer-events:none;z-index:200;left:' + (r.left + Math.random() * r.width) +
          'px;top:' + (r.top + 5) + 'px;font-size:' + (.9 + Math.random() * 1.4) +
          'rem;color:rgba(255,' + (80 + Math.floor(Math.random() * 80)) + ',150,' + (.55 + Math.random() * .45) +
          ');text-shadow:0 0 12px rgba(255,92,157,.8);animation:hf 2.2s ease-out forwards;--dx:' + dx + 'px;';
        document.body.appendChild(h);
        setTimeout(function () { h.remove(); }, 2300);
      }, k * 140);
    })(k);
  }
}
 
function renderLine(lineIdx) {
  var el = $('cur'); el.innerHTML = '';
  var wi2 = LINES[lineIdx];
  for (var wi = 0; wi < wi2.length; wi++) {
    if (wi > 0) el.appendChild(document.createTextNode(' '));
    var wdata = WORDS[wi2[wi]], typeCls = wdata[4] || 'normal', fontCls = wdata[5] || 'garamond';
    var ww = document.createElement('span');
    ww.className = 'ww'; ww.setAttribute('data-wi', wi2[wi]);
    var chars = CHAR_TIMINGS[wi2[wi]];
    for (var ci = 0; ci < chars.length; ci++) {
      var sp = document.createElement('span');
      sp.className = 'ch ' + typeCls + ' ' + fontCls;
      sp.textContent = chars[ci].c;
      sp.setAttribute('data-wi', wi2[wi]); sp.setAttribute('data-ci', ci);
      ww.appendChild(sp);
    }
    el.appendChild(ww);
  }
}
 
function renderNexts(lineIdx) {
  var c = $('nexts'); c.innerHTML = '';
  var cs = ['n1', 'n2', 'n3'];
  for (var j = 0; j < 3; j++) {
    var ni = lineIdx + j + 1;
    if (ni < LINES_TEXT.length) {
      var d = document.createElement('div');
      d.className = cs[j]; d.textContent = LINES_TEXT[ni];
      c.appendChild(d);
    }
  }
}
 
function stopHolding() {
  if (holdingWW) {
    holdingWW.classList.remove('holding');
    holdingWW.style.removeProperty('--hd');
    holdingWW = null;
  }
}
 
function setActiveLine(idx) {
  var wrap = $('wrap'); inTransition = true;
  function doRender() {
    stopHolding();
    activeLine = idx; heartsGone = false; litSet = {};
    $('stage').style.opacity = '1';
    renderLine(idx); renderNexts(idx);
    revealUpTo(Math.ceil((idx + 1) * frames.length / LINES.length));
    wrap.className = ''; void wrap.offsetWidth; wrap.className = 'in-up';
    setTimeout(function () { inTransition = false; }, 500);
  }
  if (activeLine >= 0) { wrap.className = 'out-up'; setTimeout(doRender, 380); }
  else doRender();
}
 
function showOutro() {
  if (outroShown) return;
  outroShown = true;
  $('stage').style.opacity = '0';
  revealUpTo(frames.length);
  $('outro').classList.add('show');
  setTimeout(function () { spawnHearts($('outHeart')); }, 500);
  setTimeout(function () { spawnHearts($('outHeart')); }, 2200);
}
 
/* ---------- Bucle principal ---------- */
function tick() {
  var t = getT();
  if (showClock) $('clock').textContent = (t < 0 ? 0 : t).toFixed(2) + 's';
  if (t < 0) { if (started && !usingTimer && aud.ended && aud.currentTime > audStart + 1) showOutro(); return; }
  if (t >= OUTRO_T) showOutro();
 
  var found = -1;
  for (var li = 0; li < LINES.length; li++) {
    var firstT = CHAR_TIMINGS[LINES[li][0]][0].t;
    var lw = WORDS[LINES[li][LINES[li].length - 1]];
    var lineEnd = (li + 1 < LINES.length) ? CHAR_TIMINGS[LINES[li + 1][0]][0].t : lw[1] + lw[2] + 1.5;
    if (t >= firstT && t < lineEnd) { found = li; break; }
  }
  if (found !== -1 && found !== activeLine && !inTransition && !outroShown) setActiveLine(found);
 
  if (activeLine >= 0) {
    var wi2 = LINES[activeLine];
    for (var wi = 0; wi < wi2.length; wi++) {
      var idx = wi2[wi], chars = CHAR_TIMINGS[idx], typeCls = WORDS[idx][4];
      var isHold = HOLD_SET.indexOf(idx) !== -1;
      for (var ci = 0; ci < chars.length; ci++) {
        var key = idx + '_' + ci;
        if (!litSet[key] && t >= chars[ci].t) {
          litSet[key] = true;
          var sp = document.querySelector('.ch[data-wi="' + idx + '"][data-ci="' + ci + '"]');
          if (sp) {
            sp.classList.add('lit');
            if (!isHold && ci === 0 && holdingWW) stopHolding();
            if (isHold && chars[ci].hold) {
              var ww = document.querySelector('.ww[data-wi="' + idx + '"]');
              if (ww) {
                stopHolding(); holdingWW = ww;
                ww.style.setProperty('--hd', (HOLD_CYCLE[idx] || 1.2) + 's');
                ww.classList.add('holding');
              }
            }
            if (typeCls === 'passion' && ci === 0 && !heartsGone) {
              heartsGone = true;
              (function (src) {
                setTimeout(function () { spawnHearts(src); }, 80);
                setTimeout(function () { spawnHearts(src); }, 1000);
              })(sp);
            }
          }
        }
      }
    }
  }
}
setInterval(tick, 35);
 
/* ==========================================================
   AUDIO Y CONTROLES
   ========================================================== */
function tryLoadAudio() {
  var fi = 0;
  function useTimer() { usingTimer = true; startTime = performance.now(); }
  function next() {
    if (fi >= AUDIO_FILES.length) { useTimer(); return; }
    aud.src = AUDIO_FILES[fi++]; aud.load();
    function onReady() {
      aud.removeEventListener('canplay', onReady); aud.removeEventListener('error', onErr);
      audStart = pickStart();
      aud.currentTime = audStart;
      aud.play().catch(useTimer);
    }
    function onErr() {
      aud.removeEventListener('canplay', onReady); aud.removeEventListener('error', onErr);
      next();
    }
    aud.addEventListener('canplay', onReady);
    aud.addEventListener('error', onErr);
  }
  next();
}
 
function startShow() {
  started = true;
  $('intro').style.opacity = '0';
  setTimeout(function () { $('intro').style.display = 'none'; }, 1300);
  tryLoadAudio();
}
$('btn').addEventListener('click', startShow);
$('replay').addEventListener('click', function () { location.reload(); });
 
var syncT = null;
function showSync() {
  var el = $('sync');
  el.textContent = 'sync ' + (offset >= 0 ? '+' : '') + offset.toFixed(1) + 's  [ ]';
  el.className = 'glow';
  clearTimeout(syncT);
  syncT = setTimeout(function () { el.className = ''; }, 2500);
}
document.addEventListener('keydown', function (e) {
  if (e.key === '[') { offset -= 0.1; showSync(); }
  if (e.key === ']') { offset += 0.1; showSync(); }
  if (e.key === 't' || e.key === 'T') {
    showClock = !showClock;
    $('clock').style.display = showClock ? 'block' : 'none';
  }
});
 
// Arrastrar MP3 o fotos a la pagina
document.addEventListener('dragover', function (e) { e.preventDefault(); });
document.addEventListener('drop', function (e) {
  e.preventDefault();
  var files = Array.from(e.dataTransfer.files), addedPhotos = false;
  files.forEach(function (f) {
    if (f.type.indexOf('audio') === 0) {
      usingTimer = false;
      aud.src = URL.createObjectURL(f);
      aud.addEventListener('loadedmetadata', function onMeta() {
        aud.removeEventListener('loadedmetadata', onMeta);
        audStart = pickStart();
        aud.currentTime = audStart;
        aud.play();
      });
      $('hint').textContent = '♪ ' + f.name;
    } else if (f.type.indexOf('image') === 0) {
      if (!addedPhotos) { // la primera foto arrastrada reemplaza la lista por defecto si no habia fotos reales
        addedPhotos = true;
      }
      PHOTOS.push({ src: URL.createObjectURL(f), caption: '' });
    }
  });
  if (addedPhotos) { normPhotos(); rebuildCollage(); }
});
 
/* ---------- Inicio ---------- */
normPhotos();
initSpace();
rebuildCollage();
requestAnimationFrame(function (ts) { lastTs = ts; drawSpace(ts); });
 