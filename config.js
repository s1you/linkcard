/**
 * ====================================================================
 * Linkbio 設定ファイル (config.js)
 * ====================================================================
 * 
 * このファイルは、本サイトの全プロフィールおよびリンク情報を定義する設定ファイルです。
 * サイトの管理画面やデータベースは不要で、このファイルを編集してGitHubへpushするだけで、
 * 各プロフィールの静的HTML（個別OGPタグ付き）が自動生成されて公開されます。
 * 
 * 【初心者向け編集ガイド】
 * - 文字列（テキスト）は必ずダブルクォーテーション " " またはシングルクォーテーション ' ' で囲んでください。
 * - 各項目の末尾のカンマ ( , ) を忘れないようにしてください。
 * - 画像は「images/」フォルダ内に配置したファイルパス、または「https://」から始まる外部画像URLを指定できます。
 */

// URLはここにまとめて指定し、下の設定から参照します。
const urls = {
  site: "https://s1you.github.io/linkcard",
  tkl: "https://lite.tiktok.com/t/ZS9ApLb16J6jJ-RQrxG/",
};

const config = {
  // ------------------------------------------------------------------
  // 1. サイト全体の共通設定
  // ------------------------------------------------------------------
  site: {
    // サイトの公開URL（GitHub PagesのURLを入力してください）
    // ※ X(Twitter)などのSNSでOGP画像を表示させるためには、完全なURL (https://...) が必要です。
    // 例: "https://username.github.io/linkcard"
    url: urls.site,

    // サイト全体のデフォルトタイトル（検索エンジンやブラウザタブ用）
    defaultTitle: "例の物",

    // サイト全体のデフォルト説明文
    defaultDescription: "こちらから見れます",

    // デフォルトのOGP画像（各プロフィールで未指定の場合に使用されます）
    defaultOgImage: "images/og/default.png",

    // トップページ ( / ) にアクセスしたときの動作
    // "portal": プロフィール一覧（ディレクトリ）を表示します。
    // "redirect": 下記の defaultProfile で指定したプロフィールへ自動転送します。
    rootMode: "redirect",

    // rootMode が "redirect" の場合に転送されるプロフィールのID
    defaultProfile: "videotwimg",
  },

  // ------------------------------------------------------------------
  // 2. アクセス解析設定（完全無料・プライバシー重視・サーバー不要）
  // ------------------------------------------------------------------
  analytics: {
    // 利用する解析サービス: "goatcounter" | "none"
    // ※ GoatCounter (https://www.goatcounter.com/) は完全無料・オープンソース・
    //   クッキー不使用(GDPR対応)で、個人サイトに最適なアクセス解析です。
    provider: "goatcounter",

    // GoatCounterのサイトコード
    // https://www.goatcounter.com/ で無料アカウントを作成し、
    // 取得したサイトコード（例: "my-linkbio"）を入力してください。
    // 空文字 "" に設定すると計測は無効化されます（エラーにはなりません）。
    goatCounterCode: "siyou",

    // 各リンクのクリック数を計測するかどうか (true: 計測する / false: 計測しない)
    trackClicks: true,
  },

  // ------------------------------------------------------------------
  // 3. プロフィールページ設定
  // ------------------------------------------------------------------
  // 各キー名（videotwimg, game, sns など）がそのままURLになります。
  // 例: "videotwimg" → https://<あなたのサイト>/videotwimg/
  pages: {
    // ----------------------------------------------------------------
    // 【プロフィール 1】メインプロフィール (videotwimg)
    // ----------------------------------------------------------------
    videotwimg: {
      // 画面に表示される名前 (必須)
      name: "続きはこちらから",

      // 簡単な自己紹介文や肩書き（省略可。改行もそのまま反映されます）
      bio: "",

      // プロフィール画像（丸型で表示されます）
      profileImage: "images/profile/default.png",

      // ページの背景設定
      // type: "auto"     ... 端末のダーク/ライト設定に自動連動（推奨）
      // type: "color"    ... 指定した単色カラーコード（例: "#111111", "#ffffff"）
      // type: "gradient" ... CSSグラデーション（例: "linear-gradient(180deg, #18191f 0%, #0f1013 100%)"）
      // type: "image"    ... 背景画像（例: "images/bg/pattern.png"）
      background: {
        type: "color",
        value: "#0f1115",
      },

      // SNS共有時のカード設定 (OGP / Twitter Card)
      // X(Twitter), LINE, Discord等でURLを共有した際に表示される情報です。
      og: {
        title: "例のアレ",
        description: "",
        image: "images/og/default.png", // プロフィール専用のOGP画像
      },

      // リンク一覧（上から順番に表示されます）
      // 画像（16:9比率）をクリックしても、下のボタンをクリックしてもリンク先にジャンプします。
      links: [
        {
          title: "こちらから見れます",
          url: urls.tkl,
          image: "images/links/douga.png", // 16:9比率の画像
          description: "",
        },
      ],
    },

    // ----------------------------------------------------------------
    // 【プロフィール 2】ゲーム専用プロフィール (game)
    // URL: https://<あなたのサイト>/jaguchi/
    // ----------------------------------------------------------------
    jaguchi: {
      name: "真相はこちらから",
      bio: "",
      profileImage: "images/profile/default.png",

      background: {
        type: "color",
        value: "#0c0f17",
      },

      og: {
        title: "真相はこちらから🔞",
        description: "",
        image: "images/og/jaguchi-onna.png",
      },

      links: [
        {
          title: "🔞🔞🔞",
          url: urls.tkl,
          image: "images/links/default.png",
          description: "",
        },
      ],
    },
  },
};

// Node.js (build.js) およびブラウザ両対応のエクスポート
if (typeof module !== "undefined" && module.exports) {
  module.exports = config;
}
