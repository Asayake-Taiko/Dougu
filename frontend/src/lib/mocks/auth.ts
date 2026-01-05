import { AuthResponse } from "../../types/other";
import { db } from "../powersync/PowerSync";
import { UserRecord } from "../../types/db";
import { User } from "../../types/models";
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

  const result = await db.getAll(Queries.User.getByEmail, [email]);
  if (result.length > 0) {
    const user = result[0] as UserRecord;

    return {
      user,
      token: "fake-jwt-token-" + user.id,
    } as AuthResponse;
  } else {
    throw new Error("User not found");
  }
};

export const mockRegister = async (
  email: string,
  name: string,
  password: string,
): Promise<AuthResponse> => {
  email = email.toLowerCase();

  const existing = await db.getAll(Queries.User.getByEmail, [email]);
  if (existing.length > 0) {
    throw new Error("User already exists");
  }

  const newId = generateUUID();
  const now = new Date().toISOString();

  await db.execute(Queries.User.insert, [
    newId,
    email,
    name,
    "default",
    now,
    now,
  ]);

  const user: UserRecord = {
    id: newId,
    full_name: name,
    email: email,
    profile: "default",
    created_at: now,
    updated_at: now,
  };

  return {
    user,
    token: "fake-jwt-token-" + newId,
  } as AuthResponse;
};

export const mockSendCode = async (email: string): Promise<void> => {
  email = email.toLowerCase();
  const result = await db.getAll(Queries.User.getByEmail, [email]);
  if (result.length === 0) {
    throw new Error("Email not found");
  }
};

export const mockResetPassword = async (
  email: string,
  code: string,
  new_password: string,
): Promise<void> => {
  email = email.toLowerCase();

  const result = await db.getAll(Queries.User.getByEmail, [email]);
  if (result.length === 0) {
    throw new Error("Email not found");
  }

  if (code !== HARDCODED_CODE) {
    throw new Error("Invalid code");
  }
};

export const mockUpdateProfile = async (
  user: User,
  profileKey: string,
): Promise<void> => {
  await user.updateProfile(db, profileKey);
};

export const mockUpdatePassword = async (
  user: User,
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  if (currentPassword !== HARDCODED_PASSWORD) {
    throw new Error("Current password is incorrect");
  }
  HARDCODED_PASSWORD = newPassword;
};

export const mockUpdateName = async (
  user: User,
  name: string,
): Promise<void> => {
  await user.updateName(db, name);
};

export const mockUpdateEmail = async (
  user: User,
  newEmail: string,
  code: string,
): Promise<void> => {
  newEmail = newEmail.toLowerCase();

  if (code !== HARDCODED_CODE) {
    throw new Error("Invalid code");
  }

  const existing = await db.getAll(Queries.User.getByEmail, [newEmail]);
  if (existing.length > 0) {
    throw new Error("New email already in use");
  }

  await user.updateEmail(db, newEmail);
};

export const mockDeleteAccount = async (email: string): Promise<void> => {
  email = email.toLowerCase();
  await db.execute(Queries.User.deleteByEmail, [email]);
};
