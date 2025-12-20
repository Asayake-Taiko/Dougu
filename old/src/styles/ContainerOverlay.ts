import { StyleSheet } from "react-native";
import { useDimensions } from "../helper/context/DimensionsContext";

export const useContainerStyles = () => {
  const { windowWidth, windowHeight } = useDimensions();

  const styles = StyleSheet.create({
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
      height: windowHeight * 0.18,
    },
    equipmentItemContainer: {
      width: "33.33%",
      alignItems: "center",
    },
    itemContainer: {
      marginTop: windowHeight * 0.04,
      justifyContent: "center",
      alignItems: "center",
      width: windowWidth * 0.85,
      height: windowHeight * 0.54 + 30,
      borderRadius: 20,
    },
    itemPage: {
      display: "flex",
      flexDirection: "column",
      width: windowWidth * 0.85,
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: "black",
    },
    titleContainer: {
      alignItems: "center",
      height: windowHeight * 0.08,
      marginTop: windowHeight * 0.08,
    },
    pagesContainer: {
      display: "flex",
      flexDirection: "row",
    },
  });

  return styles;
};
