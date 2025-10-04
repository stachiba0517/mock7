# 補助金情報 API サーバー

## 概要
補助金・助成金情報を提供するREST APIサーバー（モック版）

## セットアップ

### 依存パッケージのインストール
```bash
cd server
npm install
```

### サーバーの起動

#### 開発モード（ホットリロード）
```bash
npm run dev
```

#### 本番モード
```bash
npm start
```

サーバーは `http://localhost:5000` で起動します。

## API エンドポイント

### 1. 補助金一覧取得
```
GET /api/subsidies
```

#### クエリパラメータ
- `status`: ステータスでフィルタ (`active`, `expired`, `upcoming`)
- `category`: カテゴリでフィルタ (例: `DX推進`, `事業承継`)
- `prefecture`: 都道府県でフィルタ (例: `福井県`, `全国`)
- `search`: キーワード検索

#### レスポンス例
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "subsidy-001",
      "title": "小規模事業者持続化補助金（一般型）",
      "organization": "福井県商工会連合会",
      "description": "...",
      "deadline": "2025-12-31T23:59:59.000Z",
      "status": "active",
      "amount": {
        "max": 500000,
        "rate": "2/3"
      },
      "eligibility": [...],
      "category": [...],
      "prefecture": "福井県",
      "url": "...",
      "lastUpdated": "2025-10-03T00:00:00.000Z",
      "source": "..."
    }
  ]
}
```

### 2. 特定の補助金取得
```
GET /api/subsidies/:id
```

### 3. カテゴリ一覧取得
```
GET /api/subsidies/meta/categories
```

### 4. 都道府県一覧取得
```
GET /api/subsidies/meta/prefectures
```

### 5. ヘルスチェック
```
GET /health
```

## データモデル

### Subsidy
| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | 補助金ID |
| title | string | 補助金名 |
| organization | string | 実施機関 |
| description | string | 説明 |
| deadline | string (ISO 8601) | 締切日時 |
| status | enum | `active`, `expired`, `upcoming` |
| amount | object | 補助金額情報 |
| amount.min | number | 最低額（円） |
| amount.max | number | 最高額（円） |
| amount.rate | string | 補助率 |
| eligibility | string[] | 対象者・要件 |
| category | string[] | カテゴリ |
| prefecture | string | 対象都道府県 |
| url | string | 詳細URL |
| lastUpdated | string (ISO 8601) | 最終更新日時 |
| source | string | データソース |

## 今後の拡張予定
- [ ] Webスクレイピング機能の追加
- [ ] Google Custom Search API連携
- [ ] 定期クローリング（node-cron）
- [ ] キャッシング機能
- [ ] データベース永続化

