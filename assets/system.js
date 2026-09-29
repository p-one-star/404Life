/* 404 LIFE SYSTEM — BOOT / 背景スクロール / セクション読み込み / たまに起きる不具合
   状態は data-* 属性と style で切り替える（Tailwind CDN は class 属性だけを監視しているため）。 */
(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIO = 'IntersectionObserver' in window;

  // iOS Safari でタップ時の :active を有効にする
  document.addEventListener('touchstart', () => {}, { passive: true });

  // 仮リンク（href="#"）は押しても移動しない。ページができたら href を差し替える
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href="#"]');
    if (a) e.preventDefault();
  });

  /* ---------- 背景：スクロールに合わせて画像の上端→下端へ ---------- */
  const bgImg = document.querySelector('.sys-bg__img');
  if (bgImg && !reduce) {
    let range = 0;
    let max = 1;
    let queued = false;
    const update = () => {
      queued = false;
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      bgImg.style.transform = `translate3d(-50%, ${(-p * range).toFixed(1)}px, 0)`;
    };
    const measure = () => {
      range = Math.max(0, bgImg.offsetHeight - window.innerHeight);
      max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      update();
    };
    window.addEventListener('scroll', () => {
      if (!queued) { queued = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    measure();
  }

  /* ---------- たまに起きる不具合 ---------- */
  const fire = (el) => {
    if (reduce || !el) return;
    const attr = el.hasAttribute('data-glitch') ? 'data-glitching' : 'data-flickering';
    if (el.hasAttribute(attr)) return;
    el.setAttribute(attr, '');
    setTimeout(() => el.removeAttribute(attr), attr === 'data-glitching' ? 380 : 540);
  };

  const startTroubleLoop = () => {
    if (reduce || !hasIO) return;
    const visible = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
    });
    document.querySelectorAll('[data-glitch], [data-flicker]').forEach((el) => io.observe(el));

    // 正常に動いているが、たまに壊れる：4〜10秒に1回、画面内の1か所（まれに2か所）
    const pick = () => {
      const list = [...visible];
      return list[Math.floor(Math.random() * list.length)];
    };
    const next = () => setTimeout(() => {
      if (!document.hidden && visible.size) {
        fire(pick());
        if (Math.random() < 0.25) setTimeout(() => fire(pick()), 140);
      }
      next();
    }, 4000 + Math.random() * 6000);
    next();
  };

  /* ---------- セクション読み込み ---------- */
  const loadItems = document.querySelectorAll('[data-sys-load]');
  const useReveal = !reduce && hasIO && loadItems.length > 0 && root.hasAttribute('data-boot');
  // BOOT画面が覆っている間に非表示状態へ切り替える（表示中のちらつきを防ぐ）
  if (useReveal) root.setAttribute('data-reveal', '');

  const startReveal = () => {
    if (!useReveal) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        io.unobserve(el);
        el.setAttribute('data-loaded', 'run');
        el.addEventListener('animationend', function done(e) {
          if (e.target !== el || e.animationName !== 'sys-load') return;
          el.setAttribute('data-loaded', 'done');
          el.removeEventListener('animationend', done);
        });
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });
    loadItems.forEach((el) => io.observe(el));
  };

  /* ---------- BOOT ---------- */
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    root.setAttribute('data-boot', 'done');
    startReveal();
    startTroubleLoop();
    const title = document.querySelector('.sys-hero-title');
    if (title) setTimeout(() => fire(title), 900);
  };

  const boot = document.querySelector('.sys-boot');
  const mode = root.getAttribute('data-boot');
  if (boot && (mode === 'full' || mode === 'short')) {
    boot.addEventListener('animationend', (e) => {
      if (e.target === boot && e.animationName === 'sys-boot-out') start();
    });
    // タップ・キー操作でスキップ（click で受けて、下のリンクを誤タップさせない）
    boot.addEventListener('click', start);
    window.addEventListener('keydown', start, { once: true });
    setTimeout(start, mode === 'short' ? 900 : 2200);
  } else {
    start();
  }
})();
