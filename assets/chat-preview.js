/* Kriimaar · Twitch-Chat-vorschau (Simuliert das Twitch-Chat-Fenster, ersetzt die reine Textarea-Feldvorschau)
   API: KriimaarChatPreview.attach(textarea, opts)
     opts.update(text, state) -> {kind:'chat', line: {user, color, msg}}
     opts.update(text, state) -> {kind:'cmd',  line: {user, color, msg, badge}}
     opts.update(text, state) -> {kind:'system', msg}
   Render als Chat-Fenster im Twitch-Design: dunkler Hintergrund, User-Farbverteilung,
   Bot-Antworten in einem eigenen Kontext, Emoji-Zeichen normal sichtbar, %user%/Platzhalter optional. */
(function () {
  'use strict';

  /* Self-inject CSS (Twitch chat window look) */
  var css = document.createElement('style');
  css.textContent =
    '.cp-window{display:block;padding:12px 14px;background:#18181b;color:#efeff1;border:1px solid var(--l2);border-radius:6px;font-family:"Courier New",monospace;font-size:13px;line-height:1.55;min-height:120px;max-height:280px;overflow-y:auto;position:relative}' +
    '.cp-window .cp-head{font-size:10px;color:#adadb8;letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px;border-bottom:1px solid #2c2c33;padding-bottom:5px}' +
    '.cp-window .cp-line{margin:2px 0;word-break:break-word}' +
    '.cp-window .cp-user{font-weight:700;margin-right:6px}' +
    '.cp-window .cp-badge{display:inline-block;margin-right:5px;padding:1px 6px;font-size:9px;letter-spacing:.08em;text-transform:uppercase;vertical-align:1px;border-radius:3px;background:#2f2f37;color:#dedee3;border:1px solid #40404a}' +
    '.cp-window .cp-sys{color:#9d9da8;font-style:italic}';
  document.head.appendChild(css);

  function styleUser(idx) {
    /* Pseudotwitch Farbverteilung — Palette aus echten Twitch-Chatfarben */
    var colors = ['#ff7f50', '#1e90ff', '#00ff7f', '#9acd32', '#ff4500', '#daa520', '#5f9ea0', '#b22222'];
    return colors[idx % colors.length];
  }

  function buildLine(kind, cfg) {
    var div = document.createElement('div');
    div.className = 'cp-line';
    if (kind === 'system') {
      div.className += ' cp-sys';
      div.textContent = cfg.msg;
    } else {
      if (cfg.badge) {
        var b = document.createElement('span');
        b.className = 'cp-badge';
        b.textContent = cfg.badge;
        div.appendChild(b);
      }
      var u = document.createElement('span');
      u.className = 'cp-user';
      u.style.color = cfg.color || styleUser(0);
      u.textContent = cfg.user;
      div.appendChild(u);
      var m = document.createElement('span');
      m.className = 'cp-msg';
      m.textContent = cfg.msg;
      div.appendChild(m);
    }
    return div;
  }

  function attach(orig, opts) {
    if (!orig) return null;
    if (orig.dataset.cpReady) return orig._cp;
    orig.dataset.cpReady = '1';
    opts = opts || {};
    var preview = document.createElement('div');
    var windowEl = document.createElement('div');
    windowEl.className = 'cp-window';
    var head = document.createElement('div');
    head.className = 'cp-head';
    head.textContent = (opts.title || 'Chat-vorschau') + ' · Live';
    windowEl.appendChild(head);
    preview.appendChild(windowEl);
    orig.parentNode.insertBefore(preview, orig);
    orig.style.display = 'none';
    /* сохранить исходный state */
    var lastRender = '';
    function render() {
      var text = orig.value || '';
      if (text === lastRender) return;
      lastRender = text;
      windowEl.querySelectorAll('.cp-line').forEach(function (n) { n.remove(); });
      var st = opts.update ? opts.update(text, {}) : null;
      if (st == null) {
        windowEl.appendChild(buildLine('chat', { user: opts.user || 'Bot', color: opts.color || '#bf94ff', msg: text }));
      } else if (Array.isArray(st)) {
        st.forEach(function (it) {
          windowEl.appendChild(buildLine(it.kind || 'chat', it.line || it));
        });
      } else {
        windowEl.appendChild(buildLine(st.kind || 'chat', st.line || st));
      }
    }
    orig.addEventListener('input', render);
    document.addEventListener('kriimaar:lang', render);
    /* erste Renderung via orig.value direkt im Modul — нicht alle Textareas haben schon Inhalt */
    setTimeout(render, 0);
    var api = { render: render, el: windowEl };
    orig._cp = api;
    return api;
  }

  window.KriimaarChatPreview = { attach: attach };
})();
