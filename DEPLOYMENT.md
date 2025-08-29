# 🚀 AWS Amplify GitHub連携デプロイガイド

このドキュメントでは、AWS AmplifyでGitHub連携による自動CI/CDを設定する手順を説明します。

## 📋 前提条件

- GitHubアカウント
- AWSアカウント
- プロジェクトファイルの準備完了 ✅

## 🔧 Step 1: GitHubリポジトリの作成

### 1.1 GitHub上で新しいリポジトリを作成
1. https://github.com にアクセス
2. 「New repository」をクリック
3. リポジトリ名: `secure-mock-api-amplify`
4. Description: `AWS Amplifyを使用したセキュアなモックAPIアプリケーション`
5. Public または Private を選択
6. 「Create repository」をクリック

### 1.2 ローカルからGitHubにプッシュ
```bash
# リモートリポジトリを追加
git remote add origin https://github.com/YOUR_USERNAME/secure-mock-api-amplify.git

# デフォルトブランチ名を設定
git branch -M main

# GitHubにプッシュ
git push -u origin main
```

## 🏗️ Step 2: AWS Amplify Hostingの設定

### 2.1 AWS Amplify Consoleにアクセス
1. https://console.aws.amazon.com/amplify にアクセス
2. リージョンを「アジアパシフィック (東京) ap-northeast-1」に設定

### 2.2 新しいアプリの作成
1. 「新しいアプリをホスト」をクリック
2. 「GitHub」を選択
3. 「続行」をクリック

### 2.3 GitHub認証とリポジトリ選択
1. GitHub認証を完了
2. リポジトリ: `secure-mock-api-amplify` を選択
3. ブランチ: `main` を選択
4. 「次へ」をクリック

### 2.4 ビルド設定の確認
Amplifyが自動的に `amplify.yml` を検出します。以下の設定が適用されます：

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

### 2.5 詳細設定
1. アプリ名: `secure-mock-api`
2. 環境名: `main`
3. 「次へ」をクリック

### 2.6 確認とデプロイ
1. 設定を確認
2. 「保存してデプロイ」をクリック

## 🔄 Step 3: 自動CI/CDの動作確認

### 3.1 デプロイ状況の監視
AWS Amplify Consoleで以下のフェーズが順次実行されます：

1. **プロビジョン**: 約1分
2. **ビルド**: 約3-5分
   - `npm ci` でパッケージインストール
   - `npm run build` でプロダクションビルド
3. **デプロイ**: 約1分
4. **確認**: 約30秒

### 3.2 デプロイ完了の確認
✅ すべてのフェーズが緑色のチェックマークになったら完了  
✅ 提供されたURLでアプリケーションにアクセス可能

## 🌐 Step 4: カスタムドメインの設定（オプション）

### 4.1 ドメイン管理
1. Amplify Console → 「ドメイン管理」
2. 「カスタムドメインを追加」
3. 独自ドメインまたはAmplifyサブドメインを設定

## 🚀 Step 5: 継続的デプロイメントのテスト

### 5.1 コード変更のプッシュ
```bash
# ファイルを編集
echo "Updated" >> README.md

# 変更をコミット
git add .
git commit -m "Test automatic deployment"

# GitHubにプッシュ
git push origin main
```

### 5.2 自動デプロイの確認
- GitHubへのプッシュから約5-8分で自動デプロイ完了
- Amplify ConsoleでリアルタイムログとUIで進行状況を確認

## 🔒 セキュリティ機能

### ✅ 実装済みセキュリティ対策
- **XSS攻撃対策**: DOMPurify、エスケープ処理
- **CSRF攻撃対策**: CSRFトークン、セキュアヘッダー
- **CSP**: Content Security Policy実装
- **セキュアヘッダー**: X-Frame-Options、X-Content-Type-Options等
- **入力検証**: フォームバリデーション、文字長制限

### 🛡️ Amplify標準セキュリティ
- **HTTPS強制**: 全通信の暗号化
- **CDN配信**: CloudFrontによる高速・安全配信
- **DDoS保護**: AWS Shield Standard
- **アクセスログ**: CloudWatch統合

## 📊 監視とメンテナンス

### 監視項目
- **ビルド状況**: Amplify Console
- **アクセス数**: CloudWatch Metrics
- **エラーログ**: CloudWatch Logs
- **パフォーマンス**: Web Vitals

### 定期メンテナンス
- 依存関係の更新: 月次
- セキュリティパッチ: 随時
- パフォーマンス最適化: 四半期

## 🎯 デプロイ後の確認ポイント

### ✅ 機能テスト
- [ ] ユーザー一覧表示
- [ ] 商品一覧表示  
- [ ] フォーム動作
- [ ] レスポンシブデザイン

### ✅ セキュリティテスト
- [ ] XSS攻撃耐性
- [ ] CSRF保護動作
- [ ] セキュアヘッダー設定
- [ ] HTTPS強制

### ✅ パフォーマンステスト
- [ ] 初期ロード時間
- [ ] モバイル対応
- [ ] SEO基本設定

## 🆘 トラブルシューティング

### よくある問題と解決策

**ビルドエラー**
- `package-lock.json`の確認
- Node.jsバージョンの確認
- 依存関係の再インストール

**デプロイ失敗**
- `amplify.yml`の設定確認
- ビルド出力ディレクトリの確認
- 権限設定の確認

**表示エラー**
- CSPポリシーの確認
- 静的ファイルパスの確認
- キャッシュクリア

## 📞 サポート

問題が発生した場合：
1. AWS Amplify ドキュメント参照
2. CloudWatch Logsでエラー詳細確認
3. AWS Supportに問い合わせ

---

🎉 **おめでとうございます！** 
セキュアなモックAPIアプリケーションのAWS Amplify自動デプロイ設定が完了しました！
