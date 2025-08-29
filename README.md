# セキュアモックAPI - AWS Amplify

AWS Amplifyを使用して構築されたセキュアなモックAPIとReactアプリケーションです。XSS攻撃やその他のセキュリティ脅威から保護されたダミーデータシステムを提供します。

## 🔒 セキュリティ機能

### XSS攻撃対策
- 全てのユーザー入力データのサニタイゼーション
- DOMPurifyを使用したHTMLサニタイゼーション
- Content Security Policy (CSP) の実装
- エスケープ処理による安全な文字列処理

### CSRF攻撃対策
- CSRFトークンの実装
- XMLHttpRequestヘッダーの検証
- セキュアなAPIエンドポイント設計

### その他のセキュリティ対策
- セキュアHTTPヘッダーの設定
- 入力値検証とバリデーション
- レート制限（基本実装）
- 安全なエラーハンドリング

## 🚀 技術スタック

- **Frontend**: React 18 + TypeScript
- **Backend**: AWS Lambda (Node.js)
- **API**: AWS API Gateway + REST API
- **Authentication**: AWS Cognito (オプション)
- **Hosting**: AWS Amplify Hosting
- **Security**: DOMPurify, CSP, セキュアヘッダー

## 📦 インストールと設定

### 前提条件
- Node.js 16以上
- AWS CLI設定済み
- AWS Amplify CLI

### 1. 依存関係のインストール
```bash
npm install
```

### 2. Amplify CLIの設定
```bash
# Amplify CLIの設定（初回のみ）
npm run amplify-configure

# Amplifyプロジェクトの初期化
npm run amplify-init
```

### 3. バックエンドのデプロイ
```bash
# API、Lambda関数、その他のリソースをデプロイ
npm run amplify-push
```

### 4. 開発サーバーの起動
```bash
# React開発サーバーを起動
npm start
```

### 5. プロダクションビルドとデプロイ
```bash
# ビルドとAmplifyホスティングへのデプロイ
npm run amplify-publish
```

## 🏗️ プロジェクト構造

```
├── amplify/
│   ├── backend/
│   │   ├── api/mockapi/          # REST API設定
│   │   └── function/mockApiFunction/  # Lambda関数
│   ├── cli.json                  # Amplify CLI設定
│   └── team-provider-info.json   # 環境固有設定
├── public/
│   └── index.html               # CSP設定済み
├── src/
│   ├── components/              # Reactコンポーネント
│   │   ├── UserList.tsx         # ユーザー一覧表示
│   │   ├── ProductList.tsx      # 商品一覧表示
│   │   └── UserForm.tsx         # ユーザー作成フォーム
│   ├── services/                # APIサービス
│   │   └── mockApiService.ts    # セキュアなAPI通信
│   ├── utils/                   # ユーティリティ
│   │   └── securityUtils.ts     # セキュリティ関数
│   ├── App.tsx                  # メインアプリケーション
│   ├── App.css                  # アプリケーションスタイル
│   └── amplifyconfiguration.json # Amplify設定
├── package.json
├── amplify.yml                  # ビルド設定
└── README.md
```

## 🔧 API エンドポイント

### ユーザー管理
- `GET /users` - ユーザー一覧取得
- `GET /users/{id}` - 特定ユーザー取得
- `POST /users` - ユーザー作成
- `PUT /users/{id}` - ユーザー更新
- `DELETE /users/{id}` - ユーザー削除

### 商品管理
- `GET /products` - 商品一覧取得

## 🛡️ セキュリティガイドライン

### 開発時の注意点
1. **ユーザー入力の処理**
   - 全ての入力データをサニタイズする
   - バリデーションを必ず実装する
   - 長さ制限を設ける

2. **データ表示**
   - `dangerouslySetInnerHTML`は慎重に使用
   - エスケープ処理を確実に実行
   - 信頼できないデータは直接表示しない

3. **API通信**
   - CSRFトークンを必ず含める
   - HTTPSを使用する
   - エラーレスポンスに機密情報を含めない

### 本番環境での追加設定
1. **AWS WAF**の設定
2. **CloudFront**でのセキュリティヘッダー
3. **VPC**内でのLambda実行
4. **詳細なロギング**と監視

## 🧪 テストデータ

### ユーザーデータ
```javascript
[
  {
    id: "1",
    name: "テストユーザー1",
    email: "test1@example.com",
    role: "admin"
  },
  // 他のテストユーザー...
]
```

### 商品データ
```javascript
[
  {
    id: "1",
    name: "セキュア商品A",
    description: "セキュリティが考慮された商品です",
    price: 1000,
    category: "セキュリティ",
    inStock: true
  },
  // 他のテスト商品...
]
```

## 🔄 開発ワークフロー

1. **ローカル開発**
   ```bash
   npm start
   ```

2. **変更のテスト**
   ```bash
   npm test
   ```

3. **バックエンドの更新**
   ```bash
   npm run amplify-push
   ```

4. **本番デプロイ**
   ```bash
   npm run amplify-publish
   ```

## 📚 参考資料

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [OWASP XSS Prevention](https://owasp.org/www-community/xss-filter-evasion-cheatsheet)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)

## ⚠️ 重要な注意事項

- このプロジェクトはデモンストレーション目的です
- 本番環境では追加のセキュリティ対策が必要です
- 実際のユーザーデータは使用しないでください
- 定期的なセキュリティ監査を実施してください

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

セキュリティの改善提案や新機能の追加は歓迎します。プルリクエストを送信する前に、セキュリティガイドラインを確認してください。
