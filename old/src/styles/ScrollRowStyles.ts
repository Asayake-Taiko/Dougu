import { StyleSheet } from "react-native";
import { useDimensions } from "../helper/context/DimensionsContext";

export const useScrollRowStyles = () => {
  const { windowWidth } = useDimensions();
  const equipmentSpacing = windowWidth / 25;

  const styles = StyleSheet.create({
    item: {
      marginLeft: equipmentSpacing,
    },
    scrollRow: {
      flex: 1,
      flexDirection: "row",
      minWidth: windowWidth,
    },
  });

  return styles;
};
