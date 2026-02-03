import { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "../supabase/supabase";

export function handleSupabaseError(error: PostgrestError): never {
  if (error.code === "23503") {
    // Foreign Key Violation
    throw new Error("Invalid reference: User or Organization not found.");
  }

  if (error.code === "42501") {
    // RLS Policy Violation (Insufficient Privilege)
    throw new Error("Permission denied or Resource not found.");
  }

  if (error.code === "22P02") {
    // Postgres: invalid input syntax for type uuid
    throw new Error("Invalid ID format.");
  }

  if (error.code === "23505") {
    // Unique Violation
    if (error.message?.includes("organizations_access_code_key")) {
      throw new Error("Organization code is already taken!");
    }
    if (error.message?.includes("org_memberships_user_org_unique")) {
      throw new Error("You are already a member of this organization.");
    }
    throw new Error("Resource already exists.");
  }

  throw new Error(error.message || "An unexpected error occurred.");
}

export async function isManager(orgId: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: org } = await supabase
    .from("organizations")
    .select("manager_id")
    .eq("id", orgId)
    .maybeSingle();

  return org?.manager_id === user.id;
}
