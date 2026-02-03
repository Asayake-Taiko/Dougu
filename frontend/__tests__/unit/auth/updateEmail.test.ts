import { authService } from "../../../src/lib/services/auth";
import {
  deleteAllMessages,
  findLatestEmail,
  extractCodeFromEmail,
} from "../../utils/mailpit";
import { generateUUID } from "../../../src/lib/utils/UUID";

describe("AuthService Update Email Tests", () => {
  beforeEach(async () => {
    await authService.logout();
    await deleteAllMessages();
  });

  it("update email flow", async () => {
    const randomStr = generateUUID();
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
