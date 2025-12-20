import { StyleSheet } from "react-native";
import { useDimensions } from "../helper/context/DimensionsContext";

export const useProfileStyles = () => {
  const { windowWidth } = useDimensions();
  const profileSize = windowWidth / 4;
  const editSize = windowWidth / 10;

  const styles = StyleSheet.create({
    button: {
      borderRadius: 10,
      marginTop: 20,
    },
    buttonContainer: { width: "80%", marginTop: 20 },
    buttonText: {
      color: "red",
    },
    centerRow: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "center",
    },
    container: {
      flex: 1,
      backgroundColor: "white",
      alignItems: "center",
    },
    changeBtn: {
      flexDirection: "row",
      alignItems: "center",
    },
    editButton: {
      width: editSize,
      height: editSize,
      borderRadius: editSize / 2,
      backgroundColor: "#D3D3D3",
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      right: -5,
      bottom: -5,
      borderColor: "white",
      borderWidth: 5,
    },
    text: {
      fontSize: 16,
    },
    profile: {
      width: profileSize,
      marginTop: "5%",
      marginBottom: "5%",
    },
    row: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 15,
    },
  });

  return styles;
};
