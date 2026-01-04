import { UserRecord } from "./db";

export interface AuthResponse {
  user: UserRecord;
  token: string;
}

// equipment item background colors should be Hex
export type Hex = `#${string}`;