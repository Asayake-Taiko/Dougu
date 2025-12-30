import React from "react";
import { View, Text, Pressable } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { Container, Equipment } from "../../types/models";
import { chunkArray } from "../../lib/helper/EquipmentUtils";
import { ItemStyles } from "../../styles/ItemStyles";
import EquipmentDisplay from "./EquipmentDisplay";
import { useEquipment } from "../../lib/context/EquipmentContext";

/*
  ContainerItem is a component that displays a container object with its name and
  a 3x3 grid preview of its equipment.
*/
export default function ContainerItem({
    item,
    swapable,
}: {
    item: Container;
    swapable: boolean;
}) {
    const containerData = item.container;
    const equipmentItems = item.equipment;

    // display the first 9 equipment items in a 3x3 grid
    const firstNine = equipmentItems.slice(0, 9);
    const chunkedData = chunkArray(firstNine, 3);

    const { setSelectedContainer, setContainerOverlayVisible } = useEquipment();

    const tapGesture = Gesture.Tap()
        .onEnd(() => {
            setSelectedContainer(item);
            setContainerOverlayVisible(true);
        })
        .runOnJS(true);

    return (
        <GestureDetector gesture={tapGesture}>
            <View style={ItemStyles.container}>
                <Pressable
                    style={({ pressed }) => [
                        {
                            opacity: pressed ? 0.7 : 1,
                            backgroundColor: containerData.color || '#ddd',
                        },
                        ItemStyles.containerItem,
                    ]}
                >
                    <View style={ItemStyles.table}>
                        {chunkedData.map((row, index) => (
                            <View key={index} style={ItemStyles.equipmentRow}>
                                {row.map((equip) => (
                                    <View
                                        key={equip.id}
                                        style={ItemStyles.equipmentItemContainer}
                                    >
                                        <EquipmentDisplay
                                            imageKey={equip.image}
                                            isMini={true}
                                            color={equip.color}
                                        />
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                </Pressable>
                <Text style={ItemStyles.text} numberOfLines={1}>{containerData.name}</Text>
            </View>
        </GestureDetector>
    );
}
