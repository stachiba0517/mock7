# Aurora Serverless セットアップガイド

## 概要
このガイドでは、AWS Aurora Serverless (MySQL) を使用した補助金検索システムのセットアップ方法を説明します。

## 前提条件
- AWSアカウント
- Node.js 16以上
- AWS CLIまたはAWSコンソールへのアクセス

## 1. Aurora Serverlessクラスターの作成

### AWS コンソールから作成

1. **RDSダッシュボードにアクセス**
   - https://console.aws.amazon.com/rds/

2. **データベースの作成**
   - 「データベースの作成」をクリック
   - エンジンタイプ: **Aurora (MySQL互換)**
   - エディション: **Amazon Aurora Serverless v2**

3. **設定**
   ```
   DBクラスター識別子: subsidy-db-cluster
   マスターユーザー名: admin
   マスターパスワード: [強力なパスワードを設定]
   ```

4. **容量の設定**
   ```
   最小ACU: 0.5
   最大ACU: 2.0
   ```

5. **接続**
   - VPC: デフォルトVPC
   - パブリックアクセス: **はい** (開発環境の場合)
   - VPCセキュリティグループ: 新規作成

6. **追加設定**
   ```
   初期データベース名: subsidy_db
   バックアップ保持期間: 7日
   ```

### AWS CLIから作成

```bash
aws rds create-db-cluster \
  --db-cluster-identifier subsidy-db-cluster \
  --engine aurora-mysql \
  --engine-version 8.0.mysql_aurora.3.04.0 \
  --engine-mode provisioned \
  --serverless-v2-scaling-configuration MinCapacity=0.5,MaxCapacity=2 \
  --master-username admin \
  --master-user-password YOUR_PASSWORD \
  --database-name subsidy_db \
  --publicly-accessible

aws rds create-db-instance \
  --db-instance-identifier subsidy-db-instance \
  --db-cluster-identifier subsidy-db-cluster \
  --db-instance-class db.serverless \
  --engine aurora-mysql
```

## 2. セキュリティグループの設定

1. **インバウンドルール追加**
   - タイプ: MySQL/Aurora (3306)
   - ソース: マイIP (開発環境) または アプリケーションのIP

```bash
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 3306 \
  --cidr YOUR_IP/32
```

## 3. 環境変数の設定

`.env`ファイルを作成:

```bash
cp .env.example .env
```

`.env`を編集:

```env
PORT=5000
NODE_ENV=production

# Aurora Serverless接続情報
DB_HOST=subsidy-db-cluster.cluster-xxxxx.ap-northeast-1.rds.amazonaws.com
DB_PORT=3306
DB_NAME=subsidy_db
DB_USER=admin
DB_PASSWORD=your_secure_password
DB_CONNECTION_LIMIT=10
DB_TYPE=mysql
```

### エンドポイントの確認方法

```bash
aws rds describe-db-clusters \
  --db-cluster-identifier subsidy-db-cluster \
  --query 'DBClusters[0].Endpoint' \
  --output text
```

## 4. 依存パッケージのインストール

```bash
cd server
npm install
```

新しい依存関係:
- `mysql2`: MySQL接続ドライバー
- `dotenv`: 環境変数管理

## 5. データベースマイグレーション

```bash
npm run db:migrate
```

このコマンドで実行される処理:
1. データベーステーブルの作成
2. インデックスの作成
3. 初期データ（モックデータ）の投入

### 手動でマイグレーション

```bash
# MySQLクライアントで接続
mysql -h subsidy-db-cluster.cluster-xxxxx.ap-northeast-1.rds.amazonaws.com \
      -u admin -p subsidy_db

# スキーマファイルを実行
mysql> source src/db/schema.sql;
```

## 6. サーバーの起動

### Aurora版を起動

```bash
# 本番環境
node src/index.aurora.js

# 開発環境（ホットリロード）
nodemon src/index.aurora.js
```

### モック版に戻す場合

```bash
node src/index.js
```

## 7. 動作確認

### ヘルスチェック

```bash
curl http://localhost:5000/health
```

レスポンス例:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-10-04T00:00:00.000Z"
}
```

### 補助金データ取得

```bash
curl http://localhost:5000/api/subsidies
```

## データベーススキーマ

### テーブル構造

#### 1. subsidies (補助金メインテーブル)
```sql
- id: VARCHAR(50) PRIMARY KEY
- title: VARCHAR(500) - 補助金名
- organization: VARCHAR(255) - 実施機関
- description: TEXT - 説明
- deadline: DATETIME - 締切日時
- status: ENUM - ステータス
- amount_min/max: DECIMAL - 補助金額
- prefecture: VARCHAR(50) - 対象都道府県
- url: TEXT - 詳細URL
```

#### 2. subsidy_categories (カテゴリ)
```sql
- subsidy_id: 補助金ID
- category: カテゴリ名
```

#### 3. subsidy_eligibility (対象者・要件)
```sql
- subsidy_id: 補助金ID
- eligibility_text: 要件テキスト
- display_order: 表示順
```

#### 4. access_logs (アクセスログ)
```sql
- subsidy_id: アクセスされた補助金ID
- action: アクション種別
- accessed_at: アクセス日時
```

#### 5. search_logs (検索ログ)
```sql
- search_keyword: 検索キーワード
- results_count: 結果件数
- searched_at: 検索日時
```

## パフォーマンスチューニング

### インデックス

主要なクエリに対してインデックスを設定済み:
- `idx_status`: ステータス検索
- `idx_prefecture`: 都道府県検索
- `idx_deadline`: 締切日ソート
- `idx_fulltext`: 全文検索

### 接続プール

```javascript
connectionLimit: 10  // 同時接続数
```

本番環境では必要に応じて調整してください。

### Aurora Serverless v2のスケーリング

```
最小ACU: 0.5 (使用されていない時の最小容量)
最大ACU: 2.0 (負荷時の最大容量)
```

トラフィックに応じて自動スケーリングします。

## コスト最適化

### Aurora Serverless v2の料金

- **ACU時間**: 約$0.12/ACU時間（東京リージョン）
- **ストレージ**: 約$0.12/GB月
- **I/O**: 約$0.24/100万リクエスト

### 推定コスト（低トラフィック）

```
ACU時間: 0.5 ACU × 24時間 × 30日 = 360 ACU時間
料金: 360 × $0.12 = $43.2/月

ストレージ: 1GB × $0.12 = $0.12/月

合計: 約$43.32/月
```

### コスト削減のヒント

1. **開発環境はスリープ設定**
   - 使用していない時は停止
   
2. **最小ACUを調整**
   - トラフィックが少ない場合は0.5 ACUで十分

3. **バックアップ保持期間を短縮**
   - 7日 → 1日（開発環境）

## トラブルシューティング

### 接続できない

1. **セキュリティグループを確認**
   ```bash
   aws ec2 describe-security-groups --group-ids sg-xxxxx
   ```

2. **エンドポイントを確認**
   ```bash
   aws rds describe-db-clusters --db-cluster-identifier subsidy-db-cluster
   ```

3. **接続テスト**
   ```bash
   telnet your-cluster.rds.amazonaws.com 3306
   ```

### パフォーマンスが遅い

1. **スロークエリログを確認**
2. **インデックスを確認**
3. **ACU上限を引き上げ**

### データが表示されない

1. **マイグレーションを再実行**
   ```bash
   npm run db:migrate
   ```

2. **データを確認**
   ```sql
   SELECT COUNT(*) FROM subsidies;
   ```

## 本番環境への移行

### 1. VPC内に配置

パブリックアクセスを無効化し、VPC内のEC2/ECS/Lambdaからのみアクセス可能にする

### 2. Secrets Managerを使用

```bash
aws secretsmanager create-secret \
  --name subsidy-db-credentials \
  --secret-string '{"username":"admin","password":"xxx"}'
```

### 3. IAM認証を有効化

パスワード認証からIAM認証に切り替え

### 4. 監視設定

- CloudWatch メトリクス
- RDS Performance Insights
- ログエクスポート有効化

## まとめ

Aurora Serverless版を使用することで:
- ✅ 本番環境でのスケーラビリティ
- ✅ 自動スケーリング
- ✅ 高可用性
- ✅ SQLによる高度な検索
- ✅ データの永続化

モック版との切り替えも簡単なので、開発初期はモック版、本番はAurora版という使い分けが可能です。

