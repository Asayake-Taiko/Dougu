import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Spacing } from "../../styles/global";
import { PressableOpacity } from "../PressableOpacity";

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
  children,
}: BaseProfileOverlayProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={() => setVisible(false)}
    >
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <PressableOpacity
              onPress={() => setVisible(false)}
              style={styles.backButton}
            >
              <FontAwesome name="arrow-left" size={16} color={Colors.black} />
              <Text style={styles.backText}>Profile</Text>
            </PressableOpacity>
          </View>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.content}>{children}</View>
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
  },
});
