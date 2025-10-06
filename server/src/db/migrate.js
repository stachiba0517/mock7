require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// マイグレーション実行
async function migrate() {
  let connection;
  
  try {
    console.log('🚀 データベースマイグレーション開始...');
    
    // データベース接続（DB名なし）
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });
    
    console.log('✅ Aurora Serverlessに接続しました');
    
    // スキーマファイルを読み込み
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    console.log('📄 スキーマファイルを読み込みました');
    
    // スキーマを実行
    await connection.query(schema);
    
    console.log('✅ テーブルを作成しました');
    
    // モックデータの投入
    await seedData(connection);
    
    console.log('✅ マイグレーション完了');
    
  } catch (error) {
    console.error('❌ マイグレーションエラー:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 初期データ投入
async function seedData(connection) {
  console.log('📦 初期データを投入中...');
  
  // モックデータを読み込み
  const mockSubsidies = require('../data/mockSubsidies');
  
  await connection.query(`USE ${process.env.DB_NAME}`);
  
  for (const subsidy of mockSubsidies) {
    // 補助金データ挿入
    await connection.execute(
      `INSERT INTO subsidies 
       (id, title, organization, description, deadline, status, 
        amount_min, amount_max, amount_rate, prefecture, url, source, last_updated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       title = VALUES(title),
       organization = VALUES(organization),
       description = VALUES(description),
       deadline = VALUES(deadline),
       status = VALUES(status),
       amount_max = VALUES(amount_max),
       amount_rate = VALUES(amount_rate),
       prefecture = VALUES(prefecture),
       url = VALUES(url),
       source = VALUES(source)`,
      [
        subsidy.id,
        subsidy.title,
        subsidy.organization,
        subsidy.description,
        subsidy.deadline,
        subsidy.status,
        subsidy.amount.min || null,
        subsidy.amount.max || null,
        subsidy.amount.rate || null,
        subsidy.prefecture,
        subsidy.url,
        subsidy.source,
        subsidy.lastUpdated
      ]
    );
    
    // カテゴリ挿入
    for (const category of subsidy.category) {
      await connection.execute(
        `INSERT INTO subsidy_categories (subsidy_id, category) 
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE category = VALUES(category)`,
        [subsidy.id, category]
      );
    }
    
    // 対象者・要件挿入
    for (let i = 0; i < subsidy.eligibility.length; i++) {
      await connection.execute(
        `INSERT INTO subsidy_eligibility (subsidy_id, eligibility_text, display_order) 
         VALUES (?, ?, ?)`,
        [subsidy.id, subsidy.eligibility[i], i]
      );
    }
    
    console.log(`  ✓ ${subsidy.title}`);
  }
  
  console.log(`✅ ${mockSubsidies.length}件の補助金データを投入しました`);
}

// マイグレーション実行
migrate();

