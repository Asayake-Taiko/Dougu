import React from "react";
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from "react-native";

/*
  Displays a spinning indicator that is used to show that the app is loading
  Thanks to https://github.com/HirotoKakitani/Asayake-website#deploying-the-website for the inspiration
*/
export default function SpinningIndicator() {
  const spinValue = new Animated.Value(0);

  Animated.loop(
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 2400,
      easing: Easing.bezier(0, 0.2, 0.8, 1),
      useNativeDriver: true,
    }),
  ).start();

  const spin = spinValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["0deg", "1800deg", "3600deg"],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => {}}>
        <Animated.View
          style={[styles.circle, { transform: [{ rotateY: spin }] }]}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#791111",
  },
});
