// Day 1 → $2.39. The module is pinned for ~2.4 screens of scroll; progress p (0–1) drives everything.
// Data from the ROI study: starting mix 47/41/12, savings shares 60.5% moderate / 39.8% high, $2.39 per $1.
// Illustrative only: WHICH dots move and WHEN. Swap MOVES for the study's transition data when research shares it.
(() => {
  const $ = id => document.getElementById(id);
  const clamp01 = u => Math.max(0, Math.min(1, u));
  const section = $('ss'), field = $('ss-field');

  // Starting groups: 0 low, 1 moderate, 2 high
  const START = Array.from({ length: 100 }, (_, i) => (i < 47 ? 0 : i < 88 ? 1 : 2));
  // [dot index, group it moves to, progress at which it moves]
  const MOVES = [
    [88, 1, .16], [89, 1, .20], [90, 1, .24], [91, 1, .28], [92, 1, .32],   // high → moderate
    [93, 0, .36], [94, 0, .40],                                             // high → low
    ...Array.from({ length: 15 }, (_, k) => [47 + k, 0, .46 + k * .026]),   // moderate → low
    [0, 1, .52], [62, 2, .64], [1, 1, .74],                                 // a few get worse
  ];
  const moveOf = {};
  MOVES.forEach(m => { moveOf[m[0]] = m; });
  const COLOR = ['var(--low)', 'var(--mod)', 'var(--high)'];
  const COLS = 9;

  const CAPTIONS = [
    { at: 0,   t: 'Day 1: everyone starts where they are.',
      b: 'Nearly half of members start with low needs, about 4 in 10 with moderate needs, and roughly 1 in 8 with high-severity needs. No savings yet.' },
    { at: .12, t: 'High-severity members improve first.',
      b: 'Each high-severity member who steps down saves the most, about $7,147 a year on average. But they are a small group.' },
    { at: .44, t: 'Then the moderate group adds up.',
      b: 'Moderate members save less each, about $3,180 a year, but there are more than three times as many of them. Some members may get worse, and the ROI accounts for that too.' },
    { at: .88, t: 'After a year of care: $2.39 for every $1.',
      b: 'About 60% of the savings came from moderate members. Based on health care claims alone, before any productivity gains.' },
  ];

  const dots = START.map(g => {
    const el = document.createElement('i');
    el.className = 'ss-dot';
    el.style.background = COLOR[g];
    field.appendChild(el);
    return el;
  });

  let geo = null, lastCap = -1, lastP = -1;

  function layout() {
    const W = field.clientWidth;
    const gap = parseFloat(getComputedStyle(field).columnGap) || 16;
    const zoneW = (W - 2 * gap) / 3;
    const pad = Math.max(6, zoneW * .04);
    const cell = (zoneW - 2 * pad) / COLS;
    const size = Math.min(16, cell * .7);
    const rows = 7;   // the largest a zone gets in this sequence is 62 dots
    field.style.setProperty('--field-h', Math.ceil(pad * 2 + rows * cell) + 'px');
    dots.forEach(d => { d.style.width = d.style.height = size.toFixed(1) + 'px'; });
    geo = { gap, zoneW, pad, cell, size };
    lastP = -1;
    render(progress());
  }

  function progress() {
    const r = section.getBoundingClientRect();
    const run = section.offsetHeight - innerHeight;
    return run > 0 ? clamp01(-r.top / run) : 0;
  }

  function render(p) {
    if (!geo || Math.abs(p - lastP) < .0005) return;
    lastP = p;
    const { gap, zoneW, pad, cell, size } = geo;
    const counts = [0, 0, 0];
    START.forEach((g, i) => {
      const m = moveOf[i];
      const now = m && p >= m[2] ? m[1] : g;
      const slot = counts[now]++;
      const x = now * (zoneW + gap) + pad + (slot % COLS) * cell + (cell - size) / 2;
      const y = pad + Math.floor(slot / COLS) * cell + (cell - size) / 2;
      dots[i].style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
    counts.forEach((n, k) => { $('c' + k).textContent = n; });
    field.setAttribute('aria-label', `100 members: ${counts[0]} low, ${counts[1]} moderate and ${counts[2]} high severity`);

    const high = 39.8 * clamp01((p - .14) / .30);
    const mod = 60.5 * clamp01((p - .44) / .42);
    $('ss-roi').textContent = '$' + (2.39 * (high + mod) / 100.3).toFixed(2);
    $('bar-mod').style.width = mod + '%';
    $('bar-high').style.width = high + '%';
    $('pct-mod').textContent = Math.floor(mod) + '%';   // 60.5% reads as "about 60%", as in the study
    $('pct-high').textContent = Math.round(high) + '%';

    const month = Math.round(12 * clamp01(p / .9));
    $('ss-month').textContent = month === 0 ? 'Day 1' : 'Month ' + month;
    $('ss-fill').style.width = clamp01(p / .9) * 100 + '%';
    $('ss-hint').classList.toggle('gone', p > .04);

    let c = 0;
    CAPTIONS.forEach((cap, k) => { if (p >= cap.at) c = k; });
    if (c !== lastCap) {
      lastCap = c;
      $('ss-cap-title').textContent = CAPTIONS[c].t;
      $('ss-cap-body').textContent = CAPTIONS[c].b;
    }
  }

  // ?p=0..1 freezes the sequence at that point (for screenshots and review)
  const forced = new URLSearchParams(location.search).get('p');
  let ticking = false;
  const onScroll = () => {
    if (forced !== null || ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; render(progress()); });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', layout);
  layout();
  if (forced !== null) { lastP = -1; render(clamp01(+forced)); }
})();
