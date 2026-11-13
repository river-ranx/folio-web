// 17 种文件格式的程序化卡面。顺序与 i18n 的 formats.list 一一对应。
// 文件名取自产品截图里真实出现的示例文件，卡片与截图互相印证。
export const TYPES = [
  { id: 'pdf',     name: 'tracemonkey-paper.pdf',   ext: 'PDF',     c: '#F0605D', ar: 0.76, screen: 'office' },
  { id: 'docx',    name: 'product-brief.docx',      ext: 'DOCX',    c: '#5B8CFF', ar: 0.76, screen: 'office' },
  { id: 'xlsx',    name: 'quarterly-report.xlsx',   ext: 'XLSX',    c: '#3DC08A', ar: 1.3,  screen: 'office' },
  { id: 'pptx',    name: 'launch-deck.pptx',        ext: 'PPTX',    c: '#FF7A45', ar: 1.6,  screen: 'office' },
  { id: 'pages',   name: 'letter.pages',            ext: 'PAGES',   c: '#FFB340', ar: 0.76, screen: 'office' },
  { id: 'numbers', name: 'budget.numbers',          ext: 'NUMBERS', c: '#4FD28A', ar: 1.3,  screen: 'office' },
  { id: 'key',     name: 'keynote-pitch.key',       ext: 'KEY',     c: '#4DA3FF', ar: 1.6,  screen: 'office' },
  { id: 'md',      name: 'getting-started.md',      ext: 'MD',      c: '#B596FF', ar: 0.8,  screen: 'markdown' },
  { id: 'code',    name: 'FileViewer.swift',        ext: 'SWIFT',   c: '#FF8A5B', ar: 1.15, screen: 'code' },
  { id: 'img',     name: 'landscape-01.jpg',        ext: 'JPG',     c: '#FF8FB5', ar: 1.4,  screen: 'image' },
  { id: 'audio',   name: 'episode-12.mp3',          ext: 'MP3',     c: '#F5C84C', ar: 1.35, screen: 'video' },
  { id: 'video',   name: 'big-buck-bunny-10s.mp4',  ext: 'MP4',     c: '#FF6B6B', ar: 1.7,  screen: 'video' },
  { id: '3d',      name: 'teapot.usdz',             ext: 'USDZ',    c: '#35D4C4', ar: 1.15, screen: 'welcome' },
  { id: 'db',      name: 'Chinook.sqlite',          ext: 'SQLITE',  c: '#9AA7BD', ar: 1.1,  screen: 'welcome' },
  { id: 'csv',     name: 'data.csv',                ext: 'CSV',     c: '#78DDA8', ar: 1.25, screen: 'welcome' },
  { id: 'font',    name: 'Roboto-Regular.ttf',      ext: 'TTF',     c: '#E8B98A', ar: 0.92, screen: 'welcome' },
  { id: 'zip',     name: 'Backup.zip',              ext: 'ZIP',     c: '#C49A6C', ar: 0.92, screen: 'welcome' },
];

const H = 420;
const MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';
const SANS = 'Inter, -apple-system, "Segoe UI", sans-serif';

function rgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// 确定性伪随机：同一张卡每次绘制一致
function prng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function bars(ctx, x, y, w, rows, gap, h, rnd, color) {
  ctx.fillStyle = color;
  for (let i = 0; i < rows; i++) {
    const last = i === rows - 1;
    const ww = w * (last ? 0.4 + rnd() * 0.3 : 0.82 + rnd() * 0.18);
    rr(ctx, x, y + i * gap, ww, h, h / 2);
    ctx.fill();
  }
}

function painters() {
  return {
    pdf(ctx, x, y, w, h, t, rnd) {
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      rr(ctx, x, y, w, 20, 4); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      rr(ctx, x + w * 0.12, y + 30, w * 0.76, 9, 4); ctx.fill();
      const colW = (w - 14) / 2;
      bars(ctx, x, y + 62, colW, 11, 15, 6, rnd, 'rgba(255,255,255,0.22)');
      bars(ctx, x + colW + 14, y + 62, colW, 11, 15, 6, rnd, 'rgba(255,255,255,0.22)');
      ctx.fillStyle = rgba(t.c, 0.9);
      rr(ctx, x, y + h - 20, 56, 12, 6); ctx.fill();
    },
    docx(ctx, x, y, w, h, t, rnd) {
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      rr(ctx, x, y, w * 0.62, 18, 5); ctx.fill();
      bars(ctx, x, y + 34, w, 4, 15, 6, rnd, 'rgba(255,255,255,0.24)');
      ctx.fillStyle = rgba(t.c, 0.85);
      rr(ctx, x, y + 108, 4, 44, 2); ctx.fill();
      bars(ctx, x + 14, y + 110, w - 14, 3, 15, 6, rnd, rgba(t.c, 0.5));
      bars(ctx, x, y + 168, w, 7, 15, 6, rnd, 'rgba(255,255,255,0.2)');
    },
    pages(ctx, x, y, w, h, t, rnd) {
      const g = ctx.createLinearGradient(x, y, x + w, y + 90);
      g.addColorStop(0, rgba(t.c, 0.9)); g.addColorStop(1, 'rgba(255,120,80,0.7)');
      ctx.fillStyle = g; rr(ctx, x, y, w, 88, 8); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; rr(ctx, x + 12, y + 56, w * 0.5, 12, 6); ctx.fill();
      bars(ctx, x, y + 108, w, 8, 15, 6, rnd, 'rgba(255,255,255,0.22)');
    },
    xlsx(ctx, x, y, w, h, t, rnd) { sheet(ctx, x, y, w, h, t, rnd, true); },
    numbers(ctx, x, y, w, h, t, rnd) { sheet(ctx, x, y, w, h, t, rnd, true); },
    csv(ctx, x, y, w, h, t) {
      ctx.font = `500 15px ${MONO}`; ctx.textBaseline = 'top';
      const rows = ['id,name,qty,price', '1,Folio,120,0.00', '2,Pro,86,0.00', '3,Notes,412,0.00', '4,Theme,15,0.00', '5,Cache,9,0.00', '6,Index,31,0.00'];
      rows.forEach((r, i) => {
        ctx.fillStyle = i === 0 ? t.c : 'rgba(255,255,255,0.6)';
        ctx.fillText(r, x, y + 4 + i * 26);
        if (i === 0) { ctx.fillStyle = rgba(t.c, 0.4); ctx.fillRect(x, y + 26, w, 1); }
      });
    },
    pptx(ctx, x, y, w, h, t) { slide(ctx, x, y, w, h, t, '#FF7A45', '#FFC46B'); },
    key(ctx, x, y, w, h, t) { slide(ctx, x, y, w, h, t, '#2F7BFF', '#7CC4FF'); },
    md(ctx, x, y, w, h, t) {
      ctx.textBaseline = 'top';
      ctx.font = `700 24px ${SANS}`; ctx.fillStyle = '#fff'; ctx.fillText('Why Folio?', x, y);
      ctx.font = `500 14px ${MONO}`;
      const L = [['- Preview for PDFs', 0], ['- QuickTime for video', 0], ['- Pages / Word', 0], ['- Numbers / Excel', 0]];
      L.forEach((l, i) => { ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillText(l[0], x, y + 44 + i * 24); });
      ctx.fillStyle = t.c; ctx.fillText('| Category | Examples |', x, y + 160);
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      for (let i = 0; i < 3; i++) ctx.fillRect(x, y + 186 + i * 26, w, 1);
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillText('Docs   PDF, Word, RTF', x, y + 194);
      ctx.fillText('Code   40+ languages', x, y + 220);
    },
    code(ctx, x, y, w, h, t) {
      ctx.textBaseline = 'top'; ctx.font = `500 14px ${MONO}`;
      const K = '#FF7AB2', T = '#7EE0C3', S = '#FFB86B', P = 'rgba(255,255,255,0.78)';
      const lines = [
        [['import ', K], ['SwiftUI', T]],
        [],
        [['struct ', K], ['FileViewer', T], [': View {', P]],
        [['  @State ', K], ['var ', K], ['file', P], [': URL?', T]],
        [['  var ', K], ['body', P], [': some View {', T]],
        [['    HSplitView {', P]],
        [['      sidebar', P]],
        [['        .frame(', P], ['minWidth', S], [': 220)', P]],
        [['    }', P]],
        [['  }', P]],
        [['}', P]],
      ];
      lines.forEach((ln, i) => {
        ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillText(String(i + 1).padStart(2, ' '), x, y + i * 22);
        let cx = x + 28;
        ln.forEach(([s, col]) => { ctx.fillStyle = col; ctx.fillText(s, cx, y + i * 22); cx += ctx.measureText(s).width; });
      });
    },
    img(ctx, x, y, w, h) {
      const g = ctx.createLinearGradient(0, y, 0, y + h);
      g.addColorStop(0, '#2B2F5A'); g.addColorStop(0.5, '#FF8A5B'); g.addColorStop(0.62, '#FFC27A'); g.addColorStop(0.62, '#1E4E6B'); g.addColorStop(1, '#0B1E2D');
      ctx.fillStyle = g; rr(ctx, x, y, w, h, 10); ctx.fill();
      ctx.save(); rr(ctx, x, y, w, h, 10); ctx.clip();
      ctx.fillStyle = '#FFE7B0'; ctx.beginPath(); ctx.arc(x + w * 0.68, y + h * 0.46, 22, 0, 7); ctx.fill();
      ctx.fillStyle = '#1B1A2E';
      ctx.beginPath(); ctx.moveTo(x, y + h * 0.66); ctx.lineTo(x + w * 0.28, y + h * 0.32); ctx.lineTo(x + w * 0.5, y + h * 0.62); ctx.lineTo(x + w * 0.62, y + h * 0.5); ctx.lineTo(x + w, y + h * 0.66); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      for (let i = 0; i < 6; i++) ctx.fillRect(x + (i * 53) % w, y + h * 0.7 + i * 12, 60, 2);
      ctx.restore();
    },
    audio(ctx, x, y, w, h, t, rnd) {
      const n = Math.floor(w / 9), mid = y + h * 0.46;
      for (let i = 0; i < n; i++) {
        const a = (Math.sin(i * 0.37) * 0.5 + 0.5) * 0.6 + rnd() * 0.4, bh = 10 + a * (h * 0.62);
        ctx.fillStyle = i / n < 0.38 ? t.c : 'rgba(255,255,255,0.3)';
        rr(ctx, x + i * 9, mid - bh / 2, 5, bh, 2.5); ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = `500 13px ${MONO}`; ctx.textBaseline = 'alphabetic';
      ctx.fillText('01:24', x, y + h - 2); ctx.textAlign = 'right'; ctx.fillText('03:41', x + w, y + h - 2); ctx.textAlign = 'left';
    },
    video(ctx, x, y, w, h, t) {
      const g = ctx.createLinearGradient(x, y, x + w, y + h);
      g.addColorStop(0, '#2C5A2A'); g.addColorStop(0.55, '#9DBB36'); g.addColorStop(1, '#1D3B22');
      ctx.fillStyle = g; rr(ctx, x, y, w, h - 22, 10); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.38)'; ctx.beginPath(); ctx.arc(x + w / 2, y + (h - 22) / 2, 34, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath();
      const cx = x + w / 2, cy = y + (h - 22) / 2;
      ctx.moveTo(cx - 9, cy - 15); ctx.lineTo(cx + 17, cy); ctx.lineTo(cx - 9, cy + 15); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; rr(ctx, x, y + h - 8, w, 4, 2); ctx.fill();
      ctx.fillStyle = t.c; rr(ctx, x, y + h - 8, w * 0.36, 4, 2); ctx.fill();
    },
    '3d'(ctx, x, y, w, h, t) {
      const cx = x + w / 2, cy = y + h / 2, s = Math.min(w, h) * 0.34;
      const P = (a, b, c) => { // 轴测投影
        const ca = Math.cos(0.7), sa = Math.sin(0.7), cb = Math.cos(0.5), sb = Math.sin(0.5);
        const x1 = a * ca - c * sa, z1 = a * sa + c * ca;
        return [cx + x1 * s, cy + (b * cb - z1 * sb) * s];
      };
      const V = []; for (let i = 0; i < 8; i++) V.push([(i & 1) * 2 - 1, ((i >> 1) & 1) * 2 - 1, ((i >> 2) & 1) * 2 - 1]);
      const E = [[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
      ctx.strokeStyle = t.c; ctx.lineWidth = 2; ctx.shadowColor = t.c; ctx.shadowBlur = 12;
      E.forEach(([a, b]) => { const p = P(...V[a]), q = P(...V[b]); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); });
      ctx.shadowBlur = 0; ctx.fillStyle = '#fff';
      V.forEach(v => { const p = P(...v); ctx.beginPath(); ctx.arc(p[0], p[1], 3, 0, 7); ctx.fill(); });
    },
    db(ctx, x, y, w, h, t) {
      ctx.textBaseline = 'top'; ctx.font = `500 13px ${MONO}`;
      const rows = [['ArtistId', 'Name'], ['1', 'AC/DC'], ['2', 'Accept'], ['3', 'Aerosmith'], ['4', 'Alanis'], ['5', 'Alice In Chains']];
      rows.forEach((r, i) => {
        const yy = y + i * 34;
        if (i === 0) { ctx.fillStyle = rgba(t.c, 0.22); rr(ctx, x - 6, yy - 6, w + 12, 28, 6); ctx.fill(); }
        ctx.fillStyle = i === 0 ? '#fff' : 'rgba(255,255,255,0.58)';
        ctx.fillText(r[0], x, yy); ctx.fillText(r[1], x + w * 0.34, yy);
        if (i > 0) { ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(x - 6, yy + 24, w + 12, 1); }
      });
    },
    font(ctx, x, y, w, h, t) {
      ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#fff';
      ctx.font = `400 132px Georgia, "Times New Roman", serif`; ctx.fillText('Aa', x - 2, y + 112);
      ctx.fillStyle = t.c; ctx.fillRect(x, y + 128, 44, 3);
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = `400 17px Georgia, serif`;
      ctx.fillText('ABCDEFGHIJKLM', x, y + 160); ctx.fillText('abcdefghijklm 0123', x, y + 184);
    },
    zip(ctx, x, y, w, h, t) {
      const cx = x + w / 2;
      for (let i = 0; i < 9; i++) {
        ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.85)' : t.c;
        rr(ctx, cx - 7 + (i % 2 ? 4 : -4), y + i * 20, 10, 12, 3); ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; rr(ctx, x, y + 6, w * 0.34, h - 20, 8); ctx.fill(); rr(ctx, x + w * 0.66, y + 6, w * 0.34, h - 20, 8); ctx.fill();
      ctx.fillStyle = t.c; rr(ctx, cx - 14, y + 190, 28, 34, 6); ctx.fill();
    },
  };
}

function sheet(ctx, x, y, w, h, t, rnd, chart) {
  const cols = 4, rows = 6, cw = w / cols, ch = Math.min(26, (h * (chart ? 0.5 : 0.8)) / rows);
  ctx.fillStyle = rgba(t.c, 0.22); ctx.fillRect(x, y, w, ch);
  for (let r = 0; r <= rows; r++) { ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(x, y + r * ch, w, 1); }
  for (let c = 0; c <= cols; c++) { ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(x + c * cw, y, 1, rows * ch); }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    ctx.fillStyle = r === 0 ? t.c : 'rgba(255,255,255,0.38)';
    rr(ctx, x + c * cw + 7, y + r * ch + ch / 2 - 3, cw * (0.3 + rnd() * 0.4), 6, 3); ctx.fill();
  }
  if (chart) {
    const by = y + rows * ch + 20, bh = h - rows * ch - 24, n = 9, bw = w / n;
    for (let i = 0; i < n; i++) {
      const v = 0.25 + rnd() * 0.75;
      ctx.fillStyle = i === n - 2 ? t.c : rgba(t.c, 0.45);
      rr(ctx, x + i * bw + 4, by + bh * (1 - v), bw - 8, bh * v, 4); ctx.fill();
    }
  }
}

function slide(ctx, x, y, w, h, t, c1, c2) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, rgba(c1, 0.95)); g.addColorStop(1, rgba(c2, 0.8));
  ctx.fillStyle = g; rr(ctx, x, y, w, h - 38, 10); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.95)'; rr(ctx, x + 18, y + 22, w * 0.5, 16, 8); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; rr(ctx, x + 18, y + 50, w * 0.32, 8, 4); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.beginPath(); ctx.arc(x + w * 0.78, y + (h - 38) * 0.62, 46, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(x + w * 0.66, y + (h - 38) * 0.78, 24, 0, 7); ctx.fill();
  for (let i = 0; i < 4; i++) { ctx.fillStyle = i === 0 ? t.c : 'rgba(255,255,255,0.14)'; rr(ctx, x + i * (w / 4) + 2, y + h - 28, w / 4 - 8, 26, 5); ctx.fill(); }
}

const P = painters();

export function paintCard(type, seed = 1) {
  const W = Math.round(H * type.ar);
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const rnd = prng(seed * 977 + type.ext.length * 31);

  // 玻璃底
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#201a15'); bg.addColorStop(1, '#0d0b09');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.15, 0, 0, W * 0.15, 0, W * 1.1);
  glow.addColorStop(0, rgba(type.c, 0.26)); glow.addColorStop(1, rgba(type.c, 0));
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

  // 页眉：格式徽标 + 扩展名 + 文件名
  ctx.fillStyle = type.c; rr(ctx, 22, 20, 38, 38, 10); ctx.fill();
  ctx.fillStyle = 'rgba(10,8,6,0.78)';
  ctx.fillRect(32, 32, 18, 3); ctx.fillRect(32, 40, 18, 3); ctx.fillRect(32, 48, 11, 3);
  ctx.textBaseline = 'alphabetic';
  ctx.font = `700 19px ${MONO}`; ctx.fillStyle = type.c; ctx.fillText(type.ext, 72, 36);
  ctx.font = `500 13px ${MONO}`; ctx.fillStyle = 'rgba(255,255,255,0.45)';
  let nm = type.name;
  while (ctx.measureText(nm).width > W - 94 && nm.length > 4) nm = nm.slice(0, -2);
  ctx.fillText(nm === type.name ? nm : nm + '…', 72, 54);

  // 内容
  const bx = 24, by = 88, bw = W - 48, bh = H - by - 26;
  ctx.save(); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  (P[type.id] || P.pdf)(ctx, bx, by, bw, bh, type, rnd);
  ctx.restore();
  return cv;
}
