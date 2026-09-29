# 404Life

404 LIFE｜人生整備中。 — https://p-one-star.github.io/404Life/

## 構成

| ファイル | 内容 |
| --- | --- |
| `index.html` | ページ本体（Tailwind CDN） |
| `assets/system.css` | 404 LIFE SYSTEM のUI・演出（BOOT、CRT、たまに起きる不具合、読み込み演出、背景） |
| `assets/system.js` | BOOTの終了・スキップ、背景のスクロール連動、不具合演出の間隔、読み込み演出 |
| `assets/garage-bg.webp` | 背景のガレージ画像（725×2170） |
| `assets/404-avatar.webp` | プロフィールの丸アイコン（`0C740438-….png` から切り出し） |
| `source-assets/` | 元画像とUI見本（Git管理外） |

## 背景画像の差し替え

`assets/system.css` 冒頭の変数を書き換える。画像は `assets/` に置く。

```css
--sys-bg-image: url("garage-bg.webp");
--sys-bg-ratio: 725 / 2170;   /* 画像の 幅 / 高さ */
--sys-bg-shade: rgba(0, 0, 0, 0.32);   /* 明るい画像なら数値を上げる */
```

`index.html` の `<link rel="preload" ... garage-bg.webp>` のファイル名も合わせて変える。

## 演出の仕様

- BOOT：初回 約1.9秒、同一タブの再表示は 約0.6秒。タップ・キー操作でスキップ。JSが無くてもCSSだけで必ず消える。
- 背景：スクロールに合わせて画像の上端（天井）→下端（床）へ移動。
- たまに起きる不具合：4〜10秒に1回、画面内の1か所（まれに2か所）だけ、文字のズレ／RGBずれ／ラインや照明のちらつき。対象は `data-glitch`（`="soft"` は小さいズレ）と `data-flicker` を付けた要素。
- 「動きを減らす」設定（prefers-reduced-motion）では、BOOT・不具合・読み込み演出・ノイズ・背景の移動を止める。
- ABOUT 404 / JOURNAL / VISUAL / GEAR は仮リンク（`href="#"`、押しても移動しない）。ページができたら href を差し替える。
