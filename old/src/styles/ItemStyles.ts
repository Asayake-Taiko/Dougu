import { StyleSheet } from "react-native";
import { useDimensions } from "../helper/context/DimensionsContext";

export const useItemStyles = () => {
  const { windowWidth } = useDimensions();
  const itemWidth = windowWidth / 5;
  const borderRadius = windowWidth / 14;
  const miniWidth = windowWidth / 22;
  const miniRadius = windowWidth / 64;

  const styles = StyleSheet.create({
    circle: {
      backgroundColor: "white",
      width: 35,
      height: 35,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      borderWidth: 1,
      right: -7,
      top: itemWidth - 28,
    },
    container: {
      alignItems: "center",
      width: itemWidth,
    },
    containerItem: {
      width: itemWidth,
      height: itemWidth,
      borderRadius: borderRadius,
      justifyContent: "center",
      alignItems: "center",
    },
    count: {
      fontSize: 10,
      fontWeight: "bold",
    },
    equipment: {
      justifyContent: "center",
      alignItems: "center",
    },
    equipmentItemContainer: {
      width: "33.33%",
      alignItems: "center",
    },
    equipmentRow: {
      flexDirection: "row",
      justifyContent: "flex-start",
      flexBasis: "33.33%",
      alignItems: "center",
    },
    radiusBackground: {
      borderRadius: borderRadius + 3,
    },
    radiusBackgroundMini: {
      borderRadius: miniRadius + 1,
    },
    size: {
      width: itemWidth,
      height: itemWidth,
      borderRadius: borderRadius,
    },
    sizeMini: {
      width: miniWidth,
      height: miniWidth,
      borderRadius: miniRadius,
    },
    table: {
      width: "85%",
      height: "85%",
    },
    text: {
      fontSize: 12,
    },
    textContainer: {
      alignItems: "center",
      height: 40,
    },
  });

  return styles;
};
