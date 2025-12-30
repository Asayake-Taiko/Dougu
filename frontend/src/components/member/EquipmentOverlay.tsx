import React from "react";
import { Text, StyleSheet, Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useEquipment } from "../../lib/context/EquipmentContext";
import { Colors } from "../../styles/global/colors";

export default function EquipmentOverlay() {
  const {
    equipmentOverlayVisible: visible,
    setEquipmentOverlayVisible: setVisible,
    selectedEquipment: item
  } = useEquipment();

  const [selectedIndex, setSelectedIndex] = React.useState(item?.selectedRecordIndex || 0);

  // Sync index if item changes
  React.useEffect(() => {
    if (item) {
      setSelectedIndex(item.selectedRecordIndex);
    }
  }, [item]);

  if (!visible || !item) return null;

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    item.selectedRecordIndex = index;
  };

  return (
    <Animated.View
      style={styles.overlayStyles}
      entering={FadeIn}
      exiting={FadeOut}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{item.name}</Text>
        <Pressable onPress={() => setVisible(false)} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {item.records.map((record, index) => {
          const isSelected = selectedIndex === index;
          return (
            <Pressable
              key={record.id}
              style={[
                styles.card,
                isSelected && styles.selectedCard
              ]}
              onPress={() => handleSelect(index)}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.recordId, isSelected && styles.selectedText]}>
                  Item #{index + 1} {isSelected ? "(Selected)" : ""}
                </Text>
                <View style={[styles.colorBadge, { backgroundColor: record.color }]} />
              </View>
              <Text style={styles.details}>{record.details || "No details provided."}</Text>
              <Text style={styles.date}>Last updated: {new Date(record.last_updated_date).toLocaleDateString()}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    fontWeight: 'bold',
    fontSize: 16,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f1e1eff',
  },
  selectedCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  selectedText: {
    color: Colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.gray500,
  },
  colorBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  details: {
    fontSize: 15,
    color: Colors.gray500,
    lineHeight: 22,
    marginBottom: 12,
  },
  date: {
    fontSize: 12,
    color: Colors.gray400,
    textAlign: 'right',
  }
});
