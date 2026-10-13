/* Kriimaar · C#-Code-Editor
   Ersetzt schlichte Textfelder für C#-Code durch editierbare Editoren mit
   Syntax-Highlighting, passend zum Seitendesign (dunkle Fläche, Courier, Akzente).
   Auch Chat-Nachrichten im Code sind so direkt editierbar.

   Das Editorfenster hat eine feste Maximalhöhe: längerer Code läuft in einem
   internen Scrollbalken, die Seite selbst bleibt kurz. Standard 520px, über
   data-cse-max am <textarea> individuell einstellbar (Pixel).

   Nutzung:
     var ed = KriimaarCodeEditor.create(ta);   // Editor an ein <textarea> hängen
     ed.set(code); ed.get();                   // Code setzen/lesen
   Der Editor bleibt ein echtes <textarea>-Element: Kopierbutton, Fokus und alles
   Bestehende laufen unangetastet. Das Highlight liegt als <pre> darunter und wird
   beim Scrollen exakt mitgeschoben, damit jede Textstelle unter dem Cursor liegt. */
(function(){
'use strict';
var CSS=''
+'.cse-wrap{position:relative;background:var(--s2);border:1px solid var(--l2);margin-top:10px;height:520px;overflow:hidden}'
+'.cse-wrap:focus-within{border-color:var(--p,#a855f7)}'
+'.cse-pre,.cse-ta{margin:0;font-family:"Courier New",monospace;font-size:12px;line-height:1.6;white-space:pre;word-break:normal;overflow-wrap:normal;font-weight:400;tab-size:4}'
+'.cse-pre{position:absolute;top:12px;left:14px;min-width:100%;color:var(--t);pointer-events:none;overflow:hidden;will-change:transform}'
+'.cse-ta{position:absolute;inset:0;width:100%;height:100%;display:block;border:0;outline:none;background:transparent;color:transparent;caret-color:var(--t);resize:none;overflow:auto;white-space:pre;overflow-x:auto}'
+'.cse-ta::selection{background:#a855f755;color:transparent}'
+'.cse-pre code{font:inherit;white-space:pre;display:block;min-width:max-content;padding-right:40px}'
+'/* Scroll-Buttons oben rechts im Editorfenster */'
+'.cse-scrollbtns{position:absolute;top:6px;right:8px;z-index:3;display:flex;gap:4px;opacity:0;pointer-events:none;transition:opacity .15s}'
+'.cse-wrap:hover .cse-scrollbtns,.cse-scrollbtns.show{opacity:1;pointer-events:auto}'
+'.cse-scrollbtns button{width:24px;height:24px;padding:0;display:grid;place-items:center;border:1px solid var(--l2);background:#0c0c0ecc;color:var(--m);font:12px "Courier New",monospace;cursor:pointer;line-height:1}'
+'.cse-scrollbtns button:hover{color:var(--p,#a855f7);border-color:var(--p,#a855f7)}'
+'.cse-scrollbtns button[disabled]{opacity:.35;cursor:default;color:var(--m)}'
+'.cse-status{position:absolute;bottom:4px;right:10px;z-index:2;color:var(--m);font:9px "Courier New",monospace;letter-spacing:.08em;opacity:0;transition:opacity .15s;pointer-events:none}'
+'.cse-wrap:hover .cse-status{opacity:.85}'
+'.cse-k{color:#d7c3ff}.cse-t{color:#55e58f}.cse-s{color:#ffb86b}.cse-c{color:var(--m,#9898a3);font-style:italic}'
+'.cse-n{color:#a855f7}.cse-f{color:#8ad4ff}.cse-p{color:#ed6565}/* Platzhalter %foo% */';
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;');}
function highlight(code){
  // Reihenfolge: Kommentar → String (inkl. Verbatim @"…") → ${…} → %Platzhalter%
  // → Zahl → Wort → Whitespace → Rest. Wichtig: @".strings" fressen alles bis zum
  // nächsten schließenden Anführungszeichen, damit C#-Regex-Strings nicht brechen.
  var re=/\/\/[^\n]*|\/\*[\s\S]*?\*\/|@"(?:[^"]|"")*"|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|\$\{[^}]*\}|%[A-Za-z0-9_]+%|0[xX][0-9a-fA-F]+|\d+(?:\.\d+)?[fFdDmMuUlL]*|[A-Za-z_][A-Za-z0-9_]*|\s+|./g;
  var KEYWORDS=/^(public|private|protected|class|bool|byte|char|decimal|double|float|string|int|long|object|short|uint|ulong|ushort|var|dynamic|void|return|if|else|new|out|ref|null|true|false|using|namespace|try|catch|finally|for|foreach|while|switch|case|default|break|continue|this|static|const|readonly|get|set|in|do|is|as|typeof|nameof|throw|base|override|virtual|abstract|interface|enum|struct|partial|async|await)$/;
  var TYPES=/^(CPHInline|CPH|Int32|String|Dictionary|List|HttpWebRequest|HttpWebResponse|WebClient|HttpClient|Uri|Console|Exception|DateTime|Convert|JsonConvert|JObject|JArray|Encoding|StringBuilder)/;
  var m,tok=[];
  while((m=re.exec(code))!==null){
    var t=m[0];
    if(!t.length){re.lastIndex++;continue;}
    var c0=t.charAt(0);
    if(c0==='/'&&(t.length>1&&(t.charAt(1)==='/'||t.charAt(1)==='*'))){tok.push(['c',t]);continue;}
    if(c0==='"'||c0==="'"){tok.push(['s',t]);continue;}
    if(c0==='%'){tok.push(['p',t]);continue;}
    if(c0==='$'){tok.push(['t',t]);continue;}
    if(c0>='0'&&c0<='9'){tok.push(['n',t]);continue;}
    if(/^[A-Za-z_]/.test(t)){
      if(KEYWORDS.test(t))tok.push(['k',t]);
      else if(TYPES.test(t))tok.push(['f',t]);
      else tok.push(['',t]);
      continue;
    }
    tok.push(['',t]);
  }
  var html='';
  for(var j=0;j<tok.length;j++){
    var c=tok[j][0],x=tok[j][1];
    if(c)html+='<span class="cse-'+c+'">'+esc(x)+'</span>';
    else html+=esc(x);
  }
  return html+'\n';
}
function create(ta){
  if(!ta||ta._cse)return ta._cse;
  if(!document.getElementById('cse-style')){var st=document.createElement('style');st.id='cse-style';st.textContent=CSS;document.head.appendChild(st);}
  var wrap=document.createElement('div');wrap.className='cse-wrap';
  var max=parseInt(ta.getAttribute('data-cse-max'),10);
  if(max>120)wrap.style.height=max+'px';
  ta.parentNode.insertBefore(wrap,ta);
  var pre=document.createElement('pre');pre.className='cse-pre';
  var codeEl=document.createElement('code');pre.appendChild(codeEl);
  wrap.appendChild(pre);wrap.appendChild(ta);
  ta.classList.remove('fa-preview');ta.classList.add('cse-ta');
  ta.removeAttribute('style');
  // Scroll-Buttons: hoch/runter, Seitenansicht lila bei aktivem Klick
  var btns=document.createElement('div');btns.className='cse-scrollbtns';
  var up=document.createElement('button');up.type='button';up.textContent='▲';up.title='Nach oben';
  var down=document.createElement('button');down.type='button';down.textContent='▼';down.title='Nach unten';
  btns.appendChild(up);btns.appendChild(down);wrap.appendChild(btns);
  var status=document.createElement('div');status.className='cse-status';wrap.appendChild(status);
  function step(delta,animated){
    var to=Math.max(0,Math.min(ta.scrollHeight-ta.clientHeight,ta.scrollTop+delta));
    maybeUpdateButtons();
    if(animated&&typeof ta.scrollTo==='function'){ta.scrollTo({top:to,behavior:'smooth'});}
    else{ta.scrollTop=to;}
  }
  function updateButtons(){
    var max=ta.scrollHeight-ta.clientHeight;
    var hasScroll=max>4;
    btns.classList.toggle('show',hasScroll);
    up.disabled=!hasScroll||ta.scrollTop<=2;
    down.disabled=!hasScroll||ta.scrollTop>=max-2;
    if(hasScroll){status.textContent=Math.round((ta.scrollTop/max)*100)+'%';}
    else status.textContent='';
  }
  var maybeUpdateButtons=function(){requestAnimationFrame(updateButtons)};
  function sync(){
    codeEl.innerHTML=highlight(ta.value);
    shift();maybeUpdateButtons();
  }
  function shift(){
    pre.style.transform='translate('+(-ta.scrollLeft)+'px,'+(-ta.scrollTop)+'px)';
  }
  up.addEventListener('click',function(){step(-ta.clientHeight*0.9,true)});
  down.addEventListener('click',function(){step(ta.clientHeight*0.9,true)});
  ta.addEventListener('input',sync);
  ta.addEventListener('scroll',shift);
  var ed={el:ta,pre:pre,sync:sync,
    set:function(c){if(c!==undefined&&c!==null){ta.value=c;}sync();},
    get:function(){return ta.value;}
  };
  ta._cse=ed;
  ed.set(ta.value||'');
  return ed;
}
window.KriimaarCodeEditor={create:create};
})();
