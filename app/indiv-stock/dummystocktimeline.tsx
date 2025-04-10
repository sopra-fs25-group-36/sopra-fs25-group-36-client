import {StockPriceEntry} from "@/indiv-stock/stock";

export const dummyStockTimeline: StockPriceEntry[] = [];

// WHAT THIS OUTPUTS:
// [
//     { date: '2025-04-01', symbol: 'AAPL', category: 'Tech', price: 101.0 },
//     { date: '2025-04-01', symbol: 'MSFT', category: 'Tech', price: 111.0 },
//     ...
//         { date: '2025-04-02', symbol: 'AAPL', category: 'Tech', price: 102.5 },
//     ...
// ]

const categories = {
    Tech: ['AAPL', 'MSFT'],
    Energy: ['XOM', 'CVX'],
    Finance: ['JPM', 'GS'],
    Healthcare: ['PFE', 'JNJ'],
    Consumer: ['PG', 'KO']
};

const baseDate = new Date('2025-04-01');

Object.entries(categories).forEach(([category, symbols]) => {
    symbols.forEach((symbol, stockIndex) => {
        for (let day = 0; day < 10; day++) {
            const date = new Date(baseDate);
            date.setDate(baseDate.getDate() + day);
            const isoDate = date.toISOString().split('T')[0];

            dummyStockTimeline.push({
                date: isoDate,
                symbol,
                category,
                price: generateMockPrice(stockIndex, day)
            });
        }
    });
});

function generateMockPrice(stockIndex: number, day: number): number {
    const base = 100 + stockIndex * 10;
    const volatility = 1 + Math.sin(day / 2); // just for variation
    return parseFloat((base + day * volatility).toFixed(2));
}
