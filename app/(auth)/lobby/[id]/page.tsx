"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { App as AntApp, Typography, List, Button, Tooltip } from "antd";
import Logo from "@/components/Logo";
import { useApi } from "@/hooks/useApi";
import { Lobby } from "@/types/lobby";
import { User } from "@/types/user";
import Instructions from "@/components/Instructions";

const { Title, Text } = Typography;

const LobbyPage: React.FC = () => {
  const { id: lobbyId } = useParams();
  const router = useRouter();
  const apiService = useApi();
  const currentUserId = localStorage.getItem("id");

  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [userMap, setUserMap] = useState<{ [key: string]: string }>({});
  const [countdown, setCountdown] = useState<number>(300);
  const { message } = AntApp.useApp();

  const [modalVisible, setModalVisible] = useState<boolean>(false); // Modal visibility state

  // Steps for the guide
  const steps = [
    {
      title: `Welcome to the Lobby #${lobbyId}!`,
      content: "Click the 'Ready' button to signal your readiness.",
    },
    {
      title: "Copy Invite Link",
      content: `Copy the invite link to share with others, by clicking on the 'Lobby #${lobbyId}'`,
    },
    {
      title: "Game Countdown",
      content: "Watch the countdown to see when the game will start.",
    },
  ];

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
        const newUserMap: { [key: string]: string } = {}; // Fresh map on every render

        await Promise.all(
          userIDs.map(async (userId) => {
            if (!newUserMap[userId]) {
              try {
                const userData = await apiService.get<User>(`/users/${userId}`);
                newUserMap[userId] = userData.username;
              } catch (error) {
                console.error(
                  "Failed to fetch username for user",
                  userId,
                  error
                );
                newUserMap[userId] = `User ${userId}`;
              }
            }
          })
        );

        setUserMap(newUserMap); // Set the state once after processing all users
      }
    };

    if (lobby) {
      fetchUsernames();
    }
  }, [lobby, apiService]); // No need for userMap here anymore

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

  useEffect(() => {
    if (lobby && lobby.playerReadyStatuses) {
      const allReady = Object.values(lobby.playerReadyStatuses).every(
        (status) => status
      );
      if (allReady) {
        (async () => {
          try {
            // Since game id and lobby id are the same, we use lobbyId for both.
            // We include the gameId as a query parameter and provide an empty payload.
            const game = await apiService.post(
              `/game/${lobbyId}/start?gameId=${lobbyId}`,
              {}
            );
            // After a successful start, navigate to the leaderboard page.
            router.push(`/lobby/${lobbyId}/leader_board`);
          } catch (error) {
            console.error("Failed to start game:", error);
            message.error("Failed to start game");
          }
        })();
      }
    }
  }, [lobby, router, apiService, lobbyId]);

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

  // Show modal when user enters the lobby
  useEffect(() => {
    if (lobbyId) {
      setModalVisible(true);
    }
  }, [lobbyId]);

  return (
    <AntApp>
      <div style={{ maxWidth: 400, margin: "20px auto", padding: 16 }}>
        <Logo />
        <br />
        <div
          style={{
            textAlign: "center",
            marginBottom: 16,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Tooltip
            title="Click to copy invite link"
            trigger="hover"
            placement="top"
            styles={{
              body: {
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 14,
              },
            }}
          >
            <div
              style={{
                cursor: "pointer",
                padding: "4px 12px",
                borderRadius: "8px",
                transition: "background-color 0.2s",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Title
                level={2}
                style={{
                  margin: 0,
                }}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  message.success("Lobby link copied! 📋");
                }}
              >
                Lobby #{lobbyId}
              </Title>
            </div>
          </Tooltip>
        </div>

        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <Text strong style={{ fontSize: "36px" }}>
            Game Starts in: {countdown}s
          </Text>
        </div>

        <div>
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
                  <span
                    style={{
                      color:
                        player.username === "Empty Slot"
                          ? undefined
                          : player.ready
                            ? "#11e098"
                            : "red",
                      fontWeight:
                        player.username === "Empty Slot" ? "normal" : "bold",
                    }}
                  >
                    {player.username}
                  </span>
                  <span
                    style={{
                      color:
                        player.username === "Empty Slot"
                          ? undefined
                          : player.ready
                            ? "#11e098"
                            : "red",
                      fontWeight:
                        player.username === "Empty Slot" ? "normal" : "bold",
                    }}
                  >
                    {player.username === "Empty Slot"
                      ? ""
                      : player.ready
                        ? "Ready ✅"
                        : "Not Ready ❌"}
                  </span>
                </div>
              </List.Item>
            )}
          />
        </div>

        <br></br>
        {!lobby?.playerReadyStatuses?.[currentUserId || ""] && (
          <div>
            <Button
              type="primary"
              htmlType="submit"
              onClick={handleReady}
              block
            >
              Ready
            </Button>
          </div>
        )}
      </div>

      {/* Modal for guiding user */}
      <Instructions
        visible={modalVisible}
        steps={steps} // Pass the steps here
        onClose={() => setModalVisible(false)}
      />
    </AntApp>
  );
};

export default LobbyPage;
