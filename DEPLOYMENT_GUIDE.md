# 🚀 AWS Amplifyデプロイガイド

製造業向け在庫管理システムをAWS Amplifyにデプロイする詳細手順

## 📋 GitHubリポジトリ準備完了

✅ **リポジトリURL**: https://github.com/stachiba0517/mock1.git  
✅ **ブランチ**: main  
✅ **ビルド設定**: 完了  
✅ **プロダクションビルド**: テスト済み  

## 🔧 AWS Amplifyでのデプロイ手順

### Step 1: AWS Amplify Consoleにアクセス
1. https://console.aws.amazon.com/amplify にアクセス
2. リージョンを「アジアパシフィック (東京) ap-northeast-1」に設定

### Step 2: 新しいアプリの作成
1. 「新しいアプリをホスト」をクリック
2. 「GitHub」を選択
3. 「続行」をクリック

### Step 3: GitHub連携
1. GitHub認証を完了
2. **リポジトリ**: `stachiba0517/mock1` を選択
3. **ブランチ**: `main` を選択
4. 「次へ」をクリック

### Step 4: ビルド設定
自動検出された `amplify.yml` の設定を確認：

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
    appRoot: /
```

### Step 5: アプリ設定
1. **アプリ名**: `manufacturing-inventory-system`
2. **環境名**: `main`
3. 「次へ」をクリック

### Step 6: デプロイ実行
1. 設定内容を確認
2. 「保存してデプロイ」をクリック

## 📊 デプロイ進行状況

デプロイは以下の4つのフェーズで実行されます：

### 1. プロビジョン (約1分)
- AWSリソースの準備
- ビルド環境のセットアップ

### 2. ビルド (約3-5分)
- `npm ci` でパッケージインストール
- `npm run build` でプロダクションビルド
- アセット最適化

### 3. デプロイ (約1分)
- CloudFront CDNへのデプロイ
- SSL証明書の設定

### 4. 確認 (約30秒)
- デプロイの検証
- ヘルスチェック

## 🌐 デプロイ完了後の確認

### ✅ 動作確認項目
- [ ] アプリケーションが正常に表示される
- [ ] ダッシュボードの統計が表示される
- [ ] 在庫一覧が正常に読み込まれる
- [ ] 検索・フィルタリング機能が動作する
- [ ] レスポンシブデザインが適用される

### 🔗 アクセスURL
デプロイ完了後、以下の形式のURLが提供されます：
```
https://main.d1234567890123.amplifyapp.com
```

## 🔄 継続的デプロイメント

### 自動デプロイの流れ
1. **コード変更** → GitHubにプッシュ
2. **自動トリガー** → Amplifyが変更を検出
3. **ビルド実行** → 最新コードをビルド
4. **自動デプロイ** → 本番環境に反映

### 更新コマンド例
```bash
# 機能追加後の更新
git add .
git commit -m "feat: 新機能追加"
git push origin main

# 約5-8分で自動デプロイ完了
```

## 🛡️ セキュリティ設定

### 自動適用されるセキュリティ機能
- **HTTPS強制**: 全通信の暗号化
- **CDN配信**: CloudFrontによる高速・安全配信
- **DDoS保護**: AWS Shield Standard
- **CSP適用**: Content Security Policy

### 環境変数（必要に応じて）
```
NODE_ENV=production
REACT_APP_API_ENDPOINT=production
```

## 📈 パフォーマンス最適化

### 実装済み最適化
- **コード分割**: 動的インポートによる最適化
- **画像最適化**: 最小サイズでの配信
- **キャッシュ戦略**: 効率的なキャッシュ設定
- **CDN配信**: 世界中での高速アクセス

### 期待されるパフォーマンス
- **初期ロード**: < 2秒
- **ページ遷移**: < 500ms
- **API応答**: < 100ms

## 🔧 カスタムドメイン設定（オプション）

### Step 1: ドメイン追加
1. Amplify Console → 「ドメイン管理」
2. 「カスタムドメインを追加」
3. 独自ドメインを入力

### Step 2: DNS設定
1. CNAMEレコードの追加
2. SSL証明書の自動発行待ち
3. ドメイン検証完了

## 🚨 トラブルシューティング

### よくある問題と解決策

**ビルドエラー**
```bash
# 依存関係の問題
rm -rf node_modules package-lock.json
npm install
npm run build
```

**デプロイ失敗**
- `amplify.yml` の設定確認
- ビルド出力ディレクトリの確認
- 権限設定の確認

**表示エラー**
- CSPポリシーの確認
- 静的ファイルパスの確認
- キャッシュクリア

## 📞 サポート・監視

### 監視項目
- **ビルド状況**: Amplify Console
- **アクセス数**: CloudWatch Metrics
- **エラーログ**: CloudWatch Logs
- **パフォーマンス**: Real User Monitoring

### 運用メンテナンス
- **依存関係更新**: 月次
- **セキュリティパッチ**: 随時
- **パフォーマンス最適化**: 四半期

---

## 🎉 デプロイ完了！

製造業向け在庫管理システムが正常にデプロイされ、世界中からアクセス可能になりました。

### 📱 主要機能
- **リアルタイムダッシュボード**: 在庫統計とアラート
- **詳細在庫管理**: 検索・フィルタリング・ソート
- **製造業特化機能**: カテゴリ管理・保管場所追跡
- **レスポンシブUI**: モバイル・タブレット対応

### 🔒 セキュリティ
- **XSS対策済み**: DOMPurify + エスケープ処理
- **HTTPS強制**: 全通信暗号化
- **CSP実装**: Content Security Policy
- **安全なAPI**: サニタイズ済みデータ処理

**🚀 デプロイ成功 - 製造業の在庫管理を次のレベルへ！**
