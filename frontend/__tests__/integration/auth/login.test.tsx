import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginScreen from "../../../src/screens/authentication/Login";
import { SpinnerProvider } from "../../../src/lib/context/SpinnerContext";
import { ModalProvider } from "../../../src/lib/context/ModalContext";
import { authService } from "../../../src/lib/services/auth";
import { supabase } from "../../../src/lib/supabase/supabase";

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
} as unknown as any;

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <SpinnerProvider>
    <ModalProvider>{children} </ModalProvider>
  </SpinnerProvider>
);

describe("Login Screen Integration Tests", () => {
  beforeEach(async () => {
    await authService.logout();
  });

  it("successful login with valid credentials", async () => {
    const { getByPlaceholderText, getByTestId, queryByText } = render(
      <LoginScreen navigation={mockNavigation} />,
      { wrapper: Wrapper },
    );

    // Enter credentials
    fireEvent.changeText(getByPlaceholderText("email"), "testuser1@gmail.com");
    fireEvent.changeText(getByPlaceholderText("password"), "password1");

    // Press login
    fireEvent.press(getByTestId("login-button"));

    // Verify success
    // 1. Check supabase auth state to confirm login
    await waitFor(
      async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        expect(user).toBeTruthy();
        expect(user?.email).toBe("testuser1@gmail.com");
      },
      { timeout: 10000 },
    );

    // 2. Verify no error message is displayed
    const errorModal = queryByText("Invalid login credentials");
    expect(errorModal).toBeNull();
  });

  it("failed login with invalid credentials shows error message", async () => {
    // Invalid credentials (from auth.test.ts)
    const email = "non.existent.user@example.com";
    const password = "invalidpassword123";

    const { getByPlaceholderText, getByTestId, getByText } = render(
      <LoginScreen navigation={mockNavigation} />,
      { wrapper: Wrapper },
    );

    // Enter credentials
    fireEvent.changeText(getByPlaceholderText("email"), email);
    fireEvent.changeText(getByPlaceholderText("password"), password);

    // Press login
    fireEvent.press(getByTestId("login-button"));

    // Verify error message appears
    await waitFor(() => {
      expect(getByText("Invalid login credentials")).toBeTruthy();
    });

    // Verify NOT logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();
    expect(user).toBeNull();
  });
});
