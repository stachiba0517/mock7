import React, { useState } from 'react';
import './App.css';
import { InventoryDashboard } from './components/inventory/InventoryDashboard';
import { InventoryList } from './components/inventory/InventoryList';

type ActiveTab = 'dashboard' | 'inventory' | 'transactions' | 'reports' | 'alerts';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>🏭 製造業在庫管理システム</h1>
            <p>Manufacturing Inventory Management System</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-label">稼働時間</span>
              <span className="stat-value">99.9%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">同期状態</span>
              <span className="stat-value sync-status">✅ 同期済み</span>
            </div>
          </div>
        </div>
      </header>

      <nav className="App-nav">
        <button
          className={activeTab === 'dashboard' ? 'nav-button active' : 'nav-button'}
          onClick={() => setActiveTab('dashboard')}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-text">ダッシュボード</span>
        </button>
        
        <button
          className={activeTab === 'inventory' ? 'nav-button active' : 'nav-button'}
          onClick={() => setActiveTab('inventory')}
        >
          <span className="nav-icon">📦</span>
          <span className="nav-text">在庫一覧</span>
        </button>
        
        <button
          className={activeTab === 'transactions' ? 'nav-button active' : 'nav-button'}
          onClick={() => setActiveTab('transactions')}
        >
          <span className="nav-icon">📋</span>
          <span className="nav-text">取引履歴</span>
        </button>
        
        <button
          className={activeTab === 'reports' ? 'nav-button active' : 'nav-button'}
          onClick={() => setActiveTab('reports')}
        >
          <span className="nav-icon">📈</span>
          <span className="nav-text">レポート</span>
        </button>
        
        <button
          className={activeTab === 'alerts' ? 'nav-button active' : 'nav-button'}
          onClick={() => setActiveTab('alerts')}
        >
          <span className="nav-icon">🚨</span>
          <span className="nav-text">アラート</span>
        </button>
      </nav>

      <main className="App-main">
        {activeTab === 'dashboard' && <InventoryDashboard />}
        {activeTab === 'inventory' && <InventoryList />}
        {activeTab === 'transactions' && (
          <div className="coming-soon">
            <div className="coming-soon-icon">🚧</div>
            <h2>取引履歴</h2>
            <p>この機能は現在開発中です。近日公開予定です。</p>
          </div>
        )}
        {activeTab === 'reports' && (
          <div className="coming-soon">
            <div className="coming-soon-icon">📊</div>
            <h2>レポート機能</h2>
            <p>詳細なレポート機能を準備中です。ABC分析、回転率分析等が利用可能になります。</p>
          </div>
        )}
        {activeTab === 'alerts' && (
          <div className="coming-soon">
            <div className="coming-soon-icon">🔔</div>
            <h2>アラート管理</h2>
            <p>在庫アラートの詳細管理機能を開発中です。</p>
          </div>
        )}
      </main>

      <footer className="App-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>製造業在庫管理システム v1.0</h4>
            <p>リアルタイム在庫追跡 | セキュア設計 | 製造業特化</p>
          </div>
          <div className="footer-section">
            <h4>システム情報</h4>
            <p>AWS Amplify + React + TypeScript</p>
            <p>© 2024 Manufacturing Solutions</p>
          </div>
          <div className="footer-section">
            <h4>サポート</h4>
            <p>24時間監視 | 自動バックアップ | セキュリティ対策済み</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;