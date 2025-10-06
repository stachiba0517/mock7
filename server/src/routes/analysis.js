const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const mockSubsidies = require('../data/mockSubsidies');

// URLからWebサイトを解析
router.post('/analyze-website', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URLが指定されていません'
      });
    }

    // URLの検証
    let validUrl;
    try {
      validUrl = new URL(url);
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: '有効なURLを入力してください'
      });
    }

    // Webページを取得
    let htmlContent;
    try {
      const response = await axios.get(validUrl.href, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      htmlContent = response.data;
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Webページの取得に失敗しました。URLを確認してください。'
      });
    }

    // HTMLを解析
    const $ = cheerio.load(htmlContent);
    
    // メタ情報を取得
    const title = $('title').text() || '';
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const metaKeywords = $('meta[name="keywords"]').attr('content') || '';
    
    // 本文テキストを取得
    $('script, style, nav, footer, header').remove(); // 不要な要素を除去
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    
    // 見出しを取得
    const headings = [];
    $('h1, h2, h3').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text) headings.push(text);
    });

    // 全テキストを結合
    const allText = `${title} ${metaDescription} ${metaKeywords} ${headings.join(' ')} ${bodyText}`.toLowerCase();
    
    // キーワード抽出とカテゴリ判定
    const profile = extractProfile(allText, title, url);
    
    // マッチング補助金を検索
    const matchedSubsidies = findMatchingSubsidies(profile, mockSubsidies);
    
    res.json({
      success: true,
      data: {
        profile,
        matchedSubsidies,
        analysisDate: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Website analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Webサイトの解析中にエラーが発生しました'
    });
  }
});

// プロファイル抽出関数
function extractProfile(text, title, url) {
  const profile = {
    url,
    title,
    businessType: [],
    keywords: [],
    detectedCategories: [],
    suggestedPrefecture: null,
    confidence: 0
  };

  // 業種判定
  const businessTypes = {
    'IT・ソフトウェア': ['it', 'ソフトウェア', 'アプリ', 'システム', 'web', 'デジタル', 'dx', 'ai', 'プログラミング', '開発'],
    '製造業': ['製造', '工場', '生産', 'もの作り', 'ものづくり', '加工', '機械'],
    '農業': ['農業', '農家', '農産物', '野菜', '果物', '米', '畜産', '農地'],
    '飲食': ['飲食', 'レストラン', 'カフェ', '居酒屋', '食堂', '料理'],
    '小売': ['小売', '販売', 'ショップ', '店舗', 'ec', 'オンラインショップ'],
    '医療・福祉': ['医療', '病院', 'クリニック', '介護', '福祉', 'ケア'],
    '教育': ['教育', '学校', '塾', 'スクール', '研修', '講座'],
    '観光': ['観光', 'ホテル', '旅館', '民泊', 'ツアー', '宿泊'],
    '建設': ['建設', '建築', '土木', 'リフォーム', '工事'],
    'サービス業': ['サービス', 'コンサルティング', 'デザイン', '広告', 'マーケティング']
  };

  for (const [type, keywords] of Object.entries(businessTypes)) {
    const matchCount = keywords.filter(kw => text.includes(kw)).length;
    if (matchCount > 0) {
      profile.businessType.push({
        type,
        confidence: matchCount
      });
    }
  }

  // 信頼度が高い順にソート
  profile.businessType.sort((a, b) => b.confidence - a.confidence);

  // カテゴリ判定
  const categoryKeywords = {
    'DX・デジタル化': ['dx', 'デジタル', 'it化', 'システム', 'オンライン', 'ec', 'web'],
    '省エネ・環境': ['省エネ', '環境', 'エコ', '再生可能', '太陽光', 'sdgs', 'co2'],
    '設備投資': ['設備', '機械', '導入', '購入', '投資', '更新'],
    '人材育成': ['研修', '教育', '育成', '採用', '人材', 'スキルアップ'],
    '新事業': ['新規', '新事業', '創業', '起業','スタートアップ', '新商品'],
    '海外展開': ['輸出', '海外', 'グローバル', '展開', '国際'],
    '研究開発': ['研究', '開発', 'r&d', '技術開発', 'イノベーション'],
    '事業承継': ['事業承継', '後継者', '承継', '世代交代'],
    '働き方改革': ['働き方', 'テレワーク', '在宅', '労働環境', '福利厚生'],
    '販路開拓': ['販路', 'マーケティング', 'pr', '広告', '展示会']
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    const matchCount = keywords.filter(kw => text.includes(kw)).length;
    if (matchCount > 0) {
      profile.detectedCategories.push({
        category,
        confidence: matchCount
      });
    }
  }

  // 信頼度が高い順にソート
  profile.detectedCategories.sort((a, b) => b.confidence - a.confidence);

  // 都道府県判定
  const prefectures = [
    '北海道', '青森', '岩手', '宮城', '秋田', '山形', '福島',
    '茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川',
    '新潟', '富山', '石川', '福井', '山梨', '長野', '岐阜',
    '静岡', '愛知', '三重', '滋賀', '京都', '大阪', '兵庫',
    '奈良', '和歌山', '鳥取', '島根', '岡山', '広島', '山口',
    '徳島', '香川', '愛媛', '高知', '福岡', '佐賀', '長崎',
    '熊本', '大分', '宮崎', '鹿児島', '沖縄'
  ];

  for (const pref of prefectures) {
    if (text.includes(pref)) {
      profile.suggestedPrefecture = pref;
      break;
    }
  }

  // キーワード抽出（頻出単語）
  const words = text.match(/[ぁ-んァ-ヶー一-龯]+/g) || [];
  const wordCount = {};
  words.forEach(word => {
    if (word.length >= 2) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });

  // 頻出上位10件をキーワードとして抽出
  profile.keywords = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  // 全体の信頼度を計算
  const totalMatches = 
    profile.businessType.reduce((sum, item) => sum + item.confidence, 0) +
    profile.detectedCategories.reduce((sum, item) => sum + item.confidence, 0);
  profile.confidence = Math.min(Math.round((totalMatches / 10) * 100), 100);

  return profile;
}

// マッチング補助金を検索
function findMatchingSubsidies(profile, subsidies) {
  const results = subsidies.map(subsidy => {
    let score = 0;
    const reasons = [];

    // カテゴリマッチング
    profile.detectedCategories.forEach(detected => {
      subsidy.category.forEach(cat => {
        if (cat.includes(detected.category) || detected.category.includes(cat)) {
          score += detected.confidence * 10;
          reasons.push(`カテゴリ「${cat}」が一致`);
        }
      });
    });

    // 都道府県マッチング
    if (profile.suggestedPrefecture) {
      if (subsidy.prefecture === profile.suggestedPrefecture) {
        score += 30;
        reasons.push(`対象地域「${profile.suggestedPrefecture}」が一致`);
      } else if (subsidy.prefecture === '全国') {
        score += 10;
        reasons.push('全国対象の補助金');
      }
    }

    // キーワードマッチング
    profile.keywords.forEach(keyword => {
      const subsidyText = `${subsidy.title} ${subsidy.description}`.toLowerCase();
      if (subsidyText.includes(keyword)) {
        score += 5;
        reasons.push(`キーワード「${keyword}」が関連`);
      }
    });

    // 業種マッチング
    profile.businessType.forEach(business => {
      const subsidyText = `${subsidy.title} ${subsidy.description}`.toLowerCase();
      if (subsidyText.includes(business.type.toLowerCase())) {
        score += business.confidence * 8;
        reasons.push(`業種「${business.type}」が関連`);
      }
    });

    // ステータスによる調整
    if (subsidy.status === 'active') {
      score += 10;
    } else if (subsidy.status === 'expired') {
      score = score * 0.3; // 終了した補助金はスコアを下げる
    }

    return {
      subsidy,
      score: Math.round(score),
      matchReasons: reasons.slice(0, 3), // 上位3つの理由のみ
      matchPercentage: Math.min(Math.round((score / 100) * 100), 100)
    };
  });

  // スコアの高い順にソート
  results.sort((a, b) => b.score - a.score);

  // 上位20件のみ返す
  return results.slice(0, 20);
}

module.exports = router;

