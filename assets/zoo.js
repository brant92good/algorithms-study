/* Algorithm Zoo engine. Exposes window.ZOO. Pair with zoo.css + site.css (theme). */
(function () {
  const ZOO = {};
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));

  /* ---------- renderers: each returns an HTML string ---------- */
  // bars(values, {cls:{i:'cmp|act|done|dim'}, ptr:{i:'lo'}, max})
  ZOO.bars = function (values, o = {}) {
    const max = o.max || Math.max(...values, 1);
    return `<div style="display:flex;align-items:flex-end;gap:.3rem">` + values.map((v, i) => {
      const cls = (o.cls && o.cls[i]) ? ' ' + o.cls[i] : '';
      const ptr = (o.ptr && o.ptr[i]) ? `<div class="ptr">${esc(o.ptr[i])}</div>` : `<div class="ptr"></div>`;
      const h = Math.round(18 + 78 * (v / max));
      return `<div class="bar${cls}">${ptr}<div class="col" style="height:${h}px"></div><div class="val">${esc(v)}</div></div>`;
    }).join('') + `</div>`;
  };

  // grid(matrix, {rows:[..], cols:[..], cls:{"r,c":'act|dep|path'}, blank:'?'}) — matrix[r][c], null => blank
  ZOO.grid = function (m, o = {}) {
    let h = '<table class="dp">';
    if (o.cols) h += '<tr><th></th>' + o.cols.map(c => `<th>${esc(c)}</th>`).join('') + '</tr>';
    for (let r = 0; r < m.length; r++) {
      h += '<tr>';
      if (o.rows) h += `<th>${esc(o.rows[r])}</th>`;
      for (let c = 0; c < m[r].length; c++) {
        const k = r + ',' + c, cls = (o.cls && o.cls[k]) ? ` class="${o.cls[k]}"` : '';
        const v = m[r][c]; h += `<td${cls}>${v === null || v === undefined ? (o.blank || '') : esc(v)}</td>`;
      }
      h += '</tr>';
    }
    return h + '</table>';
  };

  // graph({nodes:[{id,x,y,label}], edges:[{u,v,w,dir}]}, {node:{id:'done'},edge:{'u-v':'tree'},badge:{id:'5'}})
  ZOO.graph = function (g, s = {}) {
    const pos = {}; g.nodes.forEach(n => pos[n.id] = n);
    let svg = `<svg viewBox="0 0 100 100" preserveAspectRatio="none">`;
    let labels = '';
    g.edges.forEach(e => {
      const a = pos[e.u], b = pos[e.v];
      const k1 = e.u + '-' + e.v, k2 = e.v + '-' + e.u;
      const ec = (s.edge && (s.edge[k1] || s.edge[k2])) ? ' ' + (s.edge[k1] || s.edge[k2]) : '';
      svg += `<line class="edge${ec}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`;
      if (e.w !== undefined) labels += `<div class="ew" style="position:absolute;left:${(a.x + b.x) / 2}%;top:${(a.y + b.y) / 2}%;transform:translate(-50%,-50%)">${esc(e.w)}</div>`;
    });
    svg += `</svg>`;
    const nodes = g.nodes.map(n => {
      const nc = (s.node && s.node[n.id]) ? ' ' + s.node[n.id] : '';
      const bd = (s.badge && s.badge[n.id] !== undefined) ? `<span class="badge" style="left:${n.x}%;top:${n.y}%">${esc(s.badge[n.id])}</span>` : '';
      return `<div class="node${nc}" style="left:${n.x}%;top:${n.y}%">${esc(n.label !== undefined ? n.label : n.id)}</div>${bd}`;
    }).join('');
    return `<div class="graph">${svg}${labels}${nodes}</div>`;
  };

  ZOO.lane = function (label, tokens) {
    return `<div class="lane">${esc(label)}: ${tokens.length ? tokens.map(t => `<span class="tok">${esc(t)}</span>`).join('') : '∅'}</div>`;
  };

  // board(n, cols, {bad:[[r,c],...]}) cols[r] = column of queen in row r, or -1
  ZOO.board = function (n, cols, o = {}) {
    const bad = new Set((o.bad || []).map(p => p[0] + ',' + p[1]));
    let h = `<div class="board" style="grid-template-columns:repeat(${n},2rem)">`;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      const dark = (r + c) % 2, b = bad.has(r + ',' + c) ? ' bad' : '';
      h += `<div class="sq ${dark ? 'dk' : 'lt'}${b}">${cols[r] === c ? '♛' : ''}</div>`;
    }
    return h + '</div>';
  };

  /* ---------- step player ---------- */
  // ZOO.stepper({mount:'#viz', frames:[...], render:(frame,stageEl)=>{}, caption:(frame)=>'text'})
  ZOO.stepper = function (opts) {
    const root = typeof opts.mount === 'string' ? document.querySelector(opts.mount) : opts.mount;
    if (!root) return;
    const frames = opts.frames, N = frames.length;
    root.classList.add('viz');
    root.innerHTML =
      `<div class="stage"></div><div class="cap"></div>
       <div class="controls">
         <button class="ctl" data-a="reset" title="Restart">⟲</button>
         <button class="ctl" data-a="prev">‹ Prev</button>
         <button class="ctl play" data-a="play">▶ Play</button>
         <button class="ctl" data-a="next">Next ›</button>
         <span class="step-n"></span><div class="dots"></div>
       </div>`;
    const stage = root.querySelector('.stage'), cap = root.querySelector('.cap');
    const dots = root.querySelector('.dots'), stepn = root.querySelector('.step-n');
    dots.innerHTML = frames.map((_, i) => `<span class="dot" data-i="${i}"></span>`).join('');
    const playBtn = root.querySelector('[data-a=play]');
    let i = 0, timer = null;
    function draw() {
      opts.render(frames[i], stage);
      cap.innerHTML = opts.caption ? opts.caption(frames[i], i) : (frames[i].cap || '');
      stepn.textContent = `${i + 1}/${N}`;
      dots.querySelectorAll('.dot').forEach((d, k) => d.classList.toggle('on', k <= i));
      root.querySelector('[data-a=prev]').disabled = i === 0;
      root.querySelector('[data-a=next]').disabled = i === N - 1;
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; playBtn.textContent = '▶ Play'; playBtn.classList.add('play'); } }
    function play() {
      if (timer) return stop();
      if (i === N - 1) { i = 0; draw(); }
      playBtn.textContent = '❚❚ Pause'; playBtn.classList.remove('play');
      timer = setInterval(() => { if (i < N - 1) { i++; draw(); } else stop(); }, 1150);
    }
    root.addEventListener('click', e => {
      const a = e.target.closest('[data-a]'); if (a) {
        const act = a.dataset.a;
        if (act === 'next') { stop(); if (i < N - 1) i++; draw(); }
        else if (act === 'prev') { stop(); if (i > 0) i--; draw(); }
        else if (act === 'reset') { stop(); i = 0; draw(); }
        else if (act === 'play') play();
        return;
      }
      const d = e.target.closest('.dot'); if (d) { stop(); i = +d.dataset.i; draw(); }
    });
    draw();
  };

  /* ---------- learned progress (localStorage) ---------- */
  const KEY = 'zoo:learned';
  const load = () => { try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch (e) { return new Set(); } };
  const save = (set) => localStorage.setItem(KEY, JSON.stringify([...set]));
  ZOO.learnedSet = load;
  ZOO.markLearned = function (id, on) { const s = load(); on ? s.add(id) : s.delete(id); save(s); return s; };

  function wireLearnButtons() {
    document.querySelectorAll('[data-learn]').forEach(btn => {
      const id = btn.dataset.learn, set = load(), on = set.has(id);
      btn.classList.toggle('on', on); btn.textContent = on ? '✓ Learned' : 'Mark as learned';
      btn.addEventListener('click', () => {
        const now = !btn.classList.contains('on');
        ZOO.markLearned(id, now); btn.classList.toggle('on', now);
        btn.textContent = now ? '✓ Learned' : 'Mark as learned';
      });
    });
  }
  // index page: <a class="algo" data-id="..."> ... ; <div class="progwrap"><div class="bar"></div></div> #prog-count
  ZOO.renderProgress = function () {
    const set = load(), cards = document.querySelectorAll('.algo[data-id]');
    let done = 0;
    cards.forEach(c => { const has = set.has(c.dataset.id); c.classList.toggle('learned', has); if (has) done++; });
    const bar = document.querySelector('.progwrap .bar'), cnt = document.getElementById('prog-count');
    const total = cards.length || 1;
    if (bar) bar.style.width = Math.round(100 * done / total) + '%';
    if (cnt) cnt.textContent = `${done} / ${cards.length} learned`;
  };

  /* ---------- quiz (shared with lessons) ---------- */
  function wireQuizzes() {
    const quizzes = document.querySelectorAll('.quiz'); if (!quizzes.length) return;
    let total = quizzes.length, answered = 0, right = 0;
    const scoreEl = document.getElementById('score');
    const upd = () => { if (scoreEl) scoreEl.textContent = right + ' / ' + total + (answered < total ? ' · ' + answered + ' answered' : ' — done'); };
    quizzes.forEach(q => {
      const correct = +q.dataset.correct, explain = q.dataset.explain || '';
      const opts = q.querySelectorAll('.opt'), fb = q.querySelector('.fb');
      opts.forEach((o, i) => o.addEventListener('click', () => {
        if (q.dataset.done) return; q.dataset.done = '1'; answered++;
        opts.forEach(x => x.disabled = true);
        if (i === correct) { o.classList.add('correct'); right++; fb.className = 'fb ok'; fb.innerHTML = '<span class="v">✓ Correct.</span> ' + explain; }
        else { o.classList.add('wrong'); opts[correct].classList.add('correct'); fb.className = 'fb no'; fb.innerHTML = '<span class="v">✗ Not quite — ' + String.fromCharCode(65 + correct) + ' is right.</span> ' + explain; }
        upd();
      }));
    });
    upd();
  }

  function init() { wireLearnButtons(); wireQuizzes(); ZOO.renderProgress(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.addEventListener('storage', () => ZOO.renderProgress());
  window.ZOO = ZOO;
})();
