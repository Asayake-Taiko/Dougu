import React from "react";
import { StyleSheet, Dimensions } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useEquipment } from "../../lib/context/EquipmentContext";
import ItemComponent from "./Item";

const { width: windowWidth } = Dimensions.get("window");

export default function FloatingDraggingItem() {
    const { draggingItem, dragValues } = useEquipment();

    const movingStyles = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: dragValues.x.value },
                { translateY: dragValues.y.value },
                { scale: dragValues.scale.value },
            ],
        };
    });

    if (!draggingItem) return null;

    return (
        <Animated.View pointerEvents="none" style={[styles.floatingItem, movingStyles]}>
            <ItemComponent data={draggingItem} swapable={false} isFloating={true} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    floatingItem: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 100,
        width: windowWidth / 5,
        height: windowWidth / 5,
        top: 0,
        left: 0,
    },
});
