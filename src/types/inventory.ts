// 製造業向け在庫管理システムの型定義

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: InventoryCategory;
  sku: string; // Stock Keeping Unit（商品管理番号）
  barcode?: string;
  manufacturer: string;
  supplier: string;
  unitPrice: number;
  currency: string;
  currentStock: number;
  minStockLevel: number; // 最低在庫レベル
  maxStockLevel: number; // 最大在庫レベル
  unit: string; // 単位（個、kg、m、L等）
  location: StorageLocation;
  lastUpdated: string;
  createdAt: string;
  status: ItemStatus;
  tags: string[];
}

export interface StorageLocation {
  warehouse: string;
  zone: string;
  shelf: string;
  bin: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  type: TransactionType;
  quantity: number;
  unitPrice?: number;
  totalValue?: number;
  reason: string;
  referenceNumber?: string; // 発注番号、出荷番号等
  performedBy: string;
  timestamp: string;
  notes?: string;
}

export interface StockAlert {
  id: string;
  itemId: string;
  itemName: string;
  alertType: AlertType;
  currentStock: number;
  thresholdLevel: number;
  severity: AlertSeverity;
  message: string;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export interface InventoryReport {
  id: string;
  title: string;
  reportType: ReportType;
  generatedAt: string;
  generatedBy: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  filters: ReportFilters;
  data: any; // レポート固有のデータ
}

export interface ReportFilters {
  categories?: InventoryCategory[];
  warehouses?: string[];
  suppliers?: string[];
  stockStatus?: StockStatus[];
}

// 列挙型定義
export enum InventoryCategory {
  RAW_MATERIALS = 'raw_materials',
  COMPONENTS = 'components',
  WORK_IN_PROGRESS = 'work_in_progress',
  FINISHED_GOODS = 'finished_goods',
  PACKAGING = 'packaging',
  TOOLS = 'tools',
  SPARE_PARTS = 'spare_parts',
  CONSUMABLES = 'consumables'
}

export enum ItemStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
  PENDING = 'pending'
}

export enum TransactionType {
  PURCHASE = 'purchase', // 購入入庫
  SALE = 'sale', // 売上出庫
  PRODUCTION_INPUT = 'production_input', // 製造投入
  PRODUCTION_OUTPUT = 'production_output', // 製造完成
  TRANSFER = 'transfer', // 移動
  ADJUSTMENT = 'adjustment', // 棚卸調整
  RETURN = 'return', // 返品
  DAMAGE = 'damage', // 破損
  SCRAP = 'scrap' // 廃棄
}

export enum AlertType {
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  OVERSTOCK = 'overstock',
  EXPIRING_SOON = 'expiring_soon',
  EXPIRED = 'expired'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ReportType {
  STOCK_LEVEL = 'stock_level',
  TRANSACTION_HISTORY = 'transaction_history',
  LOW_STOCK_ALERT = 'low_stock_alert',
  ABC_ANALYSIS = 'abc_analysis',
  TURNOVER_RATE = 'turnover_rate',
  VALUATION = 'valuation'
}

export enum StockStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  OVERSTOCK = 'overstock'
}

// API レスポンス型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// 検索・フィルタリング用
export interface InventorySearchFilters {
  keyword?: string;
  category?: InventoryCategory;
  warehouse?: string;
  supplier?: string;
  stockStatus?: StockStatus;
  minStock?: number;
  maxStock?: number;
  sortBy?: InventorySortField;
  sortOrder?: 'asc' | 'desc';
}

export enum InventorySortField {
  NAME = 'name',
  SKU = 'sku',
  CATEGORY = 'category',
  CURRENT_STOCK = 'currentStock',
  UNIT_PRICE = 'unitPrice',
  LAST_UPDATED = 'lastUpdated'
}
