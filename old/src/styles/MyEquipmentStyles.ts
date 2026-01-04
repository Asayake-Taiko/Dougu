import { StyleSheet } from "react-native";
import { useDimensions } from "../helper/context/DimensionsContext";

export const useMyEquipmentStyles = () => {
  const { windowWidth } = useDimensions();
  const rowWidth = windowWidth * 0.9;
  const containerWidth = rowWidth / 3;

  const styles = StyleSheet.create({
    background: {
      backgroundColor: "#fff",
      height: "100%",
      width: "100%",
    },
    container: {
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fff",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginVertical: 20,
      color: "#000",
    },
    equipmentRow: {
      flexDirection: "row",
      justifyContent: "flex-start",
      width: rowWidth,
      marginBottom: 20,
      marginLeft: "auto",
      marginRight: "auto",
    },
    equipmentItemContainer: {
      width: containerWidth,
      alignItems: "center",
    },
  });  

  return styles;
};
