import { authService } from "../../../src/lib/services/auth";
import { describe, it, expect } from "vitest";

describe("AuthService Logout Tests", () => {
  it("logout should succeed", async () => {
    await expect(authService.logout()).resolves.not.toThrow();
  });
});
