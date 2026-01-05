import { StyleSheet, Dimensions } from "react-native";

const windowWidth = Dimensions.get("window").width;
const equipmentSpacing = windowWidth / 25;

export const ScrollRowStyles = StyleSheet.create({
  item: {
    marginLeft: equipmentSpacing,
  },
  scrollRow: {
    flex: 1,
    flexDirection: "row",
    minWidth: windowWidth,
  },
});
