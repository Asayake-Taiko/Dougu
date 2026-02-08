import React from "react";
import { render } from "@testing-library/react-native";
import { ModalProvider } from "../../../src/lib/context/ModalContext";

// Mock environment variables
process.env.EXPO_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-key";
process.env.EXPO_PUBLIC_POWERSYNC_URL = "https://test.powersync.com";

// Mock supabase client
jest.mock("../../../src/lib/supabase/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// Mock context hooks (except ModalContext - we'll use the real one)
jest.mock("../../../src/lib/context/MembershipContext", () => ({
  useMembership: jest.fn(),
}));

jest.mock("../../../src/lib/context/SpinnerContext", () => ({
  useSpinner: jest.fn(() => ({
    showSpinner: jest.fn(),
    hideSpinner: jest.fn(),
  })),
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(() => ({
    goBack: jest.fn(),
    getParent: jest.fn(() => ({
      goBack: jest.fn(),
    })),
  })),
}));

jest.mock("../../../src/lib/utils/Logger", () => ({
  Logger: {
    error: jest.fn(),
  },
}));

// Helper to render component with ModalProvider
export const renderWithModal = (component: React.ReactElement) => {
  return render(<ModalProvider>{component}</ModalProvider>);
};
