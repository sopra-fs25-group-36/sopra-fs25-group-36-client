// app/types/lobby.ts
import { User } from "./user"; // Import your existing User type

export interface LobbySettings {
  lobbyCode: string;
  numberOfBounds: number;
  initialCash: number;
  roundDuration: number; // in minutes
  marvelSize: number;
}

// Extend your existing User interface with lobby-specific properties
export interface LobbyPlayer extends User {
  status: 'Ready' | 'Not Ready';
  character: string;
}

export interface LobbyState {
  settings: LobbySettings;
  players: LobbyPlayer[];
  gameStarted: boolean;
  canStart?: boolean; // Optional helper flag
}

// Additional types that might be useful
export interface JoinLobbyResponse {
  success: boolean;
  lobby: LobbyState;
  message?: string;
}

export interface LobbyUpdateEvent {
  type: 'player-joined' | 'player-left' | 'player-ready' | 'game-started';
  player?: LobbyPlayer;
  lobby: LobbyState;
}