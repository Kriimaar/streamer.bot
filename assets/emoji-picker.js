/* Kriimaar · Emoji- & 7TV-Picker für editierbare Chat-Nachricht-Felder */
/* Bereitgestellt durch assets/app.js oder eigenes <script>. API:
   KriimaarEmojiPicker.attach(inputOrTextarea)  → Picker-Button neben dem Feld
   Der Picker bietet Unicode-Emoji-Kategorien (wie im Spotify-Overlay-Editor)
   plus 7TV-Tab: Emote-Set per URL laden (https://7tv.io/v3), suchen, einfügen.
*/
(function(){
'use strict';

var CSS=''
+'.ep-wrap{display:flex;gap:8px;align-items:stretch;position:relative}'
+'.ep-field{flex:1;min-width:0}'
+'.ep-btn{border:1px solid var(--l2,#a8a8b3);background:var(--s2,#f0f0f3);color:var(--t,#151519);width:38px;min-height:38px;display:grid;place-items:center;cursor:pointer;font-size:16px;line-height:1;flex-shrink:0;position:relative}'
+'.ep-btn:hover{border-color:var(--p,#a855f7)}'
+'.ep-pop{position:absolute;z-index:260;background:var(--s,#121216);border:1px solid var(--l2,#a8a8b3);padding:10px;width:360px;max-width:92vw;box-shadow:0 12px 40px #0009;display:none;right:0;top:calc(100% + 6px)}'
+'.ep-pop.open{display:block}'
+'.ep-tabs{display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap}'
+'.ep-tab{background:none;border:1px solid transparent;color:var(--m,#656570);padding:4px 8px;border-radius:4px;cursor:pointer;font:600 11px "Courier New",monospace}'
+'.ep-tab:hover{border-color:var(--l2,#a8a8b3);color:var(--t,#151519)}'
+'.ep-tab.active{background:var(--s2,#f0f0f3);border-color:var(--l2,#a8a8b3);color:var(--t,#151519)}'
+'.ep-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:2px;max-height:180px;overflow-y:auto}'
+'.ep-em{background:none;border:none;font-size:20px;cursor:pointer;border-radius:4px;padding:4px;line-height:1;font-family:"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif}'
+'.ep-em:hover{background:var(--s2,#f0f0f3)}'
+'.ep-7tv{display:none;flex-direction:column;gap:3px}'
+'.ep-7tv.active{display:flex}'
+'.ep-7tv-row{display:flex;gap:5px;align-items:center}'
+'.ep-7tv-url{flex:1;min-width:0;background:var(--bg,#0b0b0e);border:1px solid var(--l2,#a8a8b3);border-radius:4px;color:var(--t,#151519);padding:5px 7px;font:11px "Courier New",monospace;outline:none}'
+'.ep-7tv-url:focus{border-color:var(--sp,#55e58f)}'
+'.ep-7tv-load{background:var(--sp,#55e58f);border:none;color:#000;padding:5px 10px;border-radius:4px;cursor:pointer;font:700 11px "Courier New",monospace;white-space:nowrap}'
+'.ep-7tv-status{font:10px "Courier New",monospace;color:var(--m,#656570);margin:2px 0}'
+'.ep-7tv-search{width:100%;background:var(--bg,#0b0b0e);border:1px solid var(--l2,#a8a8b3);border-radius:4px;color:var(--t,#151519);padding:5px 8px;font:11px "Courier New",monospace;outline:none;margin-bottom:4px;box-sizing:border-box}'
+'.ep-7tv-grid{display:flex;flex-wrap:wrap;gap:2px;height:210px;max-height:210px;overflow-y:auto;overflow-x:hidden}'
+'.ep-7tv-em{background:var(--s2,#f0f0f3);border:1px solid transparent;border-radius:4px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:2px;box-sizing:border-box;width:32px;height:32px;flex-shrink:0}'
+'.ep-7tv-em:hover{border-color:var(--sp,#55e58f)}'
+'.ep-7tv-em img{display:block;object-fit:contain;width:26px;height:26px}'
+':root{color-scheme:inherit}';

var EMOJI_CATS={
"\u{1F60A} Smileys":["\u{1F600}","\u{1F603}","\u{1F604}","\u{1F601}","\u{1F606}","\u{1F605}","\u{1F923}","\u{1F602}","\u{1F642}","\u{1F60A}","\u{1F607}","\u{1F970}","\u{1F60D}","\u{1F618}","\u{1F617}","\u{1F619}","\u{1F61A}","\u{1F643}","\u{1F609}","\u{1F60C}","\u{1F61B}","\u{1F61C}","\u{1F92A}","\u{1F61D}","\u{1F911}","\u{1F917}","\u{1F92D}","\u{1F92B}","\u{1F914}","\u{1F910}","\u{1F974}","\u{1F636}","\u{1F611}","\u{1F62C}","\u{1F644}","\u{1F62F}","\u{1F626}","\u{1F627}","\u{1F62E}","\u{1F632}","\u{1F635}","\u{1F971}","\u{1F634}","\u{1F924}","\u{1F62A}","\u{1F635}\u{200D}\u{1F4AB}","\u{1F92F}","\u{1F920}","\u{1F973}","\u{1F60E}","\u{1F913}","\u{1F9D0}","\u{1F615}","\u{1F61F}","\u{1F641}","\u{2639}\u{FE0F}","\u{1F623}","\u{1F616}","\u{1F62B}","\u{1F629}","\u{1F97A}","\u{1F622}","\u{1F62D}","\u{1F624}","\u{1F620}","\u{1F621}","\u{1F92C}","\u{1F608}","\u{1F47F}","\u{1F480}","\u{2620}\u{FE0F}","\u{1F4A9}"],
"\u{1F44B} Gesten":["\u{1F44D}","\u{1F44E}","\u{1F44C}","\u{1F90C}","\u{1F90F}","\u{270C}\u{FE0F}","\u{1F91E}","\u{1F91F}","\u{1F918}","\u{1F919}","\u{1F448}","\u{1F449}","\u{1F446}","\u{1F595}","\u{1F447}","\u{261D}\u{FE0F}","\u{1F44B}","\u{1F91A}","\u{1F590}\u{FE0F}","\u{270B}","\u{1F596}","\u{1F44F}","\u{1F64C}","\u{1F932}","\u{1F91D}","\u{1F64F}","\u{270D}\u{FE0F}","\u{1F485}","\u{1F933}","\u{1F4AA}"],
"\u{1F3B5} Musik":["\u{1F3B5}","\u{1F3B6}","\u{1F3A4}","\u{1F3A7}","\u{1F3BC}","\u{1F3B9}","\u{1F941}","\u{1F3B7}","\u{1F3B8}","\u{1F3BA}","\u{1F3BB}","\u{1F4E2}","\u{1F50A}","\u{1F509}","\u{1F508}","\u{1F514}","\u{1F515}","\u{1F50E}","\u{1F50C}","\u{1F393}","\u{1F392}","\u{1F3B0}","\u{1F3AF}"],
"\u{1F389} Symbole":["\u{1F389}","\u{1F389}","\u{1F38A}","\u{1F3C6}","\u{1F947}","\u{1F48E}","\u{1F451}","\u{1F3AF}","\u{1F511}","\u{2705}","\u{274C}","\u{26A0}\u{FE0F}","\u{1F4AF}","\u{1F525}","\u{2B50}","\u{2728}","\u{26A1}","\u{1F308}","\u{2744}\u{FE0F}","\u{1F4AB}"],
"\u{1F436} Tiere":["\u{1F436}","\u{1F431}","\u{1F42D}","\u{1F430}","\u{1F98A}","\u{1F43B}","\u{1F43C}","\u{1F428}","\u{1F42F}","\u{1F981}","\u{1F42E}","\u{1F437}","\u{1F438}","\u{1F435}","\u{1F648}","\u{1F649}","\u{1F64A}","\u{1F414}","\u{1F427}","\u{1F426}","\u{1F985}","\u{1F986}","\u{1F4A1}"]
};
/* Erweiterte Kategorien */
EMOJI_CATS["\u{1F389} Symbole"]=["\u{2764}\u{FE0F}","\u{1F9E1}","\u{1F49B}","\u{1F49A}","\u{1F499}","\u{1F49C}","\u{1F5A4}","\u{1F90D}","\u{1F494}","\u{1F495}","\u{1F496}","\u{1F497}","\u{1F493}","\u{1F49E}","\u{1F49F}","\u{1F389}","\u{1F38A}","\u{1F3C6}","\u{1F947}","\u{1F48E}","\u{1F451}","\u{1F3AF}","\u{1F511}","\u{2705}","\u{274C}","\u{26A0}\u{FE0F}","\u{1F4AF}","\u{1F525}","\u{2B50}","\u{2728}","\u{26A1}","\u{1F308}","\u{2744}\u{FE0F}","\u{1F300}","\u{1F4AB}","\u{1F37F}"];
EMOJI_CATS["\u{1F436} Tiere"]=["\u{1F436}","\u{1F431}","\u{1F42D}","\u{1F430}","\u{1F98A}","\u{1F43B}","\u{1F43C}","\u{1F428}","\u{1F42F}","\u{1F981}","\u{1F42E}","\u{1F437}","\u{1F438}","\u{1F435}","\u{1F648}","\u{1F649}","\u{1F64A}","\u{1F414}","\u{1F427}","\u{1F426}","\u{1F986}","\u{1F42B}","\u{1F434}","\u{1F984}","\u{1F41D}","\u{1F41B}","\u{1F98B}","\u{1F40C}","\u{1F41C}","\u{1F41E}","\u{1F47B}","\u{1F43A}","\u{1F408}","\u{1F415}","\u{1F429}","\u{1F407}"];

function styleInject(){
  if(document.getElementById('kriimaar-ep-style'))return;
  var st=document.createElement('style');st.id='kriimaar-ep-style';st.textContent=CSS;
  document.head.appendChild(st);
}

function keyFor(el){
  return 'kriimaar-ep-7tv-url';
}

function buildPop(wrap, field){
  var pop=document.createElement('div');pop.className='ep-pop';
  var tabs=document.createElement('div');tabs.className='ep-tabs';
  var catNames=Object.keys(EMOJI_CATS);
  var activeCat=catNames[0];
  var emojiPanel=document.createElement('div');
  var grid=document.createElement('div');grid.className='ep-grid';
  emojiPanel.appendChild(grid);
  var tv7=document.createElement('div');tv7.className='ep-7tv';

  function renderGrid(){
    grid.innerHTML='';
    (EMOJI_CATS[activeCat]||[]).forEach(function(em){
      var b=document.createElement('button');b.type='button';b.className='ep-em';b.textContent=em;
      b.onclick=function(e){e.stopPropagation();insert(em);};
      grid.appendChild(b);
    });
  }

  catNames.forEach(function(c){
    var b=document.createElement('button');b.type='button';
    b.className='ep-tab'+(c===activeCat?' active':'');
    b.textContent=c.split(' ')[0];b.title=c.split(' ').slice(1).join(' ');
    b.onclick=function(e){e.stopPropagation();
      activeCat=c;emojiPanel.style.display='';tv7.classList.remove('active');
      tabs.querySelectorAll('.ep-tab').forEach(function(x){x.classList.remove('active')});
      b.classList.add('active');renderGrid();};
    tabs.appendChild(b);
  });
  var tv7Tab=document.createElement('button');tv7Tab.type='button';
  tv7Tab.className='ep-tab';tv7Tab.textContent='7TV';tv7Tab.title='7TV Emote-Set laden';
  tv7Tab.onclick=function(e){e.stopPropagation();
    tabs.querySelectorAll('.ep-tab').forEach(function(x){x.classList.remove('active')});
    tv7Tab.classList.add('active');
    emojiPanel.style.display='none';tv7.classList.add('active');
    try{var saved=localStorage.getItem('kriimaar-ep-7tv-url');if(saved)tv7url.value=saved;}catch(e2){}
  };
  tabs.appendChild(tv7Tab);
  pop.appendChild(tabs);pop.appendChild(emojiPanel);pop.appendChild(tv7);

  /* 7TV panel */
  var row=document.createElement('div');row.className='ep-7tv-row';
  var tv7url=document.createElement('input');tv7url.className='ep-7tv-url';
  tv7url.placeholder='7TV Emote-Set URL...';tv7url.type='text';
  tv7url.onclick=function(e){e.stopPropagation();};
  tv7url.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();loadBtn.click();}};
  var loadBtn=document.createElement('button');loadBtn.type='button';loadBtn.className='ep-7tv-load';loadBtn.textContent='Laden';
  row.appendChild(tv7url);row.appendChild(loadBtn);
  var status=document.createElement('div');status.className='ep-7tv-status';status.textContent='Emote-Set URL eingeben und Laden klicken.';
  var search=document.createElement('input');search.className='ep-7tv-search';search.placeholder='Emote suchen...';search.type='text';
  search.onclick=function(e){e.stopPropagation();};
  var tvGrid=document.createElement('div');tvGrid.className='ep-7tv-grid';
  tv7.appendChild(row);tv7.appendChild(status);tv7.appendChild(search);tv7.appendChild(tvGrid);

  var all=[];
  function renderTv(filter){
    tvGrid.innerHTML='';
    var list=filter?all.filter(function(em){return em.name.toLowerCase().indexOf(filter.toLowerCase())!==-1;}):all;
    list.forEach(function(em){
      var b=document.createElement('button');b.type='button';b.className='ep-7tv-em';b.title=em.name;
      var img=document.createElement('img');img.src=em.src;img.alt=em.name;img.loading='lazy';
      img.onerror=function(){
        if(img.src.indexOf('.avif')!==-1)img.src=em.src.replace(/2x\.avif$/,'1x.avif').replace(/1x\.avif$/,'2x.webp');
        else if(img.src.indexOf('.webp')!==-1)img.src=em.src.replace(/2x\.webp$/,'1x.webp').replace(/1x\.webp$/,'');
      };
      b.appendChild(img);
      b.onclick=function(ev){ev.stopPropagation();insert(em.name);};
      tvGrid.appendChild(b);
    });
  }
  search.addEventListener('input',function(){renderTv(search.value);});
  loadBtn.onclick=function(e){
    e.stopPropagation();
    var raw=tv7url.value.trim();
    if(!raw){status.textContent='Bitte eine URL eingeben.';return;}
    var setId=raw.replace(/.*emote-sets\//,'').replace(/[^a-zA-Z0-9]/g,'');
    if(!setId){status.textContent='Ungültige URL.';return;}
    status.textContent='Lade Emotes...';tvGrid.innerHTML='';all=[];loadBtn.disabled=true;
    fetch('https://7tv.io/v3/emote-sets/'+setId)
      .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
      .then(function(data){
        var emotes=data.emotes||[];
        status.textContent=(data.name||setId)+': '+emotes.length+' Emotes';
        try{localStorage.setItem('kriimaar-ep-7tv-url',raw);}catch(ex){}
        emotes.forEach(function(em){
          var edata=em.data||{},host=edata.host||{},files=host.files||[];
          var file=files.find(function(f){return f.name==='2x.webp';})||
                   files.find(function(f){return f.name==='1x.webp';})||
                   files.find(function(f){return f.name==='2x.avif';})||
                   files.find(function(f){return f.name==='1x.avif';});
          if(!file)return;
          all.push({name:em.name,src:'https:'+host.url+'/'+file.name});
        });
        renderTv(search.value);
        if(!all.length)status.textContent='Keine Emotes gefunden.';
      })
      .catch(function(err){status.textContent='Fehler: '+err.message;})
      .finally(function(){loadBtn.disabled=false;});
  };

  function insert(em){
    var cur=field.value||'';
    var pos=field.selectionStart!==undefined&&field.selectionStart!==null?field.selectionStart:cur.length;
    var before=cur.substring(0,pos),after=cur.substring(field.selectionEnd||pos);
    field.value=before+em+after;
    field.dispatchEvent(new Event('input',{bubbles:true}));
    var np=before.length+em.length;
    try{field.focus();field.setSelectionRange(np,np);}catch(e){}
    field.dispatchEvent(new Event('change',{bubbles:true}));
  }

  renderGrid();
  try{
    var saved=localStorage.getItem('kriimaar-ep-7tv-url');
    if(saved){tv7url.value=saved;status.textContent='Letzte URL wiederhergestellt. Laden klicken.';}
  }catch(ex){}

  pop.addEventListener('click',function(e){e.stopPropagation();});
  return {pop:pop,toggle:function(){
    var open=pop.classList.contains('open');
    document.querySelectorAll('.ep-pop.open').forEach(function(p){if(p!==pop)p.classList.remove('open');});
    pop.classList.toggle('open',!open);
  }};
}

function attach(field){
  if(!field||field.dataset.epReady)return;
  field.dataset.epReady='1';
  styleInject();
  var wrap=document.createElement('span');wrap.className='ep-wrap';
  field.parentNode.insertBefore(wrap,field);
  wrap.appendChild(field);
  field.classList.add('ep-field');
  var btn=document.createElement('button');btn.type='button';btn.className='ep-btn';
  btn.textContent='\u{1F60A}';btn.title='Emoji & 7TV';
  var ui=buildPop(wrap,field);
  btn.appendChild(ui.pop);
  wrap.appendChild(btn);
  btn.addEventListener('click',function(e){e.stopPropagation();ui.toggle();});
}

/* Globale API */
window.KriimaarEmojiPicker={attach:attach,
  attachAll:function(root){(root||document).querySelectorAll('[data-emoji-picker]').forEach(function(f){attach(f)});}
};

function boot(){
  if(!document.body)return;
  /* Konvention: data-emoji-picker am <input>/<textarea> setzt den Picker.
     Zusätzlich wirken bekannte Chat-Message-Editor-IDs automatisch. */
  var auto=[
    'faText','wtCmdMsg','wtLbHeader','wtLbEmpty','msgEmpty','msgNotFound','msgMod','msgVip','msgDone'
  ];
  auto.forEach(function(id){var f=document.getElementById(id);if(f)attach(f);});
  window.KriimaarEmojiPicker.attachAll(document);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();

document.addEventListener('click',function(e){
  if(!e.target.closest('.ep-btn')&&!e.target.closest('.ep-pop')){
    document.querySelectorAll('.ep-pop.open').forEach(function(p){p.classList.remove('open');});
  }
});
})();
