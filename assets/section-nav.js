/* Kriimaar · Abschnitts-Navigation (Scroll-Spy)
   Seiten mit mehreren Funktionen auf einer Seite (z.B. Stream-Moderation) bekommen
   rechts eine schwebende Leiste: ein Punkt pro Funktion. Klick scrolt hin (smooth),
   beim Scrollen wandert der aktive Punkt automatisch mit (lila), die anderen bleiben grün.
   Der Name der aktuellen Funktion blendet kurz ein.
   Nutzung: <script src="../../assets/section-nav.js"></script> + Abschnitte mit
   <section class="shell section" data-sn-title="AdBreak"> … (oder id="#adbreak"). */
(function(){
'use strict';
var CSS = ''
+'.sn-nav{position:fixed;right:18px;top:50%;transform:translateY(-50%);z-index:60;display:flex;flex-direction:column;gap:10px;padding:14px 10px;background:rgba(12,12,14,.86);border:1px solid #26262c;border-radius:14px;backdrop-filter:blur(6px)}'
+'.sn-dot{position:relative;display:flex;align-items:center;gap:8px;width:22px;height:22px;padding:0;border:0;background:transparent;cursor:pointer;outline:none}'
+'.sn-dot::before{content:"";position:absolute;left:4px;top:50%;transform:translateY(-50%);width:9px;height:9px;border-radius:50%;background:transparent;border:2px solid var(--sp,#55e58f);transition:background .15s,border-color .15s,transform .15s}'
+'.sn-dot:hover::before{transform:translateY(-50%) scale(1.25)}'
+'.sn-dot.active::before{background:var(--p,#a855f7);border-color:var(--p,#a855f7);transform:translateY(-50%) scale(1.35)}'
+'.sn-label{position:absolute;right:100%;margin-right:10px;top:50%;transform:translateY(-50%);white-space:nowrap;color:#d7c3ff;background:#0c0c0e;border:1px solid #26262c;padding:3px 9px;border-radius:6px;font:11px "Courier New",monospace;letter-spacing:.08em;text-transform:uppercase;opacity:0;pointer-events:none;transition:opacity .2s}'
+'.sn-dot.active .sn-label,.sn-dot:hover .sn-label{opacity:1}'
+'.sn-dot.active .sn-label{color:#d7c3ff;border-color:var(--p,#a855f7)}'
+'.sn-nav.busy .sn-label{opacity:0}'
+'@media(max-width:1100px){.sn-nav{display:none}}';
function injectCss(){
  var s=document.createElement('style');s.textContent=CSS;document.head.appendChild(s);
}
function initSectionNav(){
  var targets=document.querySelectorAll('section[id]');
  if(!targets.length)return;
  var TITLE={ 'adbreak':'AdBreak','shoutouts':'Shoutouts','raid-shoutout':'Raid Shoutout','modunmod':'Mod/Unmod','abwehr':'Abwehrmodus','setgame':'Set Game','settitle':'Set Title','clip':'Clip erstellen' };
  var nav=document.createElement('div');nav.className='sn-nav';nav.setAttribute('role','navigation');
  var dots=[];
  Array.prototype.forEach.call(targets,function(sec){
    var id=sec.id;
    if(!TITLE[id])return;
    var d=document.createElement('button');d.type='button';d.className='sn-dot';
    d.setAttribute('aria-label',TITLE[id]);
    d.setAttribute('data-target',id);
    var l=document.createElement('span');l.className='sn-label';l.textContent=TITLE[id];
    d.appendChild(l);
    d.addEventListener('click',function(ev){
      ev.preventDefault();
      // Sofort und exklusiv: genau dieser Punkt bekommt lila, alle anderen nicht.
      setActive(id,true);
      nav.classList.add('busy');
      nav._locked=id;
      var el=document.getElementById(id);
      if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
      // Scroll-Observer übernimmt danach wieder; 'busy' hindert ihn nur während der Animation,
      // damit kein Zwischenstand flackert.
      clearTimeout(nav._bt);
      nav._bt=setTimeout(function(){
        nav.classList.remove('busy');
        delete nav._locked;
        onScroll();
      },900);
      if(history.replaceState)history.replaceState(null,'','#'+id);
    });
    nav.appendChild(d);dots.push({id:id,dot:d,el:sec});
  });
  if(!dots.length)return;
  document.body.appendChild(nav);
  // Scroll-Spy: der Abschnitt, der am oberen Rand am nächsten vorkommt, ist aktiv.
  var current=null;
  var settlementFrames=0, settling=false;
  function setActive(id,fromClick){
    if(current!==id){
      current=id;
      dots.forEach(function(o){o.dot.classList.toggle('active',o.id===id)});
      if(!fromClick){
        var d=dots.filter(function(o){return o.id===id})[0];
        if(d){
          // Namen kurz einblenden: Label des aktiven Punkts kurz sichtbar, dann wieder aus.
          d.dot.classList.add('flash');
          clearTimeout(d.dot._ft);
          d.dot._ft=setTimeout(function(){d.dot.classList.remove('flash')},1400);
        }
      }
    }
  }
  function onScroll(){
    if(nav.classList.contains('busy'))return;
    // Falls ein Klick-Scroll noch beschäftigt ist (Timeout schießt über die Animation hinaus
    // oder der Browser braucht länger): der gesperrte Abschnitt bleibt aktiv.
    if(nav._locked)return;
    var best=null,bestY=Infinity;
    var ref=window.innerHeight*0.35;
    dots.forEach(function(o){
      var r=o.el.getBoundingClientRect();
      var y=Math.abs(r.top-ref);
      if(r.top<=ref&&r.bottom>window.innerHeight*0.10){ if(y<bestY){bestY=y;best=o;} }
    });
    if(!best){
      // oberhalb des ersten Abschnitts: ersten Punkt deaktiviert lassen
      best=dots[0];
    }
    setActive(best.id,false);
  }
  var ticking=false;
  window.addEventListener('scroll',function(){
    if(ticking)return;ticking=true;
    requestAnimationFrame(function(){onScroll();ticking=false});
  },{passive:true});
  function markCurrent(){
    // Beim Laden und nach Klick-Scroll: exakt den Abschnitt bestimmen, auf dem wir stehen.
    // Beim Absetzen eines Klicks ist das EXPLIZIT der geklickte Abschnitt (setActive(id,true))
    // und alle anderen Punkte verlieren lila. Nach normalem Scrollen entscheidet onScroll().
    onScroll();
  }
  markCurrent();
  var d0=dots.filter(function(o){return o.id===(location.hash||'').slice(1)})[0];
  if(d0)setActive(d0.id,true);
}
function boot(){
  if(!document.body)return;
  injectCss();initSectionNav();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
