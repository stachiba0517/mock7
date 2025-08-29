import { 
  InventoryItem, 
  InventoryTransaction, 
  StockAlert, 
  InventorySearchFilters,
  ApiResponse,
  InventoryCategory,
  StockStatus,
  AlertType,
  AlertSeverity
} from '../types/inventory';
import { sanitizeApiResponse } from '../utils/securityUtils';
import { getCurrentConfig } from '../config/environment';

class InventoryService {
  private config = getCurrentConfig();

  /**
   * セキュアなAPIリクエストヘッダーを生成
   */
  private getSecureHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };
  }

  /**
   * データを安全に取得
   */
  private async fetchData<T>(endpoint: string): Promise<T> {
    try {
      let url: string;
      
      if (this.config.environment === 'production') {
        url = `/api/${endpoint}.json`;
      } else {
        url = `${this.config.apiEndpoint}/api/${endpoint}.json`;
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
   * 在庫アイテム一覧を取得
   */
  async getInventoryItems(filters?: InventorySearchFilters): Promise<InventoryItem[]> {
    try {
      let items = await this.fetchData<InventoryItem[]>('inventory');
      
      if (filters) {
        items = this.applyFilters(items, filters);
      }

      return items;
    } catch (error) {
      console.error('Failed to fetch inventory items:', error);
      return [];
    }
  }

  /**
   * 特定の在庫アイテムを取得
   */
  async getInventoryItem(id: string): Promise<InventoryItem | null> {
    try {
      const items = await this.fetchData<InventoryItem[]>('inventory');
      const item = items.find(item => item.id === id);
      return item || null;
    } catch (error) {
      console.error('Failed to fetch inventory item:', error);
      return null;
    }
  }

  /**
   * 取引履歴を取得
   */
  async getTransactions(itemId?: string): Promise<InventoryTransaction[]> {
    try {
      let transactions = await this.fetchData<InventoryTransaction[]>('transactions');
      
      if (itemId) {
        transactions = transactions.filter(tx => tx.itemId === itemId);
      }

      return transactions.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      return [];
    }
  }

  /**
   * 在庫警告を生成
   */
  async getStockAlerts(): Promise<StockAlert[]> {
    try {
      const items = await this.fetchData<InventoryItem[]>('inventory');
      const alerts: StockAlert[] = [];

      items.forEach(item => {
        // 在庫切れ警告
        if (item.currentStock === 0) {
          alerts.push({
            id: `alert-${item.id}-outofstock`,
            itemId: item.id,
            itemName: item.name,
            alertType: AlertType.OUT_OF_STOCK,
            currentStock: item.currentStock,
            thresholdLevel: item.minStockLevel,
            severity: AlertSeverity.CRITICAL,
            message: `${item.name} が在庫切れです`,
            isResolved: false,
            createdAt: new Date().toISOString()
          });
        }
        // 低在庫警告
        else if (item.currentStock <= item.minStockLevel) {
          alerts.push({
            id: `alert-${item.id}-lowstock`,
            itemId: item.id,
            itemName: item.name,
            alertType: AlertType.LOW_STOCK,
            currentStock: item.currentStock,
            thresholdLevel: item.minStockLevel,
            severity: item.currentStock <= item.minStockLevel * 0.5 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
            message: `${item.name} の在庫が少なくなっています (${item.currentStock}${item.unit} / 最低${item.minStockLevel}${item.unit})`,
            isResolved: false,
            createdAt: new Date().toISOString()
          });
        }
        // 過剰在庫警告
        else if (item.currentStock >= item.maxStockLevel) {
          alerts.push({
            id: `alert-${item.id}-overstock`,
            itemId: item.id,
            itemName: item.name,
            alertType: AlertType.OVERSTOCK,
            currentStock: item.currentStock,
            thresholdLevel: item.maxStockLevel,
            severity: AlertSeverity.LOW,
            message: `${item.name} の在庫が過剰です (${item.currentStock}${item.unit} / 最大${item.maxStockLevel}${item.unit})`,
            isResolved: false,
            createdAt: new Date().toISOString()
          });
        }
      });

      return alerts.sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });
    } catch (error) {
      console.error('Failed to generate stock alerts:', error);
      return [];
    }
  }

  /**
   * 在庫統計を取得
   */
  async getInventoryStatistics() {
    try {
      const items = await this.fetchData<InventoryItem[]>('inventory');
      const transactions = await this.fetchData<InventoryTransaction[]>('transactions');

      const totalItems = items.length;
      const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);
      
      const lowStockItems = items.filter(item => 
        item.currentStock <= item.minStockLevel && item.currentStock > 0
      ).length;
      
      const outOfStockItems = items.filter(item => item.currentStock === 0).length;
      
      const categoryBreakdown = items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const recentTransactions = transactions
        .filter(tx => {
          const txDate = new Date(tx.timestamp);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return txDate >= sevenDaysAgo;
        })
        .length;

      return {
        totalItems,
        totalValue,
        lowStockItems,
        outOfStockItems,
        categoryBreakdown,
        recentTransactions
      };
    } catch (error) {
      console.error('Failed to calculate statistics:', error);
      return {
        totalItems: 0,
        totalValue: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        categoryBreakdown: {},
        recentTransactions: 0
      };
    }
  }

  /**
   * フィルター適用
   */
  private applyFilters(items: InventoryItem[], filters: InventorySearchFilters): InventoryItem[] {
    let filteredItems = [...items];

    // キーワード検索
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(keyword) ||
        item.sku.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        item.manufacturer.toLowerCase().includes(keyword)
      );
    }

    // カテゴリフィルター
    if (filters.category) {
      filteredItems = filteredItems.filter(item => item.category === filters.category);
    }

    // 倉庫フィルター
    if (filters.warehouse) {
      filteredItems = filteredItems.filter(item => item.location.warehouse === filters.warehouse);
    }

    // サプライヤーフィルター
    if (filters.supplier) {
      filteredItems = filteredItems.filter(item => item.supplier === filters.supplier);
    }

    // 在庫状態フィルター
    if (filters.stockStatus) {
      filteredItems = filteredItems.filter(item => {
        const stockStatus = this.getStockStatus(item);
        return stockStatus === filters.stockStatus;
      });
    }

    // 在庫数量範囲フィルター
    if (filters.minStock !== undefined) {
      filteredItems = filteredItems.filter(item => item.currentStock >= filters.minStock!);
    }
    if (filters.maxStock !== undefined) {
      filteredItems = filteredItems.filter(item => item.currentStock <= filters.maxStock!);
    }

    // ソート
    if (filters.sortBy) {
      filteredItems.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'sku':
            aValue = a.sku.toLowerCase();
            bValue = b.sku.toLowerCase();
            break;
          case 'category':
            aValue = a.category;
            bValue = b.category;
            break;
          case 'currentStock':
            aValue = a.currentStock;
            bValue = b.currentStock;
            break;
          case 'unitPrice':
            aValue = a.unitPrice;
            bValue = b.unitPrice;
            break;
          case 'lastUpdated':
            aValue = new Date(a.lastUpdated).getTime();
            bValue = new Date(b.lastUpdated).getTime();
            break;
          default:
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
        }

        if (aValue < bValue) return filters.sortOrder === 'desc' ? 1 : -1;
        if (aValue > bValue) return filters.sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }

    return filteredItems;
  }

  /**
   * 在庫状態を判定
   */
  private getStockStatus(item: InventoryItem): StockStatus {
    if (item.currentStock === 0) return StockStatus.OUT_OF_STOCK;
    if (item.currentStock <= item.minStockLevel) return StockStatus.LOW_STOCK;
    if (item.currentStock >= item.maxStockLevel) return StockStatus.OVERSTOCK;
    return StockStatus.IN_STOCK;
  }

  /**
   * 新しい在庫アイテムを作成（シミュレーション）
   */
  async createInventoryItem(itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'lastUpdated'>): Promise<InventoryItem | null> {
    if (this.config.environment === 'production') {
      const newItem: InventoryItem = {
        id: `INV${Date.now()}`,
        ...itemData,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      console.log('本番環境: 在庫アイテム作成をシミュレート', newItem);
      return sanitizeApiResponse(newItem);
    }

    return null;
  }

  /**
   * 在庫アイテムを更新（シミュレーション）
   */
  async updateInventoryItem(id: string, itemData: Partial<InventoryItem>): Promise<InventoryItem | null> {
    if (this.config.environment === 'production') {
      console.log('本番環境: 在庫アイテム更新をシミュレート', { id, itemData });
      return null;
    }

    return null;
  }

  /**
   * 在庫アイテムを削除（シミュレーション）
   */
  async deleteInventoryItem(id: string): Promise<boolean> {
    if (this.config.environment === 'production') {
      console.log('本番環境: 在庫アイテム削除をシミュレート', id);
      return true;
    }

    return false;
  }
}

export const inventoryService = new InventoryService();
