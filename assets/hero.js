// ===== Hero: a live Folio window driven by file-type chips =====
(() => {
  const { $, $$ } = window.folio;
  const win = $('#win');
  if (!win) return;

  const reduced = window.folio.reduced();
  const t = k => i18n.t(k);
  const main = $('#winMain');
  const side = $('#winSide');
  const tabsEl = $('#winTabs');
  const chipsEl = $('#chips');
  const dock = $('#dock');
  const playBtn = $('#playBtn');
  const stFile = $('#stFile');
  const stKind = $('#stKind');
  const stage = $('.stage');

  // ---------- helpers ----------
  const ease = p => 1 - Math.pow(1 - p, 3);
  const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  // Per-scene timeline: everything is cancelled the moment a scene is left.
  function makeTimeline() {
    let timers = [], rafs = new Set(), cleanups = [], dead = false;
    return {
      onStop(fn) { cleanups.push(fn); },
      at(ms, fn) { timers.push(setTimeout(() => { if (!dead) fn(); }, ms)); },
      tween(ms, fn, done) {
        const t0 = performance.now();
        const id = { v: 0 };
        const step = now => {
          if (dead) return;
          const p = Math.min(1, (now - t0) / ms);
          fn(p);
          if (p < 1) id.v = requestAnimationFrame(step); else { rafs.delete(id); done && done(); }
        };
        rafs.add(id);
        id.v = requestAnimationFrame(step);
      },
      loop(fn) {
        const id = { v: 0 };
        const step = now => { if (dead) return; fn(now); id.v = requestAnimationFrame(step); };
        rafs.add(id);
        id.v = requestAnimationFrame(step);
      },
      stop() { dead = true; timers.forEach(clearTimeout); rafs.forEach(id => cancelAnimationFrame(id.v)); timers = []; rafs.clear(); cleanups.forEach(fn => fn()); }
    };
  }

  window.folio.makeTimeline = makeTimeline;

  // ---------- sortable table (sheet + sqlite) ----------
  function mountTable(host, { cols, rows, grid, sort }) {
    let order = rows.map((_, i) => i);
    let sortKey = null, sortDir = 1;
    host.innerHTML = '';
    const tbl = document.createElement('div');
    tbl.className = 'tbl';
    const head = document.createElement('div');
    head.className = 'tbl-row tbl-head';
    head.style.gridTemplateColumns = grid;
    cols.forEach((c, ci) => {
      const cell = document.createElement('div');
      if (c.num) cell.className = 'num';
      const b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = `${c.label}<svg class="ar" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M1 5l4-4 4 4"/></svg>`;
      b.addEventListener('click', () => { api.onUser && api.onUser(); api.sortBy(ci, sortKey === ci ? -sortDir : (c.num ? -1 : 1)); });
      cell.appendChild(b);
      head.appendChild(cell);
    });
    tbl.appendChild(head);
    const els = rows.map((r, ri) => {
      const el = document.createElement('div');
      el.className = 'tbl-row';
      el.style.gridTemplateColumns = grid;
      el.innerHTML = r.map((v, ci) => `<div class="${cols[ci].num ? 'num' : ''}">${cols[ci].render ? cols[ci].render(v) : v}</div>`).join('');
      tbl.appendChild(el);
      return el;
    });
    host.appendChild(tbl);

    const api = {
      onUser: null, els, tbl,
      sortBy(ci, dir) {
        const first = els.map(e => e.getBoundingClientRect().top);
        sortKey = ci; sortDir = dir;
        const val = i => rows[i][ci];
        order.sort((a, b) => {
          const x = val(a), y = val(b);
          return (typeof x === 'number' ? x - y : String(x).localeCompare(String(y))) * dir;
        });
        order.forEach(i => tbl.appendChild(els[i]));
        $$('.tbl-head button', head).forEach((b, i) => {
          if (i === ci) b.setAttribute('aria-sort', dir > 0 ? 'ascending' : 'descending'); else b.removeAttribute('aria-sort');
        });
        if (window.folio.reduced()) return;
        els.forEach((el, i) => {
          const dy = first[i] - el.getBoundingClientRect().top;
          if (!dy) return;
          el.style.transition = 'none';
          el.style.transform = `translateY(${dy}px)`;
        });
        void tbl.offsetHeight;
        els.forEach(el => { el.style.transition = ''; el.style.transform = ''; });
      },
      dim(fn) { els.forEach((el, i) => el.classList.toggle('dim', !!fn && !fn(rows[i]))); }
    };
    if (sort) api.sortBy(sort.col, sort.dir);
    return api;
  }

  // ---------- scene definitions ----------
  const SCENES = [];
  const scene = def => SCENES.push(def);

  // --- Swift: code types itself, with syntax colors ---
  const SWIFT = [
    'import SwiftUI',
    '',
    'struct FileViewer: View {',
    '    @State private var selection: URL?',
    '',
    '    var body: some View {',
    '        NavigationSplitView {',
    '            Sidebar(selection: $selection)',
    '        } detail: {',
    '            // PDF, images, 3D, audio…',
    '            if let url = selection {',
    '                Viewer(url: url)',
    '            }',
    '        }',
    '    }',
    '}'
  ];
  const KW = new Set(['import', 'struct', 'var', 'let', 'some', 'if', 'private']);
  function tokenize(line) {
    const out = [];
    const re = /(\/\/.*$)|("[^"]*")|(@\w+)|(\b[A-Z]\w*\b)|(\b[a-z_]\w*\b)|(\s+|.)/g;
    let m;
    while ((m = re.exec(line))) {
      if (m[1]) out.push([m[1], 't-cm']);
      else if (m[2]) out.push([m[2], 't-st']);
      else if (m[3]) out.push([m[3], 't-at']);
      else if (m[4]) out.push([m[4], 't-ty']);
      else if (m[5]) out.push([m[5], KW.has(m[5]) ? 't-kw' : '']);
      else out.push([m[6], '']);
    }
    return out;
  }
  scene({
    id: 'swift', ext: 'SW', chip: 'Swift', dir: 'src', file: 'FileViewer.swift', kind: 'sc.kind.swift', note: 'sc.swift', dur: 7000,
    build() { return '<div class="code"></div><div class="pill-note"></div>'; },
    enter(root, T, settled) {
      const code = $('.code', root);
      const chars = [];
      SWIFT.forEach((line, i) => {
        const ln = document.createElement('div');
        ln.className = 'ln';
        ln.dataset.n = i + 1;
        tokenize(line).forEach(([text, cls]) => {
          const tok = document.createElement('span');
          if (cls) tok.className = cls;
          [...text].forEach(ch => {
            const c = document.createElement('span');
            c.className = settled ? 'c v' : 'c';
            c.textContent = ch;
            tok.appendChild(c);
            chars.push({ c, ln });
          });
          ln.appendChild(tok);
        });
        code.appendChild(ln);
      });
      if (settled) return;
      let i = 0, prev = null;
      T.at(350, () => T.loop(() => {
        for (let n = 0; n < 3 && i < chars.length; n++) {
          // reveal indentation and blanks together with the next visible glyph
          while (i < chars.length - 1 && /\s/.test(chars[i].c.textContent)) chars[i++].c.classList.add('v');
          const cur = chars[i++];
          cur.c.classList.add('v');
          if (prev) prev.c.classList.remove('here');
          cur.c.classList.add('here');
          if (!prev || prev.ln !== cur.ln) { prev && prev.ln.classList.remove('cur'); cur.ln.classList.add('cur'); }
          prev = cur;
        }
      }));
    }
  });

  // --- PDF: search highlights + slow scroll ---
  scene({
    id: 'pdf', ext: 'PDF', chip: 'PDF', dir: 'docs', file: 'research-notes.pdf', kind: 'sc.kind.pdf', note: 'sc.pdf', dur: 7000, label: '#FF9A4A',
    build() {
      return `<div class="pdf"><aside class="pdf-thumbs"><i class="on"></i><i></i><i></i><i></i><i></i></aside>
        <div class="pdf-view"><div class="pdf-find"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><span class="q"></span><span class="cnt"></span></div>
        <div class="pdf-page">
          <h4>Feedback in Fast Markets</h4>
          <div class="pdf-au">A. Moreau · J. Tanaka · L. Berg</div>
          <p class="abs"><b>Abstract</b> We study how <mark>feedback</mark> between prices and beliefs shapes short-horizon returns. When a price move changes what participants expect, the expectation moves the price again — a loop that ordinary models treat as noise.</p>
          <p><b>1 Introduction</b> A sell-off begins as a price move and becomes a story. The story becomes a forecast, and the forecast changes positioning. Each step adds <mark>feedback</mark> to the last, until the market reacts less to information than to itself.</p>
          <p><b>2 Model</b> Traders hold heterogeneous beliefs and update on both fundamentals and price. The resulting <mark>feedback</mark> gain decides whether a shock fades or compounds, and how long the compounding lasts before liquidity pushes back.</p>
          <p><b>3 Results</b> Regimes with low gain look like textbook mean reversion. Regimes with high gain look like something else entirely: momentum that outruns the news, then reverses without any.</p>
          <p><b>4 Discussion</b> The practical lesson is modest. Watch the loop, not only the headline; the loop is where the surprise lives.</p>
        </div></div></div><div class="pill-note"></div>`;
    },
    enter(root, T, settled) {
      const q = $('.q', root), cnt = $('.cnt', root), page = $('.pdf-page', root);
      const marks = $$('mark', root);
      const term = 'feedback';
      const finish = () => { q.textContent = term; cnt.textContent = `${marks.length} ${t('sc.matches')}`; marks.forEach(m => m.classList.add('hit')); };
      if (settled) { finish(); return; }
      page.style.transition = 'transform 4.2s var(--ease-in-out)';
      T.at(300, () => { page.style.transform = 'translateY(-64px)'; });
      [...term].forEach((_, i) => T.at(700 + i * 70, () => { q.textContent = term.slice(0, i + 1); }));
      T.at(1400, () => { cnt.textContent = `${marks.length} ${t('sc.matches')}`; });
      marks.forEach((m, i) => T.at(1600 + i * 320, () => m.classList.add('hit')));
    }
  });

  // --- Markdown: slash menu → checklist ---
  const MENU = [['H1', 'Heading 1'], ['H2', 'Heading 2'], ['•', 'Bullet list'], ['1.', 'Ordered list'], ['☐', 'To-do list'], ['❝', 'Quote']];
  const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  scene({
    id: 'md', ext: 'MD', chip: 'Markdown', dir: 'notes', file: 'getting-started.md', kind: 'sc.kind.md', note: 'sc.md', dur: 8000, label: '#7ED0E4',
    build() {
      return `<div class="md"><div class="md-doc">
        <h4>A quiet home for every file</h4>
        <p>Nothing here shouts. A file arrives, and it simply <b>becomes readable</b> — layout, color and structure intact.</p>
        <h5>A short, honest list</h5>
        <div class="md-new"><span class="tx"></span><span class="caret"></span></div>
        <div class="md-menu">${MENU.map(([k, n]) => `<div><span>${k}</span>${n}</div>`).join('')}</div>
        <div class="md-todo">${['Open almost anything, instantly', 'Search inside files, not just names', 'Keep every tab exactly where you left it'].map(s => `<label><span class="bx">${CHECK}</span><span>${s}</span></label>`).join('')}</div>
      </div></div><div class="pill-note"></div>`;
    },
    enter(root, T, settled) {
      const nw = $('.md-new', root), tx = $('.tx', root), menu = $('.md-menu', root), todo = $('.md-todo', root);
      const items = $$('.md-menu div', root), labels = $$('.md-todo label', root);
      const showTodo = (ticks) => { nw.classList.add('gone'); menu.classList.remove('show'); todo.classList.add('show'); labels.forEach((l, i) => l.classList.toggle('done', i < ticks)); };
      if (settled) { showTodo(2); return; }
      T.at(500, () => { tx.textContent = '/'; });
      T.at(850, () => { menu.classList.add('show'); items[0].classList.add('hl'); });
      [1, 2, 3, 4].forEach((k, i) => T.at(1250 + i * 320, () => { items[k - 1].classList.remove('hl'); items[k].classList.add('hl'); }));
      T.at(3100, () => showTodo(0));
      T.at(4100, () => labels[0].classList.add('done'));
      T.at(4800, () => labels[1].classList.add('done'));
    }
  });

  // --- Word: select → bold → recolor, .docx in/out ---
  scene({
    id: 'docx', ext: 'DOC', chip: 'Word', dir: 'docs', file: 'product-brief.docx', kind: 'sc.kind.docx', note: 'sc.docx', dur: 7000, label: '#B58CFF',
    build() {
      return `<div class="dx"><div class="dx-tools"><span class="sel">Inter</span><span class="sel">14</span><button type="button" tabindex="-1">B</button><button type="button" tabindex="-1" style="font-weight:400;font-style:italic">I</button><button type="button" tabindex="-1" style="font-weight:400;text-decoration:underline">U</button>
        <span class="sw"><i style="background:#201C16"></i><i style="background:#2F6BFF"></i><i style="background:#7A2DD0"></i><i style="background:#E5484D"></i></span></div>
        <div class="dx-view"><div class="dx-page"><h4><span class="selbox"></span>Folio Introduction</h4><div class="sub">A focused universal file viewer for macOS</div>
        <h5>Executive summary</h5><p>Mac users juggle several single-purpose apps just to open the file types they meet every day. Folio collapses that into one predictable workspace.</p>
        <h5>Supported formats</h5>
        <table><tr><th>Capability</th><th>Folio</th><th>Native preview</th></tr><tr><td>File formats</td><td>14 kinds</td><td>Fewer</td></tr><tr><td>Full-text search</td><td>Yes</td><td>No</td></tr></table></div></div></div>
        <div class="dx-badge"></div>`;
    },
    enter(root, T, settled) {
      const h = $('h4', root), b = $$('.dx-tools button', root)[0], sw = $$('.dx-tools .sw i', root), badge = $('.dx-badge', root);
      const bold = () => { h.classList.add('bold'); b.classList.add('on'); };
      const recolor = () => { h.classList.add('styled'); sw[2].classList.add('on'); };
      if (settled) { bold(); recolor(); badge.classList.add('show'); return; }
      T.at(600, () => h.classList.add('sel-on'));
      T.at(1500, bold);
      T.at(2300, recolor);
      T.at(3200, () => { h.classList.remove('sel-on'); b.classList.remove('on'); });
      T.at(3900, () => badge.classList.add('show'));
    }
  });

  // --- Image: zoom + EXIF + flip ---
  const PHOTO = `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
    <linearGradient id="skyg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#171B47"/><stop offset=".5" stop-color="#B84F7C"/><stop offset="1" stop-color="#FBB86B"/></linearGradient>
    <radialGradient id="sung"><stop offset="0" stop-color="#FFF6DD"/><stop offset=".25" stop-color="#FFCB80" stop-opacity=".95"/><stop offset="1" stop-color="#FF9A4A" stop-opacity="0"/></radialGradient>
    <linearGradient id="seag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E58A63"/><stop offset=".25" stop-color="#5B3A6E"/><stop offset="1" stop-color="#150F2B"/></linearGradient>
    <linearGradient id="streak" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFE2A8" stop-opacity="0"/><stop offset=".5" stop-color="#FFE2A8" stop-opacity=".8"/><stop offset="1" stop-color="#FFE2A8" stop-opacity="0"/></linearGradient></defs>
    <rect width="800" height="320" fill="url(#skyg)"/><circle cx="520" cy="236" r="150" fill="url(#sung)"/><circle cx="520" cy="238" r="21" fill="#FFF3D2"/>
    <path d="M0 262L70 226 140 252 230 204 320 250 410 226 500 262 610 218 700 250 800 226V330H0Z" fill="#6A3E78" opacity=".75"/>
    <path d="M0 292L90 258 170 282 270 240 350 278 450 262 560 292 660 258 800 290V340H0Z" fill="#3B2354"/>
    <rect y="318" width="800" height="182" fill="url(#seag)"/>
    <g fill="url(#streak)"><rect x="470" y="326" width="100" height="3"/><rect x="452" y="338" width="136" height="3"/><rect x="430" y="352" width="180" height="3"/><rect x="410" y="368" width="220" height="4"/><rect x="380" y="388" width="280" height="4"/><rect x="340" y="412" width="360" height="5"/><rect x="290" y="440" width="460" height="6"/></g>
    <path d="M0 500V398C60 388 110 372 170 386 230 398 260 430 330 440 380 448 420 470 430 500Z" fill="#160F26"/>
    <path d="M800 500V430C740 420 700 440 650 450 610 458 590 478 585 500Z" fill="#1A1230"/></svg>`;
  scene({
    id: 'image', ext: 'PNG', chip: 'chip.image', chipI18n: true, dir: 'images', file: 'coast-01.png', kind: 'sc.kind.image', note: 'sc.image', dur: 7000,
    build() {
      return `<div class="img"><div class="img-stage">${PHOTO}</div><div class="img-zoom">100%</div>
        <div class="img-exif"><div><dt>Camera</dt><dd>Mirrorless</dd></div><div><dt>Lens</dt><dd>35 mm</dd></div><div><dt>Aperture</dt><dd>ƒ/2.8</dd></div><div><dt>Shutter</dt><dd>1/250</dd></div><div><dt>ISO</dt><dd>100</dd></div></div>
        <div class="img-strip"><i class="on"></i><i></i><i></i></div></div><div class="pill-note"></div>`;
    },
    enter(root, T, settled) {
      const stage = $('.img-stage', root), zoom = $('.img-zoom', root), exif = $('.img-exif', root), thumbs = $$('.img-strip i', root);
      if (settled) { exif.classList.add('show'); return; }
      T.at(500, () => {
        stage.style.transition = 'transform 3.2s var(--ease-in-out)';
        stage.style.transform = 'scale(1.75)';
        T.tween(3200, p => { zoom.textContent = Math.round(100 + 140 * (p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2)) + '%'; });
      });
      T.at(3200, () => exif.classList.add('show'));
      T.at(4600, () => {
        stage.style.transition = 'transform 0.9s var(--ease-out)';
        stage.style.transform = 'scale(1)';
        exif.classList.remove('show');
        T.tween(900, p => { zoom.textContent = Math.round(240 - 140 * ease(p)) + '%'; });
      });
      T.at(5700, () => { thumbs[0].classList.remove('on'); thumbs[1].classList.add('on'); });
    }
  });

  // --- Sheet (CSV) ---
  const POP = [['Brazil', 'South America', 214], ['China', 'Asia', 1412], ['India', 'Asia', 1408], ['Indonesia', 'Asia', 276], ['Nigeria', 'Africa', 218], ['Pakistan', 'Asia', 231], ['United States', 'North America', 333]];
  scene({
    id: 'csv', ext: 'CSV', chip: 'chip.sheet', chipI18n: true, dir: 'data', file: 'population.csv', kind: 'sc.kind.csv', note: 'sc.csv', dur: 7000,
    build() { return '<div class="tbl-wrap"><div class="tbl-bar"><span>population.csv</span><span class="flt"></span></div><div class="tbl-host"></div></div><div class="pill-note"></div>'; },
    enter(root, T, settled) {
      const host = $('.tbl-host', root), flt = $('.flt', root);
      flt.textContent = t('sc.filter');
      const tb = mountTable(host, { cols: [{ label: 'Country' }, { label: 'Region' }, { label: 'Population (M)', num: true }], rows: POP, grid: '1.4fr 1.2fr 1fr' });
      const isAsia = r => r[1] === 'Asia';
      let userTouched = false;
      tb.onUser = () => { userTouched = true; tb.dim(null); flt.classList.remove('on'); };
      if (settled) { tb.sortBy(2, -1); return; }
      T.at(1200, () => { if (!userTouched) tb.sortBy(2, -1); });
      T.at(3400, () => { if (!userTouched) { flt.classList.add('on'); tb.dim(isAsia); } });
      T.at(5600, () => { if (!userTouched) { flt.classList.remove('on'); tb.dim(null); } });
    }
  });

  // --- SQLite ---
  const DBS = {
    orders: { grid: '0.7fr 1.5fr 1fr 1fr', cols: [{ label: 'id', num: true }, { label: 'customer' }, { label: 'total', num: true, render: v => '$' + v.toFixed(2) }, { label: 'status', render: v => `<span class="stat-pill ${v}">${v === 'ok' ? 'paid' : v === 'wait' ? 'pending' : 'void'}</span>` }], rows: [[1042, 'Ada Lovelace', 84, 'ok'], [1043, 'Grace Hopper', 129.5, 'wait'], [1044, 'Alan Turing', 42, 'ok'], [1045, 'Linus Torvalds', 310, 'void'], [1046, 'Margaret Hamilton', 56.25, 'ok'], [1047, 'Dennis Ritchie', 18, 'wait'], [1048, 'Barbara Liskov', 205, 'ok']] },
    users: { grid: '0.7fr 1.5fr 2fr', cols: [{ label: 'id', num: true }, { label: 'name' }, { label: 'email' }], rows: [[1, 'Ada Lovelace', 'ada@example.com'], [2, 'Grace Hopper', 'grace@example.com'], [3, 'Alan Turing', 'alan@example.com'], [4, 'Margaret Hamilton', 'margaret@example.com'], [5, 'Dennis Ritchie', 'dennis@example.com'], [6, 'Barbara Liskov', 'barbara@example.com']] },
    events: { grid: '0.7fr 1.4fr 1.4fr', cols: [{ label: 'id', num: true }, { label: 'kind' }, { label: 'source' }], rows: [[9001, 'open', 'sidebar'], [9002, 'search', 'toolbar'], [9003, 'export', 'menu'], [9004, 'open', 'drag-drop'], [9005, 'search', 'shortcut'], [9006, 'open', 'sidebar']] }
  };
  const TBL_ICON = '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/></svg>';
  scene({
    id: 'db', ext: 'DB', chip: 'SQLite', dir: 'data', file: 'app.sqlite', kind: 'sc.kind.db', note: 'sc.db', dur: 7000,
    build() {
      return `<div class="db"><div class="db-tables"><div class="cap">${t('sc.tables')}</div>${Object.keys(DBS).map(k => `<button type="button" data-t="${k}">${TBL_ICON}${k}</button>`).join('')}</div><div class="db-main"><div class="tbl-wrap"><div class="tbl-host"></div></div></div></div><div class="pill-note"></div>`;
    },
    enter(root, T, settled) {
      const host = $('.tbl-host', root), btns = $$('.db-tables button', root);
      const show = (k, fresh) => {
        btns.forEach(b => b.classList.toggle('on', b.dataset.t === k));
        const d = DBS[k];
        const tb = mountTable(host, { cols: d.cols, rows: d.rows, grid: d.grid });
        if (fresh && !settled) tb.els.forEach((el, i) => { el.style.opacity = 0; el.style.transform = 'translateY(6px)'; setTimeout(() => { el.style.opacity = ''; el.style.transform = ''; }, 40 + i * 45); });
        return tb;
      };
      let userTouched = false;
      btns.forEach(b => b.addEventListener('click', () => { userTouched = true; show(b.dataset.t, true); }));
      show('orders', false);
      if (settled) return;
      T.at(2300, () => { if (!userTouched) show('users', true); });
      T.at(4300, () => { if (!userTouched) show('events', true); });
    }
  });

  // --- 3D: wireframe torus, drag to rotate ---
  scene({
    id: 'm3d', ext: '3D', chip: 'chip.3d', chipI18n: true, dir: 'models', file: 'torus.usdz', kind: 'sc.kind.m3d', note: 'sc.m3d', dur: 7000,
    build() { return '<div class="m3d"><canvas></canvas></div><div class="pill-note"></div>'; },
    enter(root, T, settled) {
      const wrap = $('.m3d', root), cv = $('canvas', root), ctx = cv.getContext('2d');
      const U = 30, V = 14, R = 1, r = 0.42;
      const pts = [];
      for (let i = 0; i < U; i++) for (let j = 0; j < V; j++) {
        const u = i / U * Math.PI * 2, v = j / V * Math.PI * 2;
        pts.push([(R + r * Math.cos(v)) * Math.cos(u), r * Math.sin(v), (R + r * Math.cos(v)) * Math.sin(u)]);
      }
      let rx = 0.55, ry = 0.4, vx = 0, vy = 0, dragging = false, lx = 0, ly = 0, color = cssVar('--accent');
      const onTheme = () => { color = cssVar('--accent'); draw(); };
      document.addEventListener('themechange', onTheme);
      T.onStop(() => document.removeEventListener('themechange', onTheme));
      const size = () => {
        const dpr = Math.min(2, devicePixelRatio || 1), w = wrap.clientWidth, h = wrap.clientHeight;
        if (cv.width !== w * dpr) { cv.width = w * dpr; cv.height = h * dpr; }
        return { w, h, dpr };
      };
      function draw() {
        const { w, h, dpr } = size();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry);
        const S = Math.min(w, h) * 0.3, D = 4.2;
        const P = pts.map(([x, y, z]) => {
          let x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
          let y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
          const f = D / (D + z2);
          return [w / 2 + x1 * S * f, h / 2 + y2 * S * f, z2];
        });
        ctx.lineWidth = 1;
        ctx.strokeStyle = color;
        const seg = (a, b) => {
          const z = (a[2] + b[2]) / 2;
          ctx.globalAlpha = 0.18 + 0.62 * (1 - (z + 1.6) / 3.2);
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        };
        for (let i = 0; i < U; i++) for (let j = 0; j < V; j++) {
          const a = P[i * V + j];
          seg(a, P[((i + 1) % U) * V + j]);
          seg(a, P[i * V + (j + 1) % V]);
        }
        ctx.globalAlpha = 1;
      }
      const down = e => { dragging = true; lx = e.clientX; ly = e.clientY; vx = vy = 0; wrap.setPointerCapture(e.pointerId); };
      const move = e => {
        if (!dragging) return;
        vy = (e.clientX - lx) * 0.01; vx = (e.clientY - ly) * 0.01;
        ry += vy; rx += vx; lx = e.clientX; ly = e.clientY;
        if (settled || window.folio.reduced()) draw();
      };
      const up = () => { dragging = false; };
      wrap.addEventListener('pointerdown', down);
      wrap.addEventListener('pointermove', move);
      wrap.addEventListener('pointerup', up);
      wrap.addEventListener('pointercancel', up);
      if (settled || window.folio.reduced()) { draw(); return; }
      let last = performance.now();
      T.loop(now => {
        if (!stageVisible) { last = now; return; }
        const dt = Math.min(48, now - last); last = now;
        if (!dragging) {
          ry += vy + 0.0007 * dt; rx += vx;
          vy *= 0.94; vx *= 0.94;
          rx += (0.55 - rx) * 0.004 * dt / 16;
        }
        draw();
      });
    }
  });

  // --- Audio waveform ---
  scene({
    id: 'audio', ext: 'WAV', chip: 'chip.audio', chipI18n: true, dir: 'audio', file: 'field-recording.wav', kind: 'sc.kind.audio', note: 'sc.audio', dur: 7000,
    build() {
      return `<div class="au"><div class="au-meta"><b>Field recording</b><span>44.1 kHz · stereo</span></div>
        <div class="au-wave"><div class="au-bars"></div><div class="au-bars lit"></div><div class="au-head"></div></div>
        <div class="au-ctl"><button class="au-play" type="button" aria-label="Play / pause"><svg class="i-pause" viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg><svg class="i-play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button><span class="au-time"></span></div></div><div class="pill-note"></div>`;
    },
    enter(root, T, settled) {
      const wave = $('.au-wave', root), bars = $$('.au-bars', root), head = $('.au-head', root), time = $('.au-time', root), btn = $('.au-play', root);
      const DUR = 24;
      const n = Math.max(32, Math.floor(wave.clientWidth / 6));
      let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      const hs = Array.from({ length: n }, (_, i) => {
        const env = 0.5 + 0.5 * Math.sin(i * 0.19) * Math.sin(i * 0.047 + 1.2);
        return 12 + 88 * Math.min(1, (0.18 + 0.82 * Math.abs(env)) * (0.45 + 0.55 * rnd()));
      });
      bars.forEach(b => { b.innerHTML = hs.map(h => `<i style="height:${h.toFixed(1)}%"></i>`).join(''); });
      let tt = settled ? 9 : 0, playing = !settled;
      const fmt = s => `0:${String(Math.floor(s)).padStart(2, '0')} / 0:${DUR}`;
      const paint = () => {
        const p = tt / DUR;
        bars[1].style.setProperty('--p', (p * 100).toFixed(2) + '%');
        head.style.setProperty('--pw', (p * wave.clientWidth).toFixed(1));
        time.textContent = fmt(tt);
        btn.classList.toggle('paused', !playing);
      };
      paint();
      btn.addEventListener('click', () => { playing = !playing; paint(); });
      wave.addEventListener('pointerdown', e => {
        const r = wave.getBoundingClientRect();
        tt = Math.max(0, Math.min(DUR - 0.01, (e.clientX - r.left) / r.width * DUR));
        paint();
      });
      if (settled) return;
      let last = performance.now();
      T.loop(now => {
        const dt = (now - last) / 1000; last = now;
        if (playing && stageVisible) { tt += dt; if (tt >= DUR) tt = 0; paint(); }
      });
    }
  });

  // ---------- window chrome ----------
  const ORDER = ['swift', 'pdf', 'md', 'docx', 'image', 'csv', 'db', 'm3d', 'audio'];
  const byId = Object.fromEntries(SCENES.map(s => [s.id, s]));
  const seq = ORDER.map(id => byId[id]);

  // sidebar tree
  const dirs = [];
  SCENES.forEach(s => { let d = dirs.find(x => x.name === s.dir); if (!d) dirs.push(d = { name: s.dir, files: [] }); d.files.push(s); });
  const CHEV = '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>';
  side.innerHTML = `<div class="side-head"><span>folio-demo</span><span>···</span></div>` + dirs.map(d =>
    `<div class="tree-dir">${CHEV}${d.name}</div>` + d.files.map(s =>
      `<button class="tree-file" type="button" tabindex="-1" data-id="${s.id}"><span class="ext">${s.ext}</span><span class="nm">${s.file}</span>${s.label ? `<i class="lab" style="background:${s.label}"></i>` : ''}</button>`).join('')).join('');

  // chips
  chipsEl.innerHTML = seq.map((s, i) =>
    `<button class="chip" type="button" role="tab" id="chip-${s.id}" data-id="${s.id}" aria-selected="false" aria-controls="winMain" tabindex="${i ? -1 : 0}"><span class="fx">${s.ext}</span><span class="lbl" ${s.chipI18n ? `data-i18n="${s.chip}"` : ''}>${s.chipI18n ? t(s.chip) : s.chip}</span><i class="bar"></i></button>`).join('');

  // scene hosts
  SCENES.forEach(s => {
    const el = document.createElement('div');
    el.className = 'scene';
    el.dataset.id = s.id;
    el.setAttribute('role', 'tabpanel');
    el.setAttribute('aria-labelledby', 'chip-' + s.id);
    main.insertBefore(el, $('#winStatus'));
    s.el = el;
  });

  // ---------- state ----------
  let current = null, timeline = null, opened = [], stageVisible = true;
  const reasons = new Set();

  function setNote(s) {
    const note = $('.pill-note', s.el);
    if (note) note.innerHTML = `<b>●</b> ${t(s.note)}`;
  }
  function renderTabs(s) {
    if (!opened.includes(s.id)) {
      opened.push(s.id);
      if (opened.length > 4) {
        const gone = opened.shift();
        const el = $(`.tab[data-id="${gone}"]`, tabsEl);
        if (el) { el.classList.add('out'); setTimeout(() => el.remove(), 180); }
      }
      const tab = document.createElement('div');
      tab.className = 'tab';
      tab.dataset.id = s.id;
      tab.innerHTML = `<span class="ext">${s.ext}</span>${s.file}`;
      tabsEl.appendChild(tab);
    }
    $$('.tab', tabsEl).forEach(el => el.classList.toggle('on', el.dataset.id === s.id));
  }

  function select(id, { user = false, focus = false } = {}) {
    const s = byId[id];
    if (!s) return;
    if (current === s) { if (user) stopAuto(); return; }
    if (timeline) timeline.stop();
    if (current) current.el.classList.remove('on');
    current = s;
    timeline = makeTimeline();
    s.el.innerHTML = s.build();
    s.el.classList.add('on');
    setNote(s);
    s.enter(s.el, timeline, reduced);
    renderTabs(s);
    $$('.tree-file', side).forEach(b => b.classList.toggle('on', b.dataset.id === id));
    stFile.textContent = s.file;
    stKind.textContent = t(s.kind);
    $$('.chip', chipsEl).forEach(c => {
      const on = c.dataset.id === id;
      c.setAttribute('aria-selected', String(on));
      c.tabIndex = on ? 0 : -1;
      if (on) {
        c.style.setProperty('--dur', s.dur + 'ms');
        const bar = $('.bar', c);
        bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
        if (focus) c.focus();
        // keep the active chip in view inside the scroller without moving the page
        const cr = chipsEl.getBoundingClientRect(), r = c.getBoundingClientRect();
        if (r.left < cr.left || r.right > cr.right) chipsEl.scrollTo({ left: c.offsetLeft - chipsEl.clientWidth / 2 + c.clientWidth / 2, behavior: reduced ? 'auto' : 'smooth' });
      }
    });
    if (user) stopAuto();
  }

  // ---------- autoplay ----------
  let stopped = reduced;
  function syncDock() {
    dock.classList.toggle('paused', reasons.size > 0);
    dock.classList.toggle('stopped', stopped);
    dock.classList.toggle('static', reduced);
    playBtn.setAttribute('aria-pressed', String(stopped));
    playBtn.setAttribute('aria-label', t(stopped ? 'hero.play' : 'hero.pause'));
  }
  function stopAuto() { stopped = true; syncDock(); }
  function startAuto() {
    stopped = false;
    const bar = $('.chip[aria-selected="true"] .bar', chipsEl);
    if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
    syncDock();
  }
  const next = step => {
    const i = seq.indexOf(current);
    return seq[(i + step + seq.length) % seq.length];
  };
  chipsEl.addEventListener('animationend', e => {
    if (!e.target.classList.contains('bar') || stopped) return;
    select(next(1).id);
  });
  playBtn.addEventListener('click', () => { stopped ? startAuto() : stopAuto(); });

  chipsEl.addEventListener('click', e => {
    const c = e.target.closest('.chip');
    if (c) select(c.dataset.id, { user: true });
  });
  chipsEl.addEventListener('keydown', e => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (e.key in keys) { e.preventDefault(); select(next(keys[e.key]).id, { user: true, focus: true }); }
    else if (e.key === 'Home') { e.preventDefault(); select(seq[0].id, { user: true, focus: true }); }
    else if (e.key === 'End') { e.preventDefault(); select(seq[seq.length - 1].id, { user: true, focus: true }); }
  });
  side.addEventListener('click', e => { const b = e.target.closest('.tree-file'); if (b) select(b.dataset.id, { user: true }); });

  // temporary pauses: hover, focus, off-screen, hidden tab
  if (matchMedia('(hover: hover)').matches) {
    stage.addEventListener('mouseenter', () => { reasons.add('hover'); syncDock(); });
    stage.addEventListener('mouseleave', () => { reasons.delete('hover'); syncDock(); });
  }
  dock.addEventListener('focusin', () => { reasons.add('focus'); syncDock(); });
  dock.addEventListener('focusout', () => { reasons.delete('focus'); syncDock(); });
  new IntersectionObserver(([en]) => {
    stageVisible = en.isIntersecting;
    stageVisible ? reasons.delete('offscreen') : reasons.add('offscreen');
    syncDock();
  }, { threshold: 0.2 }).observe(stage);
  document.addEventListener('visibilitychange', () => { document.hidden ? reasons.add('hidden') : reasons.delete('hidden'); syncDock(); });

  document.addEventListener('langchange', () => {
    $$('.chip .lbl[data-i18n]', chipsEl).forEach(l => { l.textContent = t(l.dataset.i18n); });
    if (current) { stKind.textContent = t(current.kind); setNote(current); }
    syncDock();
  });

  // go
  select('swift');
  syncDock();
})();
