# Folio — One app. See every file.

The marketing website for **Folio**, a universal file viewer for Mac.

Two editions, both free for now:

| Edition | Channel | Download button points to |
| --- | --- | --- |
| **Folio** | Mac App Store (sandboxed) | the App Store listing |
| **Folio Pro** | Direct download (Developer ID, Apple Silicon) | `releases/latest/download/Folio-Pro.zip` (latest GitHub Release asset) |

The Folio Pro URL lives in one place: the `PRO_URL` constant in `assets/js/main.js`'s `applyI18n`.

🌐 **Live**: [https://river-ranx.github.io/folio-web/](https://river-ranx.github.io/folio-web/)

## Stack

- Pure static site — no build step, no framework, no npm install
- **three.js** (vendored & minified under `assets/vendor/three/`, loaded through an import map) renders one full-screen WebGL stage shared by the whole page; scrolling moves the camera between scenes
- Post-processing: Bloom → grade (grain / vignette) → tone mapping
- Vanilla ES modules for UI, i18n and theme switching
- Hosted on GitHub Pages (main branch, root)

### Interactions

- The cursor is a light source: it lights the window, the file cards and the particles
- Click any floating file → it is pulled into the Folio window and the screen switches to the matching real screenshot; click empty space → shockwave
- Scroll: files converge into one window → chapter stage (code / image / markdown / office / video) → theme picker (the whole world recolors)
- Falls back to a static page without WebGL; respects `prefers-reduced-motion`; auto-lowers render quality on slow GPUs (`?q=high` forces full quality)

## Languages

- English (default)
- 简体中文 (via the globe toggle in the top-right; choice persists in `localStorage`)

## Local preview

ES modules need http(s), so open it through a local server (not `file://`):

```bash
python3 -m http.server 8765 --bind 127.0.0.1
# then open http://127.0.0.1:8765/
```

## Deploy

Pushing to `main` is the deploy. GitHub Pages serves the repo root.

## Structure

```
index.html              # Markup (all copy keys live in data-i18n attributes)
assets/
  css/site.css          # Design tokens + all styles (dark world, --accent set at runtime)
  js/main.js            # UI: i18n, nav, FAQ, scroll → scene state machine, theme picker
  js/scene.js           # three.js stage: window, cards, particles, beams, post-processing
  js/cardtex.js         # Procedural card faces for the 17 file formats
  js/i18n.js            # English / 简体中文 dictionary
  vendor/three/         # three.js 0.187 (minified ES modules + the few addons we use)
  screens/              # Window screenshots cropped from the landing posters (used as 3D screens)
  landings/             # Original posters (og:image)
  welcome/              # Original welcome-window screenshot
  app-icon.png
```
