const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// セキュリティヘルパー関数
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    // HTMLエンコードして基本的なXSS攻撃を防ぐ
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

// セキュアなレスポンスヘッダー
const getSecureHeaders = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-CSRF-Token,X-Requested-With',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'"
});

// ダミーデータ
const mockUsers = [
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

// CSRFトークン検証（簡易版）
const validateCsrfToken = (event) => {
  const csrfToken = event.headers['X-CSRF-Token'] || event.headers['x-csrf-token'];
  const requestedWith = event.headers['X-Requested-With'] || event.headers['x-requested-with'];
  
  // 基本的なCSRF対策：XMLHttpRequestヘッダーの確認
  return requestedWith === 'XMLHttpRequest';
};

// レート制限チェック（簡易版）
const checkRateLimit = () => {
  // 実際の本番環境では、DynamoDBやRedisを使用してレート制限を実装
  return true;
};

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // セキュリティチェック
    if (!checkRateLimit()) {
      return {
        statusCode: 429,
        headers: getSecureHeaders(),
        body: JSON.stringify({
          success: false,
          message: 'Rate limit exceeded'
        })
      };
    }

    // OPTIONSリクエストの処理（CORS対応）
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: getSecureHeaders(),
        body: ''
      };
    }

    // POST、PUT、DELETEリクエストのCSRF対策
    if (['POST', 'PUT', 'DELETE'].includes(event.httpMethod)) {
      if (!validateCsrfToken(event)) {
        return {
          statusCode: 403,
          headers: getSecureHeaders(),
          body: JSON.stringify({
            success: false,
            message: 'CSRF token validation failed'
          })
        };
      }
    }

    const path = event.path;
    const method = event.httpMethod;
    const pathParams = event.pathParameters || {};

    let response;

    // ルーティング
    if (path === '/users' && method === 'GET') {
      response = {
        success: true,
        data: sanitizeInput(mockUsers)
      };
    } else if (path.match(/^\/users\/[^\/]+$/) && method === 'GET') {
      const userId = pathParams.id;
      const user = mockUsers.find(u => u.id === userId);
      
      if (user) {
        response = {
          success: true,
          data: sanitizeInput(user)
        };
      } else {
        return {
          statusCode: 404,
          headers: getSecureHeaders(),
          body: JSON.stringify({
            success: false,
            message: 'User not found'
          })
        };
      }
    } else if (path === '/users' && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const newUser = {
        id: uuidv4(),
        name: sanitizeInput(body.name || ''),
        email: sanitizeInput(body.email || ''),
        role: sanitizeInput(body.role || 'user'),
        createdAt: new Date().toISOString()
      };
      
      mockUsers.push(newUser);
      
      response = {
        success: true,
        data: newUser,
        message: 'User created successfully'
      };
    } else if (path.match(/^\/users\/[^\/]+$/) && method === 'PUT') {
      const userId = pathParams.id;
      const body = JSON.parse(event.body || '{}');
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      
      if (userIndex !== -1) {
        mockUsers[userIndex] = {
          ...mockUsers[userIndex],
          name: sanitizeInput(body.name || mockUsers[userIndex].name),
          email: sanitizeInput(body.email || mockUsers[userIndex].email),
          role: sanitizeInput(body.role || mockUsers[userIndex].role)
        };
        
        response = {
          success: true,
          data: mockUsers[userIndex],
          message: 'User updated successfully'
        };
      } else {
        return {
          statusCode: 404,
          headers: getSecureHeaders(),
          body: JSON.stringify({
            success: false,
            message: 'User not found'
          })
        };
      }
    } else if (path.match(/^\/users\/[^\/]+$/) && method === 'DELETE') {
      const userId = pathParams.id;
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      
      if (userIndex !== -1) {
        mockUsers.splice(userIndex, 1);
        response = {
          success: true,
          message: 'User deleted successfully'
        };
      } else {
        return {
          statusCode: 404,
          headers: getSecureHeaders(),
          body: JSON.stringify({
            success: false,
            message: 'User not found'
          })
        };
      }
    } else if (path === '/products' && method === 'GET') {
      response = {
        success: true,
        data: sanitizeInput(mockProducts)
      };
    } else {
      return {
        statusCode: 404,
        headers: getSecureHeaders(),
        body: JSON.stringify({
          success: false,
          message: 'Endpoint not found'
        })
      };
    }

    return {
      statusCode: 200,
      headers: getSecureHeaders(),
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers: getSecureHeaders(),
      body: JSON.stringify({
        success: false,
        message: 'Internal server error'
      })
    };
  }
};
