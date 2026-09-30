// ===== helpers =====
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const abortError = () => new DOMException('Aborted', 'AbortError');

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(abortError());
    const id = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => { clearTimeout(id); reject(abortError()); }, { once: true });
  });
}

async function typeInto(el, text, ms, signal) {
  for (let i = 1; i <= text.length; i++) {
    el.textContent = text.slice(0, i);
    await sleep(ms + Math.random() * ms * 0.6, signal);
  }
}

// 进入视口才播放的演示：离开即中止，重新进入或切换语言时从头再来。
// reduced-motion 下不播放，停在 HTML 里写好的静态终态。
function whenVisible(el, play) {
  let ctl = null;
  const stop = () => { if (ctl) { ctl.abort(); ctl = null; } };
  const start = () => {
    stop();
    if (reduced()) return;
    ctl = new AbortController();
    play(ctl.signal).catch(() => {});
  };
  new IntersectionObserver(entries => {
    entries.forEach(e => (e.isIntersecting ? start() : stop()));
  }, { threshold: 0.35 }).observe(el);
  document.addEventListener('folio:lang', () => { if (ctl) start(); });
}

// ===== i18n =====
let currentLang = 'en';

function detectInitialLang() {
  // 默认英文；用户手动切换后记在 localStorage
  try {
    const saved = localStorage.getItem('lang');
    if (saved && I18N[saved]) return saved;
  } catch (e) {}
  return 'en';
}

// 当前语言下某个 key 的文案（英文取自 DOM 里首次读到的原文）
function t(key) {
  if (currentLang !== 'en' && I18N[currentLang][key] !== undefined) return I18N[currentLang][key];
  const el = $(`[data-i18n="${key}"]`);
  return el ? el.dataset.en : key;
}

function applyI18n(lang) {
  currentLang = lang;
  const dict = I18N[lang];
  const en = lang === 'en';
  document.documentElement.lang = en ? 'en' : 'zh-CN';
  document.title = dict['document.title'];

  const descMeta = $('meta[name="description"]');
  if (descMeta) descMeta.setAttribute('content', dict['document.description']);
  const ogTitle = $('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', dict['document.title']);
  const ogDesc = $('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', dict['document.description']);

  $$('[data-i18n]').forEach(el => {
    if (el.dataset.en === undefined) el.dataset.en = el.textContent;
    const val = dict[el.dataset.i18n];
    el.textContent = en || val === undefined ? el.dataset.en : val;
  });

  $$('[data-i18n-attr]').forEach(el => {
    el.dataset.i18nAttr.split(';').forEach(pair => {
      const [attr, key] = pair.split(':');
      const stash = 'data-en-' + attr;
      if (!el.hasAttribute(stash)) el.setAttribute(stash, el.getAttribute(attr) || '');
      const val = dict[key];
      el.setAttribute(attr, en || val === undefined ? el.getAttribute(stash) : val);
    });
  });

  // App Store 落地页语言跟随站点语言
  const storeUrl = 'https://apps.apple.com/us/app/folio-universal-viewer/id6769624913?mt=12';
  $$('a[data-appstore]').forEach(a => {
    a.href = lang === 'zh' ? storeUrl + '&l=zh-Hans-CN' : storeUrl;
  });

  // Language switcher label & active state
  const label = $('#langLabel');
  if (label) label.textContent = dict['lang.label'];
  $$('#langMenu button[data-lang]').forEach(btn => {
    btn.setAttribute('aria-current', btn.dataset.lang === lang ? 'true' : 'false');
  });

  document.dispatchEvent(new CustomEvent('folio:lang', { detail: lang }));
}

function setLang(lang) {
  if (!I18N[lang]) return;
  try { localStorage.setItem('lang', lang); } catch (e) {}
  applyI18n(lang);
  closeLangMenu();
}

function toggleLangMenu(e) {
  e.stopPropagation();
  const el = $('#langSwitch');
  const isOpen = el.classList.toggle('open');
  $('.lang-trigger', el).setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

function closeLangMenu() {
  const el = $('#langSwitch');
  if (!el) return;
  el.classList.remove('open');
  $('.lang-trigger', el).setAttribute('aria-expanded', 'false');
}

document.addEventListener('click', (e) => {
  const sw = $('#langSwitch');
  if (sw && !sw.contains(e.target)) closeLangMenu();
});

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLangMenu(); });

// ===== Theme =====
function updateThemeColor(isDark) {
  $$('meta[name="theme-color"]').forEach(m => m.remove());
  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  meta.content = isDark ? '#0B0907' : '#FBF6EE';
  document.head.appendChild(meta);
}

let themeTimer = 0;
function toggleTheme() {
  const root = document.documentElement;
  root.classList.add('theme-switching');
  root.classList.toggle('dark');
  const isDark = root.classList.contains('dark');
  try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch (e) {}
  updateThemeColor(isDark);
  clearTimeout(themeTimer);
  themeTimer = setTimeout(() => root.classList.remove('theme-switching'), 450);
}

// ===== Bootstrap（脚本在 body 末尾，先于首帧执行）=====
updateThemeColor(document.documentElement.classList.contains('dark'));
applyI18n(detectInitialLang());

requestAnimationFrame(() => {
  document.body.classList.remove('loading');
  setTimeout(() => $('#heroContent').classList.add('loaded'), 60);
});

// ===== Navbar / mobile menu =====
const navbar = $('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 12);
}, { passive: true });

function toggleMobileMenu() {
  $('.mobile-toggle').classList.toggle('open');
  $('#mobileMenu').classList.toggle('open');
}

function closeMobileMenu() {
  $('.mobile-toggle').classList.remove('open');
  $('#mobileMenu').classList.remove('open');
}

// ===== Scroll reveal =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

$$('.reveal').forEach(el => revealObserver.observe(el));

// ===== 离开视口就暂停 CSS 循环动画 =====
const animObserver = new IntersectionObserver(entries => {
  entries.forEach(e => e.target.classList.toggle('paused', !e.isIntersecting));
}, { rootMargin: '80px' });

['.hero', '#tmScene', '#trScene', '#docxDemo'].forEach(sel => {
  const el = $(sel);
  if (el) animObserver.observe(el);
});

// ===== 14 计数 =====
(function countUp() {
  const el = $('.count');
  if (!el || reduced()) return;
  const target = +el.dataset.count;
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    const t0 = performance.now();
    const dur = 1100;
    (function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }, { threshold: 0.6 }).observe(el);
})();

// ===== I · 舞台：随阅读切换窗口内容 =====
(function stage() {
  const root = $('#stage');
  if (!root) return;
  const steps = $$('.step', root);
  const shots = $$('.shot', root);

  function setStep(i) {
    root.dataset.step = i;
    root.style.setProperty('--step', i);
    steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
    shots.forEach((s, k) => s.classList.toggle('is-active', k === i));
  }

  // 视口正中一条细带扫过哪一步，就切到哪一步
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) setStep(+e.target.dataset.step); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(s => io.observe(s));
})();

// ===== III · 工作空间标签页 + 彩色标签筛选 =====
(function workspaces() {
  const root = $('#wsDemo');
  if (!root) return;
  const tabs = $$('[role="tab"]', root);
  const panels = $$('.ws-panel', root);
  let touched = false;

  function select(i, focus) {
    tabs.forEach((b, k) => {
      b.setAttribute('aria-selected', String(k === i));
      b.tabIndex = k === i ? 0 : -1;
    });
    panels.forEach((p, k) => {
      p.hidden = k !== i;
      p.classList.toggle('is-active', k === i);
    });
    if (focus) tabs[i].focus();
  }

  tabs.forEach((b, i) => {
    b.addEventListener('click', () => { touched = true; select(i); });
    b.addEventListener('keydown', e => {
      const last = tabs.length - 1;
      const to = { ArrowRight: (i + 1) % tabs.length, ArrowLeft: (i + last) % tabs.length, Home: 0, End: last }[e.key];
      if (to === undefined) return;
      e.preventDefault();
      touched = true;
      select(to, true);
    });
  });

  // 没人动手时，缓慢轮播一遍，让人看到「每个标签各留各的位置」
  whenVisible(root, async signal => {
    let i = tabs.findIndex(b => b.getAttribute('aria-selected') === 'true');
    while (!touched) {
      await sleep(3600, signal);
      if (touched) break;
      i = (i + 1) % tabs.length;
      select(i);
    }
  });

  const lbls = $$('.lbl', root);
  lbls.forEach(b => b.addEventListener('click', () => {
    const wasOn = b.getAttribute('aria-pressed') === 'true';
    lbls.forEach(x => x.setAttribute('aria-pressed', 'false'));
    if (!wasOn) b.setAttribute('aria-pressed', 'true');
    const c = wasOn ? null : b.dataset.c;
    $$('.mw-tree li', root).forEach(li => li.classList.toggle('dim', !!c && li.dataset.l !== c));
  }));
})();

// ===== IV · 搜索演示 =====
(function searchDemo() {
  const root = $('#searchDemo');
  if (!root) return;
  const query = $('.sd-query', root);
  const rows = $$('.sd-row', root);

  whenVisible(root, async signal => {
    root.classList.add('is-running');
    while (true) {
      rows.forEach(r => r.classList.remove('on'));
      query.textContent = '';
      await sleep(700, signal);
      await typeInto(query, t('search.q'), 110, signal);
      await sleep(350, signal);
      for (const r of rows) { r.classList.add('on'); await sleep(150, signal); }
      await sleep(4600, signal);
      rows.forEach(r => r.classList.remove('on'));
      await sleep(600, signal);
    }
  });
})();

// ===== V · 斜杠菜单演示 =====
(function slashDemo() {
  const root = $('#slashDemo');
  if (!root) return;
  const items = $$('.sl-menu li', root);

  whenVisible(root, async signal => {
    root.classList.add('is-running');
    while (true) {
      root.classList.remove('s1', 's2', 's3');
      items.forEach(li => li.classList.remove('on'));
      await sleep(900, signal);
      root.classList.add('s1');
      await sleep(700, signal);
      root.classList.replace('s1', 's2');
      await sleep(650, signal);
      // 刚打开时首项不高亮，↓ 三次落到「表格」
      for (let i = 0; i <= 3; i++) {
        items.forEach((li, k) => li.classList.toggle('on', k === i));
        await sleep(420, signal);
      }
      await sleep(520, signal);
      root.classList.replace('s2', 's3');
      await sleep(3800, signal);
    }
  });
})();

// ===== V · 录屏：进入视口才加载与播放，章节标签跟随时间 =====
(function videos() {
  const vids = $$('video[data-src]');
  if (!vids.length || reduced()) return; // reduced-motion：只显示 poster

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) {
        if (!v.getAttribute('src')) v.src = v.dataset.src;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, { threshold: 0.4 });
  vids.forEach(v => io.observe(v));

  const md = $('#vidMd');
  const tags = $$('.vtag');
  let active = 0;
  md.addEventListener('timeupdate', () => {
    let idx = 0;
    tags.forEach((tag, k) => { if (md.currentTime >= +tag.dataset.t) idx = k; });
    if (idx === active) return;
    tags[active].classList.remove('is-active');
    tags[idx].classList.add('is-active');
    active = idx;
  });
})();

// ===== VI · 主题色板 =====
(function themes() {
  const root = $('#themeDemo');
  if (!root) return;
  const swatches = $$('.swatches button', root);
  const nameEl = $('#swatchName', root);
  let current = swatches.find(b => b.dataset.name === 'Amber');
  let touched = false;

  swatches.forEach(b => {
    b.style.setProperty('--sl', b.dataset.l);
    b.style.setProperty('--sd', b.dataset.d);
  });

  function label(b) { return currentLang === 'zh' ? I18N.zh['sw.' + b.dataset.name] : b.dataset.name; }

  function pick(b, focus) {
    current = b;
    swatches.forEach(x => {
      x.setAttribute('aria-checked', String(x === b));
      x.tabIndex = x === b ? 0 : -1;
    });
    root.style.setProperty('--tl', b.dataset.l);
    root.style.setProperty('--td', b.dataset.d);
    nameEl.textContent = label(b);
    if (focus) b.focus();
  }

  swatches.forEach((b, i) => {
    b.addEventListener('click', () => { touched = true; pick(b); });
    b.addEventListener('keydown', e => {
      const n = swatches.length;
      const to = { ArrowRight: (i + 1) % n, ArrowDown: (i + 1) % n, ArrowLeft: (i + n - 1) % n, ArrowUp: (i + n - 1) % n }[e.key];
      if (to === undefined) return;
      e.preventDefault();
      touched = true;
      pick(swatches[to], true);
    });
  });

  pick(current);
  document.addEventListener('folio:lang', () => { nameEl.textContent = label(current); });

  // 没人动手时，慢慢换色，让人看到整个界面跟着变
  whenVisible(root, async signal => {
    while (!touched) {
      await sleep(2800, signal);
      if (touched) break;
      pick(swatches[(swatches.indexOf(current) + 1) % swatches.length]);
    }
  });
})();

// ===== 增刊：完整版小场景 =====
(function fullScenes() {
  const ai = $('#aiScene');
  if (ai) {
    const typed = $('.ai-type', ai);
    const outs = $$('.ai-out', ai);
    whenVisible(ai, async signal => {
      ai.classList.add('is-running');
      while (true) {
        outs.forEach(o => o.classList.remove('show'));
        typed.textContent = '';
        await sleep(800, signal);
        await typeInto(typed, t('ai.prompt'), 55, signal);
        await sleep(500, signal);
        for (const o of outs) { o.classList.add('show'); await sleep(900, signal); }
        await sleep(4200, signal);
      }
    });
  }

  const term = $('#termScene');
  if (term) {
    const typed = $('.term-type', term);
    const cmd = typed.textContent;
    const outs = $$('.term-out', term);
    whenVisible(term, async signal => {
      term.classList.add('is-running');
      while (true) {
        outs.forEach(o => o.classList.remove('show'));
        typed.textContent = '';
        await sleep(900, signal);
        await typeInto(typed, cmd, 70, signal);
        await sleep(450, signal);
        for (const o of outs) { o.classList.add('show'); await sleep(320, signal); }
        await sleep(4200, signal);
      }
    });
  }

  const git = $('#gitScene');
  if (git) {
    const box = $('.hk-box', git);
    whenVisible(git, async signal => {
      while (true) {
        box.classList.remove('on');
        await sleep(1500, signal);
        box.classList.add('on');
        await sleep(4000, signal);
      }
    });
  }

  const tasks = $('#taskScene');
  if (tasks) {
    const items = $$('.tk', tasks);
    whenVisible(tasks, async signal => {
      while (true) {
        items.forEach(i => i.classList.remove('done'));
        await sleep(1200, signal);
        for (const i of items) { i.classList.add('done'); await sleep(1000, signal); }
        await sleep(3200, signal);
      }
    });
  }
})();

// ===== FAQ accordion =====
function toggleFaq(button) {
  const item = button.parentElement;
  const wasOpen = item.classList.contains('open');
  $$('.faq-item.open').forEach(el => {
    el.classList.remove('open');
    $('.faq-q', el).setAttribute('aria-expanded', 'false');
  });
  if (!wasOpen) {
    item.classList.add('open');
    button.setAttribute('aria-expanded', 'true');
  }
}
