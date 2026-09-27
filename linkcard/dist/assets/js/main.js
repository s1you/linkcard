/**
 * Linkbio - Client-side Script
 * 
 * 主な機能:
 * 1. リンククリックイベントの計測 (GoatCounter等と連携)
 * 2. 画像読み込みエラー時の自動フォールバック処理
 * 3. 外部リンク安全対策の確認
 */

(function () {
  'use strict';

  // ページ初期化
  document.addEventListener('DOMContentLoaded', function () {
    initLinkTracking();
    initImageFallbacks();
  });

  /**
   * リンククリック計測
   * 各リンク（16:9画像および下部のボタン）のクリックを検知してイベントを送信
   */
  function initLinkTracking() {
    var linkCards = document.querySelectorAll('.link-card');
    if (!linkCards.length) return;

    var profileId = document.body.getAttribute('data-profile-id') || 'unknown';

    linkCards.forEach(function (card, index) {
      var linkTitle = card.getAttribute('data-link-title') || ('Link ' + (index + 1));
      var linkUrl = card.getAttribute('data-link-url') || '';
      var anchors = card.querySelectorAll('a[href]');

      anchors.forEach(function (anchor) {
        anchor.addEventListener('click', function () {
          trackClickEvent(profileId, linkTitle, linkUrl, index + 1);
        });
      });
    });
  }

  /**
   * クリックイベントの送信処理
   */
  function trackClickEvent(profileId, linkTitle, linkUrl, linkOrder) {
    // 1. GoatCounter 連携
    if (window.goatcounter && typeof window.goatcounter.count === 'function') {
      var eventPath = 'click/' + profileId + '/' + slugify(linkTitle);
      window.goatcounter.count({
        path: eventPath,
        title: 'Click: ' + linkTitle + ' (' + profileId + ')',
        event: true
      });
    }

    // 2. Google Analytics (gtag) が導入されている場合の自動フォールバック
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'link_click', {
        event_category: 'Linkbio',
        event_label: linkTitle,
        profile_id: profileId,
        destination_url: linkUrl,
        link_order: linkOrder
      });
    }

    // 3. 開発環境やコンソール確認用デバッグログ（ローカル時のみ）
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('[Linkbio Analytics] Click tracked:', {
        profileId: profileId,
        title: linkTitle,
        url: linkUrl,
        order: linkOrder
      });
    }
  }

  /**
   * 画像読み込み失敗時のフォールバック処理
   */
  function initImageFallbacks() {
    var images = document.querySelectorAll('.link-image, .profile-avatar');
    images.forEach(function (img) {
      if (img.complete && img.naturalWidth === 0) {
        handleImageError(img);
      } else {
        img.addEventListener('error', function () {
          handleImageError(img);
        });
      }
    });
  }

  function handleImageError(img) {
    var wrapper = img.closest('.link-image-wrapper') || img.parentElement;
    if (wrapper) {
      wrapper.classList.add('is-fallback');
    }
  }

  /**
   * 文字列をイベントパス用の安全なスラッグに変換
   */
  function slugify(text) {
    if (!text) return 'link';
    return encodeURIComponent(
      text.trim().toLowerCase().replace(/[\s\t\n]+/g, '-').replace(/[^\w\-\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/g, '')
    ).substring(0, 40);
  }

})();
