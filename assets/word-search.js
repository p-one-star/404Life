/* 404 LIFE SYSTEM — PLAYGROUND：文字探しの答え合わせ
   ・盤面は HTML の .ws-grid の文字をそのまま読む（このファイルに盤面は書かない）
   ・正解のワードはそのまま書かず、ハッシュ値だけを持つ（ソースを開いても答えが読めない）
   ・40ワード（data-ws-key）のほかに、隠しワード（data-ws-bonus：偶然できた誰でも分かる言葉）も正解。数は別に数える
   ・入力されたワードがハッシュと一致したら、盤面の8方向から位置を探して光らせる
   ・発見したワードは光ったまま。ワードごとの消灯（消しゴム）と一括消灯ができる
   ・発見状態はこの端末だけに保存（localStorage。使えない環境では保存しない） */
(() => {
  const root = document.querySelector('[data-ws]');
  if (!root) return;

  const BOARD = root.getAttribute('data-ws');            // 例：001
  const SALT = `404LIFE/WS${BOARD}/`;
  const ANSWERS = new Set(JSON.parse(root.getAttribute('data-ws-key') || '[]'));
  const BONUS = new Set(JSON.parse(root.getAttribute('data-ws-bonus') || '[]'));
  const TOTAL = ANSWERS.size;
  const STORE = `404-life-ws-${BOARD}`;

  const grid = root.querySelector('.ws-grid');
  const cells = [...grid.querySelectorAll('.ws-cell')];
  const SIZE = Math.round(Math.sqrt(cells.length));
  const at = (r, c) => cells[r * SIZE + c];
  const ch = (r, c) => at(r, c).textContent.trim();

  const form = root.querySelector('.ws-search');
  const input = root.querySelector('.ws-search__input');
  const msg = root.querySelector('.ws-msg');
  const countEl = root.querySelector('[data-ws-count]');
  const bonusEl = root.querySelector('[data-ws-bonus-count]');
  const list = root.querySelector('.ws-found__list');
  const empty = root.querySelector('.ws-found__empty');
  const clearAll = root.querySelector('.ws-clear-all');
  const tpl = root.querySelector('#ws-chip');

  // ハッシュ（cyrb53）
  const cyrb53 = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0; i < str.length; i++) { const k = str.charCodeAt(i); h1 = Math.imul(h1 ^ k, 2654435761); h2 = Math.imul(h2 ^ k, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507); h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507); h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  };
  // 'main'（40ワード）／'bonus'（隠しワード）／null（ハズレ）
  const kindOf = (w) => { const h = cyrb53(SALT + w, 404); return ANSWERS.has(h) ? 'main' : BONUS.has(h) ? 'bonus' : null; };

  // 入力の正規化：全角・半角をそろえ、ひらがな→カタカナ、伸ばし棒のゆれ→「ー」、空白を消す
  const normalize = (s) => s.normalize('NFKC')
    .replace(/[ぁ-ゖ]/g, (k) => String.fromCharCode(k.charCodeAt(0) + 0x60))
    .replace(/[-‐‑‒–—―−～〜~]/g, 'ー')
    .replace(/\s+/g, '');

  // 盤面の8方向からワードの位置を探す（最初に見つかった1か所）
  const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  const locate = (w) => {
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
      if (ch(r, c) !== w[0]) continue;
      for (const [dr, dc] of DIRS) {
        const path = [];
        for (let i = 0; i < w.length; i++) {
          const rr = r + dr * i, cc = c + dc * i;
          if (rr < 0 || cc < 0 || rr >= SIZE || cc >= SIZE || ch(rr, cc) !== w[i]) break;
          path.push(rr * SIZE + cc);
        }
        if (path.length === w.length) return path;
      }
    }
    return null;
  };

  // 発見済み：ワード → { path: マスの番号, kind }。マスごとに何語で光っているかを数える（重なっても消し忘れない）
  const found = new Map();
  const lit = new Array(cells.length).fill(0);

  const paint = (path, on) => path.forEach((i) => {
    lit[i] += on ? 1 : -1;
    cells[i].classList.toggle('is-lit', lit[i] > 0);
  });

  const flash = (path) => {
    cells.forEach((el) => el.classList.remove('is-new'));
    void grid.offsetWidth; // アニメーションをやり直す
    path.forEach((i) => cells[i].classList.add('is-new'));
  };

  const mainCount = () => [...found.values()].filter((x) => x.kind === 'main').length;

  const say = (text, tone) => {
    msg.textContent = text;
    msg.setAttribute('data-tone', tone || '');
  };

  const save = () => {
    try { localStorage.setItem(STORE, JSON.stringify([...found.keys()])); } catch (e) { /* 保存できなくても遊べる */ }
  };

  const render = () => {
    const main = mainCount(), bonus = found.size - main;
    countEl.textContent = `${String(main).padStart(2, '0')} / ${TOTAL}`;
    bonusEl.textContent = String(bonus).padStart(2, '0');
    root.toggleAttribute('data-bonus', bonus > 0);
    empty.hidden = found.size > 0;
    clearAll.disabled = found.size === 0;
    root.toggleAttribute('data-complete', main === TOTAL);
  };

  const addChip = (w, kind) => {
    const li = tpl.content.firstElementChild.cloneNode(true);
    li.dataset.word = w;
    if (kind === 'bonus') li.classList.add('ws-chip--bonus');
    li.querySelector('.ws-chip__word').textContent = w;
    li.querySelector('.ws-chip__erase').setAttribute('aria-label', `${w} を消す`);
    list.prepend(li);
  };

  const light = (w, path, kind, { quiet } = {}) => {
    found.set(w, { path, kind });
    paint(path, true);
    addChip(w, kind);
    if (!quiet) flash(path);
  };

  const erase = (w) => {
    const item = found.get(w);
    if (!item) return;
    paint(item.path, false);
    found.delete(w);
    const chip = list.querySelector(`[data-word="${CSS.escape(w)}"]`);
    if (chip) chip.remove();
    cells.forEach((el) => el.classList.remove('is-new'));
    save();
    render();
    say(`ERASED // ${w}`, 'info');
  };

  const submit = () => {
    const w = normalize(input.value);
    if (!w) { say('ワードを入力してね', 'info'); return; }
    if (found.has(w)) {
      flash(found.get(w).path);
      say(`FOUND 済み // ${w}`, 'info');
      input.value = '';
      return;
    }
    const kind = kindOf(w);
    const path = kind ? locate(w) : null;
    if (!path) {
      say(`NO MATCH // 「${w}」はハズレ`, 'miss');
      root.classList.remove('is-miss'); void root.offsetWidth; root.classList.add('is-miss');
      return;
    }
    light(w, path, kind);
    save();
    render();
    input.value = '';
    if (kind === 'bonus') say(`BONUS // 隠しワード「${w}」発見`, 'hit');
    else say(mainCount() === TOTAL ? `ALL FOUND // ${TOTAL}ワード全部見つけた` : `FOUND // ${w}`, 'hit');
    // 光った場所を見せる：キーボードを閉じて盤面へ
    input.blur();
    grid.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  };

  form.addEventListener('submit', (e) => { e.preventDefault(); submit(); });

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.ws-chip__erase');
    if (btn) erase(btn.closest('[data-word]').dataset.word);
    const word = e.target.closest('.ws-chip__word');
    if (word) flash((found.get(word.textContent) || {}).path || []);
  });

  clearAll.addEventListener('click', () => {
    if (!found.size) return;
    found.forEach((x) => paint(x.path, false));
    found.clear();
    list.textContent = '';
    cells.forEach((el) => el.classList.remove('is-new'));
    save();
    render();
    say('ALL CLEAR // 全部消灯した', 'info');
  });

  // 前回までの発見を復元（正解かどうかは毎回確かめ直す）
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || '[]');
    saved.forEach((w) => {
      const kind = typeof w === 'string' && !found.has(w) ? kindOf(w) : null;
      if (!kind) return;
      const path = locate(w);
      if (path) light(w, path, kind, { quiet: true });
    });
  } catch (e) { /* 保存が使えない環境 */ }
  render();
})();
