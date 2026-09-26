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

- **Blue circle cursor** that grows over interactive elements (pointer-fine only)
- **One pinned act per page** — the home page pins the "how I work" section, the About
  page pins the five-step process. Everything else is an ordinary scroll-through.
- **Editorial case list** — the home page's selected work is five hairline rows, each a
  link into its own case study, with real duration/scope facts instead of decorative cards
- **Engine count bloom** (`data-sc-count`) for the year/project/client figures
- **One marquee** — the client strip on the home page, at label size, paused on hover
- **Mobile menu** — one `<nav>` that is a row on desktop and a panel under 860px,
  driven by `data-open` so CSS owns the layout and JS owns no geometry
- **View Transitions** between pages, plus `prefers-reduced-motion` handled by the engine

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
- `build_site.py` regenerates all pages from the project data at its top

## Rebuild

```bash
node build_site.mjs          # every page is generated; never hand-edit page bodies
npx impeccable detect .      # 61-rule design scan (findings on stderr, --json for CI)
```

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
