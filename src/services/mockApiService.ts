import { get, post, put, del } from 'aws-amplify/api';
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
  private apiName = 'mockapi';
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
   * APIレスポンスをセキュアに処理
   */
  private async processSecureResponse<T>(response: any): Promise<T> {
    try {
      const data = await response.response;
      // レスポンスデータをサニタイズ
      return sanitizeApiResponse(data);
    } catch (error) {
      console.error('API request failed:', error);
      throw new Error('API request failed');
    }
  }

  /**
   * ユーザー一覧を取得
   */
  async getUsers(): Promise<MockUser[]> {
    try {
      const restOperation = get({
        apiName: this.apiName,
        path: '/users',
        options: {
          headers: this.getSecureHeaders()
        }
      });
      
      const response = await this.processSecureResponse<ApiResponse<MockUser[]>>(restOperation);
      return response.data || [];
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
      const restOperation = get({
        apiName: this.apiName,
        path: `/users/${encodeURIComponent(id)}`,
        options: {
          headers: this.getSecureHeaders()
        }
      });
      
      const response = await this.processSecureResponse<ApiResponse<MockUser>>(restOperation);
      return response.data || null;
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
      const restOperation = get({
        apiName: this.apiName,
        path: '/products',
        options: {
          headers: this.getSecureHeaders()
        }
      });
      
      const response = await this.processSecureResponse<ApiResponse<MockProduct[]>>(restOperation);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return [];
    }
  }

  /**
   * 新しいユーザーを作成
   */
  async createUser(userData: Omit<MockUser, 'id' | 'createdAt'>): Promise<MockUser | null> {
    try {
      const restOperation = post({
        apiName: this.apiName,
        path: '/users',
        options: {
          headers: this.getSecureHeaders(),
          body: userData
        }
      });
      
      const response = await this.processSecureResponse<ApiResponse<MockUser>>(restOperation);
      return response.data || null;
    } catch (error) {
      console.error('Failed to create user:', error);
      return null;
    }
  }

  /**
   * ユーザー情報を更新
   */
  async updateUser(id: string, userData: Partial<MockUser>): Promise<MockUser | null> {
    try {
      const restOperation = put({
        apiName: this.apiName,
        path: `/users/${encodeURIComponent(id)}`,
        options: {
          headers: this.getSecureHeaders(),
          body: userData
        }
      });
      
      const response = await this.processSecureResponse<ApiResponse<MockUser>>(restOperation);
      return response.data || null;
    } catch (error) {
      console.error('Failed to update user:', error);
      return null;
    }
  }

  /**
   * ユーザーを削除
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      const restOperation = del({
        apiName: this.apiName,
        path: `/users/${encodeURIComponent(id)}`,
        options: {
          headers: this.getSecureHeaders()
        }
      });
      
      const response = await this.processSecureResponse<ApiResponse<{}>>(restOperation);
      return response.success;
    } catch (error) {
      console.error('Failed to delete user:', error);
      return false;
    }
  }
}

export const mockApiService = new MockApiService();
