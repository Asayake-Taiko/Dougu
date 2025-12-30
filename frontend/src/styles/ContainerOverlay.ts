import { StyleSheet, Dimensions } from "react-native";
import { Colors, Spacing } from "./global";

const { width: windowWidth } = Dimensions.get("window");

export const ContainerOverlayStyles = StyleSheet.create({
  backDrop: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    flex: 1,
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  equipmentRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    width: "100%",
    alignItems: "center",
    height: 130, // Fixed height to keep rows at the top
  },
  equipmentItemContainer: {
    width: "33.33%",
    alignItems: "center",
  },
  itemContainer: {
    marginTop: Spacing.xs,
    justifyContent: "flex-start", // Align items to top
    alignItems: "center",
    width: "85%",
    height: 450,
    borderRadius: Spacing.lg,
  },
  itemPage: {
    display: "flex",
    flexDirection: "column",
    width: windowWidth * 0.85,
    height: "100%",
    padding: Spacing.sm,
    justifyContent: "flex-start", // Align rows to top
    gap: Spacing.sm,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.black,
  },
  titleContainer: {
    alignItems: "center",
    height: 80, // Static height instead of dynamic
    marginTop: 80,
  },
  pagesContainer: {
    display: "flex",
    flexDirection: "row",
  },
});
