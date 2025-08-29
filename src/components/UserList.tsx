import React from 'react';
import { MockUser } from '../services/mockApiService';
import { escapeHtml } from '../utils/securityUtils';

interface UserListProps {
  users: MockUser[];
  onRefresh: () => void;
  onDelete: (userId: string) => void;
  loading: boolean;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  onRefresh,
  onDelete,
  loading
}) => {
  // 安全な日付フォーマット
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // ロールのスタイリング（安全）
  const getRoleClass = (role: string): string => {
    const safeRole = escapeHtml(role.toLowerCase());
    switch (safeRole) {
      case 'admin':
        return 'role-admin';
      case 'user':
        return 'role-user';
      default:
        return 'role-default';
    }
  };

  return (
    <div className="user-list-container">
      <div className="section-header">
        <h2>ユーザー一覧</h2>
        <button
          onClick={onRefresh}
          className="refresh-button"
          disabled={loading}
          aria-label="ユーザー一覧を更新"
        >
          🔄 更新
        </button>
      </div>

      {users.length === 0 && !loading ? (
        <div className="empty-state">
          <p>ユーザーが見つかりません。</p>
        </div>
      ) : (
        <div className="user-grid">
          {users.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-header">
                <h3 className="user-name">
                  {/* XSS攻撃を防ぐためエスケープ処理 */}
                  {escapeHtml(user.name)}
                </h3>
                <span className={`user-role ${getRoleClass(user.role)}`}>
                  {escapeHtml(user.role)}
                </span>
              </div>
              
              <div className="user-details">
                <div className="user-email">
                  📧 <span>{escapeHtml(user.email)}</span>
                </div>
                <div className="user-created">
                  📅 作成日: {formatDate(user.createdAt)}
                </div>
                <div className="user-id">
                  🆔 ID: <code>{escapeHtml(user.id)}</code>
                </div>
              </div>

              <div className="user-actions">
                <button
                  onClick={() => onDelete(user.id)}
                  className="delete-button"
                  aria-label={`${escapeHtml(user.name)}を削除`}
                >
                  🗑️ 削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="user-stats">
        <p>
          総ユーザー数: <strong>{users.length}</strong>名
        </p>
      </div>
    </div>
  );
};
