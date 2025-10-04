// モック補助金データ
const mockSubsidies = [
  {
    id: "subsidy-001",
    title: "小規模事業者持続化補助金（一般型）",
    organization: "福井県商工会連合会",
    description: "小規模事業者が経営計画を作成し、その計画に沿って行う販路開拓の取組等を支援します。",
    deadline: "2025-12-31T23:59:59.000Z",
    status: "active",
    amount: {
      max: 500000,
      rate: "2/3"
    },
    eligibility: [
      "常時使用する従業員が20名以下の法人・個人事業主",
      "商業・サービス業(宿泊業・娯楽業を除く)の場合は5人以下"
    ],
    category: ["販路開拓", "経営計画"],
    prefecture: "福井県",
    url: "https://www.shokokai-fukui.or.jp/hojokin",
    lastUpdated: "2025-10-03T00:00:00.000Z",
    source: "福井県商工会連合会"
  },
  {
    id: "subsidy-002",
    title: "事業再構築補助金",
    organization: "中小企業庁",
    description: "新分野展開や業態転換、事業・業種転換等の取組、事業再編又はこれらの取組を通じた規模の拡大を目指す小規模事業者・中小企業等の新たな挑戦を支援します。",
    deadline: "2025-11-30T23:59:59.000Z",
    status: "active",
    amount: {
      min: 1000000,
      max: 60000000,
      rate: "2/3"
    },
    eligibility: [
      "申請前の直近6か月間のうち、任意の3か月の合計売上高が、コロナ以前と比較して10％以上減少している事業者",
      "事業計画を認定経営革新等支援機関と策定すること",
      "補助事業終了後3～5年で付加価値額の年率平均3.0％以上増加する見込みの事業計画を作成する事業者"
    ],
    category: ["事業転換", "新分野展開", "業態転換"],
    prefecture: "全国",
    url: "https://www.shokokai-fukui.or.jp/hojokin",
    lastUpdated: "2025-10-03T00:00:00.000Z",
    source: "福井県商工会連合会"
  },
  {
    id: "subsidy-003",
    title: "ものづくり・商業・サービス生産性向上促進補助金（一般型）",
    organization: "全国中小企業団体中央会",
    description: "生産性向上に資する革新的サービス開発・試作品開発・生産プロセスの改善を行う中小企業・小規模事業者等の設備投資等を支援します。",
    deadline: "2025-10-31T23:59:59.000Z",
    status: "active",
    amount: {
      max: 10000000,
      rate: "中小企業1/2、小規模事業者等2/3"
    },
    eligibility: [
      "付加価値額を年率3％以上増加させる事業計画を策定している事業者",
      "給与支給総額を年率1.5％以上増加させる計画がある事業者",
      "事業場内最低賃金が地域別最低賃金＋30円以上の水準である事業者"
    ],
    category: ["設備投資", "生産性向上", "試作品開発"],
    prefecture: "全国",
    url: "https://www.shokokai-fukui.or.jp/hojokin",
    lastUpdated: "2025-10-03T00:00:00.000Z",
    source: "福井県商工会連合会"
  },
  {
    id: "subsidy-004",
    title: "ものづくり・商業・サービス生産性向上促進補助金（グローバル展開型）",
    organization: "全国中小企業団体中央会",
    description: "海外事業の拡大・強化等を目的とした設備投資等を支援します。",
    deadline: "2025-10-31T23:59:59.000Z",
    status: "active",
    amount: {
      max: 30000000,
      rate: "中小企業1/2、小規模事業者等2/3"
    },
    eligibility: [
      "海外事業の拡大・強化等を目的とした事業計画を策定している事業者",
      "付加価値額を年率3％以上増加させる計画がある事業者"
    ],
    category: ["設備投資", "海外展開", "グローバル"],
    prefecture: "全国",
    url: "https://www.shokokai-fukui.or.jp/hojokin",
    lastUpdated: "2025-10-03T00:00:00.000Z",
    source: "福井県商工会連合会"
  },
  {
    id: "subsidy-005",
    title: "IT導入補助金",
    organization: "一般社団法人サービスデザイン推進協議会",
    description: "中小企業・小規模事業者等が、新たに生産性向上に貢献するためのITツール・ソフトウェアの導入を支援します。",
    deadline: "2026-01-31T23:59:59.000Z",
    status: "active",
    amount: {
      min: 300000,
      max: 4500000,
      rate: "通常枠1/2、低感染リスク型ビジネス枠2/3"
    },
    eligibility: [
      "中小企業・小規模事業者等",
      "飲食、宿泊、小売・卸、運輸、医療、介護、保育等のサービス業",
      "製造業や建築業等も対象"
    ],
    category: ["IT導入", "デジタル化", "生産性向上"],
    prefecture: "全国",
    url: "https://www.shokokai-fukui.or.jp/hojokin",
    lastUpdated: "2025-10-03T00:00:00.000Z",
    source: "福井県商工会連合会"
  },
  {
    id: "subsidy-006",
    title: "福井県中小企業デジタル化支援補助金",
    organization: "福井県",
    description: "県内中小企業のDX推進を支援し、業務効率化やデータ活用による競争力強化を図ります。",
    deadline: "2025-12-20T23:59:59.000Z",
    status: "active",
    amount: {
      max: 2000000,
      rate: "1/2"
    },
    eligibility: [
      "福井県内に事業所を有する中小企業",
      "デジタル化による業務改善計画を策定している事業者"
    ],
    category: ["DX推進", "デジタル化", "業務効率化"],
    prefecture: "福井県",
    url: "https://www.pref.fukui.lg.jp/doc/sanroubu/shien.html",
    lastUpdated: "2025-10-03T00:00:00.000Z",
    source: "福井県庁"
  },
  {
    id: "subsidy-007",
    title: "福井県事業承継支援補助金",
    organization: "福井県",
    description: "事業承継に伴う設備投資や販路開拓等の取組を支援し、県内企業の円滑な事業承継を促進します。",
    deadline: "2025-11-15T23:59:59.000Z",
    status: "active",
    amount: {
      max: 3000000,
      rate: "2/3"
    },
    eligibility: [
      "福井県内で事業承継を予定または実施した中小企業",
      "事業承継後3年以内の事業者"
    ],
    category: ["事業承継", "後継者支援"],
    prefecture: "福井県",
    url: "https://www.pref.fukui.lg.jp/doc/sanroubu/shien.html",
    lastUpdated: "2025-10-03T00:00:00.000Z",
    source: "福井県庁"
  },
  {
    id: "subsidy-008",
    title: "福井県若手人材確保支援補助金",
    organization: "福井県",
    description: "若手人材の採用活動や定着支援の取組に対して補助します。",
    deadline: "2026-02-28T23:59:59.000Z",
    status: "active",
    amount: {
      max: 1000000,
      rate: "1/2"
    },
    eligibility: [
      "福井県内の中小企業",
      "35歳以下の正社員採用を計画している事業者"
    ],
    category: ["人材確保", "雇用", "若手支援"],
    prefecture: "福井県",
    url: "https://www.pref.fukui.lg.jp/doc/sanroubu/shien.html",
    lastUpdated: "2025-10-03T00:00:00.000Z",
    source: "福井県庁"
  },
  {
    id: "subsidy-009",
    title: "環境配慮型ビジネス推進補助金",
    organization: "福井県",
    description: "脱炭素化やSDGsに貢献するビジネスモデルの構築を支援します。",
    deadline: "2025-09-30T23:59:59.000Z",
    status: "expired",
    amount: {
      max: 5000000,
      rate: "1/2"
    },
    eligibility: [
      "福井県内の中小企業",
      "環境負荷低減に資する事業計画を有する事業者"
    ],
    category: ["環境", "SDGs", "脱炭素"],
    prefecture: "福井県",
    url: "https://www.pref.fukui.lg.jp/doc/sanroubu/shien.html",
    lastUpdated: "2025-10-03T00:00:00.000Z",
    source: "福井県庁"
  },
  {
    id: "subsidy-010",
    title: "地域活性化起業支援補助金",
    organization: "福井県",
    description: "地域課題解決や地域活性化に資する新規創業を支援します。",
    deadline: "2026-03-31T23:59:59.000Z",
    status: "upcoming",
    amount: {
      max: 2000000,
      rate: "2/3"
    },
    eligibility: [
      "福井県内で新規創業予定の個人・法人",
      "地域課題解決型のビジネスモデルを有する事業者"
    ],
    category: ["創業支援", "地域活性化", "起業"],
    prefecture: "福井県",
    url: "https://www.pref.fukui.lg.jp/doc/sanroubu/shien.html",
    lastUpdated: "2025-10-03T00:00:00.000Z",
    source: "福井県庁"
  }
];

module.exports = mockSubsidies;

