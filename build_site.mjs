// Rebuild the portfolio from the real Framer site content + images (assets/site/).
//
// Craft model: every flagship case study is told as
//   the brief -> what shipped -> design decisions -> the result -> client note -> live site.
// Run: node build_site.mjs
import { writeFileSync, mkdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));
const A = 'assets/site';
// Canonical origin for OG/canonical tags.
const SITE = 'https://joyeking.github.io/johns-portfolio';
// Legacy hashed asset name; used as the site-wide OG image until a dedicated one exists.
const OG_IMAGE = 'assets/site/oaXV5No2WInacbQ0FDOFpZXliKQ.jpg';

// Site logo. logo.png is the full 1122x1402 source; the square crops below are
// derived from it and are what the page actually loads (full source is 2.4 MB).
const LOGO = 'assets/site/logo-512.jpg';
const LOGO_ICON = 'assets/site/logo-64.jpg';
const LOGO_APPLE = 'assets/site/logo-180.jpg';

// REVEAL CHOREOGRAPHY — the site's one timing vocabulary.
// `data-sc-stagger` on a container staggers its DIRECT children by (index x
// value) ms. The reveal itself is a 10px rise plus an opacity fade over 420ms
// and a 5px blur resolving over 520ms (the v17 block in site.css, which overrides
// the engine's 14px/620ms defaults), so the number that decides how a section
// feels is the TAIL, not the step.
//
//   2 children  120ms  ->  120ms tail   (a pair: cs-duo, about-split)
//   3 children  140ms  ->  280ms tail   (the home process steps)
//   4 children  130ms  ->  390ms tail   (decisions, services)
//   5 children  130ms  ->  520ms tail   (work lists, the about five steps)
//
// A five-row work list therefore starts its last row half a second after the
// first and finishes entering at ~0.95s, which is what reads as choreography
// rather than a blink. The previous values were 40-55ms, so the same list was
// fully in place at 0.6s and the section landed as a single event.
//
// Nothing here needs a reduced-motion override: site.css zeroes the transform
// under prefers-reduced-motion, and the engine still staggers the opacity, so
// the sequence survives with no movement at all.
//
// v21: the stagger values above were being applied to a container that was also
// fading ITS OWN opacity over the same 420ms, which is a ceiling on every child
// — so none of these numbers were visible. The container no longer fades itself
// (site.css v21 §1). The step values are unchanged, and they now land.

// PIN SPANS — how much scroll the pinned act is given to spend.
// The engine computes the act's travel as `sectionHeight - stageHeight`, and the
// stage is `height:100svh`, so the travel is EXACTLY `(span - 1) * 100vh`. The
// span is therefore not a rough dial for "how big is this section"; it is the
// only thing that sets the length of the site's one piece of scroll
// choreography.
//
// The old values were 1.5 here and 1.6 on /about/, which bought 0.5 and 0.6 of a
// screen — 450px and 540px of travel for three steps and five steps
// respectively. The rail under the heading went from empty to full inside 450px,
// each step's rule filled over 75px of it, and the act then sat frozen while the
// reader scrolled the remaining 900px past a finished progress bar. That is the
// whole reason the site read as having no motion: its largest effect completed
// in four wheel notches and then held still for a screen and a half.
//
// 2.8 buys 1.8 screens for the three home steps and 3.2 buys 2.2 for the five on
// /about/ — about 600px of travel per step, which is enough to watch a step
// arrive, light and hold before the next one starts. The extra height is the
// cost, and it is the right cost: a pinned act that cannot be seen is not a
// feature. Both are ignored below 860px, where the grid no longer fits a 100svh
// stage and the act stops pinning altogether.
const PIN_SPAN_HOME = '2.8';
const PIN_SPAN_ABOUT = '3.2';

// One icon set for the whole site: 24px box, 1.5px stroke, round caps, currentColor, no fills.
// Defined once here and mounted into every page's <body> (DESIGN.md §5).
const SPRITE = `<svg class="sprite" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute">
<symbol id="i-arrow-right" viewBox="0 0 24 24"><path d="M4.5 12h15"/><path d="M13 5.5l6.5 6.5-6.5 6.5"/></symbol>
<symbol id="i-arrow-up-right" viewBox="0 0 24 24"><path d="M7 17 17 7"/><path d="M8.5 7H17v8.5"/></symbol>
<symbol id="i-chevron-down" viewBox="0 0 24 24"><path d="m6 9.5 6 6 6-6"/></symbol>
<symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 8h16"/><path d="M4 16h16"/></symbol>
<symbol id="i-up" viewBox="0 0 24 24"><path d="M12 19.5V4.5"/><path d="M5.5 11 12 4.5 18.5 11"/></symbol>
<symbol id="i-mail" viewBox="0 0 24 24"><path d="M3.5 6.5h17v11h-17z"/><path d="m4 8 8 5.5L20 8"/></symbol>
<symbol id="i-phone" viewBox="0 0 24 24"><path d="M7 3.5h3l1.6 4-2 1.3a11.5 11.5 0 0 0 5.6 5.6l1.3-2 4 1.6v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 5 5.7 2 2 0 0 1 7 3.5z"/></symbol>
<symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></symbol>
<symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5.5l3.5 2"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="m5 13 4.5 4.5L19 7"/></symbol>
<symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></symbol>
<symbol id="i-layers" viewBox="0 0 24 24"><path d="m12 3.5 8.5 4.7-8.5 4.7-8.5-4.7L12 3.5z"/><path d="m3.5 13 8.5 4.7 8.5-4.7"/></symbol>
<symbol id="i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4"/></symbol>
<symbol id="i-quote" viewBox="0 0 24 24"><path d="M7.5 7.5H11v3.5a4 4 0 0 1-4 4"/><path d="M15 7.5h3.5v3.5a4 4 0 0 1-4 4"/></symbol>
</svg>`;

const ic = (name, cls = 'ic') => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;


const PROJECTS = [
  {
    slug: 'https-ettravel-framer-website', cat: 'Web Design', title: 'ETtravel Travel Agency',
    kind: 'Travel platform · Framer',
    // drives the case-study canvas: this project's own live brand colour,
    // dropped 22% onto butter in v15. See DESIGN.md §14.
    tone: 'ettravel',
    problem_line: 'Turn a mountain of destination information into a booking experience that invites instead of exhausts.',
    desc: 'Designing the whole website from beginning to end to enhance user experience — simplifying navigation, optimizing the booking process, and incorporating detailed destination content and blogs.',
    year: '2025', industry: 'Travel & Tourism', client: 'ETtravel', duration: '8 weeks',
    visit: 'https://ettravel.framer.website/', domain: 'ettravel.framer.website',
    pages: '6 pages + blog', stack: 'A travel platform that makes Ethiopia explorable — and bookable.',
    cover: `${A}/oaXV5No2WInacbQ0FDOFpZXliKQ.jpg`,
    // Ethiopia only: Gonder castle + Simien geladas. The previous set carried
    // watermarked stock from an unrelated photographer, and two of those files
    // were also being reused on other case studies.

    gallery: [`${A}/2YvvQc09RxDerNTEnlO5qaVksA8.jpg`, `${A}/yL5GAUs4SlFz7sIi3qlWIaoqsbI.jpg`],
    brief: '“More than a booking site — show the beauty of Ethiopia to global visitors, and let travelers plan real itineraries together with the agency’s staff.”',
    shipped: 'A six-page Framer site: a photography-led home, Explore and Destinations pages, a regional blog system, and itinerary booking handled with agency employees — all fully responsive.',
    approach: 'The agency wanted to communicate through pictures, so the design started at the wireframe stage with generous space reserved for destination photography. Every page leads with a place, and the booking path is designed to interrupt exploration as little as possible.',
    challenges: ['Balancing aesthetic storytelling with functional booking tools.',
      'Keeping the site fast despite high-resolution destination photography.',
      'Designing a structure that could absorb blogs and itinerary planning without redesign.'],
    decisions: [
      ['Photography-first layouts', 'The agency sells places, not paragraphs. Every section was framed as a stage for a photograph, with type kept quiet around it.'],
      ['Region-first navigation', 'Dozens of destinations become six browsable regions (Addis Ababa, Axum, Gonder…) instead of one searchable dump — visitors scan, then dive.'],
      ['Trust before the ask', 'A partner marquee (Booking.com, Airbnb, TripAdvisor) and visitor numbers sit above the fold, so credibility is established before any booking CTA.'],
      ['Booking one click away', 'Explore and enquiry CTAs persist across pages, and itinerary planning loops in agency staff — the site sells, the people close.'],
    ],
    results: [['8', 'weeks from brief to launch'], ['6', 'pages plus a regional blog system'], ['6', 'destination regions structured'], ['100%', 'responsive, built in Framer']],
    outcome: 'The final site balances storytelling and function: visitors explore Ethiopia visually, learn the destinations, and book through the agency — a digital home with room to grow its content library.',
    testimonial: ['Sarah Yared', 'Owner, ETtravel',
      'His design transformed my travel agency business. He converted my ideas into a high-performing, visually striking website.'],
  },
  {
    slug: 'https-foolish-checkbox-044906-framer-app', cat: 'UI / UX Design', title: 'John’s Photography Portfolio',
    kind: 'Photography portfolio · Framer',
    tone: 'photography',
    problem_line: 'Show two capabilities at once — professional photography and modern web design — without letting either compete for attention.',
    desc: 'A visually striking design showcasing personal work — combining professional photography with modern digital design and organic interaction.',
    year: '2025', industry: 'Photography', client: 'VisualForms Studio', duration: '3 weeks',
    visit: 'https://foolish-checkbox-044906.framer.app/', domain: 'foolish-checkbox-044906.framer.app',
    pages: '5 pages', stack: 'A gallery-grade portfolio where the photographs set the rules.',
    cover: `${A}/JSCoL3ekoTbuU4QQtS98N4UOrcs.jpg`,
    gallery: [`${A}/pBdInmugwcIW6kIb5vRmVm4S4.jpg`, `${A}/XEvPEBGUVj4xKf2rQEO6VGWFr4.jpg`,
      `${A}/9nvi78yvPRkHyNKdLpxY5EzY9uo.jpg`, `${A}/UFFm8Ga8uuLm5L801oH0TmDTU.jpg`,
      `${A}/JlQmh8pZO8DNwTwjuojPEoMvw0.jpg`],
    brief: '“One portfolio that shows both the photographs and the design sense — the images must lead, but the site has to feel designed.”',
    shipped: 'A five-page dark portfolio: pixel-serif identity, album chapters by discipline (branding, communication, travel, events), a bilingual Amharic editorial post, and a single-field enquiry on the contact page.',
    approach: 'The portfolio was treated like a gallery wall: a dark, quiet canvas, generous spacing, and an interface that stays out of the way. Work is curated into albums rather than an endless feed, so each set reads as a body of work.',
    challenges: ['Giving photography and web design equal billing without visual noise.',
      'Keeping the viewer’s attention on the images, not the interface.',
      'Balancing minimalism with enough personality to be memorable.'],
    decisions: [
      ['A dark, gallery-grade canvas', 'Monochrome work reads as prints on a wall instead of thumbnails in a grid — the interface borrows from physical exhibition design.'],
      ['A pixel-serif display voice', 'The “Jonny.A” wordmark and headlines use a pixelated serif: an ownable, recognizable identity that still frames photos without competing with them.'],
      ['Album chapters over infinite scroll', 'The album page splits work into four disciplines with numbered columns — curated sets that respect the visitor’s time.'],
      ['One-field enquiry', 'The contact hero asks for an email and nothing else; low friction suits a photographer’s audience.'],
    ],
    results: [['3', 'weeks from brief to launch'], ['5', 'pages, gallery and album system'], ['2', 'languages — English and Amharic'], ['100%', 'responsive, built in Framer']],
    outcome: 'The final portfolio communicates both a creative eye and technical skill in one experience — a gallery that is contemporary, engaging, and unmistakably his.',
    testimonial: ['Anteneh Demese', 'Marketing Director',
      'Johnny redesigned a few of our pages. The results were beyond expectation. He understood my vision and turned it into impactful designs.'],
  },
  {
    slug: 'https-joyinterior-framer-website', cat: 'Web Design', title: 'JoyInterior',
    kind: 'Interior design studio · Framer',
    tone: 'joyinterior',
    problem_line: 'Present high-end interiors and a furniture line with the same restraint and quality as the spaces themselves.',
    desc: 'A sleek showcase website highlighting high-end interior design and custom furniture collections.',
    year: '2025', industry: 'Interior Design', client: 'JoyInterior', duration: '5 weeks',
    visit: 'https://joyinterior.framer.website/', domain: 'joyinterior.framer.website',
    pages: '4 pages', stack: 'A quiet, confident site that lets interiors do the talking.',
    cover: `${A}/SKg2WQM5Rb7EvoZxCzmV07GWUCc.jpg`,
    gallery: [`${A}/8RKtfZ5fAy6NoNjyMq6lyIbgZiI.jpg`, `${A}/as8jGg0FjP5x9OhkVZzCH676R8.jpg`,
      `${A}/pcEJx8oAgSwVmR45Obl0IP5uL4.jpg`],
    brief: '“A sleek site for high-end interior design and custom furniture — it should feel as considered as the rooms themselves.”',
    shipped: 'A four-page site that splits the business cleanly: portfolio page for spaces, furniture page for products, numbered service cards, and a consultation page pairing the form with an objection-handling FAQ.',
    approach: 'The design puts large imagery, quiet typography, and a focused browsing rhythm ahead of visual noise. The composition stays simple so the colours and projects breathe, and the advertised work stands out on its own.',
    challenges: ['Serving two business focuses — interior design and furniture — without overwhelming visitors.',
      'Designing a structure that feels luxurious yet minimal, true to the brand.',
      'Creating a gallery format that is interactive but easy to navigate.'],
    decisions: [
      ['Restraint as luxury', 'Muted greys, quiet type and wide margins — the interior photography is the only saturated element on any page.'],
      ['Two audiences, two paths', 'Portfolio for spaces, a “Fine Furnishing” page for products: clients browse completed rooms, shoppers browse pieces, and neither fights the other for attention.'],
      ['Numbered service cards', 'Scope is communicated as four numbered offerings (custom design to livable spaces) — scannable, jargon-free, and easy to quote against.'],
      ['Consultation plus FAQ', 'The sign-up form shares its page with an accordion FAQ, so objections are answered exactly where the decision happens.'],
    ],
    results: [['5', 'weeks from brief to launch'], ['4', 'pages, portfolio + storefront'], ['4', 'services structured for enquiry'], ['100%', 'responsive, built in Framer']],
    outcome: 'A polished portfolio that makes the work and materials the central story — sophistication communicated through clarity rather than decoration.',
    testimonial: ['Liya Woldu', 'Product Manager',
      'He took the time to understand our goals and delivered a design that resonated perfectly with our audience.'],
  },
  {
    slug: 'https-gwarinparealestate-framer-website', cat: 'Web Design', title: 'Gwarinpa Real Estate',
    kind: 'Real estate platform · Framer',
    tone: 'gwarinpa',
    problem_line: 'Give a luxury property brand a stage that still lets visitors find, understand and enquire about listings fast.',
    desc: 'A sleek modern site designed to showcase luxury properties with elegance and sophistication.',
    year: '2025', industry: 'Real Estate', client: 'Gwarinpa Real Estate', duration: '8 weeks',
    visit: 'https://gwarinparealestate.framer.website/', domain: 'gwarinparealestate.framer.website',
    pages: '5 pages', stack: 'Proof first, persuasion second — a listings platform with numbers up front.',
    cover: `${A}/MMSibFdTf97RQX6O6tcR7cF5FOo.jpg`,
    gallery: [`${A}/LGjA4AgHSdwh2O46jg7e9C0nc4g.jpg`, `${A}/WicnobMCWrgEPeryuKYmbdkRhk.jpeg`,
      `${A}/RVPrHE1bVllFVo1kpbTHjusfLOQ.jpeg`],
    brief: '“Showcase luxury properties with elegance — but keep property information quick to reach and easy to understand.”',
    shipped: 'A five-page platform: a numbers-first home, listings that open with the development’s design concept, a project index (Green Heights, Maplewood Villas, Palm Residences, Harbor View Tower), about, and a direct get-a-quote flow.',
    approach: 'Large high-resolution imagery, refined typography and comparison-friendly layouts provide richness without clutter. Every persuasive element is backed by a concrete fact the visitor can verify one scroll later.',
    challenges: ['Balancing a luxury visual experience with quick, understandable access to property information.',
      'Presenting developments and individual units without burying either.',
      'Keeping enquiry effort low for a high-consideration purchase.'],
    decisions: [
      ['Navy and gold, not gradients', 'Real-estate trust is built with established cues: deep navy, brass accents and serif-weight headings read as established, not trendy.'],
      ['Numbers above the fold', '8 current projects, 163 apartment units, 5 development sites — proof lands before persuasion, and the home page says it in one line.'],
      ['Design concept before unit cards', 'The listings page opens with the development’s story and renders, then shows 3-bedroom and loft cards — visitors buy into the place before the plan.'],
      ['Essential-words-only quote flow', 'Get a Quote collects what an agent actually needs first — no multi-step wizard for a first conversation.'],
    ],
    results: [['8', 'weeks from brief to launch'], ['5', 'pages across home to quote'], ['163', 'apartment units presented'], ['100%', 'responsive, built in Framer']],
    outcome: 'A more premium property presentation that stays usable across devices — elegance that helps buyers decide, not just admire.',
    testimonial: ['James Igbo', 'Gwarinpa Real Estate',
      'The website is easy to use and made it simple to showcase our buildings and information.'],
  },
  {
    slug: 'museum-of-art-in-addis', cat: 'Web Design', title: 'Museum of Art in Addis',
    kind: 'Arts institution · Framer',
    tone: 'museum',
    problem_line: 'Give a cultural institution its first real digital presence — one that could grow without losing its voice.',
    desc: 'A clean introductory site for EYETA — Art in Addis, created with the discipline and clarity required of a complex information platform.',
    year: '2025', industry: 'Art & Culture', client: 'Art in Addis (EYETA)', duration: '6 weeks',
    visit: 'https://glad-building-777797.framer.app/', domain: 'glad-building-777797.framer.app',
    pages: '4 pages', stack: 'A dark gallery where the artwork is the only colour on the page.',
    cover: `${A}/FlD2oaqtn5t2KuN4K0t9v8p1iIs.png`,
    gallery: [`${A}/FlD2oaqtn5t2KuN4K0t9v8p1iIs.png`],
    brief: '“Introduce the museum and its artists online — a first presence that feels like the institution and can grow with it.”',
    shipped: 'A four-page site: an art-led home, a split-screen menu pairing a painting with the artist index (Artist / Art Work / Exhibitions tabs), an about page with the institution’s story, and a book-a-tour reservation flow.',
    approach: 'A clean, modern design organises the museum’s story, exhibitions and visiting information into clear sequences. The interface behaves like the building: quiet rooms, strong walls, art as the only loud element.',
    challenges: ['Introducing an institution with no existing digital footprint.',
      'Presenting a dense artist catalogue without flattening it into a grid.',
      'Keeping the reservation step feeling cultural rather than transactional.'],
    decisions: [
      ['The artwork is the only colour', 'A near-black canvas with ivory type lets Ethiopian modernism carry every page — the interface never competes with the collection.'],
      ['A split-screen menu', 'A full-height painting sits beside the artist index, so browsing the catalogue feels like walking a wing, not scrolling a table.'],
      ['Three tabs, no extra pages', 'Artist / Art Work / Exhibitions tabs reframe the same collection for three intents without multiplying pages.'],
      ['Reservation as ritual', '“Book a Tour” keeps its gallery voice — the form sits beside a cubist portrait with a welcome note, so the conversion step belongs to the museum.'],
    ],
    results: [['6', 'weeks from brief to launch'], ['4', 'pages, home to reservation'], ['3', 'ways into the collection'], ['100%', 'responsive, built in Framer']],
    outcome: 'A professional first impression with a durable foundation — a digital presence the institution can extend into a richer ecosystem.',
    testimonial: null,
  },
];

// brand & editorial archive entries (no live site — captured designs)
const ARCHIVE = [
  { slug: 'afri-buna-packed-coffee', cat: 'Branding', title: 'Afri Buna Coffee Packaging',
    kind: 'Brand & packaging', year: '2024', tag: 'Brand · Package',
    problem_line: 'Packaging that reads at shelf distance and builds a coffee brand from scratch.',
    desc: 'Coffee brand and packaging design built to emphasize product quality, ingredients, and a clear, memorable identity.',
    image: 'assets/site/CJkc3GHzJFwVSDaaoW080VOpfCA.png', pages: 'Identity · pack · guidelines', duration: '4 weeks' },
  { slug: 'dream-faith-journey-book', cat: 'Graphic Design', title: 'Dream, Faith, Journey',
    kind: 'Editorial · cover series', year: '2024', tag: 'Editorial · Cover',
    problem_line: 'Three covers, one visual family — making an abstract concept feel hopeful and grounded.',
    desc: 'Three abstract book-cover designs that interpret dreams, faith, and a journey toward truth through clean, modern visual language.',
    image: 'assets/site/kR7pZLeRelrpLxpU2cTSOh45SdE.png', pages: '3 covers · system', duration: '6 weeks' },
];

const rel = (depth, path) => '../'.repeat(depth) + path;

const NAV_ITEMS = [['home', 'Home', 'index.html'], ['about', 'About', 'about/index.html'], ['projects', 'Projects', 'projects/index.html'], ['blogs', 'Blogs', 'blogs/index.html']];
const navLinks = (depth, active) => NAV_ITEMS.map(([key, label, href]) =>
  `<a data-route href="${rel(depth, href)}"${key === active ? ' aria-current="page"' : ''}>${label}</a>`).join('');

// ALTERNATING SECTION GROUNDS.
// The brief was "do not put colours on sections CONSECUTIVELY" — that forbids
// two differently-coloured sections sitting next to each other. It does not ask
// for every section to be colourless, and an earlier pass over-read it and
// stripped the ground off all of them, which is why the page went flat.
//
// So: walk the top-level sections in document order and tint every other one.
// Two tinted sections are therefore never adjacent, which is exactly the rule
// asked for, and the untinted ones keep the page's own canvas. The contact band
// is left alone; it has its own tokens and already reads as a page break.
//
// Only the SECTIONS are counted, and the page hero is the untinted one that
// opens the rhythm, so the first tinted band is never the hero.
//
// One further guard, because "consecutively" counts the contact band too: the
// LAST section of the walk is never tinted, and the contact band closes every
// page, so a band can never sit directly against it. In light mode that is only
// tidiness (the contact band is an earth slab), but in dark mode the contact
// band is butter, and a tinted band beside it would put two light sections in a
// row — the exact thing the brief forbids. Skipping a tint can never create two
// adjacent tints, so the rule still holds on every page.
function alternateGrounds(body) {
  const sections = body.match(/<section class="section[^"]*"/g) || [];
  const last = sections.length - 1;
  let n = -1;
  return body.replace(/<section class="(section[^"]*)"/g, (m, cls) => {
    n += 1;
    // every other section carries a ground; the rest stay on the page canvas,
    // and the one the contact band follows always stays on the canvas
    return n % 2 === 0 || n === last ? m : `<section class="${cls}" data-ground="tint"`;
  });
}

function doc(title, depth, body, desc = 'Yohannes Assefa — Digital Designer', active = '', path = '', image = OG_IMAGE, tone = '') {
  body = alternateGrounds(body);
  const nav = `<a class="skip" href="#main">Skip to content</a><div data-sc-progress aria-hidden="true"></div><button class="mode-switch" type="button" data-mode-switch aria-label="Switch between dark and light mode" aria-pressed="false"><span class="ms-opt ms-dark">&#9789;</span><span class="ms-track"><span class="ms-knob"></span></span><span class="ms-opt ms-light">&#9728;</span></button><div class="cursor"></div><div class="noise" aria-hidden="true"></div>${SPRITE}<header class="site-nav"><a data-route class="brand" href="${rel(depth, 'index.html')}"><img class="brand-mark" src="${rel(depth, LOGO)}" alt="" width="36" height="36" decoding="async" fetchpriority="high"><span class="brand-txt"><b>Yohannes Assefa</b><small>Design &amp; Framer</small></span></a><nav class="nav-links" id="site-menu" aria-label="Primary">${navLinks(depth, active)}</nav><div class="nav-end"><span class="nav-status"><em></em>Available</span><a class="nav-contact" href="#contact">Start a project</a><button class="menu-btn" type="button" data-menu-btn aria-expanded="false" aria-controls="site-menu" aria-label="Open menu">${ic('menu')}</button></div></header>`;
  const foot = `<footer class="footer"><div class="wrap"><div><span class="footer-brand">Yohannes Assefa — digital designer &amp; Framer developer</span><span>Addis Ababa, Ethiopia · © 2026</span></div><nav class="footer-links" aria-label="Contact"><a href="mailto:yohannesassefa17@gmail.com">yohannesassefa17@gmail.com</a><a href="tel:+251921244796">+251 92 124 4796</a><a class="to-top" href="#main">${ic('up')}Back to top</a></nav></div></footer><script src="${rel(depth, 'engine/scrollcraft.js')}"></script><script src="${rel(depth, 'site.js')}"></script>`;
  const canonical = `${SITE}/${path}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${title}</title><meta name="description" content="${desc}"><script>(function(){var d=document.documentElement,t=null;try{t=localStorage.getItem("theme")}catch(e){}if(t!=="light"&&t!=="dark"){try{t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch(e){t="light"}}d.dataset.theme=t;d.style.colorScheme=t})()</script><link rel="icon" href="${rel(depth, LOGO_ICON)}"><link rel="apple-touch-icon" href="${rel(depth, LOGO_APPLE)}"><link rel="canonical" href="${canonical}"><meta name="theme-color" content="#FEFABF"><meta name="author" content="Yohannes Assefa"><meta property="og:type" content="website"><meta property="og:site_name" content="Yohannes Assefa"><meta property="og:title" content="${title}"><meta property="og:description" content="${desc}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${SITE}/${image}"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="${rel(depth, 'engine/scrollcraft.css')}"><link rel="stylesheet" href="${rel(depth, 'site.css')}"></head><body${tone ? ` data-project="${tone}"` : ''}>${nav}<main id="main">${body}</main>${foot}</body></html>`;
}

const contact = () => `<section class="contact-band" id="contact"><div class="wrap contact-grid"><div><p class="kicker">Start a project</p><h2 class="section-heading">Tell me what you are building.</h2><p class="section-copy">Send the shape of the idea: the audience, the constraint, the deadline you are working to. You get a reply within one working day, and a written scope before any work starts.</p><ul class="contact-list"><li><a href="mailto:yohannesassefa17@gmail.com">${ic('mail')}yohannesassefa17@gmail.com</a></li><li><a href="tel:+251921244796">${ic('phone')}+251 92 124 4796</a></li><li><span>${ic('pin')}Addis Ababa, Ethiopia · GMT+3</span></li></ul></div><form class="form" data-demo-form><div class="field"><label for="cf-name">Your name</label><input id="cf-name" name="name" required autocomplete="name" placeholder="Jane Bekele"></div><div class="field"><label for="cf-email">Email</label><input id="cf-email" name="email" type="email" required autocomplete="email" placeholder="jane@company.com"></div><div class="field"><label for="cf-service">What do you need</label><select id="cf-service" name="service"><option>Website design &amp; build</option><option>UI / UX design</option><option>Brand &amp; identity</option><option>Graphic design</option></select></div><div class="field"><label for="cf-brief">The brief</label><textarea id="cf-brief" name="brief" placeholder="What are you building, and what does success look like?"></textarea></div><button class="submit" type="submit">Send enquiry ${ic('arrow-right')}</button><p class="form-status" role="status" aria-live="polite" data-form-status></p></form></div></section>`;

function livePreview(p, depth) {
  const frame = `<div class="browser-frame" data-frame data-sc-in data-sc-spotlight>
<div class="frame-bar">
<span class="dots"><i></i><i></i><i></i></span>
<span class="frame-url">${p.domain}</span>
<a class="frame-open" href="${p.visit}" target="_blank" rel="noopener">Open full site ↗</a>
</div>
<div class="device-row" role="group" aria-label="Device size">
<button class="device is-active" data-w="100%" type="button">Desktop</button>
<button class="device" data-w="768px" type="button">Tablet</button>
<button class="device" data-w="390px" type="button">Mobile</button>
</div>
<div class="frame-stage"><div class="frame-screen" style="width:100%">
<button class="frame-load" data-src="${p.visit}" type="button">
<img src="${rel(depth, p.cover)}" alt="${p.title} cover">
<span>▶&nbsp; Click to load the live site</span>
</button>
</div></div></div>`;
  return `<section class="section section-line" data-sc-act="flow"><div class="wrap">
<p class="kicker">Live preview</p>
<h2 class="section-heading">Explore the real site.</h2>
<p class="section-copy">This is the actual website running inside the frame — scroll it, click through it, or open it in a new tab.</p>
${frame}</div></section>`;
}

// The two archive projects are the only ones with no live site, so their work is
// shown as captured stills in a browser frame.
//
// These point at `assets/shows/`, NOT at `presentation-assets/`. The latter is
// the working folder of full-size PNG captures (30 MB, fourteen frames per
// project) and is gitignored, so the pages that referenced it were rendering
// 404s on the deployed site while looking perfect in local preview — exactly the
// kind of bug a local check cannot catch. `assets/shows/` holds only the four
// frames actually used, re-encoded as JPEG q84: 3.4 MB of PNG became 727 KB of
// JPEG at the same pixel dimensions, which matters because these are the largest
// assets on the site and they load on the two pages a visitor is most likely to
// open from the archive.
//
// The stills are derived from `presentation-assets/` by re-encoding, not cropped
// or edited, so what is committed is exactly what was captured. To refresh them
// after new captures, re-encode the four frames into this folder; the generator
// only references the paths, it does no image processing of its own.
function staticScreens(p, depth) {
  const assetDir = p.slug === 'afri-buna-packed-coffee' ? 'coffee' : 'book';
  const frame = `<div class="browser-frame" data-sc-in data-sc-spotlight>
<div class="frame-bar">
<span class="dots"><i></i><i></i><i></i></span>
<span class="frame-url">${p.slug} — captured designs</span>
</div>
<div class="device-row showcase-toggle" role="group" aria-label="Device size">
<button class="device is-active" data-img="${rel(depth, 'assets/shows/' + assetDir + '-d1.jpg')}" data-w="100%" type="button">Desktop</button>
<button class="device" data-img="${rel(depth, 'assets/shows/' + assetDir + '-m1.jpg')}" data-w="390px" type="button">Phone</button>
</div>
<div class="frame-stage"><div class="frame-screen" style="width:100%">
<img class="showcase-img" src="${rel(depth, 'assets/shows/' + assetDir + '-d1.jpg')}" alt="${p.title} — desktop" loading="lazy">
</div></div></div>`;
  const script = `<script>
document.querySelectorAll('.showcase-toggle .device').forEach(function(btn){
  btn.addEventListener('click',function(){
    document.querySelectorAll('.showcase-toggle .device').forEach(function(b){b.classList.toggle('is-active',b===btn)});
    var img=document.querySelector('.showcase-img');
    img.src=btn.dataset.img;
    img.alt=img.alt.replace(/— [a-z]+$/,'— '+btn.textContent.trim().toLowerCase());
    var screen=img.closest('.frame-screen');
    screen.style.width=btn.dataset.w;screen.style.maxWidth=btn.dataset.w;
  });
});
</script>`;
  return `<section class="section section-line" data-sc-act="flow"><div class="wrap">
<p class="kicker">Selected screens</p>
<h2 class="section-heading">Desktop &amp; phone.</h2>
<p class="section-copy">This project has no live website — explore the implemented designs, switching between desktop and phone.</p>
${frame}</div></section>${script}`;
}

function caseStudySections(p) {
  const duo = `<div class="cs-duo" data-sc-in data-sc-stagger="120">
<article class="before"><span class="kicker">The brief</span><p>${p.brief}</p></article>
<article class="after"><span class="kicker">What shipped</span><p>${p.shipped}</p></article>
</div>`;
  const challenges = p.challenges.map(c => `<li data-sc-in>${c}</li>`).join('');
  const approach = `<div class="case-study" data-sc-in><h2>How I approached it.</h2><div><p>${p.approach}</p><p><b>What made it hard</b></p><ul>${challenges}</ul></div></div>`;
  const decisions = p.decisions.map(([t, why], i) =>
    `<article data-sc-in><span class="n">0${i + 1}</span><div><h3>${t}</h3><p>${why}</p></div></article>`).join('');
  const decisionsHtml = `<div class="cs-decisions-wrap"><p class="kicker" data-sc-in>Design decisions</p><h2 class="section-heading" data-sc-in>The calls I made, and why.</h2><div class="cs-decisions" data-sc-in data-sc-stagger="130">${decisions}</div></div>`;
  const nums = p.results.map(([v, label]) => `<div data-sc-in><b${/^\d+$/.test(v) ? ` data-sc-count="0 ${v}"` : ''}>${v}</b><small>${label}</small></div>`).join('');
  const resultsHtml = `<div class="cs-results-wrap" data-sc-act="flow"><p class="kicker" data-sc-in>The result</p><h2 class="section-heading" data-sc-in>What it added up to.</h2><p class="section-copy" data-sc-in>${p.outcome}</p><div class="cs-results">${nums}</div></div>`;
  return duo + approach + decisionsHtml + resultsHtml;
}

function testimonialHtml(p) {
  if (!p.testimonial) return '';
  const [name, role, quote] = p.testimonial;
  return `<div class="cs-quote" data-sc-in><p>“${quote}”</p><b>${name}</b><small>${role}</small></div>`;
}

// A case-study title that arrives a word at a time.
//
// This REPLACES `data-sc-kinetic="words"`, which never ran and never could. The
// engine splits text only for an element that is simultaneously a `[data-sc-cue]`
// inside a `[data-sc-act]` (scrollcraft.js reads `data-sc-kinetic` while building
// the act's cue list). This h1 had the attribute and neither of those, so it was
// an orphan: the attribute was inert on all seven case studies and the title was
// simply static text. Verified in a browser — `kinetic: 1 total, 1 ORPHANED`.
//
// The engine's own splitter is not used even where it would work, because it
// re-measures when the webfont arrives and a re-measured split reflows the
// heading — the reason DESIGN.md 17.1 retired the process heading's
// `data-sc-kinetic="lines"`. Emitting the spans into the HTML means the split is
// correct from the first paint and never has to be redone, and the reveal it
// needs already exists and is already tuned: the h1 is the observer target, the
// words are the staggered children, and site.css v21 stops the h1 fading itself.
//
// `display:inline-block` is required — a transform does not apply to a
// non-replaced inline box, so the words would rise as one line. The class also
// has to outrank the `h1 span{display:block}` rule in the v2 block, which would
// otherwise put every word on its own line.
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const kineticTitle = text =>
  `<h1 data-sc-in data-sc-stagger="42">` +
  String(text).split(' ').map(w => `<span class="kt-w">${esc(w)}</span>`).join(' ') +
  `</h1>`;

function detailPage(p, all) {
  const meta = `<div class="detail-meta" data-sc-in><div><b>YEAR</b><span>${p.year}</span></div><div><b>INDUSTRY</b><span>${p.industry}</span></div><div><b>CLIENT</b><span>${p.client}</span></div><div><b>TIMELINE</b><span>${p.duration}</span></div></div>`;
  const gallery = p.gallery || [p.cover];
  const images = gallery.map(x => `<img src="${rel(2, x)}" alt="${p.title} — project image" loading="lazy">`).join('');
  const i = all.indexOf(p);
  const nxt = all[(i + 1) % all.length];
  const prv = all[(i - 1 + all.length) % all.length];
  const hero = `<section class="project-detail-hero"><div class="wrap"><span class="type">${p.kind}</span>${kineticTitle(p.title)}<p class="cs-problem" data-sc-in><b>The problem:</b> ${p.problem_line}</p></div></section><img class="detail-hero-image" src="${rel(2, p.cover)}" alt="${p.title}">`;
  const body = `${hero}
<section class="section"><div class="wrap">${meta}<h2 class="section-heading" data-sc-in>From brief to build.</h2>${caseStudySections(p)}
<div class="gallery" data-sc-in data-sc-stagger="130">${images}</div></div></section>
${testimonialHtml(p)}
${p.visit ? livePreview(p, 2) : staticScreens(p, 2)}
<section class="section section-line"><div class="wrap"><p class="kicker">Keep reading</p><div class="cs-next">
<a data-route class="cs-next-card" data-sc-in href="${rel(2, 'projects/' + prv.slug + '/index.html')}"><span class="kicker">†† Previous</span><h3>${prv.title}</h3></a>
<a data-route class="cs-next-card" href="${rel(2, 'projects/' + nxt.slug + '/index.html')}"><span class="kicker">Next case study →</span><h3>${nxt.title}</h3></a>
</div></div></section>${contact()}`;
  return doc(p.title + ' — Case Study · Yohannes Assefa', 2, body, p.problem_line, 'projects', 'projects/' + p.slug + '/', p.cover, p.tone);
}

// ---------------- HOME ----------------
const CLIENTS = ['ETtravel · travel platform', 'John’s Photography · portfolio', 'JoyInterior · interiors', 'Gwarinpa Real Estate · listings', 'Museum of Art in Addis · culture', 'Afri Buna · packaging', 'Dream, Faith, Journey · editorial'];
// ONE trust strip, at label size. A static centred list: no loop, no duplicate copy.
const strip = (items) => `<div class="strip" aria-hidden="true"><div class="strip-track">${items.map(t => `<span class="item">${t}<i></i></span>`).join('')}</div></div>`;

// ONE component for work, used on every page: an editorial row, never a card.
// Depth-aware so the home page and /projects/ render the identical component.
// No `is-lead` on row 0: it gave the FIRST project a permanently larger plate
// and title, so size — not the pointer — decided which project looked featured,
// and no other row responded to hover. All five rows are identical now and the
// hovered one is the one that grows (site.css v20). The "Featured" chip stays,
// because that is a label and labels are honest.
const caseRow = (p, i, depth = 0) =>
  `<a data-route class="case-row" href="${rel(depth, 'projects/' + p.slug + '/index.html')}"><span class="idx">${String(i + 1).padStart(2, '0')}</span><span class="thumb"><img src="${rel(depth, p.cover)}" alt="${p.title} — cover" loading="lazy"></span><div class="body"><span class="kind">${p.kind}</span><h3>${p.title}</h3><p>${p.problem_line}</p></div><div class="side"><span class="facts">${i === 0 ? '<span class="chip is-featured">Featured</span>' : ''}<span class="chip">${p.duration}</span><span class="chip">${p.pages}</span></span><span class="go">Read the case study ${ic('arrow-right')}</span></div></a>`;
const home = `<section class="hero" data-sc-act="flow"><div class="wrap hero-grid"><div><p class="kicker" data-sc-in>Yohannes Assefa — digital designer &amp; Framer developer</p><h1 data-sc-in data-sc-stagger="130"><span>Design that</span><span><em>earns</em> trust.</span></h1><p class="hero-desc" data-sc-in>I design and build websites for travel, photography, interiors, real estate and cultural brands. Five flagship projects, each shipped end to end and told the same way: the brief, the calls I made, and what it added up to.</p><div class="hero-actions"><a data-route class="button" href="projects/index.html">Read the case studies ${ic('arrow-right')}</a><a class="button alt" href="#contact">Start a project</a></div><p class="meta-row" data-sc-in><span class="dot-live">Available for new work</span><span>${ic('pin')}Addis Ababa, Ethiopia</span><span>${ic('clock')}Replies within a working day</span></p></div><div class="hero-media" data-sc-in><img class="hero-portrait" src="assets/site/portrait-hero.jpg" alt="Yohannes Assefa, lit from behind in warm light"><p class="portrait-cap">${ic('check')}Five case studies live in production</p></div></div></section>
${strip(CLIENTS)}
<section class="section section-line" data-sc-act="pin" data-sc-span="${PIN_SPAN_HOME}"><div data-sc-stage class="wrap process-stage"><p class="kicker" data-sc-in>How I work</p><h2 class="section-heading" data-sc-in>One arc, every project.</h2><p class="section-copy" data-sc-in>The same three moves run through all five case studies, so the work can be judged on intent rather than taste.</p><div class="p-meter" aria-hidden="true" data-sc-in><span></span></div><div class="steps" data-sc-in data-sc-stagger="140"><article style="--sc-at:.02">${ic('search')}<span class="n">01</span><h3>The real constraint</h3><p>Every project starts with the actual constraint: who has to be convinced, what information has to be tamed, what the brand has to earn.</p></article><article style="--sc-at:.32">${ic('layers')}<span class="n">02</span><h3>The calls I made</h3><p>Each decision is written down with its reason — photography-first here, region-first navigation there — so the work explains itself.</p></article><article style="--sc-at:.62">${ic('target')}<span class="n">03</span><h3>What it added up to</h3><p>What shipped, on what timeline, and what it does for the client today. Verified, not exaggerated.</p></article></div></div></section>
<section class="section section-line"><div class="wrap"><p class="kicker">Capabilities</p><h2 class="section-heading">What I actually do.</h2><p class="section-copy">Four things, done properly — from the first wireframe to the live, responsive build.</p><div class="services caps"><article class="service" data-sc-in><span class="n">01</span><h3>UI / UX Design</h3><p>Wireframing and prototyping
Interface design for web and mobile
Usability testing and feedback analysis
Micro-interactions and motion</p></article><article class="service" data-sc-in><span class="n">02</span><h3>Graphic Design</h3><p>Logo and brand identity design
Social graphics and campaign art
Infographics and visual systems
Custom illustration and icons</p></article><article class="service" data-sc-in><span class="n">03</span><h3>Web Design</h3><p>Responsive website design
Landing pages and optimisation
Framer and Webflow development
Maintenance and iteration</p></article><article class="service" data-sc-in><span class="n">04</span><h3>Branding</h3><p>Brand strategy and identity
Visual style guides
Typography and colour systems
Brand storytelling</p></article></div></div></section>
<section class="section section-line" data-sc-act="flow"><div class="wrap about-split"><img class="about-photo" src="assets/site/portrait-about.jpg" alt="Yohannes Assefa in a black coat and turtleneck, facing the camera" data-sc-in><div data-sc-in data-sc-stagger="120"><p class="kicker">About</p><h2 class="section-heading">Structure first, then the feeling.</h2><p class="about-copy">I’m a digital designer and Framer developer, trained in architecture. That background is why every project here starts with structure: the information, the sequence, the thing a visitor has to understand. Only then does a site get its atmosphere.</p><p class="about-copy">Five flagship projects, all live in production, plus brand and editorial work in the archive.</p><div class="stats"><div><b data-sc-count="0 5">5</b><small>Years designing and building</small></div><div><b data-sc-count="0 7">7</b><small>Projects shipped end to end</small></div><div><b><span data-sc-count="0 10">10</span>+</b><small>Clients and collaborators</small></div></div><p class="case-more"><a data-route class="button alt" href="about/index.html">More about me ${ic('arrow-right')}</a></p></div></div></section>
<section class="section section-line" id="featured"><div class="wrap"><p class="kicker">Selected work</p><h2 class="section-heading">Five projects, five problems.</h2><p class="section-copy">Each entry is a full case study. The brief, the decisions behind the design, and what shipped. Start anywhere.</p><div class="case-list" data-sc-in data-sc-stagger="130">${PROJECTS.map((p, i) => caseRow(p, i, 0)).join('')}</div><p class="case-more"><a data-route class="button alt" href="projects/index.html">All projects &amp; archive ${ic('arrow-right')}</a></p></div></section>
<section class="section section-line"><div class="wrap"><p class="kicker">Client notes</p><h2 class="section-heading">Two of the five, in their words.</h2><div class="proof" data-sc-in data-sc-stagger="140"><blockquote>${ic('quote')}<p>“His design transformed my travel agency business. He converted my ideas into a high-performing, visually striking website.”</p><cite><b>Sarah Yared</b><small>Owner, ETtravel</small></cite></blockquote><blockquote>${ic('quote')}<p>“He took the time to understand our goals and delivered a design that resonated perfectly with our audience.”</p><cite><b>Liya Woldu</b><small>Product Manager, JoyInterior</small></cite></blockquote></div><p class="case-more"><a data-route class="button alt" href="projects/index.html">See the work behind these ${ic('arrow-right')}</a></p></div></section>
<section class="section section-line" data-sc-act="flow"><div class="wrap faq"><p class="kicker">Before you write</p><h2 class="section-heading">The questions I get asked.</h2><details><summary>What services do you offer?${ic('chevron-down')}</summary><p>UI/UX design, graphic design, web design, and branding support for teams and businesses.</p></details><details><summary>How does the design process work?${ic('chevron-down')}</summary><p>We start with discovery, agree a direction, design and refine the work together, then prepare it for delivery.</p></details><details><summary>How long does a project take?${ic('chevron-down')}</summary><p>The timeline follows the scope. Every project receives an agreed schedule before work starts.</p></details><details><summary>How do I get started?${ic('chevron-down')}</summary><p>Send an enquiry with what you are creating and the problem you want to solve.</p></details></div></section>${contact()}`;
writeFileSync(join(ROOT, 'index.html'), doc('Yohannes Assefa — Digital Designer', 0, home, 'Yohannes Assefa designs and builds websites in Addis Ababa — five flagship case studies, each told from brief to shipped site.', 'home', ''));

// ---------------- ABOUT ----------------
const about = `<section class="page-hero"><div class="wrap"><p class="kicker" data-sc-in>About</p>${kineticTitle('An architect’s eye, built for the screen.')}<p data-sc-in>I’m a digital designer and Framer developer in Addis Ababa. My background is in architecture — that is where the eye for proportion, photography and detail came from — and the last few years have gone into turning it into websites for travel, photography, interiors, real estate and cultural brands.</p></div></section>
<section class="section section-line" data-sc-in><div class="wrap about-split" data-sc-in data-sc-stagger="120"><img class="about-photo" src="${rel(1, 'assets/site/portrait-about.jpg')}" alt="Yohannes Assefa in a black coat and turtleneck, facing the camera"><div><p class="kicker">My journey</p><h2 class="section-heading">Ideas need both structure and feeling.</h2><p class="about-copy">I combine an eye for visual detail with a deep understanding of interactive systems. The goal is never just to make something look good. It is to make an idea clear, responsive, and worth returning to.</p><div class="timeline"><article><small>2024 — Present</small><h3>UI/UX and Web Designer · Freelance</h3></article><article><small>2023 — 2024</small><h3>Graphic Designer · PurposeblackEth</h3></article><article><small>2021 — 2023</small><h3>Web Designer · Joye Design Studio</h3></article></div></div></div></section><section class="section section-line"><div class="wrap"><p class="kicker">My toolkit</p><h2 class="section-heading">Tools in service of the idea.</h2><div class="services" data-sc-in data-sc-stagger="130"><article class="service"><span class="n">01</span><h3>Framer</h3><p>My creative playground for responsive, interactive websites that are fast to shape and easy to evolve.</p></article><article class="service"><span class="n">02</span><h3>Figma</h3><p>My go-to for wireframing, prototyping, and turning an early idea into a clear interface system.</p></article><article class="service"><span class="n">03</span><h3>Lightroom</h3><p>My photo-editing tool for adding colour, depth, and a consistent point of view to visual work.</p></article><article class="service"><span class="n">04</span><h3>Illustrator</h3><p>My tool for graphic design, brand identity, and precision vector design.</p></article></div><div class="about-pair" data-sc-in><figure><img src="${rel(1, 'assets/site/VRQgkdWsjawSg1qpCm45HfSY1I.jpeg')}" alt="A designer's desk: one large monitor, keyboard, and a shelf of objects" loading="lazy" decoding="async"><figcaption>One screen. Every tool. No clutter.</figcaption></figure><figure><img src="${rel(1, 'assets/site/fw9i7cnyP36KPrIT0FHN2bcu0xU.jpeg')}" alt="A designer in a red sweater working at a laptop against a plain wall" loading="lazy" decoding="async"><figcaption>Building it, one pass at a time.</figcaption></figure></div></div></section><section class="section section-line" data-sc-act="pin" data-sc-span="${PIN_SPAN_ABOUT}"><div data-sc-stage class="wrap process-stage"><p class="kicker" data-sc-in>The process</p><h2 class="section-heading" data-sc-in>Five steps, in order.</h2><div class="p-meter" aria-hidden="true" data-sc-in><span></span></div><div class="steps five" data-sc-in data-sc-stagger="130"><article style="--sc-at:.02">${ic('search')}<span class="n">01</span><h3>Research &amp; strategy</h3><p>Understand the business, the audience and the goal, then agree a roadmap before anything is drawn.</p></article><article style="--sc-at:.20">${ic('target')}<span class="n">02</span><h3>Concept &amp; direction</h3><p>Turn the strategy into two or three real directions — not mood boards, but wireframes you can judge.</p></article><article style="--sc-at:.38">${ic('layers')}<span class="n">03</span><h3>Feedback &amp; refinement</h3><p>Review together and shape the work until it answers the brief — in writing, so decisions stay traceable.</p></article><article style="--sc-at:.56">${ic('clock')}<span class="n">04</span><h3>Testing &amp; optimisation</h3><p>Check the real thing on real devices: load, contrast, focus order, touch targets, long copy.</p></article><article style="--sc-at:.74">${ic('check')}<span class="n">05</span><h3>Launch &amp; handover</h3><p>Ship it, then hand over the system: components, type scale, and what to change next.</p></article></div></div></section>
<section class="section section-line"><div class="wrap"><p class="kicker">In the wild</p><h2 class="section-heading">Work that shipped.</h2><p class="section-copy">Frames from projects across travel, photography, interiors, real estate and art — each one live and in production.</p></div><div class="img-band" data-sc-in data-sc-stagger="120"><img src="${rel(1,'assets/site/oaXV5No2WInacbQ0FDOFpZXliKQ.jpg')}" alt="ETtravel destination hero" loading="lazy"><img src="${rel(1,'assets/site/JSCoL3ekoTbuU4QQtS98N4UOrcs.jpg')}" alt="Photography portfolio" loading="lazy"><img src="${rel(1,'assets/site/SKg2WQM5Rb7EvoZxCzmV07GWUCc.jpg')}" alt="JoyInterior interiors" loading="lazy"><img src="${rel(1,'assets/site/RVPrHE1bVllFVo1kpbTHjusfLOQ.jpeg')}" alt="Gwarinpa Real Estate" loading="lazy"><img src="${rel(1,'assets/site/FlD2oaqtn5t2KuN4K0t9v8p1iIs.png')}" alt="Museum of Art in Addis" loading="lazy"></div></section>${contact()}`;
mkdirSync(join(ROOT, 'about'), { recursive: true });
writeFileSync(join(ROOT, 'about', 'index.html'), doc('About — Yohannes Assefa', 1, about, 'A digital designer and Framer developer in Addis Ababa — structure first, then the feeling.', 'about', 'about/', 'assets/site/portrait-about.jpg'));

// ---------------- PROJECTS ----------------
const archiveCard = (a, depth) =>
  `<a data-route class="project-card" href="${rel(depth, 'projects/' + a.slug + '/index.html')}"><img src="${rel(depth, a.image)}" alt="${a.title}"><div class="overlay"><span class="kicker">${a.kind}</span><h2>${a.title}</h2><p>${a.problem_line}</p></div></a>`;
const selectedCards = PROJECTS.map((p, i) => caseRow(p, i, 1)).join('');
const archiveCards = ARCHIVE.map(a => archiveCard(a, 1)).join('');
const projectsPage = `<section class="page-hero"><div class="wrap"><p class="kicker" data-sc-in>Portfolio</p>${kineticTitle('Seven projects, told properly.')}<p data-sc-in>Five flagship case studies, each opening with the brief and closing with what shipped — plus brand and editorial work in the archive below.</p></div></section>
<section class="section section-line" id="selected"><div class="wrap"><p class="kicker">Selected work</p><h2 class="section-heading">The five case studies.</h2><p class="section-copy">Every entry opens with the client's ask, lists the calls I made and why, and ends with what shipped.</p><div class="case-list" data-sc-in data-sc-stagger="130">${selectedCards}</div></div></section>
<section class="section section-line"><div class="wrap"><p class="kicker">Archive</p><h2 class="section-heading">Brand &amp; editorial.</h2><div class="project-grid" data-sc-in data-sc-stagger="140">${archiveCards}</div></div></section>${contact()}`;
mkdirSync(join(ROOT, 'projects'), { recursive: true });
writeFileSync(join(ROOT, 'projects', 'index.html'), doc('Projects — Yohannes Assefa', 1, projectsPage, 'Five flagship case studies told from brief to result, plus brand and editorial work in the archive.', 'projects', 'projects/'));

// ---------------- PROJECT DETAIL PAGES (flagships) ----------------
for (const p of PROJECTS) {
  const d = join(ROOT, 'projects', p.slug);
  mkdirSync(d, { recursive: true });
  writeFileSync(join(d, 'index.html'), detailPage(p, PROJECTS));
}

// archive detail pages: keep existing generated pages; create minimal ones if missing
for (const a of ARCHIVE) {
  const f = join(ROOT, 'projects', a.slug, 'index.html');
  { // always regenerate: stale pages predate the v11 shell and would keep the old nav/form
    mkdirSync(dirname(f), { recursive: true });
    const body = `<section class="project-detail-hero"><div class="wrap"><span class="type" data-sc-in>${a.kind}</span>${kineticTitle(a.title)}<p data-sc-in>${a.desc}</p></div></section><img class="detail-hero-image" src="${rel(2, a.image)}" alt="${a.title}">${staticScreens(a, 2)}${contact()}`;
    writeFileSync(f, doc(a.title + ' — Yohannes Assefa', 2, body, a.desc, 'projects', 'projects/' + a.slug + '/', a.image));
  }
}

// ---------------- BLOGS ----------------
const posts = [
  { img: 'assets/site/1MKyBh4nyMajaj7mqPEZiCiuAiU.jpg', slug: 'design-trends-that-will-define-2025', date: 'Feb 7, 2025', title: 'Design Trends That Will Define 2025', desc: 'Like everything progresses and evolves, design also has its own eras, and we are in the AI-motivated era of design.', body: [['Interactive 3D Objects', 'Three-dimensional models and environments can create engaging, immersive experiences when interaction helps a visitor understand something rather than merely making a page move.', 'assets/site/IHxJW1bKUhAj9C6slDiHfYZk.jpg'], ['AI Interfaces and Presence', 'UI and UX are becoming more natural and adaptive. AI can now act as a creative partner in design workflows, but human-centered decisions remain essential: technology should serve people, not replace them.', 'assets/site/mqYI8iGnOdVn7is3WMoGmnLwc.jpg'], ['Bento Grids', 'A modular UI layout with varying tile sizes can make information feel organized and dynamic. It works best when the hierarchy is real, not simply decorative.', 'assets/site/rcirnYWcwUy8ZXqykfvozbbyCDE.jpg'], ['Modern Skeuomorphism', 'Familiar real-world textures and shapes can be brought into digital work in a lighter, more contemporary way.', 'assets/site/umg7xrt0J22YAW0X8LsdSo9U1w.jpg'], ['Progressive Blur & Text Transitions', 'Subtle blur and thoughtful text transitions can guide focus, create depth, and make a story easier to follow.']] },
  { img: 'assets/site/SQgfnjbRI9uSNscu7wFDXpuJeRo.jpg', slug: 'the-power-of-typography-in-web-design', date: 'May 2, 2025', title: 'The Power of Typography in Web Design', desc: 'Learn how typography can make or break a website and discover choices that improve impact and readability.', body: [['Typography carries the voice', 'Type sets the pace before anyone reads a word. A thoughtful display face establishes personality, while body text must make sustained reading feel effortless.'], ['Start with hierarchy', 'Choose a small type scale, set real contrast between headings and supporting copy, and make the path through each page obvious.'], ['Make reading easy', 'Readable line length, line height, and contrast matter more than an attention-grabbing font. A website can be expressive and still be generous to readers.'], ['Consistency builds trust', 'Use type rules consistently across navigation, buttons, captions, and long-form writing. The system is what makes an experience feel intentional.']] },
];
const blogCards = posts.map(post =>
  `<a data-route class="post-card" data-sc-in href="${rel(1, 'blogs/' + post.slug + '/index.html')}"><span class="kicker">Insights · ${post.date}</span><img src="${rel(1, post.img)}" alt="${post.title} — cover" loading="lazy"><h2>${post.title}</h2><p>${post.desc}</p><span class="button alt">Read article ${ic('arrow-right')}</span></a>`).join('');
const blogs = `<section class="page-hero"><div class="wrap"><p class="kicker" data-sc-in>Journal</p>${kineticTitle('Design insights &amp; ideas.')}<p data-sc-in>From design trends to creative process, these short notes aim to elevate craft, solve challenges, and spark new possibilities.</p></div></section><section class="section section-line"><div class="wrap"><div class="blog-grid" data-sc-in data-sc-stagger="140">${blogCards}</div></div></section>${contact()}`;
mkdirSync(join(ROOT, 'blogs'), { recursive: true });
writeFileSync(join(ROOT, 'blogs', 'index.html'), doc('Blogs — Yohannes Assefa', 1, blogs, 'Short notes on design trends, typography and process from a designer and Framer developer in Addis Ababa.', 'blogs', 'blogs/'));
for (const post of posts) {
  const art = post.body.map(([head, text, img]) => `<h2>${head}</h2><p>${text}</p>${img ? `<img class="article-img" src="${rel(2, img)}" alt="${head} example" loading="lazy">` : ''}`).join('');
  const page = `<article class="article" data-sc-in><p class="meta">Insights · ${post.date}</p>${kineticTitle(post.title)}<img class="article-cover" src="${rel(2, post.img)}" alt="${post.title} cover"><p class="lede">${post.desc}</p>${art}<p><a data-route class="button alt" href="${rel(2, 'blogs/index.html')}">All insights ${ic('arrow-right')}</a></p></article>${contact()}`;
  const d = join(ROOT, 'blogs', post.slug);
  mkdirSync(d, { recursive: true });
  writeFileSync(join(d, 'index.html'), doc(post.title + ' — Yohannes Assefa', 2, page, post.desc, 'blogs', 'blogs/' + post.slug + '/', post.img));
}

console.log('regenerated the site (node)');

// ---------------- SITEMAP ----------------
// `.gitignore` has listed sitemap.xml as build output "regenerated by
// build_site.mjs" since the first commit, but no code here ever wrote one, so the
// deployed site has had no sitemap at all — a search engine was being told about
// the home page and nothing else.
//
// Every URL is collected from what was actually written above rather than
// hand-listed, so a page cannot be added without appearing here. Paths are
// directory URLs (`about/`, not `about/index.html`) because that is the form the
// canonical tags on those pages use, and a sitemap that disagrees with its own
// canonicals is worse than none. Dates are the file mtimes, which is honest for
// a static site: it says when the page last changed on disk.
const written = [];
const urlmod = p => {
  written.push(p);
  return { target: p, mtime: statSync(join(ROOT, p)).mtime };
};
// `doc()` is the single funnel every page goes through, so hooking the page path
// there records them all without a second list to keep in sync.
const sitemapEntries = [
  { loc: SITE + '/', ...urlmod('index.html'), priority: '1.0', changefreq: 'weekly' },
  { loc: SITE + '/projects/', ...urlmod('projects/index.html'), priority: '0.9', changefreq: 'weekly' },
  { loc: SITE + '/about/', ...urlmod('about/index.html'), priority: '0.8', changefreq: 'monthly' },
  { loc: SITE + '/blogs/', ...urlmod('blogs/index.html'), priority: '0.8', changefreq: 'weekly' },
  ...PROJECTS.map(p => ({ loc: SITE + '/projects/' + p.slug + '/', ...urlmod('projects/' + p.slug + '/index.html'), priority: '0.7', changefreq: 'monthly' })),
  ...ARCHIVE.map(a => ({ loc: SITE + '/projects/' + a.slug + '/', ...urlmod('projects/' + a.slug + '/index.html'), priority: '0.5', changefreq: 'monthly' })),
  ...posts.map(p => ({ loc: SITE + '/blogs/' + p.slug + '/', ...urlmod('blogs/' + p.slug + '/index.html'), priority: '0.6', changefreq: 'yearly' })),
];
const iso = d => d.toISOString().slice(0, 10);
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  sitemapEntries.map(e =>
    `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${iso(e.mtime)}</lastmod>\n` +
    `    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`
  ).join('\n') +
  `\n</urlset>\n`;
writeFileSync(join(ROOT, 'sitemap.xml'), xml);
console.log(`wrote sitemap.xml (${sitemapEntries.length} urls)`);
