# 💻 新しい環境でのセットアップガイド

このガイドは、別のPC（ノートPCなど）で初めてプロジェクトをセットアップする際の手順です。

## 📋 前提条件

- Node.js 16.x 以上がインストールされていること
- Git がインストールされていること
- インターネット接続があること

## 🚀 セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/stachiba0517/mock7.git
cd mock7
```

### 2. フロントエンドの依存関係をインストール

```bash
npm install
```

### 3. バックエンドの依存関係をインストール

```bash
cd server
npm install
cd ..
```

### 4. 環境変数ファイルの作成

#### Windows (PowerShell):
```powershell
# server/.env ファイルを作成
@"
# OpenAI API設定（オプション）
OPENAI_API_KEY=

# サーバー設定
PORT=5000
"@ | Set-Content -Path "server\.env" -Encoding UTF8
```

#### Mac/Linux:
```bash
# server/.env ファイルを作成
cat > server/.env << EOF
# OpenAI API設定（オプション）
OPENAI_API_KEY=

# サーバー設定
PORT=5000
EOF
```

または、手動で作成：
```bash
cd server
cp .env.example .env
# エディタで .env を開いて必要な値を入力
```

### 5. サーバーの起動確認

```bash
cd server
npm run dev
```

以下のメッセージが表示されればOK：
```
🚀 サーバーが起動しました: http://localhost:5000
📊 API エンドポイント: http://localhost:5000/api/subsidies
🔍 HP解析エンドポイント: http://localhost:5000/api/analysis/analyze-website
```

### 6. フロントエンドの起動（別ターミナル）

新しいターミナルを開いて：

```bash
npm start
```

ブラウザが自動的に開き、`http://localhost:3000` でアプリが表示されます。

---

## 🔧 トラブルシューティング

### ポート3000が既に使用されている場合

```bash
# 環境変数でポートを変更
# Windows PowerShell:
$env:PORT=3001; npm start

# Mac/Linux:
PORT=3001 npm start
```

### ポート5000が既に使用されている場合

`server/.env` ファイルを編集：
```env
PORT=5001
```

### Node.jsのバージョンエラー

```bash
# バージョン確認
node --version

# 推奨バージョン: 16.x 以上
```

### npm installがエラーになる場合

```bash
# キャッシュをクリア
npm cache clean --force

# 再インストール
rm -rf node_modules package-lock.json
npm install
```

---

## 🎯 OpenAI API（オプション）

高精度なWebサイト解析を使用する場合：

1. https://platform.openai.com/api-keys でAPIキーを取得
2. `server/.env` ファイルの `OPENAI_API_KEY` に設定
3. サーバーを再起動

詳細は `OPENAI_SETUP.md` を参照してください。

---

## ✅ セットアップ確認

すべて正常に動作していれば：

1. **バックエンド**: http://localhost:5000 で API にアクセス可能
2. **フロントエンド**: http://localhost:3000 でアプリが表示される
3. HP解析機能が動作する

---

## 📝 開発時の注意事項

### .envファイルについて

- `.env` ファイルは **Gitにコミットされません**
- 新しい環境では必ず作成が必要
- APIキーなどの機密情報が含まれるため

### node_modulesについて

- `node_modules` フォルダも **Gitにコミットされません**
- 新しい環境では必ず `npm install` が必要

### 依存関係の更新

```bash
# フロントエンド
npm install

# バックエンド
cd server
npm install
```

---

## 🚀 ワンライナーセットアップ（Windows）

全自動セットアップスクリプト：

```powershell
git clone https://github.com/stachiba0517/mock7.git; cd mock7; npm install; cd server; npm install; @"
OPENAI_API_KEY=
PORT=5000
"@ | Set-Content .env -Encoding UTF8; npm run dev
```

別ターミナルでフロントエンド起動：
```powershell
npm start
```

---

困ったことがあれば、このファイルの内容を確認してください！

