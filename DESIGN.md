# DESIGN.md — the portfolio's visual system

The single source of truth for how this site looks, and why. Written for the next
person (or agent) who touches it. `build_site.mjs` renders every page; `site.css`
carries this system; `engine/scrollcraft.css` + `engine/scrollcraft.js` are
**unmodified** and must stay that way.

---

## 0. The design read

> Solo designer portfolio for prospective clients and recruiters, with a quiet
> editorial language, leaning toward native CSS on the engine's own vocabulary
> (`.sc-display`, `.sc-label`, `.sc-body`, tokens, `data-sc-*` devices).

Three dials, held deliberately low:

| Dial | Value | Meaning here |
|---|---|---|
| `DESIGN_VARIANCE` | 4 | Offset rhythm and an editorial grid — never rotated cards or tilted collage |
| `MOTION_INTENSITY` | 4 | Engine reveals, one pinned act, one marquee. No bounce, no tilt, no spotlight confetti |
| `VISUAL_DENSITY` | 2 | Airy. Space and hairlines carry structure instead of boxes and shadows |

## 1. The five rules (read these before adding anything)

1. **One shout per page.** The hero owns the display face. Every other heading is
   set in the text face. A page with six 100px headlines has no hierarchy left.
2. **The accent is a state, not a decoration.** Blue marks exactly one thing per
   viewport: the primary action. Labels, borders, numbers and headings are ink or
   muted. Links turn accent on hover.
3. **Rows and hairlines before cards.** Structure comes from alignment and 1px
   rules. A card earns its border only when the whole thing is clickable.
4. **One radius scale.** `10px` for anything you click or that holds content;
   `999px` only for pills/tracks/dots. Never mix.
5. **Nothing invented.** Numbers on this site are structure and timeline, never
   invented business results.

## 2. Type

Two families, one mono — unchanged from the brand:

- **Display:** Bebas Neue — the poster voice. Hero `<h1>` only, plus the
  three-digit result figures on case studies.
- **Text:** Manrope — all headings and prose. Weights 400/500/600/700 (500 and 600
  do the hierarchy work that 400↔700 used to shout).
- **Mono:** DM Mono — labels, meta, counts, chips. Always uppercase, always tracked.

| Token | Value | Used for |
|---|---|---|
| `--t-display` | `clamp(52px, 7.6vw, 118px)` | hero `<h1>` |
| `--t-h2` | `clamp(26px, 3vw, 40px)` | section headings |
| `--t-h3` | `clamp(19px, 1.6vw, 23px)` | entry titles, step titles |
| `--t-body` | `clamp(15px, 1.1vw, 16.5px)` | prose |
| `--t-small` | `13.5px` | secondary prose, card copy |
| `--t-label` | `12px` | labels, meta, chips |

Rules: display leading `.88`, headings `1.12`, body `1.68`. Display tracking `0`
(Bebas is already condensed); headings `-.02em`; labels `+.14em`. Prose measure
`62ch`. Headings get `text-wrap: balance`, paragraphs `text-wrap: pretty`.
Numbers are DM Mono with `font-variant-numeric: tabular-nums` — never proportional.

Labels carry a 22px hairline tick (`.kicker`) so a label reads as a deliberate
marker rather than a floating word.

## 3. Colour

| Role | Dark | Light | Notes |
|---|---|---|---|
| canvas | `#151515` | `#f3f1ea` | never flat: 26px dot field + `.noise` grain |
| surface | `#202020` | `#ffffff` | only for clickable containers |
| ink | `#f5f3ee` | `#191b20` | |
| muted | `#a5a7aa` | `#63666d` | ≥4.5:1 on canvas |
| accent | `#09aef4` | `#09aef4` | state only |
| hairline | `color-mix(in srgb, var(--ink) 14%, transparent)` | | 26% for interactive edges |

One accent. Hairlines are mixed from ink so they invert correctly with the theme.
Shadows run in a single direction (light from above) and are used at most once per
screen; depth is otherwise carried by the grain and the dot field. No pure black,
no pure white.

## 4. Space, grid, radius

`--sec: clamp(72px, 9vw, 132px)` vertical section rhythm, `--gap: 24px` row gap.
Container: `min(1180px, 100% - 48px)`. Editorial rows use
`38px | 160–220px | 1fr | 150px` (index, image, body, meta) and collapse to a stack
below 900px. Radius: `10px` / `999px` only. Nothing is rotated.

## 5. Icons

One inline SVG sprite in `build_site.mjs` (`SPRITE`), 24px viewBox, **1.5px stroke,
round caps, `currentColor`, no fills**. Use `<svg class="ic"><use href="#i-…"/></svg>`.
Available: arrow-right, arrow-up-right, mail, phone, pin, clock, search, layers,
target, chevron-down, menu, close, up, check, quote.

Rules: icons replace characters (`↗`, `→`, `+`) everywhere; always `aria-hidden`
with a text label beside them; never the only label; one size per context (18px
default, 16px inside buttons, 20px in step markers).

## 6. Motion

Inherited from the engine, deliberately narrow:

- `[data-sc-in]` / `[data-sc-stagger]` reveals — 620ms, opacity + 14px rise, once.
- One pinned act per page (`data-sc-act="pin"` + `data-sc-cue` plateaus).
- One marquee on the site, at label size, **paused on hover**, `aria-hidden`, and
  static under `prefers-reduced-motion`.
- Numbers use the engine's `data-sc-count` bloom (no bespoke odometer).
- Hover feedback 180–350ms `--sc-ease-out`; reveals 620ms; nothing loops.

Banned by this system: card rotation, 3D tilt, cursor spotlight on text blocks,
infinite micro-animations, bounce easing, coloured zero-offset glows.

## 7. States every interactive thing owes the user

Default → hover → `:focus-visible` (2px accent ring, 3px offset) → active →
disabled. The theme switch keeps `aria-pressed`; nav carries `aria-current="page"`;
the mobile menu button carries `aria-expanded` + `aria-controls`; the form has real
`<label>`s, `required`, `type=email`, and an `aria-live="polite"` status region; a
skip link jumps to `#main`; every page has one clear way forward and back.

## 8. Accessibility gates (never bypass)

WCAG AA body / AAA hero contrast in both themes · focus visible everywhere ·
`prefers-reduced-motion` honoured · real labels and headings in order · icons
decorative · navigation reachable at every breakpoint (the mobile menu is not
optional) · `lang`, `title`, description, OG/Twitter/canonical present.

## 9. Verification

```bash
node build_site.mjs          # regenerate every page from the data at the top
npx impeccable detect .      # 61-rule design detector, findings on stderr
```

Engine files must stay byte-identical: `git diff --stat engine/` returns nothing.

---

## 10. v12 — Editorial Paper (the current art direction)

Sections 0–9 describe v11, which disciplined the old design but kept its look.
v12 replaces the art direction. A cleaner version of the same idea is still the
same idea, so these are deliberate replacements, not refinements.

| | v11 | v12 |
|---|---|---|
| canvas | dark `#151515` first, dot grid | **cool neutral paper `#f1f2f2`** first, grain only; ink `#101114` is the alternate |
| display face | Bebas Neue (condensed sans) | **Newsreader** — editorial serif, used at 3 sizes |
| reading face | Manrope | Manrope (unchanged) |
| labels | DM Mono | DM Mono (unchanged) |
| accent | filled the primary button | **a mark only** — availability dot, focus ring, hover, links |
| primary action | accent fill | **inverts the canvas**: ink on paper, paper on ink |
| contact band | cream slab | **always inverts**, so it reads as a printed page break |
| nav | floating blurred pill | **full-width printed bar**, one hairline, no radius |
| radii | 10px / 14px | 6px / 8px — closer to print than app chrome |
| theme attribute | `data-theme=light` | `data-theme=dark` (paper is the default) |

**Type scale (serif):** `--t-display` `clamp(50px,8.2vw,124px)` hero only ·
`--t-h2` `clamp(30px,3.4vw,50px)` section headings · `clamp(23px,2.4vw,33px)`
project titles · pull quotes `clamp(21px,2.4vw,32px)/1.3`. Index numbers and one
word per hero are set **italic** — the only ornament in the system.

**Numbers stay mono** (`DM Mono`, tabular) in every context, so figures never
shift or pick up the serif's character.

**Rules added in v12**

1. The accent is never a fill. If something needs to be the loudest thing on
   screen, it is ink, not blue.
2. The contact band always inverts relative to the page.
3. One italic word per headline, never more.
4. Serif for meaning (headlines, titles, quotes), Manrope for reading and
   controls, DM Mono for data. No exceptions.
5. `data-sc-drift` is gone: the engine's colour drift cannot be themed, and a
   fixed dark drift fought the paper canvas. The scroll progress line keeps its
   device and is lifted above the bar instead.

**Two palette/font decisions came from the detector, not from taste alone**

- The first paper pass used a warm cream (`#f6f4ef`) and the detector flagged it
  13 times as "cream / beige — the safe tasteful AI default". It was right: the
  hue had to come from somewhere deliberate. The paper is now a **cool neutral**
  (`#f1f2f2`) against a **cool ink** (`#14161a`), which reads Swiss rather than
  cozy. Cream is not banned by this system; *unexamined* warmth is.
- The first serif was Instrument Serif, which the detector lists among faces that
  "no longer feel distinctive" because every generated UI converges on them.
  **Newsreader** replaced it.

**Known engine-owned findings (26, not fixable here).** The detector reports
`Primary font: geist` and `Primary font: instrument sans` 13× each. Those strings
come from the *default token values inside `engine/scrollcraft.css`*, which the
engine's own rules forbid editing. This site overrides them in `site.css`; the
detector reads the engine file, not the cascade. Left deliberately.

---

## 11. v13 — Polish pass

v12 set the art direction; v13 tightens it without changing the idea. It was
informed by two references cited in the project docs:

| Reference | Adopted | Rejected |
|---|---|---|
| `bchiang7/v4` | tonal ladder instead of wide shadows · large index numerals · accent reserved for states | — |
| `adrianhajdin/…` | motion kept on scroll | 3D canvases · neon gradients · bento-everything |

What changed:

- **Tonal ladder.** A new `--surface-2` (ink at 6%, 7% in dark) replaces the
  wide-shadow depth cue on `.browser-frame` and `.project-card`.
- **The index carries the sequence.** `.case-row .idx` is set large in the
  display serif with tabular figures and turns accent on row hover, so the
  list reads as a table of contents rather than five cards.
- **The work list is one rhythm.** Every row is identical at rest. v13 gave the
  first row `.is-lead` — a wider plate, a larger title — so the list had a
  hierarchy, but that made size a property of POSITION rather than of the
  pointer: the top project read as the featured one forever and the other four
  looked like footnotes. v20 retires `.is-lead` and gives every row the same
  enlargement on hover and focus instead. The `.is-featured` chip stays, because
  a label is honest and a size is not.
- **Labels only mark sections.** `.meta-row` and `.strip .item` drop their
  uppercase transform; `.kicker` keeps it.
- **Smaller furniture.** The mode switch, chips, service titles, timeline,
  project cards, and blog grid were each reduced a step.
- **The About desk.** A two-up `.about-pair` of captioned photographs.
- **Horizontal guard.** `overflow-x:clip` on the root rather than the body, so
  the engine's pinned transforms cannot be clipped.

**Retired here:** `.index-grid` / `.index-card`. Work renders as `.case-list`
(`.case-row`) on every page — home and `/projects/` use the same depth-aware
component. The generator's `indexCard()` helper and the `site.js` cursor-hover
selector that referenced `.index-card` were deleted, not left to rot.

## 12. Housekeeping rules

- **No inline styles in generated markup.** If a plate needs
  `object-fit:cover`, it gets a class in `site.css` — otherwise the paper
  palette cannot reach it. (`.showcase-img` was migrated for exactly this.)
- **No dead generator code.** A component that is retired in `site.css` must be
  deleted from `build_site.mjs` and unhooked from `site.js` in the same pass.
- **A class with no rule is either a bug or a JS hook.** `.showcase-toggle` is
  the latter — it exists only as a selector target. Everything else must have a
  rule, including a deliberate one for a default case (`.cs-duo .before`).

---

## 13. v14 — Warm palette

The four given swatches, used verbatim as the only literal colours in the file.
Every other value in the v14 block is a `color-mix` of two of them, so the whole
site can be re-derived from that one block.

| Swatch | Hex | Role | Luminance |
|---|---|---|---|
| Butter Yellow | `#FEFABF` | the paper (default canvas) | 0.93 |
| Dark Chocolate | `#342626` | the ink, and the dark canvas | 0.02 |
| Powder Blue | `#C8D2DC` | the cool note — surfaces, dark accent | 0.64 |
| Sand | `#DDC6B6` | the warmth — surfaces, dark muted | 0.59 |

### These four cannot carry text on their own

This is the finding that shaped the whole block. Of the six pairings:

| Pair | Ratio | |
|---|---|---|
| chocolate on butter | 13.53 | **AAA** |
| chocolate on powder | 9.45 | **AAA** |
| chocolate on sand | 8.84 | **AAA** |
| butter on sand | 1.53 | fail |
| butter on powder | 1.43 | fail |
| powder on sand | 1.07 | fail |

Three of the four are near-white (luminance 0.59–0.93) and one is near-black
(0.02). So **no two light swatches can be used against each other for text at
all.** Only chocolate-on-something survives, which means ink is the only
possible text colour in light mode and the palette cannot provide a second
text tier from the swatches alone.

### Role assignment

| Role | Light (butter canvas) | Dark (chocolate canvas) | Ratio |
|---|---|---|---|
| canvas | butter `#FEFABF` | chocolate `#342626` | — |
| ink | chocolate `#342626` | butter `#FEFABF` | 13.53 AAA |
| muted | chocolate 68% + butter 32% → `#756A57` | sand `#DDC6B6` | 4.97 / 8.84 |
| accent | powder 38% + chocolate 62% → `#6C676B` | powder `#C8D2DC` | 5.18 / 9.45 |
| band | inverts to chocolate | inverts to butter | 13.53 AAA |
| band copy | butter 55% + chocolate 45% | chocolate 65% + butter 35% | 5.19 / 4.55 |

Two decisions came from the numbers, not taste:

- **Muted is a derived tint, not raw sand.** Sand on butter is 1.53:1 — it is
  invisible as body copy. Muted had to come from chocolate lightened toward
  butter until it cleared 4.5:1, which lands at `#756A57`. Sand therefore does
  decorative work only (surfaces, chips, plate fills).
- **The light accent is a deepened powder, and the first two attempts failed.**
  Raw powder on butter is 1.43:1, invisible. Mixing powder only 38% toward
  chocolate gives `#909197` at 2.94:1 — still a fail, and it reads as grey
  rather than blue. The value that passes is 38% powder / 62% chocolate
  (`#6C676B`, 5.18:1). This was caught by the contrast script, not by eye.

**Sand and powder are the palette's decorative tier.** They carry surfaces,
the dot field, chips, and the dark-theme accent — everything that is not body
text. That is a smaller job for them than blue used to do, and it is why the
page still reads as an editorial system rather than a warm one: the warmth is
in the paper, not in the ink.

**Rule 2 of §1 still holds.** The accent is never a fill. The primary action
inverts the canvas (ink on paper, paper on ink), the featured chip is ink on
paper, and accent appears only as marks — availability dot, focus ring, hover.

The status green is the one colour that survives from the old palette; it is
now mixed toward the band ink so it sits on the warm surface rather than the
old cool one.

**Unchanged:** the type system, spacing, radii, motion, and every interaction.
This is a colour change only — no component was restructured.

---

## 14. v15 — Section grounds and the per-project canvas

Three changes, in the order they were asked for. All colour-only; no markup
moved except one attribute, and no component was restructured.

### 1. A numeral is always followed by a gap

`.n` is an inline `<span>`; the heading beside it is a block. The number was
sitting flush against its title, separated only by the heading's own leading.
The fix is a **rule**, not a one-off, because the same pairing appears in five
places:

```css
.service .n,.caps .n,.steps .n,.cs-decisions .n,
.stats b,.timeline small{display:block;margin-bottom:10px}
```

`.steps.five` keeps its tighter 6px and `.cs-decisions` its 8px, because those
are denser contexts — but the gap is never zero anywhere.

### 2. Section grounds, in page order

| Section | Ground | Why there |
|---|---|---|
| Pinned process | sand `#DDC6B6` | the warm, quiet one move before the work |
| Capabilities | powder `#C8D2DC` | the cool note, so the four-column grid separates from the band above it |
| Selected work | slate `#536878` **inverted** | the requested slate, used whole |
| Client notes | powder `#C8D2DC` | bookends the warm centre of the page |

Grounds bleed full-width and stack flush under the hairline above them, so they
read as printed panels rather than floating cards. Below 860px the bleed is
dropped, because `50vw` math fights the mobile gutter.

**Selected work had to invert.** `#536878` as a text ground is **2.49:1** with
chocolate ink — unusable, and lightening it to a usable tint would have made it
a different colour than the one that was asked for. Inverted, it is **5.43:1**
with butter, so it stays the exact requested slate and becomes a band, which is
the same move the contact band already makes. Its accent becomes powder, which
reads as a mark at 3.79:1.

### 3. Every case study gets its own project's colour

The idea is sound and worth stating: **the page you land on is already the
colour of the work you came to see.** Each case study's canvas is that
project's real brand hue, taken from the live site, dropped **22% onto butter** —
recognisably that project's colour, calm enough to read a case study on.

| Project | Brand hue | Canvas | Contrast |
|---|---|---|---|
| ETtravel | `#1f4b73` deep travel blue | `#CDD4AE` | 9.39 AAA |
| John's Photography | `#26262a` near-black gallery | `#CECB9E` | 8.72 AAA |
| JoyInterior | `#8a6a4f` warm tan / wood | `#E4DAA6` | 10.25 AAA |
| Gwarinpa Real Estate | `#1b2a4a` navy + brass | `#CCCCA5` | 8.78 AAA |
| Museum of Art in Addis | `#151412` near-black gallery | `#CBC799` | 8.38 AAA |

The hue lives in `tone:` in `build_site.mjs` and reaches the page as
`data-project` on `<body>`, so adding a project means adding one field and one
CSS rule. The two archive projects have no live site, so they keep the page
canvas rather than invent a colour for them.

**22% is a measured number, not a taste call.** It is the strongest mix that
keeps every one of the five grounds above 8.3:1 with chocolate ink while still
reading as that project's colour rather than as butter.

### Muted is re-derived per surface

This is the non-obvious part. The page's `--muted` is ink 32%. Carried onto a
tinted ground it collapses to **3.9–4.35** — just under AA — because the mix
is computed against butter, not against the ground it lands on.

Every tinted ground therefore re-derives it from **itself**:

```css
--muted:color-mix(in srgb,var(--ink) 20%,var(--sand));
```

One rule, repeated, rather than five hand-picked greys that would drift out of
step with each other. It measures 5.29–6.05 on every ground. Note the mix
direction: ink is the *small* side, and the ground is what it sits on.

**Hairlines are not gated at 3:1.** `--hair` is ink at 15% opacity and measures
~1.3 against any ground. That is the existing decorative treatment for
structural rules, and a 1px divider is not a UI component that needs to be
distinguished from its background. Only text and real control boundaries are
gated.

## 15. v16 — Miami Marmalade

A second five-swatch palette, supplied as an image. It does not replace v14 —
butter is still the paper, and the v14 four are still what the derived roles
are mixed from. What changes is **which swatch plays which role**.

| Swatch | Hex | Role |
| --- | --- | --- |
| Centre Earth | `#665547` | the dark canvas, everywhere |
| Fertile Soil | `#8B5D3B` | the button hover |
| Brown Alpaca | `#BA6B28` | the mid-tone bridge |
| Miami Marmalade | `#F09419` | every colour fill on the site |
| Severely Burnt Toast | `#251007` | the clicked state; the ink on marmalade |

### The one rule this palette forces

**Marmalade is a fill, never a label.** It fails as text in both directions:

```
marmalade on butter        2.19   FAIL
marmalade on centre earth  3.03   large only
```

So `--blue` — the text accent — is marmalade pulled a long way toward the
ground it sits on: **30% toward toast** on paper (`#62380C`, 9.40) and
**30% toward butter** on earth (`#FADB8D`, 5.27). The swatch stays
recognisable in both, and every label clears AA.

The same rule caught the **selected-work slate**: even marmalade lifted 45%
toward butter only reaches 3.84 on `#536878`. On that band `--blue` is plain
butter (5.43) and marmalade is demoted to fill-only — the featured chip and
the active rule, never a label.

### The button ramp

The three requested states, as one warm ramp that darkens under the pointer.
Ink flips with it so every state clears AA on its own ground:

| State | Ground | Ink | Ratio |
| --- | --- | --- | --- |
| Resting | marmalade | burnt toast | 7.75 |
| Hover | fertile soil | butter | 5.27 |
| Clicked | burnt toast | butter | 16.99 |

Implemented once on `.button, .submit, .nav-contact`, with `.button.alt` held
outside the ramp as a quiet outline. `:active` — not `:focus` — is the clicked
state, so the ramp is exactly what the pointer does.

### The contact band

It now inverts to **earth** in light mode and **butter** in dark, so both modes
resolve to the same ground the other one is built on. Every rule inside it is
expressed in `--band-*` tokens rather than the old hard-coded greys.

### The masthead

The old bar was a full-bleed rule with the brand, four links and a contact
link at identical weight. v16 gives it three alignments instead of one:

- **Left** — a marmalade monogram plus a two-line lockup (name over discipline)
- **Centre** — the section links, the primary object, the current page marked by
  a 2px marmalade rule rather than a fill, so the bar keeps its air
- **Right** — a live availability readout with a pulsing dot, then the action

### Portraits

| Slot | File | Source |
| --- | --- | --- |
| Hero | `assets/site/portrait-hero.jpg` | `…09_31_18` — backlit silhouette, 2:3 |
| About | `assets/site/portrait-about.jpg` | `…09_15_27` — frontal, cool, 941×1672 |

The hero crop moved from 4:5 to **3:4 with the face held high** (`50% 32%`);
4:5 sat too tight on the head. The about shot gets a light warm grade
(`saturate(.92) sepia(.06)`) to tie it to the paper without flattening the
black coat. Both are re-encoded to JPEG at q3 and 1100px wide, cutting roughly
3.4 MB of PNG down to 214 KB.

### Verified

All 18 shipped text/ground pairs clear WCAG AA, including every button state.

---

## 16. v17 — five reported defects, each with a measured cause

Nothing here is a taste call. Every change fixes something that was measured,
and the numbers are given so the next person can check rather than re-argue.

### 1. A ground has to fill its whole section

**The bug.** v15 painted each ground on the *inner* panel and forced it
full-bleed with `margin-inline:calc(50% - 50vw)`. That cannot work: `50vw` is
the viewport width *including the scrollbar*, and inside a pinned act the stage
is `position:sticky` in a 100vh box — so the panel overshot one side and left a
bare strip on the other. That is the uncoloured band in the About screenshot.

**The fix.** A `<section>` is already a full-width block, so the ground moved
onto the section and the inner `.wrap` went back to a plain centred column:

```css
[data-ground="sand"]{background:var(--sand);--ground:var(--sand);--ground-ink:var(--chocolate)}
```

The generator marks the section, not the panel:

```html
<section class="section section-line" data-ground="sand" data-sc-act="pin" …>
```

No viewport maths remains, so there is nothing left to drift. This also fixed a
second symptom for free — the panel no longer sits left of the content column,
because the full-bleed hack was what was moving it.

### 2. Muted on a tinted ground was invisible — the mix was inverted

v15 wrote `--muted:color-mix(in srgb,var(--ink) 20%,var(--sand))`.
`color-mix(A p%, B)` is **p% of A**, so this was 20% ink and 80% sand — a very
light tint on a light ground. Measured: **1.28:1**. That is the unreadable body
copy in the About process panel.

One rule, still derived from the ground it sits on, with the direction now
accounted for:

| Ground | `--ground-mute` | Result | Ratio |
|---|---|---|---|
| sand `#DDC6B6` | 78% ink | `#594946` | **5.20** |
| powder `#C8D2DC` | 78% ink | `#554C4E` | **5.42** |
| slate `#536878` | 90% butter | `#EDEBB8` | **4.75** |

Slate is a *dark* ground, so its muted must move much further toward the ink. At
the same 78% used for the light grounds it measures **4.03 and fails**. This is
the one place "the same rule everywhere" needs a per-ground number, and the CSS
comment says so at the point of use.

### 3. The project canvases were a colour mistake

v15/v16 dropped each brand hue **22% onto butter**, producing pale
yellow-greens — `#CDD4AE`, `#CECB9E`, `#CCCCA5` — that read as a tint gone wrong
rather than a project's identity. Two of the five sat within **16 rgb** of each
other, so the pages were not actually distinguishable.

They are now each project's own hue taken a long way toward **burnt toast** —
dark, quiet, recognisably that project, and separated by construction:

| Project | Brand hue | Mix | Canvas | Ink | Muted |
|---|---|---|---|---|---|
| ETtravel | `#1F4B73` | 62% | `#21354A` | 11.74 | 7.81 |
| John's Photography | `#2A2A2E` | 52% | `#281E1B` | 15.20 | 9.73 |
| JoyInterior | `#8A6A4F` | 42% | `#4F3625` | 10.41 | 7.07 |
| Gwarinpa | `#1B2A4A` | 60% | `#1F202F` | 15.04 | 9.61 |
| Museum of Art | `#151412` | 38% | `#1F120B` | 17.08 | 10.62 |

Closest pair is now **21.9** (was 16.0). Because these grounds are dark, the case
study carries **light** ink and light-derived hairlines — the rule the brief
asked for: light text on a dark ground, dark text on a light one.

**One canvas for both themes.** v15/v16 gave each project a *different* canvas
per theme (22% onto butter in light, 30% onto earth in dark). A single dark
ground is used in both, so a case study reads as that project in either mode.

Marmalade stays a **fill** on paper, but on these grounds it clears AA as a mark
too (4.75–7.79), so it can carry hover numerals and the focus ring.

The two archive projects have no live site, so inventing a brand colour for them
would be a lie. They keep the page canvas.

### 4. Reveals started too slowly

The engine is unmodified and stays that way. What was slow was **our half** of
the reveal:

| | Before | After |
|---|---|---|
| `data-sc-stagger` | 60–120ms | 40–55ms |
| pinned-act ramp-in | `.10`–`.14` | `.05`–`.07` |
| cue spread (5 steps) | `0, .2, .4, .6, .8` | `0, .1, .2, .3, .4` |
| pin span (About) | 2.2 | 1.5 |
| pin span (home) | 1.5 | 1.15 |
| flow reveal | 620ms / 14px | 420ms / 10px |

The old numbers spread five steps across **80% of a 2.2-screen pin**, so the last
step appeared only near the very end of the scroll. The spread is now `0→0.4`, so
a section is legible as it arrives instead of finishing its animation after the
reader has already moved on.

### 5. The masthead: bar, selected box, hover box

Three states, three jobs:

| State | Ground | Ink | Ratio |
|---|---|---|---|
| Bar (light) | sand 26% → `#F5ECBD` | chocolate | — |
| **Selected** | chocolate `#342626` | butter | **13.53** |
| **Hover** | butter `#FEFABF` | chocolate | **13.53** |
| Bar (dark) | butter 88% → `#ECE6B1` | toast | — |
| **Selected** | toast `#251007` | butter | **16.99** |
| **Hover** | butter `#FEFABF` | toast | **16.99** |

Dark mode inverts the *bar* to a light one, because a dark box on the dark earth
bar measures only **2.04:1** and would be invisible. The three states are then
legible in both themes.

### Also fixed: corrupted characters in the source

Every client quote and brief ended with `€` followed by a stray C1 control
character instead of a closing curly quote — visible as `designs.€` in the
rendered testimonial. The `†` in the "Previous" trail was a mis-decoded
codepoint too. Eleven quotes and one dagger were restored in `build_site.mjs`,
and every generated page is now free of both artefacts.

### Verified

26 contrast gates pass: 6 section-ground pairs, 15 project-canvas pairs, and
8 masthead pairs. All 205 internal references resolve. The engine files are
byte-identical.

## 17. v18–v20 — the pinned act, the grounds, and the hover that carries the list

Three passes: two fixes, and the correction of an over-correction.

### 1. v18 — the pinned act

Three measured defects in the two pinned process acts (home "How I work",
/about/ "The process"):

- **The stage collapsed against the left edge.** v17 retired the full-bleed hack
  with `margin-inline:0` on `.process-stage`, but that element is not a panel
  inside a column — it IS the column: the act's `[data-sc-stage]` child also
  carries `.wrap`, so the rule overwrote `.wrap`'s `margin-inline:auto`. The
  column is a `.wrap` again.
- **The act loaded blank.** The engine clamps progress to 0 for a pinned act's
  whole entry slide — a full viewport of scrolling — and every cue window began
  at `from:0`, which is `opacity:0`. The section scrolled up empty and popped its
  copy in once the pin bit. Arrival is the engine's `[data-sc-in]` reveal now, so
  the copy is on screen for the whole entry slide. The heading's
  `data-sc-kinetic="lines"` went with it: a line split measured against fallback
  line boxes re-flowed the heading when the webfont arrived.
- **The pin could not fit.** The engine sticks the stage in a 100svh box with
  `overflow:clip` while the act still carried `.section`'s padding, so its travel
  was `span * 100vh` minus 100svh minus up to 300px of padding — negative on the
  home act (span 1.15). The act has no padding of its own now; the breathing room
  lives inside the stage.

Progress is read from the engine's own `--sc-p`: a rail under the heading fills
across the travel and each step's rule fills as its window passes.

### 2. v19 — a theme contract that holds

The switch was inert in places because tokens were re-declared below `<html>`:
`body[data-project]` re-declared every theme token on `<body>`, and
`[data-ground]` did the same per section, so both stayed locked to one canvas.
The contract is stated once now — `:root` for light, `html[data-theme=dark]` for
dark, `color-scheme` on both so the browser's own surfaces follow — every stale
rule is restated from tokens, and the five case studies get a light twin of their
own hue.

**The over-correction, corrected.** Two differently-coloured sections must never
sit next to each other; that is not the same as having no colour anywhere. The
first pass read it the second way, set `background:transparent` with every token
reset to `inherit`, and flattened every page.

### 3. The alternating band, and why it is paper

`build_site.mjs` walks the top-level sections in document order and tints every
other one, so two tinted bands are never adjacent and the band is never the one
that opens a page. One further guard: the last section of the walk is never
tinted, because the contact band closes every page and in dark mode that band is
butter — a tinted band beside it would be two light sections in a row. On
`/projects/` the two candidates are the list and the archive, and the archive is
the section the contact band follows, so that page carries no band at all; its
rows and hairlines carry the structure. (Inverting the starting parity for that
page is the one-line change if a band is wanted there.)

The band is the site's **paper** in both themes — 9% sand into butter, `#FBF5BE`
— with chocolate ink. That is measured, not taste:

| Pair on the band | Ratio |
|---|---|
| ink on band | **13.0** |
| muted on band (68% ink into the band) | **4.9** |
| accent on band (re-derived `--blue`, `#62380C`) | **9.0** |

A dark band lifted off the earth instead (9% butter into earth, butter ink) would
pass for the ink at 5.3:1 but not for `--muted`: 68% ink mixed toward a band that
is *lighter* than the canvas lands at **3.4:1**, under the AA gate. The band is
paper in both themes for that reason.

Two **page** tokens are re-derived inside a band, because in dark mode leaving
them alone is an invisible failure rather than a near miss:

| Token | Left as the page's | In the band |
|---|---|---|
| `--blue` | dark accent `#FADB8D` on the paper band = **1.2:1** | `#62380C` = **9.0:1**, and `--sc-accent` follows |
| `--bg` | earth under the band's chocolate ink: the archive card's overlay veil and the inverted chip's text = **2.0:1** each | the band = **13.0:1** |

### 4. v20 — the hovered project is the one that enlarges

Sizing was a property of position rather than of the pointer, and nothing
responded: `.case-row:hover` only tinted a background, and v11 had already
cancelled the image transforms. The generator emits no `is-lead` now, every row
is identical at rest, and the enlargement is a state — the row lifts 4px with a
shadow, the plate scales 1.06 inside its own `overflow:hidden` frame, and the
title, index and arrow move together. It is scoped to `:hover` **and**
`:focus-visible`, so the same enlargement is reachable from the keyboard, and
`prefers-reduced-motion` switches the movement off explicitly: the global
reduced-motion rule shortens durations without removing a transform.

The two archive cards on `/projects/` get the same treatment — a lift, a 1.04
plate scale inside the card's own clipping frame, and v11's 0.66 hover opacity
kept so the copy on the plate never brightens. The retired `.is-lead` rules are
neutralised rather than deleted, so a cached page cannot reintroduce a
permanently larger first row while the stylesheet reloads.

## 18. v21 — the motion was cancelling itself

Reported as *"I only see a small transition while scrolling, no other effects."*
Measured in a real browser, that turned out to be close to literal: of the site's
entire motion system, exactly one mechanism was doing anything.

### What was actually running

| Mechanism | State before this pass |
|---|---|
| `[data-sc-in]` fade + rise | working, on 36 targets |
| …its **blur** | **dead on every page** |
| `[data-sc-stagger]` cascade | **dead on both work lists** |
| pinned act — the rail | working, over 450px of scroll |
| pinned act — the steps | **no choreography at all** |
| `data-sc-count` (home stats) | **dead** |
| `data-sc-kinetic` (7 case titles) | **dead** |

The one thing that survived was a plain 420ms fade. Everything else had been
silently deleted by a `transition` shorthand somewhere above it in the cascade.

### 1. A stagger container was fading itself, and therefore its own children

The engine watches `[data-sc-in]`, and on entry adds `.sc-in` to that element
**and** staggers its direct children. So a stagger container wears two hats: it is
the observer's target, and it is also a reveal target in its own right. But it is
a transparent box — the content is its children — so the container's own fade is
a **ceiling on the whole sequence**.

Measured on the five-row work list: the container began its 0 → 1 ramp the
instant the section entered, over 420ms, while child 4 was not due to start for
520ms. By the time row 4 began, the container was already fully opaque. A 130ms
stagger cannot be seen through a 420ms parent fade, and the numbers in §16.4 —
which had been carefully retuned upward to 130–140ms — were being thrown away by
a rule nobody had looked at.

A container that staggers no longer animates its own `opacity` or `transform`.
It keeps its `filter`, deliberately: blur is not gated by the container's
opacity, so the list still pulls into focus as a whole on arrival, which is the
v4 effect and the thing that makes a section feel handed to you rather than
switched on.

**After**, the five rows first become visible at 53 / 220 / 371 / 437 / 570ms —
35 distinct opacity states across one reveal.

### 2. Two `transition` shorthands had deleted the reveal

A `transition` shorthand **replaces** the whole list; it does not merge. Two rules
were therefore silently cancelling the reveal on the elements they matched:

- **The v17 retune** wrote `transition: opacity, transform` on the reveal
  selector, dropping the `filter 620ms` that v4 had put on the *same selector*.
  `filter:blur(5px)` sat at opacity 0, snapped to `blur(0)` on the frame
  `.sc-in` landed, and resolved while the element was still invisible. The
  scroll-appear blur — the site's signature motion — had been contributing
  nothing on any page. It is back, at 520ms so the focus pulls rather than snaps.
- **v20's hover lists** on `.case-row` and `.project-card` named no `opacity`, and
  sat after the reveal at equal specificity. This was the worst of the four: a
  property absent from `transition-property` is not transitioned *at all*, and
  `transition-delay` does not apply to it either. So every project row jumped
  from opacity 0 to 1 **instantly** on the frame `.sc-in` landed, while its 10px
  rise — which *was* in the list — was still delayed and animated. The rows
  appeared fully opaque and *then* slid up, staggered. The 130ms cascade was
  doing nothing on the site's most important list, and the v20 hover was the
  thing that broke it.

`opacity` and `filter` are now in the hover lists, and in the four other component
rules that had the same defect: `.gallery img`, `.img-band img`, `.cs-duo
article`, `.cs-results div`, `.cs-next-card`.

### 3. The pinned acts had 450px of travel to spend

The engine computes travel as `sectionHeight - stageHeight`, and the stage is
`height:100svh`, so **the travel is exactly `(span - 1) × 100vh` and nothing
else.** The spans were 1.5 (home, three steps) and 1.6 (/about/, five steps) —
0.5 and 0.6 of a screen, or 450px and 540px.

That was the entire budget for the act's choreography: the rail went from empty
to full inside 450px, each step's rule filled over 1/6 of that (75px), and then
the act held **frozen for the remaining 900px** while the reader scrolled past a
finished progress bar. Five steps had 540px between them. At a wheel notch that
is four or five clicks — the site's one large effect was over before it could be
noticed, which is the whole of the reported symptom.

Spans are now **2.8** (1.8 screens, three steps) and **3.2** (2.2 screens, five
steps) — about 600px of travel per step. The cost is page length: the home page
went 7,438px → 8,608px. That is the right trade for an act that can now be seen.

### 4. The steps had a one-pixel rule and no state

`--sc-at` drove a 2px line and nothing else. The cards themselves never changed:
all three sat at full strength for the whole pin, and the rail was the only thing
saying where the reader was.

Each step now **lights** as its own stretch of the rail passes, on the same
`--sc-at` slot the rule already uses, so the line and the card agree. The
unlit→lit range is 18 distinct states on /about/ and 10 on the home page, with
one step at a time and a clean handoff.

Deliberately **colour, not opacity or transform.** Both are already transitioned on
these elements for the arrival reveal, and a scroll-linked value fighting a 420ms
transition is how you get a section that is briefly invisible after a scrollbar
drag. Colour is in no transition list here, so it tracks the pin exactly and
cannot hide anything.

The unlit floor is **0.68**, and that number was corrected once during the pass.
`p` is 0 for the act's *entire entry slide* — a full viewport before the pin
engages — so a first attempt at 0.42 made the section scroll up dimmed, which is
precisely the "the act loaded blank" defect §17.1 had already recorded and fixed.
The sequence is therefore carried by the numeral (`--muted` → `--blue`, the same
pair the work lists use on hover), the heading (`--muted` → `--ink`) and the
filling rule, all of which can de-emphasise without putting unreadable text on
screen. Below 860px the act stops pinning, and under `prefers-reduced-motion` the
rail is shown settled — so both cases set `--sc-lit: 1` and every step is lit.

### 5. Two engine features were wired to nothing

- **`data-sc-kinetic="words"`** was on all seven case-study titles and had never
  run. The engine splits text only for an element that is *simultaneously* a
  `[data-sc-cue]` inside a `[data-sc-act]`; these `h1`s had the attribute and
  neither, so it was an orphan — `kinetic: 1 total, 1 ORPHANED`. The titles were
  static text. They are now split into `<span class="kt-w">` **in the HTML**, so
  the split is right from first paint and never re-measured — the engine's own
  splitter re-measures on webfont load, which is why §17.1 retired the process
  heading's line split. `.kt-w` is `display:inline-block` (a transform does not
  apply to a non-replaced inline box) and outranks the v2 `h1 span{display:block}`
  rule that would otherwise put one word per line. Applied to every page title
  that was previously bare: the two archive case studies, /about/, /projects/,
  /blogs/ and both articles.
- **The home page's three `data-sc-count` stats** sat outside every act, and the
  engine only collects counters from within one. They printed their final value
  and never moved. The About section is now `data-sc-act="flow"`, and they count
  `0 → 5 / 7 / 10` as the section arrives.

### 6. Two deployment bugs

- **The two archive case studies were 404ing their own work.** They referenced
  `presentation-assets/`, which is gitignored — 30 MB of full-size PNG captures —
  so `d1.png` and `m1.png` rendered perfectly in local preview and did not exist
  on the deployed site. The four referenced frames are now re-encoded to
  `assets/shows/` as JPEG q84 at identical pixel dimensions: **3.4 MB → 727 KB**.
  These are the largest assets on the site and they load on the two pages a
  visitor is most likely to reach from the archive.
- **There was no sitemap.** `.gitignore` has listed `sitemap.xml` as build output
  "regenerated by `build_site.mjs`" since the first commit, and no code ever
  wrote one. It is generated now, 13 URLs, cross-checked against the 13
  canonical tags (they agree exactly). `lastmod` is the file mtime, which is
  honest for a static site.

### Verified

Carried forward from v20 and re-checked:

- `node build_site.mjs` regenerates all 13 pages plus `sitemap.xml`.
- No page carries `is-lead`; no page carries two tinted bands in a row, and none
  carries a tinted band against the contact band.
- Every generated page is UTF-8 with no BOM, and has no mojibake. (The deployed
  build had a BOM and 25 mojibake sequences; that local fix had never been
  pushed.)

For v21 specifically, measured in a real browser:

- **Every reveal target transitions its own opacity**, on all 13 pages. Before:
  5 offenders on the home page alone, 7 on /projects/, 7 on a case study.
- **Every `[data-sc-in]` that uses a blur also transitions `filter`** — 18/18 on
  the home page, 26/26 on a case study, 12/12 on /about/.
- **No stagger container fades itself**, on any page.
- **The five-row work list staggers in time**: rows first visible at
  53 / 220 / 371 / 437 / 570ms, 35 distinct states, fully in place at ~0.87s.
- **Both pinned acts scrub**: 1620px and 1980px of travel, 10 and 18 distinct
  step states, one step at a time.
- **Both pinned stages still fit** their 100svh box with no overflow
  (`scrollHeight === clientHeight`), at 1440×900.
- **Below 860px** the act un-pins (`height:auto`, `position:static`) and all
  steps are lit, at 390×844.
- **Under `prefers-reduced-motion: reduce`**, scrolling the full home page leaves
  **0 of 36** reveal targets below 0.9 opacity, and all three pinned steps at 1.
- **No `data-sc-kinetic` or `data-sc-count` attribute is orphaned** on any page.
- **13 HTML files, 244 internal `href`/`src` targets, all resolve on disk.**
  No 404s and no JS errors on any page, in either theme. The four archive
  showcase frames load, and the desktop/phone toggle swaps between them.




