import {PlayerState} from "@/players/states/type";

const dummyPlayerState: PlayerState = {
    userId: 42,
    cashBalance: 3200.0,
    stocks: [
        { symbol: 'AAPL', quantity: 10, category: 'Tech', currentPrice: 160 },
        { symbol: 'MSFT', quantity: 5, category: 'Tech', currentPrice: 300 },
        { symbol: 'XOM', quantity: 8, category: 'Energy', currentPrice: 110 },
        { symbol: 'CVX', quantity: 4, category: 'Energy', currentPrice: 150 },
        { symbol: 'JPM', quantity: 6, category: 'Finance', currentPrice: 130 },
        { symbol: 'GS', quantity: 3, category: 'Finance', currentPrice: 330 },
        { symbol: 'JNJ', quantity: 7, category: 'Healthcare', currentPrice: 145 },
        { symbol: 'PFE', quantity: 9, category: 'Healthcare', currentPrice: 43 },
        { symbol: 'PG', quantity: 5, category: 'Consumer', currentPrice: 150 },
        { symbol: 'KO', quantity: 10, category: 'Consumer', currentPrice: 62 },
    ]
};
