require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/database');

// Aurora版のルーターをインポート
const subsidiesRouter = require('./routes/subsidies.aurora');

const app = express();
const PORT = process.env.PORT || 5000;

// ミドルウェア
app.use(cors());
app.use(express.json());

// データベース接続テスト
db.testConnection().then(connected => {
  if (!connected) {
    console.error('⚠️  データベースに接続できません。環境変数を確認してください。');
  }
});

// ルーティング
app.use('/api/subsidies', subsidiesRouter);

// ヘルスチェック
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ 
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ルートエンドポイント
app.get('/', (req, res) => {
  res.json({
    message: '補助金情報APIサーバー (Aurora Serverless版)',
    version: '2.0.0',
    database: 'Aurora Serverless MySQL',
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
  console.log(`🗄️  データベース: Aurora Serverless`);
});

