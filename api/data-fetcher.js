class DataFetcher {
    constructor() {
        this.cache = new Map();
        this.cacheDuration = 30000; // 30秒缓存
    }

    // 获取实时报价
    async getRealTimeQuote(region, code) {
        const cacheKey = `${region}_${code}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
            return cached.data;
        }

        try {
            const url = `${ITICK_CONFIG.BASE_URL}/stock/quote?region=${region}&code=${code}`;
            const response = await fetch(url, {
                headers: ITICK_CONFIG.HEADERS
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.code === 0) {
                const result = {
                    symbol: data.data.s,
                    lastPrice: data.data.ld,
                    open: data.data.o,
                    high: data.data.h,
                    low: data.data.l,
                    volume: data.data.v,
                    timestamp: data.data.t
                };
                
                this.cache.set(cacheKey, {
                    data: result,
                    timestamp: Date.now()
                });
                
                return result;
            } else {
                console.error('API Error:', data.msg);
                return null;
            }
        } catch (error) {
            console.error('Fetch error:', error);
            return null;
        }
    }

    // 批量获取基金数据
    async fetchAllFundData() {
        const results = {};
        
        // A股数据
        results['a-share'] = await Promise.all(
            FUNDS_CONFIG['a-share'].holdings.map(async holding => {
                const quote = await this.getRealTimeQuote('SZ', holding.code);
                return {
                    ...holding,
                    currentPrice: quote ? quote.lastPrice : null,
                    quoteData: quote
                };
            })
        );

        // 港股数据
        results['hk'] = await Promise.all(
            FUNDS_CONFIG['hk'].holdings.map(async holding => {
                const quote = await this.getRealTimeQuote('HK', holding.code);
                return {
                    ...holding,
                    currentPrice: quote ? quote.lastPrice : null,
                    quoteData: quote
                };
            })
        );

        // 美股数据
        results['us'] = await Promise.all(
            FUNDS_CONFIG['us'].holdings.map(async holding => {
                const quote = await this.getRealTimeQuote('US', holding.code);
                return {
                    ...holding,
                    currentPrice: quote ? quote.lastPrice : null,
                    quoteData: quote
                };
            })
        );

        return results;
    }

    // 获取历史K线数据（用于净值曲线）
    async getHistoricalData(region, code, days = 30) {
        try {
            const url = `${ITICK_CONFIG.BASE_URL}/stock/kline?region=${region}&code=${code}&kType=10&limit=${days}`;
            const response = await fetch(url, {
                headers: ITICK_CONFIG.HEADERS
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            return data.code === 0 ? data.data : [];
        } catch (error) {
            console.error('Historical data error:', error);
            return [];
        }
    }
}
