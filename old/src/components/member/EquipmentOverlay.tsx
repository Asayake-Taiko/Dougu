import React from "react";
import { Card, Button } from "@rneui/themed";
import { Text, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // Import the LinearGradient component
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { useEquipment } from "../../helper/context/EquipmentContext";
import { ScrollView } from "react-native-gesture-handler";

/*
    This overlay is what is shown when the user taps
    on an equipment item. It displays the equipment item's 
    stats, counts, and grouped equipment items.
*/
export default function EquipmentOverlay() {
  const { visible, setVisible, equipmentItem, modifyEquipmentItem } =
    useEquipment();

  return (
    <>
      {visible && (
        <Animated.View
          style={styles.overlayStyles}
          entering={FadeIn}
          exiting={FadeOut}
        >
          <Text style={styles.title}>{equipmentItem?.label}</Text>
          <ScrollView>
            {equipmentItem &&
              equipmentItem.data.map((itemId, index) => (
                <Pressable
                  key={index}
                  onPress={() => {
                    modifyEquipmentItem(equipmentItem, itemId);
                  }}
                >
                  <Card
                    containerStyle={
                      equipmentItem.id === itemId && styles.highlighted
                    }
                  >
                    <Card.Title>{itemId}</Card.Title>
                    <Card.Divider />
                    <Text>{equipmentItem.detailData[index]}</Text>
                  </Card>
                </Pressable>
              ))}
          </ScrollView>
          <Button
            ViewComponent={LinearGradient}
            linearGradientProps={{
              colors: ["#FF9800", "#F44336"],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }}
            onPress={() => setVisible(false)}
          >
            Close
          </Button>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  highlighted: {
    borderWidth: 3,
    borderColor: "black",
  },
  infoContainer: {
    height: 80,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: "grey",
    borderBottomWidth: 0.5,
  },
  infoTxt: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 20,
  },
  overlayStyles: {
    backgroundColor: "white",
    flex: 1,
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  title: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 28,
    fontWeight: "bold",
  },
});
