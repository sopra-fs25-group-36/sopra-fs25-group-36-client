// "use client";

// import React, { useEffect, useState } from "react";
// import { Table, Typography, message } from "antd";
// import { useApi } from "@/hooks/useApi";
// import { useParams, useRouter } from "next/navigation";
// import Logo from "@/components/Logo";

// const { Title, Text } = Typography;

// // LeaderBoard DTO from your backend.
// interface LeaderBoardEntry {
//   userId: number;
//   totalAssets: number;
// }

// // Interface for user details returned by /users/{userID}.
// // Adjust properties based on the structure of your UserGetDTO.
// interface UserGetDTO {
//   id: number;
//   name: string;
// }

// // Interface for table records.
// interface TableRecord {
//   key: number;
//   rank: number;
//   userId: number;
//   name: string; // User name
//   totalAssets: number;
// }

// // Interface for game details including timing info.
// interface GameDetail {
//   currentRound: number;
//   createdAt: string; // e.g., "2025-04-12T14:00:00Z"
//   timeLimitSeconds: number; // e.g., 120 for a 2-minute countdown
// }

// const LeaderBoard: React.FC = () => {
//   const apiService = useApi();
//   const { id } = useParams(); // Retrieves the dynamic game (or lobby) id.
//   const router = useRouter();
//   const gameId = id ? Number(id) : 0; // Convert to number as needed.

//   const usdFormatter = new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency: "USD",
//   });

//   const [leaderBoardData, setLeaderBoardData] = useState<TableRecord[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [countdown, setCountdown] = useState<number>(20); // Use a fixed 20s countdown
//   const [gameDetail, setGameDetail] = useState<GameDetail | null>(null);
//   const currentRound = gameDetail?.currentRound ?? 0;

//   // Fetch leaderboard data based on the gameId.
//   useEffect(() => {
//     if (!id) return;

//     const fetchLeaderBoard = async () => {
//       setLoading(true);
//       try {
//         // Fetch leaderboard entries from /game/{gameId}/leader.
//         const leaderBoardResponse = await apiService.get<LeaderBoardEntry[]>(
//           `/game/${gameId}/leader`
//         );
//         // Sort the entries by totalAssets in descending order.
//         const sortedData = leaderBoardResponse.sort(
//           (a, b) => b.totalAssets - a.totalAssets
//         );
//         // For each leaderboard entry, fetch the user name concurrently.
//         const formattedData: TableRecord[] = await Promise.all(
//           sortedData.map(async (entry, index) => {
//             let userName = "Unknown";
//             try {
//               // Call /users/{userId} to get user details.
//               const userResponse = await apiService.get<UserGetDTO>(
//                 `/users/${entry.userId}`
//               );
//               userName = userResponse.name;
//             } catch (error) {
//               console.error(
//                 `Failed to fetch user details for userId ${entry.userId}`,
//                 error
//               );
//             }
//             return {
//               key: entry.userId,
//               rank: index + 1,
//               userId: entry.userId,
//               name: userName,
//               totalAssets: entry.totalAssets,
//             };
//           })
//         );
//         setLeaderBoardData(formattedData);
//       } catch (error) {
//         message.error("Failed to fetch leaderboard data");
//         console.error("Error fetching leaderboard:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLeaderBoard();
//   }, [apiService, id, gameId]);

//   // Fetch game detail information for the countdown.
//   useEffect(() => {
//     const fetchGameDetail = async () => {
//       try {
//         const detail = await apiService.get<GameDetail>(`/game/${gameId}`);
//         setGameDetail(detail);
//       } catch (error) {
//         console.error("Failed to fetch game details:", error);
//       }
//     };
//     if (gameId) {
//       fetchGameDetail();
//     }
//   }, [apiService, gameId]);

//   // Countdown timer computation using game detail.
//   useEffect(() => {
//     if (!gameDetail) return;

//     const countdownSeconds = 20; // Use a fixed 20-second countdown
//     const startTime = Date.now();
//     const endTime = startTime + countdownSeconds * 1000;

//     const timer = setInterval(() => {
//       const now = Date.now();
//       const remaining = Math.floor((endTime - now) / 1000);
//       if (remaining <= 0) {
//         clearInterval(timer);
//         setCountdown(0);
//         router.push(`/lobby/${id}/game`);
//       } else {
//         setCountdown(remaining);
//       }
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [gameDetail, id, router]);

//   // Define table columns.
//   const columns = [
//     {
//       title: "Rank",
//       dataIndex: "rank",
//       key: "rank",
//       width: "5%",
//       align: "center" as const,
//     },
//     {
//       title: "User ID",
//       dataIndex: "userId",
//       key: "userId",
//       width: "10%",
//       align: "center" as const,
//     },
//     {
//       title: "User Name",
//       dataIndex: "name",
//       key: "name",
//       width: "25%",
//       align: "center" as const,
//     },
//     {
//       title: "Total Assets",
//       dataIndex: "totalAssets",
//       key: "totalAssets",
//       width: "25%",
//       align: "center" as const,
//       render: (value: number) => usdFormatter.format(value),
//     },
//   ];

//   return (
//     <div
//       style={{
//         maxWidth: 500,
//         margin: "20px auto",
//         padding: 2,
//         textAlign: "center",
//       }}
//     >
//       <Logo />
//       <br />
//       <div>
//         <div style={{ marginBottom: 16 }}>
//           <Text strong style={{ fontSize: "36px" }}>
//             Market Opens in {countdown} s
//           </Text>
//         </div>
//       </div>
//       <br />
//       <div>
//         <Title level={2}>Round #{currentRound}</Title>
//       </div>
//       <br />
//       <div>
//         <Table
//           columns={columns}
//           dataSource={leaderBoardData}
//           loading={loading}
//           pagination={false}
//           bordered
//         />
//       </div>
//     </div>
//   );
// };

// export default LeaderBoard;

"use client";

import React, { useEffect, useState } from "react";
import { Table, Typography, message, Tabs } from "antd";
import { useApi } from "@/hooks/useApi";
import { useParams, useRouter } from "next/navigation";
import Logo from "@/components/Logo";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// LeaderBoard DTO from your backend.
interface LeaderBoardEntry {
  userId: number;
  totalAssets: number;
}

interface UserGetDTO {
  id: number;
  name: string;
}

// Interface for table records.
interface TableRecord {
  key: number;
  rank: number;
  userId: number;
  name: string; // User name
  totalAssets: number;
}

// Interface for game details including timing info.
interface GameDetail {
  currentRound: number;
  createdAt: string; // e.g., "2025-04-12T14:00:00Z"
  timeLimitSeconds: number; // e.g., 120 for a 2-minute countdown
}

// New interfaces for player states
interface StockTransaction {
  stockId: string;
  quantity: number;
  price: number;
  type: string;
}

interface PlayerState {
  userId: number;
  cashBalance: number;
  transactionHistory: StockTransaction[];
  playerStocks: Record<string, number>;
}

interface GameData {
  gameId: number;
  playerStates: Record<string, PlayerState>;
  currentRound: number;
  currentStockPrices: Record<string, number>;
  leaderBoard: LeaderBoardEntry[];
}

const LeaderBoard: React.FC = () => {
  const apiService = useApi();
  const { id } = useParams();
  const router = useRouter();
  const gameId = id ? Number(id) : 0;

  const usdFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const [leaderBoardData, setLeaderBoardData] = useState<TableRecord[]>([]);
  const [playerStatesData, setPlayerStatesData] = useState<PlayerState[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(20);
  const [gameDetail, setGameDetail] = useState<GameDetail | null>(null);
  const currentRound = gameDetail?.currentRound ?? 0;

  // Fetch leaderboard data based on the gameId.
  useEffect(() => {
    if (!id) return;

    const fetchGameData = async () => {
      setLoading(true);
      try {
        // Fetch complete game data
        const gameDataResponse = await apiService.get<GameData>(
          `/game/${gameId}`
        );

        // Convert playerStates object to array
        const playersArray = Object.values(gameDataResponse.playerStates);
        setPlayerStatesData(playersArray);

        // Process leaderboard data
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
      } catch (error) {
        message.error("Failed to fetch game data");
        console.error("Error fetching game data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [apiService, id, gameId]);

  // Fetch game detail information for the countdown.
  useEffect(() => {
    const fetchGameDetail = async () => {
      try {
        const detail = await apiService.get<GameDetail>(`/game/${gameId}`);
        setGameDetail(detail);
      } catch (error) {
        console.error("Failed to fetch game details:", error);
      }
    };
    if (gameId) {
      fetchGameDetail();
    }
  }, [apiService, gameId]);

  // Countdown timer computation using game detail.
  useEffect(() => {
    if (!gameDetail) return;

    const countdownSeconds = 20;
    const startTime = Date.now();
    const endTime = startTime + countdownSeconds * 1000;

    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.floor((endTime - now) / 1000);
      if (remaining <= 0) {
        clearInterval(timer);
        setCountdown(0);
        router.push(`/lobby/${id}/game`);
      } else {
        setCountdown(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameDetail, id, router]);

  // Define table leaderBoardColumns.
  const leaderBoardColumns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      width: "5%",
      align: "center" as const,
    },
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      width: "10%",
      align: "center" as const,
    },
    {
      title: "User Name",
      dataIndex: "name",
      key: "name",
      width: "25%",
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

  // New columns for player states
  const playerStatesColumns = [
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      width: "15%",
      align: "center" as const,
    },
    {
      title: "Cash Balance",
      dataIndex: "cashBalance",
      key: "cashBalance",
      width: "15%",
      align: "center" as const,
      render: (value: number) => usdFormatter.format(value),
    },
    {
      title: "Stocks Owned",
      dataIndex: "playerStocks",
      key: "playerStocks",
      width: "20%",
      align: "center" as const,
      render: (stocks: Record<string, number>) => (
        <div>
          {Object.entries(stocks).map(([stockId, quantity]) => (
            <div key={stockId}>
              {stockId}: {quantity}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Transactions",
      dataIndex: "transactionHistory",
      key: "transactionHistory",
      width: "35%",
      align: "center" as const,
      render: (transactions: StockTransaction[]) => (
        <div>
          {transactions.map((tx, index) => (
            <div key={index}>
              {tx.type} {tx.quantity} {tx.stockId}{" "}
              {usdFormatter.format(tx.price)}
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "20px auto",
        padding: 2,
        textAlign: "center",
      }}
    >
      <Logo />
      <br />
      <div>
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ fontSize: "36px" }}>
            Market Opens in {countdown} s
          </Text>
        </div>
      </div>
      <br />
      <div>
        <Title level={2}>Round #{currentRound}</Title>
      </div>
      <br />
      {/* <div>
        <Table
          columns={leaderBoardColumns}
          dataSource={leaderBoardData}
          loading={loading}
          pagination={false}
          bordered
        />
      </div> */}
      <Tabs defaultActiveKey="1" centered>
        <TabPane tab="Leaderboard" key="1">
          <Table
            columns={leaderBoardColumns}
            dataSource={leaderBoardData}
            loading={loading}
            pagination={false}
            bordered
          />
        </TabPane>
        <TabPane tab="Player State" key="2">
          <Table
            columns={playerStatesColumns}
            dataSource={playerStatesData}
            loading={loading}
            pagination={false}
            bordered
            rowKey="userId"
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default LeaderBoard;

// "use client";

// import React, { useEffect, useState } from "react";
// import { Table, Typography, message, Row, Col } from "antd";
// import { useApi } from "@/hooks/useApi";
// import { useParams, useRouter } from "next/navigation";
// import Logo from "@/components/Logo";

// const { Title, Text } = Typography;

// // LeaderBoard DTO from your backend.
// interface LeaderBoardEntry {
//   userId: number;
//   totalAssets: number;
// }

// interface UserGetDTO {
//   id: number;
//   name: string;
// }

// // Interface for table records.
// interface TableRecord {
//   key: number;
//   rank: number;
//   userId: number;
//   name: string; // User name
//   totalAssets: number;
// }

// // Interface for game details including timing info.
// interface GameDetail {
//   currentRound: number;
//   createdAt: string; // e.g., "2025-04-12T14:00:00Z"
//   timeLimitSeconds: number; // e.g., 120 for a 2-minute countdown
// }

// // New interfaces for player states
// interface StockTransaction {
//   stockId: string;
//   quantity: number;
//   price: number;
//   type: string;
// }

// interface PlayerState {
//   userId: number;
//   cashBalance: number;
//   transactionHistory: StockTransaction[];
//   playerStocks: Record<string, number>;
// }

// interface GameData {
//   gameId: number;
//   playerStates: Record<string, PlayerState>;
//   currentRound: number;
//   currentStockPrices: Record<string, number>;
//   leaderBoard: LeaderBoardEntry[];
//   stockTimeline: Record<string, Record<string, number>>;
// }

// // Define the StockData type
// interface StockData {
//   stock: string;
//   [key: string]: number | string; // The stock's prices by date
// }

// const LeaderBoard: React.FC = () => {
//   const apiService = useApi();
//   const { id } = useParams();
//   const router = useRouter();
//   const gameId = id ? Number(id) : 0;

//   const usdFormatter = new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency: "USD",
//   });

//   const [leaderBoardData, setLeaderBoardData] = useState<TableRecord[]>([]);
//   const [playerStatesData, setPlayerStatesData] = useState<PlayerState[]>([]);
//   const [stockData, setStockData] = useState<StockData[]>([]); // Use the StockData type here
//   const [loading, setLoading] = useState<boolean>(false);
//   const [countdown, setCountdown] = useState<number>(20);
//   const [gameDetail, setGameDetail] = useState<GameDetail | null>(null);
//   const currentRound = gameDetail?.currentRound ?? 0;

//   // Fetch leaderboard data based on the gameId.
//   useEffect(() => {
//     if (!id) return;

//     const fetchGameData = async () => {
//       setLoading(true);
//       try {
//         // Fetch complete game data
//         const gameDataResponse = await apiService.get<GameData>(
//           `/game/${gameId}`
//         );

//         // Convert playerStates object to array
//         const playersArray = Object.values(gameDataResponse.playerStates);
//         setPlayerStatesData(playersArray);

//         // Process leaderboard data
//         const sortedLeaderBoard = gameDataResponse.leaderBoard.sort(
//           (a, b) => b.totalAssets - a.totalAssets
//         );

//         const formattedData: TableRecord[] = await Promise.all(
//           sortedLeaderBoard.map(async (entry, index) => {
//             let userName = "Unknown";
//             try {
//               const userResponse = await apiService.get<UserGetDTO>(
//                 `/users/${entry.userId}`
//               );
//               userName = userResponse.name;
//             } catch (error) {
//               console.error(
//                 `Failed to fetch user details for userId ${entry.userId}`,
//                 error
//               );
//             }
//             return {
//               key: entry.userId,
//               rank: index + 1,
//               userId: entry.userId,
//               name: userName,
//               totalAssets: entry.totalAssets,
//             };
//           })
//         );
//         setLeaderBoardData(formattedData);

//         // Process stock timeline data
//         const stockTimeline = gameDataResponse.stockTimeline;
//         const dates = Object.keys(stockTimeline);
//         const stockMap: { [stock: string]: Record<string, number> } = {};

//         dates.forEach((date) => {
//           const stocks = stockTimeline[date];
//           Object.entries(stocks).forEach(([stock, price]) => {
//             if (!stockMap[stock]) stockMap[stock] = {};
//             stockMap[stock][date] = price;
//           });
//         });

//         const stockRows = Object.entries(stockMap).map(([stock, prices]) => ({
//           stock,
//           ...prices,
//         }));

//         setStockData(stockRows);
//       } catch (error) {
//         message.error("Failed to fetch game data");
//         console.error("Error fetching game data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchGameData();
//   }, [apiService, id, gameId]);

//   // Fetch game detail information for the countdown.
//   useEffect(() => {
//     const fetchGameDetail = async () => {
//       try {
//         const detail = await apiService.get<GameDetail>(`/game/${gameId}`);
//         setGameDetail(detail);
//       } catch (error) {
//         console.error("Failed to fetch game details:", error);
//       }
//     };
//     if (gameId) {
//       fetchGameDetail();
//     }
//   }, [apiService, gameId]);

//   // Countdown timer computation using game detail.
//   useEffect(() => {
//     if (!gameDetail) return;

//     const countdownSeconds = 20;
//     const startTime = Date.now();
//     const endTime = startTime + countdownSeconds * 1000;

//     const timer = setInterval(() => {
//       const now = Date.now();
//       const remaining = Math.floor((endTime - now) / 1000);
//       if (remaining <= 0) {
//         clearInterval(timer);
//         setCountdown(0);
//         router.push(`/lobby/${id}/game`);
//       } else {
//         setCountdown(remaining);
//       }
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [gameDetail, id, router]);

//   // Define table leaderBoardColumns.
//   const leaderBoardColumns = [
//     {
//       title: "Rank",
//       dataIndex: "rank",
//       key: "rank",
//       width: "5%",
//       align: "center" as const,
//     },
//     {
//       title: "User ID",
//       dataIndex: "userId",
//       key: "userId",
//       width: "10%",
//       align: "center" as const,
//     },
//     {
//       title: "User Name",
//       dataIndex: "name",
//       key: "name",
//       width: "25%",
//       align: "center" as const,
//     },
//     {
//       title: "Total Assets",
//       dataIndex: "totalAssets",
//       key: "totalAssets",
//       width: "25%",
//       align: "center" as const,
//       render: (value: number) => usdFormatter.format(value),
//     },
//   ];

//   // Define columns for the playerStates table
//   const playerStatesColumns = [
//     {
//       title: "User ID",
//       dataIndex: "userId",
//       key: "userId",
//       width: "15%",
//       align: "center" as const,
//     },
//     {
//       title: "Cash Balance",
//       dataIndex: "cashBalance",
//       key: "cashBalance",
//       width: "15%",
//       align: "center" as const,
//       render: (value: number) => usdFormatter.format(value),
//     },
//     {
//       title: "Stocks Owned",
//       dataIndex: "playerStocks",
//       key: "playerStocks",
//       width: "20%",
//       align: "center" as const,
//       render: (stocks: Record<string, number>) => (
//         <div>
//           {Object.entries(stocks).map(([stockId, quantity]) => (
//             <div key={stockId}>
//               {stockId}: {quantity}
//             </div>
//           ))}
//         </div>
//       ),
//     },
//     {
//       title: "Transactions",
//       dataIndex: "transactionHistory",
//       key: "transactionHistory",
//       width: "35%",
//       align: "center" as const,
//       render: (transactions: StockTransaction[]) => (
//         <div>
//           {transactions.map((tx, index) => (
//             <div key={index}>
//               {tx.type} {tx.quantity} {tx.stockId}{" "}
//               {usdFormatter.format(tx.price)}
//             </div>
//           ))}
//         </div>
//       ),
//     },
//   ];

//   // Define columns for the stock price table
//   const stockColumns = [
//     {
//       title: "Stock",
//       dataIndex: "stock",
//       key: "stock",
//       width: "30%",
//     },
//     ...Object.keys(stockData[0] || {})
//       .filter((key) => key !== "stock")
//       .map((date) => ({
//         title: date,
//         dataIndex: date,
//         key: date,
//         render: (value: number) => (value ? value.toFixed(2) : "-"),
//       })),
//   ];

//   return (
//     <div
//       style={{
//         maxWidth: 1000,
//         margin: "20px auto",
//         padding: 2,
//         textAlign: "center",
//       }}
//     >
//       <Logo />
//       <br />
//       <div>
//         <div style={{ marginBottom: 16 }}>
//           <Text strong style={{ fontSize: "36px" }}>
//             Market Opens in {countdown} s
//           </Text>
//         </div>
//       </div>
//       <br />
//       <div>
//         <Title level={2}>Round #{currentRound}</Title>
//       </div>
//       <br />

//       {/* Leaderboard Section */}
//       <Row gutter={[16, 16]}>
//         <Col span={24}>
//           <Title level={3}>Leaderboard</Title>
//           <Table
//             columns={leaderBoardColumns}
//             dataSource={leaderBoardData}
//             loading={loading}
//             pagination={false}
//             bordered
//           />
//         </Col>
//       </Row>

//       {/* Player State Section */}
//       <Row gutter={[16, 16]}>
//         <Col span={24}>
//           <Title level={3}>Player State</Title>
//           <Table
//             columns={playerStatesColumns}
//             dataSource={playerStatesData}
//             loading={loading}
//             pagination={false}
//             bordered
//             rowKey="userId"
//           />
//         </Col>
//       </Row>

//       {/* Stock Price Timeline Section */}
//       <Row gutter={[16, 16]}>
//         <Col span={24}>
//           <Title level={3}>Stock Prices</Title>
//           <Table
//             columns={stockColumns}
//             dataSource={stockData}
//             loading={loading}
//             pagination={false}
//             bordered
//           />
//         </Col>
//       </Row>
//     </div>
//   );
// };

// export default LeaderBoard;
