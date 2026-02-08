import { authService } from "../../../src/lib/services/auth";

describe("AuthService Logout Tests", () => {
  it("logout should succeed", async () => {
    await expect(authService.logout()).resolves.not.toThrow();
  });
});
