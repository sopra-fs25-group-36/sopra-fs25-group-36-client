export interface StockHoldingDTO {
    symbol: string;
    quantity: number;
    category: string;
    currentPrice: number;
}

export interface TransactionDTO {
    stockId: string;
    quantity: number;
    price: number;
    type: "BUY" | "SELL";
}

export interface PlayerStateDTO {
    userId: string;
    cashBalance: number;
    stocks: StockHoldingDTO[];
    transactionHistory: TransactionDTO[];
}
