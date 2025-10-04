import React, { useState, useEffect } from 'react';
import { subsidyAPI, Subsidy } from '../services/subsidyAPI';
import './SubsidyList.css';

const SubsidyList: React.FC = () => {
  const [subsidies, setSubsidies] = useState<Subsidy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // フィルター状態
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [prefectureFilter, setPrefectureFilter] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  
  // メタデータ
  const [categories, setCategories] = useState<string[]>([]);
  const [prefectures, setPrefectures] = useState<string[]>([]);
  
  // 選択された補助金
  const [selectedSubsidy, setSelectedSubsidy] = useState<Subsidy | null>(null);

  // 初期データ読み込み
  useEffect(() => {
    loadMetadata();
    loadSubsidies();
  }, []);

  // フィルター変更時にデータを再読み込み
  useEffect(() => {
    loadSubsidies();
  }, [statusFilter, categoryFilter, prefectureFilter, searchKeyword]);

  const loadMetadata = async () => {
    try {
      const [categoriesData, prefecturesData] = await Promise.all([
        subsidyAPI.getCategories(),
        subsidyAPI.getPrefectures()
      ]);
      setCategories(categoriesData);
      setPrefectures(prefecturesData);
    } catch (err) {
      console.error('メタデータの読み込みに失敗しました', err);
    }
  };

  const loadSubsidies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await subsidyAPI.getSubsidies({
        status: statusFilter,
        category: categoryFilter,
        prefecture: prefectureFilter,
        search: searchKeyword
      });
      setSubsidies(data);
    } catch (err) {
      setError('データの読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: Subsidy['amount']) => {
    if (!amount) return '-';
    const parts = [];
    if (amount.min) parts.push(`${(amount.min / 10000).toFixed(0)}万円〜`);
    if (amount.max) parts.push(`${(amount.max / 10000).toFixed(0)}万円`);
    if (amount.rate) parts.push(`(${amount.rate})`);
    return parts.join(' ');
  };

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return '未定';
    const date = new Date(deadline);
    const now = new Date();
    const daysLeft = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    const dateStr = date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (daysLeft < 0) {
      return `${dateStr} (締切済)`;
    } else if (daysLeft <= 7) {
      return `${dateStr} (残り${daysLeft}日)`;
    } else if (daysLeft <= 30) {
      return `${dateStr} (残り約${Math.ceil(daysLeft / 7)}週間)`;
    } else {
      return `${dateStr} (残り約${Math.ceil(daysLeft / 30)}ヶ月)`;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { label: '募集中', className: 'status-active' },
      expired: { label: '終了', className: 'status-expired' },
      upcoming: { label: '募集予定', className: 'status-upcoming' }
    };
    const badge = badges[status as keyof typeof badges] || badges.active;
    return <span className={`status-badge ${badge.className}`}>{badge.label}</span>;
  };

  const handleReset = () => {
    setStatusFilter('active');
    setCategoryFilter('');
    setPrefectureFilter('');
    setSearchKeyword('');
  };

  return (
    <div className="subsidy-list-container">
      <header className="subsidy-header">
        <h2>💰 補助金・助成金一覧</h2>
        <p>福井県及び全国の補助金・助成金情報を検索できます</p>
      </header>

      {/* 検索・フィルターセクション */}
      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>キーワード検索</label>
            <input
              type="text"
              placeholder="補助金名、説明、実施機関で検索..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>ステータス</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">すべて</option>
              <option value="active">募集中</option>
              <option value="upcoming">募集予定</option>
              <option value="expired">終了</option>
            </select>
          </div>

          <div className="filter-group">
            <label>カテゴリ</label>
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">すべて</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>都道府県</label>
            <select 
              value={prefectureFilter} 
              onChange={(e) => setPrefectureFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">すべて</option>
              {prefectures.map(pref => (
                <option key={pref} value={pref}>{pref}</option>
              ))}
            </select>
          </div>

          <button onClick={handleReset} className="reset-button">
            リセット
          </button>
        </div>
      </div>

      {/* 結果表示 */}
      <div className="results-summary">
        <p>{loading ? '読み込み中...' : `${subsidies.length}件の補助金が見つかりました`}</p>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* 補助金リスト */}
      <div className="subsidy-grid">
        {loading ? (
          <div className="loading-spinner">読み込み中...</div>
        ) : subsidies.length === 0 ? (
          <div className="no-results">
            <p>条件に一致する補助金が見つかりませんでした</p>
          </div>
        ) : (
          subsidies.map(subsidy => (
            <div 
              key={subsidy.id} 
              className="subsidy-card"
              onClick={() => setSelectedSubsidy(subsidy)}
            >
              <div className="card-header">
                <h3>{subsidy.title}</h3>
                {getStatusBadge(subsidy.status)}
              </div>
              
              <div className="card-body">
                <p className="organization">{subsidy.organization}</p>
                <p className="description">{subsidy.description}</p>
                
                <div className="card-details">
                  <div className="detail-item">
                    <span className="detail-label">補助金額:</span>
                    <span className="detail-value">{formatAmount(subsidy.amount)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">締切:</span>
                    <span className="detail-value">{formatDeadline(subsidy.deadline)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">対象地域:</span>
                    <span className="detail-value">{subsidy.prefecture}</span>
                  </div>
                </div>

                <div className="card-tags">
                  {subsidy.category.map((cat, idx) => (
                    <span key={idx} className="tag">{cat}</span>
                  ))}
                </div>
              </div>

              <div className="card-footer">
                <a 
                  href={subsidy.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="details-link"
                >
                  詳細を見る →
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 詳細モーダル */}
      {selectedSubsidy && (
        <div className="modal-overlay" onClick={() => setSelectedSubsidy(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={() => setSelectedSubsidy(null)}
            >
              ×
            </button>
            
            <h2>{selectedSubsidy.title}</h2>
            {getStatusBadge(selectedSubsidy.status)}
            
            <div className="modal-body">
              <section>
                <h3>実施機関</h3>
                <p>{selectedSubsidy.organization}</p>
              </section>

              <section>
                <h3>説明</h3>
                <p>{selectedSubsidy.description}</p>
              </section>

              <section>
                <h3>補助金額</h3>
                <p>{formatAmount(selectedSubsidy.amount)}</p>
              </section>

              <section>
                <h3>応募締切</h3>
                <p>{formatDeadline(selectedSubsidy.deadline)}</p>
              </section>

              <section>
                <h3>対象者・要件</h3>
                <ul>
                  {selectedSubsidy.eligibility.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h3>カテゴリ</h3>
                <div className="card-tags">
                  {selectedSubsidy.category.map((cat, idx) => (
                    <span key={idx} className="tag">{cat}</span>
                  ))}
                </div>
              </section>

              <section>
                <h3>対象地域</h3>
                <p>{selectedSubsidy.prefecture}</p>
              </section>

              <section>
                <a 
                  href={selectedSubsidy.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  公式サイトで詳細を見る →
                </a>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubsidyList;

