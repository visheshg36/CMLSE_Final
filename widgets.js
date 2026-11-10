/* Not Rape, By Law. Interactive widgets. Each widget reads JSON from its data-src and redraws on language change. */
(function () {
  'use strict';
  var EX = window.EX, D = document, T = EX.T, esc = EX.esc, $ = EX.$, $$ = EX.$$;
  var inits = {};
  function reg(n, fn) { inits[n] = fn; }
  function J(id) { var e = D.getElementById(id); return e ? JSON.parse(e.textContent) : null; }
  function h(tag, cls, html) { var n = D.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* ====================================================================== selector */
  reg('selector', function (root, d) {
    var cur = d.start || 0, layout = d.layout || 'rows';
    var btns = h('div', 'sel-btns'), panel = h('div', 'sel-panel');
    btns.setAttribute('role', 'tablist'); root.appendChild(btns); root.appendChild(panel);
    function draw() {
      btns.innerHTML = '';
      d.items.forEach(function (it, i) {
        var b = h('button', i === cur ? 'on' : '', esc(T(it.label))); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', i === cur);
        b.addEventListener('click', function () { cur = i; draw(); }); btns.appendChild(b);
      });
      var it = d.items[cur], out = '';
      if (layout === 'text') out = '<p class="text-panel">' + esc(T(it.text)) + '</p>';
      else if (layout === 'rows') out = it.rows.map(function (r) { return '<div class="tp-row"><div class="tp-k">' + esc(T(r.k)) + '</div><div class="tp-v' + (r.cls ? ' ' + r.cls : '') + '">' + esc(T(r.v)) + '</div></div>'; }).join('');
      else if (layout === 'cards') {
        out = '<div class="cards3" style="grid-template-columns:repeat(auto-fit,minmax(' + (d.cols === 3 ? '15rem' : '17rem') + ',1fr))">' + it.cards.map(function (c) {
          return '<div class="route' + (c.missing ? ' missing' : '') + '"><div class="rt-head"><span class="rt-name">' + esc(T(c.title)) + '</span>' + (c.badge ? '<span class="badge ' + c.badge + '">' + esc(T(c.badge_l)) + '</span>' : '') + '</div><p>' + esc(T(c.text)) + '</p></div>';
        }).join('') + '</div>' + (it.foot ? '<div class="sel-foot">' + esc(T(it.foot)) + '</div>' : '');
        panel.classList.add('flush');
      }
      panel.innerHTML = out;
    }
    root.addEventListener('keydown', function (e) {
      if (e.target.tagName !== 'BUTTON') return;
      if (e.key === 'ArrowRight') { cur = (cur + 1) % d.items.length; draw(); $$('button', btns)[cur].focus(); }
      if (e.key === 'ArrowLeft') { cur = (cur - 1 + d.items.length) % d.items.length; draw(); $$('button', btns)[cur].focus(); }
    });
    draw(); return draw;
  });

  /* ====================================================================== statute lab */
  reg('statute', function (root, d) {
    var tab = 1, noteKey = null, struck = {};
    function words() { return d.words[EX.lang()]; }
    function draw() {
      var l = EX.lang(), u = d.ui, html = '<div class="sl-tabs" role="tablist"><button type="button" class="' + (tab === 1 ? 'on' : '') + '" data-t="1">' + esc(T(u.tab1)) + '</button><button type="button" class="' + (tab === 2 ? 'on' : '') + '" data-t="2">' + esc(T(u.tab2)) + '</button></div>';
      if (tab === 1) {
        html += '<p class="st-label">Exception 2, Section 375, Indian Penal Code (1860, as read down in 2017) / Section 63, Bharatiya Nyaya Sanhita (2023)</p><p class="st-text">' +
          d.phrases[l].map(function (p) { return p.k ? '<span class="ph' + (noteKey === p.k ? ' struck' : '') + '" tabindex="0" role="button" data-k="' + p.k + '">' + esc(p.t) + '</span>' : esc(p.t); }).join('') + '</p>' +
          '<p class="st-note" aria-live="polite">' + (noteKey ? esc(T(d.notes[noteKey])) : '') + '</p><p class="st-hint">' + esc(T(u.hint1)) + '</p>';
      } else {
        var w = words(), left = w.filter(function (_, i) { return !struck[i]; }).join(' '), flipped = struck[d.flip[l]] && Object.keys(struck).filter(function (k) { return struck[k]; }).length === 1, nstruck = Object.keys(struck).filter(function (k) { return struck[k]; }).length;
        html += '<p class="st-hint" style="margin-top:0">' + esc(T(u.hint2)) + '</p><div class="er-words">' + w.map(function (x, i) { return '<button type="button" class="er-w' + (struck[i] ? ' struck' : '') + '" data-i="' + i + '">' + esc(x) + '</button>'; }).join('') + '</div>' +
          '<div class="er-out"><small>' + esc(T(u.left)) + '</small><span id="er-t">' + esc(left || '\u2014') + '</span></div><p class="er-msg" aria-live="polite">' + (flipped ? esc(T(u.flipnote)) : (nstruck === w.length ? esc(T(u.none)) : '')) + '</p>' +
          '<div class="er-btns"><button type="button" data-a="flip">' + esc(T(u.flip)) + '</button><button type="button" data-a="reset">' + esc(T(u.reset)) + '</button><button type="button" data-a="copy">' + esc(T(u.copy)) + '</button></div>';
      }
      root.innerHTML = html;
    }
    root.addEventListener('click', function (e) {
      var t = e.target.closest('[data-t]'); if (t) { tab = +t.dataset.t; draw(); return; }
      var p = e.target.closest('.ph'); if (p) { noteKey = noteKey === p.dataset.k ? null : p.dataset.k; draw(); return; }
      var w = e.target.closest('.er-w'); if (w) { struck[w.dataset.i] = !struck[w.dataset.i]; draw(); return; }
      var a = e.target.closest('[data-a]');
      if (a) {
        if (a.dataset.a === 'reset') struck = {};
        if (a.dataset.a === 'flip') { struck = {}; struck[d.flip[EX.lang()]] = true; }
        if (a.dataset.a === 'copy') { var s = words().filter(function (_, i) { return !struck[i]; }).join(' '); EX.copy(s); return; }
        draw();
      }
    });
    root.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('ph')) { e.preventDefault(); e.target.click(); } });
    draw(); return draw;
  });

  /* ====================================================================== age ladder */
  reg('ladder', function (root, d) {
    var i = 0, n = d.steps.length;
    root.classList.add('ladder');
    root.innerHTML = '<div class="lad-top"><div class="lad-year" id="ld-y"></div><span class="lad-gap" id="ld-g"></span></div><div class="lad-bars"><div class="lad-col"><div class="lad-lbl" id="ld-lo"></div><div class="lad-bar" id="ld-bo"></div></div><div class="lad-col in"><div class="lad-lbl" id="ld-li"></div><div class="lad-bar" id="ld-bi"></div></div></div>' +
      '<input class="lad-slide" id="ld-r" type="range" min="0" max="' + (n - 1) + '" value="0" aria-label="" step="1"><div class="lad-ticks" id="ld-t"></div><p class="lad-txt" id="ld-x" aria-live="polite"></p>';
    var r = $('#ld-r', root);
    function draw() {
      var s = d.steps[i], gap = s.out - s.in, max = 20;
      $('#ld-y', root).textContent = s.y; r.value = i; r.setAttribute('aria-label', T(d.ui.slide));
      var g = $('#ld-g', root); g.textContent = gap > 0 ? T(d.ui.gap) + ': ' + gap + ' ' + T(d.ui.years) : T(d.ui.none); g.className = 'lad-gap' + (gap > 0 ? '' : ' none');
      $('#ld-lo', root).textContent = T(d.ui.out); $('#ld-li', root).textContent = T(d.ui['in']);
      var bo = $('#ld-bo', root), bi = $('#ld-bi', root);
      bo.style.height = (s.out / max * 100) + '%'; bo.textContent = s.out; bi.style.height = (s['in'] / max * 100) + '%'; bi.textContent = s['in'];
      bi.style.background = gap > 0 ? 'var(--red-fill)' : 'var(--green)';
      $('#ld-x', root).textContent = T(s.text);
      $('#ld-t', root).innerHTML = d.steps.map(function (st, k) { return '<button type="button" data-k="' + k + '" class="' + (k === i ? 'on' : '') + '">' + st.y + '</button>'; }).join('');
    }
    r.addEventListener('input', function () { i = +r.value; draw(); });
    root.addEventListener('click', function (e) { var b = e.target.closest('[data-k]'); if (b) { i = +b.dataset.k; draw(); } });
    root.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' && e.target !== r) { i = Math.min(n - 1, i + 1); draw(); } if (e.key === 'ArrowLeft' && e.target !== r) { i = Math.max(0, i - 1); draw(); } });
    draw(); return draw;
  });

  /* ====================================================================== statements slider */
  reg('slider', function (root, d) {
    var idx = 0, filter = null, id = root.id;
    root.classList.add('slider');
    function visible() { return d.items.map(function (it, i) { return i; }).filter(function (i) { return !filter || d.items[i].tags.indexOf(filter) > -1; }); }
    function draw() {
      var l = EX.lang(), vis = visible(), u = d.ui;
      if (vis.indexOf(idx) < 0) idx = vis.length ? vis[0] : idx;
      var it = d.items[idx], pos = vis.indexOf(idx) + 1;
      var chips = '<div class="sl-filter" role="group"><small>' + esc(T(u.filter)) + '</small><button type="button" class="chip' + (!filter ? ' on' : '') + '" data-f="">' + esc(T(u.all)) + '</button>' +
        Object.keys(d.tags).map(function (k) { return '<button type="button" class="chip' + (filter === k ? ' on' : '') + '" data-f="' + k + '">' + esc(T(d.tags[k])) + '</button>'; }).join('') + '</div>';
      var body = vis.length ? '<div class="sl-year">' + esc(it.y) + '</div><p class="sl-who">' + esc(T(it.who)) + '<span class="sl-kind">' + esc(T(it.kind)) + '</span></p><p class="sl-said">' + esc(T(it.said)) + '</p><div class="sl-tags">' +
        it.tags.map(function (t) { return '<span class="sl-tag">' + esc(T(d.tags[t])) + '</span>'; }).join('') + '</div><p class="sl-why"><strong>' + esc(T(u.noticed)) + '</strong> ' + esc(T(it.why)) + '</p><p class="sl-src">' + esc(T(u.src)) + ' ' +
        it.src.map(function (s) { return '<a href="' + s[1] + '" target="_blank" rel="noopener">' + esc(s[0]) + '</a>'; }).join(', ') + '</p>' : '<p class="sl-why">' + esc(T(u.none)) + '</p>';
      root.innerHTML = chips + '<div class="sl-top"><span class="sl-count">' + esc(T(u.of)) + ' ' + pos + ' / ' + vis.length + '</span><div class="sl-btns"><button type="button" data-n="-1" aria-label="Previous"' + (pos <= 1 ? ' disabled' : '') + '>&larr;</button><button type="button" data-n="1" aria-label="Next"' + (pos >= vis.length ? ' disabled' : '') + '>&rarr;</button></div></div>' +
        '<div class="sl-body" aria-live="polite">' + body + '</div><div class="sl-dots">' + d.items.map(function (x, i) { return '<button type="button" aria-label="' + esc(x.y) + '" data-g="' + i + '" class="' + (i === idx ? 'on' : '') + (vis.indexOf(i) < 0 ? ' dim' : '') + '"></button>'; }).join('') + '</div>';
      D.dispatchEvent(new CustomEvent('ex:cur', { detail: { id: id, idx: idx } }));
    }
    root.addEventListener('click', function (e) {
      var f = e.target.closest('[data-f]'); if (f) { filter = f.dataset.f || null; draw(); return; }
      var n = e.target.closest('[data-n]'); if (n) { var v = visible(), p = v.indexOf(idx) + (+n.dataset.n); if (p >= 0 && p < v.length) { idx = v[p]; draw(); } return; }
      var g = e.target.closest('[data-g]'); if (g) { idx = +g.dataset.g; filter = null; draw(); }
    });
    root.addEventListener('keydown', function (e) { var v = visible(), p = v.indexOf(idx); if (e.key === 'ArrowRight' && p < v.length - 1) { idx = v[p + 1]; draw(); } if (e.key === 'ArrowLeft' && p > 0) { idx = v[p - 1]; draw(); } });
    root.addEventListener('ex:goto', function (e) { idx = e.detail; filter = null; draw(); });
    draw(); return draw;
  });

  /* ====================================================================== heatmap */
  reg('heatmap', function (root, d) {
    var cur = 0; root.classList.add('heat');
    function draw() {
      var n = d.items.length, g = '<div class="hm" style="grid-template-columns:minmax(9rem,1.4fr) repeat(' + n + ',minmax(2.6rem,1fr))"><div></div>' + d.items.map(function (it) { return '<div class="hm-h">' + esc(it.y) + '</div>'; }).join('');
      d.args.forEach(function (a) {
        g += '<div class="hm-r">' + esc(T(a.label)) + '</div>' + d.items.map(function (it, i) {
          var f = it.tags.indexOf(a.k) > -1; return '<button type="button" class="hm-c' + (f ? ' f' : '') + (i === cur ? ' cur' : '') + '"' + (f ? ' data-i="' + i + '" aria-label="' + esc(T(a.label)) + ', ' + esc(it.y) + '"' : ' tabindex="-1" aria-hidden="true"') + '></button>';
        }).join('');
      });
      root.innerHTML = g + '</div><p class="hm-foot">' + esc(T(d.ui.hint)) + '</p>';
    }
    root.addEventListener('click', function (e) {
      var c = e.target.closest('[data-i]'); if (!c) return;
      var tgt = D.getElementById(d.target); if (!tgt) return; tgt.dispatchEvent(new CustomEvent('ex:goto', { detail: +c.dataset.i }));
      tgt.scrollIntoView({ behavior: EX.reduce ? 'auto' : 'smooth', block: 'center' });
    });
    D.addEventListener('ex:cur', function (e) { if (e.detail.id === d.target) { cur = e.detail.idx; draw(); } });
    draw(); return draw;
  });

  /* ====================================================================== scenarios */
  reg('scenario', function (root, d) {
    var q1 = 'up', q2 = 'no'; root.classList.add('scen');
    function draw() {
      var u = d.ui, key = q1 === 'down' ? 'struck' : (q2 === 'yes' ? 'upheld_yes' : 'upheld_no'), s = d.scenarios[key];
      root.innerHTML = '<p class="sc-q">' + esc(T(u.q1)) + '</p><div class="sc-opts"><button type="button" data-q1="up" class="' + (q1 === 'up' ? 'on' : '') + '">' + esc(T(u.a_up)) + '</button><button type="button" data-q1="down" class="' + (q1 === 'down' ? 'on' : '') + '">' + esc(T(u.a_down)) + '</button></div>' +
        '<p class="sc-q">' + esc(T(u.q2)) + '</p><div class="sc-opts"><button type="button" data-q2="yes" class="' + (q2 === 'yes' ? 'on' : '') + '"' + (q1 === 'down' ? ' disabled' : '') + '>' + esc(T(u.b_yes)) + '</button><button type="button" data-q2="no" class="' + (q2 === 'no' ? 'on' : '') + '"' + (q1 === 'down' ? ' disabled' : '') + '>' + esc(T(u.b_no)) + '</button></div>' +
        '<div class="sc-out" aria-live="polite"><h3>' + esc(T(s.title)) + '</h3><h4>' + esc(T(u.wife)) + '</h4><p>' + esc(T(s.wife)) + '</p><h4>' + esc(T(u.next)) + '</h4><p>' + esc(T(s.next)) + '</p></div><p class="sc-note">' + esc(T(u.disclaimer)) + '</p>';
    }
    root.addEventListener('click', function (e) {
      var a = e.target.closest('[data-q1]'), b = e.target.closest('[data-q2]'); if (a) q1 = a.dataset.q1; if (b) q2 = b.dataset.q2; if (a || b) draw();
    });
    draw(); return draw;
  });

  /* ====================================================================== waffle */
  reg('waffle', function (root, d) {
    var fi = 0, steps = [100, 500, 1000, 5000, 10000, 50000, 100000], si = 2; root.classList.add('waffle');
    function draw() {
      var f = d.forms[fi], u = d.ui, n = steps[si], est = Math.round(n * f.rate / 100);
      var dots = ''; for (var i = 0; i < 100; i++) dots += '<span class="wf-dot' + (i < f.dots ? ' on' : '') + '" style="--i:' + i + '"></span>';
      root.innerHTML = '<div class="sel-btns" role="tablist" style="margin-bottom:1.4rem;border-bottom:2px solid var(--ink)">' + d.forms.map(function (x, k) { return '<button type="button" role="tab" data-k="' + k + '" class="' + (k === fi ? 'on' : '') + '">' + esc(T(x.label)) + '</button>'; }).join('') + '</div>' +
        '<div class="wf-grid-w"><div class="wf-grid" role="img" aria-label="' + f.dots + ' of 100">' + dots + '</div><div><div class="wf-big">' + f.dots + '<small> / 100</small></div><p class="wf-txt">' + esc(T(u.of100)) + '</p><p class="wf-note">' + esc(T(f.note)) + '</p></div></div>' +
        '<div class="wf-calc"><h3>' + esc(T(u.calc)) + '</h3><label for="wf-r" class="tp-k">' + esc(T(u.group)) + ': <b>' + fmt(n) + '</b></label><input id="wf-r" type="range" min="0" max="' + (steps.length - 1) + '" step="1" value="' + si + '"><p class="wf-res">' + esc(T(u.about)) + ' <b>' + fmt(est) + '</b> ' + esc(T(u.result)) + '</p><p class="wf-cav">' + esc(T(u.caveat)) + '</p></div>';
    }
    root.addEventListener('click', function (e) { var b = e.target.closest('[data-k]'); if (b) { fi = +b.dataset.k; draw(); } });
    root.addEventListener('input', function (e) { if (e.target.id === 'wf-r') { si = +e.target.value; var f = d.forms[fi], u = d.ui, n = steps[si]; $('.wf-calc label b', root).textContent = fmt(n); $('.wf-res', root).innerHTML = esc(T(u.about)) + ' <b>' + fmt(Math.round(n * f.rate / 100)) + '</b> ' + esc(T(u.result)); } });
    draw(); return draw;
  });

  /* ====================================================================== states */
  reg('states', function (root, d) {
    var q = '', sort = 'v', quick = 'all'; root.classList.add('states');
    function rows() {
      var l = EX.lang(), list = d.items.slice();
      if (sort === 'a') list.sort(function (a, b) { return T(a.n).localeCompare(T(b.n), l === 'hi' ? 'hi' : 'en'); }); else list.sort(function (a, b) { return b.v - a.v; });
      if (quick === 'top') list = d.items.filter(function (x) { return x.n.en !== 'India'; }).sort(function (a, b) { return b.v - a.v; }).slice(0, 5);
      if (quick === 'bottom') list = d.items.filter(function (x) { return x.n.en !== 'India'; }).sort(function (a, b) { return a.v - b.v; }).slice(0, 5);
      var qq = q.trim().toLowerCase(); if (qq) list = list.filter(function (x) { return (x.n.en + ' ' + x.n.hi).toLowerCase().indexOf(qq) > -1; });
      return list;
    }
    function drawList() {
      var u = d.ui, list = rows();
      $('.st-list', root).innerHTML = list.length ? list.map(function (x) {
        var isI = x.n.en === 'India', cls = isI ? 'india' : (x.v < d.india ? 'below' : (x.v === d.india ? 'same' : 'above'));
        return '<div class="st-row ' + cls + '" title="' + esc(T(x.n)) + ': ' + x.v + '%"><span class="st-n">' + esc(T(isI ? u.india : x.n)) + '</span><span class="st-t"><span class="st-f" style="width:' + (x.v / 10 * 100) + '%"></span></span><span class="st-v">' + x.v + '%</span></div>';
      }).join('') : '<p class="gl-none">' + esc(T(u.none)) + '</p>';
    }
    function draw() {
      var u = d.ui;
      root.innerHTML = '<div class="st-ctl"><input type="search" id="st-q" value="' + esc(q) + '" placeholder="' + esc(T(u.search)) + '" aria-label="' + esc(T(u.search)) + '"><div class="tl-views"><button type="button" data-s="v" class="' + (sort === 'v' && quick === 'all' ? 'on' : '') + '">' + esc(T(u.sort_v)) + '</button><button type="button" data-s="a" class="' + (sort === 'a' ? 'on' : '') + '">' + esc(T(u.sort_a)) + '</button></div>' +
        '<div class="tl-views"><button type="button" data-qk="all" class="' + (quick === 'all' ? 'on' : '') + '">' + esc(T(u.all)) + '</button><button type="button" data-qk="top" class="' + (quick === 'top' ? 'on' : '') + '">' + esc(T(u.top)) + '</button><button type="button" data-qk="bottom" class="' + (quick === 'bottom' ? 'on' : '') + '">' + esc(T(u.bottom)) + '</button></div></div>' +
        '<div class="st-list"></div><div class="st-key"><span><i style="background:var(--red-fill)"></i>' + esc(T(u.above)) + '</span><span><i style="background:var(--green)"></i>' + esc(T(u.below)) + '</span><span><i style="background:var(--gold)"></i>' + esc(T(u.india)) + '</span></div>';
      drawList(); var inp = $('#st-q', root); inp.addEventListener('input', function () { q = inp.value; drawList(); });
    }
    root.addEventListener('click', function (e) {
      var s = e.target.closest('[data-s]'), k = e.target.closest('[data-qk]');
      if (s) { sort = s.dataset.s; quick = 'all'; draw(); } if (k) { quick = k.dataset.qk; if (quick !== 'all') sort = 'v'; draw(); }
    });
    draw(); return draw;
  });

  /* ====================================================================== timeline (strip, list, lanes) */
  reg('timeline', function (root, d) {
    var o = d.opts, lanes = Object.keys(d.lanes), active = {}, q = '', view = o.view || (o.compact ? 'strip' : 'list'), sel = null, openIds = {};
    lanes.forEach(function (k) { active[k] = true; });
    var evs = d.events;
    function passes(e) {
      if (!e.lanes.some(function (k) { return active[k]; })) return false;
      var qq = q.trim().toLowerCase(); if (!qq) return true;
      return (e.title.en + ' ' + e.title.hi + ' ' + e.body.en + ' ' + e.body.hi + ' ' + e.y).toLowerCase().indexOf(qq) > -1;
    }
    function laneTags(e) { return '<div class="tl-lanetags">' + e.lanes.map(function (k) { return '<span class="lane-tag ln-' + k + '">' + esc(T(d.lanes[k] || { en: k, hi: k })) + '</span>'; }).join('') + '</div>'; }
    function srcs(e) { return e.src && e.src.length ? '<p class="tl-src">' + e.src.map(function (s) { return '<a href="' + s[1] + '" target="_blank" rel="noopener">' + esc(s[0]) + '</a>'; }).join('') + '</p>' : ''; }
    function detail(e) { return e ? '<div class="tl-det" aria-live="polite"><div class="tl-y">' + esc(e.y) + '</div><h3>' + esc(T(e.title)) + '</h3>' + laneTags(e) + '<p>' + esc(T(e.body)) + '</p>' + srcs(e) + '</div>' : ''; }
    function controls(n) {
      var c = '<div class="tl-ctl">';
      if (o.search) c += '<input type="search" id="tl-q-' + root.id + '" value="' + esc(q) + '" placeholder="' + esc(EX.lang() === 'hi' ? 'घटनाएँ खोजिए' : 'Search the events') + '" aria-label="Search events">';
      if (o.views) c += '<div class="tl-views"><button type="button" data-v="list" class="' + (view === 'list' ? 'on' : '') + '">' + (EX.lang() === 'hi' ? 'सूची' : 'List') + '</button><button type="button" data-v="lanes" class="' + (view === 'lanes' ? 'on' : '') + '">' + (EX.lang() === 'hi' ? 'लेन' : 'Lanes') + '</button></div>';
      c += '</div>';
      if (o.chips) c += '<div class="tl-chips" role="group" style="margin-bottom:1.1rem">' + lanes.map(function (k) { return '<button type="button" class="chip' + (active[k] ? ' on' : '') + '" data-l="' + k + '">' + esc(T(d.lanes[k])) + '</button>'; }).join('') + '</div>';
      return c + (o.search || o.chips ? '<p class="tl-count">' + n + ' ' + (EX.lang() === 'hi' ? 'घटनाएँ' : 'events') + '</p>' : '');
    }
    function draw() {
      var list = evs.filter(passes), html = controls(list.length);
      if (!list.length) { root.innerHTML = html + '<p class="tl-none">' + (EX.lang() === 'hi' ? 'कोई घटना नहीं मिली।' : 'No events match.') + '</p>'; wire(); return; }
      if (view === 'strip') {
        if (sel === null || !list.some(function (e) { return e.id === sel; })) sel = o.select === 'first' ? list[0].id : list[list.length - 1].id;
        html += '<div class="tl-strip">' + list.map(function (e) { return '<button type="button" class="tl-pt' + (e.id === sel ? ' on' : '') + '" data-e="' + e.id + '"><i></i><span>' + esc(e.y) + '</span></button>'; }).join('') + '</div>' + detail(list.filter(function (e) { return e.id === sel; })[0]);
      } else if (view === 'lanes') {
        var ys = []; list.forEach(function (e) { if (ys.indexOf(e.y) < 0) ys.push(e.y); });
        var ll = lanes.filter(function (k) { return active[k]; });
        html += '<div class="lt-wrap"><div class="lt" style="grid-template-columns:9.5rem repeat(' + ys.length + ',2.6rem)"><div></div>' + ys.map(function (y) { return '<div class="lt-y">' + esc(y) + '</div>'; }).join('');
        ll.forEach(function (k) {
          html += '<div class="lt-l">' + esc(T(d.lanes[k])) + '</div>' + ys.map(function (y) {
            return '<div class="lt-c">' + list.filter(function (e) { return e.y === y && e.lanes.indexOf(k) > -1; }).map(function (e) { return '<button type="button" class="lt-d ln-' + k + (e.id === sel ? ' on' : '') + '" data-e="' + e.id + '" aria-label="' + esc(e.y + ': ' + T(e.title)) + '" title="' + esc(e.y + ': ' + T(e.title)) + '"></button>'; }).join('') + '</div>';
          }).join('');
        });
        html += '</div></div><div style="margin-top:1.1rem">' + (sel && list.some(function (e) { return e.id === sel; }) ? detail(list.filter(function (e) { return e.id === sel; })[0]) : '<p class="tl-count">' + (EX.lang() === 'hi' ? 'किसी बिंदु पर क्लिक कीजिए।' : 'Click a dot to read the event.') + '</p>') + '</div>';
      } else {
        html += '<ol class="tl-list">' + list.map(function (e) {
          var op = openIds[e.id] ? ' open' : '';
          return '<li class="tl-item' + op + '" id="tl-' + e.id + '"><button type="button" class="tl-h" data-o="' + e.id + '" aria-expanded="' + (!!openIds[e.id]) + '"><div class="tl-hy">' + esc(e.y) + '</div><div class="tl-ht">' + esc(T(e.title)) + '</div></button><div class="tl-body">' + laneTags(e) + '<p>' + esc(T(e.body)) + '</p>' + srcs(e) + '</div></li>';
        }).join('') + '</ol>';
      }
      root.innerHTML = html; wire();
    }
    function wire() {
      var inp = $('#tl-q-' + root.id, root); if (inp) { inp.addEventListener('input', function () { q = inp.value; var pos = inp.selectionStart; draw(); var n = $('#tl-q-' + root.id, root); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} } }); }
    }
    root.addEventListener('click', function (e) {
      var l = e.target.closest('[data-l]'), v = e.target.closest('[data-v]'), p = e.target.closest('[data-e]'), op = e.target.closest('[data-o]');
      if (l) { active[l.dataset.l] = !active[l.dataset.l]; if (!lanes.some(function (k) { return active[k]; })) lanes.forEach(function (k) { active[k] = true; }); draw(); }
      else if (v) { view = v.dataset.v; draw(); }
      else if (p) { sel = p.dataset.e; draw(); }
      else if (op) { openIds[op.dataset.o] = !openIds[op.dataset.o]; draw(); }
    });
    if (location.hash.indexOf('#tl-') === 0 && view === 'list') { openIds[location.hash.slice(4)] = true; }
    draw();
    if (location.hash.indexOf('#tl-') === 0) { var t = D.getElementById(location.hash.slice(1)); if (t) setTimeout(function () { t.scrollIntoView({ block: 'center' }); }, 300); }
    return draw;
  });

  /* ====================================================================== annotated poster */
  reg('poster', function (root, d) {
    var cur = 0, hide = false; root.classList.add('pv');
    function draw() {
      var u = d.ui, hs = d.hot, c = hs[cur];
      root.innerHTML = '<div class="pv-img' + (hide ? ' hide' : '') + '"><img src="poster.jpg" alt="Poster: the text of Exception 2 with the phrase his own wife struck through in red and the words is not rape set large." width="1024" height="1536">' +
        hs.map(function (x, i) { return '<button type="button" class="hs' + (i === cur ? ' on' : '') + '" style="left:' + x.x + '%;top:' + x.y + '%" data-i="' + i + '" aria-label="' + esc(T(x.h)) + '">' + x.n + '</button>'; }).join('') + '</div>' +
        '<div><p class="pv-hint">' + esc(T(u.hint)) + '</p><div class="pv-note" aria-live="polite"><div class="pv-n">' + c.n + ' / ' + hs.length + '</div><h3>' + esc(T(c.h)) + '</h3><p>' + esc(T(c.t)) + '</p></div>' +
        '<div class="pv-list">' + hs.map(function (x, i) { return '<button type="button" class="chip' + (i === cur ? ' on' : '') + '" data-i="' + i + '">' + x.n + '. ' + esc(T(x.h)) + '</button>'; }).join('') + '<button type="button" class="chip" data-hide="1">' + esc(T(hide ? u.all : u.hide)) + '</button></div></div>';
    }
    root.addEventListener('click', function (e) { var b = e.target.closest('[data-i]'), x = e.target.closest('[data-hide]'); if (b) { cur = +b.dataset.i; draw(); } if (x) { hide = !hide; draw(); } });
    root.addEventListener('keydown', function (e) { var n = d.hot.length; if (e.key === 'ArrowRight') { cur = (cur + 1) % n; draw(); } if (e.key === 'ArrowLeft') { cur = (cur - 1 + n) % n; draw(); } });
    draw(); return draw;
  });

  /* ====================================================================== poem reader */
  reg('poem', function (root, d) {
    var mode = EX.lang() === 'hi' ? 'hi' : 'both', touched = false, conn = false, cur = 0, ctl = null, n = d.stanzas.length;
    root.dataset.mode = mode;
    function draw() {
      var l = EX.lang(), u = d.ui; if (!touched) { mode = l === 'hi' ? 'hi' : 'both'; } root.dataset.mode = mode; root.classList.toggle('conn', conn);
      var bar = '<div class="pm-ctl" role="toolbar"><div class="grp" role="group" aria-label="' + esc(T(u.mode)) + '"><button type="button" data-m="hi" class="' + (mode === 'hi' ? 'on' : '') + '">' + esc(T(u.hi)) + '</button><button type="button" data-m="both" class="' + (mode === 'both' ? 'on' : '') + '">' + esc(T(u.both)) + '</button><button type="button" data-m="en" class="' + (mode === 'en' ? 'on' : '') + '">' + esc(T(u.en)) + '</button></div>' +
        '<label><input type="checkbox" data-c="1"' + (conn ? ' checked' : '') + '> ' + esc(T(u.conn)) + '</label><button type="button" class="btn ghost sm" data-play="1" aria-pressed="' + (!!ctl) + '">' + (ctl ? '&#9632; ' + esc(T(u.stop)) : '&#9654; ' + esc(T(u.listen))) + '</button><span class="pm-prog">' + esc(T(u.stanza)) + ' ' + (cur + 1) + ' ' + esc(T(u.of)) + ' ' + n + '</span></div>';
      var body = d.stanzas.map(function (s, i) {
        var links = s.links && s.links.length ? '<div class="pm-links">' + s.links.map(function (k) { return '<a href="' + k.h + '">' + esc(T(k.l)) + '</a>'; }).join('') + '</div>' : '';
        return '<article class="stz2' + (i === cur ? ' cur' : '') + '" data-s="' + i + '" id="st-' + (i + 1) + '"><div class="stz2-n">' + (i + 1) + '</div><div class="l-hi" lang="hi">' + s.hi.map(function (x) { return '<p>' + x + '</p>'; }).join('') + '</div><div class="l-en">' + s.en.map(function (x) { return '<p>' + x + '</p>'; }).join('') + '</div>' + links + '</article>';
      }).join('');
      root.innerHTML = bar + body;
    }
    function setCur(i, scroll) { cur = i; $$('.stz2', root).forEach(function (a, k) { a.classList.toggle('cur', k === i); }); var p = $('.pm-prog', root); if (p) p.textContent = T(d.ui.stanza) + ' ' + (i + 1) + ' ' + T(d.ui.of) + ' ' + n; if (scroll) { var a = $$('.stz2', root)[i]; if (a) a.scrollIntoView({ behavior: EX.reduce ? 'auto' : 'smooth', block: 'center' }); } }
    function stop() { if (ctl) { ctl.stop(); } ctl = null; }
    root.addEventListener('click', function (e) {
      var m = e.target.closest('[data-m]'), a = e.target.closest('.stz2'), pl = e.target.closest('[data-play]'), c = e.target.closest('[data-c]');
      if (m) { mode = m.dataset.m; touched = true; draw(); return; }
      if (c) { conn = c.checked; root.classList.toggle('conn', conn); return; }
      if (pl) {
        if (ctl) { stop(); draw(); return; }
        var useEn = mode === 'en', items = d.stanzas.map(function (s, i) { return { t: (useEn ? s.en : s.hi).join('. '), cb: function () { setCur(i, true); } }; });
        ctl = EX.speakQueue(items, useEn ? 'en-IN' : 'hi-IN', { end: function () { ctl = null; var b = $('[data-play]', root); if (b) { b.setAttribute('aria-pressed', 'false'); b.innerHTML = '&#9654; ' + esc(T(d.ui.listen)); } }, novoice: function () { if (!useEn) EX.toast(T(d.ui.nov)); } });
        var b2 = $('[data-play]', root); if (ctl && b2) { b2.setAttribute('aria-pressed', 'true'); b2.innerHTML = '&#9632; ' + esc(T(d.ui.stop)); }
        return;
      }
      if (a && !e.target.closest('a')) setCur(+a.dataset.s, false);
    });
    D.addEventListener('keydown', function (e) {
      if (D.body.dataset.page !== 'poem.html' || (e.target.tagName || '').toLowerCase() === 'input' || $('.lb:not([hidden])')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' && false) { setCur(Math.min(n - 1, cur + 1), true); }
      if (e.key === 'ArrowLeft') { setCur(Math.max(0, cur - 1), true); }
    });
    addEventListener('pagehide', stop);
    draw(); return function () { stop(); draw(); };
  });

  /* ====================================================================== quiz */
  reg('quiz', function (root, d) {
    var order = d.qs.map(function (_, i) { return i; }), pos = 0, picks = [], score = 0, done = false, answered = false; root.classList.add('quiz-w');
    function shuffle() { for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = order[i]; order[i] = order[j]; order[j] = t; } }
    function reset(sh) { order = d.qs.map(function (_, i) { return i; }); if (sh) shuffle(); pos = 0; picks = []; score = 0; done = false; answered = false; draw(); }
    function draw() {
      var u = d.ui, tot = order.length;
      if (done) {
        var m = Math.min(3, Math.floor(score / tot * 4 - 0.001)); if (score === tot) m = 3; if (m < 0) m = 0;
        root.innerHTML = '<p class="qz-top"><span>' + esc(T(u.score)) + '</span></p><div class="qz-score">' + score + ' / ' + tot + '</div><p class="qz-q">' + esc(T(u.msg[m])) + '</p><div class="qz-act"><button type="button" class="btn" data-a="again">' + esc(T(u.again)) + '</button><button type="button" class="btn alt" data-a="shuf">' + esc(T(u.shuffle)) + '</button><button type="button" class="btn ghost" data-a="copy">' + esc(T(u.copy)) + '</button></div><div class="qz-rev"><h3>' + esc(T(u.review)) + '</h3>' +
          order.map(function (qi, k) { var q = d.qs[qi], ok = picks[k] === q.a; return '<div class="' + (ok ? 'ok' : 'no') + '"><b>' + (k + 1) + '. ' + esc(T(q.q)) + '</b><br>' + esc(T(q.o[q.a])) + '. ' + esc(T(q.e)) + '</div>'; }).join('') + '</div>';
        return;
      }
      var q = d.qs[order[pos]], last = pos === tot - 1;
      root.innerHTML = '<div class="qz-top"><span>' + esc(T(u.q)) + ' ' + (pos + 1) + ' ' + esc(T(u.of)) + ' ' + tot + '</span><span>' + score + ' \u2713</span></div><div class="qz-bar"><i style="width:' + (pos / tot * 100) + '%"></i></div><p class="qz-q">' + esc(T(q.q)) + '</p><div class="qz-opts">' +
        q.o.map(function (o, i) { var c = ''; if (answered) { if (i === q.a) c = ' right'; else if (i === picks[pos]) c = ' wrong'; } return '<button type="button" class="qz-opt' + c + '" data-o="' + i + '"' + (answered ? ' disabled' : '') + '>' + esc(T(o)) + '</button>'; }).join('') + '</div>' +
        (answered ? '<div class="qz-exp" aria-live="polite"><b>' + esc(T(picks[pos] === q.a ? u.right : u.wrong)) + '</b> ' + esc(T(q.e)) + '</div><div class="qz-act"><button type="button" class="btn" data-a="next">' + esc(T(last ? u.finish : u.next)) + '</button></div>' : '');
    }
    root.addEventListener('click', function (e) {
      var o = e.target.closest('[data-o]'), a = e.target.closest('[data-a]');
      if (o && !answered) { var q = d.qs[order[pos]], i = +o.dataset.o; picks[pos] = i; if (i === q.a) score++; answered = true; draw(); }
      if (a) {
        var k = a.dataset.a;
        if (k === 'next') { if (pos === order.length - 1) done = true; else pos++; answered = false; draw(); }
        if (k === 'again') reset(false); if (k === 'shuf') reset(true);
        if (k === 'copy') EX.copy('Not Rape, By Law quiz: ' + score + ' / ' + order.length + ' ' + location.href.split('#')[0]);
      }
    });
    draw(); return draw;
  });

  /* ====================================================================== filter (glossary) */
  reg('filter', function (root) {
    var q = $('#gl-q', root), grid = $('#gl-grid', root), none = $('#gl-none', root), kind = 'all';
    function apply() {
      var qq = q.value.trim().toLowerCase(), shown = 0;
      $$('.gl-item', grid).forEach(function (it) {
        var k = it.dataset.kind, okK = kind === 'all' || (kind === 'terms' && k === 'terms') || (kind === 'people' && k === 'people') || (kind === 'bodies' && k === 'bodies');
        var ok = okK && (!qq || it.dataset.text.indexOf(qq) > -1); it.style.display = ok ? '' : 'none'; if (ok) shown++;
      }); none.hidden = shown > 0;
    }
    q.addEventListener('input', apply);
    $$('#gl-chips .chip', root).forEach(function (c) { c.addEventListener('click', function () { kind = c.dataset.k; $$('#gl-chips .chip', root).forEach(function (x) { x.classList.toggle('on', x === c); }); apply(); }); });
    if (location.hash) { var t = D.getElementById(location.hash.slice(1)); if (t) setTimeout(function () { t.scrollIntoView({ block: 'center' }); }, 300); }
  });


  /* ====================================================================== lightbox */
  function initLightbox() {
    var items = $$('[data-lb]'); if (!items.length) return;
    var box = h('div', 'lb'); box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
    box.innerHTML = '<span class="lb-cnt"></span><button type="button" class="lb-x" aria-label="Close">&times;</button><button type="button" class="lb-p" aria-label="Previous">&larr;</button><img class="lb-img" alt=""><p class="lb-cap"></p><button type="button" class="lb-n" aria-label="Next">&rarr;</button>';
    D.body.appendChild(box);
    var img = $('.lb-img', box), cap = $('.lb-cap', box), cnt = $('.lb-cnt', box), i = 0, last = null;
    function show(k) {
      i = (k + items.length) % items.length; var b = items[i], l = EX.lang();
      img.src = b.dataset.lb; img.alt = (b.querySelector('img') || {}).alt || ''; cap.textContent = l === 'hi' ? b.dataset.capHi : b.dataset.capEn; cnt.textContent = (i + 1) + ' / ' + items.length;
    }
    function open(k) { last = D.activeElement; show(k); box.hidden = false; D.body.style.overflow = 'hidden'; $('.lb-x', box).focus(); }
    function close() { if (box.hidden) return; box.hidden = true; D.body.style.overflow = ''; if (last && last.focus) last.focus(); }
    items.forEach(function (b, k) { b.addEventListener('click', function () { open(k); }); });
    $('.lb-x', box).addEventListener('click', close); $('.lb-p', box).addEventListener('click', function () { show(i - 1); }); $('.lb-n', box).addEventListener('click', function () { show(i + 1); });
    box.addEventListener('mousedown', function (e) { if (e.target === box) close(); });
    D.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') show(i + 1); if (e.key === 'ArrowLeft') show(i - 1);
    }, true);
    EX.onLang(function () { if (!box.hidden) show(i); });
  }

  /* ====================================================================== boot */
  D.addEventListener('DOMContentLoaded', function () {
    initLightbox();
    $$('[data-widget]').forEach(function (root) {
      var name = root.dataset.widget, fn = inits[name]; if (!fn) return;
      var data = root.dataset.src ? J(root.dataset.src) : null;
      try { var redraw = fn(root, data); if (typeof redraw === 'function') EX.onLang(redraw); } catch (err) { console.error('widget ' + name, err); }
    });
  });
})();
