// 오더담 메인: 작업물 타일 12장(작업물 3개 × 그림 4장)을 세로·가로·그리드로 배치한다.
// 세 보기는 같은 타일을 쓰고, 보기를 바꾸면 각 타일이 지금 자리에서 다음 자리로 움직인다.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement, body = document.body;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = (s) => ((ax * s + bx) * s + cx) * s, Y = (s) => ((ay * s + by) * s + cy) * s, dX = (s) => (3 * ax * s + 2 * bx) * s + cx;
    return (t) => { if (t <= 0) return 0; if (t >= 1) return 1; let s = t; for (let i = 0; i < 8; i++) { const d = dX(s); if (Math.abs(d) < 1e-6) break; s -= (X(s) - t) / d; } return Y(clamp(s)); };
  }
  const E1 = bezier(.16, 1, .3, 1);       // 원본에서 쓰는 감속 곡선
  const EIO = bezier(.65, 0, .35, 1);

  // ── 작업물 데이터 (실제 작업물 3개)
  const P = [
    { id: 'to', no: '01', name: '오더담 테이블 오더', sn: '테이블 오더', tags: '외식, 주문·결제', svc: '기획, 디자인, 웹·앱 개발, 운영', href: 'table-order.html' },
    { id: 'sono', no: '02', name: 'SONO', tags: '웹소설, 글쓰기 도구', svc: '기획, 디자인, 웹 개발, 운영', href: '#sono' },
    { id: 'paws', no: '03', name: '포우즈 Paws', tags: '반려동물, 장소 찾기', svc: '기획, 디자인, 웹 개발', href: 'https://paws-neighborhood-life.hskim3514253.chatgpt.site', ext: true },
  ];
  // 줄에 놓이는 순서: 작업물 1·2·3이 네 번 반복되고, 매번 다른 그림을 쓴다. [작업물, 그림, 가로세로비]
  // 흑백 사진(photo:파일번호:위치)은 각 작업의 분위기를 보여 주는 사진이다 — 작업물 수는 그대로 3개
  const STRIP = [
    [0, 'nfc-cafe', 1.59], [1, 'photo:d183:50% 50%', 1.3], [2, 'paws-m', .7],
    [0, 'photo:c141:35% 55%', .8], [1, 'sono-notes', .82], [2, 'photo:767:50% 50%', 1.5],
    [0, 'phone-menu', .8], [1, 'photo:c822:30% 50%', 1], [2, 'photo:190:50% 50%', .75],
    [0, 'photo:c167:62% 55%', 1.4], [1, 'sono-graph', 1.2], [2, 'paws-d', 1.6],
    [0, 'photo:m61714648:60% 70%', .7], [1, 'photo:d204:50% 50%', 1.25], [2, 'photo:606:50% 60%', 1],
    [0, 'owner', 1.3], [1, 'photo:c877:50% 50%', .85], [2, 'photo:317:50% 50%', 1.45],
    [0, 'nfc-thinker', 1.5], [1, 'sono-type', 1.5],
  ];
  const N = STRIP.length;
  // 그리드 자리 [줄, 칸] — 가운데 심벌 자리는 비운다
  const CELLS_D = [[0, 0], [0, 2], [0, 4], [0, 7], [0, 9], [0, 11], [1, 1], [1, 3], [1, 8], [1, 10], [2, 0], [2, 2], [2, 9], [2, 11], [3, 1], [3, 3], [3, 5], [3, 6], [3, 8], [3, 10]];
  const CELLS_M = [[0, 0], [0, 1], [0, 2], [0, 3], [1, 0], [1, 1], [1, 2], [1, 3], [2, 0], [2, 3], [3, 0], [3, 3], [4, 0], [4, 1], [4, 2], [4, 3], [5, 0], [5, 1], [5, 2], [5, 3]];

  const stage = $('#stage');
  const tiles = STRIP.map(([pi, art, ar], i) => {
    const p = P[pi];
    const a = document.createElement('a');
    a.className = 'tile';
    a.href = p.href;
    if (p.ext) { a.target = '_blank'; a.rel = 'noopener'; }
    a.dataset.i = i;
    a.draggable = false;
    const first = STRIP.findIndex((s) => s[0] === pi) === i;
    if (first) a.setAttribute('aria-label', `${p.no} ${p.name}${p.ext ? ' (새 창)' : ''}`);
    else { a.tabIndex = -1; a.setAttribute('aria-hidden', 'true'); }
    a.innerHTML = `<div class="tile-art">${ODArt.art(art)}</div>`;
    stage.appendChild(a);
    return { el: a, pi, art, ar, h: 0, p: 0, cur: { x: 0, y: 0, r: 0, s: 1, o: 0 } };
  });
  ODArt.paint(stage);

  // ── 크기 계산
  let rem = 10, vw = 0, vh = 0, mobile = false, TW = 0, GAP = 0, L = 0, D = 0, symW = 0, colW = 0, gridGap = 0;
  function measure() {
    rem = parseFloat(getComputedStyle(html).fontSize);
    vw = innerWidth; vh = innerHeight; mobile = vw < 768;
    TW = mobile ? 15 * rem : 18.4 * rem;   // 휴대폰: 양옆에 목록과 정보가 들어갈 자리를 남긴다
    GAP = .5 * rem;
    symW = (mobile ? 15 : 16) * rem;
    D = TW * (mobile ? 1.03 : 1.076) / 2 + (mobile ? 1.2 : 8.1) * rem;   // 세로 보기에서 심벌 두 조각이 벌어지는 거리
    let acc = 0;
    tiles.forEach((t, i) => {
      t.h = TW / t.ar;
      t.p = i === 0 ? 0 : acc + tiles[i - 1].h / 2 + GAP + t.h / 2;
      acc = t.p;
      t.el.style.setProperty('--tw', `${TW}px`);
      t.el.style.setProperty('--th', `${t.h}px`);
    });
    L = acc + tiles[N - 1].h / 2 + GAP + tiles[0].h / 2;
    const cols = mobile ? 4 : 12;
    colW = (vw - 2 * rem - (cols - 1) * rem) / cols;
    gridGap = (mobile ? 2.2 : 5.5) * rem;
  }
  const wrap = (v) => { v = ((v % L) + L) % L; return v > L / 2 ? v - L : v; };

  // ── 상태
  let view = 'v', page = 'work';
  let S = 0, T = 0;                 // 줄을 따라 움직인 거리(현재, 목표)
  let theta = 0;                    // 줄의 각도 (세로 0°, 가로 -90°)
  let tr = null;                    // 진행 중인 전환
  let active = 0, shownI = -1, activeP = -1, hovered = -1;
  let ready = false;                // 오프닝이 끝나 입력을 받는지
  let introK = { below: 1, above: 1 }; // 오프닝: 줄이 심벌에서 아래·위로 펼쳐진 정도

  // ── 타일 자리
  function linePose(i, th) {
    const t = tiles[i];
    const a = wrap(t.p - S);
    const act = tiles[active];
    const near = clamp(1 - Math.abs(a) / (t.h * .9));
    const s = 1 + (mobile ? .03 : .076) * near;
    // 가로로 누운 만큼, 가운데 타일 양옆을 벌려 심벌 두 조각이 들어갈 자리를 만든다
    const need = TW * (mobile ? 1.03 : 1.076) / 2 + (mobile ? .6 : 1.2) * rem + symW * .22 + 2 * rem - (act.h * (1 + (mobile ? .03 : .076))) / 2 - GAP;
    const E = Math.max(0, need) * clamp(-th / 90);
    const push = E * clamp(Math.abs(a) / (act.h / 2 + GAP)) * Math.sign(a);
    let aa = a + push;
    // 오프닝: 아래쪽부터, 그다음 위쪽이 심벌에서 펼쳐진다
    const k = aa >= 0 ? introK.below : introK.above;
    const o = k <= 0 ? 0 : 1;
    aa *= k;
    const rad = th * Math.PI / 180;
    return { x: -aa * Math.sin(rad), y: aa * Math.cos(rad), r: th, s, o };
  }
  const NO_HOVER = matchMedia('(hover: none)').matches;
  function gridPose(i) {
    const t = tiles[i];
    const [row, col] = (mobile ? CELLS_M : CELLS_D)[i];
    const rows = mobile ? 6 : 4;
    const gs = colW / TW;
    const rowH = Math.max(...tiles.map((x) => x.h)) * gs * .78;
    const total = rows * rowH + (rows - 1) * gridGap;
    const top = (vh - total) / 2;
    const h = t.h * gs;
    const x = -vw / 2 + rem + col * (colW + rem) + colW / 2;
    const y = -vh / 2 + top + row * (rowH + gridGap) + h / 2;
    return { x, y, r: 0, s: gs, o: NO_HOVER ? 1 : .26 };   // 마우스를 올릴 수 없는 기기에서는 처음부터 또렷하게
  }
  function hiddenPose(i) {   // 소개·SONO 화면으로 갈 때 타일은 심벌 쪽으로 모여 사라진다
    const c = tiles[i].cur;
    return { x: c.x * .35, y: c.y * .35, r: c.r, s: c.s * .7, o: 0 };
  }
  function targetPose(i) {
    if (page !== 'work') return hiddenPose(i);
    if (view === 'g') return gridPose(i);
    return linePose(i, theta);
  }

  function nearestIndex() {
    let best = 0, bd = Infinity;
    tiles.forEach((t, i) => { const d = Math.abs(wrap(t.p - S)); if (d < bd) { bd = d; best = i; } });
    return best;
  }

  // ── 보기 전환. 끝나기 전에 다른 입력이 오면 지금 자리에서 새 목표로 다시 출발한다
  function startTween(kind, dur) {
    const now = performance.now();
    if (kind === 'line') tr = { kind, t0: now, dur, th0: theta, th1: view === 'h' ? -90 : 0 };
    else {
      tr = { kind: 'free', t0: now, dur, from: tiles.map((t) => ({ ...t.cur })), mid: view === 'g' ? -16 : 12,
        delay: tiles.map((t, i) => (REDUCE ? 0 : (view === 'g' ? 0 : 1) * Math.abs(wrap(t.p - S)) / (vh * 3) * 220)) };
      if (view !== 'g') theta = view === 'h' ? -90 : 0;
    }
  }
  function setView(v, opts = {}) {
    if (v === view && !opts.force) return;
    const prev = view;
    view = v;
    body.dataset.view = v;
    $$('#modes button').forEach((b) => { const on = b.dataset.mode === v; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
    html.classList.toggle('is-shrink', v === 'g' || page !== 'work');
    $('#fix').classList.toggle('is-hidden', v === 'g' || page === 'sono');
    if (REDUCE || opts.instant) { tr = null; if (v !== 'g') theta = v === 'h' ? -90 : 0; }
    else if (prev !== 'g' && v !== 'g' && (!tr || tr.kind === 'line')) startTween('line', 1100);
    else startTween('free', 1200);
    if (v !== 'g') clearHover();
    updateSpread();
    save();
  }

  // ── 심벌: 줄 보기에서는 벌어지고, 그리드에서는 닫힌다 (그리드에서 마우스를 올리면 다시 벌어진다)
  let lastSpread = null;
  function updateSpread() {
    let sp = 0;
    const open = Math.max(0, TW * (mobile ? 1.03 : 1.076) / 2 + (mobile ? .6 : 1.2) * rem - symW * .25);
    if (page === 'work' && ready) sp = view === 'g' ? (hovered >= 0 ? open : 0) : open;
    // 심벌은 SVG라 이동 거리를 그림 단위(가로 100)로 바꿔 준다
    if (sp !== lastSpread) { $('#sym').style.setProperty('--spread', `${(sp / (symW / 100)).toFixed(3)}px`); lastSpread = sp; }
  }

  // ── 목록과 정보 줄
  const tiV = $('#ti-v > div'), tiH = $('#ti-h > div');
  function buildLists() {
    const mk = (cont, focusable) => {
      cont.innerHTML = '';
      for (let c = 0; c < 3; c++) STRIP.forEach(([pi], i) => {
        const p = P[pi], a = document.createElement('a');
        a.href = p.href; a.textContent = cont === tiV && innerWidth < 768 && p.sn ? p.sn : p.name; a.dataset.i = i;   // 휴대폰 왼쪽 목록은 좁아서 짧은 이름을 쓴다
        if (p.ext) { a.target = '_blank'; a.rel = 'noopener'; }
        const isFirst = c === 1 && STRIP.findIndex((s) => s[0] === pi) === i;
        if (!(focusable && isFirst)) { a.tabIndex = -1; a.setAttribute('aria-hidden', 'true'); }
        cont.appendChild(a);
      });
    };
    mk(tiV, true); mk(tiH, false);
    const rowsV = P.map((p) => `<div class="me-row"><span class="nm">${p.name}</span><span>${p.tags}</span><span>${p.svc}</span><span>${p.no}</span></div>`).join('');
    $('#me-v .me-in').innerHTML = rowsV;
    $('#me-h .me-in').innerHTML = P.map((p) => `<div class="me-row"><span>${p.no}</span><span>${p.tags}</span></div>`).join('');
  }
  function lineH() { return parseFloat(getComputedStyle(body).fontSize) * 1.32; }
  function updateLists() {
    const i = nearestIndex();
    const a = wrap(tiles[i].p - S);
    const span = a >= 0 ? (tiles[i].h / 2 + GAP + tiles[(i - 1 + N) % N].h / 2) : (tiles[i].h / 2 + GAP + tiles[(i + 1) % N].h / 2);
    let f = i - a / span;
    f = ((f % N) + N) % N;
    const lh = lineH();
    const hv = $('#ti-v').clientHeight;
    tiV.style.transform = `translate3d(0, ${(hv / 2 - lh / 2 - (f + N) * lh).toFixed(2)}px, 0)`;
    const rowY = 24.5 * rem - rem - 12.25 * rem + 1.425 * rem;
    tiH.style.transform = `translate3d(0, ${(rowY - lh / 2 - (f + N) * lh).toFixed(2)}px, 0)`;
    active = i;
    if (i !== shownI) {
      shownI = i;
      [tiV, tiH].forEach((c) => [...c.children].forEach((el) => el.classList.toggle('is-on', +el.dataset.i === i)));
    }
    if (tiles[i].pi !== activeP) {
      activeP = tiles[i].pi;
      $$('#me-v .me-row, #me-h .me-row').forEach((r, k) => r.classList.toggle('is-on', k % P.length === activeP));
      save();
    }
  }

  // ── 그리드: 마우스를 올린 작업을 심벌 안에 보여 준다
  const win = $('#win'), winIn = $('.win-in');
  let hoverTimer = 0;
  function showWin(artName, w, h) {
    winIn.innerHTML = `<div class="tile-art" style="container-type:size">${ODArt.art(artName)}</div>`;
    ODArt.paint(winIn);
    win.style.setProperty('--win-w', `${w}px`);
    win.style.setProperty('--win-h', `${h}px`);
    win.classList.remove('is-on'); void win.offsetWidth; win.classList.add('is-on');
  }
  function hideWin() { win.classList.remove('is-on'); }
  function setHover(i) {
    clearTimeout(hoverTimer);
    if (i === hovered) return;
    if (hovered >= 0) tiles[hovered].el.classList.remove('is-hv');
    hovered = i;
    const t = tiles[i], p = P[t.pi];
    t.el.classList.add('is-hv');
    showWin(t.art, colW, colW / t.ar);
    const sp = $$('#me-g span');
    [p.name, p.tags, p.svc, p.no].forEach((txt, k) => { sp[k].textContent = txt; });
    $('#me-g').classList.remove('is-on'); $('#big').classList.remove('is-on');
    $('#big span').textContent = p.name;
    requestAnimationFrame(() => { $('#me-g').classList.add('is-on'); $('#big').classList.add('is-on'); });
    updateSpread();
  }
  function clearHover() {
    if (hovered >= 0) tiles[hovered].el.classList.remove('is-hv');
    hovered = -1;
    hideWin();
    $('#me-g').classList.remove('is-on'); $('#big').classList.remove('is-on');
    updateSpread();
  }

  // ── 그리기
  let raf = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!dragging) S = REDUCE ? T : lerp(S, T, .11);
    if (Math.abs(S - T) < .05) S = T;
    if (tr && tr.kind === 'line') {
      const k = clamp((now - tr.t0) / tr.dur);
      theta = lerp(tr.th0, tr.th1, E1(k));
      if (k >= 1) tr = null;
    }
    let done = true;
    tiles.forEach((t, i) => {
      const to = targetPose(i);
      let p = to;
      if (tr && tr.kind === 'free') {
        const k = clamp((now - tr.t0 - tr.delay[i]) / tr.dur);
        if (k < 1) done = false;
        const e = E1(k), f = tr.from[i];
        p = {
          x: lerp(f.x, to.x, e), y: lerp(f.y, to.y, e),
          r: lerp(f.r, to.r, e) + tr.mid * Math.sin(Math.PI * clamp(k * 1.15)),
          s: lerp(f.s, to.s, e), o: lerp(f.o, to.o, clamp(e * 1.4)),
        };
      }
      t.cur = p;
      const off = Math.abs(p.x) > vw * .9 + TW || Math.abs(p.y) > vh * .9 + TW;
      t.el.style.visibility = off || p.o < .005 ? 'hidden' : '';
      t.el.style.transform = `translate3d(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px, 0) rotate(${p.r.toFixed(3)}deg) scale(${p.s.toFixed(4)})`;
      t.el.style.opacity = p.o.toFixed(3);
      t.el.style.zIndex = i === active ? 2 : 1;
    });
    if (tr && tr.kind === 'free' && done) tr = null;
    updateLists();
  }

  // ── 스크롤·끌기·키보드
  let snapTimer = 0;
  function snap() {
    let best = 0, bd = Infinity;
    tiles.forEach((t, i) => { const d = Math.abs(wrap(t.p - T)); if (d < bd) { bd = d; best = i; } });
    T += wrap(tiles[best].p - T);
  }
  function nudge(d) {
    T += d;
    clearTimeout(snapTimer);
    snapTimer = setTimeout(snap, 160);
  }
  addEventListener('wheel', (e) => {
    if (page !== 'work' || !ready) return;
    if (view === 'g') return;
    e.preventDefault();
    const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? vh : 1;
    nudge((Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * k);
  }, { passive: false });

  let dragging = false, dragMoved = false, d0 = null;
  stage.addEventListener('pointerdown', (e) => {
    if (!ready || page !== 'work' || view === 'g' || e.button !== 0) return;
    d0 = { x: e.clientX, y: e.clientY, S: S, t: performance.now(), lastX: e.clientX, lastY: e.clientY, lastT: performance.now(), v: 0 };
    dragMoved = false;
  });
  addEventListener('pointermove', (e) => {
    if (!d0) return;
    const dx = e.clientX - d0.x, dy = e.clientY - d0.y;
    if (!dragging && Math.hypot(dx, dy) > 6) { dragging = true; dragMoved = true; stage.setPointerCapture && stage.setPointerCapture(e.pointerId); }
    if (!dragging) return;
    const d = view === 'h' ? dx : dy;
    const now = performance.now();
    const inst = (view === 'h' ? e.clientX - d0.lastX : e.clientY - d0.lastY) / Math.max(1, now - d0.lastT);
    d0.v = lerp(d0.v, inst, .5); d0.lastX = e.clientX; d0.lastY = e.clientY; d0.lastT = now;
    S = T = d0.S - d;
  });
  const endDrag = () => {
    if (!d0) return;
    if (dragging) { T = S - d0.v * 260; snap(); }
    dragging = false; d0 = null;
  };
  addEventListener('pointerup', endDrag);
  addEventListener('pointercancel', endDrag);
  stage.addEventListener('click', (e) => { if (dragMoved) { e.preventDefault(); e.stopPropagation(); dragMoved = false; } }, true);

  addEventListener('keydown', (e) => {
    if (page !== 'work' || !ready || view === 'g') return;
    if (e.target.closest && e.target.closest('input, textarea')) return;
    const next = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!next) return;
    e.preventDefault();
    const i = (nearestIndex() + next + N) % N;
    T += wrap(tiles[i].p - T);
  });

  // 목록 이름을 누르면 그 작업으로 이동해 연다 (원본도 이름이 상세로 가는 링크다)
  [tiV, tiH].forEach((c) => c.addEventListener('click', (e) => {
    const a = e.target.closest('a'); if (!a) return;
    openTile(+a.dataset.i, e);
  }));
  stage.addEventListener('click', (e) => {
    const a = e.target.closest('.tile'); if (!a) return;
    openTile(+a.dataset.i, e);
  });
  function openTile(i, e) {
    const p = P[tiles[i].pi];
    T += wrap(tiles[i].p - T);
    save();
    if (p.ext) return;                      // 새 창으로 열리는 기본 동작
    e.preventDefault();
    if (p.href.startsWith('#')) { history.pushState({ fromWork: true }, '', p.href); route(); return; }
    html.classList.add('is-leaving');
    setTimeout(() => { location.href = p.href; }, REDUCE ? 0 : 280);
  }

  if (FINE) {
    stage.addEventListener('pointerover', (e) => {
      if (view !== 'g' || page !== 'work' || !ready) return;
      const a = e.target.closest('.tile'); if (a) setHover(+a.dataset.i);
    });
    stage.addEventListener('pointerout', (e) => {
      if (view !== 'g') return;
      const to = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.tile');
      if (!to) { clearTimeout(hoverTimer); hoverTimer = setTimeout(clearHover, 60); }
    });
  }
  $$('#modes button').forEach((b) => b.addEventListener('click', () => { if (ready) setView(b.dataset.mode); }));

  // ── 소개 화면: 스크롤하면 심벌이 커지고 그 안에서 일하는 방식 다섯 단계가 바뀐다
  const about = $('#about');
  const STEP_ART = ['sono-notes', 'nfc-cafe', 'owner', 'phone-menu', 'paws-d'];
  const stepBtns = $$('.ab-steps button'), stepTxt = $$('.ab-step-text p');
  let step = -1;
  function setStep(k) {
    if (k === step) return;
    step = k;
    stepBtns.forEach((b, j) => { b.classList.toggle('is-on', j === k); b.setAttribute('aria-pressed', String(j === k)); });
    stepTxt.forEach((p, j) => p.classList.toggle('is-on', j === k));
    $('#step-n').textContent = String(k + 1).padStart(2, '0');
    if (page === 'about') showWin(STEP_ART[k], (mobile ? 10 : 15) * rem, (mobile ? 10 : 15) * rem / 1.25);
  }
  function aboutScroll() {
    if (page !== 'about') return;
    const sc = $('.ab-scene');
    const top = sc.offsetTop, h = sc.offsetHeight - about.clientHeight;
    const q = clamp((about.scrollTop - top + about.clientHeight * .5) / (h + about.clientHeight * .5));
    const sym = $('#sym');
    const big = Math.min(vh * .86, vw * (mobile ? .9 : .62));
    const grow = EIO(clamp(q / .16)), shrink = EIO(clamp((q - .86) / .14));
    const w = lerp(lerp(symW, big, grow), symW, shrink);
    const startY = vh * .5 - symW * .3;
    const y = lerp(lerp(startY, 0, grow), -vh * .5 - symW, shrink);
    sym.style.setProperty('--sym-w', `${w}px`);
    sym.style.setProperty('--sym-y', `${y}px`);
    win.style.setProperty('--sym-y', `${y}px`);
    $('#fix').classList.toggle('is-hidden', about.scrollTop > vh * .45);
    const inScene = q > .12 && q < .9;
    win.classList.toggle('is-on', inScene);
    if (inScene) setStep(Math.min(4, Math.floor(clamp((q - .16) / .7) * 5)));
  }
  about.addEventListener('scroll', aboutScroll, { passive: true });
  stepBtns.forEach((b, k) => b.addEventListener('click', () => {
    const sc = $('.ab-scene');
    const h = sc.offsetHeight - about.clientHeight;
    const q = .16 + (k + .5) / 5 * .7;
    const y = q * (h + about.clientHeight * .5) + sc.offsetTop - about.clientHeight * .5;
    step = -1; setStep(k);
    about.scrollTo({ top: y, behavior: REDUCE ? 'auto' : 'smooth' });
  }));

  // ── 화면 이동 (#work, #about, #sono) — 뒤로 가기로 오갈 수 있다
  function route() {
    const h = location.hash.replace('#', '');
    const next = h === 'about' || h === 'process' || h === 'contact' ? 'about' : h === 'sono' ? 'sono' : 'work';
    showPage(next, h);
  }
  function showPage(next, anchor) {
    const prev = page;
    page = next;
    body.dataset.page = next;
    $$('#hd-menu a').forEach((a) => a.classList.toggle('is-on', a.dataset.nav === (next === 'about' ? 'about' : 'work')));
    html.classList.toggle('is-shrink', view === 'g' || next !== 'work');
    $('#fix').classList.toggle('is-hidden', (view === 'g' && next === 'work') || next === 'sono');
    const sym = $('#sym');
    if (next === 'about') {
      sym.classList.add('no-t');
      if (prev !== 'about') { about.scrollTop = 0; if (anchor === 'process' || anchor === 'contact') requestAnimationFrame(() => { $('#' + anchor).scrollIntoView(); }); }
      const ghost = $('.ab-ghost'); if (!ghost.firstChild) { ghost.innerHTML = `<div class="tile-art" style="container-type:size">${ODArt.art('owner')}</div>`; }
      step = -1; setStep(0); hideWin();
      requestAnimationFrame(aboutScroll);
      $$('.split', about).forEach((el) => el.classList.add('is-shown'));
    } else {
      sym.classList.remove('no-t');
      sym.style.removeProperty('--sym-w'); sym.style.removeProperty('--sym-y'); win.style.removeProperty('--sym-y');
      hideWin();
    }
    if (next === 'sono') { $('#sono').scrollTop = 0; }
    clearHover();
    if (prev !== next) startTween('free', next === 'work' ? 1100 : 700);
    lastSpread = null; updateSpread();
    save();
  }
  addEventListener('hashchange', route);
  $$('[data-back]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    if (history.state && history.state.fromWork) history.back(); else location.hash = '#work';
  }));
  // 소개·SONO로 갈 때 "작업에서 왔다"는 표시를 남겨 뒤로 버튼이 브라우저 뒤로와 같게 움직이게 한다
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const h = a.getAttribute('href');
    if ((h === '#sono' || h === '#about') && page === 'work') { e.preventDefault(); history.pushState({ fromWork: true }, '', h); route(); }
  });
  addEventListener('popstate', route);

  // ── 상단 시계와 상담
  const clock = $('#clock');
  const tick = () => { clock.textContent = 'KST ' + new Date().toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul', hour: 'numeric', minute: '2-digit' }); };
  tick(); setInterval(tick, 15000);
  const contact = $('#hd-contact');
  if (FINE) contact.addEventListener('click', (e) => {
    // 마우스로 누르면 번호를 복사하고, 휴대폰에서는 기본 동작(전화 걸기)을 그대로 둔다
    if (!navigator.clipboard) return;
    e.preventDefault();
    navigator.clipboard.writeText('010-9284-5963').then(() => {
      contact.textContent = '번호 복사됨';
      setTimeout(() => { contact.textContent = '상담'; }, 1800);
    }, () => { location.href = 'tel:01092845963'; });
  });

  // ── 글줄 나누기: 문단을 실제 줄 단위로 감싸 아래에서 올라오게 한다
  function split(el) {
    if (!el.dataset.src) el.dataset.src = el.innerHTML;
    el.innerHTML = el.dataset.src;
    const parts = [];
    [...el.childNodes].forEach((n) => {
      if (n.nodeType === 3) n.textContent.split(/(s+)/).forEach((w) => {
        if (!w) return;
        if (/^s+$/.test(w)) parts.push(document.createTextNode(w));
        else { const sp = document.createElement('span'); sp.textContent = w; parts.push(sp); }
      });
      else if (n.nodeName === 'A' && /s/.test(n.textContent.trim())) {
        n.textContent.trim().split(/(s+)/).forEach((w) => {
          if (/^s+$/.test(w)) { parts.push(document.createTextNode(w)); return; }
          const sp = document.createElement('span'); const a = n.cloneNode(false); a.textContent = w; sp.appendChild(a); parts.push(sp);
        });
      }
      else { const sp = document.createElement('span'); sp.appendChild(n.cloneNode(true)); parts.push(sp); }
    });
    el.innerHTML = '';
    parts.forEach((p) => el.appendChild(p));
    const lines = []; let last = null;
    parts.forEach((p) => {
      if (p.nodeType === 3) { if (lines.length) lines[lines.length - 1].push(p); return; }
      const top = p.offsetTop;
      if (last === null || Math.abs(top - last) > 3) { lines.push([]); last = top; }
      lines[lines.length - 1].push(p);
    });
    el.innerHTML = '';
    lines.forEach((ln, k) => {
      const o = document.createElement('span'); o.className = 'ln_';
      const i = document.createElement('span'); i.className = 'ln'; i.style.setProperty('--ld', `${(+el.dataset.ld || 0) + k * .06}s`);
      ln.forEach((p) => { if (p.nodeType === 3) i.appendChild(p); else while (p.firstChild) i.appendChild(p.firstChild); });
      o.appendChild(i); el.appendChild(o);
    });
  }
  function splitAll() { $$('.split').forEach(split); }

  // ── 상태 저장: 상세에서 돌아오면 보던 보기와 작업에서 다시 시작한다
  function save() {
    try { sessionStorage.setItem('od.home', JSON.stringify({ view, T, active: nearestIndex() })); } catch (e) {}
  }
  function restore() {
    try { const s = JSON.parse(sessionStorage.getItem('od.home') || 'null'); if (s) { view = s.view || 'v'; T = S = tiles[s.active] ? tiles[s.active].p : 0; } } catch (e) {}
  }

  // ── 시작
  function show(sel, on = true) { $$(sel).forEach((el) => el.classList.toggle('is-shown', on)); }
  function revealUI() {
    html.classList.add('is-shown');
    body.classList.add('is-shown');
    show('#hd-title');
    $$('.split').forEach((el) => el.classList.add('is-shown'));
  }
  function finishIntro() {
    html.classList.remove('is-intro');
    $('#sym').style.transition = '';
    ready = true;
    updateSpread();
    try { sessionStorage.setItem('od.seen', '1'); } catch (e) {}
  }

  function boot() {
    measure();
    buildLists();
    splitAll();
    restore();
    body.dataset.view = view;
    $$('#modes button').forEach((b) => { const on = b.dataset.mode === view; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
    theta = view === 'h' ? -90 : 0;
    html.classList.toggle('is-shrink', view === 'g');
    $('#fix').classList.toggle('is-hidden', view === 'g');
    tiles.forEach((t, i) => { t.cur = targetPose(i); });
    raf = requestAnimationFrame(frame);
    const sym = $('#sym');

    const hashPage = location.hash.replace('#', '');
    if (html.classList.contains('is-intro') && !hashPage) {
      runIntro();
    } else {
      $('#veil').classList.add('is-off'); $('#count').classList.add('is-off');
      tiles.forEach((t, i) => { t.cur = { ...targetPose(i), o: 0, s: targetPose(i).s * .96 }; });
      tr = { kind: 'free', t0: performance.now(), dur: REDUCE ? 0 : 900, from: tiles.map((t) => ({ ...t.cur })), mid: 0, delay: tiles.map(() => 0) };
      finishIntro();
      requestAnimationFrame(() => requestAnimationFrame(revealUI));
      route();
    }
  }

  // 오프닝: 검은 화면 → 가운데 심벌이 작게 나타나 커진다 → 심벌 안에 점, 그 점에서 그림이 열린다
  // → 그림이 몇 번 바뀐다 → 아래로 줄이 펼쳐진다 → 화면이 하얗게 뒤집히고 심벌이 벌어진다 → 위쪽 줄 → 글자
  function runIntro() {
    const sym = $('#sym'), veil = $('#veil'), count = $('#count');
    const T0 = performance.now();
    introK = { below: 0, above: 0 };
    sym.classList.add('no-t');
    sym.style.setProperty('--sym-w', `${symW * .26}px`);
    sym.style.opacity = '0';
    const at = (ms, fn) => setTimeout(fn, ms);
    const countTo = (n, ms) => { const s = performance.now(), from = +count.textContent; const step = () => { const k = clamp((performance.now() - s) / ms); count.textContent = String(Math.round(lerp(from, n, k))).padStart(2, '0'); if (k < 1) requestAnimationFrame(step); }; step(); };
    countTo(100, 3000);
    at(600, () => { sym.style.transition = 'opacity .3s, width 2.1s cubic-bezier(.19, 1, .22, 1)'; sym.style.opacity = '1'; sym.classList.remove('no-t'); requestAnimationFrame(() => sym.style.setProperty('--sym-w', `${symW}px`)); });
    at(2500, () => sym.classList.add('has-dot'));
    at(3100, () => count.classList.add('is-off'));
    const arts = ['nfc-cafe', 'sono-graph', 'paws-m', 'phone-menu'];
    const ws = symW * .46, hs = symW * .36;
    at(3200, () => { sym.classList.remove('has-dot'); showWin(arts[0], ws, hs); });
    [1, 2, 3].forEach((k) => at(3200 + k * 620, () => { winIn.innerHTML = `<div class="tile-art" style="container-type:size">${ODArt.art(arts[k])}</div>`; ODArt.paint(winIn); }));
    at(5600, () => { winIn.innerHTML = `<div class="tile-art" style="container-type:size">${ODArt.art(tiles[active].art)}</div>`; ODArt.paint(winIn); });
    // 아래로 펼쳐짐
    const grow = (key, from, to, dur, ease) => { const s = performance.now(); const f = () => { const k = clamp((performance.now() - s) / dur); introK[key] = lerp(from, to, ease(k)); if (k < 1) requestAnimationFrame(f); }; f(); };
    at(5900, () => { grow('below', .001, 1, 900, E1); });
    at(6250, () => hideWin());
    // 밝기 반전과 심벌 벌어짐
    at(6600, () => { veil.classList.add('is-off'); ready = true; updateSpread(); ready = false; });
    // 위쪽 줄과 함께 줄 전체가 제자리로 미끄러진다
    at(7000, () => { grow('above', .001, 1, 1200, E1); });
    at(8400, () => { revealUI(); });
    at(8700, () => { finishIntro(); route(); });
  }

  let rz = 0;
  addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => {
      measure(); splitAll();
      if (html.classList.contains('is-shown')) $$('.split').forEach((el) => el.classList.add('is-shown'));
      T = S = tiles[nearestIndex()].p; lastSpread = null; updateSpread(); aboutScroll();
    }, 120);
  });
  // 뒤로 가기로 캐시에서 되살아난 경우: 떠나는 중 표시만 지운다
  addEventListener('pageshow', (e) => { if (e.persisted) html.classList.remove('is-leaving'); });

  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(boot);
})();
