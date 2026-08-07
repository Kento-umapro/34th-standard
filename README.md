# 34th Standard — コーポレートサイト

株式会社34th Standard / 34th Standard LLC の公式サイト。
広島とロサンゼルスを結ぶ日米ブリッジカンパニーとして、輸出入・現地販売・店舗デザイン施工・進出コンサルティングを紹介する日英バイリンガルサイトです。

**公開URL**: https://kento-umapro.github.io/34th-standard/

---

## 構成

```
index.html      トップ（ヒーロー / ミッション / 34度線 / 事業 / 強み / 実績 / 2拠点 / CTA）
about.html      私たちについて（理念・社名の由来・組織体制・会社概要）
services.html   事業内容（4事業の詳細・プロセス8ステップ・コスト構造）
works.html      取り組み（陣屋 / おもちのプリン / JALITA / 店舗デザイン・パートナー）
contact.html    お問い合わせ（拠点情報・フォーム・地図）
404.html        エラーページ

assets/css/style.css   全ページ共通のスタイル（デザイントークン + コンポーネント）
assets/js/main.js      言語切替・スクロール演出・現地時刻・フォーム送信
assets/img/            画像一式
sitemap.xml / robots.txt / .nojekyll
```

ビルド工程はありません。HTML / CSS / JS を直接編集し、`main` に push すれば GitHub Pages に反映されます。

---

## 実装している主な仕様

| 項目 | 内容 |
|---|---|
| 日英バイリンガル | 全文を両言語で保持。`<html lang>` を切り替えて CSS で表示を制御（`.ja-only` / `.en-only`）。選択は localStorage に保存し、初回はブラウザ言語で自動判定 |
| 現地時刻 | ヘッダー下・フッター・お問い合わせページに広島（JST）とロサンゼルス（PT）の現在時刻をリアルタイム表示 |
| 34度線ビジュアル | 広島とロサンゼルスを結ぶ大圏航路の SVG アニメーション。スマートフォンでは縦型レイアウトに自動で切り替え |
| スクロール演出 | IntersectionObserver によるフェードイン、数値のカウントアップ、プロセスのタイムライン進行 |
| iPhone 最適化 | ファーストビューが 1 画面に収まる高さ設計、セーフエリア（ノッチ / ホームインジケーター）対応、フォーム入力時の自動ズーム防止、親指が届くボタン配置 |
| アクセシビリティ | スキップリンク、`prefers-reduced-motion` 対応、フォーカス表示、aria 属性、JS 無効時も全文が読める設計 |
| SEO | ページ別 title / description（言語連動）、OGP・Twitter Card、JSON-LD（Organization / ContactPage / ItemList）、sitemap.xml、canonical |

---

## お問い合わせフォームの設定

現状フォームは **送信先が未設定** で、送信するとお客様のメールソフトが立ち上がる方式（mailto フォールバック）で動作します。
サーバー経由でメール受信したい場合は、以下 2 か所を書き換えてください。

`contact.html` の `<form>` タグ:

```html
<form class="form" data-contact
      data-endpoint="https://formspree.io/f/xxxxxxxx"   ← 送信先を設定
      data-mailto="info@example.com"                    ← 受信メールアドレス
      novalidate>
```

- `data-endpoint` に [Formspree](https://formspree.io/) 等のエンドポイントURLを入れると、非同期送信＋完了メッセージ表示に切り替わります（HTML以外の変更は不要）。
- `data-endpoint` が空のままなら、メールソフト起動方式で動作し続けます。
- `data-mailto` は現在 `info@34th-standard.com` を仮置きしています。**実際のメールアドレスに差し替えてください。**

---

## 掲載していない情報（意図的な非掲載）

提供資料に含まれていた以下の情報は、対外公開サイトには掲載していません。掲載が必要な場合はご指示ください。

- 各店舗の見積り金額・利益額
- 商品の仕入価格・卸売価格・最低ロット数
- 想定売上高
- 担当者の個人携帯番号（代表電話 082-962-7976 のみ掲載）
- 取引先各社のロゴ画像（社名のテキスト表記のみ。ロゴ掲載には各社の許諾が必要です）

---

## ヒーローの動画

トップのヒーローは動画（`assets/video/hero.mp4`）です。差し替える場合は同じファイル名で置き換えれば動きます。

- **ループ**: 5秒の素材を「順再生 → 逆再生」でつないだ10秒のピンポンループ。始点と終点が一致するため、繰り返しても画が飛びません
- **2サイズ**: デスクトップ 1920×1080（1.5MB）／スマートフォン 1280×720（0.5MB）。画面幅で自動的に出し分けます
- **フォールバック**: 静止画（`hero-port.webp`）を下に敷き、動画が**実際に再生され始めてから**フェードインします。自動再生がブロックされても、iPhoneが低電力モードでも、ヒーローが黒くなることはありません
- **読み込まない条件**: `prefers-reduced-motion`（視差軽減）、省データモード、2G相当の低速回線では動画を取得しません
- 音声トラックは含みません（`autoplay muted playsinline` で iOS のインライン自動再生条件を満たしています）

差し替え素材を作る際の ffmpeg コマンド:

```bash
ffmpeg -i 元素材.mp4 -filter_complex "[0:v]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[v]" -map "[v]" -an -c:v libx264 -profile:v main -pix_fmt yuv420p -crf 27 -preset slow -movflags +faststart assets/video/hero.mp4
```

## 画像について

- 実績写真（陣屋様の料理・店内、おもちのプリン、施工事例）は提供資料から抽出したものです。
- ヒーロー、広島、ロサンゼルス、木工職人、木工所、和モダン内装、夜の海岸線はイメージとして生成した画像です。実際の自社設備・拠点の写真ではありません。**実写に差し替えると訴求力がさらに上がります。**
- 画像はすべて WebP。ヒーローのみ 2560px と 1280px の 2 サイズを用意し、`srcset` で出し分けています。

---

## 独自ドメインを設定する場合

1. リポジトリ直下に `CNAME` ファイルを作成し、1 行目にドメイン名（例: `34th-standard.com`）を記述
2. DNS 側で `A` レコードを GitHub Pages の IP（185.199.108.153 / 185.199.109.153 / 185.199.110.153 / 185.199.111.153）に向ける。サブドメインの場合は `CNAME` レコードを `kento-umapro.github.io` に向ける
3. リポジトリの Settings → Pages で Custom domain を設定し、Enforce HTTPS を有効化
4. 各HTMLの `<link rel="canonical">`、`og:url`、`og:image`、`sitemap.xml`、`robots.txt`、`404.html` のリンク先URLを新ドメインに一括置換

---

## 更新のしかた

テキストの修正は、対応する HTML の該当箇所を直接編集します。日本語と英語が隣り合って書かれているため、両方あわせて更新してください。

```html
<span class="ja-only">日本語のテキスト</span>
<span class="en-only">English text</span>
```

反映:

```bash
git add -A && git commit -m "更新内容" && git push
```

push から 1 分ほどで公開サイトに反映されます。
