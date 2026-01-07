import { Profile } from "../../types/models";
import {
  mockLogin,
  mockRegister,
  mockSendCode,
  mockResetPassword,
  mockUpdateProfileImage,
  mockUpdateName,
  mockUpdateEmail,
  mockUpdatePassword,
  mockDeleteAccount,
} from "../mocks/auth";
import { MOCK_ENABLED } from "../utils/env";
import { supabase } from "../supabase/supabase";

export interface IAuthService {
  login(email: string, password: string): Promise<void>;
  register(email: string, name: string, password: string): Promise<void>;
  logout(): Promise<void>;
  resetPassword(
    email: string,
    code: string,
    new_password: string,
  ): Promise<void>;
  sendCode(email: string): Promise<void>;
  updateProfileImage(profile: Profile, profileImage: string): Promise<void>;
  updateName(profile: Profile, name: string): Promise<void>;
  updateEmail(profile: Profile, email: string, code: string): Promise<void>;
  updatePassword(
    profile: Profile,
    currentPassword: string,
    newPassword: string,
  ): Promise<void>;
  deleteAccount(profile: Profile): Promise<void>;
}

export class MockAuthService implements IAuthService {
  async login(email: string, password: string): Promise<void> {
    const res = await mockLogin(email, password);
    // @ts-ignore
    return { session: { user: res.user, access_token: res.token } as any };
  }

  async register(email: string, name: string, password: string): Promise<void> {
    const res = await mockRegister(email, name, password);
    // @ts-ignore
    return { session: { user: res.user, access_token: res.token } as any };
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

  async updateProfileImage(
    profile: Profile,
    profileImage: string,
  ): Promise<void> {
    // @ts-ignore
    return mockUpdateProfileImage(profile, profileImage);
  }

  async updateName(profile: Profile, name: string): Promise<void> {
    // @ts-ignore
    return mockUpdateName(profile, name);
  }

  async updateEmail(
    profile: Profile,
    email: string,
    code: string,
  ): Promise<void> {
    // @ts-ignore
    return mockUpdateEmail(profile, email, code);
  }

  async updatePassword(
    profile: Profile,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    // @ts-ignore
    return mockUpdatePassword(profile, currentPassword, newPassword);
  }

  async deleteAccount(profile: Profile): Promise<void> {
    // @ts-ignore
    return mockDeleteAccount(profile);
  }
}

export class AuthService implements IAuthService {
  async login(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw error;
    }
  }

  async register(email: string, name: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          profile_image: "default",
        },
      },
    });
    if (error) {
      throw error;
    }
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (loginError) {
      throw loginError;
    }
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
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

  async updateProfileImage(
    profile: Profile,
    profileImage: string,
  ): Promise<void> {
    throw new Error("Real update profile image not implemented");
  }

  async updateName(profile: Profile, name: string): Promise<void> {
    throw new Error("Real update name not implemented");
  }

  async updateEmail(
    profile: Profile,
    email: string,
    code: string,
  ): Promise<void> {
    throw new Error("Real update email not implemented");
  }

  async updatePassword(
    profile: Profile,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    throw new Error("Real update password not implemented");
  }

  async deleteAccount(profile: Profile): Promise<void> {
    throw new Error("Real delete account not implemented");
  }
}

// Singleton instance export
export const authService = MOCK_ENABLED
  ? new MockAuthService()
  : new AuthService();
