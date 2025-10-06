require('dotenv').config(); // 環境変数を読み込む

const express = require('express');
const cors = require('cors');
const subsidiesRouter = require('./routes/subsidies');

// OpenAI APIキーが設定されている場合はOpenAI版を使用
const analysisRouter = process.env.OPENAI_API_KEY 
  ? require('./routes/analysis.openai')
  : require('./routes/analysis');

const app = express();
const PORT = process.env.PORT || 5000;

// 起動時にOpenAI設定を確認
if (process.env.OPENAI_API_KEY) {
  console.log('✅ OpenAI APIが有効です（GPT解析を使用）');
} else {
  console.log('⚠️  OpenAI APIキーが未設定です（基本的な解析を使用）');
  console.log('   server/.envファイルにOPENAI_API_KEYを設定してください');
}

// ミドルウェア
app.use(cors());
app.use(express.json());

// ルーティング
app.use('/api/subsidies', subsidiesRouter);
app.use('/api/analysis', analysisRouter);

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

// ルートエンドポイント
app.get('/', (req, res) => {
  res.json({
    message: '補助金情報APIサーバー',
    version: '1.0.0',
    endpoints: {
      subsidies: '/api/subsidies',
      health: '/health'
    }
  });
});

// 404ハンドラ
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'エンドポイントが見つかりません'
  });
});

// エラーハンドラ
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'サーバーエラーが発生しました'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 サーバーが起動しました: http://localhost:${PORT}`);
  console.log(`📊 API エンドポイント: http://localhost:${PORT}/api/subsidies`);
  console.log(`🔍 HP解析エンドポイント: http://localhost:${PORT}/api/analysis/analyze-website`);
});

