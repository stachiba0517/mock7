const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const OpenAI = require('openai');
const mockSubsidies = require('../data/mockSubsidies');

// OpenAI初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// URLからWebサイトを解析（OpenAI統合版）
router.post('/analyze-website', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URLが指定されていません'
      });
    }

    // OpenAI APIキーの確認
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OPENAI_API_KEYが設定されていません。基本的な解析を使用します。');
      return res.status(500).json({
        success: false,
        error: 'OpenAI APIキーが設定されていません。server/.envファイルにOPENAI_API_KEYを設定してください。'
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
    $('script, style, nav, footer, header').remove();
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    
    // 見出しを取得
    const headings = [];
    $('h1, h2, h3').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text) headings.push(text);
    });

    // テキストを3000文字に制限（APIコスト削減）
    const combinedText = `
タイトル: ${title}
説明: ${metaDescription}
見出し: ${headings.join(', ')}
本文: ${bodyText.substring(0, 2000)}
    `.trim();

    console.log('🤖 OpenAI GPTで解析中...');

    // OpenAI GPTで解析
    const aiAnalysis = await analyzeWithOpenAI(combinedText, url);
    
    // マッチング補助金を検索
    const matchedSubsidies = findMatchingSubsidies(aiAnalysis, mockSubsidies);
    
    res.json({
      success: true,
      data: {
        profile: aiAnalysis,
        matchedSubsidies,
        analysisDate: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Website analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Webサイトの解析中にエラーが発生しました'
    });
  }
});

// OpenAI GPTで解析
async function analyzeWithOpenAI(text, url) {
  const prompt = `
あなたは企業の事業内容を分析する専門家です。以下のWebページの内容を分析して、JSON形式で回答してください。

【Webページ内容】
${text}

以下の情報を抽出してください：

1. **業種** (businessTypes): 最も適切な業種を3つまで選択し、それぞれに信頼度（1-10）を付けてください
   例: [{"type": "IT・ソフトウェア", "confidence": 9}, {"type": "サービス業", "confidence": 7}]
   
2. **事業カテゴリ** (detectedCategories): 以下から該当するものを最大5つ選択し、信頼度を付けてください
   - DX・デジタル化
   - 省エネ・環境
   - 設備投資
   - 人材育成
   - 新事業
   - 海外展開
   - 研究開発
   - 事業承継
   - 働き方改革
   - 販路開拓
   
3. **キーワード** (keywords): 事業に関連する重要なキーワードを10個抽出
   
4. **都道府県** (suggestedPrefecture): 所在地の都道府県（不明な場合はnull）

5. **信頼度** (confidence): 全体の分析の信頼度（0-100）

JSON形式で回答してください：
\`\`\`json
{
  "url": "${url}",
  "title": "企業名または事業名",
  "businessType": [
    {"type": "業種名", "confidence": 数値}
  ],
  "detectedCategories": [
    {"category": "カテゴリ名", "confidence": 数値}
  ],
  "keywords": ["キーワード1", "キーワード2", ...],
  "suggestedPrefecture": "都道府県名またはnull",
  "confidence": 数値
}
\`\`\`
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // コスト削減のためminiモデル使用（gpt-4oに変更可能）
      messages: [
        {
          role: "system",
          content: "あなたは日本の企業・事業内容を分析する専門家です。与えられた情報から正確に業種やカテゴリを判定してください。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3 // 一貫性のある結果を得るため低めに設定
    });

    const result = JSON.parse(completion.choices[0].message.content);
    
    console.log('✅ OpenAI解析完了:', {
      businessTypes: result.businessType?.length || 0,
      categories: result.detectedCategories?.length || 0,
      keywords: result.keywords?.length || 0,
      confidence: result.confidence
    });

    return result;
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('AI解析に失敗しました: ' + error.message);
  }
}

// マッチング補助金を検索
function findMatchingSubsidies(profile, subsidies) {
  const results = subsidies.map(subsidy => {
    let score = 0;
    const reasons = [];

    // カテゴリマッチング（AIの判定を重視）
    if (profile.detectedCategories) {
      profile.detectedCategories.forEach(detected => {
        subsidy.category.forEach(cat => {
          if (cat.includes(detected.category) || detected.category.includes(cat)) {
            const matchScore = detected.confidence * 15; // 信頼度に応じてスコアを調整
            score += matchScore;
            reasons.push(`カテゴリ「${cat}」が一致（信頼度: ${detected.confidence}/10）`);
          }
        });
      });
    }

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
    if (profile.keywords) {
      profile.keywords.forEach(keyword => {
        const subsidyText = `${subsidy.title} ${subsidy.description}`.toLowerCase();
        if (subsidyText.includes(keyword.toLowerCase())) {
          score += 5;
          if (reasons.length < 5) { // 理由は最大5個まで
            reasons.push(`キーワード「${keyword}」が関連`);
          }
        }
      });
    }

    // 業種マッチング（AIの判定を重視）
    if (profile.businessType) {
      profile.businessType.forEach(business => {
        const subsidyText = `${subsidy.title} ${subsidy.description} ${subsidy.eligibility.join(' ')}`.toLowerCase();
        if (subsidyText.includes(business.type.toLowerCase())) {
          const matchScore = business.confidence * 10;
          score += matchScore;
          reasons.push(`業種「${business.type}」が関連（信頼度: ${business.confidence}/10）`);
        }
      });
    }

    // 全体の信頼度による調整
    if (profile.confidence) {
      score = score * (profile.confidence / 100);
    }

    // ステータスによる調整
    if (subsidy.status === 'active') {
      score += 10;
    } else if (subsidy.status === 'expired') {
      score = score * 0.3;
    }

    // 重複する理由を削除
    const uniqueReasons = [...new Set(reasons)];

    return {
      subsidy,
      score: Math.round(score),
      matchReasons: uniqueReasons.slice(0, 3),
      matchPercentage: Math.min(Math.round((score / 100) * 100), 100)
    };
  });

  // スコアの高い順にソート
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, 20);
}

module.exports = router;

