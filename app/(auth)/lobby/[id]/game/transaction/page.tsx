import { InputNumber, Button, Typography, message } from "antd";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGame } from "@/hooks/useGame";
import { useApi } from "@/hooks/useApi";
import { StockPriceGetDTO } from "@/types/stock";


const TransactionPage: React.FC = () => {
    const router = useRouter();
    const { id } = useParams(); // Retrieves the dynamic game (or lobby) id
    const gameId = Number(id);
    const api = useApi();


    const { round, timer } = useGame(gameId);

    const [buyAmounts, setBuyAmounts] = useState<{ [symbol: string]: number }>({});
    const [sellAmounts, setSellAmounts] = useState<{ [symbol: string]: number }>({});
    const [secondsLeft, setSecondsLeft] = useState(300); // 5 min

    const handleAmountChange = (symbol: string, value: number | null, type: "buy" | "sell") => {
        const setter = type === "buy" ? setBuyAmounts : setSellAmounts;
        setter((prev) => ({ ...prev, [symbol]: value ?? 0 }));
    };

    const handleTransaction = (symbol: string, type: "buy" | "sell") => {
        const amount = type === "buy" ? buyAmounts[symbol] : sellAmounts[symbol];
        console.log(`${type.toUpperCase()}`, symbol, "amount:", amount, "price:", fixedPrices[symbol]);
    };

    const goToStockDetail = (symbol: string) => {
        router.push(`/stocks/${symbol}`);
    };

    const handleSubmitRound = () => {
        message.success("Round submitted! Redirecting to leaderboard...");
        setTimeout(() => {
            router.push(`/lobby/${gameId}/leader_board`);
        }, 1000);
    };

    const [fixedPrices, setFixedPrices] = useState<{ [symbol: string]: number }>({});
    const [categories, setCategories] = useState<{ [category: string]: string[] }>({});

    useEffect(() => {
        const fetchStockData = async () => {
            try {
                const data = await api.get<StockPriceGetDTO[]>(`/api/stocks/${gameId}/stocks`);

                // Build fixedPrices
                const prices: { [symbol: string]: number } = {};
                data.forEach(({ symbol, price }) => {
                    prices[symbol] = price;
                });
                setFixedPrices(prices);

                // Optional: dynamically build categories if needed (example logic)
                const defaultCategories: { [category: string]: string[] } = {
                    TECH: ["AAPL", "TSLA", "AMZN", "MSFT", "NVDA", "GOOG"],
                    ENERGY: ["XOM", "CVX"],
                    FINANCE: ["JPM", "GS"],
                    HEALTHCARE: ["PFE", "JNJ"],
                    CONSUMER: ["PG"],
                };

                // Filter categories to include only stocks from the API
                const filteredCategories: { [category: string]: string[] } = {};
                for (const [category, symbols] of Object.entries(defaultCategories)) {
                    filteredCategories[category] = symbols.filter((symbol) =>
                        data.some((item) => item.symbol === symbol)
                    );
                }
                console.log('filtered cat', filteredCategories)
                setCategories(filteredCategories);

            } catch (err) {
                console.error("Failed to fetch stock data", err);
            }
        };

        fetchStockData();
    }, [api, gameId]);


    return (
        <div style={{
            backgroundColor: "#1f2937",
            padding: "40px",
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
        }}>

            {/* outside box*/}
            <div style={{
                backgroundColor: "#1e293b",
                borderRadius: "32px",
                padding: "32px",
                width: "100%",
                maxWidth: "1000px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                border: "1px solid #334155",
            }}>

                <div
                    style={{
                        position: "relative",
                        minHeight: "100vh",
                        backgroundColor: "#1f2937",
                        padding: "40px",
                        color: "#fff",
                    }}
                >
                    {/* My Portfolio */}
                    <div style={{ position: "absolute", top: 20, right: 40 }}>
                        <Button
                            type="primary"
                            onClick={() => router.push("/portfolio")}
                            style={{ fontWeight: "bold" }}
                        >
                            My Portfolio
                        </Button>
                    </div>

                    {/* Header */}
                    <h2
                        style={{
                            fontSize: "2.5rem",
                            fontWeight: 700,
                            marginBottom: "60px",
                            marginLeft: "calc(50% - 400px)",
                        }}
                    >
                        Stock Categories
                    </h2>

                    {/* Centered container */}
                    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                        <div
                            style={{
                                width: "100%",
                                maxWidth: "1000px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "32px",
                            }}
                        >
                            {Object.entries(categories).filter(((x) => x[1].length > 0)).map(([cat, stocks]) => (
                                <div key={cat}>
                                    <h3
                                        style={{
                                            fontSize: "20px",
                                            fontWeight: "600",
                                            marginBottom: "16px",
                                            padding: "8px 16px",
                                            backgroundColor: "#2d2d2d",
                                            borderLeft: "4px solid #888",
                                            width: "fit-content",
                                        }}
                                    >
                                        {cat}
                                    </h3>

                                    <ul style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                        {stocks.map((stock) => (
                                            <li
                                                key={stock}
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns: "60px 90px 100px 100px 80px 80px",
                                                    alignItems: "center",
                                                    gap: "18px",
                                                    paddingLeft: "50px",
                                                }}
                                            >
                                                {/* icon images */}
                                                <img
                                                    src={`/icons/${stock}.png`} // ex: public/icons/AAPL.png
                                                    alt={`${stock} icon`}
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null; // iPrevent infinite fallback loop
                                                        e.currentTarget.src = "/icons/default.png";
                                                    }}
                                                    style={{ width: "24px", height: "24px", objectFit: "contain" }}
                                                />
                                                {/* Stock symbol */}
                                                <span
                                                    onClick={() => goToStockDetail(stock)}
                                                    style={{
                                                        fontWeight: "500",
                                                        color: "#60a5fa",
                                                        cursor: "pointer",
                                                        textDecoration: "underline",
                                                        lineHeight: "32px",
                                                    }}
                                                >
                                                    {stock}
                                                </span>

                                                <span
                                                    style={{
                                                        fontWeight: "500",
                                                        cursor: "pointer",
                                                        lineHeight: "32px",
                                                    }}
                                                >
                                                    {fixedPrices[stock]}
                                                </span>

                                                {/* Buy amount */}
                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                    <label style={{ fontSize: "12px", color: "#aaa", marginBottom: "2px" }}>
                                                        Buy
                                                    </label>
                                                    <InputNumber
                                                        min={0}
                                                        value={buyAmounts[stock] || 0}
                                                        onChange={(value) => handleAmountChange(stock, value, "buy")}
                                                        style={{ width: "80px", height: "32px", backgroundColor: "#2d2d2d", }}
                                                    />
                                                </div>

                                                {/* Sell amount */}
                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                    <label style={{ fontSize: "12px", color: "#aaa", marginBottom: "2px" }}>
                                                        Sell
                                                    </label>
                                                    <InputNumber
                                                        min={0}
                                                        value={sellAmounts[stock] || 0}
                                                        onChange={(value) => handleAmountChange(stock, value, "sell")}
                                                        style={{ width: "80px", height: "32px", backgroundColor: "#2d2d2d", }}
                                                    />
                                                </div>

                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit & Timer */}
                    <div
                        style={{
                            position: "fixed",
                            bottom: "30px",
                            right: "40px",
                            zIndex: 9999,
                        }}
                    >
                        <Button
                            type="primary"
                            size="large"
                            onClick={handleSubmitRound}
                            style={{
                                backgroundColor: "#3b82f6",
                                color: "white",
                                border: "none",
                                padding: "12px 24px",
                                fontWeight: "bold",
                            }}
                        >
                            Submit
                        </Button>
                    </div>

                    <div
                        style={{
                            position: "fixed",
                            bottom: "90px",
                            right: "40px",
                            backgroundColor: "rgba(255, 99, 71, 0.15)",
                            padding: "6px 14px",
                            borderRadius: "8px",
                            border: "1px solid rgba(255, 99, 71, 0.3)",
                            backdropFilter: "blur(4px)",
                            zIndex: 1000,
                        }}
                    >
                        <Typography.Title level={4} style={{ color: "#60a5fa", margin: 0 }}>
                            Round {round} - Time left: {timer}s
                        </Typography.Title>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionPage;