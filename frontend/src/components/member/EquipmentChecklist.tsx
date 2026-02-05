import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Colors } from "../../styles/global/colors";

interface EquipmentChecklistProps {
  records: any[];
  selectedIndices: Set<number>;
  itemName: string;
  onToggle: (index: number) => void;
  onSelectAll: () => void;
}

export default function EquipmentChecklist({
  records,
  selectedIndices,
  itemName,
  onToggle,
  onSelectAll,
}: EquipmentChecklistProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Items to Edit</Text>
        <Pressable onPress={onSelectAll} style={styles.selectAllButton}>
          <Text style={styles.selectAllText}>
            {selectedIndices.size === records.length && records.length > 0
              ? "Deselect All"
              : "Select All"}
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView}>
        {records.map((record, index) => {
          const isSelected = selectedIndices.has(index);
          return (
            <Pressable
              key={record.id || index}
              style={[styles.card, isSelected && styles.selectedCard]}
              onPress={() => onToggle(index)}
            >
              <View style={styles.cardHeader}>
                <Text
                  style={[styles.recordId, isSelected && styles.selectedText]}
                >
                  {itemName} {isSelected ? "✓" : ""}
                </Text>
                <View
                  style={[styles.colorBadge, { backgroundColor: record.color }]}
                />
              </View>
              <Text style={styles.details}>
                {record.details || "No details provided."}
              </Text>
              <Text style={styles.date}>
                Last updated:{" "}
                {record.last_updated_date
                  ? new Date(record.last_updated_date).toLocaleDateString()
                  : "N/A"}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  selectAllButton: {
    padding: 8,
    backgroundColor: Colors.gray200,
    borderRadius: 6,
  },
  selectAllText: {
    color: Colors.dark,
    fontWeight: "bold",
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    padding: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: "#fffafa",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  recordId: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
  },
  selectedText: {
    color: Colors.primary,
  },
  colorBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  details: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  date: {
    fontSize: 10,
    color: "#888",
    textAlign: "right",
  },
});
