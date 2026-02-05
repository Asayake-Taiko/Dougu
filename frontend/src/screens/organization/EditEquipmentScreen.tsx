import { Text, View, StyleSheet, TextInput, Pressable } from "react-native";
import React, { useState, useMemo } from "react";
import { ScrollView } from "react-native-gesture-handler";

import { PressableOpacity } from "../../components/PressableOpacity";
import { Colors } from "../../styles/global";
import { useEquipment } from "../../lib/context/EquipmentContext";
import { EditEquipmentScreenProps } from "../../types/navigation";
import ImageEditingOverlay from "../../components/ImageEditingOverlay";
import EquipmentDisplay from "../../components/member/EquipmentDisplay";
import EquipmentChecklist from "../../components/member/EquipmentChecklist";
import { ItemStyles } from "../../styles/ItemStyles";
import { Hex, Item } from "../../types/other";
import { Logger } from "../../lib/utils/Logger";
import { useModal } from "../../lib/context/ModalContext";

export default function EditEquipmentScreen({
  route,
  navigation,
}: EditEquipmentScreenProps) {
  const { setMessage } = useModal();
  const { itemId } = route.params;
  const { ownerships } = useEquipment();

  const initialItem: Item | null = useMemo(() => {
    for (const ownership of ownerships.values()) {
      const found = ownership.items.find((i) => i.id === itemId);
      if (found) return found;
    }
    return null;
  }, [ownerships, itemId]);

  const [name, onChangeName] = useState(initialItem?.name || "");
  const [details, onChangeDetails] = useState(initialItem?.details || "");
  const [imageKey, setImageKey] = useState(
    initialItem?.image || "default_equipment",
  );
  const [itemColor, setItemColor] = useState<string>(
    initialItem?.color || "#ddd",
  );

  const [overlayVisible, setOverlayVisible] = useState(false);
  const [localSelectedIndices, setLocalSelectedIndices] = useState<Set<number>>(
    new Set(),
  );
  const [activeTab, setActiveTab] = useState<"details" | "records">("details");

  if (!initialItem) {
    return (
      <View style={styles.container}>
        <Text>Item not found</Text>
      </View>
    );
  }

  // records for the checklist
  const records = initialItem?.type === "equipment" ? initialItem.records : [];

  const handleToggle = (index: number) => {
    const newSet = new Set(localSelectedIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setLocalSelectedIndices(newSet);
  };

  const handleSelectAll = () => {
    if (localSelectedIndices.size === records.length) {
      setLocalSelectedIndices(new Set());
    } else {
      setLocalSelectedIndices(new Set(records.map((_: any, i: number) => i)));
    }
  };

  const handleUpdate = async () => {
    if (!initialItem) return;
    try {
      const updates: any = { name, details, color: itemColor };
      if (initialItem.type === "equipment") {
        updates.image = imageKey;
      }
      await initialItem.update(updates);
      navigation.goBack();
    } catch (e: any) {
      Logger.error(e);
      setMessage(e.message || "Failed to update item");
    }
  };

  const handleDelete = async () => {
    if (!initialItem) return;
    try {
      await initialItem.delete();
      navigation.goBack();
    } catch (e: any) {
      Logger.error(e);
      setMessage(e.message || "Failed to delete item");
    }
  };

  const handleSaveImage = async (newImageKey: string, newColor: string) => {
    setImageKey(newImageKey);
    setItemColor(newColor as Hex);
    return Promise.resolve();
  };

  const isContainer = initialItem.type === "container";

  return (
    <View style={styles.container}>
      <ImageEditingOverlay
        visible={overlayVisible}
        setVisible={setOverlayVisible}
        currentImageKey={imageKey}
        currentColor={itemColor}
        onSave={handleSaveImage}
        hideImagePicker={isContainer}
      />

      {/* Header / Item Preview */}
      <View style={styles.topRow}>
        {isContainer ? (
          <PressableOpacity
            style={{
              backgroundColor: itemColor,
              ...ItemStyles.containerItem,
            }}
          />
        ) : (
          <EquipmentDisplay
            imageKey={imageKey}
            color={itemColor}
            isMini={false}
          />
        )}
      </View>

      <View style={styles.centerContainer}>
        <PressableOpacity onPress={() => setOverlayVisible(true)}>
          <Text style={styles.link}>Edit Item Image</Text>
        </PressableOpacity>
      </View>

      {/* Tabs - Only show for Equipment or if Container had records/sub-items logic (not for now) */}
      {!isContainer ? (
        <>
          <View style={styles.tabContainer}>
            <Pressable
              style={[
                styles.tabButton,
                activeTab === "details" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("details")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "details" && styles.activeTabText,
                ]}
              >
                Details
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tabButton,
                activeTab === "records" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("records")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "records" && styles.activeTabText,
                ]}
              >
                Records
              </Text>
            </Pressable>
          </View>
        </>
      ) : null}

      {/* Content */}
      <View style={styles.contentContainer}>
        {activeTab === "details" || isContainer ? (
          <ScrollView>
            <View style={styles.rowContainer}>
              <View style={styles.row1}>
                <Text style={styles.rowHeader}>Name</Text>
              </View>
              <View style={styles.row2}>
                <TextInput
                  style={styles.input}
                  onChangeText={onChangeName}
                  value={name}
                  placeholder="name"
                  keyboardType="default"
                />
              </View>
            </View>

            <View style={styles.rowContainer}>
              <View style={styles.row1}>
                <Text style={styles.rowHeader}>Details</Text>
              </View>
              <View style={styles.row2}>
                <TextInput
                  style={styles.details}
                  onChangeText={onChangeDetails}
                  value={details}
                  placeholder="details"
                  keyboardType="default"
                  multiline={true}
                />
              </View>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.checklistWrapper}>
            <EquipmentChecklist
              records={records}
              selectedIndices={localSelectedIndices}
              itemName={name}
              onToggle={handleToggle}
              onSelectAll={handleSelectAll}
            />
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <PressableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={handleDelete}
        >
          <Text style={styles.btnText}>Delete</Text>
        </PressableOpacity>
        <PressableOpacity
          style={[styles.actionBtn, styles.updateBtn]}
          onPress={handleUpdate}
        >
          <Text style={styles.btnText}>Update</Text>
        </PressableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  centerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  link: {
    color: Colors.primary || "#791111",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    paddingHorizontal: 10,
  },
  row1: {
    flex: 1,
  },
  row2: {
    flex: 3,
  },
  rowHeader: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginLeft: 10,
  },
  input: {
    height: 45,
    marginVertical: 8,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#F9F9F9",
  },
  details: {
    height: 70, // Reduced height to fit checklist
    marginVertical: 8,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#F9F9F9",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  actionBtn: {
    width: "40%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  updateBtn: {
    backgroundColor: "#791111",
  },
  deleteBtn: {
    backgroundColor: "#888",
  },
  btnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: Colors.primary,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 10,
  },
  checklistWrapper: {
    flex: 1,
    paddingHorizontal: 15,
  },
});
