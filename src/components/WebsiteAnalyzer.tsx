import React, { useState } from 'react';
import { subsidyAPI, BusinessProfile, MatchedSubsidy } from '../services/subsidyAPI';
import './WebsiteAnalyzer.css';

interface WebsiteAnalyzerProps {
  onMatchedSubsidiesFound?: (subsidies: MatchedSubsidy[]) => void;
}

const WebsiteAnalyzer: React.FC<WebsiteAnalyzerProps> = ({ onMatchedSubsidiesFound }) => {
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [matchedSubsidies, setMatchedSubsidies] = useState<MatchedSubsidy[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);

  // サンプルURL
  const sampleUrls = [
    { label: 'IT企業の例', url: 'https://www.cyberagent.co.jp/' },
    { label: '製造業の例', url: 'https://www.toyota.co.jp/' },
    { label: '飲食店の例', url: 'https://www.mos.jp/' },
  ];

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('URLを入力してください');
      return;
    }

    // URL形式の簡易チェック
    if (!url.match(/^https?:\/\/.+/)) {
      setError('有効なURL（https://...）を入力してください');
      return;
    }

    setLoading(true);
    setError(null);
    setShowResults(false);

    try {
      const result = await subsidyAPI.analyzeWebsite(url);
      setProfile(result.profile);
      setMatchedSubsidies(result.matchedSubsidies);
      setShowResults(true);
      
      // 保存機能（ローカルストレージ）
      saveProfile(result.profile, result.matchedSubsidies);
      
      // 親コンポーネントに通知
      if (onMatchedSubsidiesFound) {
        onMatchedSubsidiesFound(result.matchedSubsidies);
      }
    } catch (err: any) {
      setError(err.message || 'Webサイトの解析に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = (prof: BusinessProfile, matches: MatchedSubsidy[]) => {
    const savedData = {
      profile: prof,
      matches,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('websiteAnalysisProfile', JSON.stringify(savedData));
  };

  const loadSavedProfile = () => {
    const saved = localStorage.getItem('websiteAnalysisProfile');
    if (saved) {
      const data = JSON.parse(saved);
      setProfile(data.profile);
      setMatchedSubsidies(data.matches);
      setUrl(data.profile.url);
      setShowResults(true);
    }
  };

  const clearProfile = () => {
    setProfile(null);
    setMatchedSubsidies([]);
    setUrl('');
    setShowResults(false);
    localStorage.removeItem('websiteAnalysisProfile');
  };

  React.useEffect(() => {
    // 初回ロード時に保存されたプロファイルを読み込む
    const saved = localStorage.getItem('websiteAnalysisProfile');
    if (saved) {
      // 保存データがあることを通知
      console.log('保存されたプロファイルがあります');
    }
  }, []);

  return (
    <div className="website-analyzer">
      <div className="analyzer-header">
        <h2>🎯 あなたのビジネスに最適な補助金を見つける</h2>
        <p>ホームページのURLを入力すると、事業内容を自動解析して最適な補助金を提案します</p>
      </div>

      <div className="analyzer-form">
        <div className="input-group">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com （企業のホームページURLを入力）"
            className="url-input"
            disabled={loading}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && url.trim() && !loading) {
                handleAnalyze();
              }
            }}
          />
          <button 
            onClick={handleAnalyze}
            disabled={loading || !url.trim()}
            className="analyze-button"
          >
            {loading ? '解析中...' : '解析する'}
          </button>
        </div>

        <div className="sample-urls">
          <span className="sample-label">試してみる:</span>
          {sampleUrls.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => setUrl(sample.url)}
              className="sample-button"
              disabled={loading}
            >
              {sample.label}
            </button>
          ))}
        </div>

        <div className="quick-actions">
          {localStorage.getItem('websiteAnalysisProfile') && (
            <>
              <button onClick={loadSavedProfile} className="action-btn secondary">
                📋 前回の解析結果を見る
              </button>
              <button onClick={clearProfile} className="action-btn danger">
                🗑️ 保存データをクリア
              </button>
            </>
          )}
        </div>

        {error && (
          <div className="error-box">
            ⚠️ {error}
          </div>
        )}
      </div>

      {loading && (
        <div className="loading-box">
          <div className="spinner"></div>
          <p>Webサイトを解析中です...</p>
          <p className="loading-sub">事業内容・キーワード・地域情報を抽出しています</p>
        </div>
      )}

      {showResults && profile && (
        <div className="analysis-results">
          {/* プロファイル表示 */}
          <div className="profile-section">
            <h3>📊 解析結果</h3>
            
            <div className="profile-card">
              <div className="profile-header">
                <h4>{profile.title}</h4>
                <div className="confidence-badge">
                  信頼度: {profile.confidence}%
                </div>
              </div>

              <div className="profile-detail">
                <div className="detail-row">
                  <span className="label">URL:</span>
                  <a href={profile.url} target="_blank" rel="noopener noreferrer" className="url-link">
                    {profile.url}
                  </a>
                </div>

                {profile.businessType.length > 0 && (
                  <div className="detail-row">
                    <span className="label">推定業種:</span>
                    <div className="tags">
                      {profile.businessType.slice(0, 3).map((bt, idx) => (
                        <span key={idx} className="tag business-type">
                          {bt.type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.suggestedPrefecture && (
                  <div className="detail-row">
                    <span className="label">対象地域:</span>
                    <span className="value">{profile.suggestedPrefecture}</span>
                  </div>
                )}

                {profile.detectedCategories.length > 0 && (
                  <div className="detail-row">
                    <span className="label">関連カテゴリ:</span>
                    <div className="tags">
                      {profile.detectedCategories.slice(0, 5).map((cat, idx) => (
                        <span key={idx} className="tag category">
                          {cat.category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.keywords.length > 0 && (
                  <div className="detail-row">
                    <span className="label">抽出キーワード:</span>
                    <div className="tags">
                      {profile.keywords.slice(0, 8).map((kw, idx) => (
                        <span key={idx} className="tag keyword">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* マッチング結果 */}
          <div className="matches-section">
            <h3>💰 おすすめの補助金 ({matchedSubsidies.filter(m => m.score > 0).length}件)</h3>
            
            {matchedSubsidies.filter(m => m.score > 0).length === 0 ? (
              <div className="no-matches">
                <p>条件に合う補助金が見つかりませんでした。</p>
                <p>別のURLで試すか、下記の全補助金リストから検索してください。</p>
              </div>
            ) : (
              <div className="matches-grid">
                {matchedSubsidies
                  .filter(m => m.score > 0)
                  .slice(0, 10)
                  .map((match, idx) => (
                    <div key={match.subsidy.id} className="match-card">
                      <div className="match-header">
                        <div className="match-rank">#{idx + 1}</div>
                        <div className="match-score">
                          <div className="score-bar">
                            <div 
                              className="score-fill" 
                              style={{ width: `${match.matchPercentage}%` }}
                            ></div>
                          </div>
                          <span className="score-text">マッチ度: {match.matchPercentage}%</span>
                        </div>
                      </div>

                      <h4>{match.subsidy.title}</h4>
                      <p className="organization">{match.subsidy.organization}</p>
                      <p className="description">{match.subsidy.description}</p>

                      <div className="match-reasons">
                        <strong>マッチング理由:</strong>
                        <ul>
                          {match.matchReasons.map((reason, ridx) => (
                            <li key={ridx}>{reason}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="match-details">
                        <span className="detail-item">
                          💰 {match.subsidy.amount.min ? `${(match.subsidy.amount.min / 10000).toFixed(0)}万円〜` : '要確認'}
                        </span>
                        <span className="detail-item">
                          📍 {match.subsidy.prefecture}
                        </span>
                        <span className={`status-badge status-${match.subsidy.status}`}>
                          {match.subsidy.status === 'active' ? '募集中' : 
                           match.subsidy.status === 'upcoming' ? '募集予定' : '終了'}
                        </span>
                      </div>

                      <a 
                        href={match.subsidy.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="details-link"
                      >
                        詳細を見る →
                      </a>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteAnalyzer;

