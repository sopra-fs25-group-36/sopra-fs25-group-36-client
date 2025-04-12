"use client";

import React, { useEffect, useState } from "react";
import { Table, Typography, message } from "antd";
import { useApi } from "@/hooks/useApi";
import { useParams, useRouter } from "next/navigation";

// LeaderBoard DTO from your backend.
interface LeaderBoardEntry {
  userId: number;
  totalAssets: number;
}

// Interface for user details returned by /users/{userID}.
// Adjust properties based on the structure of your UserGetDTO.
interface UserGetDTO {
  id: number;
  name: string;
  // ...other properties if needed
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
  createdAt: string;       // e.g., "2025-04-12T14:00:00Z"
  timeLimitSeconds: number; // e.g., 120 for a 2-minute countdown
}

const LeaderBoard: React.FC = () => {
  const api = useApi();
  const { id } = useParams(); // Retrieves the dynamic game (or lobby) id.
  const router = useRouter();
  const gameId = id ? Number(id) : 0; // Convert to number as needed.

  const [leaderBoardData, setLeaderBoardData] = useState<TableRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [gameDetail, setGameDetail] = useState<GameDetail | null>(null);

  // Fetch leaderboard data based on the gameId.
  useEffect(() => {
    if (!id) return;

    const fetchLeaderBoard = async () => {
      setLoading(true);
      try {
        // Fetch leaderboard entries from /game/{gameId}/leader.
        const leaderBoardResponse = await api.get<LeaderBoardEntry[]>(`/game/${gameId}/leader`);
        // Sort the entries by totalAssets in descending order.
        const sortedData = leaderBoardResponse.sort((a, b) => b.totalAssets - a.totalAssets);
        // For each leaderboard entry, fetch the user name concurrently.
        const formattedData: TableRecord[] = await Promise.all(
          sortedData.map(async (entry, index) => {
            let userName = "Unknown";
            try {
              // Call /users/{userId} to get user details.
              const userResponse = await api.get<UserGetDTO>(`/users/${entry.userId}`);
              userName = userResponse.name;
            } catch (error) {
              console.error(`Failed to fetch user details for userId ${entry.userId}`, error);
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
  }, [api, id, gameId]);

  // Fetch game detail information for the countdown.
  useEffect(() => {
    const fetchGameDetail = async () => {
      try {
        const detail = await api.get<GameDetail>(`/game/${gameId}`);
        setGameDetail(detail);
      } catch (error) {
        console.error("Failed to fetch game details:", error);
      }
    };
    if (gameId) {
      fetchGameDetail();
    }
  }, [api, gameId]);

  // Countdown timer computation using game detail.
  useEffect(() => {
    const countdownSeconds = 20; // Use a fixed 20-second countdown
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
  }, [id, router]);

  // Define table columns.
  const columns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      width: "10%",
      align: "center" as const,
    },
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      width: "20%",
      align: "left" as const,
    },
    {
      title: "User Name",
      dataIndex: "name",
      key: "name",
      width: "30%",
      align: "left" as const,
    },
    {
      title: "Total Assets",
      dataIndex: "totalAssets",
      key: "totalAssets",
      width: "20%",
      align: "right" as const,
      render: (value: number) => `$${value.toLocaleString()}`,
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {/* Header with leaderboard title and countdown timer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Typography.Title level={2}>Game Leaderboard</Typography.Title>
        <span style={{ fontSize: "1.25rem", fontWeight: 500 }}>
          Market Opens in {countdown} s
        </span>
      </div>
      {/* Leaderboard Table */}
      <Table
        columns={columns}
        dataSource={leaderBoardData}
        loading={loading}
        pagination={false}
        bordered
      />
    </div>
  );
};

export default LeaderBoard;
