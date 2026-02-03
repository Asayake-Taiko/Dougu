import { authService } from "../../../src/lib/services/auth";

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
    const email = "testuser1@gmail.com";
    const password = "password1";

    await expect(authService.login(email, password)).resolves.not.toThrow();
  });
});
