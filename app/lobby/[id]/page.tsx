"use client";

import React, { useState, useEffect } from "react";
import { useParams} from "next/navigation";
import { App, Typography, List, message } from "antd";
import Logo from "@/components/Logo";
import { useApi } from "@/hooks/useApi";
import { Lobby } from "@/types/lobby";

const { Title, Text } = Typography;

interface Player {
  userId: string;
  username: string;
  ready: boolean;
}

const LobbyPage: React.FC = () => {
  const { id: lobbyId } = useParams();
  const apiService = useApi();

  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [countdown, setCountdown] = useState<number>(300);

  // Fetch lobby details from the backend
  useEffect(() => {
    const fetchLobby = async () => {
      try {
        const data = await apiService.get<Lobby>(`/lobby/${lobbyId}`);
        if (data) {
          setLobby(data);
          // Optionally override countdown if the lobby provides its own time limit:
          // setCountdown(data.timeLimitSeconds || 300);
        }
      } catch (error) {
        console.error("Failed to fetch lobby data:", error);
        message.error("Failed to fetch lobby data");
      }
    };

    if (lobbyId) {
      fetchLobby();
    }
  }, [lobbyId, apiService]);

  // Start countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Build a list of 5 players. If there are fewer than 5 joined players,
  // fill the remaining slots with a placeholder.
  const players: Player[] = [];
  const joinedPlayers = lobby ? Object.entries(lobby.playerReadyStatuses) : [];
  for (let i = 0; i < 5; i++) {
    if (i < joinedPlayers.length) {
      const [userId, ready] = joinedPlayers[i];
      // Replace "User {userId}" with the actual username if available.
      players.push({ userId, username: `User ${userId}`, ready });
    } else {
      players.push({ userId: "", username: "Empty Slot", ready: false });
    }
  }

  return (
    <App>
      <div style={{ maxWidth: 600, margin: "20px auto", padding: 16 }}>
        <Logo />
        <Title level={2} style={{ textAlign: "center" }}>
          Lobby #{lobbyId}
        </Title>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <Text strong style={{ fontSize: "20px" }}>
            Countdown: {countdown}s
          </Text>
        </div>
        <div>
          <Title level={4}>Players</Title>
          <List
            bordered
            dataSource={players}
            renderItem={(player) => (
              <List.Item>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <span>{player.username}</span>
                  <span>{player.ready ? "Ready" : "Not Ready"}</span>
                </div>
              </List.Item>
            )}
          />
        </div>
      </div>
    </App>
  );
};

export default LobbyPage;
