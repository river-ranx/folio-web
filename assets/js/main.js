import { I18N } from './i18n.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/* ───────────── i18n ───────────── */
function detectInitialLang() {
  const saved = localStorage.getItem('lang');
  return saved && I18N[saved] ? saved : 'en';   // 默认英文，用户手动切换后记住
}

function applyI18n(lang) {
  const dict = I18N[lang] || I18N.en;
  root.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = dict['document.title'];
  $('meta[name="description"]')?.setAttribute('content', dict['document.description']);
  $('meta[property="og:title"]')?.setAttribute('content', dict['document.title']);
  $('meta[property="og:description"]')?.setAttribute('content', dict['document.description']);

  $$('[data-i18n]').forEach((el) => {
    const val = dict[el.getAttribute('data-i18n')];
    if (typeof val === 'string') el.textContent = val;
  });
  $$('[data-i18n-aria]').forEach((el) => {
    const val = dict[el.getAttribute('data-i18n-aria')];
    if (typeof val === 'string') el.setAttribute('aria-label', val);
  });

  // Folio Pro 直装包：GitHub Release 最新版的固定文件名资产，发新版时保持资产名 Folio-Pro.zip 即可
  const PRO_URL = 'https://github.com/river-ranx/folio-web/releases/latest/download/Folio-Pro.zip';
  $$('a[data-pro]').forEach((a) => { a.href = PRO_URL; });

  // App Store 落地页语言跟随站点语言
  const storeUrl = 'https://apps.apple.com/us/app/folio-universal-viewer/id6769624913?mt=12';
  $$('a[data-appstore]').forEach((a) => { a.href = lang === 'zh' ? storeUrl + '&l=zh-Hans-CN' : storeUrl; });

  // 格式跑马灯（复制一份实现无缝循环）
  const track = $('#formatsTrack');
  if (track) {
    const list = dict['formats.list'] || [];
    track.innerHTML = [...list, ...list].map((n) => `<span class="format-chip"><span class="dot"></span>${n}</span>`).join('');
  }

  $('#langLabel').textContent = dict['lang.label'];
  $$('#langMenu button[data-lang]').forEach((b) => b.setAttribute('aria-current', b.dataset.lang === lang ? 'true' : 'false'));
}

function setLang(lang) {
  if (!I18N[lang]) return;
  localStorage.setItem('lang', lang);
  applyI18n(lang);
  closeLangMenu();
}

const langSwitch = $('#langSwitch');
function closeLangMenu() {
  langSwitch.classList.remove('open');
  $('#langTrigger').setAttribute('aria-expanded', 'false');
}
$('#langTrigger').addEventListener('click', (e) => {
  e.stopPropagation();
  const open = langSwitch.classList.toggle('open');
  $('#langTrigger').setAttribute('aria-expanded', open ? 'true' : 'false');
});
$$('#langMenu button[data-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));
document.addEventListener('click', (e) => { if (!langSwitch.contains(e.target)) closeLangMenu(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeLangMenu(); closeMobileMenu(); } });

applyI18n(detectInitialLang());

/* ───────────── 主题色：点色块，整个站点 + 3D 场景一起换 ───────────── */
const ACCENTS = { cream: '#FF9A4A', ink: '#8E9BFF', snow: '#5BB2FF', moss: '#8ED36A' };
let theme = localStorage.getItem('accent');
if (!ACCENTS[theme]) theme = 'cream';

function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function applyAccent(name) {
  theme = name;
  const [r, g, b] = hexRgb(ACCENTS[name]);
  const lift = (c) => Math.round(c + (255 - c) * 0.18);
  const s = root.style;
  s.setProperty('--accent', ACCENTS[name]);
  s.setProperty('--accent-strong', `rgb(${lift(r)},${lift(g)},${lift(b)})`);
  s.setProperty('--accent-soft', `rgba(${r},${g},${b},0.14)`);
  s.setProperty('--accent-glow', `rgba(${r},${g},${b},0.32)`);
  s.setProperty('--link', `rgb(${lift(r)},${lift(g)},${lift(b)})`);
  $$('.swatch').forEach((el) => el.setAttribute('aria-checked', el.dataset.theme === name ? 'true' : 'false'));
}
applyAccent(theme);

$$('.swatch').forEach((el) => el.addEventListener('click', () => {
  localStorage.setItem('accent', el.dataset.theme);
  applyAccent(el.dataset.theme);
  ctrl?.setTheme(el.dataset.theme);
  S.screen = `theme-${theme}`;
  pushState();
  $('#themes .slide-fig')?.setAttribute('src', `assets/screens/theme-${theme}.jpg`);
}));

/* ───────────── 导航 / 菜单 ───────────── */
const navbar = $('.navbar');
function closeMobileMenu() {
  $('#mobileToggle').classList.remove('open');
  $('#mobileToggle').setAttribute('aria-expanded', 'false');
  $('#mobileMenu').classList.remove('open');
}
$('#mobileToggle').addEventListener('click', () => {
  const open = $('#mobileToggle').classList.toggle('open');
  $('#mobileToggle').setAttribute('aria-expanded', open ? 'true' : 'false');
  $('#mobileMenu').classList.toggle('open', open);
});
$$('#mobileMenu a').forEach((a) => a.addEventListener('click', closeMobileMenu));

/* ───────────── FAQ ───────────── */
$$('.faq-q').forEach((btn) => btn.addEventListener('click', () => {
  const item = btn.parentElement, wasOpen = item.classList.contains('open');
  $$('.faq-item.open').forEach((el) => { el.classList.remove('open'); $('.faq-q', el).setAttribute('aria-expanded', 'false'); });
  if (!wasOpen) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
}));

/* ───────────── 滚动显形 / 卡片聚光 ───────────── */
const io = new IntersectionObserver((entries) => entries.forEach((en) => {
  if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
}), { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
$$('.reveal').forEach((el) => io.observe(el));

document.addEventListener('pointermove', (e) => {
  const g = e.target.closest?.('.glass');
  if (!g) return;
  const r = g.getBoundingClientRect();
  g.style.setProperty('--mx', `${e.clientX - r.left}px`);
  g.style.setProperty('--my', `${e.clientY - r.top}px`);
}, { passive: true });

/* ───────────── 滚动 → 镜头状态机 ─────────────
   页面只有一个 3D 画布。这里把「视口中线落在哪一节」翻译成场景状态，
   场景内部自己做阻尼插值，所以任意跳转（锚点、刷新、拖滚动条）都不会突兀。 */
const canvas = $('#stage');
const S = { layout: 'hero', conv: 0, screen: 'welcome', yaw: 0 };
let ctrl = null;
function pushState() { if (ctrl) Object.assign(ctrl.state, S); }

const sections = $$('[data-scene]');
const stageEl = $('.stage');
const slides = $$('.slide', stageEl);
const railBtns = $$('#rail button');
const convEl = $('#converge');
const YAW = [-0.16, 0.12, -0.12, 0.15, -0.1];
let metrics = [];
let activeSlide = -1;

function measure() {
  metrics = sections.map((el) => {
    const r = el.getBoundingClientRect();
    return { el, scene: el.dataset.scene, top: r.top + scrollY, h: r.height };
  });
}

function setSlide(i) {
  if (i === activeSlide) return;
  activeSlide = i;
  slides.forEach((s, k) => s.classList.toggle('active', k === i));
  railBtns.forEach((b, k) => b.classList.toggle('on', k === i));
}

function update() {
  navbar.classList.toggle('scrolled', scrollY > 12);
  if (!metrics.length) return;
  const vh = innerHeight, mid = scrollY + vh * 0.5;
  let m = metrics[0];
  for (const x of metrics) if (x.top <= mid) m = x;
  const p = clamp((scrollY - m.top) / Math.max(1, m.h - vh));

  switch (m.scene) {
    case 'hero': Object.assign(S, { layout: 'hero', conv: 0, screen: 'welcome', yaw: 0 }); break;
    case 'converge': Object.assign(S, { layout: 'hero', conv: p, screen: 'welcome', yaw: 0 }); break;
    case 'stage':
      if (m.el === stageEl) {
        const i = Math.min(slides.length - 1, Math.floor(p * slides.length));
        setSlide(i);
        Object.assign(S, { layout: 'stage', conv: 1, screen: slides[i].dataset.screen, yaw: YAW[i] || 0 });
      } else {
        Object.assign(S, { layout: 'stage', conv: 1, screen: `theme-${theme}`, yaw: 0.1 });
      }
      break;
    case 'cta': Object.assign(S, { layout: 'hero', conv: 0, screen: 'welcome', yaw: 0 }); break;
    default: S.layout = 'ambient'; S.conv = 1; S.yaw = 0;
  }
  // 汇聚章节的文案随进度浮现；画布在内容密集的章节里退到背景
  const cm = metrics.find((x) => x.el === convEl);
  if (cm) convEl.style.setProperty('--p', clamp((scrollY - cm.top) / Math.max(1, cm.h - vh)).toFixed(3));
  canvas.classList.toggle('dim', m.scene === 'ambient');
  pushState();
}

let ticking = false;
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; update(); }); } }, { passive: true });
addEventListener('resize', () => { measure(); update(); });
new ResizeObserver(() => { measure(); update(); }).observe(document.body);
document.fonts?.ready.then(() => { measure(); update(); });

railBtns.forEach((b) => b.addEventListener('click', () => {
  const m = metrics.find((x) => x.el === stageEl);
  const i = +b.dataset.i;
  scrollTo({ top: m.top + ((i + 0.5) / slides.length) * (m.h - innerHeight), behavior: 'smooth' });
}));

/* ───────────── 悬停标签 / 打开提示 ───────────── */
const tip = $('#tip'), tipName = $('#tipName'), toast = $('#toast'), toastName = $('#toastName');
let toastTimer = 0;
function onHover(info, x, y) {
  if (!info) { tip.classList.remove('show'); return; }
  if (tipName.textContent !== info.name) tipName.textContent = info.name;
  tip.style.transform = `translate(${x + 18}px, ${y + 18}px)`;
  tip.classList.add('show');
}
function onOpen(info) {
  tip.classList.remove('show');
  toastName.textContent = info.name;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3400);
  $('#hintPlay')?.classList.add('gone');
}
addEventListener('pointerdown', () => { setTimeout(() => $('#hintPlay')?.classList.add('gone'), 1200); }, { once: true });

/* ───────────── 启动 3D（失败则降级为静态页） ───────────── */
function hasWebGL2() {
  try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
}
async function boot() {
  if (!hasWebGL2()) { root.classList.add('no-gl'); return; }
  try {
    const { createScene } = await import('./scene.js');
    ctrl = await createScene(canvas, { onHover, onOpen, onLost: () => root.classList.add('no-gl') });
    ctrl.setTheme(theme);
    pushState();
    root.classList.add('gl');
    window.__folio = ctrl;   // 便于在控制台观察：__folio.debug()
  } catch (err) {
    console.warn('[folio] 3D 场景不可用，已降级为静态页', err);
    root.classList.add('no-gl');
  }
}

function ready() {
  document.body.classList.remove('loading');
  setTimeout(() => $('#heroContent').classList.add('loaded'), 80);
}
measure(); update();
boot();
if (document.readyState === 'complete') ready(); else addEventListener('load', ready);
