import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface Subsidy {
  id: string;
  title: string;
  organization: string;
  description: string;
  deadline: string | null;
  status: 'active' | 'expired' | 'upcoming';
  amount: {
    min?: number;
    max?: number;
    rate?: string;
  };
  eligibility: string[];
  category: string[];
  prefecture: string;
  url: string;
  lastUpdated: string;
  source: string;
}

export interface SubsidyFilters {
  status?: string;
  category?: string;
  prefecture?: string;
  search?: string;
}

export interface SubsidyResponse {
  success: boolean;
  count: number;
  data: Subsidy[];
}

export interface SingleSubsidyResponse {
  success: boolean;
  data: Subsidy;
}

export interface MetaResponse {
  success: boolean;
  data: string[];
}

export interface BusinessProfile {
  url: string;
  title: string;
  businessType: Array<{
    type: string;
    confidence: number;
  }>;
  keywords: string[];
  detectedCategories: Array<{
    category: string;
    confidence: number;
  }>;
  suggestedPrefecture: string | null;
  confidence: number;
}

export interface MatchedSubsidy {
  subsidy: Subsidy;
  score: number;
  matchReasons: string[];
  matchPercentage: number;
}

export interface AnalysisResponse {
  success: boolean;
  data: {
    profile: BusinessProfile;
    matchedSubsidies: MatchedSubsidy[];
    analysisDate: string;
  };
}

class SubsidyAPI {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // 補助金一覧を取得
  async getSubsidies(filters?: SubsidyFilters): Promise<Subsidy[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.prefecture) params.append('prefecture', filters.prefecture);
      if (filters?.search) params.append('search', filters.search);

      const response = await axios.get<SubsidyResponse>(
        `${this.baseURL}/subsidies?${params.toString()}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching subsidies:', error);
      throw error;
    }
  }

  // 特定の補助金を取得
  async getSubsidyById(id: string): Promise<Subsidy> {
    try {
      const response = await axios.get<SingleSubsidyResponse>(
        `${this.baseURL}/subsidies/${id}`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching subsidy ${id}:`, error);
      throw error;
    }
  }

  // カテゴリ一覧を取得
  async getCategories(): Promise<string[]> {
    try {
      const response = await axios.get<MetaResponse>(
        `${this.baseURL}/subsidies/meta/categories`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // 都道府県一覧を取得
  async getPrefectures(): Promise<string[]> {
    try {
      const response = await axios.get<MetaResponse>(
        `${this.baseURL}/subsidies/meta/prefectures`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching prefectures:', error);
      throw error;
    }
  }



  // ヘルスチェック
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL.replace('/api', '')}/health`);
      return response.data.status === 'ok';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // WebサイトURLを解析して最適な補助金を提案
  async analyzeWebsite(url: string): Promise<AnalysisResponse['data']> {
    try {
      // this.baseURL = 'http://localhost:5000/api' なので
      // http://localhost:5000/api/analysis/analyze-website を作る
      const baseUrl = this.baseURL.split('/api')[0]; // 'http://localhost:5000'
      const response = await axios.post<AnalysisResponse>(
        `${baseUrl}/api/analysis/analyze-website`,
        { url }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Website analysis error:', error);
      throw new Error(error.response?.data?.error || 'Webサイトの解析に失敗しました');
    }
  }
}

export const subsidyAPI = new SubsidyAPI(API_BASE_URL);

