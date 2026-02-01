import { authService } from "../../src/lib/services/auth";
import { supabase } from "../../src/lib/supabase/supabase";
import {
  deleteAllMessages,
  findLatestEmail,
  extractCodeFromEmail,
} from "../utils/mailpit";

describe("AuthService Login Tests", () => {
  beforeEach(async () => {
    await authService.logout();
  });

  it("login with invalid credentials should fail", async () => {
    const email = "non.existent.user@example.com";
    const password = "invalidpassword123";

    await expect(authService.login(email, password)).rejects.toThrow(
      "Invalid login credentials",
    );
  });

  it("login with valid credentials should succeed", async () => {
    const email = "kal036@ucsd.edu";
    const password = "password1";

    await expect(authService.login(email, password)).resolves.not.toThrow();
  });
});

describe("AuthService Register Tests", () => {
  beforeEach(async () => {
    await authService.logout();
  });

  it("register with valid credentials should succeed", async () => {
    const randomStr = Math.random().toString(36).substring(7);
    const email = `test-${randomStr}@example.com`;
    const password = "password123";
    const name = `Test User ${randomStr}`;

    await expect(
      authService.register(email, name, password),
    ).resolves.not.toThrow();
  });

  it("registering an existing user should fail", async () => {
    const email = "kal036@ucsd.edu";
    const password = "password091";
    const name = "John Doe";

    await expect(authService.register(email, name, password)).rejects.toThrow(
      "User already registered",
    );
  });

  it("register with invalid email should fail", async () => {
    const email = "invalid-email";
    const password = "password123";
    const name = "John Doe";

    await expect(authService.register(email, name, password)).rejects.toThrow(
      "Unable to validate email address: invalid format",
    );
  });

  it("register with weak password should fail", async () => {
    const email = "test@example.com";
    const password = "123";
    const name = "June Pineapple";

    await expect(authService.register(email, name, password)).rejects.toThrow(
      "Password should be at least 6 characters.",
    );
  });
});

describe("AuthService Logout Tests", () => {
  it("logout should succeed", async () => {
    await expect(authService.logout()).resolves.not.toThrow();
  });
});

describe("AuthService Password Reset Tests", () => {
  beforeEach(async () => {
    await authService.logout();
    await deleteAllMessages();
  });

  it("failing reset password flow", async () => {
    const randomStr = Math.random().toString(36).substring(7);
    const email = `reset-fail-${randomStr}@example.com`;
    const password = "password123";
    const name = "Reset User";
    const newPassword = "newpassword123";

    await authService.register(email, name, password);

    // 1. Request password reset
    await expect(authService.resetPassword(email)).resolves.not.toThrow();

    // 2. Find latest email
    const emailMsg = await findLatestEmail(email);
    expect(emailMsg).not.toBeNull();

    // 3. Extract code
    const code = extractCodeFromEmail(emailMsg!.HTML || emailMsg!.Text || "");
    expect(code).toBeTruthy();

    // 4. Confirm reset with wrong password fails
    await expect(
      authService.confirmResetPassword(email, code!, password, newPassword),
    ).rejects.toThrow("Passwords do not match");

    // 5. Confirm reset with weak password fails
    await expect(
      authService.confirmResetPassword(email, code!, "123", "123"),
    ).rejects.toThrow("Password should be at least 6 characters.");

    // 6. Confirm reset with wrong code fails
    await expect(
      authService.confirmResetPassword(
        email,
        "wrongcode",
        newPassword,
        newPassword,
      ),
    ).rejects.toThrow("Token has expired or is invalid");
  });

  it("successful reset password flow", async () => {
    const randomStr = Math.random().toString(36).substring(7);
    const email = `reset-success-${randomStr}@example.com`;
    const password = "password123";
    const name = "Reset User";
    const newPassword = "newpassword123";

    await authService.register(email, name, password);

    // 1. Request password reset
    await expect(authService.resetPassword(email)).resolves.not.toThrow();

    // 2. Find latest email
    const emailMsg = await findLatestEmail(email);
    expect(emailMsg).not.toBeNull();

    // 3. Extract code
    const code = extractCodeFromEmail(emailMsg!.HTML || emailMsg!.Text || "");
    expect(code).toBeTruthy();

    // 4. Login before confirming reset should fail
    await expect(authService.login(email, newPassword)).rejects.toThrow(
      "Invalid login credentials",
    );

    // 5. Confirm reset with correct password succeeds
    await expect(
      authService.confirmResetPassword(email, code!, newPassword, newPassword),
    ).resolves.not.toThrow();

    // 6. Verify login with NEW password succeeds
    await expect(authService.login(email, newPassword)).resolves.not.toThrow();

    // 7. Verify login with OLD password fails
    await expect(authService.login(email, password)).rejects.toThrow();
  });
});

describe("AuthService Update Password Tests", () => {
  beforeEach(async () => {
    await authService.logout();
  });

  it("update password flow", async () => {
    const randomStr = Math.random().toString(36).substring(7);
    const email = `pwd-update-${randomStr}@example.com`;
    const oldPassword = "oldPassword123";
    const newPassword = "newPassword123";
    const name = "Update Pwd User";

    // 1. Register and login
    await authService.register(email, name, oldPassword);

    // 2. Update with weak password should fail
    await expect(authService.updatePassword("123", "123")).rejects.toThrow(
      "Password should be at least 6 characters.",
    );

    // 3. Mismatching passwords should fail
    await expect(
      authService.updatePassword(oldPassword, newPassword),
    ).rejects.toThrow("Passwords do not match");

    // 4. Update password
    await expect(
      authService.updatePassword(newPassword, newPassword),
    ).resolves.not.toThrow();

    // 5. Logout
    await authService.logout();

    // 6. Verify login with new password
    await expect(authService.login(email, newPassword)).resolves.not.toThrow();

    // 7. Verify login with old password fails
    await expect(authService.login(email, oldPassword)).rejects.toThrow();
  });
});

describe("AuthService Update Email Tests", () => {
  beforeEach(async () => {
    await authService.logout();
    await deleteAllMessages();
  });

  it("update email flow", async () => {
    const randomStr = Math.random().toString(36).substring(7);
    const oldEmail = `old-email-${randomStr}@example.com`;
    const newEmail = `new-email-${randomStr}@example.com`;
    const password = "password123";
    const name = "Update Email User";

    // 1. Register and login
    await authService.register(oldEmail, name, password);

    // 2. Request email update
    await expect(
      authService.sendEmailUpdateCode(newEmail),
    ).resolves.not.toThrow();

    // 3. Find latest email sent to NEW email
    const emailMsg = await findLatestEmail(newEmail);
    expect(emailMsg).not.toBeNull();

    // 4. Extract OTP code
    const code = extractCodeFromEmail(emailMsg!.HTML || emailMsg!.Text || "");
    expect(code).toBeTruthy();

    // 5. Confirm email update with wrong code fails
    await expect(
      authService.confirmEmailUpdate(newEmail, "wrongcode"),
    ).rejects.toThrow("Token has expired or is invalid");

    // 6. Login with new email before confirming should fail
    await expect(authService.login(newEmail, password)).rejects.toThrow(
      "Invalid login credentials",
    );

    // 7. Confirm email update with correct code succeeds
    await expect(
      authService.confirmEmailUpdate(newEmail, code!),
    ).resolves.not.toThrow();

    // 8. Logout
    await authService.logout();

    // 9. Verify login with new email
    await expect(authService.login(newEmail, password)).resolves.not.toThrow();

    // 10. Verify login with old email fails
    await expect(authService.login(oldEmail, password)).rejects.toThrow(
      "Invalid login credentials",
    );
  });
});

describe("AuthService Profile Update Tests", () => {
  const randomStr = Math.random().toString(36).substring(7);
  const email = `name-update-${randomStr}@example.com`;
  const password = "password123";
  const oldName = `Old Name ${randomStr}`;
  const newName = `New Name ${randomStr}`;
  const newImage = `image-${randomStr}`;

  beforeAll(async () => {
    await authService.logout();
    await authService.register(email, oldName, password);
  });

  it("updateName should update the name in the database", async () => {
    // 1. Get user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    expect(user).not.toBeNull();

    // 2. Update name
    await expect(authService.updateName(newName)).resolves.not.toThrow();

    // 3. Verify name update in DB
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("name, profile_image")
      .eq("id", user!.id)
      .single();

    expect(error).toBeNull();
    expect(profile?.name).toBe(newName);
    expect(profile?.profile_image).toBe("default");
  });

  it("updateProfileImage should update the image in the database", async () => {
    // 1. Fetch current profile to get ID
    const {
      data: { user },
    } = await supabase.auth.getUser();
    expect(user).not.toBeNull();

    // 2. Update profile image
    await expect(
      authService.updateProfileImage(newImage),
    ).resolves.not.toThrow();

    // 3. Verify image update in DB
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("name, profile_image")
      .eq("id", user!.id)
      .single();

    expect(error).toBeNull();
    expect(profile?.name).toBe(newName);
    expect(profile?.profile_image).toBe(newImage);
  });
});
