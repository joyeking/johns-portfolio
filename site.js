(()=>{
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cursor=document.querySelector('.cursor');
  if(cursor&&!reduce&&matchMedia('(pointer:fine)').matches){
    addEventListener('pointermove',e=>{cursor.style.transform=`translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;cursor.style.opacity='.82'});
    document.querySelectorAll('a,button,summary,.case-row,.project-card,.post-card').forEach(el=>{el.addEventListener('pointerenter',()=>cursor.classList.add('is-active'));el.addEventListener('pointerleave',()=>cursor.classList.remove('is-active'))});
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
  if(window.ScrollCraft){ScrollCraft.mount(document.body)}
})();