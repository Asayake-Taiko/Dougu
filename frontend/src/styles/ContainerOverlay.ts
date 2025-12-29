import { StyleSheet } from "react-native";
import { Colors, Spacing } from "./global";

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
    width: "90%",
    marginLeft: "auto",
    marginRight: "auto",
    flexBasis: "33.33%",
    alignItems: "center",
    height: 140, // Static height instead of dynamic
  },
  equipmentItemContainer: {
    width: "33.33%",
    alignItems: "center",
  },
  itemContainer: {
    marginTop: Spacing.xl,
    justifyContent: "center",
    alignItems: "center",
    width: "85%",
    height: 350, // Static height instead of dynamic
    borderRadius: Spacing.lg,
  },
  itemPage: {
    display: "flex",
    flexDirection: "column",
    width: "85%",
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
