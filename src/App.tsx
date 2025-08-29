import React, { useState } from 'react';
import './App.css';

// モックデータ
const mockInventoryData = [
  { id: 'INV001', name: 'スチール板材 5mm', category: '原材料', stock: 45, minStock: 20, price: 15000, location: '第1倉庫-A-01', status: 'normal' },
  { id: 'INV002', name: 'ボルト M8x50', category: '部品', stock: 8, minStock: 10, price: 80, location: '第2倉庫-B-03', status: 'low' },
  { id: 'INV003', name: 'アルミニウム角材', category: '原材料', stock: 12, minStock: 15, price: 2500, location: '第1倉庫-A-05', status: 'low' },
  { id: 'INV004', name: '電動ドリル替刃', category: '工具', stock: 25, minStock: 10, price: 1200, location: '第3倉庫-C-02', status: 'normal' },
  { id: 'INV005', name: '完成品 モーターケース', category: '完成品', stock: 0, minStock: 25, price: 8500, location: '完成品倉庫-F-01', status: 'out' },
  { id: 'INV006', name: '切削油 20L', category: '消耗品', stock: 18, minStock: 12, price: 3200, location: '化学品倉庫-D-01', status: 'normal' }
];

const mockStats = {
  totalItems: 147,
  totalValue: 2450000,
  lowStockItems: 12,
  outOfStockItems: 3,
  recentTransactions: 28
};

type ActiveTab = 'dashboard' | 'inventory' | 'transactions' | 'reports';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  const getStockStatusClass = (status: string) => {
    switch (status) {
      case 'low': return 'status-low';
      case 'out': return 'status-out';
      case 'normal': return 'status-normal';
      default: return 'status-normal';
    }
  };

  const getStockStatusLabel = (status: string) => {
    switch (status) {
      case 'low': return '低在庫';
      case 'out': return '在庫切れ';
      case 'normal': return '正常';
      default: return '正常';
    }
  };

  const filteredItems = mockInventoryData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>🏭 製造業在庫管理システム</h1>
            <p>Manufacturing Inventory Management System</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-value">{new Date().toLocaleDateString('ja-JP')}</span>
              <span className="stat-label">最終更新</span>
            </div>
            <div className="stat-item">
              <span className="stat-value sync-status">✅ 同期済み</span>
              <span className="stat-label">システム状態</span>
            </div>
          </div>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-text">ダッシュボード</span>
        </button>
        <button
          className={`nav-button ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <span className="nav-icon">📦</span>
          <span className="nav-text">在庫一覧</span>
        </button>
        <button
          className={`nav-button ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          <span className="nav-icon">📋</span>
          <span className="nav-text">取引履歴</span>
        </button>
        <button
          className={`nav-button ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <span className="nav-icon">📈</span>
          <span className="nav-text">レポート</span>
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <div className="dashboard-header">
              <h2>ダッシュボード</h2>
              <button className="refresh-btn">🔄 更新</button>
            </div>

            <div className="stats-grid">
              <div className="stat-card total-items">
                <div className="stat-icon">📦</div>
                <div className="stat-content">
                  <h3>総在庫アイテム数</h3>
                  <div className="stat-value">{mockStats.totalItems}</div>
                  <div className="stat-unit">アイテム</div>
                </div>
              </div>
              <div className="stat-card total-value">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3>総在庫価額</h3>
                  <div className="stat-value">¥{mockStats.totalValue.toLocaleString()}</div>
                  <div className="stat-unit">現在価値</div>
                </div>
              </div>
              <div className="stat-card low-stock">
                <div className="stat-icon">⚠️</div>
                <div className="stat-content">
                  <h3>低在庫アイテム</h3>
                  <div className="stat-value">{mockStats.lowStockItems}</div>
                  <div className="stat-unit">要補充</div>
                </div>
              </div>
              <div className="stat-card out-stock">
                <div className="stat-icon">🚨</div>
                <div className="stat-content">
                  <h3>在庫切れ</h3>
                  <div className="stat-value">{mockStats.outOfStockItems}</div>
                  <div className="stat-unit">緊急補充</div>
                </div>
              </div>
            </div>

            <div className="alerts-section">
              <h3>🚨 在庫アラート</h3>
              <div className="alerts-list">
                <div className="alert-item critical">
                  <span className="alert-icon">🚨</span>
                  <span className="alert-text">完成品 モーターケース が在庫切れです</span>
                  <span className="alert-time">2分前</span>
                </div>
                <div className="alert-item warning">
                  <span className="alert-icon">⚠️</span>
                  <span className="alert-text">ボルト M8x50 の在庫が少なくなっています (8個 / 最低10個)</span>
                  <span className="alert-time">15分前</span>
                </div>
                <div className="alert-item warning">
                  <span className="alert-icon">⚠️</span>
                  <span className="alert-text">アルミニウム角材 の在庫が少なくなっています (12本 / 最低15本)</span>
                  <span className="alert-time">1時間前</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="inventory">
            <div className="inventory-header">
              <h2>在庫一覧</h2>
              <div className="inventory-controls">
                <input
                  type="text"
                  placeholder="商品名またはSKUで検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <button className="add-btn">➕ 新規追加</button>
              </div>
            </div>

            <div className="inventory-grid">
              {filteredItems.map((item) => (
                <div key={item.id} className="inventory-card">
                  <div className="card-header">
                    <h3>{item.name}</h3>
                    <span className={`status-badge ${getStockStatusClass(item.status)}`}>
                      {getStockStatusLabel(item.status)}
                    </span>
                  </div>
                  <div className="card-content">
                    <div className="info-row">
                      <span className="label">SKU:</span>
                      <span className="value">{item.id}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">カテゴリ:</span>
                      <span className="value">{item.category}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">現在在庫:</span>
                      <span className="value">{item.stock} 個</span>
                    </div>
                    <div className="info-row">
                      <span className="label">最低在庫:</span>
                      <span className="value">{item.minStock} 個</span>
                    </div>
                    <div className="info-row">
                      <span className="label">単価:</span>
                      <span className="value">¥{item.price.toLocaleString()}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">保管場所:</span>
                      <span className="value">{item.location}</span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button className="btn-edit">✏️ 編集</button>
                    <button className="btn-history">📊 履歴</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeTab === 'transactions' || activeTab === 'reports') && (
          <div className="coming-soon">
            <div className="coming-soon-icon">🚧</div>
            <h2>{activeTab === 'transactions' ? '取引履歴' : 'レポート機能'}</h2>
            <p>この機能は現在開発中です。近日公開予定です。</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>© 2025 製造業向け在庫管理システム - AWS Amplify Hosting</p>
      </footer>
    </div>
  );
}

export default App;