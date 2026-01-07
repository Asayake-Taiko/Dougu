import { Session } from "@supabase/supabase-js";
import { AuthResponse } from "../../types/other";
import { db } from "../powersync/PowerSync";
import { Profile } from "../../types/models";
import { generateUUID } from "../utils/UUID";
import { Queries } from "../powersync/queries";

let HARDCODED_PASSWORD = "password";
const HARDCODED_CODE = "22222";

export const mockLogin = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  email = email.toLowerCase();

  if (password !== HARDCODED_PASSWORD) {
    throw new Error("Invalid credentials");
  }
  const start = new Date().getTime();
  while (new Date().getTime() - start < 1000) {
    // Wait for 1 second to simulate network delay
  }

  // Simulating Supabase Auth Login
  // We don't check profiles table for email anymore since it was removed.
  // We just return a session.

  // Ideally, valid user needs to exist in profiles table for other parts of app to work.
  // So we might want to ensure a profile exists for this mocked user?
  // For now, let's assume one exists or we don't care about profile existence for LOGIN success.
  const userId = "mock-user-id-123";

  const session: Session = {
    access_token: "fake-jwt-token-" + userId,
    refresh_token: "fake-refresh-token",
    expires_in: 3600,
    token_type: "bearer",
    user: {
      id: userId,
      aud: "authenticated",
      role: "authenticated",
      email: email,
      app_metadata: {},
      user_metadata: {},
      created_at: new Date().toISOString(),
    },
  };

  return { session };
};

export const mockRegister = async (
  email: string,
  name: string,
  password: string,
): Promise<AuthResponse> => {
  email = email.toLowerCase();

  // In real Supabase, registration creates User in Auth.
  // Then we (client) or trigger creates Profile.
  // Here we do both.

  const newId = generateUUID();
  const now = new Date().toISOString();

  // Insert Profile
  await db.execute(Queries.Profile.insert, [
    newId,
    name,
    "default", // profile_image placeholder
    now,
    now,
  ]);

  const session: Session = {
    access_token: "fake-jwt-token-" + newId,
    refresh_token: "fake-refresh-token",
    expires_in: 3600,
    token_type: "bearer",
    user: {
      id: newId,
      aud: "authenticated",
      role: "authenticated",
      email: email,
      app_metadata: {},
      user_metadata: {},
      created_at: now,
    },
  };

  return { session };
};

export const mockSendCode = async (email: string): Promise<void> => {
  // Just pretend it worked
};

export const mockResetPassword = async (
  email: string,
  code: string,
  new_password: string,
): Promise<void> => {
  if (code !== HARDCODED_CODE) {
    throw new Error("Invalid code");
  }
};

export const mockUpdateProfileImage = async (
  profile: Profile,
  profileImage: string,
): Promise<void> => {
  await profile.updateProfileImage(db, profileImage);
};

export const mockUpdatePassword = async (
  profile: Profile,
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  if (currentPassword !== HARDCODED_PASSWORD) {
    throw new Error("Current password is incorrect");
  }
  HARDCODED_PASSWORD = newPassword;
};

export const mockUpdateName = async (
  profile: Profile,
  name: string,
): Promise<void> => {
  await profile.updateName(db, name);
};

export const mockUpdateEmail = async (
  profile: Profile,
  newEmail: string,
  code: string,
): Promise<void> => {
  if (code !== HARDCODED_CODE) {
    throw new Error("Invalid code");
  }
  // No-op on profile table as it has no email
};

export const mockDeleteAccount = async (profile: Profile): Promise<void> => {
  await db.execute(Queries.Profile.delete, [profile.id]);
};
