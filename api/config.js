// iTick API配置
const ITICK_CONFIG = {
    BASE_URL: 'https://api.itick.org',
    TOKEN: 'your_itick_token_here', // 替换为你的实际Token
    HEADERS: {
        'accept': 'application/json',
        'token': 'your_itick_token_here'
    }
};

// 基金配置数据
const FUNDS_CONFIG = {
    'a-share': {
        currency: 'CNY',
        totalAmount: 1000000,
        purchaseDate: '2026-01-04',
        holdings: [
            { code: '513390', name: '纳指100ETF', allocation: 0.25, purchasePrice: null },
            { code: '159652', name: '有色50ETF', allocation: 0.25, purchasePrice: null },
            { code: '588200', name: '科创芯片ETF', allocation: 0.25, purchasePrice: null },
            { code: '515880', name: '通信ETF', allocation: 0.15, purchasePrice: null },
            { code: '518880', name: '黄金ETF', allocation: 0.10, purchasePrice: null }
        ]
    },
    'hk': {
        currency: 'HKD',
        totalAmount: 1000000,
        purchaseDate: '2026-01-04',
        holdings: [
            { code: '03455', name: '纳指100ETF', allocation: 0.25, purchasePrice: null },
            { code: '03132', name: '全球半导体ETF', allocation: 0.20, purchasePrice: null },
            { code: '03147', name: '中国创业板ETF', allocation: 0.20, purchasePrice: null },
            { code: '03110', name: '恒生高股息ETF', allocation: 0.20, purchasePrice: null },
            { code: '02840', name: '黄金ETF', allocation: 0.15, purchasePrice: null }
        ]
    },
    'us': {
        currency: 'USD',
        totalAmount: 1000000,
        purchaseDate: '2026-01-04',
        holdings: [
            { code: 'QQQ', name: '纳指100ETF', allocation: 0.25, purchasePrice: null },
            { code: 'SPY', name: '标普500ETF', allocation: 0.25, purchasePrice: null },
            { code: 'RING', name: '全球黄金矿股ETF', allocation: 0.20, purchasePrice: null },
            { code: 'COPX', name: '全球铜矿股ETF', allocation: 0.20, purchasePrice: null },
            { code: 'BITB', name: '大饼ETF', allocation: 0.10, purchasePrice: null }
        ]
    }
};

// 汇率配置（简化版，实际应从API获取）
const EXCHANGE_RATES = {
    'CNY': 1,
    'HKD': 0.92, // 1 HKD = 0.92 CNY
    'USD': 7.2   // 1 USD = 7.2 CNY
};
