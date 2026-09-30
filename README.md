# Folio — One app. See every file.

The marketing website for **Folio**, a universal file viewer for Mac.

🌐 **Live**: https://river-ranx.github.io/folio-web/

## Stack

- Pure static site — single `index.html`, no build step, no framework
- Inline CSS / vanilla JS for theme & i18n
- Hosted on GitHub Pages (main branch, root)

## Languages

- English (default)
- 简体中文 (via the globe toggle in the top-right; choice persists in `localStorage`)

## Local preview

```bash
python3 -m http.server 8765 --bind 127.0.0.1
# then open http://127.0.0.1:8765/
```

## Deploy

Pushing to `main` is the deploy. GitHub Pages serves the repo root.

## Structure

```
index.html              # Markup only
assets/
  site.css              # All styles (dark default, html.light overrides)
  i18n.js               # en / zh dictionary + applyI18n
  app.js                # Shell: theme, language, nav, reveal, FAQ, marquee
  hero.js               # Live Folio window driven by file-type chips
  showcase.js           # Bento micro-demos, chaptered recordings, full-edition palette
  app-icon.png          # Folio app icon
  img/                  # Screenshots (webp) + og.jpg
  video/                # Screen recordings (mp4 + poster), lazy-loaded
```
