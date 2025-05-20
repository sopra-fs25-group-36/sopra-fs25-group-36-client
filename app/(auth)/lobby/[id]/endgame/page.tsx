"use client";
import React, { useEffect, useState } from "react";
import { Table, Typography, message, Tabs } from "antd";
import { useApi } from "@/hooks/useApi";
import { useParams } from "next/navigation";
import Logo from "@/components/Logo";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const { Title, Text } = Typography;

interface UserGetDTO {
  id: number;
  name: string;
}

interface GameDetail {
  currentRound: number;
  currentStockPrices: Record<string, number>;
  leaderBoard: LeaderBoardEntry[];
  playerStates: Record<string, PlayerState>;
  stockTimeline: Record<string, Record<string, number>>;
}

interface LeaderBoardEntry {
  userId: number;
  totalAssets: number;
}

interface PlayerState {
  userId: number;
  cashBalance: number;
  transactionHistory: StockTransaction[];
  playerStocks: Record<string, number>;
}

interface StockTransaction {
  stockId: string;
  quantity: number;
  price: number;
  type: string;
  timestamp?: string; // Added for better key generation
}

interface TableRecord {
  key: number;
  rank: number;
  userId: number;
  name: string;
  totalAssets: number;
}

const FinalBoard: React.FC = () => {
  const apiService = useApi();
  const { id } = useParams();
  const gameId = id ? Number(id) : 0;

  const usdFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const [leaderBoardData, setLeaderBoardData] = useState<TableRecord[]>([]);
  const [playerStatesData, setPlayerStatesData] = useState<PlayerState[]>([]);
  const [stockTimelineData, setStockTimelineData] = useState<
    Record<string, Record<string, number>>
  >({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    const fetchGameData = async () => {
      setLoading(true);
      try {
        const gameDataResponse = await apiService.get<GameDetail>(
          `/game/${gameId}`
        );

        const sortedLeaderBoard = gameDataResponse.leaderBoard.sort(
          (a, b) => b.totalAssets - a.totalAssets
        );

        const formattedData: TableRecord[] = await Promise.all(
          sortedLeaderBoard.map(async (entry, index) => {
            let userName = "Unknown";
            try {
              const userResponse = await apiService.get<UserGetDTO>(
                `/users/${entry.userId}`
              );
              userName = userResponse.name;
            } catch (error) {
              console.error(
                `Failed to fetch user details for userId ${entry.userId}`,
                error
              );
            }
            return {
              key: entry.userId,
              rank: index + 1,
              userId: entry.userId,
              name: userName,
              totalAssets: entry.totalAssets,
            };
          })
        );
        setLeaderBoardData(formattedData);

        const playersArray = await Promise.all(
          Object.values(gameDataResponse.playerStates).map(
            async (playerState) => {
              let name = "Unknown";
              try {
                const userResponse = await apiService.get<UserGetDTO>(
                  `/users/${playerState.userId}`
                );
                name = userResponse.name;
              } catch (error) {
                console.error(
                  `Failed to fetch user details for userId ${playerState.userId}`,
                  error
                );
              }
              return {
                ...playerState,
                name,
              };
            }
          )
        );
        setPlayerStatesData(playersArray);

        setStockTimelineData(gameDataResponse.stockTimeline);
      } catch (error) {
        message.error("Failed to fetch game data");
        console.error("Error fetching game data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [apiService, id, gameId]);

  const leaderBoardColumns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      width: "5%",
      align: "center" as const,
    },
    {
      title: "User Name",
      dataIndex: "name",
      key: "name",
      width: "35%",
      align: "center" as const,
    },
    {
      title: "Total Assets",
      dataIndex: "totalAssets",
      key: "totalAssets",
      width: "25%",
      align: "center" as const,
      render: (value: number) => usdFormatter.format(value),
    },
  ];

  const playerStatesColumns = [
    {
      title: "User Name",
      // dataIndex: "userId",
      // key: "userId",
      dataIndex: "name",
      key: "name",
      width: "25%",
      align: "center" as const,
    },
    {
      title: "Cash Balance",
      dataIndex: "cashBalance",
      key: "cashBalance",
      align: "center" as const,
      render: (value: number) => usdFormatter.format(value),
    },
    {
      title: "Stocks Owned",
      dataIndex: "playerStocks",
      key: "playerStocks",
      width: "20%",
      render: (stocks: Record<string, number>) => (
        <div>
          {Object.entries(stocks).map(([stockId, quantity]) => (
            <div key={`${stockId}-${quantity}`}>
              {stockId}: {quantity}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "All Game Transactions",
      dataIndex: "transactionHistory",
      key: "transactionHistory",
      width: "35%",
      render: (transactions: StockTransaction[]) => (
        <div>
          {transactions.map((tx, index) => {
            const uniqueKey = tx.timestamp
              ? `${tx.stockId}-${tx.timestamp}`
              : `${tx.stockId}-${tx.price}-${tx.quantity}-${index}`;
            return (
              <div key={uniqueKey}>
                {tx.type} {tx.quantity} {tx.stockId}{" "}
                {usdFormatter.format(tx.price)}
              </div>
            );
          })}
        </div>
      ),
    },
  ];

  const lineColors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#ff0000",
    "#00c49f",
    "#0088fe",
    "#00aaff",
    "#4caf50",
    "#9c27b0",
  ];

  const tabsItems = [
    {
      key: "1",
      label: "Leaderboard",
      children: (
        <Table
          columns={leaderBoardColumns}
          dataSource={leaderBoardData}
          loading={loading}
          pagination={false}
          bordered
          rowKey="userId"
        />
      ),
    },
    {
      key: "2",
      label: "Player State",
      children: (
        <Table
          columns={playerStatesColumns}
          dataSource={playerStatesData}
          loading={loading}
          pagination={false}
          bordered
          rowKey="userId"
        />
      ),
    },
    {
      key: "3",
      label: "Market Overview",
      children: (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={Object.keys(stockTimelineData).map((round, index) => ({
                round: `${index + 1}`,
                ...stockTimelineData[round],
              }))}
            >
              <XAxis dataKey="round" />
              <YAxis
                tickFormatter={(value: number) => usdFormatter.format(value)}
              />
              <Tooltip
                formatter={(value: number) => usdFormatter.format(value)}
              />
              <Legend />
              {Object.keys(
                stockTimelineData[Object.keys(stockTimelineData)[0]] || {}
              ).map((stockId, index) => (
                <Line
                  key={stockId}
                  type="monotone"
                  dataKey={stockId}
                  stroke={lineColors[index % lineColors.length]}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>

          {Object.keys(stockTimelineData).length > 0 ? (
            <Table
              columns={[
                {
                  title: "Stock",
                  dataIndex: "stock",
                  key: "stock",
                },
                ...Object.keys(stockTimelineData).map((round, index) => ({
                  title: `${index + 1}${getOrdinalSuffix(index + 1)}`,
                  dataIndex: round,
                  key: round,
                  render: (value: number) => usdFormatter.format(value),
                })),
              ]}
              dataSource={Object.keys(
                stockTimelineData[Object.keys(stockTimelineData)[0]]
              ).map((stockId) => ({
                stock: stockId,
                key: stockId, // Added key here
                ...Object.keys(stockTimelineData).reduce(
                  (acc, round) => {
                    acc[round] = stockTimelineData[round][stockId] || 0;
                    return acc;
                  },
                  {} as Record<string, number>
                ),
              }))}
              loading={loading}
              pagination={false}
              bordered
              rowKey="stock"
            />
          ) : (
            <p>No stock data available.</p>
          )}
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "20px auto",
        padding: 2,
        textAlign: "center",
      }}
    >
      <Logo />
      <br />
      <div>
        <Text strong style={{ fontSize: "36px" }}>
          The Winner is {leaderBoardData[0]?.name ?? "XXXXXX"}
        </Text>
      </div>
      <br />
      <div>
        <Title level={2}>Game Finished!!!</Title>
      </div>
      <br />
      <div>
        <Tabs defaultActiveKey="1" centered items={tabsItems} />
      </div>
    </div>
  );
};

function getOrdinalSuffix(number: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const value = number % 100;
  return suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
}

export default FinalBoard;
