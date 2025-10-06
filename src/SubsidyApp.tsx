import React, { useState } from 'react';
import SubsidyList from './components/SubsidyList';
import WebsiteAnalyzer from './components/WebsiteAnalyzer';
import './AppTabs.css';

function SubsidyApp() {
  const [activeTab, setActiveTab] = useState<'search' | 'analyzer'>('analyzer');

  return (
    <div className="SubsidyApp">
      <div className="app-header">
        <h1>💰 公金チューチュー</h1>
        <p className="app-subtitle">補助金・助成金情報検索システム</p>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'analyzer' ? 'active' : ''}`}
          onClick={() => setActiveTab('analyzer')}
        >
          🎯 HP解析で探す（推奨）
        </button>
        <button
          className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          🔍 条件検索で探す
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'analyzer' ? (
          <WebsiteAnalyzer />
        ) : (
          <SubsidyList />
        )}
      </div>
    </div>
  );
}

export default SubsidyApp;

