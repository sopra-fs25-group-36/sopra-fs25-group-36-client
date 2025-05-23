export interface Lobby {
  id: number;
  playerReadyStatuses: Record<string, boolean>;
  createdAt: number;
  active: boolean;
  timeLimitSeconds: number;
}
