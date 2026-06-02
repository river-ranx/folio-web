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
index.html              # Single-file site (HTML + CSS + JS + i18n dictionary)
assets/
  app-icon.png          # Folio app icon
  landings/             # 7 hero landing images (one per feature section)
  welcome/              # Welcome-window screenshot used below the hero
```
