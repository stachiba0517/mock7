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
                <h3>📊 ABC分析 (パレート図)</h3>
                <p className="report-description">
                  在庫価値の80-20ルールを視覚化し、重要アイテムの特定を支援します
                </p>
                <div className="pareto-chart-container">
                  <div className="pareto-chart">
                    <svg viewBox="0 0 600 400" className="pareto-svg">
                      {/* Background and grid */}
                      <defs>
                        <linearGradient id="classAGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#e53e3e" />
                          <stop offset="100%" stopColor="#c53030" />
                        </linearGradient>
                        <linearGradient id="classBGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#dd6b20" />
                          <stop offset="100%" stopColor="#c05621" />
                        </linearGradient>
                        <linearGradient id="classCGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#38a169" />
                          <stop offset="100%" stopColor="#2f855a" />
                        </linearGradient>
                      </defs>
                      
                      {/* Y-axis for values */}
                      <line x1="80" y1="50" x2="80" y2="320" stroke="#2c3e50" strokeWidth="2"/>
                      {/* X-axis */}
                      <line x1="80" y1="320" x2="520" y2="320" stroke="#2c3e50" strokeWidth="2"/>
                      {/* Y-axis for percentage (right) */}
                      <line x1="520" y1="50" x2="520" y2="320" stroke="#3498db" strokeWidth="2"/>
                      
                      {/* Grid lines */}
                      <line x1="80" y1="266" x2="520" y2="266" stroke="#e1e8ed" strokeWidth="1" strokeDasharray="3,3"/>
                      <line x1="80" y1="212" x2="520" y2="212" stroke="#e1e8ed" strokeWidth="1" strokeDasharray="3,3"/>
                      <line x1="80" y1="158" x2="520" y2="158" stroke="#e1e8ed" strokeWidth="1" strokeDasharray="3,3"/>
                      <line x1="80" y1="104" x2="520" y2="104" stroke="#e1e8ed" strokeWidth="1" strokeDasharray="3,3"/>
                      
                      {/* 80% line */}
                      <line x1="80" y1="104" x2="520" y2="104" stroke="#e74c3c" strokeWidth="2" strokeDasharray="5,5"/>
                      <text x="530" y="108" fontSize="12" fill="#e74c3c" fontWeight="600">80%</text>
                      
                      {/* Bars */}
                      {/* Class A */}
                      <rect x="120" y="187" width="100" height="133" fill="url(#classAGradient)" className="pareto-bar"/>
                      {/* Class B */}
                      <rect x="250" y="236" width="100" height="84" fill="url(#classBGradient)" className="pareto-bar"/>
                      {/* Class C */}
                      <rect x="380" y="294" width="100" height="26" fill="url(#classCGradient)" className="pareto-bar"/>
                      
                      {/* Cumulative line */}
                      <path 
                        d="M 170 187 L 300 131 L 430 104" 
                        fill="none" 
                        stroke="#3498db" 
                        strokeWidth="3"
                        className="cumulative-line"
                      />
                      
                      {/* Data points on cumulative line */}
                      <circle cx="170" cy="187" r="6" fill="#3498db" stroke="white" strokeWidth="2" className="data-point"/>
                      <circle cx="300" cy="131" r="6" fill="#3498db" stroke="white" strokeWidth="2" className="data-point"/>
                      <circle cx="430" cy="104" r="6" fill="#3498db" stroke="white" strokeWidth="2" className="data-point"/>
                      
                      {/* Labels */}
                      <text x="170" y="340" textAnchor="middle" fontSize="14" fontWeight="600" fill="#2c3e50">クラス A</text>
                      <text x="300" y="340" textAnchor="middle" fontSize="14" fontWeight="600" fill="#2c3e50">クラス B</text>
                      <text x="430" y="340" textAnchor="middle" fontSize="14" fontWeight="600" fill="#2c3e50">クラス C</text>
                      
                      {/* Y-axis labels (left - value) */}
                      <text x="70" y="325" textAnchor="end" fontSize="12" fill="#2c3e50">0</text>
                      <text x="70" y="266" textAnchor="end" fontSize="12" fill="#2c3e50">500K</text>
                      <text x="70" y="212" textAnchor="end" fontSize="12" fill="#2c3e50">1M</text>
                      <text x="70" y="158" textAnchor="end" fontSize="12" fill="#2c3e50">1.5M</text>
                      <text x="70" y="104" textAnchor="end" fontSize="12" fill="#2c3e50">2M</text>
                      
                      {/* Y-axis labels (right - percentage) */}
                      <text x="530" y="325" fontSize="12" fill="#3498db">0%</text>
                      <text x="530" y="266" fontSize="12" fill="#3498db">20%</text>
                      <text x="530" y="212" fontSize="12" fill="#3498db">40%</text>
                      <text x="530" y="158" fontSize="12" fill="#3498db">60%</text>
                      <text x="530" y="54" fontSize="12" fill="#3498db">100%</text>
                      
                      {/* Value labels on bars */}
                      <text x="170" y="180" textAnchor="middle" fontSize="12" fontWeight="700" fill="white">¥1.7M</text>
                      <text x="300" y="229" textAnchor="middle" fontSize="12" fontWeight="700" fill="white">¥588K</text>
                      <text x="430" y="287" textAnchor="middle" fontSize="12" fontWeight="700" fill="white">¥147K</text>
                      
                      {/* Percentage labels on line */}
                      <text x="175" y="182" fontSize="11" fontWeight="600" fill="#3498db">70.1%</text>
                      <text x="305" y="126" fontSize="11" fontWeight="600" fill="#3498db">94.1%</text>
                      <text x="435" y="99" fontSize="11" fontWeight="600" fill="#3498db">100%</text>
                      
                      {/* Axis titles */}
                      <text x="300" y="370" textAnchor="middle" fontSize="14" fontWeight="600" fill="#2c3e50">分類</text>
                      <text x="40" y="185" textAnchor="middle" fontSize="14" fontWeight="600" fill="#2c3e50" transform="rotate(-90 40 185)">在庫価値 (¥)</text>
                      <text x="560" y="185" textAnchor="middle" fontSize="14" fontWeight="600" fill="#3498db" transform="rotate(90 560 185)">累積割合 (%)</text>
                    </svg>
                  </div>
                  
                  <div className="pareto-legend">
                    <div className="pareto-summary">
                      <h4>🎯 80-20ルール分析</h4>
                      <p>クラスA (15.6%のアイテム) が全体価値の70.1%を占める</p>
                    </div>
                    
                    <div className="pareto-details">
                      {mockReportData.abcAnalysis.map((item, index) => {
                        const cumulative = index === 0 ? 70.1 : index === 1 ? 94.1 : 100;
                        return (
                          <div key={item.category} className={`pareto-item abc-${item.category.toLowerCase()}`}>
                            <div className="pareto-color"></div>
                            <div className="pareto-content">
                              <div className="pareto-header">
                                <span className="pareto-label">クラス {item.category}</span>
                                <span className="pareto-cumulative">{cumulative}%</span>
                              </div>
                              <div className="pareto-stats">
                                <span>{item.items} アイテム ({item.percentage}%)</span>
                                <span>¥{item.value.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {reportType === 'turnover' && (
              <div className="report-section">
                <h3>🔄 在庫回転率分析</h3>
                <p className="report-description">
                  月別の在庫回転率を表示し、在庫効率の改善点を特定します
                </p>
                <div className="bar-chart-container">
                  <div className="chart-header">
                    <div className="chart-title">在庫回転率推移</div>
                    <div className="chart-target">目標: 3.0回転/月</div>
                  </div>
                  
                  <div className="bar-chart">
                    <div className="chart-y-axis">
                      <div className="y-label">4.0</div>
                      <div className="y-label">3.5</div>
                      <div className="y-label">3.0</div>
                      <div className="y-label">2.5</div>
                      <div className="y-label">2.0</div>
                      <div className="y-label">1.5</div>
                    </div>
                    
                    <div className="chart-content">
                      <div className="chart-grid">
                        <div className="grid-line" data-value="4.0"></div>
                        <div className="grid-line" data-value="3.5"></div>
                        <div className="grid-line target-line" data-value="3.0"></div>
                        <div className="grid-line" data-value="2.5"></div>
                        <div className="grid-line" data-value="2.0"></div>
                        <div className="grid-line" data-value="1.5"></div>
                      </div>
                      
                      <div className="chart-bars">
                        {mockReportData.turnoverRate.map((item, index) => (
                          <div key={index} className="bar-group">
                            <div className="bar-container">
                              <div 
                                className={`chart-bar ${item.status}`}
                                style={{ height: `${((item.rate - 1.5) / 2.5) * 250}px` }}
                                title={`${item.period}: ${item.rate}回転`}
                              >
                                <span className="bar-value">{item.rate}</span>
                              </div>
                            </div>
                            <div className="bar-label">{item.period.replace('2024年', '').replace('月', '月')}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="chart-legend">
                    <div className="legend-item">
                      <div className="legend-color above"></div>
                      <span>目標達成</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color below"></div>
                      <span>要改善</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {reportType === 'level' && (
              <div className="report-section">
                <h3>📈 在庫レベル分析</h3>
                <p className="report-description">
                  カテゴリ別の在庫レベルを分析し、最適在庫との比較を表示します
                </p>
                <div className="radar-chart-container">
                  <div className="radar-chart">
                    <svg viewBox="0 0 400 400" className="radar-svg">
                      {/* Background gradient */}
                      <defs>
                        <linearGradient id="dataPolygonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="rgba(52, 152, 219, 0.3)" />
                          <stop offset="100%" stopColor="rgba(52, 152, 219, 0.1)" />
                        </linearGradient>
                      </defs>
                      
                      {/* Concentric circles with percentage labels */}
                      <circle cx="200" cy="200" r="160" fill="none" stroke="#e1e8ed" strokeWidth="2"/>
                      <circle cx="200" cy="200" r="128" fill="none" stroke="#e1e8ed" strokeWidth="1"/>
                      <circle cx="200" cy="200" r="96" fill="none" stroke="#e1e8ed" strokeWidth="1"/>
                      <circle cx="200" cy="200" r="64" fill="none" stroke="#e1e8ed" strokeWidth="1"/>
                      <circle cx="200" cy="200" r="32" fill="none" stroke="#e1e8ed" strokeWidth="1"/>
                      
                      {/* Radial lines for 5 categories */}
                      <line x1="200" y1="40" x2="200" y2="360" stroke="#e1e8ed" strokeWidth="1"/>
                      <line x1="200" y1="200" x2="351" y2="113" stroke="#e1e8ed" strokeWidth="1"/>
                      <line x1="200" y1="200" x2="351" y2="287" stroke="#e1e8ed" strokeWidth="1"/>
                      <line x1="200" y1="200" x2="49" y2="287" stroke="#e1e8ed" strokeWidth="1"/>
                      <line x1="200" y1="200" x2="49" y2="113" stroke="#e1e8ed" strokeWidth="1"/>
                      
                      {/* Data polygon */}
                      <polygon
                        points="200,55 306,108 306,292 94,292 94,108"
                        fill="url(#dataPolygonGradient)"
                        stroke="#3498db"
                        strokeWidth="3"
                      />
                      
                      {/* Data points */}
                      {mockReportData.stockLevel.map((item, index) => {
                        const angles = [0, 72, 144, 216, 288]; // 5 points, 72 degrees apart
                        const angle = (angles[index] - 90) * (Math.PI / 180); // Convert to radians and adjust for top start
                        const radius = (item.percentage / 100) * 160; // Scale to chart size
                        const x = 200 + radius * Math.cos(angle);
                        const y = 200 + radius * Math.sin(angle);
                        
                        return (
                          <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="6"
                            fill={item.percentage < 80 ? '#e74c3c' : item.percentage > 95 ? '#f39c12' : '#27ae60'}
                            stroke="white"
                            strokeWidth="2"
                            className="radar-point"
                          />
                        );
                      })}
                      
                      {/* Labels */}
                      <text x="200" y="30" textAnchor="middle" fontSize="12" fontWeight="600" fill="#2c3e50">原材料</text>
                      <text x="351" y="118" textAnchor="start" fontSize="12" fontWeight="600" fill="#2c3e50">部品</text>
                      <text x="351" y="297" textAnchor="start" fontSize="12" fontWeight="600" fill="#2c3e50">完成品</text>
                      <text x="49" y="297" textAnchor="end" fontSize="12" fontWeight="600" fill="#2c3e50">消耗品</text>
                      <text x="49" y="118" textAnchor="end" fontSize="12" fontWeight="600" fill="#2c3e50">工具</text>
                      
                      {/* Percentage labels */}
                      <text x="210" y="45" fontSize="10" fill="#7f8c8d">100%</text>
                      <text x="210" y="77" fontSize="10" fill="#7f8c8d">80%</text>
                      <text x="210" y="109" fontSize="10" fill="#7f8c8d">60%</text>
                      <text x="210" y="141" fontSize="10" fill="#7f8c8d">40%</text>
                      <text x="210" y="173" fontSize="10" fill="#7f8c8d">20%</text>
                    </svg>
                  </div>
                  
                  <div className="radar-legend">
                    {mockReportData.stockLevel.map((item, index) => (
                      <div key={index} className="radar-legend-item">
                        <div 
                          className="radar-legend-color"
                          style={{ 
                            backgroundColor: item.percentage < 80 ? '#e74c3c' : item.percentage > 95 ? '#f39c12' : '#27ae60'
                          }}
                        ></div>
                        <div className="radar-legend-content">
                          <div className="radar-legend-label">{item.category}</div>
                          <div className="radar-legend-value">{item.percentage}%</div>
                          <div className="radar-legend-details">
                            {item.current}/{item.optimal}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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