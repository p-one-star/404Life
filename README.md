# 404Life

404 LIFE｜人生整備中。 — https://404-life.com/

## 構成

| ファイル | 内容 |
| --- | --- |
| `index.html` | TOP（Tailwind CDN） |
| `about.html` | 01 // ABOUT 404（個体情報ファイル） |
| `original.html` | 02 // ORIGINAL（404が作ったモノ＝SUZURIのオリジナルグッズ。並びは固定） |
| `gear.html` | 03 // WORK GEAR（404の商売道具＝職人として仕事で使う道具。楽天アフィリエイト。並びはシャッフル） |
| `play.html` | 04 // PLAY GEAR（404のオモチャ＝仕事と関係ない物。楽天アフィリエイト。並びはシャッフル） |
| `playground.html` | 05 // PLAYGROUND（404の遊び場。遊びの種類の一覧） |
| `word-search.html` | 文字探しパズルの盤面一覧 |
| `word-search-001.html` | 文字探し001の答え合わせ（検索窓・発光・消しゴム） |
| `assets/playground.css` / `assets/word-search.js` | PLAYGROUNDの見た目／文字探しの答え合わせ |
| `assets/ws-logo.webp` | 文字探しの看板（パズル画像のロゴ部分を切り出し） |
| `assets/system.css` | 404 LIFE SYSTEM のUI・演出（BOOT、CRT、たまに起きる不具合、読み込み演出、背景） |
| `assets/about.css` | ファイルページ（ABOUT・ORIGINAL・GEAR）共通の部品（ファイル見出し、本文枠、画像枠、RETURNボタンなど） |
| `assets/gear.css` / `assets/gear.js` | ORIGINAL・GEAR共通の持ち物カード／件数・読み込み演出・管理番号の重複チェック・クリック数の記録・シャッフル（`data-shuffle` を付けたリストだけ） |
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
- TOP の構成は 01 ABOUT 404 / 02 ORIGINAL / 03 WORK GEAR / 04 PLAY GEAR / 05 PLAYGROUND / 06 SNS（上部ナビは7項目、`sys-nav--7`。スマホは4列×2段、600px以上は1段）。PLAYGROUND は `playground.html` へ。ORIGINAL は `original.html`、WORK GEAR は `gear.html`、PLAY GEAR は `play.html` へ。

## ページの共通部分

TOP と ABOUT は同じ `system.css` / `system.js` を読み込む（背景・BOOT・走査線・不具合演出・読み込み演出・レール・ナビ・フッター）。ページ固有の見た目は別ファイル（例：`about.css`）に分ける。

## ABOUT の画像

`assets/about-404.webp`（404）と `assets/about-black-dog.webp`（黒犬）。どちらも720×900（4:5）。差し替えるときは同じファイル名で上書きするか、`about.html` の `<img class="sys-slot__img" …>` の src を変える。元画像は `source-assets/`（Git管理外）。

## GEAR の持ち物を追加する

仕事で使う道具は `gear.html`（WORK GEAR）、仕事と関係ない物は `play.html`（PLAY GEAR）。両方で使う物は、両方のページに同じ行（同じ管理番号）を入れる。

`gear.html` / `play.html` の `<ol class="sys-gear-list">` の中に、1つの持ち物につき1行。行をコピーして4か所を書き換える。

```html
<li><a class="sys-gear" href="楽天アフィリエイトURL" target="_blank" rel="sponsored noopener"><span class="sys-gear__id">CAMERA // 003</span><span class="sys-gear__name">俺のカメラ</span></a></li>
```

- 管理番号は `カテゴリ // 3桁`。カテゴリごとに001から連番。同じ名前が複数あってもよい。
- URLが未定の間は `href="#"`。自動で STANDBY 表示になり、押しても移動しない。URLを入れると ↗ が付き、カード全体が楽天へ直接つながる（新しいタブ）。
- `target="_blank" rel="sponsored noopener"` は消さない（広告リンクの印）。
- 件数表示（ITEMS）は自動。管理番号が重複すると、ブラウザのコンソールに警告が出る。
- 並び順は、ページを開くたびにランダムに入れ替わる（gear.js）。HTMLに書く順番は管理しやすい順でよい。
- リンク付きカードが押されると、管理番号だけをクリック数の受け口（Cloudflare Worker `404-life-clicks`）へ送る。集計はVaultの `click-counter/` で行い、サイトには表示しない。管理番号を変えると、別の持ち物として数え直しになる。
- ページ上部のPR表記は、広告リンクがある限り消さない。

## ORIGINAL の商品を追加する

`original.html` の `<ol class="sys-gear-list sys-gear-list--original">` の中。GEARと同じ1行の形で、rel は `noopener`（自社グッズなので sponsored は付けない）。

- 並びは固定。PCでは2列で、左→右、上→下。上から T-SHIRT → HOODIE → ZIP HOODIE（各2枚ずつ横に並ぶ）、その下に小物。
- `<li class="sys-slot-row">` は「次の作品用の空き地」（リンクなし、EMPTY SLOT 表示）。件数・クリック数には入らない。新作が出たら、空き地の行を商品の行に置き換え、次の空き地を足す。
- 楽天のリンクは `gear.html` へ。SUZURIのリンクは `original.html` へ。

## 文字探しの盤面を追加する（word-search-002.html など）

1. `word-search-001.html` をコピーして `word-search-002.html` にする。`data-ws="002"`、見出し・タイトルの番号を書き換える。
2. `.ws-grid` の中の文字を新しい盤面に置き換える（左上から右へ、行ごと。マスの数は 縦×横。13×13以外なら `assets/playground.css` の `repeat(13, …)` を合わせる）。
3. 正解ワードは**ページに書かない**。`data-ws-key` に、各ワードを `cyrb53('404LIFE/WS002/' + ワード, 404)` したハッシュ値の一覧を入れる（計算方法は `assets/word-search.js` と同じ）。
4. `word-search.html` の空き地（BOARD // 002）を、新しい盤面へのカードに置き換え、次の空き地を足す。
5. 答えの一覧や元画像は `source-assets/`（公開しない）に置く。
