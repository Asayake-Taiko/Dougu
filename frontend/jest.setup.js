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
