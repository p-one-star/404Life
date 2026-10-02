/* 404 LIFE SYSTEM — GEAR：持ち物リストの補助
   system.js より先に読み込む（読み込み演出の対象をここで付ける）。
   カードの追加は gear.html に1行足すだけでよい。このファイルは編集不要。 */
(() => {
  const list = document.querySelector('.sys-gear-list');

  // 並び順をランダムに入れ替える（ページを開くたびに変わる。JSなしでは書いた順のまま）
  if (list) {
    const rows = [...list.children];
    for (let i = rows.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [rows[i], rows[j]] = [rows[j], rows[i]];
    }
    const frag = document.createDocumentFragment();
    rows.forEach((li) => frag.appendChild(li));
    list.appendChild(frag);
  }

  const items = document.querySelectorAll('.sys-gear-list > li');

  items.forEach((li, i) => {
    // 読み込み演出：画面に入ったカードから順に（6枚ごとに遅れをリセット）
    li.setAttribute('data-sys-load', '');
    li.style.setProperty('--sys-delay', `${(i % 6) * 40}ms`);
    // 管理番号をたまに少しズレる対象にする
    const id = li.querySelector('.sys-gear__id');
    if (id) id.setAttribute('data-glitch', 'soft');
  });

  // 件数（3桁）
  const count = document.querySelector('[data-gear-count]');
  if (count) count.textContent = String(items.length).padStart(3, '0');

  // 管理番号の重複チェック（ブラウザのコンソールに警告）
  const seen = new Set();
  items.forEach((li) => {
    const id = li.querySelector('.sys-gear__id');
    const key = id ? id.textContent.replace(/\s+/g, ' ').trim() : '';
    if (!key) console.warn('[GEAR] 管理番号がないカードがあります', li);
    else if (seen.has(key)) console.warn(`[GEAR] 管理番号が重複しています：${key}`);
    seen.add(key);
  });

  // クリック数の記録：リンク付きカードが押されたら、管理番号だけを送る（個人の情報は送らない）
  // 受け口：click-counter（Cloudflare Worker）。集計はClaude Codeで行い、サイトには表示しない。
  const CLICK_ENDPOINT = 'https://404-life-clicks.nagaramania.workers.dev/c';
  const sendClick = (e) => {
    if (e.type === 'auxclick' && e.button !== 1) return;
    const card = e.target.closest && e.target.closest('.sys-gear:not([href="#"])');
    if (!card) return;
    const id = card.querySelector('.sys-gear__id');
    const key = id ? id.textContent.replace(/\s+/g, ' ').trim() : '';
    if (!key) return;
    try {
      if (navigator.sendBeacon) navigator.sendBeacon(CLICK_ENDPOINT, key);
      else fetch(CLICK_ENDPOINT, { method: 'POST', body: key, keepalive: true, mode: 'no-cors' });
    } catch (err) { /* 記録に失敗しても、リンクの移動は止めない */ }
  };
  document.addEventListener('click', sendClick);
  document.addEventListener('auxclick', sendClick);

  // URL 未設定（href="#"）のカードを押したら「ただいま準備中」を表示
  // 移動を止める処理は system.js（href="#" 共通）が行う
  const toast = document.createElement('div');
  toast.className = 'sys-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = '<span class="sys-toast__tag">STANDBY //</span><span class="sys-toast__msg"></span>';
  document.body.appendChild(toast);
  const msg = toast.querySelector('.sys-toast__msg');
  let timer = 0;
  document.addEventListener('click', (e) => {
    const card = e.target.closest && e.target.closest('.sys-gear[href="#"]');
    if (!card) return;
    msg.textContent = 'ただいま準備中';
    toast.setAttribute('data-show', '');
    clearTimeout(timer);
    timer = setTimeout(() => toast.removeAttribute('data-show'), 2000);
  });
})();
