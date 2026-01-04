import React from "react";
import { StyleSheet, Dimensions } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import ItemComponent from "./Item";

const { width: windowWidth } = Dimensions.get("window");

export default function FloatingDraggingItem({
    draggingItem,
    dragValues,
}: {
    draggingItem: any; // Using any for Item or null
    dragValues: {
        x: any;
        y: any;
        scale: any;
    };
}) {

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
            <ItemComponent data={draggingItem} isFloating={true} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    floatingItem: {
        position: "absolute",
        zIndex: 100,
        width: windowWidth / 5,
        height: windowWidth / 5 + 40,
        top: 0,
        left: 0,
    },
});
