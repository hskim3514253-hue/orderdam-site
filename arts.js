// 작업물 그림. 테이블 카드·주문 화면·사장님 화면은 오더담이 직접 그린 그림이고,
// 포우즈는 실제 사이트(paws-neighborhood-life…chatgpt.site) 화면을 캡처한 이미지다.
// SONO는 화면 파일이 없어 화면 구성을 설명하는 그림으로 그린다.
(() => {
  const PHONE_MENU = `
    <div class="ph"><div class="ph__in"><div class="ph__s">
      <p class="ph__shop">Cafe</p><p class="ph__tbl">TABLE 04</p>
      <div class="ph__item"><b>아인슈페너</b><span>5,800원</span><em>2</em></div>
      <div class="ph__item"><b>바닐라라떼</b><span>5,800원</span><em>1</em></div>
      <div class="ph__item"><b>바스크치즈케이크</b><span>5,500원</span></div>
      <p class="ph__btn">17,400원 결제하기</p>
    </div></div></div>`;
  const PHONE_PAID = `
    <div class="ph"><div class="ph__in"><div class="ph__s">
      <p class="ph__shop">Cafe</p><p class="ph__tbl">TABLE 04</p>
      <div class="ph__ok"><i></i><b>결제 완료</b><span>사장님께 주문이 전달됐어요</span></div>
      <div class="ph__item"><b>아인슈페너 × 2</b><span>바닐라라떼 × 1</span></div>
    </div></div></div>`;
  const BOARD = `
    <div class="tb"><div class="tb__in">
      <div class="tb__bar"><b>주문 보드</b><span>● 연결됨</span></div>
      <div class="tb__t"><header><b>TABLE 04</b><span>결제 완료</span></header><p>아인슈페너 × 2 · 바닐라라떼 × 1</p>
        <div class="tb__steps"><span class="is-on">접수</span><span>준비 중</span><span>완료</span></div></div>
      <div class="tb__t tb__t--ghost"><header><b>TABLE 02</b><span>준비 중</span></header></div>
    </div></div>`;
  const card = (shop, quiet) => `<div class="cardbox"><div class="card${quiet ? ' card--quiet' : ''}" data-shop="${shop}"></div></div>`;
  const GRAPH = `<svg viewBox="0 0 120 100" aria-hidden="true">
      <g stroke="#bdbab2" stroke-width=".5" fill="none"><path d="M60 50L28 26M60 50L96 30M60 50L30 76M60 50L92 74M28 26L96 30M30 76L92 74M96 30L92 74"/></g>
      <g font-family="Pretendard Variable, sans-serif" font-size="4.2" text-anchor="middle" fill="#1a1a1a">
        <circle cx="60" cy="50" r="9" fill="#111"/><text x="60" y="51.5" fill="#f6f5f1">주인공</text>
        <circle cx="28" cy="26" r="6.5" fill="#fff" stroke="#1a1a1a" stroke-width=".5"/><text x="28" y="27.4">스승</text>
        <circle cx="96" cy="30" r="6.5" fill="#fff" stroke="#1a1a1a" stroke-width=".5"/><text x="96" y="31.4">라이벌</text>
        <circle cx="30" cy="76" r="6.5" fill="#fff" stroke="#1a1a1a" stroke-width=".5"/><text x="30" y="77.4">동료</text>
        <circle cx="92" cy="74" r="6.5" fill="#fff" stroke="#1a1a1a" stroke-width=".5"/><text x="92" y="75.4">가족</text>
      </g></svg>`;
  const NOTES = (title) => `<div class="so"><b>${title}</b><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>`;

  const ARTS = {
    'nfc-cafe': () => `<img src="assets/work/nfc-cafe-600.jpg" alt="" loading="lazy" decoding="async">`,
    'nfc-thinker': () => `<img src="assets/work/nfc-thinker-600.jpg" alt="" loading="lazy" decoding="async" style="object-position:60% 50%">`,
    'card-sea': () => `<div class="art art--bleed">${card('sea', true)}</div>`,
    'card-sobok': () => `<div class="art art--stone">${card('sobok', true)}</div>`,
    'phone-menu': () => `<div class="art art--stone">${PHONE_MENU}</div>`,
    'phone-paid': () => `<div class="art art--stone">${PHONE_PAID}</div>`,
    'owner': () => `<div class="art art--ink">${BOARD}</div>`,
    'sono-notes': () => NOTES('인물 설정'),
    'sono-world': () => NOTES('세계관 노트'),
    'sono-graph': () => `<div class="so-graph">${GRAPH}</div>`,
    'sono-type': () => `<div class="so-type">SONO</div>`,
    'paws-m': () => `<img src="assets/work/paws-mobile.jpg" alt="" style="object-position:50% 0">`,
    'paws-m2': () => `<img src="assets/work/paws-mobile.jpg" alt="" style="object-position:50% 78%">`,
    'paws-d': () => `<img src="assets/work/paws-desktop.jpg" alt="" style="object-position:50% 0">`,
    'paws-d2': () => `<img src="assets/work/paws-desktop.jpg" alt="" style="object-position:86% 34%">`,
    // 상세 패널용 큰 장면
    'tap': () => `<img class="pn-img" src="assets/work/nfc-cafe.jpg" alt="" decoding="async">`,
    'thinker': () => `<img class="pn-img" src="assets/work/nfc-thinker.jpg" alt="" loading="lazy" decoding="async">`,
    'flow': () => `<div class="duo">${PHONE_MENU}${PHONE_PAID}</div>`,
    'deck': () => `<div class="deck"><div class="cardbox d1"><div class="card card--quiet" data-shop="sea"></div></div><div class="cardbox d2"><div class="card card--quiet" data-shop="sobok"></div></div></div>`,
    'board': () => BOARD,
  };
  let seed = 31;
  function paint(root) {
    (root || document).querySelectorAll('.card[data-shop]:empty').forEach((el) => window.ODCards && ODCards.render(el, el.dataset.shop, seed += 4));
  }
  function art(name) {
    if (name.startsWith('photo:')) { const [, id, pos] = name.split(':'); return `<img class="bw" src="assets/photos/photo-${id}-500.jpg" alt="" loading="lazy" decoding="async" style="object-position:${pos || '50% 50%'}">`; }
    return (ARTS[name] || (() => ''))();
  }
  function fill(root) {
    (root || document).querySelectorAll('[data-art]').forEach((el) => { if (!el.dataset.filled) { el.innerHTML = art(el.dataset.art); el.dataset.filled = '1'; } });
    paint(root);
  }
  window.ODArt = { art, fill, paint };
  fill();
})();
