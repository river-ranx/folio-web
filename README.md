# Folio — Every file your AI writes. Read it and edit it right where it is.

The marketing website for **Folio Pro**, a Mac app for the files your AI agents write: run Claude Code, ChatGPT and Gemini side by side, read and edit Markdown and Office files in place, and undo any bad edit with version history. Windows is coming.

Folio Pro is the only edition on the site, and every download button points to `releases/latest/download/Folio-Pro.zip` (the latest GitHub Release asset). The URL lives in one place: the `PRO_URL` constant in `index.html`'s `applyI18n`.

🌐 **Live**: [https://river-ranx.github.io/folio-web/](https://river-ranx.github.io/folio-web/)

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
  landings/             # Feature-section screenshots (Markdown, Word, PDF, EPUB, history, themes, Pro agent shots…)
  welcome/              # Home-window screenshot used below the hero
```




