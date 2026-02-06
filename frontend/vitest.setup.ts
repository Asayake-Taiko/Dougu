import { vi } from "vitest";
import dotenv from "dotenv";

// Compatibility layer for third-party mocks that expect 'jest' global
// @ts-ignore
global.jest = vi;

// hide dotenv logs
const originalLog = console.log;
console.log = (...args: any[]) => {
  if (args[0] && typeof args[0] === "string" && args[0].includes("[dotenv")) {
    return;
  }
  originalLog(...args);
};
dotenv.config();
console.log = originalLog;

process.env.EXPO_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";
process.env.EXPO_PUBLIC_POWERSYNC_URL = "http://127.0.0.1:8080";

// Mock @expo/vector-icons
vi.mock("@expo/vector-icons", () => ({
  MaterialCommunityIcons: "MaterialCommunityIcons",
}));

// Mock @react-native-async-storage/async-storage
vi.mock(
  "@react-native-async-storage/async-storage",
  () =>
    import("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
