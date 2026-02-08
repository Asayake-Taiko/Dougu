/* global jest */
import dotenv from "dotenv";

// hide dotenv logs
const originalLog = console.log;
console.log = (...args) => {
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

jest.mock("@expo/vector-icons", () => ({
  MaterialCommunityIcons: "MaterialCommunityIcons",
}));
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
