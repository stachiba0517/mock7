# 🏭 製造業向け在庫管理システム

AWS Amplifyを使用して構築された、製造業に特化したリアルタイム在庫管理システムです。原材料から完成品まで、製造プロセス全体の在庫を効率的に管理できます。

## 🎯 主要機能

### 📊 ダッシュボード
- **リアルタイム統計**: 総在庫数、在庫価額、低在庫・在庫切れアイテム数
- **カテゴリ別内訳**: 原材料、部品、完成品等の在庫分布
- **在庫アラート**: 低在庫・在庫切れの自動警告
- **取引サマリー**: 過去7日間の在庫取引件数

### 📦 在庫管理
- **詳細在庫一覧**: 商品名、SKU、現在在庫、保管場所等
- **高度な検索・フィルタリング**: カテゴリ、倉庫、在庫状態での絞り込み
- **在庫レベル可視化**: 最低・最大在庫レベルとの比較
- **ソート機能**: 名前、在庫数、更新日等での並び替え

### 🏭 製造業特化機能
- **製造業カテゴリ**: 原材料、部品、仕掛品、完成品、工具、スペア部品
- **在庫状態管理**: 正常、低在庫、在庫切れ、過剰在庫
- **保管場所管理**: 倉庫・ゾーン・棚・ビン単位での位置管理
- **サプライヤー管理**: 仕入先情報の追跡

### 🔍 検索・分析
- **キーワード検索**: 商品名、SKU、説明、メーカー名での検索
- **多条件フィルタリング**: カテゴリ、倉庫、サプライヤー、在庫状態
- **在庫数量範囲検索**: 最小・最大在庫数での絞り込み
- **カスタムソート**: 6つのフィールドでの昇順・降順ソート

## 🔒 セキュリティ機能

### XSS攻撃対策
- DOMPurifyによる入力データサニタイゼーション
- HTMLエスケープ処理による安全な文字列表示
- Content Security Policy (CSP) 実装

### データ保護
- 全入力データの検証とサニタイゼーション
- セキュアなAPI通信
- クロスサイト攻撃防止

## 🚀 技術スタック

- **フロントエンド**: React 18 + TypeScript
- **UI/UX**: レスポンシブデザイン、モダンCSS
- **状態管理**: React Hooks
- **データ処理**: 静的JSON + 動的フィルタリング
- **セキュリティ**: DOMPurify、CSP、入力検証
- **ホスティング**: AWS Amplify Hosting
- **CI/CD**: 自動ビルド・デプロイ

## 📱 レスポンシブデザイン

- **デスクトップ**: フル機能のダッシュボードと詳細表示
- **タブレット**: 最適化されたレイアウトと操作性
- **モバイル**: タッチ操作に最適化されたUI

## 🔧 インストールと実行

### 前提条件
- Node.js 16以上
- npm または yarn

### ローカル開発
```bash
# リポジトリのクローン
git clone https://github.com/YOUR_USERNAME/manufacturing-inventory-system.git
cd manufacturing-inventory-system

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm start
```

### プロダクションビルド
```bash
# プロダクション用ビルド
npm run build

# ビルド結果のプレビュー
npx serve -s build
```

## 🌐 AWS Amplifyデプロイ

### 自動デプロイ設定
1. GitHubリポジトリにコードをプッシュ
2. AWS Amplify Consoleでアプリを作成
3. GitHubリポジトリと連携
4. 自動ビルド・デプロイ開始

### ビルド設定
```yaml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: build
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
```

## 📊 データ構造

### 在庫アイテム
```typescript
interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: InventoryCategory;
  sku: string;
  barcode?: string;
  manufacturer: string;
  supplier: string;
  unitPrice: number;
  currency: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unit: string;
  location: StorageLocation;
  lastUpdated: string;
  createdAt: string;
  status: ItemStatus;
  tags: string[];
}
```

### 取引履歴
```typescript
interface InventoryTransaction {
  id: string;
  itemId: string;
  type: TransactionType;
  quantity: number;
  unitPrice?: number;
  totalValue?: number;
  reason: string;
  referenceNumber?: string;
  performedBy: string;
  timestamp: string;
  notes?: string;
}
```

## 🎨 UI/UXの特徴

### ダッシュボード
- **統計カード**: 重要指標の視覚的表示
- **カテゴリ別グラフ**: 在庫分布の棒グラフ
- **アラート表示**: 優先度別の色分けアラート
- **クイックアクション**: よく使用する機能への素早いアクセス

### 在庫一覧
- **カード形式表示**: 情報を整理した見やすいレイアウト
- **在庫レベル表示**: プログレスバーによる視覚的在庫状況
- **フィルター UI**: 直感的な検索・絞り込み操作
- **状態バッジ**: 在庫状態の色分け表示

## 🔄 開発ロードマップ

### Phase 1 ✅ 完了
- [x] 基本在庫管理機能
- [x] ダッシュボード実装
- [x] 検索・フィルタリング
- [x] レスポンシブデザイン

### Phase 2 🚧 開発中
- [ ] 取引履歴管理
- [ ] 詳細レポート機能
- [ ] 在庫調整機能
- [ ] バーコードスキャン

### Phase 3 📋 計画中
- [ ] ABC分析
- [ ] 在庫回転率分析
- [ ] 発注点計算
- [ ] 予測分析

### Phase 4 🔮 将来的
- [ ] IoTセンサー連携
- [ ] 自動発注システム
- [ ] AI予測機能
- [ ] モバイルアプリ

## 📈 パフォーマンス

### 最適化済み
- **コード分割**: React.lazy による動的インポート
- **画像最適化**: WebP対応、レスポンシブ画像
- **キャッシュ戦略**: ServiceWorker、CDNキャッシュ
- **バンドルサイズ**: Tree shaking、最小化

### パフォーマンス指標
- **First Contentful Paint**: < 1.5秒
- **Largest Contentful Paint**: < 2.5秒
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3秒

## 🧪 品質保証

### コード品質
- **TypeScript**: 型安全性確保
- **ESLint**: コード品質チェック
- **Prettier**: コードフォーマット統一
- **コンポーネント設計**: 再利用可能な設計

### テスト
- **単体テスト**: Jest + React Testing Library
- **統合テスト**: ユーザーシナリオテスト
- **E2Eテスト**: Cypress（計画中）
- **セキュリティテスト**: 脆弱性スキャン

## 🔧 保守・運用

### 監視
- **パフォーマンス監視**: Core Web Vitals
- **エラー追跡**: 自動エラーレポート
- **使用状況分析**: ユーザー行動分析
- **アップタイム監視**: 24時間可用性監視

### アップデート
- **依存関係更新**: 月次セキュリティパッチ
- **機能追加**: 四半期リリース
- **バグ修正**: 緊急対応
- **セキュリティ更新**: 即座対応

## 📞 サポート

### 技術サポート
- **ドキュメント**: 詳細な操作マニュアル
- **FAQ**: よくある質問と回答
- **Issue追跡**: GitHub Issues
- **コミュニティ**: Discussions

### 商用サポート
- **24時間サポート**: 緊急時対応
- **カスタマイズ**: 企業固有要件対応
- **トレーニング**: 利用者向け研修
- **コンサルティング**: システム最適化支援

## 📄 ライセンス

MIT License - 商用利用可能

## 🤝 コントリビューション

プルリクエスト、Issue報告、機能提案を歓迎します。

### 開発に参加する
1. リポジトリをフォーク
2. フィーチャーブランチを作成
3. 変更をコミット
4. プルリクエストを送信

---

**製造業の在庫管理を革新する、次世代のクラウドソリューション** 🚀