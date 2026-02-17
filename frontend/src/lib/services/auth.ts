import { supabase } from "../supabase/supabase";

export interface IAuthService {
  login(email: string, password: string): Promise<void>;
  register(email: string, name: string, password: string): Promise<void>;
  logout(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  confirmResetPassword(
    email: string,
    code: string,
    password: string,
    newPassword: string,
  ): Promise<void>;
  updateProfile(profileImage: string, color: string): Promise<void>;
  updateName(name: string): Promise<void>;
  sendEmailUpdateCode(email: string): Promise<void>;
  confirmEmailUpdate(email: string, code: string): Promise<void>;
  updatePassword(currentPassword: string, newPassword: string): Promise<void>;
  deleteAccount(): Promise<void>;
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
          profile_image: "default_profile",
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
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error: any) {
      if (error.message === "Auth session missing!") {
        return;
      }
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      throw error;
    }
  }

  async confirmResetPassword(
    email: string,
    code: string,
    password: string,
    newPassword: string,
  ): Promise<void> {
    if (password !== newPassword) {
      throw new Error("Passwords do not match");
    }
    const { error: otpError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "recovery",
    });
    if (otpError) {
      throw otpError;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (updateError) {
      throw updateError;
    }
  }

  async updateProfile(profileImage: string, color: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("No user session found");
    }

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("profiles")
      .update({
        profile_image: profileImage,
        color,
        updated_at: now,
      })
      .eq("id", user.id);

    if (error) {
      throw error;
    }
  }

  async updateName(name: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("No user session found");
    }

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        updated_at: now,
      })
      .eq("id", user.id);

    if (error) {
      throw error;
    }
  }

  async sendEmailUpdateCode(email: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      email,
    });
    if (error) {
      throw error;
    }
  }

  async confirmEmailUpdate(newEmail: string, code: string): Promise<void> {
    if (!code) {
      throw new Error("No code provided");
    }
    const { error } = await supabase.auth.verifyOtp({
      email: newEmail,
      token: code,
      type: "email_change",
    });
    if (error) {
      throw error;
    }
  }

  async updatePassword(
    newPassword: string,
    confirmPassword: string,
  ): Promise<void> {
    if (newPassword !== confirmPassword) {
      throw new Error("Passwords do not match");
    }
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      throw error;
    }
  }

  async deleteAccount(): Promise<void> {
    // if the user owns any organizations, throw an error
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("No user session found");
    }
    const { data: organizations, error: orgError } = await supabase
      .from("organizations")
      .select("*")
      .eq("manager_id", user.id);
    if (orgError) {
      throw orgError;
    }
    if (organizations && organizations.length > 0) {
      throw new Error(
        "You own organizations. Please transfer ownership before deleting your account.",
      );
    }

    // delete the user
    const { error } = await supabase.functions.invoke("delete-account");
    if (error) {
      throw error;
    }
    await supabase.auth.signOut();
  }
}

// Singleton instance export
export const authService = new AuthService();
