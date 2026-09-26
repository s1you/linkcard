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

const config = {
  // ------------------------------------------------------------------
  // 1. サイト全体の共通設定
  // ------------------------------------------------------------------
  site: {
    // サイトの公開URL（GitHub PagesのURLを入力してください）
    // ※ X(Twitter)などのSNSでOGP画像を表示させるためには、完全なURL (https://...) が必要です。
    // 例: "https://username.github.io/linkcard"
    url: "https://s1you.github.io/linkcard",

    // サイト全体のデフォルトタイトル（検索エンジンやブラウザタブ用）
    defaultTitle: "Linkbio - Official Links Hub",

    // サイト全体のデフォルト説明文
    defaultDescription: "複数プロフィール対応のリンクまとめサイトです。",

    // デフォルトのOGP画像（各プロフィールで未指定の場合に使用されます）
    defaultOgImage: "images/og/default.svg",

    // トップページ ( / ) にアクセスしたときの動作
    // "portal": プロフィール一覧（ディレクトリ）を表示します。
    // "redirect": 下記の defaultProfile で指定したプロフィールへ自動転送します。
    rootMode: "portal",

    // rootMode が "redirect" の場合に転送されるプロフィールのID
    defaultProfile: "siyou",
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
    goatCounterCode: "",

    // 各リンクのクリック数を計測するかどうか (true: 計測する / false: 計測しない)
    trackClicks: true,
  },

  // ------------------------------------------------------------------
  // 3. プロフィールページ設定
  // ------------------------------------------------------------------
  // 各キー名（siyou, game, sns など）がそのままURLになります。
  // 例: "siyou" → https://<あなたのサイト>/siyou/
  pages: {
    // ----------------------------------------------------------------
    // 【プロフィール 1】メインプロフィール (siyou)
    // ----------------------------------------------------------------
    siyou: {
      // 画面に表示される名前 (必須)
      name: "siyou",

      // 簡単な自己紹介文や肩書き（省略可。改行もそのまま反映されます）
      bio: "Creator & Developer\n日常の活動・制作物・公式SNSのリンク集です。",

      // プロフィール画像（丸型で表示されます）
      profileImage: "images/profile/siyou.svg",

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
        title: "siyou",
        description: "siyouの公式リンクまとめです。",
        image: "images/og/siyou.svg", // プロフィール専用のOGP画像
      },

      // リンク一覧（上から順番に表示されます）
      // 画像（16:9比率）をクリックしても、下のボタンをクリックしてもリンク先にジャンプします。
      links: [
        {
          title: "YouTube チャンネル",
          url: "https://youtube.com/",
          image: "images/links/youtube.svg", // 16:9比率の画像
          description: "ゲーム配信や動画を定期更新中",
        },
        {
          title: "X (旧Twitter)",
          url: "https://x.com/",
          image: "images/links/x.svg",
          description: "制作の進捗や日々の告知・つぶやき",
        },
        {
          title: "GitHub リポジトリ",
          url: "https://github.com/",
          image: "images/links/github.svg",
          description: "オープンソースプロジェクトのソースコード",
        },
        {
          title: "公式ブログ / note",
          url: "https://note.com/",
          image: "images/links/note.svg",
          description: "開発の裏話や長文エッセイ",
        },
      ],
    },

    // ----------------------------------------------------------------
    // 【プロフィール 2】ゲーム専用プロフィール (game)
    // URL: https://<あなたのサイト>/game/
    // ----------------------------------------------------------------
    game: {
      name: "siyou Games",
      bio: "ゲーム配信・コミュニティ専用リンク集\n参加型配信やDiscordサーバー情報はこちら！",
      profileImage: "images/profile/game.svg",

      background: {
        type: "color",
        value: "#0c0f17",
      },

      og: {
        title: "siyou Games",
        description: "ゲーム配信・コミュニティの専用リンク集",
        image: "images/og/game.svg",
      },

      links: [
        {
          title: "Twitch ライブ配信",
          url: "https://twitch.tv/",
          image: "images/links/twitch.svg",
          description: "毎週金・土 21:00〜 参加型ゲーム配信",
        },
        {
          title: "公式 Discord サーバー",
          url: "https://discord.com/",
          image: "images/links/discord.svg",
          description: "参加型マルチプレイ募集＆雑談コミュニティ",
        },
        {
          title: "YouTube サブチャンネル",
          url: "https://youtube.com/",
          image: "images/links/youtube.svg",
          description: "ハイライトクリップ・アーカイブ動画",
        },
      ],
    },

    // ----------------------------------------------------------------
    // 【プロフィール 3】SNSまとめプロフィール (sns)
    // URL: https://<あなたのサイト>/sns/
    // ----------------------------------------------------------------
    sns: {
      name: "siyou / SNS Hub",
      bio: "主要なソーシャルメディアアカウント一覧です。",
      profileImage: "images/profile/siyou.svg",

      background: {
        type: "auto", // 端末のダーク/ライト設定に自然に追従
      },

      og: {
        title: "siyou - SNS Hub",
        description: "siyouの主要ソーシャルメディアアカウント一覧",
        image: "images/og/siyou.svg",
      },

      links: [
        {
          title: "X (Twitter)",
          url: "https://x.com/",
          image: "images/links/x.svg",
          description: "公式アカウント (@siyou)",
        },
        {
          title: "YouTube",
          url: "https://youtube.com/",
          image: "images/links/youtube.svg",
          description: "メインチャンネル",
        },
      ],
    },
  },
};

// Node.js (build.js) およびブラウザ両対応のエクスポート
if (typeof module !== "undefined" && module.exports) {
  module.exports = config;
}
