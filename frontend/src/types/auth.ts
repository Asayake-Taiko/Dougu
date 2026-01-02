import { UserRecord } from "./db";

export interface AuthResponse {
  user: UserRecord;
  token: string;
}