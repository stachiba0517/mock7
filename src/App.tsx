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

const mockTransactionData = [
  { id: 'TXN001', itemId: 'INV001', itemName: 'スチール板材 5mm', type: '入庫', quantity: 20, unitPrice: 15000, total: 300000, date: '2025-01-15', time: '10:30', operator: '田中太郎', reference: 'PO-2025-001', reason: '定期発注' },
  { id: 'TXN002', itemId: 'INV002', itemName: 'ボルト M8x50', type: '出庫', quantity: -15, unitPrice: 80, total: -1200, date: '2025-01-14', time: '16:45', operator: '佐藤花子', reference: 'WO-2025-005', reason: '製品A100製造' },
  { id: 'TXN003', itemId: 'INV003', itemName: 'アルミニウム角材', type: '調整', quantity: -3, unitPrice: 2500, total: -7500, date: '2025-01-13', time: '11:20', operator: '山田次郎', reference: 'ADJ-2025-001', reason: '棚卸調整' },
  { id: 'TXN004', itemId: 'INV005', itemName: '完成品 モーターケース', type: '入庫', quantity: 10, unitPrice: 8500, total: 85000, date: '2025-01-12', time: '14:00', operator: '鈴木一郎', reference: 'WO-2025-003', reason: '製造完成' },
  { id: 'TXN005', itemId: 'INV004', itemName: '電動ドリル替刃', type: '出庫', quantity: -5, unitPrice: 1200, total: -6000, date: '2025-01-11', time: '09:15', operator: '伊藤美咲', reference: 'SO-2025-012', reason: '顧客出荷' },
  { id: 'TXN006', itemId: 'INV006', itemName: '切削油 20L', type: '入庫', quantity: 8, unitPrice: 3200, total: 25600, date: '2025-01-10', time: '15:30', operator: '高橋健太', reference: 'PO-2025-002', reason: '補充発注' },
  { id: 'TXN007', itemId: 'INV001', itemName: 'スチール板材 5mm', type: '出庫', quantity: -12, unitPrice: 15000, total: -180000, date: '2025-01-09', time: '08:45', operator: '渡辺真由', reference: 'WO-2025-001', reason: '大型製品製造' },
  { id: 'TXN008', itemId: 'INV002', itemName: 'ボルト M8x50', type: '入庫', quantity: 100, unitPrice: 80, total: 8000, date: '2025-01-08', time: '13:15', operator: '中村雅子', reference: 'PO-2025-003', reason: '月次補充' },
];

const mockReportData = {
  abcAnalysis: [
    { category: 'A', items: 23, percentage: 15.6, value: 1715000, description: '高価値・高回転' },
    { category: 'B', items: 47, percentage: 32.0, value: 588000, description: '中価値・中回転' },
    { category: 'C', items: 77, percentage: 52.4, value: 147000, description: '低価値・低回転' }
  ],
  turnoverRate: [
    { period: '2024年12月', rate: 2.8, target: 3.0, status: 'below' },
    { period: '2024年11月', rate: 3.2, target: 3.0, status: 'above' },
    { period: '2024年10月', rate: 2.9, target: 3.0, status: 'below' },
    { period: '2024年09月', rate: 3.4, target: 3.0, status: 'above' },
    { period: '2024年08月', rate: 3.1, target: 3.0, status: 'above' },
    { period: '2024年07月', rate: 2.7, target: 3.0, status: 'below' }
  ],
  stockLevel: [
    { category: '原材料', current: 68, optimal: 75, percentage: 90.7 },
    { category: '部品', current: 42, optimal: 50, percentage: 84.0 },
    { category: '完成品', current: 23, optimal: 30, percentage: 76.7 },
    { category: '工具', current: 8, optimal: 10, percentage: 80.0 },
    { category: '消耗品', current: 6, optimal: 8, percentage: 75.0 }
  ]
};

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
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [reportType, setReportType] = useState('abc');

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

  const filteredTransactions = mockTransactionData.filter(transaction => {
    if (transactionFilter === 'all') return true;
    return transaction.type === transactionFilter;
  });

  const getTransactionTypeClass = (type: string) => {
    switch (type) {
      case '入庫': return 'tx-in';
      case '出庫': return 'tx-out';
      case '調整': return 'tx-adjust';
      default: return 'tx-other';
    }
  };

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

        {activeTab === 'transactions' && (
          <div className="transactions">
            <div className="transactions-header">
              <h2>取引履歴</h2>
              <div className="transaction-controls">
                <select
                  value={transactionFilter}
                  onChange={(e) => setTransactionFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">全ての取引</option>
                  <option value="入庫">入庫</option>
                  <option value="出庫">出庫</option>
                  <option value="調整">調整</option>
                </select>
                <button className="export-btn">📊 エクスポート</button>
              </div>
            </div>

            <div className="transactions-summary">
              <div className="summary-card">
                <span className="summary-label">今月の取引数</span>
                <span className="summary-value">{filteredTransactions.length}</span>
              </div>
              <div className="summary-card">
                <span className="summary-label">入庫取引</span>
                <span className="summary-value">{mockTransactionData.filter(t => t.type === '入庫').length}</span>
              </div>
              <div className="summary-card">
                <span className="summary-label">出庫取引</span>
                <span className="summary-value">{mockTransactionData.filter(t => t.type === '出庫').length}</span>
              </div>
            </div>

            <div className="transactions-table">
              <div className="table-header">
                <div className="col-date">日時</div>
                <div className="col-type">種別</div>
                <div className="col-item">アイテム</div>
                <div className="col-quantity">数量</div>
                <div className="col-total">金額</div>
                <div className="col-operator">担当者</div>
                <div className="col-reason">理由</div>
              </div>
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="table-row">
                  <div className="col-date">
                    <div className="date">{transaction.date}</div>
                    <div className="time">{transaction.time}</div>
                  </div>
                  <div className="col-type">
                    <span className={`type-badge ${getTransactionTypeClass(transaction.type)}`}>
                      {transaction.type}
                    </span>
                  </div>
                  <div className="col-item">
                    <div className="item-name">{transaction.itemName}</div>
                    <div className="item-id">{transaction.itemId}</div>
                  </div>
                  <div className="col-quantity">
                    <span className={transaction.quantity > 0 ? 'qty-positive' : 'qty-negative'}>
                      {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                    </span>
                  </div>
                  <div className="col-total">
                    <span className={transaction.total > 0 ? 'amount-positive' : 'amount-negative'}>
                      ¥{Math.abs(transaction.total).toLocaleString()}
                    </span>
                  </div>
                  <div className="col-operator">{transaction.operator}</div>
                  <div className="col-reason">{transaction.reason}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports">
            <div className="reports-header">
              <h2>分析レポート</h2>
              <div className="report-controls">
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="filter-select"
                >
                  <option value="abc">ABC分析</option>
                  <option value="turnover">在庫回転率</option>
                  <option value="level">在庫レベル分析</option>
                </select>
                <button className="generate-btn">📈 レポート生成</button>
              </div>
            </div>

            {reportType === 'abc' && (
              <div className="report-section">
                <h3>📊 ABC分析</h3>
                <p className="report-description">
                  在庫アイテムを価値と回転率で分類し、効率的な在庫管理を支援します
                </p>
                <div className="abc-analysis">
                  {mockReportData.abcAnalysis.map((item) => (
                    <div key={item.category} className={`abc-card abc-${item.category.toLowerCase()}`}>
                      <div className="abc-header">
                        <h4>クラス {item.category}</h4>
                        <span className="abc-percentage">{item.percentage}%</span>
                      </div>
                      <div className="abc-content">
                        <div className="abc-items">{item.items} アイテム</div>
                        <div className="abc-value">¥{item.value.toLocaleString()}</div>
                        <div className="abc-description">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reportType === 'turnover' && (
              <div className="report-section">
                <h3>🔄 在庫回転率分析</h3>
                <p className="report-description">
                  月別の在庫回転率を表示し、在庫効率の改善点を特定します
                </p>
                <div className="turnover-chart">
                  {mockReportData.turnoverRate.map((item, index) => (
                    <div key={index} className="turnover-item">
                      <div className="turnover-period">{item.period}</div>
                      <div className="turnover-bar">
                        <div 
                          className={`turnover-fill ${item.status}`}
                          style={{ width: `${(item.rate / 4) * 100}%` }}
                        ></div>
                        <span className="turnover-rate">{item.rate}</span>
                      </div>
                      <div className="turnover-target">目標: {item.target}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reportType === 'level' && (
              <div className="report-section">
                <h3>📈 在庫レベル分析</h3>
                <p className="report-description">
                  カテゴリ別の在庫レベルを分析し、最適在庫との比較を表示します
                </p>
                <div className="stock-level-analysis">
                  {mockReportData.stockLevel.map((item, index) => (
                    <div key={index} className="level-item">
                      <div className="level-header">
                        <h4>{item.category}</h4>
                        <span className="level-percentage">{item.percentage}%</span>
                      </div>
                      <div className="level-bar">
                        <div 
                          className={`level-fill ${item.percentage < 80 ? 'low' : item.percentage > 95 ? 'high' : 'normal'}`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <div className="level-details">
                        <span>現在: {item.current}</span>
                        <span>最適: {item.optimal}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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