---
name: portfolio-motion-design
description: >-
  The complete interaction, effect and transition system of the Yohannes Assefa
  johns-portfolio site (static HTML/CSS/JS on the unmodified scroll-craft
  engine). Load this skill whenever you add pages, sections, components or new
  effects to this site, recreate its motion language elsewhere, or need to know
  which data-sc-* attribute / CSS pattern / JS hook to reach for. Covers scroll
  acts, cursor, counters, sticky stacks, marquees, view transitions, theming,
  hover effects, timing tokens, accessibility gates and engine gotchas.
---

# Portfolio Motion & Interaction System

Site: `johns-portfolio` — multi-page static portfolio for Yohannes Assefa.
Stack: plain HTML/CSS/JS. No framework. Two stylesheets and two scripts on every page:

| File | Role | May edit? |
|---|---|---|
| `engine/scrollcraft.css` | Engine "taste floor": tokens + device styles | **No** (unmodified per engine rules) |
| `engine/scrollcraft.js` | Scroll runtime: acts, cues, pointer devices | **No** |
| `site.css` | Portfolio design system + bespoke effects | Yes |
| `site.js` | Bespoke interactions (cursor, counters, routing, theme) | Yes |

`build_site.py` regenerates all pages from project data at its top. Never hand-edit generated page bodies; regenerate instead.

---

## 1. Design tokens

Defined in `site.css` `:root` (overrides of engine tokens) plus a v5 theme block:

```css
--sc-canvas:#151515   --sc-surface:#202020   --sc-ink:#f5f3ee
--sc-ink-soft:#a5a7aa --sc-accent:#09aef4    --sc-accent-ink:#071116
--sc-font-display:'Bebas Neue'                --sc-font-text:Manrope
/* mono accent face: 'DM Mono' used directly in font shorthands */
```

- Background is never flat: `body` carries a 4px dot grid (`radial-gradient(#4c4c4c .7px, …)`) plus a fixed `.noise` SVG feTurbulence overlay at `opacity:.06`, `z-index:50`, `pointer-events:none`.
- Light theme = `html[data-theme=light]` swapping a second token set (`--bg #f3f1ea`, surfaces, borders, band inversion). Persisted in `localStorage.theme`; a tiny inline `<script>` in `<head>` applies it **before first paint** to avoid a dark flash.
- Easings come from the engine: `--sc-ease-out: cubic-bezier(0.23,1,0.32,1)` is the workhorse; the theme knob uses a springy `cubic-bezier(.34,1.56,.64,1)`.

## 2. Timing vocabulary (hold to these)

| Duration | Used for |
|---|---|
| `.18–.25s` | mode-switch hover/active scale, button transform/box-shadow, theme color fades |
| `.35s` | border-color transitions, button sweep |
| `.45s` | browser-frame device width change |
| `.6s–.7s` | image zoom/saturate hovers (`gallery`, `post-card`, `img-band`, `project-card img .6s`) |
| `620ms` | `[data-sc-in]` flow reveals (opacity + translateY(14px→0) + blur(5px→0)) |
| `1.05s` | odometer digit strip roll, `cubic-bezier(.18,.82,.18,1)` |
| `1.2s` | hero portrait entrance (`portrait-in`: opacity 0→1, translateY(60px)+rotate(4deg)→none) |
| `30s linear infinite` | marquee loop (`translateX(-50%)`, track duplicated ×2) |
| View transition | old page fade-out `.25s` (−12px up), new page fade-in `.45s` (+15px up) |

Rule of thumb already established on the site: **hover feedback fast (~0.2–0.4s), reveals slow (~0.6–0.7s), counters slower still (1s+)**.

---

## 3. Scroll-driven layer — scroll-craft `data-sc-*` attributes as used here

The engine exposes one normalized progress `p ∈ [0,1]` per act (published as `--sc-p`). What this site actually uses:

### Acts
```html
<section data-sc-act="flow">…</section>                          <!-- default; normal scroll-through -->
<section data-sc-act="pin" data-sc-span="1.6"
         data-sc-drift="#1a1a1a"><div data-sc-stage>…</div></section> <!-- home About split -->
```
- `data-sc-span="1.6"` = the pinned act owns 1.6 viewport-heights of scroll.
- `data-sc-drift="#1a1a1a"` interpolates the whole page background toward that color while the act is live — the only place background drift is used (About section).
- The stage child must compute `position:sticky`. Never set `position` yourself on a `[data-sc-stage]`; the engine warns if it breaks.

### In-section reveals (fire once via IntersectionObserver)
- `data-sc-in` — reveal on entry; content must NOT re-hide when scrolling back up (deliberate engine stance).
- `data-sc-stagger="60|70|80|90|110"` on a parent staggers its children by ms. Site conventions: headings/blog grids `90`, galleries/img-bands `60`, project grids `80`, steps/timeline `70–110`.
- site.css adds the signature blur: `[data-sc-in]{filter:blur(5px)} [data-sc-in].sc-in{filter:blur(0)}` with a shared 620ms transition on opacity/transform/filter. Keep this override **after** the engine stylesheet import or the blur loses to engine defaults.

### Pinned-act choreography (home About + case pages)
- `data-sc-cue="from to rampIn"` — opacity/rise keyed to pin progress, e.g. `"0 .7 0"` (enter at 0, leave at .7, instant-in) and `".18 .88"` (long plateau). Cues get a ~40% full-opacity plateau by design so text never reads faded mid-window.
- `data-sc-kinetic="lines|words"` — splits text into masked line/word spans that stagger-slide up. Used on the About heading (`lines`) and every case-study `h1` (`words`). Splitting measures line boxes → runs after `document.fonts.ready`.
- `data-sc-reveal="left"` — clip-path wipe (up/down/left/right/iris). Used on the about photo and process photo.
- Cue'd elements are `opacity:0` pre-paint and get `pointer-events:none` until lit (>0.5).

### Pointer devices (desktop-only, `(hover:hover) and (pointer:fine)`)
- `data-sc-magnet=".2–.3"` — element drifts toward the cursor inside bounds, lerp-damped. On CTAs (`See the work ↗`, Contact, Submit, all `button.alt`s).
- `data-sc-spotlight` — publishes `--sc-mx/--sc-my`; engine draws an accent radial glow following the pointer. On service cards and tool cards.
- `data-sc-tilt="3"` — spring-damped 3D tilt. On all `project-card`s in the projects grid.
- None of these exist on touch devices or under reduced motion. Do not add JS fallbacks.

---

## 4. Bespoke site.js interactions

### Custom blue circle cursor
- Fixed `.cursor` div, 18px blue disc, `mix-blend-mode:screen` (exclusion in light theme), follows `pointermove` with direct translate.
- Grows to 42px (`.is-active`, `opacity:.78`) over `a, button, summary, .project-layer, .project-card` via pointerenter/leave.
- Only mounts when `pointer:fine` and no reduced-motion; `display:none` under 760px and in the reduced-motion block anyway.
- New interactive component ⇒ add its selector to that NodeList in `site.js`.

### Sequential odometer counters (home metrics)
- Markup: `<div class="metric" data-target="10+"><div class="reel" aria-label="10 plus clients worldwide"></div><small>…</small></div>`.
- One IntersectionObserver watches the **first** metric (threshold .5). When hit, each metric's counter starts with `setTimeout(i*650)` so years → projects → clients roll one after another.
- Each digit becomes a vertical 0–9 strip translated by `translateY(-N*10%)` over 1.05s. Non-digit chars (the `+`) render static. Guard flag `data-counted` prevents re-runs; IO disconnects after firing.
- Reel sizing lives in both base CSS and the 760px media query (58px ↔ 45px) — keep both in sync.

### Sticky stacking featured projects (home)
- `.project-stack` holds four `a.project-layer`s, each `position:sticky` with stepped offsets `top:11vh / 14vh / 17vh / 20vh`, alternating surface tints (`#202020`, `#24211f`, `#1d2424`, `#202026`), `height:77vh; margin-bottom:14vh`. Panels pin and the next layers on top. No JS — pure CSS stacking. Mobile collapses to flex column with image top / copy bottom at `72vh`.

### Marquee
- `.marquee-track` contains the item list duplicated exactly ×2; animation `translateX(-50%)` loops seamlessly. Hover pauses (`animation-play-state:paused`). Items use Bebas at clamp size with blue ✦ separators. Disabled under reduced motion.

### View Transitions between pages
- Every internal link has `data-route`. Click handler: skip if metaKey/ctrlKey held or `!document.startViewTransition`; otherwise `preventDefault()` and `document.startViewTransition(() => location.href = a.href)`.
- CSS: `::view-transition-old(root){animation:fade-out .25s ease}` / `::view-transition-new(root){animation:fade-in .45s ease}` (old slides up −12px, new rises from +15px). Any new page link should carry `data-route`.

### Dark/light mode switch
- Fixed pill bottom-right (`[data-mode-switch]`): sun/moon options dim/brighten by theme, knob springs left↔right (`left` transition, springy bezier). Hover `scale(1.05)`, active `scale(.94)`.
- Toggles `html[data-theme=light]`, persists to localStorage, syncs `aria-pressed`.

### Browser-frame live preview (case studies)
- `.browser-frame[data-frame]`: mac dots + URL bar chrome, `.device-row` pills (Desktop/Tablet/Mobile). Device buttons swap `.is-active` and set `.frame-screen` width; the screen animates width/max-width `.45s var(--sc-ease-out)`. Hidden below 760px (screen forced 100%).
- `.frame-load` button covers the stage with a poster; click injects a lazy `iframe` (real Framer site) via `replaceChildren`.

### Small behaviors
- Demo form: submit swaps button text to "Thanks, your message is ready." and disables it (no backend).
- FAQ uses native `<details open>` with a custom blue `+` marker on the summary.
- Scroll progress bar: `[data-sc-progress]` fixed 2px accent line, engine drives `scaleX`.
- Focus handling is automatic: engine centers a pinned act when focus lands inside a not-yet-lit cue.

---

## 5. Hover/effect patterns inventory (site.css)

| Pattern | Where | Spec |
|---|---|---|
| Button sweep fill | `.button::after` white 18% sheet | `translateY(101%)→0`, .35s ease-out |
| Image zoom + saturate | `.gallery img` | `scale(1.03)`, desaturated→full, .7s |
| Card image zoom + darken | `.project-card img` | `scale(1.06)`, opacity .6→.4 (.6s/.4s) |
| Post-card zoom | `.post-card img` | `scale(1.04)`, .7s |
| Band zoom | `.img-band img` | `scale(1.05)`, saturate .82→1.08, z-index bump |
| Quote lift | `.quote:hover` | `translateY(-3px)`, border→blue |
| Card glow | `.project-card:hover` | border-color→blue + big soft shadow `0 24px 60px #0009` |
| Nav pill active | `.nav-links a` | hover/current fills blue, ink flips dark |
| Tool/service hairline | `.tool,.service` | border-color eases .35s |
| Portrait entrance | `.hero-portrait` | keyframes `portrait-in` 1.2s, grayscale w/ blue offset shadow `28px 32px 0 #09aef422` |

Type scale: display faces (Bebas Neue) run tight leading `.77–.9` and negative tracking; kickers/meta are DM Mono uppercase, letter-spaced, blue.

---

## 6. Accessibility & performance gates (never bypass)

1. **prefers-reduced-motion**: global kill switch in site.css (`animation-duration:.01ms!important; transition-duration:.01ms!important; …`), cursor hidden, marquee stopped. The engine degrades gracefully (cues fade without travel, reveals settle, pan rail becomes a snap-scroll region). Any new animation needs a story here.
2. **Touch**: cursor, magnet, tilt, spotlight gated to fine pointers. Never assume mouse.
3. Reveals fire once (`io.unobserve`) — re-hiding on scroll-up is treated as a defect.
4. Media loads lazily/near-need (`loading="lazy"` on band/gallery images; iframe only after click).
5. ARIA: `aria-current="page"` nav state, `aria-label`s on icon-ish controls, `aria-pressed` on the theme switch, reels carry descriptive `aria-label`s since digits are decorative spans.
6. Theme applied pre-paint by head script — keep it first in `<head>`.

---

## 7. Page assembly checklist (new page)

Every page ships, in order:
1. `<head>`: charset/viewport, title/description, **theme pre-paint script**, favicon, OG tags, `engine/scrollcraft.css`, then `site.css` (order matters for overrides).
2. `<body>` opening furniture: `.cursor` div, `.noise`, `[data-sc-progress]`, `.mode-switch` button, fixed `.site-nav` (pill, blurred, centered via `inset:24px 50% auto auto; translateX(50%)`).
3. Sections: `page-hero` (gradient, giant staggered `h1` lines) → content sections wrapped in `section section-line` + `data-sc-act="flow"` → `band-wrap` img band → `contact-band#contact` with demo form.
4. Footer, then scripts: `engine/scrollcraft.js` then `site.js` (site.js calls `ScrollCraft.mount(document.body)` last).
5. Internal links get `data-route`; interactive CTAs get `data-sc-magnet`; card grids get `data-sc-in` + `data-sc-stagger`.

Relative asset/script paths shift per depth (`../` from `/about/`, `../../` from `/projects/<slug>/`).

---

## 8. Gotchas learned while building (do not rediscover)

- Engine files stay byte-identical — all customization goes through token overrides in `site.css` and additive blocks appended there (v2/v3/v4/v5/v6 comment markers).
- Don't set `position` on `[data-sc-stage]` (kills sticky pinning; engine console-warns).
- `[data-sc-in]` blur override must load after the engine CSS.
- Cue windows need plateaus; a triangle cue reads permanently faded.
- Counters: single IO + sequential timeouts, `data-counted` guard; sizes duplicated in two breakpoints.
- Marquee needs the track content duplicated ×2 or `-50%` loops jump.
- View-transition interception must pass through modifier-key clicks and unsupported browsers.
- Regenerate pages with `python build_site.py` rather than editing generated HTML.

---

## 9. If you're writing another SKILL.md like this

Minimum viable structure so tooling can load it:
- YAML frontmatter: `name` (kebab-case, unique) and `description` written as *when-to-use* triggers ("Load whenever…"), not a vague summary.
- Body: short overview → architecture/rules table → the actual vocabulary (attributes, classes, timings) → concrete recipes/checklists → gotchas.
- Reference real file paths and exact values (durations, easings, selectors) — a skill is only useful if it's copy-pasteable truth.
- State what may/may not be modified and how to verify (`python build_site.py`, then eyeball in browser).
