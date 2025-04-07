export interface User {
  id: number;
  username: string;
  password: string;
  birthday: Date | null; // Change to Date | null
  avatar?: number;
  token: string | null;
  status: string | null;
  creation: Date | null; // Change to Date | null
}