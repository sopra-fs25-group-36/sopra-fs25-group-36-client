"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { App, Typography, List, message, Button } from "antd";
import Logo from "@/components/Logo";
import { useApi } from "@/hooks/useApi";
import { Lobby } from "@/types/lobby";
import { User } from "@/types/user";

const { Title, Text } = Typography;

const LobbyPage: React.FC = () => {
  const { id: lobbyId } = useParams();
  const router = useRouter();
  const apiService = useApi();
  const currentUserId = localStorage.getItem("id");

  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [userMap, setUserMap] = useState<{ [key: string]: string }>({});
  const [countdown, setCountdown] = useState<number>(300);

  useEffect(() => {
    const fetchLobby = async () => {
      try {
        const lobbyData = await apiService.get<Lobby>(`/lobby/${lobbyId}`);
        if (lobbyData) {
          setLobby(lobbyData);
        }
      } catch (error) {
        console.error("Failed to fetch lobby data:", error);
      }
    };

    if (lobbyId) {
      fetchLobby();
    }
  }, [lobbyId, apiService]);

  useEffect(() => {
    const fetchUsernames = async () => {
      if (lobby && lobby.playerReadyStatuses) {
        const userIDs = Object.keys(lobby.playerReadyStatuses);
        const newUserMap = { ...userMap };
        await Promise.all(
          userIDs.map(async (userId) => {
            if (!newUserMap[userId]) {
              try {
                const userData = await apiService.get<User>(`/users/${userId}`);
                newUserMap[userId] = userData.username;
              } catch (error) {
                console.error("Failed to fetch username for user", userId, error);
                newUserMap[userId] = `User ${userId}`;
              }
            }
          })
        );
        setUserMap(newUserMap);
      }
    };
    fetchUsernames();
  }, [lobby, apiService, userMap]);

  useEffect(() => {
    if (lobby && lobby.createdAt && lobby.timeLimitSeconds) {
      const createdAt = new Date(lobby.createdAt).getTime();
      const timeLimitMs = lobby.timeLimitSeconds * 1000;
      const endTime = createdAt + timeLimitMs;

      const timer = setInterval(() => {
        const now = Date.now();
        const remaining = Math.floor((endTime - now) / 1000);
        if (remaining <= 0) {
          clearInterval(timer);
          setCountdown(0);
          router.push(`/users/${currentUserId}`);
        } else {
          setCountdown(remaining);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [lobby, currentUserId, router]);

  const handleReady = async () => {
    if (!currentUserId) return;
    try {
      const updatedLobby = await apiService.post<Lobby>(`/${lobbyId}/ready`, {
        userId: Number(currentUserId),
      });
      if (updatedLobby && updatedLobby.id) {
        setLobby(updatedLobby);
      } else {
        message.error("Failed to update ready status");
      }
    } catch (error) {
      console.error("Error updating ready status:", error);
      message.error("Error updating ready status");
    }
  };

  let players: { userId: string; ready: boolean }[] = [];
  if (lobby && lobby.playerReadyStatuses) {
    players = Object.entries(lobby.playerReadyStatuses).map(([key, ready]) => ({
      userId: key,
      ready,
    }));
  }

  const totalSlots = 5;
  const playersWithPlaceholders = [];
  for (let i = 0; i < totalSlots; i++) {
    if (i < players.length) {
      const player = players[i];
      playersWithPlaceholders.push({
        userId: player.userId,
        username: userMap[player.userId] || `User ${player.userId}`,
        ready: player.ready,
      });
    } else {
      playersWithPlaceholders.push({
        userId: "",
        username: "Empty Slot",
        ready: false,
      });
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
        <div style={{ marginBottom: 16, textAlign: "center" }}>
          <Button type="primary" onClick={handleReady}>
            Ready
          </Button>
        </div>
        <div>
          <Title level={4}>Player Status</Title>
          <List
            bordered
            dataSource={playersWithPlaceholders}
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
