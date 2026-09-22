# Vivid Horizons Sri Lanka — website

A single-page static site for **Vivid Horizons Sri Lanka** (Art & Travel Experiences):
handmade pencil portraits, canvas paintings, digital art, cover art and wall art,
with island-wide delivery.

**Live site:** https://vividhorizonssl.github.io/vivid-horizons-srilanka/

## What's on the page

- Hero with WhatsApp call-to-action (English + Sinhala)
- Six services: pencil, canvas, digital, cover, wall art, lettering & cartoons
- Pencil portrait price list (A4 / A3, single / couple / family)
- Gallery with a click-to-zoom lightbox
- Gifting section, three-step ordering guide, contact links
- Floating WhatsApp button, sticky header, cinematic scroll (parallax, focus-pull reveals)

## Files

```
index.html          the whole page
css/styles.css      styles (brand palette + layout)
js/main.js          nav, scroll reveals, lightbox — no dependencies
assets/             emblem (SVG mark), favicon, banner, logo, services poster
assets/gallery/     artwork photos
```

No build step, no framework. Open `index.html` in a browser, or serve locally:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Editing the common things

| What           | Where                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------- |
| Prices         | `index.html` → `<!-- PRICING -->` section                                                 |
| Services       | `index.html` → `<!-- SERVICES -->` section                                                |
| Phone number   | search for `94769647120` (WhatsApp links use the `94` country code, no leading `0`)       |
| Colours        | `css/styles.css` → the `:root` block at the top                                           |
| Gallery images | drop a JPEG in `assets/gallery/`, then copy a `.shot` button block in the gallery section |
| Logo / emblem  | `assets/emblem.svg` (the mark used in the header, contact and footer)                     |
| Motion         | `js/main.js` → the scroll loop; `data-speed` on an element sets its parallax drift        |

Keep gallery images around 1000&nbsp;px wide and saved as JPEG so the page stays fast.

A gallery tile looks like this — the `.shot-media` wrapper is the mat window the
artwork drifts inside as the page scrolls, and `data-speed` sets how far it drifts:

```html
<button class="shot reveal" type="button" data-full="assets/gallery/NAME.jpg" data-caption="Caption shown under the zoomed image">
  <span class="shot-media"><img src="assets/gallery/NAME.jpg" alt="Describe the artwork" width="900" height="600" loading="lazy" decoding="async" data-speed="0.03"></span>
  <span class="shot-label">Short label</span>
</button>
```

All motion is disabled automatically for visitors who ask their device for
reduced motion, so nothing added here needs a separate accessible fallback.

## Deployment

Pushing to `main` publishes automatically via GitHub Pages (Settings → Pages →
Deploy from a branch → `main` / root). `.nojekyll` is present so files and folders
are served exactly as committed.
