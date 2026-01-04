import { StyleSheet } from "react-native";
import { useDimensions } from "../helper/context/DimensionsContext";

export const useDisplaytyles = () => {
  const { windowWidth } = useDimensions();
  const profileSize = windowWidth / 4;

  const styles = StyleSheet.create({
    image: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginTop: 20,
    },
    profile: {
      width: profileSize,
      height: profileSize,
      borderRadius: profileSize / 2,
    },
    profileMini: {
      width: 45,
      height: 45,
      borderRadius: 22.5,
    },
  });

  return styles;
};
