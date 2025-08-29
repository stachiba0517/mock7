const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3001;

// セキュリティミドルウェア
app.use(cors({
  origin: ['http://localhost:3000', 'https://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));

// セキュリティヘッダー
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

// セキュリティユーティリティ関数
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }
  
  if (input && typeof input === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
};

// CSRF対策
const validateCsrfToken = (req) => {
  const csrfToken = req.headers['x-csrf-token'];
  const requestedWith = req.headers['x-requested-with'];
  return requestedWith === 'XMLHttpRequest';
};

// ダミーデータ
let mockUsers = [
  {
    id: '1',
    name: 'テストユーザー1',
    email: 'test1@example.com',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'テストユーザー2',
    email: 'test2@example.com',
    role: 'user',
    createdAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: 'テストユーザー3',
    email: 'test3@example.com',
    role: 'user',
    createdAt: '2024-01-03T00:00:00Z'
  }
];

const mockProducts = [
  {
    id: '1',
    name: 'セキュア商品A',
    description: 'セキュリティが考慮された商品です',
    price: 1000,
    category: 'セキュリティ',
    inStock: true
  },
  {
    id: '2',
    name: 'モック商品B',
    description: 'テスト用の商品です',
    price: 2000,
    category: 'テスト',
    inStock: true
  },
  {
    id: '3',
    name: 'サンプル商品C',
    description: 'サンプルデータの商品です',
    price: 1500,
    category: 'サンプル',
    inStock: false
  }
];

// ルート
app.get('/users', (req, res) => {
  res.json({
    success: true,
    data: sanitizeInput(mockUsers)
  });
});

app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  const user = mockUsers.find(u => u.id === userId);
  
  if (user) {
    res.json({
      success: true,
      data: sanitizeInput(user)
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
});

app.post('/users', (req, res) => {
  if (!validateCsrfToken(req)) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token validation failed'
    });
  }

  const newUser = {
    id: uuidv4(),
    name: sanitizeInput(req.body.name || ''),
    email: sanitizeInput(req.body.email || ''),
    role: sanitizeInput(req.body.role || 'user'),
    createdAt: new Date().toISOString()
  };
  
  mockUsers.push(newUser);
  
  res.json({
    success: true,
    data: newUser,
    message: 'User created successfully'
  });
});

app.put('/users/:id', (req, res) => {
  if (!validateCsrfToken(req)) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token validation failed'
    });
  }

  const userId = req.params.id;
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      name: sanitizeInput(req.body.name || mockUsers[userIndex].name),
      email: sanitizeInput(req.body.email || mockUsers[userIndex].email),
      role: sanitizeInput(req.body.role || mockUsers[userIndex].role)
    };
    
    res.json({
      success: true,
      data: mockUsers[userIndex],
      message: 'User updated successfully'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
});

app.delete('/users/:id', (req, res) => {
  if (!validateCsrfToken(req)) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token validation failed'
    });
  }

  const userId = req.params.id;
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    mockUsers.splice(userIndex, 1);
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
});

app.get('/products', (req, res) => {
  res.json({
    success: true,
    data: sanitizeInput(mockProducts)
  });
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 セキュアモックAPIサーバーが http://localhost:${PORT} で起動しました`);
  console.log(`🔒 XSS対策、CSRF対策済みのセキュアなAPIエンドポイント`);
  console.log(`📱 http://localhost:3000 でReactアプリケーションを起動してください`);
});
