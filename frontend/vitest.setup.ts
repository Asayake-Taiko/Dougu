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
