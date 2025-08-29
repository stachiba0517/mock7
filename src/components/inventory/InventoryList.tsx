import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../services/inventoryService';
import { InventoryItem, InventorySearchFilters, InventoryCategory, StockStatus, InventorySortField } from '../../types/inventory';
import { escapeHtml } from '../../utils/securityUtils';
import './InventoryList.css';

export const InventoryList: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<InventorySearchFilters>({
    sortBy: InventorySortField.NAME,
    sortOrder: 'asc'
  });

  useEffect(() => {
    loadInventoryItems();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [items, filters]);

  const loadInventoryItems = async () => {
    setLoading(true);
    try {
      const itemsData = await inventoryService.getInventoryItems();
      setItems(itemsData);
    } catch (error) {
      console.error('Failed to load inventory items:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      const filtered = await inventoryService.getInventoryItems(filters);
      setFilteredItems(filtered);
    } catch (error) {
      console.error('Failed to apply filters:', error);
      setFilteredItems(items);
    }
  };

  const handleFilterChange = (key: keyof InventorySearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      sortBy: InventorySortField.NAME,
      sortOrder: 'asc'
    });
  };

  const getStockStatus = (item: InventoryItem): StockStatus => {
    if (item.currentStock === 0) return StockStatus.OUT_OF_STOCK;
    if (item.currentStock <= item.minStockLevel) return StockStatus.LOW_STOCK;
    if (item.currentStock >= item.maxStockLevel) return StockStatus.OVERSTOCK;
    return StockStatus.IN_STOCK;
  };

  const getStockStatusClass = (status: StockStatus): string => {
    switch (status) {
      case StockStatus.OUT_OF_STOCK:
        return 'stock-out';
      case StockStatus.LOW_STOCK:
        return 'stock-low';
      case StockStatus.OVERSTOCK:
        return 'stock-over';
      case StockStatus.IN_STOCK:
        return 'stock-normal';
      default:
        return 'stock-normal';
    }
  };

  const getStockStatusLabel = (status: StockStatus): string => {
    switch (status) {
      case StockStatus.OUT_OF_STOCK:
        return '在庫切れ';
      case StockStatus.LOW_STOCK:
        return '低在庫';
      case StockStatus.OVERSTOCK:
        return '過剰在庫';
      case StockStatus.IN_STOCK:
        return '正常';
      default:
        return '正常';
    }
  };

  const getCategoryDisplayName = (category: InventoryCategory): string => {
    const categoryMap: Record<string, string> = {
      raw_materials: '原材料',
      components: '部品',
      work_in_progress: '仕掛品',
      finished_goods: '完成品',
      packaging: '梱包材',
      tools: '工具',
      spare_parts: 'スペア部品',
      consumables: '消耗品'
    };
    return categoryMap[category] || category;
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="inventory-loading">
        <div className="loading-spinner"></div>
        <p>在庫データを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="inventory-list-container">
      <div className="inventory-header">
        <h2>在庫一覧</h2>
        <button onClick={loadInventoryItems} className="refresh-button">
          🔄 更新
        </button>
      </div>

      {/* フィルター・検索セクション */}
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="商品名、SKU、説明で検索..."
            value={filters.keyword || ''}
            onChange={(e) => handleFilterChange('keyword', e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-row">
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
            className="filter-select"
          >
            <option value="">全カテゴリ</option>
            {Object.entries(InventoryCategory).map(([key, value]) => (
              <option key={key} value={value}>
                {getCategoryDisplayName(value)}
              </option>
            ))}
          </select>

          <select
            value={filters.stockStatus || ''}
            onChange={(e) => handleFilterChange('stockStatus', e.target.value || undefined)}
            className="filter-select"
          >
            <option value="">全在庫状態</option>
            <option value={StockStatus.IN_STOCK}>正常</option>
            <option value={StockStatus.LOW_STOCK}>低在庫</option>
            <option value={StockStatus.OUT_OF_STOCK}>在庫切れ</option>
            <option value={StockStatus.OVERSTOCK}>過剰在庫</option>
          </select>

          <input
            type="text"
            placeholder="倉庫で絞り込み"
            value={filters.warehouse || ''}
            onChange={(e) => handleFilterChange('warehouse', e.target.value || undefined)}
            className="filter-input"
          />

          <select
            value={filters.sortBy || InventorySortField.NAME}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="filter-select"
          >
            <option value={InventorySortField.NAME}>商品名</option>
            <option value={InventorySortField.SKU}>SKU</option>
            <option value={InventorySortField.CATEGORY}>カテゴリ</option>
            <option value={InventorySortField.CURRENT_STOCK}>現在在庫</option>
            <option value={InventorySortField.UNIT_PRICE}>単価</option>
            <option value={InventorySortField.LAST_UPDATED}>更新日</option>
          </select>

          <select
            value={filters.sortOrder || 'asc'}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
            className="filter-select sort-order"
          >
            <option value="asc">昇順</option>
            <option value="desc">降順</option>
          </select>

          <button onClick={clearFilters} className="clear-filters-button">
            クリア
          </button>
        </div>
      </div>

      {/* 在庫アイテム一覧 */}
      <div className="inventory-summary">
        <p>
          {filteredItems.length}件の在庫アイテム
          {filters.keyword && ` （検索: "${filters.keyword}"）`}
        </p>
      </div>

      {filteredItems.length === 0 ? (
        <div className="no-items">
          <div className="no-items-icon">📦</div>
          <h3>在庫アイテムが見つかりません</h3>
          <p>検索条件を変更するか、新しいアイテムを追加してください。</p>
        </div>
      ) : (
        <div className="inventory-grid">
          {filteredItems.map((item) => {
            const stockStatus = getStockStatus(item);
            return (
              <div key={item.id} className="inventory-card">
                <div className="card-header">
                  <h3 className="item-name">{escapeHtml(item.name)}</h3>
                  <div className={`stock-badge ${getStockStatusClass(stockStatus)}`}>
                    {getStockStatusLabel(stockStatus)}
                  </div>
                </div>

                <div className="card-content">
                  <div className="item-info">
                    <div className="info-row">
                      <span className="label">SKU:</span>
                      <span className="value">{escapeHtml(item.sku)}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">カテゴリ:</span>
                      <span className="value">{getCategoryDisplayName(item.category)}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">メーカー:</span>
                      <span className="value">{escapeHtml(item.manufacturer)}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">サプライヤー:</span>
                      <span className="value">{escapeHtml(item.supplier)}</span>
                    </div>
                  </div>

                  <div className="stock-info">
                    <div className="stock-numbers">
                      <div className="current-stock">
                        <span className="stock-label">現在在庫</span>
                        <span className="stock-value">
                          {item.currentStock} {item.unit}
                        </span>
                      </div>
                      <div className="stock-levels">
                        <span className="min-stock">最低: {item.minStockLevel}</span>
                        <span className="max-stock">最大: {item.maxStockLevel}</span>
                      </div>
                    </div>
                    
                    <div className="stock-bar">
                      <div 
                        className="stock-fill"
                        style={{
                          width: `${Math.min((item.currentStock / item.maxStockLevel) * 100, 100)}%`
                        }}
                      ></div>
                      <div 
                        className="min-level-indicator"
                        style={{
                          left: `${(item.minStockLevel / item.maxStockLevel) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="item-details">
                    <div className="price-info">
                      <span className="price-label">単価:</span>
                      <span className="price-value">{formatCurrency(item.unitPrice)}</span>
                    </div>
                    <div className="location-info">
                      <span className="location-label">保管場所:</span>
                      <span className="location-value">
                        {item.location.warehouse} - {item.location.zone}-{item.location.shelf}
                      </span>
                    </div>
                    <div className="update-info">
                      <span className="update-label">最終更新:</span>
                      <span className="update-value">{formatDate(item.lastUpdated)}</span>
                    </div>
                  </div>

                  {item.description && (
                    <div className="item-description">
                      <p>{escapeHtml(item.description)}</p>
                    </div>
                  )}

                  {item.tags.length > 0 && (
                    <div className="item-tags">
                      {item.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {escapeHtml(tag)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button className="action-button edit-button">
                    ✏️ 編集
                  </button>
                  <button className="action-button history-button">
                    📊 履歴
                  </button>
                  <button className="action-button adjust-button">
                    ⚖️ 調整
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
