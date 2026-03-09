/* global jest */

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
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

// Mock sub-paths for components that import specifically
jest.mock(
  "@expo/vector-icons/MaterialCommunityIcons",
  () => "MaterialCommunityIcons",
);
jest.mock("@expo/vector-icons/FontAwesome", () => "FontAwesome");
jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("@expo/vector-icons/Feather", () => "Feather");

// Mock @react-native-async-storage/async-storage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});
// Mock react-native-worklets
jest.mock("react-native-worklets", () => {
  const serializableMappingCache = {
    set: jest.fn(),
    get: jest.fn(),
  };
  return {
    scheduleOnRN: (fn, ...args) => fn(...args),
    runOnJS: (fn) => fn,
    runOnUI: (fn) => fn,
    createSerializable: (v) => v,
    isSerializableRef: () => false,
    registerCustomSerializable: () => {},
    isSynchronizable: () => false,
    createSynchronizable: (v) => v,
    createWorkletRuntime: () => ({}),
    runOnRuntime: (r, fn) => fn,
    scheduleOnRuntime: (r, fn) => fn,
    RuntimeKind: { JS: 0, UI: 1 },
    getRuntimeKind: () => 0,
    serializableMappingCache,
    shareableMappingCache: serializableMappingCache,
    makeShareable: (v) => v,
    makeShareableCloneOnUIRecursive: (v) => v,
    makeShareableCloneRecursive: (v) => v,
    isShareableRef: () => false,
    scheduleOnUI: (fn) => fn(),
    runOnUIAsync: (fn) => Promise.resolve(fn()),
    runOnUISync: (fn) => fn(),
    executeOnUIRuntimeSync: (fn) => fn(),
  };
});
