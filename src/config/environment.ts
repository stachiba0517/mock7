// 環境設定
export const config = {
  // プロダクション環境では外部のモックAPIサービスを使用
  production: {
    apiEndpoint: 'https://my-json-server.typicode.com/mock-user/secure-mock-api',
    environment: 'production'
  },
  
  // 開発環境ではローカルAPIを使用
  development: {
    apiEndpoint: 'http://localhost:3001',
    environment: 'development'
  }
};

// 現在の環境を判定
export const getCurrentConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? config.production : config.development;
};
