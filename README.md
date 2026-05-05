# 緑どんぐり ポートフォリオサイト

AIクリエイティブの制作を行う緑どんぐりの公式サイト。

公開URL: https://green27donguri.github.io/

## 構成

```
green27donguri-site/
├── index.html         入口・お問い合わせフォーム
├── thanks.html        送信完了
├── profile.html       ハブ・プロフィール（hero_imageフルブリード）
├── services.html      サービス
├── works.html         実績（noteマガジン）
├── pr.html            スポンサー募集
├── css/
│   ├── base.css       リセット・カラートークン・タイポ
│   ├── theme.css      レイアウト・コンポーネント・アニメーション・森・雲レイヤー
│   └── sprite.css     スプライト用スタイル
├── js/
│   ├── config.js      サイト設定（GA ID）
│   ├── analytics.js   Google Analytics 4 ローダー
│   ├── data.js        works データ（インライン）
│   ├── sprite.js      JS駆動スプライト制御 + 物理 + 共有状態
│   ├── effects.js     Canvas2D 葉っぱ・どんぐりパーティクル + マウス/スプライト連動
│   ├── forest.js      SVG木シルエット背景レイヤー
│   ├── clouds.js      SVG雲シルエット背景レイヤー
│   ├── form.js        2グループフォーム
│   └── cards.js       URLカード描画
├── data/
│   └── works.json     works データ（canonical）
├── assets/
│   ├── favicon.svg
│   ├── hero_image.png profile メインビジュアル
│   ├── ogp.png        OGP共通画像
│   ├── shiba_sprite.png
│   └── acorn_sprite.png
├── .github/workflows/
│   └── pages.yml      GitHub Pages 自動デプロイ
├── README.md
├── LICENSE
└── CHANGELOG.txt
```

## デザイン方針

- 全ページ統一の世界観（白基調 + 緑アクセント + ultra-rounded card）
- Mintlify + Runway ハイブリッド（インフォグラフィック構造 + ヒーローバンドの主役感）
- リアルタイムレンダリングの粒子場（Canvas2D・Three.js非採用）
- index は「ゆったり」、詳細は「激しく」、ただし上品さを保つ
- 背景に雲（上空）+ 森（地上）のシルエット2層

## アクセシビリティ

- `prefers-reduced-motion` 検知で全アニメーション自動オフ
- スマホ判定でパーティクル数を削減・スプライト縮小・木の本数も減らす
- フォーカスリング全要素対応
- すべての装飾画像に `aria-hidden` または `alt` 設定

## Google Analytics 4 の設定

`js/config.js` を編集して測定ID（GA4管理画面で発行される `G-` から始まる文字列）を `ga4MeasurementId` にセットすると、自動でGAが有効化されます。空文字のままなら GA 関連の外部リクエストは一切発生しません。

## オブジェクト連動の仕組み

各JSは `window.__STAGE__` という共有状態オブジェクトでスプライト位置・マウス位置を読み書きします。

- `sprite.js` がスプライト座標を毎フレーム書き込み
- `effects.js` がスプライト・マウス座標を読み取って粒子に力を加算
- `forest.js` がスプライト座標を読み取って木の揺れ振幅を増幅

## 技術構成

- 静的 HTML/CSS/JS（ビルド不要）
- フォント: Inter Variable (rsms.me CDN)
- フォーム: Formspree (mlgzrkgn)
- ホスティング: GitHub Pages

## ローカルでの確認方法

スプライトと works.json を fetch するためローカルサーバ経由で確認します。

```
python -m http.server 8000
```

その後 `http://localhost:8000/` をブラウザで開きます。

スマホからは同じWi-Fi経由で `http://<PCのIPv4>:8000/` でアクセス可能。

## デプロイ手順

このリポジトリは `main` ブランチへの push で自動的に GitHub Pages にデプロイされます。

### 初回セットアップ

1. GitHub 側で空の `green27donguri.github.io` リポジトリを先に作成（README/LICENSE等は付けず空のまま）
2. ローカルで Git 初期化＆コミット → push：
   ```
   git init
   git branch -M main
   git add .
   git commit -m "initial"
   git remote add origin https://github.com/green27donguri/green27donguri.github.io.git
   git push -u origin main
   ```
3. GitHub の **Settings → Pages**:
   - Source: **GitHub Actions** を選択
4. 数十秒で初回デプロイが完了し、`https://green27donguri.github.io/` で公開されます

### 以降の更新

```
git add -A
git commit -m "update"
git push
```

push すれば `.github/workflows/pages.yml` が走って自動デプロイされます。

## 編集ガイド

### note記事の追加

`js/data.js` の `__WORKS__` オブジェクトに追記すれば works/pr ページに反映されます。canonical なデータは `data/works.json` にも反映してください。

### 文言の変更

各 HTML を直接編集してください。テンプレートは使っていません。

### スプライト画像の差し替え

`assets/shiba_sprite.png` / `assets/acorn_sprite.png` を同じファイル名・透過PNGで差し替えてください。横8コマ前提。

### パーティクル・森・雲の調整

- 粒子: `js/effects.js` 冒頭の `COUNTS` / `SETTINGS` で本数・速度・力場の半径などを調整
- 森: `js/forest.js` の `COUNT` で本数、`treeShape()` で SVG パスを変更
- 雲: `js/clouds.js` の `TIER_COUNTS` / `TIERS` で奥行き別の本数・サイズ・速度・透明度を調整

## ライセンス

MIT License — `LICENSE` ファイルをご覧ください。
