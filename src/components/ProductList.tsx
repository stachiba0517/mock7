import React, { useState, useEffect } from 'react';
import { mockApiService, MockProduct } from '../services/mockApiService';
import { escapeHtml } from '../utils/securityUtils';

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<MockProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // 商品データを安全に読み込み
  const loadProducts = async () => {
    setLoading(true);
    setError('');
    
    try {
      const productData = await mockApiService.getProducts();
      setProducts(productData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '商品の読み込みに失敗しました';
      setError(escapeHtml(errorMessage));
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  // 価格のフォーマット（安全）
  const formatPrice = (price: number): string => {
    try {
      return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY'
      }).format(price);
    } catch {
      return `¥${price}`;
    }
  };

  // 在庫ステータスの表示
  const getStockStatus = (inStock: boolean) => {
    return inStock ? (
      <span className="stock-in">✅ 在庫あり</span>
    ) : (
      <span className="stock-out">❌ 在庫切れ</span>
    );
  };

  // カテゴリーのスタイリング
  const getCategoryClass = (category: string): string => {
    const safeCategory = escapeHtml(category.toLowerCase());
    switch (safeCategory) {
      case 'セキュリティ':
      case 'security':
        return 'category-security';
      case 'テスト':
      case 'test':
        return 'category-test';
      case 'サンプル':
      case 'sample':
        return 'category-sample';
      default:
        return 'category-default';
    }
  };

  // 初回ロード
  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="product-list-container">
      <div className="section-header">
        <h2>商品一覧</h2>
        <button
          onClick={loadProducts}
          className="refresh-button"
          disabled={loading}
          aria-label="商品一覧を更新"
        >
          🔄 更新
        </button>
      </div>

      {error && (
        <div className="error-message" role="alert">
          <strong>エラー:</strong> <span dangerouslySetInnerHTML={{ __html: error }} />
        </div>
      )}

      {loading && (
        <div className="loading-message" role="status" aria-live="polite">
          商品を読み込み中...
        </div>
      )}

      {products.length === 0 && !loading && !error ? (
        <div className="empty-state">
          <p>商品が見つかりません。</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-header">
                <h3 className="product-name">
                  {/* XSS攻撃を防ぐためエスケープ処理 */}
                  {escapeHtml(product.name)}
                </h3>
                <span className={`product-category ${getCategoryClass(product.category)}`}>
                  {escapeHtml(product.category)}
                </span>
              </div>
              
              <div className="product-details">
                <div className="product-description">
                  📝 <span>{escapeHtml(product.description)}</span>
                </div>
                <div className="product-price">
                  💰 価格: <strong>{formatPrice(product.price)}</strong>
                </div>
                <div className="product-stock">
                  {getStockStatus(product.inStock)}
                </div>
                <div className="product-id">
                  🆔 ID: <code>{escapeHtml(product.id)}</code>
                </div>
              </div>

              <div className="product-actions">
                <button
                  className={`action-button ${product.inStock ? 'primary' : 'disabled'}`}
                  disabled={!product.inStock}
                  aria-label={`${escapeHtml(product.name)}を購入`}
                >
                  {product.inStock ? '🛒 購入' : '📋 在庫切れ'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="product-stats">
        <p>
          総商品数: <strong>{products.length}</strong>点 |
          在庫あり: <strong>{products.filter(p => p.inStock).length}</strong>点 |
          在庫切れ: <strong>{products.filter(p => !p.inStock).length}</strong>点
        </p>
      </div>
    </div>
  );
};
