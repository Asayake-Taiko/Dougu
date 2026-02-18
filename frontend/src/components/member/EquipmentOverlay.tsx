import React from "react";
import { Text, StyleSheet, Pressable, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useEquipment } from "../../lib/context/EquipmentContext";
import { Colors } from "../../styles/global/colors";
import EquipmentChecklist from "./EquipmentChecklist";

export default function EquipmentOverlay() {
  const { setSelectedEquipment, selectedEquipment: item } = useEquipment();
  const [, setLocalUpdate] = React.useState(0);

  if (!item) return null;

  const handleToggle = (index: number) => {
    item.toggleSelection(index);
    setLocalUpdate((prev) => prev + 1);
  };

  const handleSelectAll = () => {
    if (item.selectedCount === item.count) {
      item.deselectAll();
    } else {
      item.selectAll();
    }
    setLocalUpdate((prev) => prev + 1);
  };

  return (
    <Animated.View
      style={styles.overlayStyles}
      entering={FadeIn}
      exiting={FadeOut}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{item.name}</Text>
        <Pressable
          onPress={() => setSelectedEquipment(null)}
          style={styles.closeButton}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </Pressable>
      </View>
      <View style={styles.checklistContainer}>
        <EquipmentChecklist
          records={item.records}
          selectedIndices={item.selectedIndices}
          itemName={item.name}
          onToggle={handleToggle}
          onSelectAll={handleSelectAll}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {item.selectedCount} of {item.count} selected
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlayStyles: {
    backgroundColor: "white",
    flex: 1,
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 1000,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.dark,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: Colors.primary,
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#f9f9f9",
  },
  footerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.dark,
    textAlign: "center",
  },
  checklistContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
});
