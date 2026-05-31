---
version: anydesign-1
name: Folio — One app. See every file.
source: /Users/ranxuening/Materials/Apple Application/folio-web/index.html (live: https://river-ranx.github.io/folio-web/)
captured_at: 2026-05-31
description: |
  Folio 的营销站是一封写给「安静的 Mac」的情书。暖米底 + 单一琥珀点缀 + 衬线斜体的英文短句，
  构成一种克制而温润的编辑气质——介于 Apple 产品页的留白与独立 Mac 软件的手作感之间。
  它不喧哗：大量留白、单色系统、衬线斜体只在标题里点一下，把声量留给产品截图本身。
  双语混排（英文标题 + 中文正文）是刻意的品牌姿态，而非疏漏。

colors:
  bg: "#FBF6EE"
  bg-elevated: "#FFFAF1"
  bg-subtle: "rgba(110,75,30,0.045)"
  bg-cream-soft: "#FCEFDB"
  border: "rgba(110,75,30,0.12)"
  border-strong: "rgba(110,75,30,0.20)"
  text: "#1E1A14"
  text-dim: "#6E614E"
  text-mute: "#978872"
  accent: "#EE7F1F"
  accent-strong: "#D26A0D"
  accent-soft: "rgba(238,127,31,0.10)"
  accent-glow: "rgba(238,127,31,0.20)"
  nav-bg: "rgba(251,246,238,0.78)"
  on-accent: "#FFFFFF"

typography:
  display:
    fontFamily: "Inter"
    fontSize: "clamp(46px,8vw,96px)"
    fontWeight: 700
    letterSpacing: "-0.04em"
  h2-section:
    fontFamily: "Inter"
    fontSize: "clamp(34px,4.6vw,52px)"
    fontWeight: 600
    letterSpacing: "-0.02em"
  h2-split:
    fontFamily: "Inter"
    fontSize: "clamp(32px,4vw,46px)"
    fontWeight: 600
    letterSpacing: "-0.025em"
  serif-accent:
    fontFamily: "Instrument Serif"
    fontStyle: "italic"
    fontWeight: 400
  body:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "Inter"
    fontSize: "13.5px"
    fontWeight: 400
  eyebrow-mono:
    fontFamily: "JetBrains Mono"
    fontSize: "12px"
    fontWeight: 500
    textTransform: "uppercase"
  meta-mono:
    fontFamily: "JetBrains Mono"
    fontSize: "12px"
    fontWeight: 400

spacing:
  base: "4px"
  scale: [4, 8, 10, 12, 14, 16, 18, 24, 28, 32, 56, 64, 96, 120]

rounded:
  sm: "8px"
  md: "10px"
  lg: "14px"
  xl: "16px"
  banner: "24px"
  pill: "999px"

components:
  navbar:
    background: "transparent → {colors.nav-bg} on scroll"
    height: "64px"
    blur: "saturate(180%) blur(20px)"
  button-accent:
    background: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.md}"
    height: "46px"
  button-ghost:
    background: "transparent"
    border: "1px solid {colors.border-strong}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
  pill-badge:
    background: "{colors.accent-soft}"
    textColor: "{colors.accent}"
    rounded: "{rounded.pill}"
  pillar-card:
    background: "{colors.bg-elevated}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.lg}"
  feature-cell:
    background: "{colors.bg}"
    gap: "1px on {colors.border}"
  format-chip:
    background: "{colors.bg-elevated}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.pill}"
    typography: "{typography.meta-mono}"
  faq-accordion:
    border-bottom: "1px solid {colors.border}"
    behavior: "single-open, max-height transition"
  hero-halo-field:
    layers: "3 blurred radial halos + masked dot-grid"
    rounded: "{rounded.pill}"
  split-showcase:
    grid: "minmax(260px,1fr) / minmax(420px,1.45fr), alternating"
    rounded: "{rounded.xl}"
  device-window:
    background: "{colors.bg-elevated}"
    rounded: "{rounded.xl}"
    shadow: "window"
---

# Design Analysis — Folio — One app. See every file.

> Analysis generated with the `anydesign` skill.
> Date: 2026-05-31
> Analysis emphasis: design system + reconstruction（兼顾优化诊断）

---

## Source

- **Source type**: 本地代码项目（单文件静态站） + 实时渲染截图
- **Path / URL**: `folio-web/index.html` · 实时 `https://river-ranx.github.io/folio-web/`
- **Capture method**: 直接读源码（CSS 自定义属性 = 显式 tokens，✅ 高置信） + Playwright 明/暗双态整页与 hero 特写截图 + `check_contrast.py` 数值验证
- **Detected limitations**: 截图阶段 `.reveal` 块靠 IntersectionObserver 滚动显形，需注入 `.visible` 才能在整页截图中看到全部内容（见 §1.2 与优化清单）。

---

## TL;DR

温润、克制、有手作感的 Mac 软件营销站——单一琥珀 `{colors.accent}` (#EE7F1F) 在大面积暖米底上做唯一「电压」，衬线斜体英文短句（`{typography.serif-accent}`）是品牌签名手势。设计完成度高，硬伤集中在一处：**主 CTA 按钮白字对比度仅 2.73:1（暗色 2.11:1），全站最重要的按钮最难读**——这是最该优先修的点。

---

## 1. Visual identity

### 1.1 Surface description

**Personality**：温润、克制、编辑感、手作、安静。

**Mood**：像一间光线柔和的书房。它不卖「强大」，卖「安宁与专注」——文案反复出现「让你的 Mac 安静下来」。

**Detectable stylistic references**：Apple 产品页的留白与居中叙事 × 独立 Mac 软件（如 Things / Reeder）的暖色手作感 × 衬线斜体点缀的当代编辑风（类 Stripe/Linear 之外的「warm editorial」一支）。

**Information density**：balanced——留白慷慨，但信息分区清晰（pillars → showcase → 交替 split → 功能网格 → FAQ → CTA）。

**Implicit positioning**：注重审美、长时间与文件相处的 Mac 重度用户（开发者、写作者、研究者），而非企业批量采购。

**Confidence**：✅ high（源码 + 双态渲染均已确认）。

### 1.2 Brand voice / Atmosphere

这套设计相信它的受众**已经被「应用过载」折磨够了**——十几个 app 各管一种文件、各有各的吵闹。于是营销的任务不是再喊一句「更强大」，而是**示范「安静」本身**：每一个美学选择都在做减法。单一琥珀色而非彩色系统、衬线斜体只在标题点一下而非通篇、光晕用 90px 大模糊而非锐利图形、动效用 14–22s 的超慢漂移而非弹跳——所有这些都在传递同一个信念：**克制是对用户注意力的尊重**。

双语混排是这套语气里最微妙的一笔。英文短句（`One app. / See every file.`）承担「品牌口号」的仪式感，中文正文承担「贴心解释」的亲切感。它假设受众是**双语、审美在线、吃这一套留白的人**——这正是 Folio 想要的早期用户画像。

它刻意不做的事同样定义了它：没有大字加粗的促销感、没有多彩渐变按钮、没有「立即购买」的紧迫——连主 CTA 都温柔地写着「即将到来 / Coming soon」。这是一个**还没急着卖、先把气质立住**的产品站。

### 1.3 The "ONE brand thing"

- **The thing**：**琥珀色衬线斜体短句**——`{typography.serif-accent}`（Instrument Serif italic）以 `{colors.accent}` 着色，嵌在无衬线粗体标题里。`See every file.` / `your color, 15 themes.` / `natural writing.` 这种「正经标题 + 一句斜体软语」的对位。
- **Why it carries the brand**：抽掉它，整站立刻塌成一个普通的暖色 Tailwind 落地页。正是这一笔衬线斜体 + 琥珀，把「克制」从「单调」里救出来，给了温度和签名感。
- **How everything else supports it**：其余一切都为它让路——正文全用 Inter、装饰色只有一个琥珀、卡片几乎无彩、阴影极淡。整个系统是一块安静的画布，只为让这一句斜体发光。
- **Where it appears (and where it deliberately doesn't)**：只出现在标题内的「点睛半句」和少数 `.accent` 强调词；**从不**用于正文、按钮文字、导航。scoping 纪律清晰。

*Confidence*：✅ high

---

## 2. Design System (tokens)

### 2.1 Colors

**浅色（默认）：**

| Token | Hex | Role | Where it appears | Confidence |
|---|---|---|---|---|
| `{colors.bg}` | `#FBF6EE` | 页面底色（米） | body | ✅ high |
| `{colors.bg-elevated}` | `#FFFAF1` | 抬升面 | 卡片、菜单、设备窗 | ✅ high |
| `{colors.bg-subtle}` | `rgba(110,75,30,.045)` | 弱化带/hover | features 区、hover | ✅ high |
| `{colors.bg-cream-soft}` | `#FCEFDB` | 暖渐变内圈 | hero/CTA 径向光 | ✅ high |
| `{colors.border}` | `rgba(110,75,30,.12)` | 发丝边 | 卡片、分隔 | ✅ high |
| `{colors.border-strong}` | `rgba(110,75,30,.20)` | 强边 | ghost 按钮 | ✅ high |
| `{colors.text}` | `#1E1A14` | 主文字 | 正文、标题 | ✅ high |
| `{colors.text-dim}` | `#6E614E` | 次级文字（5.6:1 ✅） | 正文副本、副标题 | ✅ high |
| `{colors.text-mute}` | `#978872` | 弱化文字（3.21:1 ❌AA正文） | hero-meta、footer、mono | ✅ high |
| `{colors.accent}` | `#EE7F1F` | 品牌琥珀 | CTA、强调词、点、图标 | ✅ high |
| `{colors.accent-strong}` | `#D26A0D` | 琥珀加深 | CTA hover | ✅ high |
| `{colors.accent-soft}` | `rgba(238,127,31,.10)` | 琥珀软底 | badge、feature-icon | ✅ high |
| `{colors.accent-glow}` | `rgba(238,127,31,.20)` | 琥珀辉光 | dot 环、hover 投影 | ✅ high |
| `{colors.nav-bg}` | `rgba(251,246,238,.78)` | 滚动后导航 | navbar.scrolled | ✅ high |
| `{colors.on-accent}` | `#FFFFFF` | 琥珀上的字（2.73:1 ❌） | CTA 文字 | ✅ high |

**深色（`html.dark` 覆盖）：** bg #0B0907 / text #FAF6F0 / text-dim #A29586 / text-mute #6C6357 / accent #FF9A4A / accent-strong #FFAD68。详见 `design-tokens.json` 每 token 的 `anydesign.dark`。

### 2.2 Typography

- **Detected families**：`Inter`（无衬线主力，✅ 高—— `<link>` 显式加载）、`Instrument Serif`（斜体签名）、`JetBrains Mono`（eyebrow/meta/chip）。
- **Suggested fallback**：`-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`。

| Token | Size | Weight | Line-height | Use |
|---|---|---|---|---|
| `{typography.display}` | clamp(46→96px) | 700 | 1.0 | hero h1 |
| `{typography.h2-section}` | clamp(34→52px) | 600 | 1.1 | 居中 section 标题 |
| `{typography.h2-split}` | clamp(32→46px) | 600 | 1.05 | split 标题 |
| `{typography.serif-accent}` | 1.0–1.05em | 400 italic | — | 标题内琥珀斜体 |
| `{typography.body}` | 16px | 400 | 1.5 | 正文 |
| `{typography.body-sm}` | 13.5px | 400 | 1.6 | 卡片/功能正文 |
| `{typography.eyebrow-mono}` | 12px | 500 | — | section eyebrow（大写+字距） |
| `{typography.meta-mono}` | 12px | 400 | — | hero-meta、footer、chip |

**Notable tracking**：display 用 -0.04em 的强负字距，是「typographic care」的明确信号；中文段落另用 `word-break: keep-all` 优化断行。

### 2.3 Spacing

- **Inferred base unit**：`{spacing.base}`（4px），近 4/8 体系但带半步（13.5px、14.5px 字号属字体微调，非间距）。
- **Observable multiples**：`{spacing.scale[0]}`…—— section 垂直节奏稳定 96px，section-head→内容 56px，连续 split 收紧到 32px。
- **Consistency**：✅ high。

### 2.4 Radii

- `{rounded.sm}`（8px）：nav 控件、icon-btn、lang-trigger
- `{rounded.md}`（10px）：按钮、lang-menu
- `{rounded.lg}`（14px）：pillar / feature 卡
- `{rounded.xl}`（16px）：hero 设备窗
- `{rounded.banner}`（24px）：showcase banner 大卡
- `{rounded.pill}`（999px）：badge、format chip

### 2.5 Elevation system

系统**刻意只用 2 个功能层级** + 1 个浮层，避免厚重投影：

| Level | Name | Treatment | Use |
|---|---|---|---|
| 0 | Flat | 无影，或仅发丝边 `1px {colors.border}` | 全幅带、features 网格、卡片静态 |
| 1 | Window | `shadow.window`（双层柔投影） | 设备窗、banner、split 图、hero 窗 |
| 2 | Pop | `shadow.pop`（带 hairline 的浮层影） | lang-menu 弹出 |

按钮另有专属琥珀辉光 `shadow.cta`（带色投影，非中性）。

#### Decorative depth (non-functional)

- **Hero halo field**：3 块 90px 大模糊径向光（`{colors.accent-glow}` 系），14–22s 超慢 pulse/drift。
- **Masked dot-grid**：hero 背景 28px 径向点阵，用椭圆 mask 向边缘淡出。
- **Radial wash**：hero/CTA 顶部 `{colors.bg-cream-soft}` 暖光晕。
- **几乎不用 polarity flip**：浅色模式仅 `.features` 一段切到 `{colors.bg-subtle}`，整体靠留白+发丝边分区，而非明暗带交替。

### 2.6 Borders

- 基色 `{colors.border}`（棕调半透明，随底色融合），统一 1px。
- features 网格用「1px gap on border 背景」造分隔线，很巧。
- **focus 态缺失**：未见可见的键盘 focus ring（见 §5 / 优化清单）。

### 2.7 Accessibility quick-check

详见 `design-a11y.md`。摘要：
- `{colors.text}` on `{colors.bg}`：**16.09:1** — AAA ✅
- `{colors.text-dim}` on `{colors.bg}`：**5.6:1** — AA ✅
- `{colors.on-accent}` on `{colors.accent}`（主 CTA）：**2.73:1** — ❌ 全部不达；暗色 **2.11:1** 更差。
- `{colors.accent}` on `{colors.bg}`（琥珀字）：**2.54:1** — ❌ 含 hero 斜体大字。

---

## 3. Components Inventory

### 3.1 Generic components

#### Navbar
- **行为**：固定顶栏，初始透明；`scrollY>12` 加 `.scrolled` → `{colors.nav-bg}` + 20px backdrop-blur + 底边线。
- **构成**：brand（图标 26px + 字）/ 居中链接 / 右侧（语言切换 + 主题 + nav-cta + 移动汉堡）。
- **状态**：default / scrolled / 移动折叠。
- **Confidence**：✅ high

#### Button — accent
- **样式**：`{colors.accent}` 底 + `{colors.on-accent}` 字 + `{rounded.md}` + 46px 高 + `shadow.cta` 琥珀辉光。
- **状态**：default / hover（→`{colors.accent-strong}`）/ active（下沉 0.5px）/ `.btn-soon`（「即将到来」惰性态，去掉位移）。
- **隐忧**：白字对比度 2.73:1（见 §2.7）。
- **Confidence**：✅ high

#### Button — ghost
- **样式**：透明底 + `1px {colors.border-strong}` + `{colors.text}` 字 + `{rounded.md}`。
- **状态**：default / hover（`{colors.bg-subtle}` 底 + 边变 `text-mute`）。
- **Confidence**：✅ high

#### Pill badge
- **样式**：`{colors.accent-soft}` 底 + `{colors.accent}` 字 + `{rounded.pill}`，左侧带辉光圆点。
- **用途**：hero「The universal viewer for Mac」徽标。
- **Confidence**：✅ high

#### Pillar card
- **样式**：`{colors.bg-elevated}` + `1px {colors.border}` + `{rounded.lg}`，含编号圆徽（琥珀底白字）。
- **状态**：hover（边→`{colors.accent}` + 上移 3px + 琥珀投影）。
- **Confidence**：✅ high

#### Feature cell
- **样式**：`{colors.bg}` 格 + 「1px gap on `{colors.border}`」组成 3 列分隔网格；含 `{colors.accent-soft}` 图标方块。
- **状态**：hover（→`{colors.bg-subtle}`）。
- **Confidence**：✅ high

#### Format chip
- **样式**：`{colors.bg-elevated}` + `1px {colors.border}` + `{rounded.pill}` + `{typography.meta-mono}`，跑马灯无限滚动（38s）。
- **状态**：hover（边/字→`{colors.accent}`）。
- **Confidence**：✅ high

#### FAQ accordion
- **样式**：发丝边分隔的问答行；圆形 chevron 图标，展开旋 180° + `{colors.accent-soft}` 底。
- **行为**：单开（打开一个自动收起其余），max-height 过渡。
- **Confidence**：✅ high

### 3.2 Signature components

#### Hero halo field
- **What it is**：hero 背景的 3 块大模糊径向光晕 + 椭圆 mask 点阵网格。
- **Why it's signature**：营造「安静的暖光」氛围，是品牌情绪的视觉载体；超慢动效（14–22s）让它几乎察觉不到在动。
- **Composition**：`.halo` 三层（`{colors.accent-glow}` 系）+ `radial-gradient` 点阵 + `mask-image` 椭圆淡出。
- **Where**：仅 hero（CTA 区有简化版暖光）。
- **Confidence**：✅ high

#### Split showcase
- **What it is**：文字 + 产品截图交替左右的展示区（`.split` / `.split.reverse`）。
- **Why it's signature**：构成全站主体叙事节奏，图侧 hover 上浮 4px，配 `{rounded.xl}` + `shadow.window`。
- **Composition**：CSS grid `minmax(260px,1fr) / minmax(420px,1.45fr)`，reverse 互换列序。
- **Where**：code/image/markdown/office/video/themes 六段。
- **Confidence**：✅ high

#### Device window
- **What it is**：承载产品截图的「窗体」容器（`{rounded.xl}` + 发丝边 + `shadow.window` + `{colors.bg-elevated}`）。
- **Why it's signature**：把每张截图框成一台漂浮的 Mac 窗，统一了所有视觉素材的呈现语言。
- **Composition**：圆角 overflow-hidden 容器 + 双层柔投影 + 顶部红绿灯（在 welcome 截图内）。
- **Where**：hero 窗、banner、所有 split 图。
- **Confidence**：✅ high

---

## 4. Layout & Composition

### 4.1 Grid & containers

- **容器**：`.container` max 1080px / `.container-wide` 1240px / split 区 1200px / banner 1160px；横向 padding 桌面 28px。
- **垂直节奏**：section 96px，连续 split 收紧到 32px，FAQ/CTA 120px。
- **层级**：靠字号 + `{colors.text-dim}` 弱化建立，而非高饱和色。

### 4.2 Composition patterns

- 居中 hero（图标→badge→h1→副标题→双 CTA→mono meta→设备窗）
- 4 列 pillars
- 全幅 banner 大图
- 文字/图交替 split ×6
- 跑马灯格式条
- 3 列 features 网格（弱化带背景）
- 居中 FAQ 手风琴
- 收尾 CTA（暖光晕）

### 4.3 Responsive behavior

#### Breakpoints

| Name | Width | Key changes |
|---|---|---|
| Wide | ≥1240px | 内容定宽，gutter 吸收余量 |
| Desktop | 1025–1239px | 完整多列 |
| Tablet | ≤1024px | split→单列；pillars/features→2 列 |
| Mobile | ≤768px | nav 链接+cta 隐藏、显汉堡；pillars→1 列；padding→20px |
| Small | ≤480px | hero h1→44px；features→1 列；hero CTA 竖排满宽 |

#### Touch targets

- 主按钮 `.btn` 46px ✅（≥44px）。
- nav `icon-btn` / `lang-trigger` / `mobile-toggle` 均 34px **< 44px** ⚠️——桌面尚可，移动端偏小（见优化清单）。

#### Collapsing strategy

- **Nav**：桌面横排 → ≤768px 汉堡叠层（`.mobile-menu` 固定全宽 + blur）。
- **Grids**：4/3 列 → 2 列 → 1 列，卡片保持 `{rounded.lg}`。
- **Split**：≤1024px 堆叠为单列，reverse 复位顺序。

### 4.4 Image behavior

- **产品截图**（landings/ 7 张、welcome 1 张）：装进 `{components.device-window}`，`width:100%`、`loading="lazy"`、`height:auto`，不裁切。
- **app-icon.png**：hero 72px 圆角 18px、nav 26px、footer 22px。
- **Icons**：内联 SVG（功能区 stroke 线性图标 stroke-width 1.8；主题/语言 stroke 图标），单色随 `currentColor`。
- **装饰光晕/点阵**：纯 CSS（gradient + mask），无位图。

---

## 5. Reconstruction Notes

### Suggested stack

**纯静态单文件（vanilla HTML + 内联 CSS/JS）**——保持现状即最优。无构建步骤、无框架、GitHub Pages 根目录直发。tokens 已是 CSS 自定义属性，复刻只需照搬 `:root` / `html.dark` 两块。

### Quick wins

- 复制 `:root` + `html.dark` 两个 token 块 = 拿到 80% 外观。
- Inter + Instrument Serif italic + JetBrains Mono 三字体即定调。
- 交替 split + device-window 容器是主体骨架，复制一段即可批量套。

### Tricky bits

- **scroll-reveal 依赖 JS**：`.reveal` 默认 `opacity:0`，靠 IntersectionObserver 加 `.visible` 才显形；JS 失效则首屏以下全空白（`prefers-reduced-motion` 下才强制可见）。
- **hero `.loaded` 绑 `window load`**：等全部资源（含图）load 才入场，慢网络下 hero 迟显。
- hero halo 超慢动效 + dot-grid mask，照抄数值即可。

### Implicit states to define

- 键盘 **focus 可见态**（当前缺失，a11y 必补）。
- `.btn-soon` 之外的真实下载态（产品发布后）。
- 表单/输入态（站内暂无表单）。
- 暗色模式下 CTA 按钮文字色（当前白字 2.11:1）。

### Confidence map

| Layer | Confidence | Why |
|---|---|---|
| Identity | ✅ high | 源码 + 双态渲染均确认 |
| Colors | ✅ high | 直接取自 CSS 变量 |
| Typography | ✅ high | `<link>` 显式声明 |
| Spacing | ✅ high | 源码可验证 |
| Components | ✅ high | 全量读完 CSS + DOM |
| Layout | ✅ high | 含全部断点 |

---

## 6. Do's and Don'ts

### Do

- **琥珀 `{colors.accent}` 只给「品牌电压」点**：CTA、`.accent` 强调词、圆点、编号徽、图标。它是全站唯一彩色，省着用才有力。
- **衬线斜体 `{typography.serif-accent}` 只点标题里的半句**，且永远配琥珀色——这是品牌签名，别下放到正文或按钮。
- **半径分级共存**：`{rounded.sm}`/`{rounded.md}` 给交互控件，`{rounded.lg}`/`{rounded.xl}` 给卡片/窗，`{rounded.pill}` 只给 badge 与 chip。别混。
- **抬升只用 2 档**：发丝边（`{colors.border}`）做静态卡片，`shadow.window` 做设备窗/图。别加第 3 种厚投影。
- **正文/次级用 `{colors.text-dim}` 而非 `{colors.text-mute}`**：mute 仅留给真正可牺牲的 mono 元信息（达 3:1，未达正文 4.5:1）。
- **mono（JetBrains Mono）只用于 eyebrow、meta、格式 chip**——它是「技术感」的声音，不进正文。
- **section 垂直节奏守 96px**，连续 split 才收紧到 32px，保持呼吸感。

### Don't

- **别让白字直接压在琥珀 `{colors.accent}` 上做正文级阅读**：2.73:1（暗色 2.11:1）不达标，按钮请改用更深底色或深字（见优化清单）。
- **别再引入第二个装饰色**：单琥珀是整套语气的支点，加第二个彩色会冲淡「安静」。
- **别把衬线斜体用成通篇**：它靠稀缺产生签名感，铺满即廉价。
- **别给标题上 700 以上字重**：display 封顶 700，其余 ≤600；当前加载的 Inter 800/900 全站未用，应删。
- **别用厚重单层投影**：系统是发丝边 + 柔双层窗影的克制语言。
- **别把交互目标做到 34px 以下还指望移动端好点**：移动端 nav 控件应升到 ≥44px。
- **别依赖 JS 才能看到正文**：`.reveal` 的 `opacity:0` 应在无 JS / 慢载时有兜底可见态。

---

## 7. Open Questions

- 双语策略是否刻意？hero h1「One app.」、hero-badge、pillar 标题（Multi-Workspace 等）**硬编码英文、未进 i18n 字典**，中英切换时不变。这是品牌姿态还是遗漏？——影响是否要把 pillar 标题纳入 i18n。
- 主 CTA「即将到来 / Coming soon」目前惰性。正式发布后下载按钮的真实目标 URL / 多入口（App Store？直链 dmg？）是什么？
- 是否需要满足明确的 WCAG AA 合规目标（如上架/商务要求）？这决定琥珀 CTA 对比度问题是「建议」还是「必须」。
- `.cta-links`（社区/文档/邮件）与 footer 链接当前多为 `href="#"` 占位，正式链接待定。
- 是否计划新增除明/暗外的更多站点主题（产品内有 15 套，站点仅 2 套）？

---

## 8. Companion files

- [x] `design-tokens.json` — DTCG 格式结构化 tokens（含 `anydesign.dark` / `anydesign.a11y` 扩展）
- [x] `design-a11y.md` — 11 组关键色对的 WCAG 2.1 对比度报告
- [x] 渲染截图 — `folio-light-revealed.png` / `folio-dark-revealed.png` / `folio-hero-light.png`（位于 Stepper 工作目录，可按需移入）

---

*End of analysis. 下一步建议见对话中的「优化清单」——已按优先级分级，确认后即可落到 index.html。*
