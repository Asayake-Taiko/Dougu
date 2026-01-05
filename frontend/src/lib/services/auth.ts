import { AuthResponse } from "../../types/other";
import { User } from "../../types/models";
import {
  mockLogin,
  mockRegister,
  mockSendCode,
  mockResetPassword,
  mockUpdateProfile,
  mockUpdateName,
  mockUpdateEmail,
  mockUpdatePassword,
  mockDeleteAccount,
} from "../mocks/auth";
import { MOCK_ENABLED } from "../utils/env";

export interface IAuthService {
  login(email: string, password: string): Promise<AuthResponse>;
  register(
    email: string,
    name: string,
    password: string,
  ): Promise<AuthResponse>;
  logout(): Promise<void>;
  resetPassword(
    email: string,
    code: string,
    new_password: string,
  ): Promise<void>;
  sendCode(email: string): Promise<void>;
  updateProfile(user: User, profileKey: string): Promise<void>;
  updateName(user: User, name: string): Promise<void>;
  updateEmail(user: User, email: string, code: string): Promise<void>;
  updatePassword(
    user: User,
    currentPassword: string,
    newPassword: string,
  ): Promise<void>;
  deleteAccount(user: User): Promise<void>;
}

export class MockAuthService implements IAuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    return mockLogin(email, password);
  }

  async register(
    email: string,
    name: string,
    password: string,
  ): Promise<AuthResponse> {
    return mockRegister(email, name, password);
  }

  async logout(): Promise<void> {
    // No-op for mock
  }

  async resetPassword(
    email: string,
    code: string,
    new_password: string,
  ): Promise<void> {
    return mockResetPassword(email, code, new_password);
  }

  async sendCode(email: string): Promise<void> {
    return mockSendCode(email);
  }

  async updateProfile(user: User, profileKey: string): Promise<void> {
    return mockUpdateProfile(user, profileKey);
  }

  async updateName(user: User, name: string): Promise<void> {
    return mockUpdateName(user, name);
  }

  async updateEmail(user: User, email: string, code: string): Promise<void> {
    return mockUpdateEmail(user, email, code);
  }

  async updatePassword(
    user: User,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    return mockUpdatePassword(user, currentPassword, newPassword);
  }

  async deleteAccount(user: User): Promise<void> {
    return mockDeleteAccount(user.email);
  }
}

export class AuthService implements IAuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    throw new Error("Real login not implemented");
  }

  async register(
    email: string,
    name: string,
    password: string,
  ): Promise<AuthResponse> {
    throw new Error("Real register not implemented");
  }

  async logout(): Promise<void> {
    throw new Error("Real logout not implemented");
  }

  async resetPassword(
    email: string,
    code: string,
    new_password: string,
  ): Promise<void> {
    throw new Error("Real reset password not implemented");
  }

  async sendCode(email: string): Promise<void> {
    throw new Error("Real send code not implemented");
  }

  async updateProfile(user: User, profileKey: string): Promise<void> {
    throw new Error("Real update profile not implemented");
  }

  async updateName(user: User, name: string): Promise<void> {
    throw new Error("Real update name not implemented");
  }

  async updateEmail(user: User, email: string, code: string): Promise<void> {
    throw new Error("Real update email not implemented");
  }

  async updatePassword(
    user: User,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    throw new Error("Real update password not implemented");
  }

  async deleteAccount(user: User): Promise<void> {
    throw new Error("Real delete account not implemented");
  }
}

// Singleton instance export
export const authService = MOCK_ENABLED
  ? new MockAuthService()
  : new AuthService();
