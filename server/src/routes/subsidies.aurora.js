const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 全補助金を取得（Aurora Serverless版）
router.get('/', async (req, res) => {
  try {
    const { status, category, prefecture, search } = req.query;
    
    let sql = `
      SELECT DISTINCT
        s.id,
        s.title,
        s.organization,
        s.description,
        s.deadline,
        s.status,
        s.amount_min,
        s.amount_max,
        s.amount_rate,
        s.prefecture,
        s.url,
        s.source,
        s.last_updated,
        GROUP_CONCAT(DISTINCT sc.category) as categories,
        GROUP_CONCAT(DISTINCT se.eligibility_text ORDER BY se.display_order SEPARATOR '|||') as eligibility
      FROM subsidies s
      LEFT JOIN subsidy_categories sc ON s.id = sc.subsidy_id
      LEFT JOIN subsidy_eligibility se ON s.id = se.subsidy_id
      WHERE 1=1
    `;
    
    const params = [];
    
    // ステータスフィルター
    if (status) {
      sql += ' AND s.status = ?';
      params.push(status);
    }
    
    // カテゴリフィルター
    if (category) {
      sql += ' AND sc.category LIKE ?';
      params.push(`%${category}%`);
    }
    
    // 都道府県フィルター
    if (prefecture) {
      sql += ' AND (s.prefecture = ? OR s.prefecture = "全国")';
      params.push(prefecture);
    }
    
    // キーワード検索（全文検索）
    if (search) {
      sql += ' AND (s.title LIKE ? OR s.description LIKE ? OR s.organization LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    sql += ' GROUP BY s.id ORDER BY s.deadline ASC';
    
    const rows = await db.query(sql, params);
    
    // データ整形
    const subsidies = rows.map(row => ({
      id: row.id,
      title: row.title,
      organization: row.organization,
      description: row.description,
      deadline: row.deadline,
      status: row.status,
      amount: {
        min: row.amount_min,
        max: row.amount_max,
        rate: row.amount_rate
      },
      eligibility: row.eligibility ? row.eligibility.split('|||') : [],
      category: row.categories ? row.categories.split(',') : [],
      prefecture: row.prefecture,
      url: row.url,
      lastUpdated: row.last_updated,
      source: row.source
    }));
    
    // 検索ログを記録（非同期、エラーは無視）
    if (search || status || category || prefecture) {
      db.query(
        `INSERT INTO search_logs (search_keyword, status, category, prefecture, results_count)
         VALUES (?, ?, ?, ?, ?)`,
        [search || '', status || '', category || '', prefecture || '', subsidies.length]
      ).catch(() => {});
    }
    
    res.json({
      success: true,
      count: subsidies.length,
      data: subsidies
    });
  } catch (error) {
    console.error('補助金取得エラー:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 特定の補助金を取得
router.get('/:id', async (req, res) => {
  try {
    const sql = `
      SELECT 
        s.*,
        GROUP_CONCAT(DISTINCT sc.category) as categories,
        GROUP_CONCAT(DISTINCT se.eligibility_text ORDER BY se.display_order SEPARATOR '|||') as eligibility
      FROM subsidies s
      LEFT JOIN subsidy_categories sc ON s.id = sc.subsidy_id
      LEFT JOIN subsidy_eligibility se ON s.id = se.subsidy_id
      WHERE s.id = ?
      GROUP BY s.id
    `;
    
    const rows = await db.query(sql, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '補助金が見つかりません'
      });
    }
    
    const row = rows[0];
    const subsidy = {
      id: row.id,
      title: row.title,
      organization: row.organization,
      description: row.description,
      deadline: row.deadline,
      status: row.status,
      amount: {
        min: row.amount_min,
        max: row.amount_max,
        rate: row.amount_rate
      },
      eligibility: row.eligibility ? row.eligibility.split('|||') : [],
      category: row.categories ? row.categories.split(',') : [],
      prefecture: row.prefecture,
      url: row.url,
      lastUpdated: row.last_updated,
      source: row.source
    };
    
    // アクセスログを記録（非同期、エラーは無視）
    db.query(
      `INSERT INTO access_logs (subsidy_id, action, ip_address)
       VALUES (?, 'view', ?)`,
      [req.params.id, req.ip]
    ).catch(() => {});
    
    res.json({
      success: true,
      data: subsidy
    });
  } catch (error) {
    console.error('補助金取得エラー:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// カテゴリ一覧を取得
router.get('/meta/categories', async (req, res) => {
  try {
    const rows = await db.query(
      'SELECT DISTINCT category FROM subsidy_categories ORDER BY category'
    );
    
    const categories = rows.map(row => row.category);
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('カテゴリ取得エラー:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 都道府県一覧を取得
router.get('/meta/prefectures', async (req, res) => {
  try {
    const rows = await db.query(
      'SELECT DISTINCT prefecture FROM subsidies ORDER BY prefecture'
    );
    
    const prefectures = rows.map(row => row.prefecture);
    
    res.json({
      success: true,
      data: prefectures
    });
  } catch (error) {
    console.error('都道府県取得エラー:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

