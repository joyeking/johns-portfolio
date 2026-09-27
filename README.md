# Yohannes Assefa — Portfolio Recreation

A multi-page recreation and upgrade of the [Framer portfolio](https://appreciative-methods-876869.framer.app), built as a static site on the unmodified [scroll-craft](https://github.com/nateherkai/scroll-craft) engine.

**Live:** https://joyeking.github.io/johns-portfolio/

## Pages

| Path | Page |
|---|---|
| `/` | Home: hero, client strip, the five case studies as an editorial list, pinned process, capabilities, about + numbers, two client notes, FAQ, contact |
| `/about/` | Story, career timeline, toolkit, 5-step process |
| `/projects/` | All seven projects |
| `/projects/<slug>/` | Seven case-study pages (challenge / approach / outcome, gallery) |
| `/blogs/` | Insights list |
| `/blogs/<slug>/` | Two article pages |

## Signature interactions

Deliberately few. The site uses the scroll-craft engine's devices and almost nothing else.
Every item below is verified working in a browser; `DESIGN.md` §18 records what was
broken and why it was invisible.

- **Blue circle cursor** that grows over interactive elements (pointer-fine only)
- **One pinned act per page** — the home page pins the "how I work" section (three
  steps), the About page pins the five-step process. The span is the act's entire
  scroll budget: travel is exactly `(span - 1) × 100vh`, because the stage is
  `100svh` tall. Both are set in `build_site.mjs` (`PIN_SPAN_HOME` / `PIN_SPAN_ABOUT`).
  Each step lights as the rail reaches its slot — numeral to `--blue`, heading to
  `--ink`, body copy 0.68 → 1, and the 2px rule above it fills — so the section
  plays as a sequence rather than a static grid beside a progress bar.
- **Staggered entrances** — `[data-sc-stagger]` cascades a container's direct
  children. A staggering container is a *trigger*, not a reveal target: it does not
  fade its own opacity, because that fade is a ceiling on every child. It keeps its
  blur, so a list pulls into focus as a whole on arrival.
- **Word-by-word page titles** — titles are split into `.kt-w` spans **in the HTML**
  so the split is correct from first paint. (`data-sc-kinetic` looks like it should
  do this and does not: the engine only splits text for an element that is also a
  `[data-sc-cue]` inside a `[data-sc-act]`.)
- **Editorial case list** — the home page's selected work is five hairline rows, all
  identical at rest; the hovered (or keyboard-focused) one is the one that enlarges
- **Engine count bloom** (`data-sc-count`) for the year/project/client figures. These
  only run inside a `[data-sc-act]`, so the section holding them must be one.
- **One marquee** — the client strip on the home page, at label size, paused on hover
- **Mobile menu** — one `<nav>` that is a row on desktop and a panel under 860px,
  driven by `data-open` so CSS owns the layout and JS owns no geometry
- **View Transitions** between pages, plus `prefers-reduced-motion` handled by the engine

### One thing to know before editing `transition`

A `transition` shorthand **replaces** the whole list — it does not merge with a
rule further up the cascade. Two of the site's motion defects were exactly this: a
retune that dropped `filter` from the reveal, and a hover rule that dropped
`opacity` from a staggered row, so the row snapped in instantly while its rise was
still delayed. Any new rule that sets `transition` on an element that also carries
`data-sc-in` (or is a child of `[data-sc-stagger]`) **must** include `opacity` and
`filter`, or it will silently delete that element's entrance.

## Design system

The rules live at the top of the `v12 — EDITORIAL PAPER` block in `site.css`. Five
rules carry the system:

1. One display shout per page (the hero) — every other heading is set in the text face
2. The accent is a state, never decoration
3. Rows and hairlines carry structure before boxes do
4. One radius scale: `10px` for clickable surfaces, `999px` for pills/tracks
5. Nothing invented — the numbers are structure and timeline, never invented results

The design work is implemented as `v12 — EDITORIAL PAPER`, `v13 — POLISH PASS`,
`v14 — WARM PALETTE`, `v15 — SECTION GROUNDS`, `v16 — MIAMI MARMALADE` and
`v17 — SURFACES & MOTION` blocks at the end of `site.css` (earlier `v2`–`v11`
blocks are history). Retired components were deleted rather than overridden:
the odometer counters, the sticky project stack, the rotated process cards, the
second grain overlay, the `.index-grid`/`.index-card` work grid, the full-bleed
`50vw` panel hack, and their JS.

## Section grounds

A section's background is painted by the **section**, never by an inner panel
forced full-bleed with `calc(50% - 50vw)` — that maths includes the scrollbar and
cannot fill a pinned act. The generator marks the section instead:

```html
<section class="section section-line" data-ground="sand" …>
```

`data-ground` is one of `sand`, `powder` or `slate`. Every ground re-derives its
own `--ink`, `--muted`, hairline and border tokens from the ground it sits on, so
a tinted panel is always readable. Muted is ink-dominant — 78% on the light
grounds, 90% on slate, because a dark ground needs a much lighter tint. Full
reasoning and the measured ratios are in `DESIGN.md §16`.

## Palette

The v14 four remain the base, defined once in the v14 block as
`--butter #FEFABF`, `--chocolate #342626`, `--powder #C8D2DC`,
`--sand #DDC6B6`. Roles and contrast are tabulated in `DESIGN.md §13`.

**v16 adds five more** and reassigns roles across both sets:

| Swatch | Hex | Role |
|---|---|---|
| Centre Earth | `#665547` | the dark canvas, everywhere |
| Fertile Soil | `#8B5D3B` | the button hover |
| Brown Alpaca | `#BA6B28` | the mid-tone bridge |
| Miami Marmalade | `#F09419` | every colour fill on the site |
| Severely Burnt Toast | `#251007` | the clicked state; the ink on marmalade |

The rule the new palette forces: **marmalade is a fill, never a label.** It
measures 2.19 on butter and 3.03 on earth, so the text accent is marmalade
mixed a long way toward the ground it sits on. Every other colour in the v16
block is a `color-mix` of these nine, so the site still re-derives from a small
set. Buttons run one ramp — marmalade → fertile soil → burnt toast — with ink
flipping at each step so all three states clear AA (7.75 / 5.27 / 16.99).

## Per-project canvases

Each case study is painted in **its own project's colour**: the brand hue taken a
long way toward burnt toast, so it is dark and quiet enough to read a case study
on, and still recognisably that project. The page inverts to light ink on it, in
both themes.

| Project | Canvas |
|---|---|
| ETtravel | `#21354A` deep travel blue |
| John's Photography | `#281E1B` near-black gallery |
| JoyInterior | `#4F3625` warm tan / wood |
| Gwarinpa Real Estate | `#1F202F` navy |
| Museum of Art in Addis | `#1F120B` near-black |

Measured in `DESIGN.md §16`. The hue lives in `tone:` in `build_site.mjs` and
reaches the page as `data-project` on `<body>`, so adding a project means one
field and one CSS rule. The two archive projects have no live site, so they keep
the page canvas rather than invent a colour.

## Design skills

Installed into `.agents/skills/` (the location Cline scans):

| Skill | Source | What it is for |
|---|---|---|
| `impeccable` | `pbakaus/impeccable` | Design vocabulary + a 61-rule detector (`npx impeccable detect .`) |
| `design-taste-frontend` | `Leonxlnx/taste-skill` | Anti-slop design system: brief inference, dials, layout/type/color/motion rules |
| `redesign-existing-projects` | `Leonxlnx/taste-skill` | Audit-first upgrades for an existing codebase |

```bash
npx skills update                       # refresh what is installed
npx skills add Leonxlnx/taste-skill -s minimalist-ui   # the taste repo has more variants
```

## Stack

- Static HTML/CSS/JS — no framework, no build step required to view
- `engine/scrollcraft.css` + `engine/scrollcraft.js` used unmodified per the engine's rules
- `site.css` / `site.js` carry the portfolio's own design system and bespoke interactions
- `build_site.mjs` regenerates all pages, `sitemap.xml` and nothing else

## Rebuild

```bash
node build_site.mjs          # every page is generated; never hand-edit page bodies
npx impeccable detect .      # 61-rule design scan (findings on stderr, --json for CI)
```

`build_site.mjs` also writes `sitemap.xml` (13 URLs, directory-form, cross-checked
against the pages' own canonical tags). It is gitignored as build output and is
regenerated on every run, so it must never be committed by hand.

### Deploy-critical assets

`assets/shows/` holds the four captured stills the two archive case studies display
in a browser frame (desktop + phone for each). They are committed, and the pages
reference **only** this folder.

They are derived from `presentation-assets/`, which is gitignored and holds the
full-size PNG captures (30 MB, fourteen frames per project). An earlier version of
the pages pointed straight at `presentation-assets/`, so those two case studies
rendered their own work perfectly in local preview and 404'd on the deployed site.
`assets/shows/` is the same four frames re-encoded as JPEG q84 at identical pixel
dimensions — 3.4 MB became 727 KB. After new captures, re-encode into
`assets/shows/`; the generator only references the paths and does no image
processing of its own.

### Output encoding

`build_site.mjs` writes UTF-8 with no BOM. If you post-process the generated
HTML in PowerShell, read and write it as UTF-8 explicitly
(`[System.IO.File]::ReadAllText($p, [Text.Encoding]::UTF8)`). A default-encoded
`Get-Content`/`Set-Content` round-trip double-encodes the em dashes and curly
apostrophes into `â€"` and `â€™`, which then shows up as a garbled browser tab
title. The titles and descriptions are plain UTF-8 and must stay that way.

### Logo

`assets/site/logo.png` is the full-size source (1122x1402, ~2.4 MB) and is
excluded from git. Three square crops are derived from it and are what the site
loads — `logo-512.jpg` for the nav brand mark, `logo-180.jpg` for the Apple touch
icon, `logo-64.jpg` for the favicon. To regenerate them after replacing the
source, crop a 700px-wide window centred on the face (centre ≈ x 561, y 640 in
the source) and downscale to each size. `LOGO`, `LOGO_ICON` and `LOGO_APPLE` at
the top of `build_site.mjs` point at these files.

## Preview locally

```bash
node dev-server.mjs          # http://localhost:4321/  (or: node dev-server.mjs 5173)
```

Dependency-free static server in the repo root; it only serves this folder and
404s anything else. Stop it with `Ctrl+C` in that terminal, or
`Get-Process node | Where-Object { $_.CommandLine -like '*dev-server*' } | Stop-Process`.

`engine/scrollcraft.css` and `engine/scrollcraft.js` must stay byte-identical — check
with `git diff --stat engine/`, which should print nothing.

## Credits

- Original design & content: Yohannes Assefa (Johnny A.Deme)
- Scroll engine: [nateherkai/scroll-craft](https://github.com/nateherkai/scroll-craft) (MIT)
