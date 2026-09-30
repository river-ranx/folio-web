// ===== Bento micro-demos, chaptered recordings, full-edition palette =====
(() => {
  const { $, $$, makeTimeline } = window.folio;
  const reduced = window.folio.reduced();
  const t = k => i18n.t(k);
  const still = () => window.folio.paused();

  // Run `on()` while `el` is on screen, `off()` otherwise.
  function whenVisible(el, on, off, threshold = 0.25) {
    new IntersectionObserver(([en]) => en.isIntersecting ? on() : off && off(), { threshold }).observe(el);
  }

  // =====================================================================
  // Bento
  // =====================================================================

  // ----- Workspaces that remember -----
  (() => {
    const vis = $('#wsVis');
    if (!vis) return;
    const WS = [
      { files: ['ch1-intro.md', 'ch2-method.md', 'refs.pdf', 'data.csv'], on: 1, scroll: 46 },
      { files: ['brief.docx', 'kickoff.pptx', 'budget.xlsx', 'logo.png'], on: 1, scroll: 96 },
      { files: ['ideas.md', 'reading-list.md', 'sketch.png'], on: 0, scroll: 12 }
    ];
    const tabs = $$('.ws-tab', vis), tree = $('#wsTree'), scroll = $('#wsScroll'), pane = $('#wsPane'), restore = $('#wsRestore');
    const widths = [[92, 78, 88, 64, 84, 70, 90, 58, 80, 86, 62, 74, 88, 66, 82, 76], [84, 90, 60, 78, 92, 68, 80, 72, 88, 56, 84, 76, 64, 90, 70, 82], [70, 88, 76, 92, 58, 84, 66, 80, 90, 62, 78, 86, 72, 60, 88, 74]];
    let cur = -1, auto = !reduced, visible = false, first = true;
    const show = (i, user) => {
      if (i === cur) return;
      cur = i;
      tabs.forEach((b, k) => { b.setAttribute('aria-selected', String(k === i)); b.tabIndex = k === i ? 0 : -1; });
      const w = WS[i];
      tree.innerHTML = w.files.map((f, k) => `<div class="${k === w.on ? 'on' : ''}">${f}</div>`).join('');
      scroll.innerHTML = '<div class="ln h"></div>' + widths[i].map(p => `<div class="ln" style="width:${p}%"></div>`).join('');
      scroll.style.transform = `translateY(-${w.scroll}px)`;
      pane.classList.remove('swap'); void pane.offsetWidth; pane.classList.add('swap');
      restore.classList.remove('show'); void restore.offsetWidth;
      if (!first) restore.classList.add('show');
      first = false;
    };
    tabs.forEach((b, i) => {
      b.addEventListener('click', () => { auto = false; show(i, true); });
      b.addEventListener('keydown', e => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); const n = (cur + d + tabs.length) % tabs.length; auto = false; show(n, true); tabs[n].focus(); }
      });
    });
    show(0, false);
    if (!reduced) {
      const tick = () => { if (auto && visible && !still()) show((cur + 1) % WS.length, false); };
      setInterval(tick, 3600);
      whenVisible(vis, () => { visible = true; }, () => { visible = false; });
    }
  })();

  // ----- Search inside files -----
  (() => {
    const vis = $('#srVis');
    if (!vis) return;
    const Q = [
      { q: 'feedback', r: [['research-notes.pdf', 'PDF', 'p.4', '…each step adds <mark>feedback</mark> to the last, until the market…'], ['talk-outline.md', 'MD', '', '…the <mark>feedback</mark> loop is where the surprise lives…'], ['strategy.pptx', 'PPTX', 'slide 7', 'Fast markets and <mark>feedback</mark> gain']] },
      { q: 'launch', r: [['plan.docx', 'DOCX', '', '…<mark>launch</mark> checklist: press kit, pricing page, release notes…'], ['roadmap.xlsx', 'XLSX', 'row 14', '<mark>Launch</mark> — public availability'], ['notes.md', 'MD', '', '…before we <mark>launch</mark>, re-read the copy once more…']] },
      { q: 'invoice', r: [['march-invoice.pdf', 'PDF', 'p.1', '<mark>Invoice</mark> no. 0142 — payment due in 14 days'], ['clients.csv', 'CSV', 'row 8', 'Acme Studio, <mark>invoice</mark> sent, awaiting reply'], ['terms.docx', 'DOCX', '', '…each <mark>invoice</mark> is issued at month end…']] }
    ];
    const text = $('#srText'), list = $('#srList');
    const paint = (qi, chars) => {
      const d = Q[qi];
      text.textContent = d.q.slice(0, chars);
    };
    const results = qi => {
      list.innerHTML = Q[qi].r.map(([n, e, w, s]) => `<div class="sr-item"><div class="nm">${n}<em>${e}</em>${w ? `<span style="color:var(--mute)">${w}</span>` : ''}</div><div>${s}</div></div>`).join('');
    };
    if (reduced) { paint(0, 99); results(0); $$('.sr-item', list).forEach(el => el.classList.add('show')); return; }
    let T = null, qi = 0, visible = false, idle = false;
    const run = () => {
      idle = false;
      T && T.stop();
      T = makeTimeline();
      const d = Q[qi];
      list.innerHTML = '';
      paint(qi, 0);
      [...d.q].forEach((_, i) => T.at(500 + i * 85, () => paint(qi, i + 1)));
      const tEnd = 500 + d.q.length * 85 + 200;
      T.at(tEnd, () => { results(qi); $$('.sr-item', list).forEach((el, i) => setTimeout(() => el.classList.add('show'), i * 110)); });
      T.at(tEnd + 3400, () => { if (still()) { idle = true; return; } qi = (qi + 1) % Q.length; run(); });
    };
    whenVisible(vis, () => { if (!visible) { visible = true; run(); } }, () => { visible = false; T && T.stop(); });
    document.addEventListener('motionchange', () => { if (!still() && idle && visible) { idle = false; qi = (qi + 1) % Q.length; run(); } });
  })();

  // ----- Language cloud -----
  (() => {
    const cloud = $('#langCloud');
    if (!cloud) return;
    const L = ['Swift', 'TypeScript', 'Python', 'Rust', 'Go', 'Java', 'Kotlin', 'C', 'C++', 'C#', 'Ruby', 'PHP', 'Lua', 'Dart', 'Scala', 'SQL', 'Shell', 'YAML', 'JSON', 'HTML', 'CSS', 'GraphQL', 'R', 'Perl'];
    cloud.innerHTML = L.map(n => `<span>${n}</span>`).join('');
    const pills = $$('span', cloud);
    pills[0].classList.add('lit');
    if (reduced) return;
    let visible = false, last = 0;
    whenVisible(cloud, () => { visible = true; }, () => { visible = false; });
    setInterval(() => {
      if (!visible || still()) return;
      pills[last].classList.remove('lit');
      let n; do { n = Math.floor(Math.random() * pills.length); } while (n === last);
      last = n; pills[n].classList.add('lit');
    }, 650);
  })();

  // ----- Theme swatches -----
  (() => {
    const box = $('#swatches'), win = $('#thWin');
    if (!box) return;
    const C = ['#EE7F1F', '#E5484D', '#E93D82', '#B58CFF', '#6E56CF', '#3E63DD', '#0090FF', '#12A594', '#30A46C', '#8DA101', '#A18072', '#F5B942', '#7ED0E4', '#8B8D98', '#D9CBB0'];
    box.innerHTML = C.map((c, i) => `<button type="button" style="--c:${c}" aria-pressed="${i === 0}" aria-label="${i + 1}"></button>`).join('');
    const btns = $$('button', box);
    let cur = 0, auto = !reduced, visible = false;
    const set = i => {
      cur = i;
      btns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
      win.style.setProperty('--th', C[i]);
    };
    btns.forEach((b, i) => b.addEventListener('click', () => { auto = false; set(i); }));
    set(0);
    if (!reduced) {
      whenVisible(box, () => { visible = true; }, () => { visible = false; });
      setInterval(() => { if (auto && visible && !still()) set((cur + 1) % C.length); }, 1300);
    }
  })();

  // ----- Color labels -----
  (() => {
    const list = $('#lbList');
    if (!list) return;
    const COL = [null, '#E5484D', '#F5B942', '#30A46C', '#3E63DD', '#B58CFF'];
    const F = [['PDF', 'q3-report.pdf', 1], ['MD', 'roadmap.md', 4], ['DOC', 'contract.docx', 0], ['PNG', 'hero.png', 3], ['CSV', 'leads.csv', 0]];
    list.innerHTML = F.map(([e, n, c], i) => `<button class="lb-row" type="button" data-i="${i}"><span class="fx">${e}</span>${n}<span class="dot" ${COL[c] ? `data-c style="--c:${COL[c]}"` : ''}></span></button>`).join('');
    const state = F.map(f => f[2]);
    list.addEventListener('click', e => {
      const row = e.target.closest('.lb-row');
      if (!row) return;
      const i = +row.dataset.i;
      state[i] = (state[i] + 1) % COL.length;
      const dot = $('.dot', row);
      if (COL[state[i]]) { dot.setAttribute('data-c', ''); dot.style.setProperty('--c', COL[state[i]]); } else { dot.removeAttribute('data-c'); dot.style.removeProperty('--c'); }
      dot.classList.remove('pop'); void dot.offsetWidth; dot.classList.add('pop');
    });
  })();

  // ----- Glass parallax -----
  (() => {
    const card = $('#glassCard');
    if (!card || reduced || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const blobs = $$('.blob', card), pane = $('#glPane');
    let raf = 0, px = 0, py = 0;
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5; py = (e.clientY - r.top) / r.height - 0.5;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        blobs.forEach((b, i) => { b.style.transform = `translate3d(${px * (60 + i * 30)}px, ${py * (40 + i * 20)}px, 0)`; });
        pane.style.transform = `translate3d(${px * 10}px, ${py * 8}px, 0)`;
      });
    });
    card.addEventListener('pointerleave', () => {
      blobs.forEach(b => { b.style.transform = ''; });
      pane.style.transform = '';
    });
  })();

  // ----- Finder + Quick Look -----
  (() => {
    const vis = $('#fdVis');
    if (!vis) return;
    const list = $('#fdList'), key = $('#fdKey'), ql = $('#fdQl'), name = $('#fdQlName'), body = $('#fdQlBody');
    const row = (a, b, c, h) => `<div class="rw${h ? ' h' : ''}"><span>${a}</span><span>${b}</span><span>${c}</span></div>`;
    const F = [
      { ext: 'MD', n: 'notes.md', html: '<b>Launch notes</b><span class="m">Headings, lists and checkboxes — <i>rendered</i>, not raw markup.</span>☑ Write the copy\n☐ Record the demo\n☐ Ship it' },
      { ext: 'RS', n: 'main.rs', html: '<span class="t-kw">fn</span> <span class="t-fn">main</span>() {\n    <span class="t-kw">let</span> app = <span class="t-st">"Folio"</span>;\n    println!(<span class="t-st">"hello, {app}"</span>);\n}' },
      { ext: 'DB', n: 'app.sqlite', html: row('id', 'name', 'plan', 1) + row(1, 'Ada', 'free') + row(2, 'Grace', 'team') + row(3, 'Alan', 'free') },
      { ext: 'JS', n: 'config.json', html: '{\n  <span class="t-ty">"theme"</span>: <span class="t-st">"midnight"</span>,\n  <span class="t-ty">"tabs"</span>: <span class="t-kw">true</span>,\n  <span class="t-ty">"size"</span>: <span class="t-fn">14</span>\n}' }
    ];
    list.innerHTML = F.map((f, i) => `<button class="fd-row" type="button" data-i="${i}" tabindex="${i ? -1 : 0}"><span class="fx">${f.ext}</span>${f.n}</button>`).join('');
    const rows = $$('.fd-row', list);
    let T = null, cur = 0, auto = !reduced, visible = false, idle = false;
    const paint = i => {
      cur = i;
      rows.forEach((r, k) => { r.classList.toggle('on', k === i); r.tabIndex = k === i ? 0 : -1; });
      name.textContent = F[i].n;
      body.innerHTML = F[i].html;
    };
    const play = () => {
      idle = false;
      T && T.stop();
      T = makeTimeline();
      ql.classList.remove('on');
      paint(cur);
      T.at(450, () => key.classList.add('down'));
      T.at(650, () => ql.classList.add('on'));
      T.at(800, () => key.classList.remove('down'));
      T.at(3300, () => ql.classList.remove('on'));
      T.at(3800, () => { if (still()) { idle = true; ql.classList.add('on'); return; } cur = (cur + 1) % F.length; play(); });
      T.onStop(() => key.classList.remove('down'));
    };
    const manual = i => { auto = false; T && T.stop(); paint(i); ql.classList.add('on'); };
    rows.forEach((r, i) => {
      r.addEventListener('click', () => manual(i));
      r.addEventListener('keydown', e => {
        const d = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
        if (d) { e.preventDefault(); const n = (cur + d + F.length) % F.length; manual(n); rows[n].focus(); }
      });
    });
    if (reduced) { paint(0); ql.classList.add('on'); return; }
    paint(0);
    whenVisible(vis, () => { visible = true; if (auto) play(); }, () => { visible = false; T && T.stop(); }, 0.3);
    document.addEventListener('motionchange', () => { if (!still() && idle && visible && auto) { cur = (cur + 1) % F.length; play(); } });
  })();

  // =====================================================================
  // Chaptered player: “Open it. Edit it. Send it out.”
  // =====================================================================
  (() => {
    const box = $('#showcase');
    if (!box) return;
    const chapters = $$('.chapter', box);
    const layers = $$('.layer', $('#frame'));
    const pauseBtn = $('#showPause');
    // one layer per chapter; dur = how long the chapter stays up (ms)
    const MAP = [
      { dur: 5500 },
      { dur: 14500 },
      { dur: 10500 },
      { dur: 5500 },
      { dur: 14000 }
    ];
    let cur = -1, stopped = reduced, visible = false;
    const reasons = new Set();

    const load = v => { if (v && v.tagName === 'VIDEO' && !v.getAttribute('src') && !reduced) { v.src = v.dataset.src; v.load(); } };
    const sync = () => {
      const paused = reasons.size > 0;
      box.classList.toggle('paused', paused);
      box.classList.toggle('stopped', stopped);
      pauseBtn.setAttribute('aria-pressed', String(stopped));
      const label = $('span', pauseBtn);
      label.dataset.i18n = stopped ? 'formats.resume' : 'formats.pause';
      label.textContent = t(label.dataset.i18n);
      const v = layers[cur];
      if (v.tagName === 'VIDEO' && v.getAttribute('src')) { v.loop = stopped; (paused || !visible) ? v.pause() : v.play().catch(() => {}); }
    };
    const restartBar = c => { const b = $('.bar', c); b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; };

    function activate(i, user) {
      if (i === cur && !user) return;
      cur = i;
      chapters.forEach((c, k) => {
        c.setAttribute('aria-selected', String(k === i));
        c.tabIndex = k === i ? 0 : -1;
        if (k === i) {
          c.style.setProperty('--dur', MAP[i].dur + 'ms');
          restartBar(c);
        }
      });
      layers.forEach((l, k) => l.classList.toggle('on', k === i));
      layers.forEach((l, k) => { if (k !== i && l.tagName === 'VIDEO') l.pause(); });
      const v = layers[i];
      if (v.tagName === 'VIDEO') {
        if (v.getAttribute('src')) { try { v.currentTime = 0; } catch (e) {} } else load(v);
      }
      // preload the next recording one chapter ahead
      load(layers[i + 1]);
      if (user) { stopped = true; }
      sync();
    }

    document.addEventListener('motionchange', () => { still() ? reasons.add('still') : reasons.delete('still'); sync(); });
    box.addEventListener('animationend', e => {
      if (!e.target.classList.contains('bar') || stopped) return;
      activate((cur + 1) % MAP.length, false);
    });
    chapters.forEach((c, i) => {
      c.addEventListener('click', () => activate(i, true));
      c.addEventListener('keydown', e => {
        const d = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ? -1 : 0;
        if (d) { e.preventDefault(); const n = (cur + d + MAP.length) % MAP.length; activate(n, true); chapters[n].focus(); }
      });
    });
    pauseBtn.addEventListener('click', () => {
      stopped = !stopped;
      if (!stopped) restartBar(chapters[cur]);
      sync();
    });
    if (matchMedia('(hover: hover)').matches) {
      $('.device', box).addEventListener('mouseenter', () => { reasons.add('hover'); sync(); });
      $('.device', box).addEventListener('mouseleave', () => { reasons.delete('hover'); sync(); });
    }
    whenVisible($('.device', box), () => { visible = true; reasons.delete('offscreen'); load(layers[1]); sync(); }, () => { visible = false; reasons.add('offscreen'); sync(); }, 0.35);
    reasons.add('offscreen');
    if (reduced) pauseBtn.hidden = true;
    activate(0, false);
    if (reduced) { stopped = true; sync(); }
  })();

  // =====================================================================
  // Full edition: palette + terminal illustrations
  // =====================================================================
  (() => {
    const pal = $('#palette'), body = $('#termBody');
    if (!pal) return;
    const rows = $$('.pal-row', pal);
    const title = $('#termTitle');
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

    // typed terminal line helper
    const typeInto = (T, el, text, start, speed = 38) => {
      [...text].forEach((_, i) => T.at(start + i * speed, () => { el.textContent = text.slice(0, i + 1); }));
      return start + text.length * speed;
    };
    const pop = (T, el, at) => T.at(at, () => { el.classList.add('in'); });

    const S = [
      { title: 'zsh — ~/site', dur: 8500,
        html: () => `<div class="blk"><div class="hd"><b>~/site</b> · main</div><div class="tl"><span class="p">❯</span> <span class="cmd"></span><span class="caret"></span></div></div>
                     <div class="blk out b2"><div class="hd"><b>~/site</b> · main</div><div class="tl"><span class="p">❯</span> <span class="cmd"></span></div><div class="tl out o2"><span class="d">M  src/app.ts\n?? notes.md</span></div></div>
                     <div class="blk out b3"><div class="hd"><b>~/site</b> · main</div><div class="tl"><span class="p">❯</span> <span class="cmd"></span></div><div class="tl out o3"><span class="g">✓ build complete</span></div></div>`,
        run(T, root, settled) {
          const cmds = $$('.cmd', root), o2 = $('.o2', root), o3 = $('.o3', root), b2 = $('.b2', root), b3 = $('.b3', root);
          const c = ['git status --short', 'npm run build'];
          const first = $('.caret', root);
          const setup = () => { cmds[0].textContent = 'git branch --show-current'; };
          const showAll = () => { const o1 = document.createElement('div'); o1.className = 'tl'; o1.textContent = 'main'; cmds[0].parentElement.after(o1); cmds[1].textContent = c[0]; cmds[2].textContent = c[1]; [b2, b3, o2, o3].forEach(el => el.classList.add('in')); first.remove(); };
          if (settled) { setup(); showAll(); return; }
          let at = typeInto(T, cmds[0], 'git branch --show-current', 500);
          T.at(at + 150, () => { const o1 = document.createElement('div'); o1.className = 'tl out'; o1.textContent = 'main'; cmds[0].parentElement.after(o1); requestAnimationFrame(() => o1.classList.add('in')); first.remove(); });
          T.at(at + 900, () => b2.classList.add('in'));
          at = typeInto(T, cmds[1], c[0], at + 1000);
          pop(T, o2, at + 200);
          T.at(at + 1200, () => b3.classList.add('in'));
          at = typeInto(T, cmds[2], c[1], at + 1300);
          pop(T, o3, at + 500);
        } },
      { title: 'Git — Changes', dur: 7000,
        html: () => `<div class="diff"><div class="diff-h"><span>src/open.swift</span><span class="stg">${t('term.git.stage')}</span></div>
          <div class="dl hunk"><span class="n"></span>@@ -12,7 +12,9 @@ func openFile(_ url: URL)</div>
          <div class="dl del"><span class="n">14</span>-    let view = ViewerFactory.make(url)</div>
          <div class="dl add"><span class="n">14</span>+    guard let view = ViewerFactory.make(url) else {</div>
          <div class="dl add"><span class="n">15</span>+        return showUnsupported(url)</div>
          <div class="dl add"><span class="n">16</span>+    }</div>
          <div class="dl"><span class="n">17</span>     present(view)</div></div><div class="git-note">${t('term.git.note')}</div>`,
        run(T, root, settled) {
          const btn = $('.stg', root), ls = $$('.dl.add, .dl.del', root);
          const done = () => { btn.classList.add('done'); btn.textContent = t('term.git.staged'); ls.forEach(l => l.classList.add('staged')); };
          if (settled) { done(); return; }
          T.at(1800, done);
        } },
      { title: 'Claude Code', dur: 9000, cli: true,
        html: () => `<div class="cli-tabs"><span class="cli-tab on">Claude Code</span><span class="cli-tab">Codex CLI</span><span class="cli-tab">Antigravity CLI</span></div>
          <div class="tl"><span class="p">›</span> <span class="cmd"></span><span class="caret"></span></div>
          <div class="tl out l1"><span class="b">●</span> Reading SettingsView.swift</div>
          <div class="tl out l2"><span class="b">●</span> Editing Theme.swift</div>
          <div class="tl out l3"><span class="g">✓</span> Added a dark theme to the settings pane</div>
          <div class="tl out l4"><span class="d">esc to interrupt · shift+tab to cycle</span></div>`,
        run(T, root, settled) {
          const cmd = $('.cmd', root), ls = ['l1', 'l2', 'l3', 'l4'].map(c => $('.' + c, root)), caret = $('.caret', root);
          const text = 'add a dark theme to the settings pane';
          if (settled) { cmd.textContent = text; ls.forEach(l => l.classList.add('in')); caret.remove(); return; }
          const at = typeInto(T, cmd, text, 600, 34);
          T.at(at + 200, () => caret.remove());
          ls.forEach((l, i) => pop(T, l, at + 700 + i * 650));
        } },
      { title: 'Snapshots', dur: 7000,
        html: () => `<div class="snaps"><div class="snap new"><span class="v">12</span>${t('term.snap.now')}<span class="m">just now</span></div>
          <div class="snap"><span class="v">11</span>Today · 10:24<span class="m">draft-v3.docx</span><span class="rs">${t('term.snap.restore')}</span></div>
          <div class="snap"><span class="v">10</span>Yesterday<span class="m">notes.md</span><span class="rs">${t('term.snap.restore')}</span></div>
          <div class="snap"><span class="v">9</span>Last week<span class="m">budget.xlsx</span><span class="rs">${t('term.snap.restore')}</span></div></div>
          <div class="keep">${t('term.snap.keep').map(s => `<span>${s}</span>`).join('')}</div>`,
        run(T, root, settled) {
          const n = $('.snap.new', root);
          if (settled) { n.classList.add('in'); return; }
          T.at(900, () => n.classList.add('in'));
        } },
      { title: 'Tasks', dur: 8500,
        html: () => `<div class="tasks"><div class="tk-list"><div class="tk"><span class="bx"></span>Review pull request</div><div class="tk"><span class="bx"></span>Write release notes</div><div class="tk"><span class="bx"></span>Reply to Sam</div><div class="tk new"><span class="bx"></span>Ship the changelog<span class="go">${t('term.tk.go')}</span></div></div>
          <div class="mcp"><div class="cap">${t('term.mcp.cap')}</div><div class="tl"><span class="p">→</span> <span class="fn"></span></div><div class="tl out a1"><span class="d">  {"title": "Ship the changelog", "scope": "today"}</span></div><div class="tl out a2"><span class="g">✓ create_task</span></div></div></div>`,
        run(T, root, settled) {
          const fn = $('.fn', root), a1 = $('.a1', root), a2 = $('.a2', root), n = $('.tk.new', root);
          if (settled) { fn.textContent = 'create_task'; [a1, a2, n].forEach(e => e.classList.add('in')); return; }
          const at = typeInto(T, fn, 'create_task', 500, 45);
          pop(T, a1, at + 250);
          pop(T, a2, at + 900);
          T.at(at + 1100, () => n.classList.add('in'));
        } },
      { title: 'Translate', dur: 8000,
        html: () => `<div class="trans"><div class="trans-row"><small>${t('term.tr.src')}</small>${t('term.tr.s1')}</div><div class="trans-row tr"><small>${t('term.tr.dst')}</small><span class="dst"></span></div>
          <div class="backends"><span>Apple</span><span>Gemini CLI</span><span>Google Cloud</span><span>Ollama</span></div></div>`,
        run(T, root, settled) {
          const dst = $('.dst', root), bs = $$('.backends span', root), txt = t('term.tr.d1');
          if (settled) { dst.textContent = txt; bs[0].classList.add('on'); return; }
          bs.forEach((b, i) => T.at(400 + i * 1400, () => { bs.forEach(x => x.classList.remove('on')); b.classList.add('on'); if (i === 1) typeInto(T, dst, txt, 100, 60); }));
        } }
    ];

    const scenes = S.map((s, i) => { const el = document.createElement('div'); el.className = 'tscene'; body.appendChild(el); return el; });
    let cur = -1, T = null, stopped = reduced;
    const reasons = new Set(['offscreen']);
    const sync = () => { pal.classList.toggle('paused', reasons.size > 0); pal.classList.toggle('stopped', stopped); };
    const restartBar = r => { const b = $('.bar', r); b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; };

    function select(i, user) {
      if (i === cur) { if (user) { stopped = true; sync(); } return; }
      T && T.stop();
      T = makeTimeline();
      cur = i;
      const s = S[i];
      scenes.forEach((el, k) => el.classList.toggle('on', k === i));
      scenes[i].innerHTML = s.html();
      s.run(T, scenes[i], reduced);
      title.textContent = s.title;
      rows.forEach((r, k) => {
        r.setAttribute('aria-selected', String(k === i));
        r.tabIndex = k === i ? 0 : -1;
        if (k === i) { r.style.setProperty('--dur', s.dur + 'ms'); restartBar(r); }
      });
      if (user) stopped = true;
      sync();
    }
    document.addEventListener('motionchange', () => { still() ? reasons.add('still') : reasons.delete('still'); sync(); });
    pal.addEventListener('animationend', e => { if (e.target.classList.contains('bar') && !stopped) select((cur + 1) % S.length); });
    rows.forEach((r, i) => {
      r.addEventListener('click', () => select(i, true));
      r.addEventListener('keydown', e => {
        const d = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
        if (d) { e.preventDefault(); const n = (cur + d + S.length) % S.length; select(n, true); rows[n].focus(); }
      });
    });
    if (matchMedia('(hover: hover)').matches) {
      const g = pal.closest('.full-grid');
      g.addEventListener('mouseenter', () => { reasons.add('hover'); sync(); });
      g.addEventListener('mouseleave', () => { reasons.delete('hover'); sync(); });
    }
    whenVisible(pal.closest('.full-grid'), () => { reasons.delete('offscreen'); sync(); }, () => { reasons.add('offscreen'); sync(); }, 0.3);
    document.addEventListener('langchange', () => { if (cur >= 0) { scenes[cur].innerHTML = S[cur].html(); S[cur].run(T, scenes[cur], true); } });
    select(0);
  })();

  // =====================================================================
  // Real recordings (lazy, only play in view)
  // =====================================================================
  (() => {
    const full = $('#fullVid'), cli = $('#cliVid'), chips = $$('.rec-chip', $('#fullChips'));
    if (!full) return;
    if (reduced) { $('#fullChips').hidden = true; return; }
    const ensure = v => { if (!v.getAttribute('src')) { v.src = v.dataset.src; v.load(); } };
    let visible = false, cliVisible = false, cur = 0, auto = true;
    const play = v => { if (!window.folio.paused()) v.play().catch(() => {}); };
    // each chip is its own short clip: no seeking, so it also works on servers without Range support
    const go = (i, user) => {
      cur = i;
      if (user) auto = false;
      chips.forEach((c, k) => c.setAttribute('aria-selected', String(k === i)));
      full.poster = `assets/video/full-${i + 1}-poster.webp`;
      full.src = `assets/video/full-${i + 1}.mp4`;
      full.load();
      if (visible) play(full);
    };
    full.addEventListener('ended', () => {
      if (auto) go((cur + 1) % chips.length);
      else { full.currentTime = 0; play(full); }
    });
    chips.forEach((c, i) => c.addEventListener('click', () => { visible = true; go(i, true); }));
    whenVisible(full, () => { visible = true; ensure(full); play(full); }, () => { visible = false; full.pause(); }, 0.35);
    document.addEventListener('motionchange', () => { if (window.folio.paused()) { full.pause(); cli.pause(); } else { if (visible) play(full); if (cliVisible) play(cli); } });
    cli.loop = true;
    whenVisible(cli, () => { cliVisible = true; ensure(cli); play(cli); }, () => { cliVisible = false; cli.pause(); }, 0.35);
  })();
})();
