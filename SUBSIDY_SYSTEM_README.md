# 補助金・助成金情報システム

## 概要
福井県および全国の補助金・助成金情報をリアルタイムで検索・閲覧できるWebアプリケーション

## 機能
- ✅ 補助金一覧表示（モックデータ）
- ✅ ステータス別フィルタリング（募集中/終了/募集予定）
- ✅ カテゴリ別フィルタリング
- ✅ 都道府県別フィルタリング
- ✅ キーワード検索
- ✅ 詳細モーダル表示
- ✅ 締切日カウントダウン
- 🚧 Webスクレイピング（今後実装）
- 🚧 Google Search API連携（今後実装）
- 🚧 定期クローリング（今後実装）

## 技術スタック

### フロントエンド
- React 18 + TypeScript
- CSS3（モダンデザイン）
- Axios（HTTPクライアント）

### バックエンド
- Node.js + Express
- モックデータ（10件の補助金情報）
- RESTful API

## セットアップ

### 1. 依存パッケージのインストール

#### フロントエンド
```bash
npm install
```

#### バックエンド
```bash
cd server
npm install
cd ..
```

### 2. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成:
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. サーバーの起動

#### バックエンドAPIサーバー
```bash
cd server
npm start
# または開発モード（ホットリロード）
npm run dev
```

サーバーは `http://localhost:5000` で起動します。

#### フロントエンド開発サーバー
別のターミナルで:
```bash
npm start
```

フロントエンドは `http://localhost:3000` で起動します。

## ディレクトリ構造

```
mock7/
├── src/
│   ├── components/
│   │   ├── SubsidyList.tsx      # 補助金一覧コンポーネント
│   │   └── SubsidyList.css      # スタイル
│   ├── services/
│   │   └── subsidyAPI.ts        # APIクライアント
│   ├── SubsidyApp.tsx           # メインアプリ
│   └── index.tsx                # エントリポイント
├── server/
│   ├── src/
│   │   ├── data/
│   │   │   └── mockSubsidies.js # モックデータ
│   │   ├── routes/
│   │   │   └── subsidies.js     # APIルート
│   │   └── index.js             # サーバーエントリポイント
│   └── package.json
├── package.json
└── README.md
```

## API エンドポイント

### 補助金一覧取得
```
GET /api/subsidies?status=active&category=DX推進&prefecture=福井県&search=デジタル
```

### 特定の補助金取得
```
GET /api/subsidies/:id
```

### カテゴリ一覧取得
```
GET /api/subsidies/meta/categories
```

### 都道府県一覧取得
```
GET /api/subsidies/meta/prefectures
```

## 使い方

1. ブラウザで `http://localhost:3000` にアクセス
2. 検索条件を設定:
   - キーワード検索
   - ステータス（募集中/終了/募集予定）
   - カテゴリ（DX推進、事業承継など）
   - 都道府県
3. 補助金カードをクリックして詳細を表示
4. 「詳細を見る」から公式サイトへアクセス

## モックデータ

現在、以下の10件の補助金データを提供しています:

1. 小規模事業者持続化補助金（一般型） - 募集中
2. 事業再構築補助金 - 募集中
3. ものづくり・商業・サービス生産性向上促進補助金（一般型） - 募集中
4. ものづくり・商業・サービス生産性向上促進補助金（グローバル展開型） - 募集中
5. IT導入補助金 - 募集中
6. 福井県中小企業デジタル化支援補助金 - 募集中
7. 福井県事業承継支援補助金 - 募集中
8. 福井県若手人材確保支援補助金 - 募集中
9. 環境配慮型ビジネス推進補助金 - 終了
10. 地域活性化起業支援補助金 - 募集予定

## 今後の拡張予定

### Phase 2: Webスクレイピング実装
- [ ] Puppeteerを使った動的サイトスクレイピング
- [ ] Cheerioを使った静的HTMLパース
- [ ] サイト別スクレイパーの実装:
  - 福井県商工会連合会
  - スマート補助金
  - 補助金ポータル
  - 福井県庁

### Phase 3: Google Search API連携
- [ ] Google Custom Search API統合
- [ ] 検索結果の自動取得
- [ ] データの自動更新

### Phase 4: 定期クローリング
- [ ] node-cronによる定期実行
- [ ] データ差分検出
- [ ] 変更通知機能

### Phase 5: データベース永続化
- [ ] データベース設計（PostgreSQL/MongoDB）
- [ ] データ永続化
- [ ] 履歴管理

### Phase 6: 高度な機能
- [ ] ユーザー登録・ログイン
- [ ] お気に入り機能
- [ ] 締切アラート通知
- [ ] PDF出力
- [ ] メール通知

## トラブルシューティング

### ポート競合エラー
バックエンドのポートを変更:
```bash
cd server
PORT=5001 npm start
```

フロントエンドの `.env` も更新:
```
REACT_APP_API_URL=http://localhost:5001/api
```

### CORS エラー
バックエンドで既にCORSは有効化されていますが、問題がある場合は `server/src/index.js` の CORS設定を確認してください。

### モジュールが見つからないエラー
```bash
# フロントエンド
npm install

# バックエンド
cd server
npm install
```

## ライセンス
MIT

## 作成者
2025年10月

