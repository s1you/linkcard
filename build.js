/**
 * Linkbio - Static Site Generator (build.js)
 * 
 * 外部依存関係ゼロ（Node.js標準のfsとpathのみ）で動作します。
 * GitHub Actions および ローカル環境の両方で高速かつ安全に静的HTMLを生成します。
 */

const fs = require('fs');
const path = require('path');

// ルートパス
const ROOT_DIR = __dirname;
const CONFIG_PATH = path.join(ROOT_DIR, 'config.js');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const TEMPLATE_PROFILE_PATH = path.join(ROOT_DIR, 'template.html');
const TEMPLATE_INDEX_PATH = path.join(ROOT_DIR, 'template-index.html');
const TEMPLATE_404_PATH = path.join(ROOT_DIR, '404.html');

/**
 * HTML特殊文字のエスケープ（XSS対策）
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 危険なURLスキームの検証とサニタイズ（URLインジェクション対策）
 */
function sanitizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '#';
  const trimmed = rawUrl.trim();
  // 許可するプロトコル: https, http, mailto, tel
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }
  // 相対パスの場合は安全とみなす
  if (/^(\.|\/|[a-zA-Z0-9_-])/i.test(trimmed) && !trimmed.toLowerCase().includes('javascript:') && !trimmed.toLowerCase().includes('data:') && !trimmed.toLowerCase().includes('vbscript:')) {
    return trimmed;
  }
  console.warn(`[Security Warning] Blocked potentially unsafe URL: ${rawUrl}`);
  return '#';
}

/**
 * ディレクトリを再帰的にコピーするヘルパー
 */
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * メインビルド処理
 */
function build() {
  const startTime = Date.now();
  console.log('----------------------------------------------------');
  console.log('🚀 Linkbio: 静的サイト生成を開始します...');
  console.log('----------------------------------------------------');

  // 1. 設定ファイルの読み込み
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error(`❌ エラー: 設定ファイルが見つかりません: ${CONFIG_PATH}`);
    process.exit(1);
  }

  // キャッシュをクリアして読み込み
  delete require.cache[require.resolve(CONFIG_PATH)];
  const config = require(CONFIG_PATH);

  if (!config.pages || Object.keys(config.pages).length === 0) {
    console.error('❌ エラー: config.js 内に pages が定義されていません。');
    process.exit(1);
  }

  // 2. テンプレートファイルの読み込み
  const templateProfile = fs.readFileSync(TEMPLATE_PROFILE_PATH, 'utf-8');
  const templateIndex = fs.readFileSync(TEMPLATE_INDEX_PATH, 'utf-8');
  const template404 = fs.existsSync(TEMPLATE_404_PATH) ? fs.readFileSync(TEMPLATE_404_PATH, 'utf-8') : '';

  // 3. dist ディレクトリの初期化
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // 4. 静的アセットのコピー (assets, images)
  const assetsSrc = path.join(ROOT_DIR, 'assets');
  const imagesSrc = path.join(ROOT_DIR, 'images');
  if (fs.existsSync(assetsSrc)) {
    copyDirSync(assetsSrc, path.join(DIST_DIR, 'assets'));
  }
  if (fs.existsSync(imagesSrc)) {
    copyDirSync(imagesSrc, path.join(DIST_DIR, 'images'));
  }

  // 5. GitHub Pages用 .nojekyll の作成（Jekyllによるファイル除外を防止）
  fs.writeFileSync(path.join(DIST_DIR, '.nojekyll'), '', 'utf-8');

  // サイト基本情報の整理
  const siteUrl = (config.site && config.site.url) ? config.site.url.replace(/\/+$/, '') : '';
  const siteTitle = escapeHtml((config.site && config.site.defaultTitle) || 'Linkbio');
  const siteDescription = escapeHtml((config.site && config.site.defaultDescription) || 'プロフィールリンク集');

  // 解析タグの生成
  let analyticsTag = '';
  if (config.analytics && config.analytics.provider === 'goatcounter' && config.analytics.goatCounterCode) {
    const code = escapeHtml(config.analytics.goatCounterCode.trim());
    analyticsTag = `<script data-goatcounter="https://${code}.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>`;
  }

  // 自動転送（リダイレクト）設定の取得
  const globalAutoRedirect = (config.site && config.site.autoRedirect) || {};
  const defaultAutoRedirectUrl = globalAutoRedirect.url || (config.urls && config.urls.tkl) || '';
  const defaultAutoRedirectDelay = typeof globalAutoRedirect.delayMs === 'number' ? globalAutoRedirect.delayMs : 1500;
  const defaultAutoRedirectNewTab = globalAutoRedirect.newTab !== false; // デフォルトで新しいタブで開く
  const isGlobalAutoRedirectEnabled = globalAutoRedirect.enabled !== false && !!defaultAutoRedirectUrl;

  /**
   * 自動転送スクリプトタグを生成するヘルパー関数
   */
  function createAutoRedirectTag(targetUrl, delayMs, openInNewTab = true) {
    if (!targetUrl) return '';
    const safeUrl = sanitizeUrl(targetUrl);
    if (!safeUrl || safeUrl === '#') return '';
    const delay = (typeof delayMs === 'number' && delayMs >= 0) ? delayMs : 1500;
    const isNewTab = !!openInNewTab;

    return `  <!-- 自動転送スクリプト (アクセス後約${delay / 1000}秒で${isNewTab ? '新しいタブ' : '同一タブ'}で指定URLへ遷移) -->
  <script>
    (function () {
      var redirectUrl = ${JSON.stringify(safeUrl)};
      var delayMs = ${delay};
      var openInNewTab = ${isNewTab};
      if (!redirectUrl || redirectUrl === '#') return;

      var timer = setTimeout(function () {
        if (openInNewTab) {
          var win = window.open(redirectUrl, '_blank');
          // ポップアップがブロックされた場合は同一タブで開くフォールバック
          if (!win || win.closed || typeof win.closed === 'undefined') {
            window.location.href = redirectUrl;
          }
        } else {
          window.location.href = redirectUrl;
        }
      }, delayMs);

      // ユーザーが手動でリンクをクリックした場合は二重遷移を防ぐためタイマー解除
      document.addEventListener('click', function (e) {
        if (e.target && e.target.closest && e.target.closest('a')) {
          clearTimeout(timer);
        }
      });
    })();
  </script>`;
  }

  // 6. 各プロフィールページの生成
  const profileKeys = Object.keys(config.pages);
  console.log(`📄 検出されたプロフィール数: ${profileKeys.length}`);

  for (const pageKey of profileKeys) {
    // スラッグ名の検証（安全なディレクトリ名かチェック）
    if (!/^[a-zA-Z0-9_\-]+$/.test(pageKey)) {
      console.warn(`⚠️ 警告: プロフィールID "${pageKey}" に無効な文字が含まれています。英数字・ハイフン・アンダースコアを使用してください。`);
      continue;
    }

    const page = config.pages[pageKey];
    const pageDir = path.join(DIST_DIR, pageKey);
    fs.mkdirSync(pageDir, { recursive: true });

    const relativeRoot = '../'; // /pageKey/ からの相対ルートパス
    const name = escapeHtml(page.name || pageKey);
    const bioText = page.bio ? escapeHtml(page.bio) : '';
    const bioHtml = bioText ? `<p class="profile-bio">${bioText}</p>` : '';

    // プロフィール画像の解決
    let profileImageSrc = page.profileImage || 'images/profile/siyou.svg';
    if (!profileImageSrc.startsWith('http://') && !profileImageSrc.startsWith('https://')) {
      profileImageSrc = relativeRoot + profileImageSrc.replace(/^\/+/, '');
    }

    // OGP 画像の完全URL生成（SNSクローラー用）
    let ogImageUrl = (page.og && page.og.image) || (config.site && config.site.defaultOgImage) || page.profileImage || '';
    if (ogImageUrl && !ogImageUrl.startsWith('http://') && !ogImageUrl.startsWith('https://') && siteUrl) {
      ogImageUrl = siteUrl + '/' + ogImageUrl.replace(/^\/+/, '');
    }

    const ogTitle = escapeHtml((page.og && page.og.title) || page.name || siteTitle);
    const ogDescription = escapeHtml((page.og && page.og.description) || page.bio || siteDescription);
    const canonicalUrl = siteUrl ? `${siteUrl}/${pageKey}/` : `./`;

    // 背景スタイルの生成
    let bodyStyleAttribute = '';
    if (page.background) {
      if (page.background.type === 'color' && page.background.value) {
        const val = escapeHtml(page.background.value);
        bodyStyleAttribute = `style="background-color: ${val}; --bg-page: ${val};"`;
      } else if (page.background.type === 'gradient' && page.background.value) {
        const val = escapeHtml(page.background.value);
        bodyStyleAttribute = `style="background: ${val}; --bg-page: ${val};"`;
      } else if (page.background.type === 'image' && page.background.value) {
        let bgImg = page.background.value;
        if (!bgImg.startsWith('http://') && !bgImg.startsWith('https://')) {
          bgImg = relativeRoot + bgImg.replace(/^\/+/, '');
        }
        bodyStyleAttribute = `style="background-image: url('${escapeHtml(bgImg)}'); background-size: cover; background-position: center; background-attachment: fixed;"`;
      }
    }

    // リンクHTMLの生成
    let linksHtml = '';
    const links = Array.isArray(page.links) ? page.links : [];

    links.forEach((link, idx) => {
      const linkTitle = escapeHtml(link.title || `Link ${idx + 1}`);
      const rawUrl = link.url || '#';
      const safeUrl = sanitizeUrl(rawUrl);

      // リンクサムネイル画像（16:9比率）
      let linkImageSrc = link.image || '';
      if (linkImageSrc && !linkImageSrc.startsWith('http://') && !linkImageSrc.startsWith('https://')) {
        linkImageSrc = relativeRoot + linkImageSrc.replace(/^\/+/, '');
      }

      const descHtml = link.description
        ? `<span class="link-button-desc">${escapeHtml(link.description)}</span>`
        : '';

      linksHtml += `
      <article class="link-card" data-link-title="${linkTitle}" data-link-url="${escapeHtml(safeUrl)}">
        <!-- 16:9 画像カード（クリックで移動） -->
        <a href="${escapeHtml(safeUrl)}" class="link-image-anchor" target="_blank" rel="noopener noreferrer" aria-label="${linkTitle}を開く">
          <div class="link-image-wrapper">
            <img src="${escapeHtml(linkImageSrc)}" alt="${linkTitle}" class="link-image" loading="lazy" width="1280" height="720">
            <div class="image-fallback-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2"/>
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                <polyline points="21 15 16 10 5 21" stroke-width="2"/>
              </svg>
              <span>画像を表示できません</span>
            </div>
          </div>
        </a>

        <!-- リンクボタン（画像の下に配置） -->
        <a href="${escapeHtml(safeUrl)}" class="link-button" target="_blank" rel="noopener noreferrer">
          <div class="link-button-content">
            <span class="link-button-title">${linkTitle}</span>
            ${descHtml}
          </div>
          <svg class="link-button-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"/>
          </svg>
        </a>
      </article>
      `;
    });

    // 自動転送タグの決定（個別ページ設定優先、未指定ならサイト共通設定）
    let pageAutoRedirectTag = '';
    const pageRedirectSetting = page.autoRedirect;
    if (pageRedirectSetting === false) {
      pageAutoRedirectTag = '';
    } else if (pageRedirectSetting && typeof pageRedirectSetting === 'object') {
      const pageUrl = pageRedirectSetting.url || defaultAutoRedirectUrl;
      const pageDelay = typeof pageRedirectSetting.delayMs === 'number' ? pageRedirectSetting.delayMs : defaultAutoRedirectDelay;
      const pageNewTab = typeof pageRedirectSetting.newTab === 'boolean' ? pageRedirectSetting.newTab : defaultAutoRedirectNewTab;
      if (pageRedirectSetting.enabled !== false && pageUrl) {
        pageAutoRedirectTag = createAutoRedirectTag(pageUrl, pageDelay, pageNewTab);
      }
    } else if (isGlobalAutoRedirectEnabled) {
      pageAutoRedirectTag = createAutoRedirectTag(defaultAutoRedirectUrl, defaultAutoRedirectDelay, defaultAutoRedirectNewTab);
    }

    // テンプレート置換
    let outputHtml = templateProfile
      .replace(/{{pageTitle}}/g, `${name} - ${siteTitle}`)
      .replace(/{{pageDescription}}/g, ogDescription)
      .replace(/{{canonicalUrl}}/g, escapeHtml(canonicalUrl))
      .replace(/{{siteTitle}}/g, siteTitle)
      .replace(/{{ogTitle}}/g, ogTitle)
      .replace(/{{ogDescription}}/g, ogDescription)
      .replace(/{{ogImage}}/g, escapeHtml(ogImageUrl))
      .replace(/{{relativeRoot}}/g, relativeRoot)
      .replace(/{{analyticsTag}}/g, analyticsTag)
      .replace(/{{profileId}}/g, escapeHtml(pageKey))
      .replace(/{{bodyStyleAttribute}}/g, bodyStyleAttribute)
      .replace(/{{profileImageSrc}}/g, escapeHtml(profileImageSrc))
      .replace(/{{name}}/g, name)
      .replace(/{{bioHtml}}/g, bioHtml)
      .replace(/{{linksHtml}}/g, linksHtml)
      .replace(/{{autoRedirectTag}}/g, pageAutoRedirectTag);

    fs.writeFileSync(path.join(pageDir, 'index.html'), outputHtml, 'utf-8');
    console.log(`  ✓ 生成完了: /${pageKey}/index.html (リンク数: ${links.length})`);
  }

  // 7. トップページ (dist/index.html) の生成
  const rootMode = (config.site && config.site.rootMode) || 'portal';
  const defaultProfile = (config.site && config.site.defaultProfile) || profileKeys[0];

  let redirectMetaTag = '';
  let profilesListHtml = '';

  if (rootMode === 'redirect' && profileKeys.includes(defaultProfile)) {
    // リダイレクトモード
    redirectMetaTag = `<meta http-equiv="refresh" content="0; url=./${defaultProfile}/">`;
    profilesListHtml = `
      <div style="text-align: center; padding: 3rem 1rem;">
        <p style="margin-bottom: 1rem; color: var(--text-secondary);">プロフィールページへ移動中...</p>
        <a href="./${defaultProfile}/" class="error-button">${escapeHtml(config.pages[defaultProfile].name || defaultProfile)} へ移動</a>
      </div>
    `;
  } else {
    // ポータル一覧モード
    profileKeys.forEach((key) => {
      const p = config.pages[key];
      const pName = escapeHtml(p.name || key);
      const pBio = p.bio ? escapeHtml(p.bio.split('\n')[0]) : 'プロフィールリンク';
      let pImg = p.profileImage || 'images/profile/siyou.svg';
      if (!pImg.startsWith('http://') && !pImg.startsWith('https://')) {
        pImg = './' + pImg.replace(/^\/+/, '');
      }
      const linksCount = Array.isArray(p.links) ? p.links.length : 0;

      profilesListHtml += `
      <a href="./${key}/" class="portal-item-link">
        <img src="${escapeHtml(pImg)}" alt="${pName}" class="portal-item-avatar">
        <div class="portal-item-info">
          <span class="portal-item-name">${pName}</span>
          <span class="portal-item-desc">${pBio}</span>
        </div>
        <span class="portal-item-badge">${linksCount} リンク</span>
      </a>
      `;
    });
  }

  const defaultOg = (config.site && config.site.defaultOgImage) || 'images/og/default.svg';
  const defaultOgFull = defaultOg.startsWith('http') || !siteUrl ? defaultOg : `${siteUrl}/${defaultOg.replace(/^\/+/, '')}`;

  let portalAutoRedirectTag = '';
  // rootMode が 'redirect' 以外の時（ポータル一覧表示時）のみトップページでも自動転送
  if (rootMode !== 'redirect' && isGlobalAutoRedirectEnabled) {
    portalAutoRedirectTag = createAutoRedirectTag(defaultAutoRedirectUrl, defaultAutoRedirectDelay, defaultAutoRedirectNewTab);
  }

  let portalHtml = templateIndex
    .replace(/{{siteTitle}}/g, siteTitle)
    .replace(/{{siteDescription}}/g, siteDescription)
    .replace(/{{canonicalUrl}}/g, siteUrl ? `${siteUrl}/` : './')
    .replace(/{{ogImage}}/g, escapeHtml(defaultOgFull))
    .replace(/{{analyticsTag}}/g, analyticsTag)
    .replace(/{{redirectMetaTag}}/g, redirectMetaTag)
    .replace(/{{profilesListHtml}}/g, profilesListHtml)
    .replace(/{{autoRedirectTag}}/g, portalAutoRedirectTag);

  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), portalHtml, 'utf-8');
  console.log('  ✓ 生成完了: /index.html (ルートページ)');

  // 8. 404.html の配置
  if (template404) {
    fs.writeFileSync(path.join(DIST_DIR, '404.html'), template404, 'utf-8');
    console.log('  ✓ 生成完了: /404.html (Not Foundページ)');
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('----------------------------------------------------');
  console.log(`✨ ビルド成功！ 全ての静的ファイルが dist/ に出力されました (${elapsed}s)`);
  console.log('----------------------------------------------------');
}

build();
