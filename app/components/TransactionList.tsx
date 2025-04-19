"use client";

import { InputNumber, Button, Typography, message, Spin, Modal } from "antd"; // Import Spin, Modal
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGame } from "@/hooks/useGame";
import { useApi } from "@/hooks/useApi";

import { StockPriceGetDTO } from "@/types/stock";
import StockChart from "@/components/StockChart"; // Import the chart component
import { StockDataPointDTO } from "@/types/chart"; // Import the DTO type for chart data

interface TransactionListProps {
    onToggleLayout: () => void;
}

// --- MAIN TransactionPage COMPONENT (Modified) ---
const TransactionPage: React.FC<TransactionListProps> = ({ onToggleLayout }) => {
    const router = useRouter();
    const { id } = useParams();
    const gameId = Number(id);
    const api = useApi();
    const apiService = useApi();
    const { round, timer } = useGame(gameId);
    const currentUserId = localStorage.getItem("id");

    // State for transactions
    const [buyAmounts, setBuyAmounts] = useState<{ [symbol: string]: number }>({});
    const [sellAmounts, setSellAmounts] = useState<{ [symbol: string]: number }>({});

    // State for current round stock list
    const [currentStocks, setCurrentStocks] = useState<StockPriceGetDTO[]>([]);
    const [categories, setCategories] = useState<{ [category: string]: StockPriceGetDTO[] }>({}); // Store categorized API data
    const [isLoading, setIsLoading] = useState(true);

    // State for Chart Modal
    const [selectedStockSymbol, setSelectedStockSymbol] = useState<string | null>(null);
    const [chartData, setChartData] = useState<StockDataPointDTO[]>([]);
    const [isChartLoading, setIsChartLoading] = useState<boolean>(false);
    const [chartError, setChartError] = useState<string | null>(null);

    // Fetch current round stock data
    useEffect(() => {
        const fetchStockData = async () => {
            if (!gameId || isNaN(gameId)) {
                setIsLoading(false);
                message.error("Invalid Game ID.");
                return;
            }
            setIsLoading(true);
            setCurrentStocks([]);
            setCategories({});

            try {
                const data = await api.get<StockPriceGetDTO[]>(`/api/stocks/${gameId}/stocks`);
                setCurrentStocks(data); // Keep the flat list if needed elsewhere

                // Categorize the fetched data (using your existing logic)
                const defaultCategories: { [category: string]: string[] } = {
                    TECH: ["AAPL", "TSLA", "AMZN", "MSFT", "NVDA", "GOOG", "INTC", "NFLX", "AMD"],
                    ENERGY: ["XOM", "CVX"],
                    FINANCE: ["JPM", "GS"],
                    HEALTHCARE: ["PFE", "JNJ"],
                    CONSUMER: ["PG"],
                    // Add IBM if it's consistently part of your game stocks
                    MISC: ["IBM"] // Example if IBM doesn't fit others
                };

                const categorizedData: { [category: string]: StockPriceGetDTO[] } = {};
                const apiSymbols = new Set(data.map(item => item.symbol));

                for (const [category, symbolsInCategory] of Object.entries(defaultCategories)) {
                    const stocksInCategory = data.filter(stock =>
                        symbolsInCategory.includes(stock.symbol)
                    );
                    if (stocksInCategory.length > 0) {
                        categorizedData[category] = stocksInCategory.sort((a, b) => a.symbol.localeCompare(b.symbol)); // Sort within category
                    }
                }
                // Handle stocks from API not in default categories (optional)
                const uncategorized = data.filter(stock =>
                    !Object.values(defaultCategories).flat().includes(stock.symbol)
                );
                if (uncategorized.length > 0) {
                    categorizedData['OTHER'] = uncategorized.sort((a, b) => a.symbol.localeCompare(b.symbol));
                }


                setCategories(categorizedData);
                console.log('Categorized stock data:', categorizedData);

            } catch (err) {
                console.error("Failed to fetch stock data", err);
                message.error("Could not load stock data for this round.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStockData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api, gameId, round]); // Rerun when gameId changes

    const handleAmountChange = (symbol: string, value: number | null, type: "buy" | "sell") => {
        const setter = type === "buy" ? setBuyAmounts : setSellAmounts;
        setter((prev) => ({ ...prev, [symbol]: value ?? 0 }));
    };

    const getCurrentPrice = (symbol: string): number | undefined => {
        // Find price from the categorized data for efficiency if available
        for (const category in categories) {
            const stock = categories[category].find(s => s.symbol === symbol);
            if (stock) return stock.price;
        }
        // Fallback to flat list if needed (though should be in categories)
        return currentStocks.find(stock => stock.symbol === symbol)?.price;
    }

    const handleTransaction = (symbol: string, type: "buy" | "sell") => {
        const amount = type === "buy" ? buyAmounts[symbol] : sellAmounts[symbol];
        const price = getCurrentPrice(symbol);

        if (price === undefined) {
            message.error(`Price data missing for ${symbol}. Cannot process transaction.`);
            return;
        }
        console.log(`${type.toUpperCase()}`, symbol, "amount:", amount, "price:", price);
        // Add your actual API call logic here
        message.info(`Processing ${type} ${amount} of ${symbol} at ${price.toFixed(2)}$...`);
    };

    // --- Function to show chart ---
    const showChartForStock = async (symbol: string) => {
        setSelectedStockSymbol(symbol);
        setIsChartLoading(true);
        setChartError(null);
        setChartData([]); // Clear previous data

        try {
            // Make API call to your new chart endpoint
            const historyData = await api.get<StockDataPointDTO[]>(`/api/charts/${symbol}/daily`);
            if (historyData && historyData.length > 0) {
                setChartData(historyData);
            } else {
                setChartError(`No historical data found for ${symbol}.`);
            }
        } catch (err: any) {
            console.error(`Failed to fetch chart data for ${symbol}`, err);
            setChartError(`Could not load chart data for ${symbol}. ${err.message || ''}`);
            message.error(`Could not load chart data for ${symbol}.`);
        } finally {
            setIsChartLoading(false);
        }
    };

    const handleCloseChartModal = () => {
        setSelectedStockSymbol(null);
        setChartData([]); // Clear data when closing
        setChartError(null);
    };

    // --- Submit Round Logic (Placeholder) ---
    const handleSubmitRound = async () => {
        //Reuse logic from previous steps to gather transactions


        //  );
        for (const [key, value] of Object.entries(sellAmounts)) {
            const response = await apiService.post<string>(
                `/api/transaction/${gameId}/submit?userId=${currentUserId}`,
                {
                    "stockId": key,
                    "quantity": value,
                    "type": "SELL"
                })
            console.log(response)
        }

        for (const [key, value] of Object.entries(buyAmounts)) {
            const response = await apiService.post<string>(
                `/api/transaction/${gameId}/submit?userId=${currentUserId}`,
                {
                    "stockId": key,
                    "quantity": value,
                    "type": "BUY"
                })
            console.log(response)
        }

        setTimeout(() => router.push(`/lobby/${gameId}/leader_board`), 1000);
    };


    // -- Main Render --
    return (
        <div style={{
            backgroundColor: "#111827", // Darker main background
            padding: "30px",
            minHeight: "100vh",
            color: "#e5e7eb",
        }}>

            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '0 10px' }}>
                <Typography.Title level={2} style={{ color: "#fff", margin: 0 }}>
                    Trade Stocks - Round {round ?? '...'}
                </Typography.Title>
                <Button type="primary" onClick={onToggleLayout} style={{ fontWeight: "bold" }}>
                    My Portfolio
                </Button>
            </div>

            {/* Main Content Area (Flex Container) */}
            {/* Using previous layout structure */}
            <div style={{ display: 'flex', gap: '30px', alignItems: 'stretch' }}>

                {/* Left Pane: Transaction Area */}
                <div style={{
                    flex: '1 1 100%', // Take full width if no table
                    backgroundColor: "#1f2937",
                    borderRadius: "16px",
                    padding: "24px",
                    border: "1px solid #374151",
                    maxHeight: 'calc(85vh)', // Adjusted height
                    overflowY: 'auto'
                }}>
                    <Typography.Title level={4} style={{ color: "#e5e7eb", marginBottom: '20px', borderBottom: '1px solid #4b5563', paddingBottom: '10px' }}>
                        Your Transactions
                    </Typography.Title>

                    {isLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                            <Spin size="large" />
                        </div>
                    ) : Object.keys(categories).length === 0 ? (
                        <Typography.Text style={{ color: "#9ca3af" }}>No stocks available for trading this round.</Typography.Text>
                    ) : (
                        Object.entries(categories).map(([cat, stocks]) => (
                            <div key={cat} style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: '#d1d5db', borderBottom: '2px solid #4b5563', paddingBottom: '4px', display: 'inline-block' }}>
                                    {cat}
                                </h3>
                                <ul style={{ display: "flex", flexDirection: "column", gap: "15px", paddingLeft: 0, listStyle: 'none' }}>
                                    {stocks.map((stock) => (
                                        <li key={stock.symbol} style={{ display: "grid", gridTemplateColumns: "30px 80px 80px 1fr 1fr", alignItems: "center", gap: "15px" }}>
                                            {/* Icon */}
                                            <img src={`/icons/${stock.symbol}.png`} alt={`${stock.symbol} icon`} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/icons/default.png"; }} style={{ width: "24px", height: "24px", objectFit: "contain" }} />
                                            {/* Symbol - CLICKABLE FOR CHART */}
                                            <span
                                                onClick={() => showChartForStock(stock.symbol)} // <-- Call chart function
                                                title={`View chart for ${stock.symbol}`}
                                                style={{ fontWeight: "600", color: "#60a5fa", cursor: "pointer", textDecoration: "underline" }}
                                            >
                                                {stock.symbol}
                                            </span>
                                            {/* Price */}
                                            <span style={{ fontWeight: "500", textAlign: 'right' }}>
                                                {stock.price.toFixed(2)}$
                                            </span>
                                            {/* Buy Controls */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <InputNumber min={0} placeholder="Amount" value={buyAmounts[stock.symbol] || undefined} onChange={(value) => handleAmountChange(stock.symbol, value, "buy")} style={{ flexGrow: 1, backgroundColor: "#374151", color: '#fff', border: 'none' }} controls={false} />
                                                <Button onClick={() => handleTransaction(stock.symbol, "buy")} disabled={!buyAmounts[stock.symbol] || buyAmounts[stock.symbol] <= 0} size="small" style={{ backgroundColor: '#22c55e', borderColor: '#22c55e', color: 'white' }}>Buy</Button>
                                            </div>
                                            {/* Sell Controls */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <InputNumber min={0} placeholder="Amount" value={sellAmounts[stock.symbol] || undefined} onChange={(value) => handleAmountChange(stock.symbol, value, "sell")} style={{ flexGrow: 1, backgroundColor: "#374151", color: '#fff', border: 'none' }} controls={false} />
                                                <Button onClick={() => handleTransaction(stock.symbol, "sell")} disabled={!sellAmounts[stock.symbol] || sellAmounts[stock.symbol] <= 0} size="small" style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', color: 'white' }}>Sell</Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    )}
                </div>

                {/* Removed Right Pane: Stock Info Table */}
                {/* <div style={{ flex: '1 1 40%', alignSelf: 'stretch' }}> ... table ... </div> */}

            </div>

            {/* Submit & Timer (Fixed Position) */}
            <div style={{ position: "fixed", bottom: "20px", right: "30px", zIndex: 1000, display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Timer */}
                <div style={{ backgroundColor: "rgba(59, 130, 246, 0.2)", padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.4)", backdropFilter: "blur(4px)" }}>
                    <Typography.Text style={{ color: "#93c5fd", fontWeight: 'bold', fontSize: '1rem' }}>
                        Time left: {timer === null ? '...' : `${timer}s`}
                    </Typography.Text>
                </div>
                {/* Submit Button */}
                <Button type="primary" size="large" onClick={handleSubmitRound} disabled={isLoading} style={{ backgroundColor: "#2563eb", color: "white", border: "none", padding: "10px 20px", fontWeight: "bold", boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                    Submit Round
                </Button>
            </div>

            {/* Chart Modal */}
            <Modal
                title={`Stock Chart: ${selectedStockSymbol || ''}`}
                open={!!selectedStockSymbol} // Show modal when a symbol is selected
                onCancel={handleCloseChartModal}
                footer={null} // No OK/Cancel buttons needed
                width={900} // Adjust width as needed
                // Optional: Add styles for dark mode modal
                bodyStyle={{ backgroundColor: '#1f2937', minHeight: '520px' }} // Match background, ensure space
                style={{ top: 20 }} // Position modal slightly from top
                maskClosable={true} // Allow closing by clicking outside
                destroyOnClose={true} // Unmount chart component when modal closes
            >
                {isChartLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px' }}>
                        <Spin size="large" tip="Loading chart data..." />
                    </div>
                ) : chartError ? (
                    <Typography.Text type="danger" style={{ display: 'block', textAlign: 'center', marginTop: '20px' }}>
                        {chartError}
                    </Typography.Text>
                ) : chartData.length > 0 && selectedStockSymbol ? (
                    // Render the chart component only when data is ready
                    <StockChart data={chartData} symbol={selectedStockSymbol} />
                ) : (
                    // Fallback case if data is empty but no error (might happen briefly)
                    <Typography.Text style={{ display: 'block', textAlign: 'center', marginTop: '20px', color: '#9ca3af' }}>
                        No chart data available.
                    </Typography.Text>
                )}
            </Modal>

        </div>
    );
};

export default TransactionPage;