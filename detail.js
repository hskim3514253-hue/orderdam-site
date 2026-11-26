// 작업 상세(테이블 오더): 왼쪽 설명은 고정, 오른쪽 그림을 내리면 지금 보는 장면의 설명으로 바뀐다
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // 들어오자마자 글줄과 상단이 아래에서 올라온다
  requestAnimationFrame(() => requestAnimationFrame(() => { html.classList.add('is-shown'); document.body.classList.add('is-shown'); $('#hd-title').classList.add('is-shown'); }));

  // 지금 화면 가운데에 있는 장면에 맞춰 왼쪽 설명을 바꾼다
  const panels = $$('.dt-panel');
  const notes = $$('.dt-note > div');
  let cur = '';
  function onScroll() {
    const mid = innerHeight * .5;
    let key = panels[0].dataset.note;
    panels.forEach((p) => { const r = p.getBoundingClientRect(); if (r.top <= mid) key = p.dataset.note; });
    if (key !== cur) { cur = key; notes.forEach((n) => n.classList.toggle('is-on', n.dataset.note === key)); }
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 뒤로: 메인에서 왔으면 브라우저 뒤로 가기와 같게(보던 작업과 위치로), 아니면 메인으로
  $$('[data-back]').forEach((a) => a.addEventListener('click', (e) => {
    let fromHome = false;
    try { const u = new URL(document.referrer); fromHome = u.origin === location.origin && /\/(index\.html)?$/.test(u.pathname); } catch (err) {}
    if (fromHome && history.length > 1) { e.preventDefault(); history.back(); }
  }));

  // 시계와 상담 (마우스로 누르면 번호 복사, 휴대폰에서는 전화 걸기)
  const clock = $('#clock');
  const tick = () => { clock.textContent = 'KST ' + new Date().toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul', hour: 'numeric', minute: '2-digit' }); };
  tick(); setInterval(tick, 15000);
  const contact = $('#hd-contact');
  if (FINE) contact.addEventListener('click', (e) => {
    if (!navigator.clipboard) return;
    e.preventDefault();
    navigator.clipboard.writeText('010-9284-5963').then(() => {
      contact.textContent = '번호 복사됨';
      setTimeout(() => { contact.textContent = '상담'; }, 1800);
    }, () => { location.href = 'tel:01092845963'; });
  });

  try { sessionStorage.setItem('od.seen', '1'); } catch (e) {}
})();
