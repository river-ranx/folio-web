# Folio — One app. See every file.

The marketing website for **Folio**, a universal file viewer for Mac.

🌐 **Live**: https://river-ranx.github.io/folio-web/

## Stack

- Pure static site — `index.html` + `assets/css`, `assets/js`; no build step, no framework
- Vanilla JS for theme, i18n and the scroll / demo choreography
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
index.html              # Markup + English copy (default)
assets/
  css/site.css          # Tokens, layout, all motion
  js/i18n.js            # 中文 dictionary (+ <title> / meta)
  js/site.js            # Theme, i18n, reveal, sticky stage, demos, video loader
  stage/                # Sticky-stage window screenshots (webp)
  video/                # Screen recordings (mp4 + webp poster)
  app-icon.png, og.jpg
```
