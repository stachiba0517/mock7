const express = require('express');
const cors = require('cors');
const subsidiesRouter = require('./routes/subsidies');

const app = express();
const PORT = process.env.PORT || 5000;

// ミドルウェア
app.use(cors());
app.use(express.json());

// ルーティング
app.use('/api/subsidies', subsidiesRouter);

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
});

