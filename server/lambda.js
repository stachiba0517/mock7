// AWS Lambda用のエントリーポイント
const serverlessExpress = require('aws-serverless-express');
const express = require('express');
const cors = require('cors');
const subsidiesRouter = require('./src/routes/subsidies');
const analysisRouter = require('./src/routes/analysis');

const app = express();

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

// Lambda用にエクスポート
const server = serverlessExpress.createServer(app);

exports.handler = (event, context) => {
  serverlessExpress.proxy(server, event, context);
};

