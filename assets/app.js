// ===== Site shell: theme, language, nav, reveal, FAQ, spotlight, marquee =====
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reducedMq = matchMedia('(prefers-reduced-motion: reduce)');
  let stilled = false;
  window.folio = { $, $$, reduced: () => reducedMq.matches, paused: () => stilled };

  // ----- Language -----
  const langSwitch = $('#langSwitch');
  const langTrigger = $('#langTrigger');
  const closeLangMenu = () => {
    langSwitch.classList.remove('open');
    langTrigger.setAttribute('aria-expanded', 'false');
  };
  langTrigger.addEventListener('click', e => {
    e.stopPropagation();
    const open = langSwitch.classList.toggle('open');
    langTrigger.setAttribute('aria-expanded', String(open));
  });
  $$('#langMenu button').forEach(btn => btn.addEventListener('click', () => {
    const lang = btn.dataset.lang;
    try { localStorage.setItem('lang', lang); } catch (e) {}
    applyI18n(lang);
    closeLangMenu();
    langTrigger.focus();
  }));
  document.addEventListener('click', e => { if (!langSwitch.contains(e.target)) closeLangMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLangMenu(); });

  // ----- Theme (dark default; html.light overrides) -----
  const setThemeColor = light => {
    let meta = $('meta[name="theme-color"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'theme-color'; document.head.appendChild(meta); }
    meta.content = light ? '#FBF6EE' : '#0A0908';
  };
  setThemeColor(document.documentElement.classList.contains('light'));
  $('#themeBtn').addEventListener('click', () => {
    const light = document.documentElement.classList.toggle('light');
    try { localStorage.setItem('theme', light ? 'light' : 'dark'); } catch (e) {}
    setThemeColor(light);
    document.dispatchEvent(new CustomEvent('themechange'));
  });

  // ----- Pause all motion (WCAG 2.2.2: one control for everything that moves on its own) -----
  const motionBtn = $('#motionBtn');
  const setStill = on => {
    stilled = on;
    document.documentElement.classList.toggle('still', on);
    motionBtn.setAttribute('aria-pressed', String(on));
    motionBtn.setAttribute('aria-label', i18n.t(on ? 'nav.motion.on' : 'nav.motion'));
    document.dispatchEvent(new CustomEvent('motionchange'));
  };
  motionBtn.addEventListener('click', () => setStill(!stilled));
  document.addEventListener('langchange', () => motionBtn.setAttribute('aria-label', i18n.t(stilled ? 'nav.motion.on' : 'nav.motion')));

  // ----- Navbar / mobile menu -----
  const navbar = $('.navbar');
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 12);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const mToggle = $('#mobileToggle');
  const mMenu = $('#mobileMenu');
  const setMobile = open => {
    mToggle.classList.toggle('open', open);
    mMenu.classList.toggle('open', open);
    mToggle.setAttribute('aria-expanded', String(open));
  };
  mToggle.addEventListener('click', () => setMobile(!mMenu.classList.contains('open')));
  $$('a', mMenu).forEach(a => a.addEventListener('click', () => setMobile(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && mMenu.classList.contains('open')) { setMobile(false); mToggle.focus(); } });

  // ----- Entrance -----
  window.addEventListener('load', () => {
    requestAnimationFrame(() => {
      document.body.classList.remove('loading');
      setTimeout(() => $('#heroTop').classList.add('loaded'), 60);
    });
  });

  // ----- Scroll reveal (IntersectionObserver only) -----
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => revealObserver.observe(el));

  // ----- FAQ -----
  $$('.faq-q').forEach(btn => btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const wasOpen = item.classList.contains('open');
    $$('.faq-item.open').forEach(el => {
      el.classList.remove('open');
      $('.faq-q', el).setAttribute('aria-expanded', 'false');
    });
    if (!wasOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  }));

  // ----- Card spotlight (glow follows the pointer; transform-only on the glow layer) -----
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.spot').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  // ----- Formats marquee (pausable) -----
  const marq = $('#marq');
  const buildMarquee = () => {
    const list = I18N[i18n.lang]['formats.list'];
    const chip = n => `<span class="fchip"><i></i>${n}</span>`;
    const row = (items, cls) => items.map(chip).join('') + items.map(n => chip(n).replace('class="fchip"', 'class="fchip dup"')).join('');
    $('#marqA').innerHTML = row(list);
    $('#marqB').innerHTML = row([...list].reverse());
    $('#marqB').setAttribute('aria-hidden', 'true');
  };
  buildMarquee();
  document.addEventListener('langchange', buildMarquee);
  const marqBtn = $('#marqPause');
  marqBtn.addEventListener('click', () => {
    const paused = marq.classList.toggle('paused');
    marqBtn.setAttribute('aria-pressed', String(paused));
    $('span', marqBtn).textContent = i18n.t(paused ? 'formats.resume' : 'formats.pause');
    $('span', marqBtn).dataset.i18n = paused ? 'formats.resume' : 'formats.pause';
  });
  if (reducedMq.matches) marqBtn.hidden = true;

  // ----- Boot -----
  applyI18n(detectInitialLang());
})();
