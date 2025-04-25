export interface Lobby {
  id: number;
  playerReadyStatuses: Record<string, boolean>;
  createdAt: number;          // epoch millis
  active: boolean;
  timeLimitSeconds: number;
}
