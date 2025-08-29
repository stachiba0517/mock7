import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../services/inventoryService';
import { StockAlert, AlertSeverity } from '../../types/inventory';
import './InventoryDashboard.css';

interface DashboardStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  categoryBreakdown: Record<string, number>;
  recentTransactions: number;
}

export const InventoryDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, alertsData] = await Promise.all([
        inventoryService.getInventoryStatistics(),
        inventoryService.getStockAlerts()
      ]);
      
      setStats(statsData);
      setAlerts(alertsData.slice(0, 5)); // 最新5件のアラート
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(value);
  };

  const getCategoryDisplayName = (category: string): string => {
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

  const getAlertSeverityClass = (severity: AlertSeverity): string => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return 'alert-critical';
      case AlertSeverity.HIGH:
        return 'alert-high';
      case AlertSeverity.MEDIUM:
        return 'alert-medium';
      case AlertSeverity.LOW:
        return 'alert-low';
      default:
        return 'alert-medium';
    }
  };

  const getAlertIcon = (severity: AlertSeverity): string => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return '🚨';
      case AlertSeverity.HIGH:
        return '⚠️';
      case AlertSeverity.MEDIUM:
        return '⚡';
      case AlertSeverity.LOW:
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>ダッシュボードを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="inventory-dashboard">
      <div className="dashboard-header">
        <h1>在庫管理ダッシュボード</h1>
        <button onClick={loadDashboardData} className="refresh-button">
          🔄 更新
        </button>
      </div>

      {/* 統計カード */}
      <div className="stats-grid">
        <div className="stat-card total-items">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>総在庫アイテム数</h3>
            <div className="stat-value">{stats?.totalItems || 0}</div>
            <div className="stat-label">アイテム</div>
          </div>
        </div>

        <div className="stat-card total-value">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>総在庫価額</h3>
            <div className="stat-value">{formatCurrency(stats?.totalValue || 0)}</div>
            <div className="stat-label">現在価値</div>
          </div>
        </div>

        <div className="stat-card low-stock">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>低在庫アイテム</h3>
            <div className="stat-value">{stats?.lowStockItems || 0}</div>
            <div className="stat-label">要補充</div>
          </div>
        </div>

        <div className="stat-card out-of-stock">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <h3>在庫切れ</h3>
            <div className="stat-value">{stats?.outOfStockItems || 0}</div>
            <div className="stat-label">緊急補充</div>
          </div>
        </div>

        <div className="stat-card recent-transactions">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>過去7日間の取引</h3>
            <div className="stat-value">{stats?.recentTransactions || 0}</div>
            <div className="stat-label">取引件数</div>
          </div>
        </div>
      </div>

      {/* カテゴリ別内訳 */}
      <div className="dashboard-section">
        <h2>カテゴリ別在庫内訳</h2>
        <div className="category-breakdown">
          {stats?.categoryBreakdown && Object.entries(stats.categoryBreakdown).map(([category, count]) => (
            <div key={category} className="category-item">
              <div className="category-name">{getCategoryDisplayName(category)}</div>
              <div className="category-count">{count} アイテム</div>
              <div className="category-bar">
                <div 
                  className="category-fill" 
                  style={{ 
                    width: `${(count / (stats?.totalItems || 1)) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 在庫アラート */}
      <div className="dashboard-section">
        <h2>在庫アラート（最新5件）</h2>
        {alerts.length === 0 ? (
          <div className="no-alerts">
            <div className="no-alerts-icon">✅</div>
            <p>現在、アクティブなアラートはありません</p>
          </div>
        ) : (
          <div className="alerts-list">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`alert-item ${getAlertSeverityClass(alert.severity)}`}
              >
                <div className="alert-icon">
                  {getAlertIcon(alert.severity)}
                </div>
                <div className="alert-content">
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-details">
                    アイテム: {alert.itemName} | 
                    現在在庫: {alert.currentStock} | 
                    閾値: {alert.thresholdLevel}
                  </div>
                </div>
                <div className="alert-severity">
                  {alert.severity.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* クイックアクション */}
      <div className="dashboard-section">
        <h2>クイックアクション</h2>
        <div className="quick-actions">
          <button className="quick-action-button">
            <span className="action-icon">➕</span>
            新しいアイテム追加
          </button>
          <button className="quick-action-button">
            <span className="action-icon">📋</span>
            在庫レポート生成
          </button>
          <button className="quick-action-button">
            <span className="action-icon">📊</span>
            ABC分析実行
          </button>
          <button className="quick-action-button">
            <span className="action-icon">🔍</span>
            低在庫アイテム検索
          </button>
        </div>
      </div>
    </div>
  );
};
