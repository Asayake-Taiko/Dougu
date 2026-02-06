import { authService } from "../../../../src/lib/services/auth";
import {
  deleteAllMessages,
  findLatestEmail,
  extractCodeFromEmail,
} from "../../utils/mailpit";
import { generateUUID } from "../../../../src/lib/utils/UUID";
import { describe, it, expect, beforeEach } from "vitest";

describe("AuthService Password Reset Tests", () => {
  beforeEach(async () => {
    await authService.logout();
    await deleteAllMessages();
  });

  it("failing reset password flow", async () => {
    const email = `reset-fail-${generateUUID()}@example.com`;
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
    const email = `reset-success-${generateUUID()}@example.com`;
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
