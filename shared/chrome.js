// Prototype chrome, modeled on Chris's mh-home-intro picker: sets the colorway before first paint
// (from ?c=, then the last one chosen, then Navy), and builds the top-left concept + colorway switcher.
// Load in <head> after base.css.
window.SavingsChrome = (() => {
  const CONCEPTS = [
    { href: '../scroll/index.html', label: 'Scroll' },
    { href: '../spotlight/index.html', label: 'Spotlight' },
    { href: '../staircase/index.html', label: 'Staircase' },
  ];
  const COLORWAYS = [
    { id: 'navy', label: 'Navy', swatch: 'linear-gradient(135deg, #012346 45%, #065998)' },
    { id: 'navy-solid', label: 'Navy Solid', swatch: '#012346' },
    { id: 'neutral', label: 'Neutral', swatch: '#F6EFE8' },
    { id: 'sky', label: 'Sky', swatch: '#DFEEFF' },
  ];
  const KEY = 'savings-colorway';
  const store = {
    get() { try { return localStorage.getItem(KEY); } catch { return null; } },
    set(v) { try { localStorage.setItem(KEY, v); } catch {} },
  };
  const valid = id => COLORWAYS.some(c => c.id === id);
  const fromUrl = new URLSearchParams(location.search).get('c');
  let colorway = valid(fromUrl) ? fromUrl : valid(store.get()) ? store.get() : 'navy';
  const root = document.documentElement;
  root.dataset.colorway = colorway;
  const listeners = [];

  function setColorway(id) {
    if (!valid(id) || id === colorway) return;
    colorway = id;
    root.dataset.colorway = id;
    store.set(id);
    const q = new URLSearchParams(location.search); q.set('c', id);
    history.replaceState(null, '', '?' + q.toString() + location.hash);
    nav.querySelectorAll('[data-c]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.c === id)));
    nav.querySelectorAll('[data-href]').forEach(a => { a.href = `${a.dataset.href}?c=${id}`; });
    listeners.forEach(fn => fn(id));
  }

  const path = location.pathname.replace(/index\.html$/, '');
  const nav = document.createElement('nav');
  nav.className = 'switcher';
  nav.setAttribute('aria-label', 'Prototype');
  nav.innerHTML =
    `<a data-href="../index.html" href="../index.html?c=${colorway}">All</a>` +
    CONCEPTS.map(c => {
      const dir = c.href.split('/')[1];
      const here = path.endsWith('/' + dir + '/');
      return `<a data-href="${c.href}" href="${c.href}?c=${colorway}"${here ? ' aria-current="page"' : ''}>${c.label}</a>`;
    }).join('') +
    '<span class="switcher-sep" aria-hidden="true"></span>' +
    COLORWAYS.map(c => `<button type="button" data-c="${c.id}" aria-pressed="${c.id === colorway}" aria-label="${c.label} colorway"><span class="swatch" style="background:${c.swatch}"></span><span class="lbl">${c.label}</span></button>`).join('');
  nav.addEventListener('click', e => {
    const b = e.target.closest('[data-c]');
    if (b) setColorway(b.dataset.c);
  });
  addEventListener('DOMContentLoaded', () => document.body.appendChild(nav));

  return { get colorway() { return colorway; }, setColorway, onChange: fn => listeners.push(fn) };
})();
