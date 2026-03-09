import { vi } from "vitest";
import dotenv from "dotenv";

// Compatibility layer for third-party mocks that expect 'jest' global
// @ts-ignore
global.jest = vi;
// @ts-ignore
global.__DEV__ = true;

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
  Ionicons: "Ionicons",
  FontAwesome: "FontAwesome",
  FontAwesome5: "FontAwesome5",
  Feather: "Feather",
  AntDesign: "AntDesign",
  Entypo: "Entypo",
  EvilIcons: "EvilIcons",
  Fontisto: "Fontisto",
  Foundation: "Foundation",
  MaterialIcons: "MaterialIcons",
  Octicons: "Octicons",
  SimpleLineIcons: "SimpleLineIcons",
  Zocial: "Zocial",
}));

vi.mock(
  "@expo/vector-icons/MaterialCommunityIcons",
  () => "MaterialCommunityIcons",
);
vi.mock("@expo/vector-icons/FontAwesome", () => "FontAwesome");
vi.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
vi.mock("@expo/vector-icons/Feather", () => "Feather");

// Mock @react-native-async-storage/async-storage
vi.mock(
  "@react-native-async-storage/async-storage",
  () =>
    import("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Mock react-native-worklets
vi.mock("react-native-worklets", () => {
  const serializableMappingCache = {
    set: vi.fn(),
    get: vi.fn(),
  };
  return {
    scheduleOnRN: (fn: any, ...args: any[]) => fn(...args),
    runOnJS: (fn: any) => fn,
    runOnUI: (fn: any) => fn,
    createSerializable: (v: any) => v,
    isSerializableRef: () => false,
    registerCustomSerializable: () => {},
    isSynchronizable: () => false,
    createSynchronizable: (v: any) => v,
    createWorkletRuntime: () => ({}),
    runOnRuntime: (r: any, fn: any) => fn,
    scheduleOnRuntime: (r: any, fn: any) => fn,
    RuntimeKind: { JS: 0, UI: 1 },
    getRuntimeKind: () => 0,
    serializableMappingCache,
    shareableMappingCache: serializableMappingCache,
    makeShareable: (v: any) => v,
    makeShareableCloneOnUIRecursive: (v: any) => v,
    makeShareableCloneRecursive: (v: any) => v,
    isShareableRef: () => false,
    scheduleOnUI: (fn: any) => fn(),
    runOnUIAsync: (fn: any) => Promise.resolve(fn()),
    runOnUISync: (fn: any) => fn(),
    executeOnUIRuntimeSync: (fn: any) => fn(),
  };
});

// Mock react-native
vi.mock("react-native", () => ({
  AppState: {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  Platform: {
    OS: "node",
    select: (obj: any) => obj.default || obj.ios || obj.android,
  },
  StyleSheet: {
    create: (obj: any) => obj,
  },
  NativeModules: {},
}));

// Mock @powersync/react-native
vi.mock("@powersync/react-native", () => ({
  PowerSyncDatabase: class {
    connect = vi.fn().mockResolvedValue(undefined);
    disconnect = vi.fn().mockResolvedValue(undefined);
    disconnectAndClear = vi.fn().mockResolvedValue(undefined);
  },
  createBaseLogger: vi.fn().mockReturnValue({
    useDefaults: vi.fn(),
    setLevel: vi.fn(),
  }),
  LogLevel: {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    TRACE: 4,
    OFF: 5,
  },
}));

vi.mock(
  "@powersync/react-native/src/db/adapters/react-native-quick-sqlite/ReactNativeQuickSQLiteOpenFactory",
  () => ({
    ReactNativeQuickSqliteOpenFactory: class {},
  }),
);
