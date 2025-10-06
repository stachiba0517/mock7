# OpenAI GPT-4統合セットアップガイド

## 📋 目次
1. [OpenAI APIキーの取得](#openai-apiキーの取得)
2. [環境変数の設定](#環境変数の設定)
3. [動作確認](#動作確認)
4. [コスト管理](#コスト管理)

---

## 🔑 OpenAI APIキーの取得

### 1. OpenAIアカウントの作成

1. [OpenAI Platform](https://platform.openai.com/)にアクセス
2. 「Sign up」をクリックしてアカウントを作成
3. メール認証を完了

### 2. APIキーの発行

1. ログイン後、右上のアイコン → 「API keys」をクリック
2. 「Create new secret key」をクリック
3. キー名を入力（例: `subsidy-system`）
4. **重要**: 表示されたAPIキーをコピー（再表示できません！）
   ```
   sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 3. 支払い方法の設定（必須）

1. 左メニュー「Settings」→「Billing」
2. 「Add payment method」でクレジットカードを登録
3. 使用制限を設定（推奨: $10-20/月）

---

## ⚙️ 環境変数の設定

### 方法1: `.env`ファイルを手動作成（推奨）

1. `server`フォルダに`.env`ファイルを作成

2. 以下の内容を記述：
   ```env
   # OpenAI API設定
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   
   # サーバー設定
   PORT=5000
   ```

3. `xxxxxxxxx`の部分を実際のAPIキーに置き換え

4. **重要**: `.env`ファイルはGitにコミットしないでください
   - すでに`.gitignore`に追加済み

### 方法2: コマンドで作成

PowerShellで実行：
```powershell
cd server
@"
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=5000
"@ | Out-File -FilePath .env -Encoding utf8
```

---

## ✅ 動作確認

### 1. サーバーを再起動

```bash
cd server
npm run dev
```

### 2. 起動メッセージを確認

✅ **成功時**:
```
✅ OpenAI APIが有効です（GPT解析を使用）
🚀 サーバーが起動しました: http://localhost:5000
```

⚠️ **APIキー未設定時**:
```
⚠️  OpenAI APIキーが未設定です（基本的な解析を使用）
   server/.envファイルにOPENAI_API_KEYを設定してください
```

### 3. テスト実行

ブラウザで http://localhost:3001 にアクセスして：

1. 「🎯 HP解析で探す」タブを選択
2. サンプルURLまたは任意のURLを入力
3. 「解析する」ボタンをクリック

**GPT解析が動作すると**:
- より正確な業種判定
- 詳細なキーワード抽出
- 高精度なマッチング

---

## 💰 コスト管理

### 料金体系（2025年10月時点）

| モデル | 入力 | 出力 |
|--------|------|------|
| GPT-4o-mini | $0.150/1M tokens | $0.600/1M tokens |
| GPT-4o | $2.50/1M tokens | $10.00/1M tokens |

### 現在の設定

- **使用モデル**: `gpt-4o-mini`（コスト効率重視）
- **1回の解析**: 約3,000 tokens（入力）+ 500 tokens（出力）
- **推定コスト**: **$0.0008/回**（0.08円/回）

### コスト削減のヒント

1. **テキスト量を制限**（現在2,000文字に制限中）
2. **キャッシュ活用**（同じURLは2回解析しない）
3. **使用制限設定**（OpenAI Platformで月額上限を設定）

### 月間コスト試算

| 解析回数/月 | 推定コスト |
|------------|-----------|
| 100回 | $0.08（約12円） |
| 1,000回 | $0.80（約120円） |
| 10,000回 | $8.00（約1,200円） |

---

## 🔧 トラブルシューティング

### エラー: "Invalid API key"

- APIキーが正しいか確認
- `.env`ファイルの記述に余分なスペースがないか確認
- サーバーを再起動

### エラー: "You exceeded your current quota"

- OpenAI Platformで支払い方法を登録
- または無料クレジットが残っているか確認

### OpenAIを使わずに動作させたい

- `.env`ファイルから`OPENAI_API_KEY`を削除
- 基本的なキーワードマッチングが使用されます

---

## 🚀 GPT-4oへのアップグレード（高精度版）

より高精度な解析が必要な場合：

1. `server/src/routes/analysis.openai.js`を開く

2. 113行目を変更：
   ```javascript
   // 変更前
   model: "gpt-4o-mini",
   
   // 変更後
   model: "gpt-4o",
   ```

3. サーバーを再起動

**注意**: コストが約17倍になります（$0.014/回）

---

## 📚 参考リンク

- [OpenAI Platform](https://platform.openai.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [料金ページ](https://openai.com/api/pricing/)
- [使用状況確認](https://platform.openai.com/usage)

---

## 🎉 完了！

これで、AIによる高精度なWebサイト解析が利用できます！

何か問題があれば、サーバーのログを確認してください。

