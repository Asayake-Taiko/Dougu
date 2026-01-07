import { Session } from "@supabase/supabase-js";
import { ProfileRecord } from "./db";

export interface AuthResponse {
  session: Session;
}

// equipment item background colors should be Hex
export type Hex = `#${string}`;
