"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { App as AntApp, Typography, List, Button, Tooltip } from "antd";
import Logo from "@/components/Logo";
import { useApi } from "@/hooks/useApi";
import { Lobby } from "@/types/lobby";

const { Title, Text } = Typography;
const TOTAL_SLOTS = 5;

export default function LobbyPage() {
  const { id: lobbyId } = useParams<{ id: string }>();
  const router = useRouter();
  const api = useApi();
  const { message } = AntApp.useApp();

  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [countdown, setCountdown] = useState(0);
  const [currentUserId, setCurrentUserId] = useState("");
  const [startInitiated, setStartInitiated] = useState(false);

  useEffect(() => setCurrentUserId(localStorage.getItem("id") ?? ""), []);

  /* -------- fetch lobby -------- */
  const fetchLobby = useCallback(async () => {
    try {
      const data = await api.get<Lobby>(`/lobby/${lobbyId}`);
      setLobby(data);
    } catch {
      message.error("Failed to load lobby");
    }
  }, [api, lobbyId, message]);

  useEffect(() => {
    fetchLobby();
    const int = setInterval(fetchLobby, 2000);
    return () => clearInterval(int);
  }, [fetchLobby]);

  /* -------- derived countdown -------- */
  useEffect(() => {
    if (!lobby || startInitiated) return;
    const endTime = lobby.createdAt + lobby.timeLimitSeconds * 1000;

    const tick = () => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining === 0) router.replace(`/users/${currentUserId}`);
    };

    tick();
    const int = setInterval(tick, 1000);
    return () => clearInterval(int);
  }, [lobby, router, currentUserId, startInitiated]);

  /* -------- when EVERYONE is ready, start the game -------- */
  useEffect(() => {
    if (!lobby || startInitiated) return;

    const allReady = Object.values(lobby.playerReadyStatuses).every(Boolean);
    if (!allReady) return;

    const hostId = Math.min(
      ...Object.keys(lobby.playerReadyStatuses).map(Number)
    );
    const amHost = Number(currentUserId) === hostId;

    (async () => {
      if (amHost) {
        try {
          setStartInitiated(true);
          await api.post(`/game/${lobbyId}/start?gameId=${lobbyId}`, {});
        } catch (err) {
          // If we lost the race, the game is likely already started – ignore
          console.warn("Start failed (likely already started)", err);
        }
      }

      const checkIfGameReady = async () => {
        try {
          await api.get(`/game/${lobbyId}`);
          router.push(`/lobby/${lobbyId}/leader_board`);
        } catch (err) {
          console.log("Game not ready yet waiting...");
          setTimeout(checkIfGameReady, 500);
        }
      };

      await checkIfGameReady();
    })();
  }, [lobby, api, lobbyId, router, currentUserId, startInitiated]);

  /* -------- usernames -------- */
  useEffect(() => {
    if (!lobby) return;
    const ids = Object.keys(lobby.playerReadyStatuses);
    ids.forEach(async (id) => {
      if (userMap[id]) return;
      try {
        const { username } = await api.get<{ username: string }>(
          `/users/${id}`
        );
        setUserMap((prev) => ({ ...prev, [id]: username }));
      } catch {
        setUserMap((prev) => ({ ...prev, [id]: `User ${id}` }));
      }
    });
  }, [lobby, api, userMap]);

  /* -------- ready -------- */
  const handleReady = async () => {
    try {
      await api.post(`/lobby/${lobbyId}/ready`, {
        userId: Number(currentUserId),
      });
    } catch {
      message.error("❌ Could not update ready status");
    }
  };

  /* -------- show instruction -------- */
  const handleShowInstruction = () => {
    router.push(`/lobby/${lobbyId}/instruction`);
  };

  /* -------- players with placeholders -------- */
  const players = lobby
    ? [
      ...Object.entries(lobby.playerReadyStatuses).map(([uid, ready]) => ({
        uid,
        username: userMap[uid] ?? `User ${uid}`,
        ready,
      })),
      ...Array.from(
        {
          length: Math.max(
            0,
            TOTAL_SLOTS - Object.keys(lobby.playerReadyStatuses).length
          ),
        },
        () => ({ uid: "", username: "Empty Slot", ready: false })
      ),
    ]
    : [];

  /* -------- render -------- */
  return (
    <AntApp>
      <div style={{ maxWidth: 400, margin: "20px auto", padding: 16 }}>
        <Logo />
        <br />

        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <Tooltip title="Copy invite link">
            <Title
              level={2}
              style={{ cursor: "pointer" }}
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                message.success("Lobby link copied!");
              }}
            >
              Lobby #{lobbyId}
            </Title>
          </Tooltip>
        </div>

        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <Text strong style={{ fontSize: 36 }}>
            Game starts in: {countdown}s
          </Text>
        </div>

        <List
          bordered
          dataSource={players}
          renderItem={({ username, ready }) => (
            <List.Item>
              <span
                style={{
                  fontWeight: username === "Empty Slot" ? "normal" : "bold",
                  color:
                    username === "Empty Slot"
                      ? undefined
                      : ready
                        ? "#11e098"
                        : "red",
                }}
              >
                {username}
              </span>
              <span
                style={{
                  fontWeight: username === "Empty Slot" ? "normal" : "bold",
                  color:
                    username === "Empty Slot"
                      ? undefined
                      : ready
                        ? "#11e098"
                        : "red",
                }}
              >
                {username === "Empty Slot"
                  ? ""
                  : ready
                    ? "Ready ✅"
                    : "Not Ready ❌"}
              </span>
            </List.Item>
          )}
        />

        {!lobby?.playerReadyStatuses?.[currentUserId] && (
          <Button
            type="primary"
            block
            onClick={handleReady}
            style={{ marginTop: 16 }}
          >
            Ready
          </Button>
        )}

        <Button block onClick={handleShowInstruction} style={{ marginTop: 8 }}>
          Show Instruction
        </Button>
      </div>
    </AntApp>
  );
}
