import DOMPurify from 'dompurify';

/**
 * XSS攻撃を防ぐためのHTMLサニタイズ関数
 * @param dirty - サニタイズする文字列
 * @returns サニタイズされた安全な文字列
 */
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
};

/**
 * プレーンテキストをエスケープしてXSSを防ぐ
 * @param text - エスケープするテキスト
 * @returns エスケープされたテキスト
 */
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * URLの検証を行う
 * @param url - 検証するURL
 * @returns 安全なURLかどうか
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    // HTTPSまたはHTTPのみ許可
    return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
  } catch {
    return false;
  }
};

/**
 * APIレスポンスのデータをサニタイズ
 * @param data - APIから受信したデータ
 * @returns サニタイズされたデータ
 */
export const sanitizeApiResponse = (data: any): any => {
  if (typeof data === 'string') {
    return sanitizeHtml(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeApiResponse(item));
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeApiResponse(value);
    }
    return sanitized;
  }
  
  return data;
};

/**
 * CSRFトークンの生成（簡易版）
 * @returns ランダムなトークン
 */
export const generateCsrfToken = (): string => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};
