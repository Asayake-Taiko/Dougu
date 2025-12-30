import React from "react";
import { View, Text } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { Equipment } from "../../types/models";
import EquipmentDisplay from "./EquipmentDisplay";
import { ItemStyles } from "../../styles/ItemStyles";
import { useEquipment } from "../../lib/context/EquipmentContext";

/*
  EquipmentItem displays an equipment object with a name and optional count/preview.
*/
export default function EquipmentItem({ item }: { item: Equipment }) {
  const { setSelectedEquipment, setEquipmentOverlayVisible } = useEquipment();

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      setSelectedEquipment(item);
      setEquipmentOverlayVisible(true);
    })
    .runOnJS(true);

  return (
    <GestureDetector gesture={tapGesture}>
      <View style={ItemStyles.container}>
        <View>
          <EquipmentDisplay
            imageKey={item.image}
            isMini={false}
            color={item.color}
          />
          {item.count > 1 && (
            <View style={ItemStyles.circle}>
              <Text style={ItemStyles.count}>{item.count}</Text>
            </View>
          )}
        </View>
        <View style={ItemStyles.textContainer}>
          <Text style={ItemStyles.text} numberOfLines={2}>
            {item.name}
          </Text>
        </View>
      </View>
    </GestureDetector>
  );
}
