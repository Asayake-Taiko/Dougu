import React, { useState } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from "react-native-reanimated";
import { Colors, Spacing } from "../../styles/global";
import { PressableOpacity } from "../PressableOpacity";
import { ContainerOverlayStyles } from "../../styles/ContainerOverlay";
import IconMenu from "../IconMenu";
import ColorSelect from "./ColorSelect";
import { iconMapping } from "../../lib/ImageMapping";
import { Hex } from "../../types/other";

/*
  EquipmentImageOverlay is a specialized overlay for selecting
  an icon and color for equipment/containers.
*/
export default function EquipmentImageOverlay({
    visible,
    setVisible,
    setImageKey,
    color,
    setColor,
    displayComponent,
    isContainer = false,
}: {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    setImageKey: (key: string) => void;
    color: Hex;
    setColor: (color: Hex) => void;
    displayComponent: React.ReactNode;
    isContainer?: boolean;
}) {
    const [tabIndex, setTabIndex] = useState(0); // 0 for Icon, 1 for Color

    if (!visible) return null;

    return (
        <Pressable
            onPress={() => setVisible(false)}
            style={[ContainerOverlayStyles.backDrop, { zIndex: 1000 }]}
        >
            <Animated.View
                entering={FadeIn}
                exiting={FadeOut}
                style={styles.previewContainer}
            >
                {displayComponent}
            </Animated.View>

            <Animated.View
                entering={ZoomIn}
                exiting={ZoomOut}
                style={[ContainerOverlayStyles.itemContainer, styles.overlayContent]}
            >
                <Pressable style={styles.innerContent}>
                    {/* Custom Tabs - Only show if not container */}
                    {!isContainer && (
                        <View style={styles.tabBar}>
                            <PressableOpacity
                                style={[styles.tabItem, tabIndex === 0 && styles.activeTab]}
                                onPress={() => setTabIndex(0)}
                            >
                                <Text style={[styles.tabText, tabIndex === 0 && styles.activeTabText]}>Icons</Text>
                            </PressableOpacity>
                            <PressableOpacity
                                style={[styles.tabItem, tabIndex === 1 && styles.activeTab]}
                                onPress={() => setTabIndex(1)}
                            >
                                <Text style={[styles.tabText, tabIndex === 1 && styles.activeTabText]}>Colors</Text>
                            </PressableOpacity>
                        </View>
                    )}

                    <View style={styles.body}>
                        {/* If isContainer, always show color select (index 1 equivalent behavior) */}
                        {isContainer ? (
                            <ColorSelect color={color} setColor={setColor} />
                        ) : tabIndex === 0 ? (
                            <IconMenu data={iconMapping} handleSet={setImageKey} />
                        ) : (
                            <ColorSelect color={color} setColor={setColor} />
                        )}
                    </View>
                </Pressable>
            </Animated.View>

            <View style={styles.confirmButtonContainer}>
                <PressableOpacity
                    style={styles.confirmButton}
                    onPress={() => setVisible(false)}
                >
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                </PressableOpacity>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    previewContainer: {
        marginTop: "10%",
        alignItems: "center",
    },
    overlayContent: {
        backgroundColor: Colors.white || "#fff",
        height: "60%",
        width: "90%",
        padding: Spacing.md,
    },
    innerContent: {
        flex: 1,
    },
    tabBar: {
        flexDirection: "row",
        backgroundColor: "#F0F0F0",
        borderRadius: 10,
        padding: 4,
        marginBottom: Spacing.md,
    },
    tabItem: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: "#FFF",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tabText: {
        fontSize: 16,
        color: "#666",
        fontWeight: "600",
    },
    activeTabText: {
        color: Colors.black || "#000",
    },
    body: {
        flex: 1,
    },
    confirmButtonContainer: {
        width: "80%",
        marginTop: Spacing.lg,
    },
    confirmButton: {
        backgroundColor: Colors.primary || "#791111",
        padding: Spacing.md,
        borderRadius: 12,
    },
    confirmButtonText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 18,
        fontWeight: "bold",
    },
});
