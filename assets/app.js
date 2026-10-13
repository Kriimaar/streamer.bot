/* Kriimaar · Theme, Einstellungen, Sprachen */
(function(){
'use strict';
const LANGS=['de','en'];
const ORIG=new WeakMap();
const I18N={
  dicts:{de:{},en:{}},
  titles:{},
  lang:(function(){try{const l=localStorage.getItem('kriimaar-lang');return l==='en'?'en':'de'}catch(e){}return 'de'})(),
  add(d){for(const l of LANGS)if(d[l])Object.assign(this.dicts[l],d[l])},
  t(s){const d=this.dicts[this.lang];if(d&&d[s]!==undefined)return d[s];const g=this.dicts.de;return g&&g[s]!==undefined?g[s]:s},
  walk(root){
    root=root||document;
    const dict=this.dicts[this.lang]||{};
    root.querySelectorAll('[data-i18n]').forEach(el=>{
      const k=el.getAttribute('data-i18n'),v=this.t(k);
      if(!ORIG.has(el))ORIG.set(el,el.innerHTML);
      if(v===k){const o=ORIG.get(el);if(el.innerHTML!==o)el.innerHTML=o;return;}
      if(v.indexOf('<')!==-1)el.innerHTML=v;else el.textContent=v;
    });
    const skip=el=>el.closest&&el.closest('textarea,script,style,code,pre,.no-i18n');
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{
      if(!n.nodeValue||!n.nodeValue.trim())return NodeFilter.FILTER_REJECT;
      const p=n.parentElement;
      if(!p||skip(p))return NodeFilter.FILTER_REJECT;
      if(ORIG.has(n))return NodeFilter.FILTER_ACCEPT;
      return dict[n.nodeValue.trim()]!==undefined?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP;
    }});
    const nodes=[];let n;
    while((n=walker.nextNode()))nodes.push(n);
    for(const node of nodes){
      if(!ORIG.has(node))ORIG.set(node,node.nodeValue.trim());
      const key=ORIG.get(node),v=this.t(key);
      if(node.nodeValue.trim()!==v)node.nodeValue=v;
    }
    root.querySelectorAll('[data-i18n-ph]').forEach(el=>{el.placeholder=this.t(el.getAttribute('data-i18n-ph'))});
  },
  setTitle(){if(this.titles[this.lang])document.title=this.titles[this.lang]},
  apply(root){this.walk(root);this.setTitle()},
  set(l){
    if(l!=='de'&&l!=='en')return;
    this.lang=l;
    try{localStorage.setItem('kriimaar-lang',l)}catch(e){}
    document.documentElement.lang=l;
    this.setTitle();this.apply();
    if(panel)renderPanel();
    document.dispatchEvent(new CustomEvent('kriimaar:lang'));
  }
};
window.I18N=I18N;

/* Design */
function sysDark(){return window.matchMedia&&matchMedia('(prefers-color-scheme:dark)').matches}
const THEMES=['system','light','dark','oled'];
let theme=(function(){try{const t=localStorage.getItem('kriimaar-theme');if(THEMES.includes(t))return t}catch(e){}return 'system'})();
function applyTheme(){document.documentElement.dataset.theme=theme==='system'?(sysDark()?'dark':'light'):theme}
function setTheme(v){theme=v;try{localStorage.setItem('kriimaar-theme',v)}catch(e){}applyTheme();if(panel)renderPanel()}
/* Akzentfarbe: Reflectionslos in localStorage, sitewide via Inline-Style auf :root (--p).
   Override-Style ersetzt die hartcodierten Lavendel-Hover der injizierten Navigation/Einstellungen. */
const ACCENT_KEY='kriimaar-accent',ACCENT_DEFAULT='#a855f7';
let accent=(function(){try{const v=localStorage.getItem(ACCENT_KEY);return /^#[0-9a-fA-F]{6}$/.test(v)?v.toLowerCase():ACCENT_DEFAULT}catch(e){return ACCENT_DEFAULT}})();
function applyAccent(){
  document.documentElement.style.setProperty('--p',accent);
  if(document.getElementById('accent-override'))return;
  const st=document.createElement('style');st.id='accent-override';
  st.textContent='.pn-btn:hover,.pn-menu a:hover,.pn-group>.pn-head:hover,.ks-toggle:hover,.ks-btn:hover{color:color-mix(in srgb,var(--p) 45%,#fff)!important}.ks-btn:hover,.lb-close:hover{border-color:var(--p)!important}.ks-btn.active{border-color:var(--p)!important;background:color-mix(in srgb,var(--p) 12%,transparent)!important;color:color-mix(in srgb,var(--p) 45%,#fff)!important}';
  document.head.appendChild(st);
}
applyAccent();
/* Pageselect im Header folgt immer der aktuellen URL (heilt restores nach Navigation) */
function applyPickerStyle(){const t=document.documentElement.dataset.theme;document.documentElement.style.setProperty('--kriimaar-picker',(t==='dark'||t==='oled')?'color-scheme:dark':'color-scheme:light')}
applyPickerStyle();
new MutationObserver(applyPickerStyle).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
try{const ks=document.createElement('style');ks.textContent='.nav select,.sb-nav select{color-scheme:var(--kriimaar-picker,light)}.pn-drop{position:relative;display:grid;place-items:center;min-width:112px;border-left:1px solid #26262c}.pn-wrap{position:relative}.pn-btn{display:grid;place-items:center;width:100%;height:100%;min-height:46px;padding:0 13px;border:0;background:transparent;color:#8b8b96;font:11px "Courier New",monospace;text-transform:uppercase;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pn-btn:hover{background:#141419;color:#d7c3ff}.pn-menu{display:none;position:absolute;top:100%;right:0;min-width:268px;padding:6px 0;background:#0c0c0e;border:1px solid #26262c;box-shadow:0 16px 48px #000c;z-index:90;text-align:left}.pn-wrap.open .pn-menu{display:block}.pn-menu a{display:block;padding:9px 16px;color:#8b8b96;font:11px "Courier New",monospace;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;white-space:nowrap}.pn-menu a:hover{background:#141419;color:#d7c3ff}.pn-menu a.active{color:#55e58f}.pn-menu a.active::after{content:" ✓"}.pn-sep{height:1px;margin:6px 0;background:#26262c}.pn-group{position:relative}.pn-group>a,.pn-group>.pn-head{display:flex;align-items:center;justify-content:space-between;gap:14px;cursor:pointer}.pn-group>.pn-head{padding:9px 16px;color:#8b8b96;font:11px "Courier New",monospace;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}.pn-group.has-active>.pn-head{color:#55e58f}.pn-group>.pn-head:hover{background:#141419;color:#d7c3ff}.pn-arrow{margin-left:auto;color:#656570;font-size:9px;transition:transform .12s}.pn-group.open>.pn-head .pn-arrow,.pn-group:hover>.pn-head .pn-arrow{transform:rotate(90deg)}.pn-sub{display:none;position:absolute;top:-7px;right:100%;min-width:200px;padding:6px 0;background:#0c0c0e;border:1px solid #26262c;box-shadow:0 16px 48px #000c;z-index:91}.pn-group.open>.pn-sub{display:block}@media(hover:hover){.pn-group:hover>.pn-sub{display:block}}@media(max-width:800px){.pn-sub{position:static;display:none;padding-left:14px;border-left:1px solid #26262c;margin-left:16px;box-shadow:none}.pn-group.open>.pn-sub{display:block}}';document.head.appendChild(ks)}catch(e){}
/* Seitennavigation: eigenes Dropdown mit echten Links (kein <select>, keine onchange-Fallstricke).
   Struktur: flache Links + .pn-group-Container mit .pn-head (Label + ▸) und .pn-sub-Untermenü.
   Desktop (hover): Untermenü folgt dem Cursor; Mobile/Klick: erster Tap öffnet das Untermenü. */
function initPageNav(){
  const wrap=document.querySelector('.pn-wrap');
  if(!wrap||wrap.dataset.ready)return;
  wrap.dataset.ready='1';
  const btn=wrap.querySelector('.pn-btn'),menu=wrap.querySelector('.pn-menu');
  if(!btn||!menu)return;
  const here=location.pathname.replace(/\\/g,'/');
  let hereHash=location.hash||'';
  /* Aktive Markierung: auch Sub-Links. Der pn-btn zeigt den Namen der aktiven Seite (bzw. Gruppe).
     Nur EIN Link wird aktiv: exakte URL + exakter Hash (oder Seitenlink ohne Hash, wenn die URL keinen Hash hat). */
  const mark=()=>{
    menu.querySelectorAll('a.active').forEach(a=>a.classList.remove('active'));
    let found=null;
    menu.querySelectorAll('a').forEach(a=>{
      if(found)return;
      let p='';try{p=new URL(a.getAttribute('href'),location.href).pathname.replace(/\\/g,'/')}catch(e){return}
      const h=(a.getAttribute('href').split('#')[1]?'#'+a.getAttribute('href').split('#')[1]:'');
      if(p===here&&h&&h===hereHash)found=a;
      else if(p===here&&!h&&!hereHash)found=a;
    });
    if(found)found.classList.add('active');
    return found;
  };
  let cur=mark();
  menu.querySelectorAll('.pn-group').forEach(g=>{
    if(g.querySelector('a.active')){g.classList.add('has-active');const head=g.querySelector('.pn-head span');}
  });
  /* Klick auf Menüpunkt: sofort visuelles Feedback (aktive Markierung wandert). */
  menu.querySelectorAll('a[href*="#"]').forEach(a=>{
    a.addEventListener('click',()=>{
      hereHash='#'+a.getAttribute('href').split('#')[1];
      cur=mark();
    });
  });
  /* Hash kann sich zur Laufzeit ändern (z.B. Scroll-Nav auf der Seite): Markierung mitzieht. */
  window.addEventListener('hashchange',()=>{hereHash=location.hash||'';cur=mark()});
  /* Bugfix: ein per Klick geöffnetes Untermenü (.open) bleibt sonst offen, wenn man
     über eine andere Gruppe hovert. Beim Verlassen der Gruppe schließen wir .open deshalb aktiv.
     Vorher reichen wir mouseenter an andere Gruppen durch, damit das offen gebliebene
     Submenü nicht hängen bleibt (Bild: Stream-Moderation-Fenster bleibt über dem Rest stehen). */
  const clearOpen=()=>menu.querySelectorAll('.pn-group.open').forEach(g=>g.classList.remove('open'));
  menu.querySelectorAll('.pn-group').forEach(g=>{
    g.addEventListener('mouseenter',()=>{
      menu.querySelectorAll('.pn-group.open').forEach(o=>{if(o!==g)o.classList.remove('open')});
    });
    g.addEventListener('mouseleave',()=>{g.classList.remove('open')});
  });
  /* Sub-Gruppen: Klick auf pn-head togglet (Mobile), Desktop-Hover erledigt CSS */
  menu.querySelectorAll('.pn-group>.pn-head').forEach(head=>{
    head.addEventListener('click',e=>{e.stopPropagation();clearOpen();head.parentElement.classList.toggle('open')});
  });
  /* pn-btn-Text: aktive Seite oder aktive Gruppe */
  const activeGroup=menu.querySelector('.pn-group.has-active');
  const headEl=cur?cur:(activeGroup?activeGroup.querySelector('.pn-head span'):null);
  btn.textContent=activeGroup&&!cur?activeGroup.querySelector('.pn-head span').textContent:(headEl?headEl.textContent:btn.textContent);
  btn.addEventListener('click',e=>{e.stopPropagation();wrap.classList.toggle('open')});
  document.addEventListener('click',e=>{if(!wrap.contains(e.target))wrap.classList.remove('open')});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')wrap.classList.remove('open')});
  document.addEventListener('kriimaar:lang',()=>{btn.textContent=headEl?headEl.textContent:btn.textContent});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initPageNav);else initPageNav();
const mq=window.matchMedia?matchMedia('(prefers-color-scheme:dark)'):null;
if(mq&&mq.addEventListener)mq.addEventListener('change',()=>{if(theme==='system')applyTheme()});
applyTheme();
window.KriimaarTheme={get:()=>theme,set:setTheme};

/* Gemeinsame Texte */
I18N.add({de:{
 'dat.github':'Es gelten die <a href="https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">Datenschutzbestimmungen von GitHub</a>.',
 'priv.host':'Die Seite wird über <a href="https://docs.github.com/de/pages" target="_blank" rel="noopener noreferrer">GitHub Pages</a> gehostet. Es gelten die <a href="https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">Datenschutzbestimmungen von GitHub</a>.',
 'AKZENTFARBE':'Akzentfarbe','ZURÜCKSETZEN':'Zurücksetzen'
},en:{
 'AKZENTFARBE':'Accent color','ZURÜCKSETZEN':'Reset',
 'Zuschauer timeouten andere Zuschauer über eine Kanalpunkte-Belohnung. Timeoutdauer, Schutz für VIPs und Moderatoren sowie alle Chat-Texte stellst du auf der Seite ein.':'Viewers time out other viewers via a channel point reward. Timeout duration, protection for VIPs and moderators and all chat texts can be set on the page.',
 'Verfügbar · 1 Action':'Available · 1 action',
 'Zuschauer timeouten andere per Kanalpunkte-Belohnung, mit Schutzregeln für VIPs und Mods':'Viewers time out others via a channel point reward, with protection rules for VIPs and mods',
 'Kanalpunkte + Streamer.bot':'Channel points + Streamer.bot',
 'Moderation':'Moderation',
 '⚙ EINSTELLUNGEN':'⚙ SETTINGS','EINSTELLUNGEN':'SETTINGS','SPRACHE':'LANGUAGE','DESIGN':'THEME',
 'SYSTEM':'SYSTEM','HELL':'LIGHT','DUNKEL':'DARK','DATEN':'DATA',
 'LOCALSTORAGE LÖSCHEN':'CLEAR LOCALSTORAGE','CACHE LEEREN':'CLEAR CACHE',
 'Alle lokal gespeicherten Daten löschen? Einstellungen und Textänderungen werden zurückgesetzt.':'Delete all locally saved data? Settings and text changes will be reset.',
 'Cache leeren und Seite neu laden?':'Clear cache and reload the page?',
 'Startseite':'Home','SEITE WECHSELN …':'SWITCH PAGE …','STARTSEITE / ÜBERSICHT':'HOME / OVERVIEW',
 'Feedback & Support':'Feedback & support','Fehler gefunden oder eine Action vermisst?':'Found a bug or missing an action?','Melde dich im Discord oder lege ein GitHub Issue an. Beides hilft, die Sammlung laufend zu verbessern.':'Reach out on Discord or open a GitHub issue. Both help improve this collection continuously.','IM DISCORD MELDEN ↗':'REPORT ON DISCORD ↗','GITHUB ISSUE ↗':'GITHUB ISSUE ↗','Rückmeldung':'Feedback','Fehler melden':'Report a bug','Danke! Die Rückmeldungsoptionen findest du unten.':'Thanks! You find the feedback options below.','Bild-Ansicht':'Image view','Großansicht schließen':'Close image view',
 'FUNKTION / 7TV EMOTE SYSTEM':'FEATURE / 7TV EMOTE SYSTEM','FUNKTION / RANDOM MEME':'FEATURE / RANDOM MEME',  'FUNKTION / SPOTIFY ACTIONS':'FEATURE / SPOTIFY ACTIONS','TOOL / SPOTIFY OVERLAY EDITOR':'TOOL / SPOTIFY OVERLAY EDITOR','FUNKTION / STREAM-MODERATION':'FEATURE / STREAM MODERATION','SEKTION / MOD/UNMOD':'SECTION / MOD/UNMOD','SEKTION / ABWEHRMODUS':'SECTION / SHIELD MODE','FUNKTION / FOLLOWAGE':'FEATURE / FOLLOWAGE','FUNKTION / PODIUM':'FEATURE / PODIUM','FUNKTION / KANALPUNKTE-TIMEOUT':'FEATURE / CHANNEL POINTS TIMEOUT','FUNKTION / WATCHTIME':'FEATURE / WATCHTIME','STARTSEITE / ÜBERSICHT':'HOME / OVERVIEW',
 'Datenschutz & Info':'Privacy & Info',
 'Webseite mit Hilfe von KI erstellt':'Website created with AI assistance','SCHLIEẞEN':'CLOSE','KI-Assistenz':'AI assistance',
 'Diese Webseite wird mit Hilfe von KI gebaut, gefüllt und erweitert, die Ideen und Umsetzungen der einzelnen Funktionen werden davon nicht beeinflusst. In der Erstellung der Funktionen wird KI maximal dazu genutzt, fertige Features und Codezeilen verständlich zu machen, so dass der geschriebene Code durch eingefügte Kommentare möglichst verständlich und nachvollziehbar ist, auch für Laien.':'This website is built, filled and expanded with the help of AI, but the ideas and implementations of the individual features are not influenced by it. When building the features, AI is used at most to make finished features and lines of code understandable, so that the written code, through inserted comments, stays as clear and traceable as possible — even for laypeople.',
 'Diese Webseite speichert keine persönlichen Daten. Einstellungen und Textänderungen werden ausschließlich lokal im Browser verarbeitet und zwischengespeichert. Durch eine Cache-Löschung werden diese Daten zurückgesetzt.':'This website does not store any personal data. Settings and text changes are processed and cached exclusively locally in the browser. Clearing the cache resets this data.',
 'Die Seite wird über GitHub Pages gehostet. Es gelten die Datenschutzbestimmungen von GitHub.':'The site is hosted via GitHub Pages. The privacy policies of GitHub apply.',
 '✓ KOPIERT':'✓ COPIED','KOPIEREN FEHLGESCHLAGEN':'COPY FAILED',
 'Video-Anleitung':'Video guide','Einrichtung im Video ansehen':'Watch the setup in the video',
 'VIDEO FOLGT IN KÜRZE':'VIDEO COMING SOON',
 'TWITCH':'TWITCH','STREAMER.BOT':'STREAMER.BOT','OBS ERFORDERLICH':'OBS REQUIRED','OBS MEDIENQUELLE':'OBS MEDIA SOURCE',
 'BROWSER SOURCE (OPTIONAL)':'BROWSER SOURCE (OPTIONAL)','7TV ACCOUNT':'7TV ACCOUNT','KANALPUNKTE':'CHANNEL POINTS',
 'SPOTIFY APP':'SPOTIFY APP','SPOTIFY PREMIUM':'SPOTIFY PREMIUM','KEIN OBS NÖTIG':'NO OBS REQUIRED','KANALPUNKTE-TIMEOUT':'CHANNEL POINTS TIMEOUT',
 'dat.github':'It applies the <a href="https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">privacy policies of GitHub</a>.',
 'priv.host':'The site is hosted via <a href="https://docs.github.com/de/pages" target="_blank" rel="noopener noreferrer">GitHub Pages</a>. It applies the <a href="https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">privacy policies of GitHub</a>.',
 'FUNKTION / PODIUM':'FEATURE / PODIUM','FUNKTION / FOLLOWAGE':'FEATURE / FOLLOWAGE','FUNKTION / STREAM-MODERATION':'FEATURE / STREAM MODERATION','FUNKTION / KANALPUNKTE-TIMEOUT':'FEATURE / CHANNEL POINTS TIMEOUT','FUNKTION / WATCHTIME':'FEATURE / WATCHTIME','FUNKTION / RANDOM MEME':'FEATURE / RANDOM MEME','FUNKTION / SPOTIFY ACTIONS':'FEATURE / SPOTIFY ACTIONS','FUNKTION / 7TV EMOTE SYSTEM':'FEATURE / 7TV EMOTE SYSTEM','STARTSEITE / ÜBERSICHT':'HOME / OVERVIEW','SEKTION / MOD/UNMOD':'SECTION / MOD/UNMOD','SEKTION / ABWEHRMODUS':'SECTION / SHIELD MODE',
 'Übersicht':'Overview','Timeout':'Timeout','Random Meme':'Random Meme','Watchtime':'Watchtime','Spotify':'Spotify','Fun':'Fun','Stream-Moderation':'Stream Moderation','Mod/Unmod':'Mod/Unmod','Abwehrmodus':'Shield mode','Statistik':'Statistics','nav.sm':'Stream Moderation','nav.fun':'Fun','nav.stats':'Statistics','nav.3rd':'3rd Party','nav.home':'Home','Stream-Übersicht':'Stream overview','nav.sm.overview':'Stream overview'
}});

/* Kopieren mit Rückmeldung */
window.copyWithFeedback=async function(button,text){
  const original=button.dataset.original||button.textContent;
  button.dataset.original=original;
  try{
    await navigator.clipboard.writeText(text);
    button.textContent=I18N.t('✓ KOPIERT');
    button.classList.remove('copy-error');button.classList.add('copied');
    setTimeout(()=>{button.textContent=original;button.classList.remove('copied')},1800);
  }catch(err){
    button.textContent=I18N.t('KOPIEREN FEHLGESCHLAGEN');
    button.classList.add('copy-error');
    setTimeout(()=>{button.textContent=original;button.classList.remove('copy-error')},2500);
  }
};

/* Modals + Seiten-Navigation */
document.addEventListener('click',e=>{
  if(e.target.id==='btn-privacy'){const m=document.getElementById('privacyModal');if(m)m.classList.add('show')}
  if(e.target.id==='btn-ai-info'){const m=document.getElementById('aiModal');if(m)m.classList.add('show')}
  if(e.target.dataset.close){const m=document.getElementById(e.target.dataset.close);if(m)m.classList.remove('show')}
});
/* Bild-Lightbox für Anleitungs-Screenshots */
(function(){
  const css=document.createElement('style');
  css.textContent='figure.shot img{cursor:zoom-in}.lb-overlay{display:none;position:fixed;inset:0;z-index:9999;background:#000e;padding:24px;align-items:center;justify-content:center;flex-direction:column;gap:12px}.lb-overlay.open{display:flex}.lb-overlay img{max-width:92vw;max-height:86vh;width:auto;height:auto;border:1px solid #26262c;background:#000}.lb-cap{max-width:80vw;color:#b6b6c0;font:12px "Courier New",monospace;text-align:center}.lb-close{position:absolute;top:14px;right:18px;width:42px;height:42px;border:1px solid #55555e;background:#0c0c0e;color:#fff;font-size:20px;line-height:1;cursor:pointer}.lb-close:hover{border-color:#a855f7;color:#d7c3ff}';
  document.head.appendChild(css);
  const ov=document.createElement('div');ov.className='lb-overlay';ov.setAttribute('role','dialog');
  const img=document.createElement('img');img.alt='';
  const cap=document.createElement('div');cap.className='lb-cap';
  const close=document.createElement('button');close.className='lb-close';close.type='button';close.textContent='✕';
  ov.appendChild(close);ov.appendChild(img);ov.appendChild(cap);
  function shut(){ov.classList.remove('open');img.src='';}
  close.addEventListener('click',e=>{e.stopPropagation();shut()});
  ov.addEventListener('click',shut);
  img.addEventListener('click',e=>e.stopPropagation());
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ov.classList.contains('open'))shut()});
  function attach(root){
    (root||document).querySelectorAll('figure.shot img').forEach(im=>{
      if(im.dataset.lb)return;im.dataset.lb='1';
      im.addEventListener('click',()=>{
        img.src=im.currentSrc||im.src;img.alt=im.alt||'';
        const f=im.closest('figure'),c=f&&f.querySelector('figcaption');
        cap.textContent=c?c.textContent:'';cap.style.display=c?'block':'none';
        ov.setAttribute('aria-label',I18N.t('Bild-Ansicht'));
        close.setAttribute('title',I18N.t('Großansicht schließen'));
        ov.classList.add('open');
      });
    });
  }
  function boot(){
    if(!document.body)return;
    document.body.appendChild(ov);
    attach(document);
  }
  window.KriimaarLightbox={attach};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();

/* Einstellungs-Menü */
const ksCss=document.createElement('style');
ksCss.textContent='.ks-wrap{position:relative;display:grid;place-items:center;min-width:112px;border-left:1px solid #26262c;align-self:stretch;cursor:pointer}.ks-toggle{display:grid;place-items:center;width:100%;height:100%;min-height:46px;border:0;background:transparent;color:#8b8b96;font:11px "Courier New",monospace;text-transform:uppercase;cursor:pointer;padding:0 13px}.ks-toggle:hover{background:#141419;color:#d7c3ff}.ks-panel{display:none;position:absolute;top:100%;right:0;width:300px;max-width:calc(100vw - 32px);padding:14px;background:#0c0c0e;border:1px solid #26262c;z-index:80;box-shadow:0 20px 60px #000c;text-align:left}.ks-wrap.open .ks-panel{display:block}.ks-title{margin:0 0 12px;color:#fff;font:700 12px "Courier New",monospace;letter-spacing:.12em;text-transform:uppercase}.ks-row{margin-bottom:12px}.ks-row:last-child{margin-bottom:0}.ks-label{margin-bottom:6px;color:#8b8b96;font:10px "Courier New",monospace;letter-spacing:.1em;text-transform:uppercase}.ks-btns{display:flex;flex-wrap:wrap;gap:6px}.ks-btns.ks-col{flex-direction:column;align-items:stretch}.ks-btn{min-height:30px;padding:0 9px;border:1px solid #33333a;background:transparent;color:#b6b6c0;font:10px "Courier New",monospace;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}.ks-btn:hover{border-color:#a855f7;color:#d7c3ff}.ks-btn.active{border-color:#a855f7;background:rgba(168,85,247,.12);color:#d7c3ff}.ks-btn.wide{text-align:left}.ks-color{width:46px;height:30px;padding:0 2px;border:1px solid #33333a;background:#0c0c0e;cursor:pointer}.ks-color::-webkit-color-swatch-wrapper{padding:2px}.ks-color::-webkit-color-swatch{border:0}.modal a{color:var(--p,#a855f7);text-decoration:underline}';
document.head.appendChild(ksCss);
let panel=null,btn=null,wrap=null;
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function btnGroup(items,activeValue,onPick){
  const g=el('div','ks-btns');
  items.forEach(it=>{
    const b=el('button','ks-btn'+(it.v===activeValue?' active':''),it.label);
    b.type='button';
    b.onclick=ev=>{ev.stopPropagation();onPick(it.v)};
    g.appendChild(b);
  });
  return g;
}
function renderPanel(){
  if(!panel)return;
  panel.innerHTML='';
  panel.appendChild(el('div','ks-title',I18N.t('EINSTELLUNGEN')));
  const rL=el('div','ks-row');rL.appendChild(el('div','ks-label',I18N.t('SPRACHE')));
  rL.appendChild(btnGroup([{v:'de',label:'DE'},{v:'en',label:'EN'}],I18N.lang,v=>I18N.set(v)));
  panel.appendChild(rL);
  const rT=el('div','ks-row');rT.appendChild(el('div','ks-label',I18N.t('DESIGN')));
  rT.appendChild(btnGroup([{v:'system',label:I18N.t('SYSTEM')},{v:'light',label:I18N.t('HELL')},{v:'dark',label:I18N.t('DUNKEL')},{v:'oled',label:'OLED'}],theme,v=>setTheme(v)));
  panel.appendChild(rT);
  const rC=el('div','ks-row');rC.appendChild(el('div','ks-label',I18N.t('AKZENTFARBE')));
  const gC=el('div','ks-btns');
  const cInp=el('input','ks-color');cInp.type='color';cInp.value=accent;cInp.setAttribute('aria-label',I18N.t('AKZENTFARBE'));
  cInp.oninput=()=>{accent=cInp.value;try{localStorage.setItem(ACCENT_KEY,accent)}catch(e){}applyAccent()};
  const cRes=el('button','ks-btn',I18N.t('ZURÜCKSETZEN'));cRes.type='button';
  cRes.onclick=()=>{accent=ACCENT_DEFAULT;try{localStorage.removeItem(ACCENT_KEY)}catch(e){}applyAccent();renderPanel()};
  gC.appendChild(cInp);gC.appendChild(cRes);rC.appendChild(gC);
  panel.appendChild(rC);
  const rD=el('div','ks-row');rD.appendChild(el('div','ks-label',I18N.t('DATEN')));
  const g=el('div','ks-btns ks-col');
  const bL=el('button','ks-btn wide',I18N.t('LOCALSTORAGE LÖSCHEN'));
  bL.type='button';
  bL.onclick=()=>{if(confirm(I18N.t('Alle lokal gespeicherten Daten löschen? Einstellungen und Textänderungen werden zurückgesetzt.'))){try{localStorage.clear()}catch(e){}location.reload()}};
  const bC=el('button','ks-btn wide',I18N.t('CACHE LEEREN'));
  bC.type='button';
  bC.onclick=async()=>{if(!confirm(I18N.t('Cache leeren und Seite neu laden?')))return;try{if(window.caches){const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)))}if(window.sessionStorage)sessionStorage.clear()}catch(e){}location.reload()};
  g.appendChild(bL);g.appendChild(bC);rD.appendChild(g);
  panel.appendChild(rD);
  const rS=el('div','ks-row');rS.appendChild(el('div','ks-label',I18N.t('Rückmeldung')));
  const bF=el('button','ks-btn wide',I18N.t('Fehler melden'));
  bF.type='button';
  bF.onclick=()=>{wrap.classList.remove('open');const s=document.getElementById('support');if(s){s.scrollIntoView({behavior:'smooth'})}else{window.open('https://github.com/Kriimaar/streamer.bot-functions/issues','_blank','noopener')}};
  rS.appendChild(bF);
  panel.appendChild(rS);
}
function inject(){
  const nav=document.querySelector('.nav,.sb-nav');
  if(!nav)return;
  const oldTheme=document.getElementById('theme');
  if(oldTheme)oldTheme.remove();
  if(document.getElementById('ks-btn'))return;
  wrap=el('span','ks-wrap');
  btn=el('button','ks-toggle',I18N.t('⚙ EINSTELLUNGEN'));
  btn.type='button';btn.id='ks-btn';
  panel=el('div','ks-panel');
  wrap.appendChild(btn);wrap.appendChild(panel);
  nav.appendChild(wrap);
  renderPanel();
  btn.addEventListener('click',e=>{e.stopPropagation();wrap.classList.toggle('open')});
  document.addEventListener('click',e=>{if(wrap&&!wrap.contains(e.target))wrap.classList.remove('open')});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&wrap)wrap.classList.remove('open')});
  document.addEventListener('kriimaar:lang',()=>{if(btn)btn.textContent=I18N.t('⚙ EINSTELLUNGEN')});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
})();
