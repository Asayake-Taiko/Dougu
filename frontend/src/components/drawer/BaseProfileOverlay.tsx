import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    View,
    Pressable,
    Platform,
    StatusBar
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Colors, Spacing } from "../../styles/global";

interface BaseProfileOverlayProps {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    title: string;
    children: React.ReactNode;
}

export default function BaseProfileOverlay({
    visible,
    setVisible,
    title,
    children
}: BaseProfileOverlayProps) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={() => setVisible(false)}
        >
            <View style={styles.safeArea}>
                <View style={styles.container}>
                    <View style={styles.headerRow}>
                        <Pressable
                            onPress={() => setVisible(false)}
                            style={styles.backButton}
                        >
                            <FontAwesome name="arrow-left" size={16} color={Colors.black} />
                            <Text style={styles.backText}>Profile</Text>
                        </Pressable>
                    </View>
                    <Text style={styles.title}>{title}</Text>
                    <View style={styles.content}>
                        {children}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    container: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: Spacing.md,
    },
    headerRow: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: Spacing.md,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: Spacing.sm,
    },
    backText: {
        marginLeft: Spacing.sm,
        fontSize: 16,
        color: Colors.black,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: Spacing.md,
        marginBottom: Spacing.xl,
    },
    content: {
        width: "100%",
        alignItems: "center",
    }
});
