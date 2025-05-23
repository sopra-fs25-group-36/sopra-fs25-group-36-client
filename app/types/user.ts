export interface User {
  id: number;
  username: string;
  password: string;
  avatar?: number;
  token: string | null;
  status: string | null;
  creation: Date | null;
}