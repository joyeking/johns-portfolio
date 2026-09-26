# Portfolio Craft Goals

The brief: make the portfolio communicate *"look at the problem I solved, how I
solved it, and what happened because of it"* — not just *"look what I made."*

**Revertable:** the previous design lives on branch `portfolio-presentation`
(commit `c9a7a8c`). This redesign is on branch `craft-case-studies`.
Restore anytime with `git checkout portfolio-presentation`.

## The checklist

- [x] **5 exceptionally strong case studies** — the 5 live Framer projects are
      flagship case studies (ETtravel, John's Photography, JoyInterior,
      Gwarinpa Real Estate, Museum of Art in Addis); brand/editorial work
      (Afri Buna, Dream Faith Journey) is presented as an archive section.
- [x] **Before/after comparisons** — every case study opens with a
      "The brief → What shipped" pair: the client's ask verbatim, and the
      build that answered it.
- [x] **Explaining design decisions** — a "The calls I made, and why" list of
      4 decisions per project, each grounded in the real shipped site.
- [x] **Showing measurable results** — an honest numbers band per case study
      (timeline, scope, structure, responsiveness) plus the outcome. Real
      business metrics (traffic, conversion) should be added by the owner in
      `build_site.py` → `results` when available; nothing is invented.
- [x] **Testimonials** — real client quotes pulled onto the matching case
      studies (Sarah Yared → ETtravel, James Igbo → Gwarinpa, Anteneh Demese →
      Photography, Liya Woldu → JoyInterior) and kept on the homepage.
- [x] **Professional presentation** — one generator (`build_site.py`) renders
      the whole site: consistent nav, footer, theme toggle, live-preview frame
      per project, previous/next case-study trail.
- [x] **A recognizable visual style** — the existing design system stays:
      dark canvas with dot grid, Bebas Neue display + Manrope text, one blue
      accent, screen-blend cursor glow, same timing vocabulary.

## Single source of truth

`build_site.mjs` generates: homepage, about, projects index (selected +
archive), all project detail pages, blog index + articles. Run
`node build_site.mjs` to regenerate everything. (The old Python
generators `build_site.py` / `build.py` are removed — their content
was merged here; recover them from git history if ever needed.)
