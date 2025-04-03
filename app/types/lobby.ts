/**
 * Represents the lobby data transfer object as received from the backend.
 */
export interface Lobby {
  id: number;
  // Use string keys because JSON object keys are always strings.
  playerReadyStatuses: { [playerId: string]: boolean };
  // The createdAt field is received as a string; convert it to a Date if needed.
  createdAt: string;
  active: boolean;
  timeLimitSeconds: number;
}
