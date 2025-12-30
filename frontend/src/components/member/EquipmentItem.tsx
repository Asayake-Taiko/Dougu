import React from "react";
import { View, Text } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { Equipment } from "../../types/models";
import EquipmentDisplay from "./EquipmentDisplay";
import { ItemStyles } from "../../styles/ItemStyles";


/*
  EquipmentItem displays an equipment object with a name and optional count/preview.
*/
export default function EquipmentItem({
  item,
}: {
  item: Equipment;
}) {
  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      console.log("Equipment tapped:", item.name);
    })
    .runOnJS(true);

  return (
    <GestureDetector gesture={tapGesture}>
      <View style={ItemStyles.container}>
        <EquipmentDisplay
          imageKey={item.image}
          isMini={false}
          color={item.color}
        />
        <View style={ItemStyles.textContainer}>
          <Text style={ItemStyles.text} numberOfLines={1}>{item.name}</Text>
        </View>
      </View>
    </GestureDetector>
  );
}
