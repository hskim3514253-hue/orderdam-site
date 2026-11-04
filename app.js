// 가게별 테이블 카드 예시를 그린다. 가게와 QR은 모두 예시이며 실제로 읽히지 않는다.
(() => {
  let uid = 0;
  const W = 172, H = 100;

  // 사인 곡선 물결 경로
  function wave(y, amp, len, phase, bottom = H) {
    let d = `M0 ${bottom} L0 ${y.toFixed(2)}`;
    for (let x = 0; x <= W; x += 2) {
      const yy = y + Math.sin((x / len) * Math.PI * 2 + phase) * amp + Math.sin((x / (len * 0.43)) * Math.PI * 2 + phase * 1.7) * amp * 0.35;
      d += ` L${x} ${yy.toFixed(2)}`;
    }
    return d + ` L${W} ${bottom} Z`;
  }
  function crest(y, amp, len, phase, from, to) {
    let d = '';
    for (let x = from; x <= to; x += 2) {
      const yy = y + Math.sin((x / len) * Math.PI * 2 + phase) * amp + Math.sin((x / (len * 0.43)) * Math.PI * 2 + phase * 1.7) * amp * 0.35;
      d += (x === from ? 'M' : 'L') + `${x} ${(yy - 0.3).toFixed(2)} `;
    }
    return d;
  }
  function rand(seed) { let s = seed; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }

  const SCENES = {
    sea() {
      const id = 'sea' + uid++, r = rand(5);
      let stars = '';
      for (let i = 0; i < 46; i++) {
        const x = r() * W, y = r() * 50, s = r() * 0.55 + 0.15;
        stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${s.toFixed(2)}" fill="#fff" opacity="${(r() * 0.6 + 0.3).toFixed(2)}"/>`;
      }
      // 달빛이 물에 비친 길: 물결마다 부서지는 불규칙한 반짝임, 앞으로 올수록 넓고 잘게 흩어진다
      let glint = '';
      for (let i = 0; i < 34; i++) {
        const y = 58.6 + i * 1.25 + r() * 0.6;
        const spread = 2 + i * 0.95;
        const pieces = 1 + Math.floor(r() * (1.5 + i * 0.12));
        for (let k = 0; k < pieces; k++) {
          if (r() < 0.18) continue;
          const w = 0.6 + r() * (1.2 + i * 0.22);
          const x = 132 + (r() - 0.5) * spread * 2 - w / 2;
          const o = Math.max(0.12, (0.95 - i * 0.022) * (0.55 + r() * 0.45));
          glint += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${(0.25 + r() * 0.3).toFixed(2)}" rx=".15" fill="#ffeab0" opacity="${o.toFixed(2)}"/>`;
        }
      }
      glint = `<g filter="url(#${id}b)">${glint}</g>`;
      const layers = [
        [60, 0.5, 22, 0.3, '#1a3768'], [64, 0.9, 30, 1.1, '#16305d'], [69, 1.4, 38, 2.0, '#122852'],
        [75, 2.0, 46, 0.7, '#0f2247'], [82, 2.7, 56, 2.6, '#0b1b3b'], [90, 3.3, 66, 1.4, '#08152f'],
      ];
      const sea = layers.map(([y, a, l, p, c]) => `<path d="${wave(y, a, l, p)}" fill="${c}"/>`).join('');
      const foam = layers.slice(2).map(([y, a, l, p], i) => `<path d="${crest(y, a, l, p, 0, W)}" fill="none" stroke="#cfe0ff" stroke-width="${0.25 + i * 0.12}" stroke-linecap="round" stroke-dasharray="${6 + i * 3} ${4 + i * 2}" opacity="${0.35 + i * 0.08}"/>`).join('');
      return `<svg class="scene" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060d22"/><stop offset=".55" stop-color="#14295a"/><stop offset="1" stop-color="#2a4a86"/></linearGradient>
          <radialGradient id="${id}g"><stop offset="0" stop-color="#fff3c4" stop-opacity=".55"/><stop offset=".35" stop-color="#ffe7a0" stop-opacity=".18"/><stop offset="1" stop-color="#ffe7a0" stop-opacity="0"/></radialGradient>
          <filter id="${id}b" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation=".18"/></filter>
          <radialGradient id="${id}m" cx=".42" cy=".4"><stop offset="0" stop-color="#fffaf0"/><stop offset=".7" stop-color="#f6e6b0"/><stop offset="1" stop-color="#e8cf86"/></radialGradient>
        </defs>
        <rect width="${W}" height="61" fill="url(#${id}s)"/>
        ${stars}
        <circle cx="132" cy="24" r="30" fill="url(#${id}g)"/>
        <circle cx="132" cy="24" r="8.5" fill="url(#${id}m)"/>
        <circle cx="129.5" cy="22" r="1.4" fill="#e3c97f" opacity=".45"/><circle cx="134.5" cy="27" r="1" fill="#e3c97f" opacity=".4"/><circle cx="135" cy="20.5" r=".7" fill="#e3c97f" opacity=".35"/>
        ${sea}
        ${glint}
        ${foam}
      </svg>`;
    },
    slow() {
      const id = 'slow' + uid++;
      return `<svg class="scene" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6d4b8a"/><stop offset=".35" stop-color="#d9707a"/><stop offset=".7" stop-color="#f6a35c"/><stop offset="1" stop-color="#ffd59a"/></linearGradient>
          <radialGradient id="${id}g"><stop offset="0" stop-color="#fff2c8" stop-opacity=".9"/><stop offset="1" stop-color="#ffb36b" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="${W}" height="${H}" fill="url(#${id}s)"/>
        <circle cx="122" cy="62" r="34" fill="url(#${id}g)"/>
        <circle cx="122" cy="62" r="12" fill="#fff0c8"/>
        <path d="M18 30q3-3 6 0q3-3 6 0M36 22q2-2 4 0q2-2 4 0" fill="none" stroke="#5a2f3d" stroke-width=".7" stroke-linecap="round"/>
        <path d="${wave(62, 3, 90, 0.5)}" fill="#9a8a5a" opacity=".9"/>
        <path d="${wave(70, 4, 120, 2.2)}" fill="#7a7a44"/>
        <path d="${wave(79, 3.5, 70, 4.1)}" fill="#5f6b3a"/>
        <path d="${wave(89, 3, 100, 1.2)}" fill="#46502a"/>
        <g fill="#3a4222"><path d="M30 80v-9M30 74l-3-3M30 76l3-3"/></g>
        <g stroke="#3a4222" stroke-width=".8" fill="none" stroke-linecap="round"><path d="M28 82v-12M28 75l-3-3M28 77l3-3"/><path d="M42 84v-9M42 78l-2-2M42 79l2-2"/></g>
      </svg>`;
    },
    sobok() {
      const id = 'sb' + uid++, r = rand(9);
      let snow = '';
      for (let i = 0; i < 70; i++) snow += `<circle cx="${(r() * W).toFixed(1)}" cy="${(r() * 80).toFixed(1)}" r="${(r() * 0.7 + 0.25).toFixed(2)}" fill="#fff" opacity="${(r() * 0.5 + 0.5).toFixed(2)}"/>`;
      return `<svg class="scene" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9cad8"/><stop offset="1" stop-color="#eef1f0"/></linearGradient>
          <radialGradient id="${id}w"><stop offset="0" stop-color="#ffd27a" stop-opacity=".8"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="${W}" height="${H}" fill="url(#${id}s)"/>
        <path d="${wave(66, 3, 110, 1.0)}" fill="#dfe7ec"/>
        <g transform="translate(118 50)">
          <rect x="0" y="12" width="26" height="18" fill="#c98d5a"/>
          <rect x="18" y="0" width="4" height="9" fill="#8a5a3a"/>
          <path d="M-3 13 L13 2 L29 13 Z" fill="#7a3e2c"/>
          <path d="M-4 13.5 Q13 -0.5 30 13.5 Q22 11 13 4 Q4 11 -4 13.5Z" fill="#fff"/>
          <rect x="17.2" y="-1.4" width="5.6" height="2" rx="1" fill="#fff"/>
          <circle cx="8" cy="21" r="9" fill="url(#${id}w)"/>
          <rect x="5" y="17" width="6" height="7" fill="#ffd27a"/><path d="M8 17v7M5 20.5h6" stroke="#c98d5a" stroke-width=".6"/>
          <rect x="15" y="19" width="6" height="11" fill="#5a3826"/>
          <path d="M20 -3 q-2 -4 1 -7 q2 -3 0 -6" fill="none" stroke="#fff" stroke-width="1" opacity=".7" stroke-linecap="round"/>
        </g>
        <path d="${wave(78, 3.5, 80, 3.0)}" fill="#f4f7f8"/>
        <path d="${wave(88, 3, 120, 0.4)}" fill="#ffffff"/>
        ${snow}
      </svg>`;
    },
  };

  const SHOPS = {
    sea:   { cls: 'shop-sea',   ko: '밤바다', en: 'HIGHBALL BAR BAMBADA', table: 'SEAT 07' },
    slow:  { cls: 'shop-slow',  ko: '느린오후', en: 'SLOW AFTERNOON COFFEE', table: 'TABLE 03' },
    sobok: { cls: 'shop-sobok', ko: '소복', en: 'SOBOK BAKERY', table: 'TABLE 01' },
  };
  const PHONE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/></svg>';

  // 예시용 QR 모양 (실제로 읽히는 코드가 아님)
  function qr(seed) {
    const rnd = rand(seed); let out = '';
    const finder = (x, y, ox, oy) => {
      const dx = x - ox, dy = y - oy;
      if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return null;
      return dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx > 1 && dx < 5 && dy > 1 && dy < 5);
    };
    for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) {
      let f = finder(x, y, 0, 0); if (f === null) f = finder(x, y, 14, 0); if (f === null) f = finder(x, y, 0, 14);
      const quiet = (x === 7 && y < 8) || (y === 7 && x < 8) || (x === 13 && y < 8) || (y === 7 && x > 12) || (x === 7 && y > 12) || (y === 13 && x < 8);
      out += `<i class="${(f !== null ? f : quiet ? false : rnd() > 0.52) ? 'on' : ''}"></i>`;
    }
    return out;
  }

  function render(el, key, seed) {
    const s = SHOPS[key];
    el.className = el.className.replace(/shop-\w+/g, '').trim() + ' ' + s.cls;
    el.innerHTML = SCENES[key]() + `
      <div class="grid">
        <div class="zone"><div class="glass"><div class="qr">${qr(seed)}</div></div><p class="lbl">찍어서 주문</p></div>
        <div class="zone"><div class="nfc">${PHONE}</div><p class="lbl">여기에 휴대폰을<br>대 주세요</p></div>
        <div class="zone brand"><p class="name">${s.ko}<small>${s.en}</small></p><p class="tbl">${s.table}</p></div>
      </div>`;
  }

  const drawn = document.querySelectorAll('.card[data-shop]');
  drawn.forEach((el, i) => render(el, el.dataset.shop, 7 + i * 4));

  const main = document.getElementById('mainCard');
  const minis = [...document.querySelectorAll('.cardbox--mini')];
  minis.forEach((b, i) => { render(b.querySelector('.card'), b.dataset.shop, 21 + i * 3); label(b); });
  function label(b) { b.setAttribute('aria-label', SHOPS[b.dataset.shop].ko + ' 카드를 크게 보기'); }
  minis.forEach((b) => b.addEventListener('click', () => {
    const next = b.dataset.shop, prev = main.dataset.shop;
    b.dataset.shop = prev; render(b.querySelector('.card'), prev, 23); label(b);
    main.dataset.shop = next; render(main, next, 9);
    const live = document.getElementById('shopLive'); if (live) live.textContent = SHOPS[next].ko + ' 카드를 보고 있어요';
    main.classList.remove('is-swapping'); void main.offsetWidth; main.classList.add('is-swapping');
  }));

  const top = document.querySelector('.top');
  const onScroll = () => top && top.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
})();
