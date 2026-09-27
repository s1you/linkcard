# Linkbio - GitHub Pages対応 マルチプロフィールリンクサイト

GitHub Pagesで完全無料・サーバーレス・ログイン不要で運用できる、Linktree / Linkbio 形式のプロフィールリンクサイトです。

1つのリポジトリで複数のプロフィールページ（例: `/siyou/`, `/game/`, `/sns/`）を作成でき、**各プロフィールごとに独自の16:9サムネイル付きリンクカードおよびSNS共有用OGPメタタグ（個別画像・タイトル・説明文）** が静的HTMLとして自動生成されます。

管理画面やデータベースは一切不要で、リポジトリ内の `config.js` を直接編集してGitHubへpushするだけで、GitHub Actionsが自動的に静的サイトを生成し、GitHub Pagesへデプロイします。

---

## 📑 目次

1. [主な特徴](#1-主な特徴)
2. [ファイル構成](#2-ファイル構成)
3. [初期セットアップ手順](#3-初期セットアップ手順)
   - [GitHubリポジトリの作成とpush](#31-githubリポジトリの作成とpush)
   - [GitHub Pages の設定 (GitHub Actions連携)](#32-github-pages-の設定-github-actions連携)
4. [設定ファイル (config.js) の編集方法](#4-設定ファイル-configjs-の編集方法)
   - [サイト全体の基本設定](#41-サイト全体の基本設定)
   - [プロフィールの追加・変更・削除](#42-プロフィールの追加変更削除)
   - [リンクの追加・変更・順番変更](#43-リンクの追加変更順番変更)
5. [画像の設定と追加方法](#5-画像の設定と追加方法)
   - [プロフィール画像](#51-プロフィール画像)
   - [リンク画像 (16:9サムネイル)](#52-リンク画像-169サムネイル)
   - [OGP画像](#53-ogp画像)
6. [OGP（SNSカード表示）の仕組みとキャッシュ対策](#6-ogpsnsカード表示の仕組みとキャッシュ対策)
7. [アクセス解析（無料・GoatCounter連携）の設定](#7-アクセス解析無料goatcounter連携の設定)
8. [GitHub Actions の動作の仕組み](#8-github-actions-の動作の仕組み)
9. [セキュリティと安全性への配慮](#9-セキュリティと安全性への配慮)
10. [ローカル環境でのビルド・確認方法](#10-ローカル環境でのビルド確認方法)
11. [動作確認チェックリスト](#11-動作確認チェックリスト)

---

## 1. 主な特徴

- 🌟 **完全無料 & サーバーレス**: GitHub Pages と GitHub Actions だけで動作し、ランニングコストは0円です。
- 📱 **マルチプロフィール対応**: `https://<ユーザー名>.github.io/<リポジトリ名>/<プロフィールID>/` の形式で、用途別（日常、ゲーム、配信、作品など）に複数のページを自由に作成可能。
- 🖼️ **16:9 サムネイル + ボタンの2層構造**: 各リンクに16:9の画像カードを表示。画像クリックでもボタンクリックでもリンク先に移動できます。
- 🎯 **個別OGP完全対応**: SNSクローラー（X / Discord / LINE / Facebook等）向けにプロフィールごとの静的HTMLを事前生成。プロフィールごとに異なるOGPサムネイルと説明文が表示されます。
- 🎨 **脱・AIテンプレートの洗練デザイン**: 派手なネオングラデーションや読みにくい過剰ぼかしを排除し、手作業で丁寧に組まれたミニマルで自然なエディトリアルデザインを採用。
- 🌓 **自然なダーク / ライトモード**: 端末設定（`prefers-color-scheme`）に自動追従。さらにプロフィールごとの背景色・グラデーション・背景画像も指定可能。
- 📊 **プライバシー重視の無料アクセス解析**: 秘密キー不要・クッキー不使用のGoatCounterと連携し、ページ表示数と各リンクのクリック数を計測可能。
- 🔒 **堅牢なセキュリティ**: XSSエスケープ処理、危険スキーム（`javascript:`, `data:` 等）の遮断、外部リンクの `rel="noopener noreferrer"` 自動付与を徹底。

---

## 2. ファイル構成

```text
linkbio/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 自動ビルド＆デプロイ定義
├── assets/
│   ├── css/
│   │   └── style.css           # サイト全体のデザイン・タイポグラフィ・レスポンシブ
│   └── js/
│       └── main.js             # クリック解析・画像エラーフォールバック
├── images/
│   ├── profile/                # プロフィール画像 (例: siyou.svg, game.svg)
│   ├── links/                  # 16:9 リンクサムネイル画像 (例: youtube.svg, x.svg)
│   └── og/                     # SNSシェア用 OGP画像 (例: siyou.svg, game.svg)
├── config.js                   # 【ユーザー編集用】全プロフィール・リンク設定
├── template.html               # 個別プロフィールページ用HTMLテンプレート
├── template-index.html         # トップポータル一覧用HTMLテンプレート
├── 404.html                    # 404 Not Found エラーページ
├── build.js                    # 静的HTMLジェネレーター (Node.js標準ライブラリのみ)
├── build.ps1                   # Windows PowerShell用ローカルビルド実行スクリプト
├── serve.js                    # ローカルプレビュー用HTTPサーバー
├── package.json                # npmスクリプト定義
├── .gitignore                  # Git除外設定
└── README.md                   # 本ドキュメント
```

---

## 3. 初期セットアップ手順

### 3.1. GitHubリポジトリの作成とpush

1. GitHubにログインし、新しいリポジトリ（例: `linkcard` または `linkbio`）を作成します（Public または Private どちらでも可能ですが、無料のGitHub Pagesを利用する場合は通常 **Public** を推奨します）。
2. 本プロジェクトのファイル一式をリポジトリにコミットして push します。

```bash
git init
git add .
git commit -m "Initial commit of linkbio site"
git branch -M main
git remote add origin https://github.com/<あなたのユーザー名>/<リポジトリ名>.git
git push -u origin main
```

### 3.2. GitHub Pages の設定 (GitHub Actions連携)

GitHubの最新仕様である「GitHub Actions を使用したPagesデプロイ」を有効化します。

1. GitHubのリポジトリページを開きます。
2. 上部メニューの **Settings**（設定）をクリックします。
3. 左側サイドバーの **Pages** を選択します。
4. **Build and deployment** セクションの **Source** ドロップダウンで、**「GitHub Actions」** を選択します。
5. これで設定は完了です！ `main` ブランチに push されるたびに、`.github/workflows/deploy.yml` が自動起動し、サイトが公開されます。
6. 数十秒後にデプロイが完了すると、Pages画面の上部に公開URL（例: `https://<あなたのユーザー名>.github.io/<リポジトリ名>/`）が表示されます。

---

## 4. 設定ファイル (config.js) の編集方法

ユーザーが編集するのは基本的に **`config.js`** と **`images/`** フォルダのみです。

### 4.1. サイト全体の基本設定

`config.js` の `site` ブロックを編集します。

```javascript
site: {
  // あなたのGitHub Pages公開URL（末尾のスラッシュなし）
  // ※ XなどのSNSでOGP画像を完全なURLで読み込ませるために必須です。
  url: "https://your-username.github.io/linkcard",

  // サイト全体の共通タイトル
  defaultTitle: "Linkbio - Official Links Hub",

  // サイト共通の説明文
  defaultDescription: "プロフィールリンク集",

  // デフォルトOGP画像
  defaultOgImage: "images/og/default.svg",

  // トップページ ( / ) にアクセスしたときの挙動
  // "portal": 全プロフィールのディレクトリ一覧を表示
  // "redirect": defaultProfile で指定したプロフィールへ自動リダイレクト
  rootMode: "portal",

  // rootMode が "redirect" の場合の転送先プロフィールID
  defaultProfile: "siyou",
},
```

### 4.2. プロフィールの追加・変更・削除

`config.js` の `pages` ブロック内にプロフィールを定義します。キー名（例: `siyou`, `game`, `sns`）がそのままURLのスラッグ（`.../<キー名>/`）になります。

#### 新しいプロフィールを追加する例

```javascript
pages: {
  // 既存の siyou プロフィール ...

  // ★ 新しいプロフィール "portfolio" を追加する場合:
  portfolio: {
    name: "siyou - Portfolio",
    bio: "イラストレーションとUIデザインの制作ポートフォリオです。",
    profileImage: "images/profile/portfolio.jpg", // プロフィール画像
    
    // 背景設定 ("auto", "color", "gradient", "image" から選択可能)
    background: {
      type: "color",
      value: "#12141a"
    },

    // SNSシェア時のカード情報
    og: {
      title: "siyou Portfolio",
      description: "イラスト・UIデザインの制作実績まとめ",
      image: "images/og/portfolio.jpg"
    },

    // リンク一覧
    links: [
      {
        title: "Behance 制作実績",
        url: "https://www.behance.net/...",
        image: "images/links/behance.jpg",
        description: "高解像度の作品ギャラリー"
      },
      {
        title: "BOOTH オンラインショップ",
        url: "https://booth.pm/...",
        image: "images/links/booth.jpg",
        description: "オリジナルグッズや素材集を販売中"
      }
    ]
  }
}
```

- **削除したい場合**: 対象のキー（例: `game: { ... },`）を丸ごと削除するだけで、次回ビルド時に静的ページから除外されます。
- **名前・紹介文を変更したい場合**: `name` や `bio` の文字列を書き換えます。

### 4.3. リンクの追加・変更・順番変更

各プロフィールの `links` 配列を編集します。

```javascript
links: [
  // 1番目に表示したいリンク
  {
    title: "YouTube チャンネル",
    url: "https://youtube.com/@channel",
    image: "images/links/youtube.jpg",
    description: "毎週金曜日 20:00 動画更新" // 補足説明（省略可能）
  },
  // 2番目に表示したいリンク
  {
    title: "X (旧Twitter)",
    url: "https://x.com/username",
    image: "images/links/x.jpg",
    description: "制作進捗や日常のつぶやき"
  }
]
```

- **順番を変更したい場合**: 配列内のオブジェクト `{ title: ... }` の並び順を入れ替えるだけで、上から順番に表示されます。
- **リンクを削除したい場合**: 不要な `{ ... }` のブロックを削除します。

---

## 5. 画像の設定と追加方法

画像ファイルはリポジトリ内の `images/` ディレクトリに配置します。

### 5.1. プロフィール画像 (`images/profile/`)
- **推奨サイズ**: 200 × 200 px 以上の正方形（1:1）。
- **対応フォーマット**: `.jpg`, `.png`, `.webp`, `.svg`
- サイト上では自動的にきれいな円形（丸型アイコン）として切り抜かれ、枠線と影が付与されます。

### 5.2. リンク画像 (`images/links/`)
- **推奨サイズ**: **16:9 比率**（例: 1280 × 720 px, 1920 × 1080 px, 640 × 360 px）。
- **対応フォーマット**: `.jpg`, `.png`, `.webp`, `.svg`
- CSSの `aspect-ratio: 16 / 9;` および `object-fit: cover;` により、多少サイズや縦横比が異なる画像を配置してもレイアウト崩れを起こしません。
- 画像が存在しない、またはネットワークエラーが発生した場合は、崩れることなく自動的にフォールバック表示（プレースホルダーアイコン）に切り替わります。

### 5.3. OGP画像 (`images/og/`)
- **推奨サイズ**: **1200 × 630 px**（横縦比 1.91:1）。
- 各プロフィールごとに個別の画像を設定できます。未設定の場合は `config.site.defaultOgImage` がフォールバックとして使用されます。

---

## 6. OGP（SNSカード表示）の仕組みとキャッシュ対策

### 静的HTMLによる完全なOGP対応
GitHub Pagesのような静的ホスティングでは、JavaScriptでブラウザ起動後に `<meta>` タグを書き換えても、X(Twitter)やDiscord、LINEなどの**SNSクローラーはJavaScriptを実行しないためOGPを認識できません**。

本プロジェクトでは、`build.js` が `config.js` を読み込み、**プロフィールごとに最初から固有の `<meta property="og:image">` や `<meta name="twitter:card">` が書き込まれた静的HTML（例: `/siyou/index.html`）を生成**します。そのため、SNSでURLを投稿した際に確実かつ高速にカードが表示されます。

### SNS側のキャッシュに関する注意点
X(Twitter)やFacebook、Discordなどの各プラットフォームは、一度読み込んだOGP画像やタイトルを数日〜数週間にわたってキャッシュ（一時保存）します。
そのため、`config.js` でOGP画像を変更してGitHub Pagesを更新しても、SNS側で古い画像がそのまま表示される場合があります。

#### キャッシュを即時更新する方法
1. **画像ファイル名を変更する**:
   `siyou-og-v2.jpg` のようにファイル名を変更して `config.js` を更新すると、SNSクローラーは新規URLと認識して即座に最新画像を読み込みます（最も確実でおすすめの方法です）。
2. **公式デバッガーを利用する**:
   - **X (Twitter)**: [Card Validator](https://cards-dev.twitter.com/validator)
   - **Facebook**: [シェアデバッガー](https://developers.facebook.com/tools/debug/)
   - **LINE**: [Page URL Inspection](https://poker.line.naver.jp/)

---

## 7. アクセス解析（無料・GoatCounter連携）の設定

本サイトは完全無料で利用でき、クッキー不要（GDPR対応）の軽量オープンソース解析サービス **[GoatCounter](https://www.goatcounter.com/)** に対応しています。

### なぜ GoatCounter を選定したか？
1. **完全無料**: 非営利・個人用途であればずっと無料で利用可能です。
2. **サーバー・DB不要**: GitHub Pagesにスクリプトを1行埋め込むだけで動作します。
3. **秘密キー不要**: トークンやシークレットを公開リポジトリに晒すリスクがなく、公開サイトコード（`my-code`）のみで動作します。
4. **プライバシー重視**: クッキーを保存せず、個人情報を収集しないため、EU圏や日本のプライバシー指針にも自然に適合します。
5. **クリックイベント計測**: ページの閲覧回数だけでなく、各リンクのクリック数もイベントとして自動集計できます。

### 設定手順
1. [GoatCounter公式サイト](https://www.goatcounter.com/signup) で無料アカウントを作成します。
2. 作成時に決めた「サイトコード」（例: `my-linkbio`）を控えます。
3. `config.js` の `analytics` ブロックにサイトコードを入力します。

```javascript
analytics: {
  provider: "goatcounter",
  goatCounterCode: "my-linkbio", // ここに入力
  trackClicks: true,             // 各リンクのクリック数を計測
}
```

4. 変更をGitHubへpushすると、自動的に解析スクリプトが埋め込まれます。
5. GoatCounterのダッシュボード（`https://my-linkbio.goatcounter.com`）にアクセスすると、以下のようにリアルタイムで計測結果を確認できます：
   - **ページアクセス数**: `/siyou/`, `/game/`, `/sns/` ごとの表示回数
   - **リンククリック数**: `click/siyou/youtube-` 等のカスタムイベントとして集計

※ 解析を行わない場合は、`goatCounterCode: ""`（空文字）のままにしておけば計測は一切行われません。

---

## 8. GitHub Actions の動作の仕組み

リポジトリ内の `.github/workflows/deploy.yml` に定義されたワークフローが以下の流れで自動実行されます：

```text
[ローカル] config.js を編集して git push
    ↓
[GitHub] main ブランチへの push を検知
    ↓
[GitHub Actions 仮想環境 (Ubuntu)]
    1. リポジトリをチェックアウト
    2. Node.js 20 環境をセットアップ
    3. node build.js を実行
       - config.js の設定内容を検証
       - template.html を使って /siyou/index.html などを生成
       - assets/, images/ を dist/ にコピー
       - dist/.nojekyll を作成
    4. 生成された dist/ ディレクトリをアーティファクトとしてアップロード
    5. GitHub Pages のインフラへ直接安全にデプロイ
    ↓
[完了] 数十秒で公開サイトに反映！
```

---

## 9. セキュリティと安全性への配慮

1. **XSS (クロスサイトスクリプティング) の徹底防御**:
   - `build.js` 内で、名前・紹介文・リンクタイトル・説明文など、ユーザーが入力するすべての文字列に対して HTML特殊文字 (`&`, `<`, `>`, `"`, `'`) の厳格なエスケープ処理を行っています。
2. **危険なURLスキームの遮断**:
   - リンクURLにおいて、`javascript:`, `data:`, `vbscript:` などのスクリプト実行を誘発するプロトコルを無条件でブロックし、安全な `https://`, `http://`, `mailto:`, `tel:` のみを許可しています。
3. **外部リンクのタブ保護**:
   - すべての外部リンクに `target="_blank"` および `rel="noopener noreferrer"` を付与し、リンク先ページからの `window.opener` 操作によるフィッシング詐欺やリファラ情報の漏洩を防止しています。
4. **秘密キーの非保持**:
   - 公開される静的ファイル内にはいかなるAPIシークレットや管理用パスワードも含めない設計にしています。

---

## 10. ローカル環境でのビルド・確認方法

GitHubにpushする前に、ローカルPC上で動作や見た目を確認することができます。

### Windows (PowerShell) の場合
```powershell
# 1. 静的サイトをビルド (dist/ フォルダが生成されます)
powershell -ExecutionPolicy Bypass -File build.ps1

# 2. ローカルサーバーを起動
node serve.js
# または dist/index.html を直接ブラウザでダブルクリックして開くことも可能です！
```

### Node.js (Mac / Linux / Windows) の場合
```bash
# 1. 静的サイトをビルド
node build.js

# 2. ローカルサーバーを起動
node serve.js
```

ブラウザで `http://localhost:3000/` または `http://localhost:3000/siyou/` にアクセスして確認できます。

---

## 11. 動作確認チェックリスト

公開前または設定変更後は、以下の項目を確認してください。

- [ ] **複数プロフィール**: `/<プロフィールID>/`（例: `/siyou/`, `/game/`）ごとに固有のページが表示されるか
- [ ] **16:9 画像**: リンク画像が16:9比率を保ち、はみ出しや歪みがないか
- [ ] **リンク動作**: 16:9画像をクリックした時、およびボタンをクリックした時の両方でリンク先が開くか
- [ ] **OGP設定**: プロフィールごとに異なる `<meta property="og:image">` やタイトルがソースコード内に出力されているか
- [ ] **レスポンシブ**: スマートフォン画面幅（375px〜430px）およびPC画面幅で自然に中央配置されるか
- [ ] **ダーク/ライトモード**: OSのテーマを切り替えた際に文字が自然に読みやすいコントラストを維持しているか
- [ ] **404ページ**: 存在しないURL（例: `/not-exist/`）にアクセスした際に適切なエラー画面が表示されるか
- [ ] **エラーハンドリング**: リンク画像が存在しない場合にレイアウトが崩れずフォールバックが表示されるか
