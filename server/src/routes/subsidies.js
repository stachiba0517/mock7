const express = require('express');
const router = express.Router();
const mockSubsidies = require('../data/mockSubsidies');

// 全補助金を取得
router.get('/', (req, res) => {
  try {
    const { status, category, prefecture, search } = req.query;
    
    let filteredSubsidies = [...mockSubsidies];
    
    // ステータスでフィルタリング
    if (status) {
      filteredSubsidies = filteredSubsidies.filter(s => s.status === status);
    }
    
    // カテゴリでフィルタリング
    if (category) {
      filteredSubsidies = filteredSubsidies.filter(s => 
        s.category.some(cat => cat.includes(category))
      );
    }
    
    // 都道府県でフィルタリング
    if (prefecture) {
      filteredSubsidies = filteredSubsidies.filter(s => 
        s.prefecture === prefecture || s.prefecture === '全国'
      );
    }
    
    // キーワード検索
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSubsidies = filteredSubsidies.filter(s => 
        s.title.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower) ||
        s.organization.toLowerCase().includes(searchLower)
      );
    }
    
    // 有効期限でソート（近い順）
    filteredSubsidies.sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
    
    res.json({
      success: true,
      count: filteredSubsidies.length,
      data: filteredSubsidies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 特定の補助金を取得
router.get('/:id', (req, res) => {
  try {
    const subsidy = mockSubsidies.find(s => s.id === req.params.id);
    
    if (!subsidy) {
      return res.status(404).json({
        success: false,
        error: '補助金が見つかりません'
      });
    }
    
    res.json({
      success: true,
      data: subsidy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// カテゴリ一覧を取得
router.get('/meta/categories', (req, res) => {
  try {
    const categories = [...new Set(mockSubsidies.flatMap(s => s.category))];
    res.json({
      success: true,
      data: categories.sort()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 都道府県一覧を取得
router.get('/meta/prefectures', (req, res) => {
  try {
    const prefectures = [...new Set(mockSubsidies.map(s => s.prefecture))];
    res.json({
      success: true,
      data: prefectures.sort()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

