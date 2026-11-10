/* Not Rape, By Law. Global behaviour: language, theme, text size, search, glossary tips, read-aloud. */
(function () {
  'use strict';
  var D = document, H = D.documentElement;
  var hooks = [];
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r) { return (r || D).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function lang() { return H.dataset.ui === 'hi' ? 'hi' : 'en'; }
  function T(x) { return (x && typeof x === 'object') ? (x[lang()] || x.en || '') : (x == null ? '' : x); }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  var EX = window.EX = { lang: lang, T: T, esc: esc, $: $, $$: $$, reduce: reduce,
    onLang: function (fn) { hooks.push(fn); },
    toast: function (msg) {
      var t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('show');
      clearTimeout(EX._tt); EX._tt = setTimeout(function () { t.classList.remove('show'); }, 1900);
    } };

  /* ---------- language ---------- */
  function setLang(l) {
    H.dataset.ui = l; H.lang = l; store('exhibit-lang', l);
    var be = $('#btn-en'), bh = $('#btn-hi');
    if (be) { be.classList.toggle('on', l === 'en'); be.setAttribute('aria-pressed', l === 'en'); }
    if (bh) { bh.classList.toggle('on', l === 'hi'); bh.setAttribute('aria-pressed', l === 'hi'); }
    hooks.forEach(function (fn) { try { fn(l); } catch (e) { console.error(e); } });
  }
  EX.setLang = setLang;

  /* ---------- theme, text size ---------- */
  function setTheme(t) { H.dataset.theme = t; store('exhibit-theme', t); }
  function fsNow() { var v = parseInt(getComputedStyle(H).getPropertyValue('--fs'), 10); return isNaN(v) ? 100 : v; }
  function setFs(v) { v = Math.max(90, Math.min(130, v)); H.style.setProperty('--fs', v + '%'); store('exhibit-fs', v); }

  D.addEventListener('DOMContentLoaded', function () {
    /* language buttons */
    var be = $('#btn-en'), bh = $('#btn-hi');
    if (be) be.addEventListener('click', function () { setLang('en'); });
    if (bh) bh.addEventListener('click', function () { setLang('hi'); });
    var bt = $('#b-theme'); if (bt) bt.addEventListener('click', function () { setTheme(H.dataset.theme === 'dark' ? 'light' : 'dark'); });
    var fm = $('#b-fsm'), fp = $('#b-fsp');
    if (fm) fm.addEventListener('click', function () { setFs(fsNow() - 10); });
    if (fp) fp.addEventListener('click', function () { setFs(fsNow() + 10); });

    /* menus */
    var hdr = $('#hdr'), burger = $('#b-burger');
    if (burger) burger.addEventListener('click', function () { var o = hdr.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
    $$('[data-dd]').forEach(function (dd) {
      var b = $('.dd-b', dd);
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = dd.classList.contains('open');
        $$('[data-dd].open').forEach(function (x) { x.classList.remove('open'); $('.dd-b', x).setAttribute('aria-expanded', 'false'); });
        if (!open) { dd.classList.add('open'); b.setAttribute('aria-expanded', 'true'); }
      });
    });
    D.addEventListener('click', function (e) {
      if (!e.target.closest('[data-dd]')) $$('[data-dd].open').forEach(function (x) { x.classList.remove('open'); $('.dd-b', x).setAttribute('aria-expanded', 'false'); });
    });

    /* progress + back-to-top */
    var prog = $('#prog'), top = $('#totop');
    function onScroll() {
      var h = H.scrollHeight - innerHeight, p = h > 0 ? scrollY / h : 0;
      if (prog) prog.style.width = (p * 100).toFixed(1) + '%';
      if (top) top.classList.toggle('show', scrollY > 700);
    }
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    if (top) top.addEventListener('click', function () { scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
    $$('[data-top]').forEach(function (b) { b.addEventListener('click', function () { scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }); });
    $$('[data-share]').forEach(function (b) { b.addEventListener('click', function () { copy(location.href.split('#')[0]); }); });
    $$('[data-print]').forEach(function (b) { b.addEventListener('click', function () { print(); }); });
    $$('[data-copy]').forEach(function (b) { b.addEventListener('click', function () { var t = D.getElementById(b.dataset.copy); if (t) copy(t.textContent.trim()); }); });
    function copy(s) {
      var done = function () { EX.toast(lang() === 'hi' ? 'कॉपी हो गया' : 'Copied'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(s).then(done, done);
      else { var ta = D.createElement('textarea'); ta.value = s; D.body.appendChild(ta); ta.select(); try { D.execCommand('copy'); } catch (e) {} ta.remove(); done(); }
    }
    EX.copy = copy;

    /* reveal on scroll */
    if ('IntersectionObserver' in window && !reduce) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
      $$('.rv').forEach(function (n) { io.observe(n); });
    } else { $$('.rv').forEach(function (n) { n.classList.add('in'); }); }

    /* counters */
    function countUp(el) {
      var raw = el.getAttribute('data-count') || el.textContent;
      var m = raw.match(/^([^0-9]*)([0-9][0-9,]*\.?[0-9]*)(.*)$/);
      if (!m || reduce) return;
      var pre = m[1], numS = m[2], suf = m[3], dec = (numS.split('.')[1] || '').length, end = parseFloat(numS.replace(/,/g, '')), commas = numS.indexOf(',') > -1;
      var t0 = null, dur = 1100;
      function fmt(v) { var s = v.toFixed(dec); if (commas) { var p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); s = p.join('.'); } return pre + s + suf; }
      function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(end * e); if (p < 1) requestAnimationFrame(step); else el.textContent = raw.match(/^[^0-9]*[0-9]/) ? fmt(end) : raw; }
      el.textContent = fmt(0); requestAnimationFrame(step);
    }
    if ('IntersectionObserver' in window) {
      var io2 = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); io2.unobserve(e.target); } }); }, { threshold: 0.6 });
      $$('[data-count]').forEach(function (n) { io2.observe(n); });
    }

    /* tilt */
    if (!reduce && matchMedia('(pointer: fine)').matches) {
      $$('[data-tilt]').forEach(function (n) {
        var host = n.closest('.hero') || n;
        host.addEventListener('pointermove', function (e) {
          var r = n.getBoundingClientRect(), x = (e.clientX - (r.left + r.width / 2)) / innerWidth, y = (e.clientY - (r.top + r.height / 2)) / innerHeight;
          n.style.transform = 'perspective(900px) rotateY(' + (x * 14).toFixed(2) + 'deg) rotateX(' + (-y * 10).toFixed(2) + 'deg)';
        });
        host.addEventListener('pointerleave', function () { n.style.transform = ''; });
      });
    }

    /* subnav highlight */
    var sn = $('#subnav');
    if (sn && 'IntersectionObserver' in window) {
      var links = {}; $$('a[data-sec]', sn).forEach(function (a) { links[a.dataset.sec] = a; });
      var io3 = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            $$('a.on', sn).forEach(function (x) { x.classList.remove('on'); });
            var a = links[e.target.id]; if (a) { a.classList.add('on'); var r = a.getBoundingClientRect(), pr = sn.getBoundingClientRect(); if (r.left < pr.left || r.right > pr.right) sn.scrollTo({ left: a.offsetLeft - 80, behavior: 'smooth' }); }
          }
        });
      }, { rootMargin: '-30% 0px -60% 0px' });
      Object.keys(links).forEach(function (id) { var s = D.getElementById(id); if (s) io3.observe(s); });
    }

    initSearch(); initGlossaryTips(); initSpeak();
    setLang(lang());
  });

  /* ---------- keyboard ---------- */
  D.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    if (e.key === '/' && tag !== 'input' && tag !== 'textarea') { e.preventDefault(); EX.openSearch(); }
    if (e.key === 'Escape') {
      EX.closeSearch && EX.closeSearch();
      $$('[data-dd].open').forEach(function (x) { x.classList.remove('open'); });
      var h = $('#hdr'); if (h) h.classList.remove('open');
      var tp = $('.gl-tip'); if (tp) tp.classList.remove('show');
    }
  });

  /* ---------- search ---------- */
  function initSearch() {
    var box = $('#srch'), inp = $('#srch-in'), list = $('#srch-list'), foot = $('#srch-foot'), idx = window.EX_INDEX || [], cur = -1, res = [];
    if (!box) return;
    idx.forEach(function (e) { e._l = (e.t.en + ' ' + e.t.hi + ' ' + e.x).toLowerCase(); e._t = (e.t.en + ' ' + e.t.hi).toLowerCase(); });
    EX.openSearch = function () { box.hidden = false; inp.value = ''; render(); setTimeout(function () { inp.focus(); }, 10); D.body.style.overflow = 'hidden'; };
    EX.closeSearch = function () { if (box.hidden) return; box.hidden = true; D.body.style.overflow = ''; };
    $('#b-search').addEventListener('click', EX.openSearch);
    $('#srch-x').addEventListener('click', EX.closeSearch);
    box.addEventListener('mousedown', function (e) { if (e.target === box) EX.closeSearch(); });
    function snippet(e, toks) {
      var low = e.x.toLowerCase(), pos = -1, k;
      for (k = 0; k < toks.length; k++) { pos = low.indexOf(toks[k]); if (pos > -1) break; }
      var s = Math.max(0, (pos < 0 ? 0 : pos) - 60), seg = e.x.slice(s, s + 190);
      var out = esc(seg);
      toks.forEach(function (t) { if (t.length > 1) out = out.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); });
      return (s > 0 ? '\u2026' : '') + out + '\u2026';
    }
    function render() {
      var q = inp.value.trim().toLowerCase(), toks = q.split(/\s+/).filter(Boolean);
      if (!toks.length) {
        res = idx.filter(function (e) { return !e.a || e.a === 'reading' || e.a === 'clause' || e.a === 'record'; }).slice(0, 8);
        foot.textContent = lang() === 'hi' ? 'कुछ भी लिखिए: शब्द, तारीख़, नाम। / दबाइए और Esc से बंद कीजिए।' : 'Type a word, a date or a name. Press / to open this from anywhere, Esc to close.';
      } else {
        res = idx.map(function (e) {
          var ok = toks.every(function (t) { return e._l.indexOf(t) > -1; }); if (!ok) return null;
          var sc = 0; toks.forEach(function (t) { if (e._t.indexOf(t) > -1) sc += 6; sc += Math.min(5, (e._l.split(t).length - 1)); });
          return { e: e, s: sc };
        }).filter(Boolean).sort(function (a, b) { return b.s - a.s; }).slice(0, 12).map(function (x) { return x.e; });
        foot.textContent = res.length ? (lang() === 'hi' ? res.length + ' परिणाम' : res.length + ' results') : (lang() === 'hi' ? 'कोई परिणाम नहीं।' : 'No results.');
      }
      cur = res.length ? 0 : -1;
      list.innerHTML = res.map(function (e, i) {
        var href = e.p + (e.a ? '#' + e.a : '');
        return '<li class="srch-item' + (i === 0 ? ' sel' : '') + '" role="option"><a href="' + href + '"><small>' + esc(e.pt[lang()]) + '</small><b>' + esc(e.t[lang()]) + '</b><span>' + snippet(e, toks) + '</span></a></li>';
      }).join('');
    }
    inp.addEventListener('input', render);
    inp.addEventListener('keydown', function (e) {
      var items = $$('.srch-item', list); if (!items.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); items[cur].classList.remove('sel'); cur = (cur + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items[cur].classList.add('sel'); items[cur].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') { e.preventDefault(); var a = $('a', items[cur]); if (a) location.href = a.getAttribute('href'); }
    });
    EX.onLang(function () { if (!box.hidden) render(); });
  }

  /* ---------- glossary tooltips ---------- */
  function initGlossaryTips() {
    var G = window.EX_GLOSSARY || []; if (!G.length) return;
    var used = { en: {}, hi: {} };
    var terms = [];
    G.forEach(function (g) { ['en', 'hi'].forEach(function (L) { (g[L] || []).forEach(function (m) { if (m) terms.push({ g: g, L: L, m: m }); }); }); });
    terms.sort(function (a, b) { return b.m.length - a.m.length; });
    $$('.gl-scope').forEach(function (scope) {
      var L = scope.dataset.lang; if (!L) return;
      terms.forEach(function (t) {
        if (t.L !== L || used[L][t.g.id]) return;
        var re = new RegExp(L === 'en' ? '\\b' + t.m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b' : t.m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), L === 'en' ? 'i' : '');
        var w = D.createTreeWalker(scope, NodeFilter.SHOW_TEXT, null), n;
        while ((n = w.nextNode())) {
          if (n.parentNode.closest('a,.gl-term,.pull,button')) continue;
          var m = re.exec(n.nodeValue); if (!m) continue;
          var after = n.splitText(m.index), rest = after.splitText(m[0].length);
          var sp = D.createElement('span'); sp.className = 'gl-term'; sp.tabIndex = 0; sp.dataset.g = t.g.id; sp.setAttribute('role', 'button');
          after.parentNode.replaceChild(sp, after); sp.appendChild(after); used[L][t.g.id] = 1; break;
        }
      });
    });
    var tip = D.createElement('div'); tip.className = 'gl-tip'; tip.setAttribute('role', 'tooltip'); D.body.appendChild(tip);
    var open = null, y0 = 0;
    function show(sp) {
      var g = G.filter(function (x) { return x.id === sp.dataset.g; })[0]; if (!g) return;
      tip.innerHTML = '<b>' + esc(g.t[lang()]) + '</b>' + esc(g.d[lang()]) + '<br><a href="glossary.html#g-' + g.id + '">' + (lang() === 'hi' ? 'शब्दावली में देखें' : 'See in the glossary') + ' &rarr;</a>';
      var r = sp.getBoundingClientRect(); tip.classList.add('show');
      var w = tip.offsetWidth, h = tip.offsetHeight, x = Math.min(Math.max(8, r.left), innerWidth - w - 8), y = r.bottom + 8; if (y + h > innerHeight - 8) y = Math.max(8, r.top - h - 8);
      tip.style.left = x + 'px'; tip.style.top = y + 'px'; open = sp; y0 = scrollY;
    }
    function hide() { tip.classList.remove('show'); open = null; }
    D.addEventListener('mouseover', function (e) { var sp = e.target.closest && e.target.closest('.gl-term'); if (sp) show(sp); });
    D.addEventListener('mouseout', function (e) { var sp = e.target.closest && e.target.closest('.gl-term'); if (sp && !tip.matches(':hover')) setTimeout(function () { if (!tip.matches(':hover') && open === sp) hide(); }, 200); });
    D.addEventListener('focusin', function (e) { var sp = e.target.closest && e.target.closest('.gl-term'); if (sp) show(sp); });
    D.addEventListener('focusout', function (e) { if (e.target.closest && e.target.closest('.gl-term')) setTimeout(hide, 150); });
    D.addEventListener('click', function (e) { var sp = e.target.closest && e.target.closest('.gl-term'); if (sp) { if (open === sp) hide(); else show(sp); } else if (!e.target.closest('.gl-tip')) hide(); });
    addEventListener('scroll', function () { if (open && Math.abs(scrollY - y0) > 90) hide(); }, { passive: true });
  }

  /* ---------- read aloud ---------- */
  var synth = window.speechSynthesis;
  function voiceFor(code) {
    if (!synth) return null; var vs = synth.getVoices(), pre = code.slice(0, 2);
    return vs.filter(function (v) { return v.lang === code; })[0] || vs.filter(function (v) { return v.lang.slice(0, 2) === pre; })[0] || null;
  }
  function chunk(text) {
    var parts = text.replace(/\s+/g, ' ').match(/[^.!?\u0964]+[.!?\u0964]*/g) || [text], out = [], b = '';
    parts.forEach(function (p) { if ((b + p).length > 220 && b) { out.push(b); b = p; } else b += p; }); if (b) out.push(b); return out;
  }
  EX.speakQueue = function (items, code, hooks2) {
    if (!synth) { EX.toast(lang() === 'hi' ? 'इस ब्राउज़र में पढ़कर सुनाने की सुविधा नहीं है।' : 'Read-aloud is not available in this browser.'); return null; }
    synth.cancel(); var stopped = false, i = 0, v = voiceFor(code);
    hooks2 = hooks2 || {};
    if (!v && hooks2.novoice) hooks2.novoice();
    function next() {
      if (stopped || i >= items.length) { if (!stopped && hooks2.end) hooks2.end(); return; }
      var it = items[i++]; if (it.cb) it.cb();
      var parts = chunk(it.t), k = 0;
      (function say() {
        if (stopped) return; if (k >= parts.length) { next(); return; }
        var u = new SpeechSynthesisUtterance(parts[k++]); u.lang = code; if (v) u.voice = v; u.rate = 0.95; u.onend = say; u.onerror = function () { if (!stopped) say(); };
        synth.speak(u);
      })();
    }
    next();
    return { stop: function () { stopped = true; synth.cancel(); if (hooks2.end) hooks2.end(); } };
  };
  function initSpeak() {
    var active = null, btn = null;
    if (synth && synth.onvoiceschanged !== undefined) synth.onvoiceschanged = function () {};
    $$('[data-speak]').forEach(function (b) {
      if (!synth) { b.style.display = 'none'; return; }
      b.addEventListener('click', function () {
        if (active && btn === b) { active.stop(); return; }
        if (active) active.stop();
        var tgt = D.getElementById(b.dataset.speak); if (!tgt) return;
        var code = b.dataset.speakLang || (lang() === 'hi' ? 'hi-IN' : 'en-IN'), text;
        if (b.dataset.speakSel) text = $$(b.dataset.speakSel, tgt).map(function (n) { return n.textContent; }).join('. '); else text = tgt.innerText;
        btn = b; b.setAttribute('aria-pressed', 'true');
        active = EX.speakQueue([{ t: text }], code, { end: function () { b.setAttribute('aria-pressed', 'false'); active = null; btn = null; }, novoice: function () { EX.toast(lang() === 'hi' ? 'हिंदी आवाज़ उपलब्ध नहीं, किसी और आवाज़ में पढ़ा जाएगा।' : 'No voice found for this language; using the default voice.'); } });
      });
    });
    addEventListener('pagehide', function () { if (synth) synth.cancel(); });
  }
})();
