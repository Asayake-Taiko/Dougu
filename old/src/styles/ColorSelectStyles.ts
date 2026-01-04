import { StyleSheet } from "react-native";
import { useDimensions } from "../helper/context/DimensionsContext";

export const useColorSelect = () => {
  const { windowWidth } = useDimensions();

  const styles = StyleSheet.create({
    panel: {
      borderRadius: windowWidth / 20,
      flex: 10,
      height: "100%",
    },
    panelView: {
      display: "flex",
      flexDirection: "row",
      columnGap: 15,
      flexShrink: 4,
      flexBasis: "60%",
    },
    picker: {
      width: "90%",
      height: "90%",
      rowGap: 15,
      margin: "auto",
    },
    pickerContainer: {
      flex: 1,
    },
    slider: {
      borderRadius: windowWidth / 40,
      flex: 1,
      height: "100%",
    },
    widgetView: {
      rowGap: 15,
      flexBasis: "40%",
      flexGrow: 6,
    },
  });

  return styles;
};
