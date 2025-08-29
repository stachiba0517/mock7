import { sanitizeApiResponse, generateCsrfToken } from '../utils/securityUtils';
import { getCurrentConfig } from '../config/environment';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface MockProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  csrf_token?: string;
}

class MockApiService {
  private csrfToken: string = '';
  private config = getCurrentConfig();

  constructor() {
    this.csrfToken = generateCsrfToken();
  }

  /**
   * セキュアなAPIリクエストのヘッダーを生成
   */
  private getSecureHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-CSRF-Token': this.csrfToken,
      'X-Requested-With': 'XMLHttpRequest'
    };
  }

  /**
   * 本番環境では静的JSONファイルを使用、開発環境ではAmplify APIを使用
   */
  private async fetchData<T>(endpoint: string): Promise<T> {
    try {
      let url: string;
      
      if (this.config.environment === 'production') {
        // 本番環境では同じドメインの静的ファイルを使用
        url = `/api/${endpoint}.json`;
      } else {
        // 開発環境ではAmplify APIを使用
        url = `${this.config.apiEndpoint}/${endpoint}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getSecureHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return sanitizeApiResponse(data);
    } catch (error) {
      console.error(`Failed to fetch ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * ユーザー一覧を取得
   */
  async getUsers(): Promise<MockUser[]> {
    try {
      return await this.fetchData<MockUser[]>('users');
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  }

  /**
   * 特定ユーザーを取得
   */
  async getUserById(id: string): Promise<MockUser | null> {
    try {
      const users = await this.fetchData<MockUser[]>('users');
      const user = users.find(u => u.id === id);
      return user || null;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  }

  /**
   * 商品一覧を取得
   */
  async getProducts(): Promise<MockProduct[]> {
    try {
      return await this.fetchData<MockProduct[]>('products');
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return [];
    }
  }

  /**
   * 新しいユーザーを作成（本番環境では読み取り専用）
   */
  async createUser(userData: Omit<MockUser, 'id' | 'createdAt'>): Promise<MockUser | null> {
    if (this.config.environment === 'production') {
      // 本番環境では実際の作成はできないため、ダミーレスポンスを返す
      const newUser: MockUser = {
        id: `temp-${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        createdAt: new Date().toISOString()
      };
      
      // UIには成功を通知するが、実際のデータは永続化されない
      console.log('本番環境: ユーザー作成をシミュレート', newUser);
      return sanitizeApiResponse(newUser);
    }

    // 開発環境での実装（必要に応じて）
    return null;
  }

  /**
   * ユーザー情報を更新（本番環境では読み取り専用）
   */
  async updateUser(id: string, userData: Partial<MockUser>): Promise<MockUser | null> {
    if (this.config.environment === 'production') {
      console.log('本番環境: ユーザー更新をシミュレート', { id, userData });
      return null;
    }

    // 開発環境での実装（必要に応じて）
    return null;
  }

  /**
   * ユーザーを削除（本番環境では読み取り専用）
   */
  async deleteUser(id: string): Promise<boolean> {
    if (this.config.environment === 'production') {
      console.log('本番環境: ユーザー削除をシミュレート', id);
      return true; // UIには成功を通知
    }

    // 開発環境での実装（必要に応じて）
    return false;
  }
}

export const mockApiService = new MockApiService();