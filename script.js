class FundMonitorApp {
    constructor() {
        this.dataFetcher = new DataFetcher();
        this.calculator = new FundCalculator();
        this.chart = null;
        this.updateInterval = null;
        this.historicalData = [];
        
        this.init();
    }

    async init() {
        // 初始化标签页切换
        this.initTabs();
        
        // 加载初始数据
        await this.loadData();
        
        // 初始化图表
        this.initChart();
        
        // 开始自动更新
        this.startAutoUpdate();
        
        // 更新最后更新时间
        this.updateTime();
    }

    initTabs() {
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                
                // 更新活跃标签
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // 显示对应内容
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === tabId) {
                        content.classList.add('active');
                    }
                });
                
                // 更新图表数据
                this.updateChartForTab(tabId);
            });
        });
    }

    async loadData() {
        try {
            // 显示加载状态
            this.showLoading();
            
            // 获取所有基金数据
            const allFundsData = await this.dataFetcher.fetchAllFundData();
            
            // 更新每个基金的显示
            Object.keys(allFundsData).forEach(fundType => {
                this.updateFundDisplay(fundType, allFundsData[fundType]);
            });
            
            // 更新总资产
            this.updateTotalAssets(allFundsData);
            
            // 更新最后更新时间
            this.updateTime();
            
        } catch (error) {
            console.error('加载数据失败:', error);
            this.showError('数据加载失败，请检查网络连接');
        } finally {
            this.hideLoading();
        }
    }

    updateFundDisplay(fundType, fundData) {
        const fundConfig = FUNDS_CONFIG[fundType];
        const fundSummary = this.calculator.calculateFundSummary(fundData, fundConfig);
        
        const tabContent = document.getElementById(fundType);
        
        // 创建表格
        let tableHTML = `
            <div class="fund-summary">
                <div class="summary-item">
                    <span>当前净值:</span>
                    <strong>${fundSummary.summary.totalCurrentValue.toLocaleString('zh-CN', {
                        style: 'currency',
                        currency: fundConfig.currency
                    })}</strong>
                </div>
                <div class="summary-item ${fundSummary.summary.totalProfit >= 0 ? 'positive' : 'negative'}">
                    <span>累计收益:</span>
                    <strong>${fundSummary.summary.totalProfit >= 0 ? '+' : ''}${fundSummary.summary.totalProfit.toLocaleString('zh-CN', {
                        style: 'currency',
                        currency: fundConfig.currency
                    })} (${fundSummary.summary.totalProfitRate.toFixed(2)}%)</strong>
                </div>
            </div>
            
            <table class="fund-table">
                <thead>
                    <tr>
                        <th>代码</th>
                        <th>名称</th>
                        <th>持仓比例</th>
                        <th>成本价</th>
                        <th>现价</th>
                        <th>当前价值</th>
                        <th>收益率</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        fundSummary.holdings.forEach(holding => {
            tableHTML += `
                <tr>
                    <td class="code">${holding.code}</td>
                    <td>${holding.name}</td>
                    <td>${holding.allocation}</td>
                    <td>${holding.purchasePrice ? holding.purchasePrice.toFixed(3) : '--'}</td>
                    <td>${holding.currentPrice ? holding.currentPrice.toFixed(3) : '--'}</td>
                    <td>${holding.currentValue.toLocaleString('zh-CN', {
                        style: 'currency',
                        currency: fundConfig.currency
                    })}</td>
                    <td class="${holding.profitRate >= 0 ? 'positive' : 'negative'}">
                        ${holding.profitRate >= 0 ? '+' : ''}${holding.profitRate.toFixed(2)}%
                    </td>
                </tr>
            `;
        });
        
        tableHTML += '</tbody></table>';
        tabContent.innerHTML = tableHTML;
    }

    updateTotalAssets(allFundsData) {
        const totalAssets = this.calculator.calculateTotalAssets(allFundsData);
        document.getElementById('total-assets').textContent = 
            `¥ ${totalAssets.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
        
        // 这里可以添加计算今日收益和总收益率的逻辑
        // 简化示例：随机生成一些数据
        const todayProfit = Math.random() * 30000 - 15000;
        const totalReturn = Math.random() * 10 - 5;
        
        document.getElementById('today-profit').textContent = 
            `${todayProfit >= 0 ? '+' : ''} ¥ ${Math.abs(todayProfit).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
        document.getElementById('today-profit').className = 
            `amount ${todayProfit >= 0 ? 'positive' : 'negative'}`;
            
        document.getElementById('total-return').textContent = 
            `${totalReturn >= 0 ? '+' : ''} ${Math.abs(totalReturn).toFixed(2)}%`;
        document.getElementById('total-return').className = 
            `amount ${totalReturn >= 0 ? 'positive' : 'negative'}`;
    }

    initChart() {
        const ctx = document.getElementById('nav-chart').getContext('2d');
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '基金净值',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });
    }

    updateChartForTab(fundType) {
        // 这里可以添加根据选择的基金更新图表的逻辑
        // 简化示例：生成一些模拟数据
        const labels = [];
        const data = [];
        
        for (let i = 30; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('zh-CN'));
            data.push(1 + (Math.random() * 0.1 - 0.05));
        }
        
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data;
        this.chart.data.datasets[0].label = `${fundType.toUpperCase()} 基金净值`;
        this.chart.update();
    }

    updateTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('zh-CN');
        document.getElementById('update-time').textContent = timeStr;
    }

    startAutoUpdate() {
        // 每30秒自动更新一次数据
        this.updateInterval = setInterval(() => {
            this.loadData();
        }, 30000);
    }

    showLoading() {
        // 可以添加加载动画
        console.log('正在加载数据...');
    }

    hideLoading() {
        console.log('数据加载完成');
    }

    showError(message) {
        // 可以添加错误提示
        console.error('错误:', message);
    }
}

// 页面加载完成后启动应用
document.addEventListener('DOMContentLoaded', () => {
    new FundMonitorApp();
});
