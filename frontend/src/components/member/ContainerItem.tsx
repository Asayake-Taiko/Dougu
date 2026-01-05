import React from "react";
import { View, Text, Pressable } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { Item, Container } from "../../types/models";
import { chunkArray } from "../../lib/utils/EquipmentUtils";
import { ItemStyles } from "../../styles/ItemStyles";
import EquipmentDisplay from "./EquipmentDisplay";
import { useEquipment } from "../../lib/context/EquipmentContext";

/*
  ContainerItem is a component that displays a container object with its name and
  a 3x3 grid preview of its equipment.
*/
export default function ContainerItem({
    item,
    isFloating = false,
    draggingItem,
}: {
    item: Container;
    isFloating?: boolean;
    draggingItem?: Item | null;
}) {
    const containerData = item.container;
    const equipmentItems = item.equipment;

    const { setSelectedContainer } = useEquipment();

    // Hide if this container is being dragged (not floating)
    if (!isFloating && draggingItem?.type === 'container' && draggingItem.id === item.id) {
        return null;
    }

    // display the first 9 equipment items in a 3x3 grid
    const firstNine = equipmentItems.slice(0, 9);
    const chunkedData = chunkArray(firstNine, 3);

    const tapGesture = Gesture.Tap()
        .onEnd(() => {
            setSelectedContainer(item);
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
