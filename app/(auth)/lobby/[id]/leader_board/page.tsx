"use client";

import React, { useEffect, useState } from "react";
import { Table, Typography, message } from "antd";
import { useApi } from "@/hooks/useApi";
import { useParams, useRouter } from "next/navigation";
import Logo from "@/components/Logo";

const { Title, Text } = Typography;

interface LeaderBoardEntry {
  userId: number;
  totalAssets: number;
}

interface UserGetDTO {
  id: number;
  name: string;
}

interface TableRecord {
  key: number;
  rank: number;
  userId: number;
  name: string;
  totalAssets: number;
}

interface GameDetail {
  currentRound: number;
  createdAt: string;
  timeLimitSeconds: number;
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
  const [loading, setLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(10);
  const [gameDetail, setGameDetail] = useState<GameDetail | null>(null);
  const currentRound = gameDetail?.currentRound ?? 0;

  useEffect(() => {
    if (!id) return;

    const fetchLeaderBoard = async () => {
      setLoading(true);
      try {
        const leaderBoardResponse = await apiService.get<LeaderBoardEntry[]>(
          `/game/${gameId}/leader`
        );
        const sortedData = leaderBoardResponse.sort(
          (a, b) => b.totalAssets - a.totalAssets
        );
        const formattedData: TableRecord[] = await Promise.all(
          sortedData.map(async (entry, index) => {
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
        message.error("Failed to fetch leaderboard data");
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderBoard();
  }, [apiService, id, gameId]);

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

  useEffect(() => {
    if (!gameDetail) return;

    const countdownSeconds = 10;
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

  const columns = [
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
      <div>
        <Table
          columns={columns}
          dataSource={leaderBoardData}
          loading={loading}
          pagination={false}
          bordered
        />
      </div>
    </div>
  );
};

export default LeaderBoard;
