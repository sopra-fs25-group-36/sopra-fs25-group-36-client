"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Card,
  Typography,
  Avatar,
  Space,
  Alert,
  Descriptions,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import { User } from "@/types/user";
import { LobbySettings, LobbyPlayer, LobbyState } from "@/types/lobby";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

interface LobbyProps {
  initialSettings?: LobbySettings;
}

export const Lobby: React.FC<LobbyProps> = ({ initialSettings }) => {
  const router = useRouter();
  const apiService = useApi();
  const { isAuthenticated, isLoading } = useAuth();
  const { value: currentUser } = useLocalStorage<User | null>(
    "currentUser",
    null
  );
  const [lobbyState, setLobbyState] = useState<LobbyState>({
    settings: initialSettings || {
      lobbyCode: "K9.1#",
      numberOfBounds: 5,
      initialCash: 100000,
      roundDuration: 3,
      marvelSize: 20,
    },
    players: [],
    gameStarted: false,
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isEditingCharacter, setIsEditingCharacter] = useState(false);
  const [newCharacter, setNewCharacter] = useState("AIR");
  const [savingCharacter, setSavingCharacter] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchLobbyState = async () => {
      try {
        const response = await apiService.get<LobbyState>("/lobby");
        setLobbyState(response);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setError("Failed to load lobby data");
        message.error("Failed to load lobby data");
      } finally {
        setLoading(false);
      }
    };

    fetchLobbyState();
  }, [apiService, isAuthenticated, isLoading, router]);

  const handleStartGame = async () => {
    try {
      const response = await apiService.post<LobbyState>("/lobby/start", {});
      setLobbyState(response);
      message.success("Game started!");
      router.push("/game");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to start game";
      setError(errorMessage);
      message.error(errorMessage);
    }
  };

  const handleReadyToggle = async () => {
    if (!currentUser) return;

    try {
      const response = await apiService.post<LobbyPlayer>("/lobby/ready", {});
      setLobbyState((prev) => ({
        ...prev,
        players: prev.players.map((p) =>
          p.id === currentUser.id ? { ...p, status: response.status } : p
        ),
      }));
      message.success(`You are now ${response.status}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update ready status";
      setError(errorMessage);
      message.error(errorMessage);
    }
  };

  const handleSaveCharacter = async () => {
    if (!newCharacter) {
      message.error("Please enter a valid character");
      return;
    }

    setSavingCharacter(true);
    try {
      const response = await apiService.put<LobbyPlayer>(`/lobby/character`, {
        character: newCharacter,
      });
      setLobbyState((prev) => ({
        ...prev,
        players: prev.players.map((p) =>
          p.id === currentUser?.id ? { ...p, character: response.character } : p
        ),
      }));
      message.success("Character updated successfully!");
      setIsEditingCharacter(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update character";
      message.error(errorMessage);
    } finally {
      setSavingCharacter(false);
    }
  };

  const allReady =
    lobbyState.players.length > 0 &&
    lobbyState.players.every((p) => p.status === "Ready");

  if (isLoading || loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  return (
    <div className="card-container">
      <Card className="card">
        <Title level={1} style={{ textAlign: "center" }}>
          Lobby
        </Title>

        <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
          <Descriptions.Item label="Lobby Code">
            {lobbyState.settings.lobbyCode}
          </Descriptions.Item>
          <Descriptions.Item label="Number of Bounds">
            {lobbyState.settings.numberOfBounds}
          </Descriptions.Item>
          <Descriptions.Item label="Initial Cash">
            ${lobbyState.settings.initialCash.toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Round Duration">
            {lobbyState.settings.roundDuration} mins
          </Descriptions.Item>
          <Descriptions.Item label="Marvel Size">
            {lobbyState.settings.marvelSize}
          </Descriptions.Item>
        </Descriptions>

        <Button
          type="primary"
          onClick={handleStartGame}
          disabled={!allReady || lobbyState.gameStarted}
          style={{ marginBottom: 24, width: "100%" }}
        >
          Start Game
        </Button>

        <Title level={3}>Players</Title>
        <Space direction="vertical" style={{ width: "100%" }}>
          {lobbyState.players.map((player) => (
            <Card
              key={player.id}
              style={{
                borderLeft: `4px solid ${
                  player.status === "Ready" ? "#11e098" : "#ff4d4f"
                }`,
                marginBottom: 8,
              }}
            >
              <Space align="center" style={{ width: "100%" }}>
                <Avatar src={`/avatars/avatar_${player.avatar}.jpg`} />
                <div style={{ flex: 1 }}>
                  <Text strong>{player.username}</Text>
                  <div>
                    <Text
                      type={player.status === "Ready" ? "success" : "danger"}
                    >
                      {player.status}!
                    </Text>
                    <Text style={{ marginLeft: 8 }}>{player.character}</Text>
                  </div>
                </div>
                {currentUser && player.id === currentUser.id && (
                  <>
                    <Button size="small" onClick={handleReadyToggle}>
                      {player.status === "Ready" ? "Unready" : "Ready"}
                    </Button>
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setIsEditingCharacter(true);
                        setNewCharacter(player.character);
                      }}
                    />
                  </>
                )}
              </Space>
            </Card>
          ))}
        </Space>

        <Modal
          title="Update Character"
          open={isEditingCharacter}
          onOk={handleSaveCharacter}
          onCancel={() => setIsEditingCharacter(false)}
          confirmLoading={savingCharacter}
        >
          <Form layout="vertical">
            <Form.Item label="New Character" required>
              <Input
                value={newCharacter}
                onChange={(e) => setNewCharacter(e.target.value)}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default Lobby;
