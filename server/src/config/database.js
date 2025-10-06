require('dotenv').config();
const mysql = require('mysql2/promise');

// データベース接続プール設定
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// 接続プールの作成
let pool = null;

const getPool = () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    console.log('✅ Aurora Serverless接続プールを作成しました');
  }
  return pool;
};

// データベース接続テスト
const testConnection = async () => {
  try {
    const connection = await getPool().getConnection();
    console.log('✅ Aurora Serverlessに正常に接続しました');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ データベース接続エラー:', error.message);
    return false;
  }
};

// クエリ実行ヘルパー
const query = async (sql, params = []) => {
  try {
    const [rows] = await getPool().execute(sql, params);
    return rows;
  } catch (error) {
    console.error('クエリ実行エラー:', error);
    throw error;
  }
};

// トランザクション実行ヘルパー
const transaction = async (callback) => {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getPool,
  testConnection,
  query,
  transaction
};

