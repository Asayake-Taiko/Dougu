import { authService } from "../../src/lib/services/auth";

describe("AuthService Login Tests", () => {
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
