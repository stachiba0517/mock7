import React, { useState } from 'react';
import { mockApiService, MockUser } from '../services/mockApiService';
import { escapeHtml } from '../utils/securityUtils';

interface UserFormProps {
  onUserCreated: (user: MockUser) => void;
}

interface FormData {
  name: string;
  email: string;
  role: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  role?: string;
  submit?: string;
}

export const UserForm: React.FC<UserFormProps> = ({ onUserCreated }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    role: 'user'
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // フォームバリデーション
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 名前の検証
    if (!formData.name.trim()) {
      newErrors.name = '名前は必須です';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '名前は2文字以上で入力してください';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = '名前は50文字以下で入力してください';
    }

    // メールアドレスの検証
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスは必須です';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = '有効なメールアドレスを入力してください';
    } else if (formData.email.trim().length > 100) {
      newErrors.email = 'メールアドレスは100文字以下で入力してください';
    }

    // ロールの検証
    const validRoles = ['admin', 'user', 'moderator'];
    if (!validRoles.includes(formData.role)) {
      newErrors.role = '無効なロールが選択されています';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 入力値の変更ハンドラー（セキュリティ考慮）
  const handleInputChange = (field: keyof FormData, value: string) => {
    // 基本的な入力サニタイゼーション
    const sanitizedValue = value
      .replace(/[<>]/g, '') // HTML タグの除去
      .slice(0, field === 'email' ? 100 : 50); // 最大長制限

    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));

    // エラーメッセージのクリア
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // フォーム送信ハンドラー
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // データをエスケープして送信
      const userData = {
        name: escapeHtml(formData.name.trim()),
        email: escapeHtml(formData.email.trim()),
        role: escapeHtml(formData.role)
      };

      const newUser = await mockApiService.createUser(userData);
      
      if (newUser) {
        // フォームリセット
        setFormData({
          name: '',
          email: '',
          role: 'user'
        });
        
        // 成功コールバック
        onUserCreated(newUser);
      } else {
        setErrors({
          submit: 'ユーザーの作成に失敗しました'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'ユーザー作成中にエラーが発生しました';
      setErrors({
        submit: escapeHtml(errorMessage)
      });
      console.error('Failed to create user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // フォームリセット
  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      role: 'user'
    });
    setErrors({});
  };

  return (
    <div className="user-form-container">
      <div className="section-header">
        <h2>新規ユーザー作成</h2>
      </div>

      <form onSubmit={handleSubmit} className="user-form" noValidate>
        {/* 名前入力 */}
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            名前 <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`form-input ${errors.name ? 'error' : ''}`}
            placeholder="ユーザー名を入力"
            maxLength={50}
            disabled={isSubmitting}
            autoComplete="name"
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <div id="name-error" className="error-text" role="alert">
              {errors.name}
            </div>
          )}
        </div>

        {/* メールアドレス入力 */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            メールアドレス <span className="required">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`form-input ${errors.email ? 'error' : ''}`}
            placeholder="email@example.com"
            maxLength={100}
            disabled={isSubmitting}
            autoComplete="email"
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <div id="email-error" className="error-text" role="alert">
              {errors.email}
            </div>
          )}
        </div>

        {/* ロール選択 */}
        <div className="form-group">
          <label htmlFor="role" className="form-label">
            ロール <span className="required">*</span>
          </label>
          <select
            id="role"
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
            className={`form-select ${errors.role ? 'error' : ''}`}
            disabled={isSubmitting}
            aria-describedby={errors.role ? 'role-error' : undefined}
          >
            <option value="user">ユーザー</option>
            <option value="admin">管理者</option>
            <option value="moderator">モデレーター</option>
          </select>
          {errors.role && (
            <div id="role-error" className="error-text" role="alert">
              {errors.role}
            </div>
          )}
        </div>

        {/* 送信エラー */}
        {errors.submit && (
          <div className="error-message" role="alert">
            <strong>エラー:</strong> <span dangerouslySetInnerHTML={{ __html: errors.submit }} />
          </div>
        )}

        {/* ボタン */}
        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
            aria-label="ユーザーを作成"
          >
            {isSubmitting ? '作成中...' : '✅ ユーザー作成'}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            className="reset-button"
            disabled={isSubmitting}
            aria-label="フォームをリセット"
          >
            🔄 リセット
          </button>
        </div>
      </form>

      <div className="form-info">
        <h3>セキュリティ情報</h3>
        <ul>
          <li>入力データはXSS攻撃を防ぐためサニタイズされます</li>
          <li>すべてのAPI通信はCSRF保護されています</li>
          <li>データは安全にバリデーションされます</li>
        </ul>
      </div>
    </div>
  );
};
