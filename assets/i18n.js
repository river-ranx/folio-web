// ===== i18n dictionary =====
// 页面 HTML 里的默认文案就是英文（无 JS / 首帧不闪）；切换语言时由 applyI18n 覆盖。
const I18N = {
  en: {
    'document.title': 'Folio — One app. See every file.',
    'document.description': 'Folio turns your Mac into one quiet, focused workspace. Documents, spreadsheets, slides, PDFs, notes, images, audio and video — all in a single window.',

    'nav.play': 'Try it',
    'nav.features': 'Features',
    'nav.edit': 'Edit',
    'nav.full': 'Full edition',
    'nav.faq': 'FAQ',
    'nav.cta': 'Get Folio',
    'nav.theme': 'Toggle theme',

    'btn.download': 'Download for Mac',
    'btn.explore': 'Explore features',

    'hero.badge': 'The universal viewer for Mac',
    'hero.subtitle': 'Turn your Mac into one quiet, focused workspace. Documents, spreadsheets, slides, PDFs, notes, images, music and video — all in a single window.',
    'hero.meta.devices': 'Made for every Mac',
    'hero.meta.ios': 'iPadOS & iOS coming soon',
    'hero.win': 'Interactive Folio window',
    'hero.chips': 'Pick a file type',
    'hero.hint': 'The window is live.',
    'hero.pause': 'Pause autoplay',
    'hero.play': 'Resume autoplay',

    'chip.image': 'Image',
    'chip.sheet': 'Sheet',
    'chip.3d': '3D model',
    'chip.audio': 'Audio',

    'sc.pdf': 'search inside PDFs',
    'sc.swift': 'syntax colors · 40+ languages',
    'sc.image': 'zoom · details · flip with ← →',
    'sc.md': 'what you write is what you see',
    'sc.docx': '.docx in → .docx out',
    'sc.csv': 'click a header to sort',
    'sc.db': 'browse tables and rows',
    'sc.m3d': 'drag to rotate',
    'sc.audio': 'see the sound · click to seek',
    'sc.kind.pdf': 'PDF document',
    'sc.kind.swift': 'Swift · UTF-8',
    'sc.kind.image': 'PNG image',
    'sc.kind.md': 'Markdown',
    'sc.kind.docx': 'Word document',
    'sc.kind.csv': 'CSV table',
    'sc.kind.db': 'SQLite database',
    'sc.kind.m3d': '3D model · USDZ',
    'sc.kind.audio': 'WAV audio',
    'sc.tables': 'Tables',
    'sc.matches': 'matches',
    'sc.sortby': 'sort',
    'sc.filter': 'Region: Asia',

    'stat.formats': 'file types, natively',
    'stat.langs': 'code languages',
    'stat.themes': 'themes',
    'stat.local': 'nothing leaves your Mac',

    'formats.eyebrow': 'supported formats',
    'formats.h3': '14 file types, one window',
    'formats.pause': 'Pause',
    'formats.resume': 'Play',
    'formats.list': ['PDF', 'Word', 'Excel', 'PowerPoint', 'Pages', 'Numbers', 'Keynote', 'Markdown', 'Code', 'Images', 'Audio', 'Video', '3D Models', 'Databases', 'CSV', 'Fonts', 'Archives'],

    'feat.eyebrow': 'features',
    'feat.h2': 'Everything a viewer should be,',
    'feat.h2s': 'and a little more.',
    'feat.body': 'Tabs that remember, search that reads inside files, themes you can live in. Poke around — most of these cards react.',

    'card.ws.h': 'Tabs that remember',
    'card.ws.p': 'Every project gets its own workspace tab. Come back to the same folder, scroll position and open file — exactly where you left off.',
    'card.ws.tabs': 'Workspaces',
    'card.ws.restore': 'restored · same scroll position',
    'card.search.h': 'Search inside the files',
    'card.search.p': 'Not just filenames. Find a sentence in a PDF, a phrase in a .docx or a line in a slide deck — across every open workspace.',
    'card.code.h': 'Languages, read like prose',
    'card.code.p': 'Crisp syntax colors and tidy indentation, from Swift to Rust.',
    'card.theme.h': '15 themes, one for every hour',
    'card.theme.p': 'From cream to midnight, moss to ink. Light and dark follow your system.',
    'card.theme.pick': 'Preview a theme color',
    'card.label.h': 'Color labels, folders side by side',
    'card.label.p': 'Mount several folders at once, then tag files with color labels to tame a messy directory.',
    'card.label.hint': 'click a row to label it',
    'card.office.h': 'Office and PDF, no launch wait',
    'card.office.p': 'Word, Excel, PowerPoint, Pages, Numbers, Keynote and PDF — search inside, jump by outline, highlight matches.',
    'card.media.h': 'Video, audio, 3D and fonts',
    'card.media.p': 'Play video, see audio as a waveform, spin a 3D model, preview a typeface — in the same window.',
    'card.finder.h': 'Space bar, straight from Finder',
    'card.finder.p': "Select a Markdown, code, data or 3D file in Finder and press Space — Folio's Quick Look extension renders it properly. A Finder quick action opens it in Folio.",
    'card.finder.files': 'Files in Finder',
    'card.finder.qa': 'Quick action · Open in Folio',
    'card.glass.h': 'Glass that feels like macOS',
    'card.glass.p': 'A delicate, translucent interface in step with the system aesthetic — Liquid Glass, kept out of the way of your content.',

    'edit.eyebrow': 'edit',
    'edit.h2': 'Open it. Edit it.',
    'edit.h2s': 'Send it out.',
    'edit.body': 'Markdown and Word documents edit right where they open. What you write is what you see — then export when you need to.',
    'edit.chapters': 'Chapters',
    'edit.c1.h': 'Open anything',
    'edit.c1.p': 'Word, Excel, PowerPoint, Pages, Numbers, Keynote and PDF open instantly — clean, and searchable.',
    'edit.c2.h': 'Write in Markdown',
    'edit.c2.p': 'Type / for the slash menu. Format from the side panel. Colors, checklists and headings apply as you go.',
    'edit.c3.h': 'Tables, code and footnotes',
    'edit.c3.p': 'Rich tables, highlighted code blocks and footnotes — with KaTeX math and Mermaid diagrams rendered in place.',
    'edit.c4.h': 'Edit Word, keep the .docx',
    'edit.c4.p': '.docx in, .docx out. Formatting stays intact, with a native format panel for fonts, colors and spacing.',
    'edit.c5.h': "Export when you're done",
    'edit.c5.p': 'PDF, HTML or an image in one click — the exported file opens in a new tab right away.',
    'edit.rec': 'Real screen recordings',
    'edit.also': 'also in the editor',
    'edit.a1': 'Source ⇄ visual',
    'edit.a2': 'Outline navigation',
    'edit.a3': 'Images saved to assets/',
    'edit.a4': 'Find & replace',
    'edit.a5': 'Apple system translation',
    'edit.a6': 'Code editing (Monaco)',

    'full.b1': 'Full edition',
    'full.b2': 'Direct download',
    'full.b3': 'Beyond the App Store version',
    'full.h2': 'Same window.',
    'full.h2s': 'A whole workbench.',
    'full.body': 'The full edition includes a terminal, Git, AI coding CLIs, automatic snapshots and tasks, built into the viewer you already know — and it still runs entirely on your Mac.',
    'full.list': 'Full edition capabilities',
    'full.pal': 'full edition',
    'full.illus': 'animated illustration',
    'full.note': 'Use the arrow keys on the list. The animations are illustrations — real recordings are below.',
    'full.t.h': 'Terminal',
    'full.t.p': 'A real zsh in a tab, with command-block prompts that know your path and Git branch.',
    'full.g.h': 'Git client',
    'full.g.p': 'Stage by hunk, commit, push, stash, rebase, blame and resolve conflicts — many repositories, one focus.',
    'full.a.h': 'AI CLI hub',
    'full.a.p': 'Claude Code, Codex and Antigravity run inside the window. Past sessions are listed in the sidebar, ready to resume.',
    'full.s.h': 'Automatic snapshots',
    'full.s.p': 'A time machine for your files: versions save on their own, older ones thin out gracefully, and anything can come back.',
    'full.k.h': 'Tasks + MCP',
    'full.k.p': 'Things-style lists with Inbox, Today and Upcoming — plus an MCP server so your agents can read and add tasks.',
    'full.x.h': 'Translate anything',
    'full.x.p': 'Translate a selection or the whole file with Apple, Gemini CLI, Google Cloud or a local Ollama.',
    'full.rec.h': 'Recorded on the full edition',
    'full.rec.s': 'not available in the App Store version',
    'full.rec.chapters': 'Recording chapters',
    'full.rec.cli': 'Three CLIs, one sidebar',
    'full.rc1': 'AI CLI',
    'full.rc2': 'Editors',
    'full.rc3': 'Git',
    'full.rc4': 'Tasks',
    'term.snap.keep': ['last 24h: every version', 'last 7 days: daily', 'last 30 days: weekly', 'older: monthly'],
    'term.snap.now': 'Auto snapshot',
    'term.snap.restore': 'restore',
    'term.git.stage': 'Stage hunk',
    'term.git.staged': 'Staged',
    'term.git.note': 'Per-hunk staging, right in the diff.',
    'term.mcp.cap': 'an agent calls your task list over MCP',
    'term.tk.go': 'Run with Claude Code',
    'term.tr.src': 'English',
    'term.tr.dst': '中文',
    'term.tr.s1': 'A quiet home for every file.',
    'term.tr.d1': '给每个文件一个安静的家。',

    'faq.eyebrow': 'FAQ',
    'faq.h2': 'Still curious?',
    'faq.q1': 'What is Folio?',
    'faq.a1': 'Folio is a universal file viewer for Mac. One app opens documents, spreadsheets, slides, PDFs, notes, code, images, music and video — replacing the dozen apps you usually juggle, in one quiet, focused window.',
    'faq.q2': 'How is it different from Preview / Quick Look?',
    'faq.a2': 'macOS Preview is built for a quick glance. Folio is built to stay: tabs, cross-file search, in-place editing for Markdown and Word, and 15 reading themes — turning "peek and close" into "open and work".',
    'faq.q3': 'Can I edit files in it?',
    'faq.a3': 'Yes. Markdown, Word (.docx) and code files are editable in place, and .docx stays .docx. Other Office files and PDFs open for reading.',
    'faq.q4': 'Which macOS versions are supported?',
    'faq.a4': 'Folio supports macOS 15 and above, and runs smoothly on every Mac.',
    'faq.q5': 'Will searching a folder of 10,000 files be slow?',
    'faq.a5': "Folio quietly prepares when you open a folder, then only catches up on changes. Even folders with 10,000 files respond as you type — you won't notice it working.",
    'faq.q6': 'Is my data safe?',
    'faq.a6': 'Everything happens on your Mac. Folio never uploads your files anywhere — it is the default, with no cloud toggle to switch off.',
    'faq.q7': 'Is it free?',
    'faq.a7': 'The Mac App Store version is free to download.',
    'faq.q8': 'What is the full edition?',
    'faq.a8': 'It is a separate build distributed directly, outside the Mac App Store. It includes a terminal, Git, AI coding CLIs, tasks, automatic snapshots and more translation back-ends. The App Store version does not include the terminal, Git, AI CLIs or tasks. No release date or price has been announced yet.',

    'cta.eyebrow': 'ready?',
    'cta.body': 'Make your Mac quiet. One window for every file.',
    'footer.copy': '© 2026 Folio · Made for macOS',
    'lang.label': 'English'
  },

  zh: {
    'document.title': 'Folio — 一个应用，看见每个文件',
    'document.description': 'Folio 让你的 Mac 安静下来。把所有你常用的文件——文档、表格、演示稿、PDF、笔记、图片、音乐与视频——全部装进一个窗口。',

    'nav.play': '现场体验',
    'nav.features': '功能',
    'nav.edit': '编辑',
    'nav.full': '完整版',
    'nav.faq': '常见问题',
    'nav.cta': '下载 Folio',
    'nav.theme': '切换主题',

    'btn.download': '下载 macOS 版',
    'btn.explore': '探索功能',

    'hero.badge': 'Mac 上的全能文件查看器',
    'hero.subtitle': '让你的 Mac 安静下来。把所有你常用的文件——文档、表格、演示稿、PDF、笔记、图片、音乐与视频——全部装进一个窗口。',
    'hero.meta.devices': '全系列 Mac 适用',
    'hero.meta.ios': 'iOS / iPadOS 即将到来',
    'hero.win': '可交互的 Folio 窗口',
    'hero.chips': '选一种文件类型',
    'hero.hint': '这个窗口是活的。',
    'hero.pause': '暂停自动播放',
    'hero.play': '继续自动播放',

    'chip.image': '图片',
    'chip.sheet': '表格',
    'chip.3d': '3D 模型',
    'chip.audio': '音频',

    'sc.pdf': 'PDF 内文搜索',
    'sc.swift': '语法着色 · 40+ 种语言',
    'sc.image': '缩放 · 拍摄信息 · ← → 翻页',
    'sc.md': '所写即所见',
    'sc.docx': '.docx 进 → .docx 出',
    'sc.csv': '点击表头即可排序',
    'sc.db': '直接浏览表与数据行',
    'sc.m3d': '拖动即可旋转',
    'sc.audio': '看见声音 · 点击跳转',
    'sc.kind.pdf': 'PDF 文档',
    'sc.kind.swift': 'Swift · UTF-8',
    'sc.kind.image': 'PNG 图片',
    'sc.kind.md': 'Markdown',
    'sc.kind.docx': 'Word 文档',
    'sc.kind.csv': 'CSV 表格',
    'sc.kind.db': 'SQLite 数据库',
    'sc.kind.m3d': '3D 模型 · USDZ',
    'sc.kind.audio': 'WAV 音频',
    'sc.tables': '数据表',
    'sc.matches': '处匹配',
    'sc.sortby': '排序',
    'sc.filter': '地区：亚洲',

    'stat.formats': '种文件，原生打开',
    'stat.langs': '种代码语言',
    'stat.themes': '套主题',
    'stat.local': '文件不会离开你的 Mac',

    'formats.eyebrow': '支持的格式',
    'formats.h3': '14 种格式，一个窗口看完',
    'formats.pause': '暂停',
    'formats.resume': '播放',
    'formats.list': ['PDF', 'Word', 'Excel', 'PowerPoint', 'Pages', 'Numbers', 'Keynote', 'Markdown', '代码', '图片', '音频', '视频', '3D 模型', '数据表', 'CSV', '字体', '压缩包'],

    'feat.eyebrow': '功能',
    'feat.h2': '查看器该有的，',
    'feat.h2s': '这里都有，还多一点。',
    'feat.body': '会记事的标签页、能搜进文件内部的搜索、可以长住的主题。动手试试——大多数卡片都会回应你。',

    'card.ws.h': '会记事的标签页',
    'card.ws.p': '每个项目一个工作空间标签页。回来时，文件夹、滚动位置和上次打开的文件都还在原处。',
    'card.ws.tabs': '工作空间',
    'card.ws.restore': '已恢复 · 滚动位置不变',
    'card.search.h': '搜进文件里面',
    'card.search.p': '不止文件名。PDF 里的一句话、.docx 里的一个词、幻灯片里的一行字，跨所有打开的工作空间直接命中。',
    'card.code.h': '种语言，读起来像散文',
    'card.code.p': '清爽的语法着色与整齐的缩进，从 Swift 到 Rust。',
    'card.theme.h': '15 套主题，配得上每个时刻',
    'card.theme.p': '从奶油米到午夜黑，从苔藓绿到墨水蓝。深浅自动跟随系统。',
    'card.theme.pick': '预览主题色',
    'card.label.h': '彩色标签，多个文件夹并排',
    'card.label.p': '同时挂载几个文件夹，再用彩色标签给文件分类，凌乱的目录也能井井有条。',
    'card.label.hint': '点一行试试贴标签',
    'card.office.h': 'Office 与 PDF，无需等启动',
    'card.office.p': 'Word、Excel、PowerPoint、Pages、Numbers、Keynote 和 PDF——文内搜索、目录跳转、关键词高亮。',
    'card.media.h': '视频、音频、3D 与字体',
    'card.media.p': '播放视频、看见音频波形、转着看 3D 模型、预览字体——都在同一个窗口里。',
    'card.finder.h': '在 Finder 里，按下空格',
    'card.finder.p': '在 Finder 里选中 Markdown、代码、数据或 3D 文件，按空格——Folio 的 Quick Look 扩展直接把它渲染清楚。再用 Finder 快速操作一键在 Folio 中打开。',
    'card.finder.files': 'Finder 中的文件',
    'card.finder.qa': '快速操作 · 在 Folio 中打开',
    'card.glass.h': '和 macOS 一脉相承的玻璃质感',
    'card.glass.p': '细腻的半透明界面，与系统美学同频——Liquid Glass，不抢内容的戏。',

    'edit.eyebrow': '编辑',
    'edit.h2': '打开就能改，',
    'edit.h2s': '改完就能发。',
    'edit.body': 'Markdown 与 Word 文档在原地即可编辑。所写即所见，需要时再导出。',
    'edit.chapters': '章节',
    'edit.c1.h': '什么都能打开',
    'edit.c1.p': 'Word、Excel、PowerPoint、Pages、Numbers、Keynote 与 PDF 秒开——干净，还能搜索。',
    'edit.c2.h': '用 Markdown 写作',
    'edit.c2.p': '输入 / 唤出斜杠菜单，在右侧面板调整格式。颜色、清单、标题，随手即成。',
    'edit.c3.h': '表格、代码与脚注',
    'edit.c3.p': '富表格、带高亮的代码块与脚注——KaTeX 公式和 Mermaid 图表原地渲染。',
    'edit.c4.h': '编辑 Word，仍存 .docx',
    'edit.c4.p': '.docx 进，.docx 出，格式不丢。原生格式面板可调字体、颜色与行距。',
    'edit.c5.h': '写完，一键导出',
    'edit.c5.p': 'PDF、HTML 或图片一键导出——导出的文件会立刻在新标签页里打开。',
    'edit.rec': '真实屏幕录制',
    'edit.also': '编辑器里还有',
    'edit.a1': '源码 ⇄ 可视切换',
    'edit.a2': '大纲导航',
    'edit.a3': '图片自动存入 assets/',
    'edit.a4': '查找与替换',
    'edit.a5': 'Apple 系统翻译',
    'edit.a6': '代码编辑（Monaco）',

    'full.b1': '完整版',
    'full.b2': '官网直发',
    'full.b3': '超出 App Store 版',
    'full.h2': '同一个窗口，',
    'full.h2s': '一整套工作台。',
    'full.body': '完整版在你熟悉的查看器里，内置终端、Git、AI 编程 CLI、自动快照与任务管理——所有数据依然只在你的 Mac 上。',
    'full.list': '完整版能力',
    'full.pal': '完整版',
    'full.illus': '动画示意',
    'full.note': '可在列表上用方向键切换。这些动画只是示意——真实录屏在下方。',
    'full.t.h': '内置终端',
    'full.t.p': '标签页里的真实 zsh，命令块提示符会显示当前路径与 Git 分支。',
    'full.g.h': 'Git 客户端',
    'full.g.p': '按 hunk 暂存、提交、推送、贮藏、rebase、blame、解决冲突——多个仓库，一个焦点。',
    'full.a.h': 'AI CLI 中枢',
    'full.a.p': 'Claude Code、Codex 与 Antigravity 直接在窗口内运行，历史会话列在侧栏，随时接着聊。',
    'full.s.h': '自动版本快照',
    'full.s.p': '给文件的「时光机」：版本自动保存，旧版本优雅地稀疏保留，任何文件都能找回。',
    'full.k.h': '任务管理 + MCP',
    'full.k.p': 'Things 式的收件箱、今天、即将到来——还内置 MCP 服务，让你的 Agent 读取并添加任务。',
    'full.x.h': '翻译一切',
    'full.x.p': '选中段或整篇文件都能译，后端可选 Apple、Gemini CLI、Google Cloud 或本地 Ollama。',
    'full.rec.h': '完整版真实录屏',
    'full.rec.s': 'App Store 版不含这些能力',
    'full.rec.chapters': '录屏章节',
    'full.rec.cli': '三个 CLI，一个侧栏',
    'full.rc1': 'AI CLI',
    'full.rc2': '编辑器',
    'full.rc3': 'Git',
    'full.rc4': '任务',
    'term.snap.keep': ['近 24 小时：每个版本', '近 7 天：每天一个', '近 30 天：每周一个', '更早：每月一个'],
    'term.snap.now': '自动快照',
    'term.snap.restore': '恢复',
    'term.git.stage': '暂存此 hunk',
    'term.git.staged': '已暂存',
    'term.git.note': '在 diff 里直接按 hunk 暂存。',
    'term.mcp.cap': 'Agent 通过 MCP 调用你的任务清单',
    'term.tk.go': '用 Claude Code 完成',
    'term.tr.src': 'English',
    'term.tr.dst': '中文',
    'term.tr.s1': 'A quiet home for every file.',
    'term.tr.d1': '给每个文件一个安静的家。',

    'faq.eyebrow': '常见问题',
    'faq.h2': '仍有疑问？',
    'faq.q1': 'Folio 是什么？',
    'faq.a1': 'Folio 是一款 Mac 文件浏览器。一个应用里就能打开文档、表格、演示稿、PDF、笔记、代码、图片、音乐和视频——把你日常要切换的十几个 app 收纳进一个安静、专注的窗口。',
    'faq.q2': '和「预览.app」/ Quick Look 有什么不同？',
    'faq.a2': '系统自带的预览只能「看一眼就关」。Folio 是为长时间停留打造的工作空间：多标签、跨文件搜索、Markdown 与 Word 原地编辑、15 套阅读主题——把「打开一下就走」变成「打开就能开始工作」。',
    'faq.q3': '我可以用它编辑文件吗？',
    'faq.a3': '可以。Markdown、Word（.docx）和代码文件都能原地编辑，.docx 存回仍是 .docx。其他 Office 文件与 PDF 用于阅读。',
    'faq.q4': '支持哪些 macOS 版本？',
    'faq.a4': 'Folio 支持 macOS 15 及以上版本，全系列 Mac 都能流畅运行。',
    'faq.q5': '搜索一万个文件的文件夹会不会很慢？',
    'faq.a5': 'Folio 在你打开文件夹时就悄悄准备好，之后只在文件变化时跟进。一万个文件的大文件夹，输入即可命中——你不会感觉到它在工作。',
    'faq.q6': '我的数据安全吗？',
    'faq.a6': '所有处理都在你的电脑上完成。Folio 不会把你的文件内容上传到任何地方——这是默认行为，没有「关闭云同步」的开关。',
    'faq.q7': '是否免费？',
    'faq.a7': 'Mac App Store 版可免费下载。',
    'faq.q8': '「完整版」是什么？',
    'faq.a8': '它是在 Mac App Store 之外直接分发的独立版本，包含终端、Git、AI 编程 CLI、任务管理、自动快照与更多翻译后端。App Store 版不含终端、Git、AI CLI 与任务管理。发布时间与价格目前尚未公布。',

    'cta.eyebrow': '准备好了吗？',
    'cta.body': '让你的 Mac 安静下来。一个窗口，看完所有文件。',
    'footer.copy': '© 2026 Folio · 为 macOS 而生',
    'lang.label': '中文'
  }
};

const STORE_URL = 'https://apps.apple.com/us/app/folio-universal-viewer/id6769624913?mt=12';

function detectInitialLang() {
  // 默认英文；用户手动切换后记在 localStorage
  let saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  return saved && I18N[saved] ? saved : 'en';
}

const i18n = {
  lang: 'en',
  t(key) { return (I18N[this.lang] || I18N.en)[key] ?? I18N.en[key] ?? key; }
};

function applyI18n(lang) {
  const dict = I18N[lang] || I18N.en;
  i18n.lang = lang;
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = dict['document.title'];

  const setMeta = (sel, val) => { const m = document.querySelector(sel); if (m) m.setAttribute('content', val); };
  setMeta('meta[name="description"]', dict['document.description']);
  setMeta('meta[property="og:title"]', dict['document.title']);
  setMeta('meta[property="og:description"]', dict['document.description']);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const val = dict[el.getAttribute('data-i18n')];
    if (typeof val === 'string') el.textContent = val;
  });
  // data-i18n-attr="aria-label:key;title:key2"
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    el.getAttribute('data-i18n-attr').split(';').forEach(pair => {
      const [attr, key] = pair.split(':');
      const val = dict[key];
      if (attr && typeof val === 'string') el.setAttribute(attr, val);
    });
  });

  // App Store 落地页语言跟随站点语言
  document.querySelectorAll('a[data-appstore]').forEach(a => {
    a.href = lang === 'zh' ? STORE_URL + '&l=zh-Hans-CN' : STORE_URL;
  });

  const label = document.getElementById('langLabel');
  if (label) label.textContent = dict['lang.label'];
  document.querySelectorAll('#langMenu button[data-lang]').forEach(btn => {
    btn.setAttribute('aria-current', btn.dataset.lang === lang ? 'true' : 'false');
  });

  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}
