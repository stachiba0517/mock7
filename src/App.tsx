import React, { useState, useEffect } from 'react';
import './App.css';
import { UserList } from './components/UserList';
import { ProductList } from './components/ProductList';
import { UserForm } from './components/UserForm';
import { mockApiService, MockUser } from './services/mockApiService';
import { escapeHtml } from './utils/securityUtils';

type ActiveTab = 'users' | 'products' | 'create-user';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('users');
  const [users, setUsers] = useState<MockUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // ユーザーデータを安全に読み込み
  const loadUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const userData = await mockApiService.getUsers();
      setUsers(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setError(escapeHtml(errorMessage));
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  // ユーザー作成成功時のコールバック
  const handleUserCreated = (newUser: MockUser) => {
    setUsers(prev => [...prev, newUser]);
    setActiveTab('users'); // ユーザー一覧に戻る
  };

  // ユーザー削除ハンドラー
  const handleUserDelete = async (userId: string) => {
    if (!window.confirm('このユーザーを削除してもよろしいですか？')) {
      return;
    }

    try {
      const success = await mockApiService.deleteUser(userId);
      if (success) {
        setUsers(prev => prev.filter(user => user.id !== userId));
      } else {
        setError('ユーザーの削除に失敗しました');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ユーザーの削除中にエラーが発生しました';
      setError(escapeHtml(errorMessage));
    }
  };

  // 初回ロード
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>セキュアモックAPI - AWS Amplify</h1>
        <p>XSS対策済みのダミーデータアクセスシステム</p>
      </header>

      <nav className="App-nav">
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          ユーザー一覧
        </button>
        <button
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          商品一覧
        </button>
        <button
          className={activeTab === 'create-user' ? 'active' : ''}
          onClick={() => setActiveTab('create-user')}
        >
          ユーザー作成
        </button>
      </nav>

      <main className="App-main">
        {error && (
          <div className="error-message" role="alert">
            <strong>エラー:</strong> <span dangerouslySetInnerHTML={{ __html: error }} />
          </div>
        )}

        {loading && (
          <div className="loading-message" role="status" aria-live="polite">
            読み込み中...
          </div>
        )}

        {activeTab === 'users' && (
          <UserList
            users={users}
            onRefresh={loadUsers}
            onDelete={handleUserDelete}
            loading={loading}
          />
        )}

        {activeTab === 'products' && (
          <ProductList />
        )}

        {activeTab === 'create-user' && (
          <UserForm onUserCreated={handleUserCreated} />
        )}
      </main>

      <footer className="App-footer">
        <p>© 2024 Secure Mock API. セキュリティを重視した開発例です。</p>
      </footer>
    </div>
  );
}

export default App;
