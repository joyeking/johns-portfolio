(()=>{
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cursor=document.querySelector('.cursor');
  if(cursor&&!reduce&&matchMedia('(pointer:fine)').matches){
    addEventListener('pointermove',e=>{cursor.style.transform=`translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;cursor.style.opacity='.82'});
    document.querySelectorAll('a,button,summary,.work-row,.work-plate,.post-card').forEach(el=>{el.addEventListener('pointerenter',()=>cursor.classList.add('is-active'));el.addEventListener('pointerleave',()=>cursor.classList.remove('is-active'))});
  }
  // Mobile menu: one <nav> that is a row on desktop and a panel on small screens.
  // The open state lives in data-open so CSS owns both layouts and JS owns no geometry.
  const menuBtn=document.querySelector('[data-menu-btn]');
  const menu=document.getElementById('site-menu');
  if(menuBtn&&menu){
    const setOpen=open=>{menu.dataset.open=String(open);menuBtn.setAttribute('aria-expanded',String(open));menuBtn.setAttribute('aria-label',open?'Close menu':'Open menu');const use=menuBtn.querySelector('use');if(use)use.setAttribute('href',open?'#i-chevron-down':'#i-menu')};
    setOpen(false);
    menuBtn.addEventListener('click',()=>setOpen(menu.dataset.open!=='true'));
    menu.addEventListener('click',e=>{if(e.target.closest('a'))setOpen(false)});
    addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.dataset.open==='true'){setOpen(false);menuBtn.focus()}});
    addEventListener('resize',()=>{if(matchMedia('(min-width: 861px)').matches)setOpen(false)});
  }
  // The engine's data-sc-count handles the numbers; the bespoke odometer is gone.
  document.querySelectorAll('form[data-demo-form]').forEach(form=>form.addEventListener('submit',e=>{
    e.preventDefault();
    if(!form.reportValidity())return;
    const button=form.querySelector('button[type=submit]');
    const status=form.querySelector('[data-form-status]');
    if(button){button.disabled=true;button.textContent='Enquiry ready';}
    if(status){status.textContent='This demo form is not wired to a backend yet — email yohannesassefa17@gmail.com and your note goes straight through.';status.classList.add('is-done');}
  }));
  document.querySelectorAll('a[data-route]').forEach(a=>a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||!document.startViewTransition)return;e.preventDefault();document.startViewTransition(()=>location.href=a.href)}));
  // Theme. The attribute is ALWAYS an explicit 'light' or 'dark' — the old code
  // deleted it for light, which left the toggle's state implicit and out of sync
  // with the stylesheet's own convention. We also follow the OS until the reader
  // picks for themselves, and keep color-scheme + theme-color in step so the
  // browser chrome (scrollbars, <select> dropdowns, autofill) matches the canvas.
  const rootEl=document.documentElement;
  const modeSwitch=document.querySelector('[data-mode-switch]');
  const themeMeta=document.querySelector('meta[name="theme-color"]');
  const systemDark=matchMedia('(prefers-color-scheme: dark)');
  const THEME_COLOR={light:'#FEFABF',dark:'#665547'};
  const readTheme=()=>{try{const t=localStorage.getItem('theme');return t==='light'||t==='dark'?t:null}catch(e){return null}};
  const applyTheme=t=>{
    rootEl.dataset.theme=t;
    rootEl.style.colorScheme=t;
    if(themeMeta)themeMeta.setAttribute('content',THEME_COLOR[t]);
    if(modeSwitch){
      modeSwitch.setAttribute('aria-pressed',String(t==='dark'));
      modeSwitch.setAttribute('aria-label',t==='dark'?'Switch to light mode':'Switch to dark mode');
    }
  };
  applyTheme(readTheme()||(systemDark.matches?'dark':'light'));
  if(modeSwitch)modeSwitch.addEventListener('click',()=>{
    const next=rootEl.dataset.theme==='dark'?'light':'dark';
    try{localStorage.setItem('theme',next)}catch(e){}
    applyTheme(next);
  });
  // Track the OS only while the reader has not overridden it.
  systemDark.addEventListener('change',e=>{if(!readTheme())applyTheme(e.matches?'dark':'light')});
  document.querySelectorAll('.browser-frame[data-frame]').forEach(frame=>{
    frame.querySelectorAll('.device').forEach(btn=>btn.addEventListener('click',()=>{
      frame.querySelectorAll('.device').forEach(b=>b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const screen=frame.querySelector('.frame-screen');
      screen.style.width=btn.dataset.w;
      screen.style.maxWidth=btn.dataset.w==='100%'?'100%':btn.dataset.w;
    }));
  });
  document.querySelectorAll('.frame-load').forEach(btn=>btn.addEventListener('click',()=>{
    const screen=btn.closest('.frame-screen');
    const iframe=document.createElement('iframe');
    iframe.src=btn.dataset.src;iframe.title='Live site preview';iframe.loading='lazy';
    iframe.setAttribute('allow','fullscreen');
    screen.replaceChildren(iframe);
  }));
  // HOME PREVIEW INDEX — the list drives the one stage image.
  // The stage is a single <img>; hovering or focusing a row swaps its src once
  // the replacement has decoded, so the plate fades out only when the next frame
  // is ready and never flickers through a half-loaded image. Reduced motion skips
  // the cross-fade and swaps at once. Other covers are warmed on idle so the
  // first hover is instant without paying for every image at load.
  document.querySelectorAll('[data-work-index]').forEach(index=>{
    const img=index.querySelector('[data-work-img]');
    const cap=index.querySelector('[data-work-cap]');
    const rows=Array.from(index.querySelectorAll('.work-row'));
    if(!img||!rows.length)return;
    const base=img.getAttribute('src');
    let current=base;
    const show=row=>{
      const src=row.dataset.cover;
      if(!src||src===current)return;
      current=src;
      if(cap&&row.dataset.workTitle)cap.textContent=row.dataset.workTitle;
      if(reduce){img.src=src;return}
      const next=new Image();
      const swap=()=>{img.src=src;img.classList.remove('is-swapping')};
      next.onload=swap;next.onerror=swap;
      img.classList.add('is-swapping');
      next.src=src;
    };
    rows.forEach(row=>{
      row.addEventListener('pointerenter',()=>show(row));
      row.addEventListener('focus',()=>show(row));
    });
    const warm=()=>rows.forEach(r=>{if(r.dataset.cover&&r.dataset.cover!==base){const i=new Image();i.src=r.dataset.cover}});
    if('requestIdleCallback' in window)requestIdleCallback(warm,{timeout:2500});else setTimeout(warm,1400);
  });

  // /projects/ FILTER RAIL — buttons show or hide plates. State only moves here:
  // aria-pressed + [hidden]; the markup and its classes are set by the generator.
  document.querySelectorAll('[data-filter]').forEach(rail=>{
    const grid=document.getElementById(rail.dataset.filter);
    if(!grid)return;
    const pills=Array.from(rail.querySelectorAll('[data-cat]'));
    const plates=Array.from(grid.querySelectorAll('.work-plate'));
    const apply=cat=>{
      pills.forEach(p=>p.setAttribute('aria-pressed',String(p.dataset.cat===cat)));
      plates.forEach(plate=>{plate.hidden=cat!=='all'&&plate.dataset.cat!==cat});
    };
    pills.forEach(p=>p.addEventListener('click',()=>apply(p.dataset.cat)));
  });

  if(window.ScrollCraft){ScrollCraft.mount(document.body)}
  velocityLean();
})();

// SCROLL-VELOCITY LEAN — the one class of effect CSS cannot express.
//
// WHY THIS IS JS AND NOT A STYLESHEET RULE. Everything else on this site is
// either a timed transition (CSS) or a scroll-PROGRESS effect driven by the
// engine's `--sc-p`. Progress is a position: given where the scrollbar is, you
// can compute where an element should be, in CSS, with no scripting of your own.
//
// Velocity is a rate, and a rate has memory. "How fast is the reader moving
// right now, and where has the content fallen behind because of it" cannot be
// derived from the current scroll offset — two readers at the same scroll
// position, one who just flung there and one who crept, need different states.
// There is no CSS input for that. The reference site's runtime does the same
// thing in JS for the same reason.
//
// So sections LEAN. Push the page and each one is dragged a little behind the
// scroll, then springs back to rest as you stop. It is the same physics a reader
// expects from a physical thing being moved, and it is the "interaction" that a
// fixed-opacity reveal cannot produce: the page acknowledges the input.
//
// COST DISCIPLINE, because this is a per-frame effect and the last thing this
// site needs is jank:
//   - one rAF loop for the whole page, not one per element
//   - `scrollY` is read once per frame, never per element
//   - geometry is cached and only re-measured on resize, never in the loop
//   - the only writes are `transform` on a handful of elements, and they are
//     skipped entirely when the settled value has not moved by more than 0.05px,
//     so a still page costs nothing after it settles
//   - nothing is observed with IntersectionObserver; a section outside the
//     viewport simply has no offset applied
//
// Reduced motion: not run at all. `prefers-reduced-motion` is about vestibular
// safety and large translate-on-scroll is exactly what it is asking to be spared.
function velocityLean(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if(matchMedia('(max-width: 860px)').matches) return;

  // Only elements that are full-bleed blocks. The work list and the pinned act
  // are deliberately excluded: the list already has a staggered arrival and a
  // hover state, and the pinned act's stage is `position:sticky` inside a box
  // the engine sizes — a transform on either would change what they are.
  const SEL='[data-sc-lean]';
  const items=[];
  const collect=()=>{
    items.length=0;
    for(const el of document.querySelectorAll(SEL)){
      const r=el.getBoundingClientRect();
      if(r.height<120) continue;
      items.push({el,top:r.top+scrollY,last:0});
    }
  };
  collect();
  if(!items.length) return;

  let lastW=innerWidth, ticking=false;
  addEventListener('resize',()=>{
    if(innerWidth===lastW) return;
    lastW=innerWidth; collect();
  },{passive:true});

  // spring state, one per item
  // spring state, one per item. This was originally written as
  // `for(const it of items) it.vel=0; it.off=0;` — where the loop body is only
  // the first statement and `it.off=0` falls OUTSIDE the loop, so it threw
  // "it is not defined", killed velocityLean() on its first line, and the whole
  // effect silently never ran. The braces are load-bearing.
  for(const it of items){ it.off=0; }

  let vel=0, prevY=scrollY, raf=0;
  const TICK=0.14;   // how fast the lean catches up
  const MAX=26;      // px of lean at full fling
  const CAP=2.6;     // velocity cap, in px/ms, so a trackpad flick cannot fling it

  const frame=()=>{
    raf=0; ticking=false;
    const y=scrollY;
    // instantaneous scroll rate, smoothed once
    const raw=(y-prevY);
    prevY=y;
    vel=vel+(raw-vel)*0.2;
    vel=Math.max(-CAP,Math.min(CAP,vel));

    const vh=innerHeight;
    for(const it of items){
      // is it anywhere near the viewport?
      const d=it.top-y;
      if(d>vh*1.5||d<-it.el.offsetHeight-vh*0.5){
        // A section that has left the viewport must be put BACK, not skipped.
        // Skipping it left whatever offset it happened to hold baked into its
        // inline style, so a section flung past stayed visibly displaced for as
        // long as the reader scrolled on — and snapped when it came back into
        // range. Measured: sections parked at a permanent 3.64px lean.
        if(it.off!==0||it.last!==0){
          it.off=0; it.last=0;
          it.el.style.transform='';
        }
        continue;
      }
      // content within view leans with the scroll; a section well past the fold
      // is nobody's business
      const target=Math.max(-MAX,Math.min(MAX,vel*MAX/CAP));
      it.off+=(target-it.off)*TICK;
      if(Math.abs(it.off-it.last)<0.05) continue;   // settled: write nothing
      it.last=it.off;
      it.el.style.transform=`translate3d(0,${it.off.toFixed(2)}px,0)`;
    }
    // keep running while anything is still in motion or still off-rest
    if(Math.abs(vel)>0.02||items.some(i=>Math.abs(i.off)>0.05)) schedule();
  };
  const schedule=()=>{if(!raf){raf=requestAnimationFrame(frame)}};
  addEventListener('scroll',()=>{if(!ticking){ticking=true;schedule()}},{passive:true});
  schedule();
}