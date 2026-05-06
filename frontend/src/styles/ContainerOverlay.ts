import { StyleSheet, Dimensions } from "react-native";
import { Colors, Spacing } from "./global";

const { width: windowWidth, height: windowHeight } = Dimensions.get("window");

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
    height: 120, // Fixed height to keep rows at the top
  },
  equipmentItemContainer: {
    width: "33.33%",
    alignItems: "center",
  },
  itemContainer: {
    marginTop: 0,
    width: "85%",
    height: windowHeight * 0.55,
    borderRadius: Spacing.lg,
  },
  itemPage: {
    display: "flex",
    flexDirection: "column",
    width: windowWidth * 0.85,
    height: "100%",
    paddingHorizontal: Spacing.sm,
    paddingTop: 30,
    paddingBottom: 30,
    justifyContent: "flex-start",
    gap: Spacing.sm,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.black,
  },
  titleContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  pagesContainer: {
    display: "flex",
    flexDirection: "row",
  },
});
