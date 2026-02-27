export const AppState = {
  addEventListener: () => ({ remove: () => {} }),
  removeEventListener: () => { },
};
export const Platform = {
  OS: "node",
  select: (obj: any) => obj.default || obj.ios || obj.android,
};
export const StyleSheet = {
  create: (obj: any) => obj,
};
export const NativeModules = {};
export default {
  AppState,
  Platform,
  StyleSheet,
  NativeModules,
};
