import { authService } from "../../../src/lib/services/auth";
import { generateUUID } from "../../../src/lib/utils/UUID";

describe("AuthService Update Password Tests", () => {
  beforeEach(async () => {
    await authService.logout();
  });

  it("update password flow", async () => {
    const randomStr = generateUUID();
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
