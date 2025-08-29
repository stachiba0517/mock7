# 🔧 AWS Amplify デプロイ トラブルシューティングガイド

## 🚨 現在の状況

**デプロイエラー**: "Your app will appear here once you complete your first deployment"  
**問題**: ビルドは成功するが、アプリケーションが表示されない

## ✅ 実施済み修正

### 1. **amplify.yml の最小構成**
```yaml
version: 1
frontend:
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

### 2. **ビルド出力確認済み**
- ✅ `build/index.html` 存在確認
- ✅ `build/static/` ディレクトリ構造正常
- ✅ `build/api/` データファイル配置済み
- ✅ 全ファイルサイズ正常

### 3. **問題要因の除去**
- ❌ CSPヘッダーを一時削除
- ❌ favicon.ico削除（空ファイルが原因の可能性）
- ❌ 不要なHTMLメタタグ削除

## 🔍 追加のデバッグ手順

### Amplify Console での確認項目

#### **1. ビルドログの詳細確認**
```
1. AWS Amplify Console にアクセス
2. アプリを選択 → "デプロイ" タブ
3. 最新のビルドをクリック
4. 各フェーズのログを確認:
   - プロビジョン
   - ビルド  
   - デプロイ
   - 確認
```

#### **2. ビルド設定の手動確認**
```
1. アプリ設定 → ビルド設定
2. amplify.yml の内容が正しいか確認
3. 環境変数が正しく設定されているか確認
```

#### **3. 高度な設定確認**
```
1. アプリ設定 → 全般
2. リポジトリの詳細を確認
3. ブランチ設定を確認
```

## 🛠️ 追加の修正案

### **案1: Node.js バージョン明示**
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm use 18
        - node --version
        - npm --version
        - npm ci
    build:
      commands:
        - npm run build
```

### **案2: 環境変数追加**
Amplify Console → アプリ設定 → 環境変数:
```
NODE_ENV = production
CI = false
GENERATE_SOURCEMAP = false
```

### **案3: カスタムヘッダー削除**
```yaml
# customHeaders セクションを完全に削除
version: 1
frontend:
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
```

### **案4: buildspec.yml 使用**
`amplify.yml` の代わりに `buildspec.yml`:
```yaml
version: 0.2
phases:
  pre_build:
    commands:
      - npm ci
  build:
    commands:
      - npm run build
artifacts:
  base-directory: build
  files:
    - '**/*'
cache:
  paths:
    - node_modules/**/*
```

## 📊 デバッグ情報収集

### **ローカルビルド検証**
```bash
# ビルド成功確認
npm run build

# 成果物確認
ls -la build/
cat build/index.html

# ローカルテスト
npx serve -s build
```

### **ビルドサイズ確認**
```
現在のビルドサイズ:
- main.js: 78.93 kB (gzipped)
- main.css: 4.59 kB (gzipped)
- 合計: ~84 kB

→ サイズ制限による問題の可能性は低い
```

## 🚀 最終的な解決策

### **完全に新しいAmplifyアプリ作成**

**現在のアプリに問題がある場合:**

1. **新しいAmplifyアプリを作成**
   ```
   AWS Amplify Console → 新しいアプリ作成
   同じGitHubリポジトリを選択
   ブランチ: main
   ```

2. **最小構成でテスト**
   ```yaml
   version: 1
   frontend:
     phases:
       build:
         commands:
           - npm ci
           - npm run build
     artifacts:
       baseDirectory: build
       files:
         - '**/*'
   ```

3. **段階的に機能追加**
   - まず基本デプロイ成功確認
   - その後セキュリティヘッダー等を追加

## 📞 サポートリソース

### **AWS サポート**
- [Amplify Hosting Troubleshooting](https://docs.aws.amazon.com/amplify/latest/userguide/troubleshooting.html)
- [Build Specification Reference](https://docs.aws.amazon.com/amplify/latest/userguide/build-settings.html)

### **コミュニティリソース**
- AWS Amplify Discord
- Stack Overflow: `aws-amplify` タグ
- GitHub Issues: aws-amplify/amplify-console

---

## 🎯 次のアクション

1. **Amplify Console でビルドログを詳細確認**
2. **エラーメッセージがあれば特定**
3. **必要に応じて上記の修正案を順次適用**
4. **最終手段として新しいAmplifyアプリを作成**

**現在プッシュ完了 → 自動ビルドが開始されました**
