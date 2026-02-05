import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ImageSourcePropType,
} from "react-native";
import { Colors } from "../styles/global";
import { PressableOpacity } from "./PressableOpacity";
import ColorSelect from "./organization/ColorSelect";
import { DisplayType, Hex } from "../types/other";
import {
  baseProfileMapping,
  baseOrgMapping,
  iconMapping,
} from "../lib/utils/ImageMapping";
import DisplayImage from "./DisplayImage";

interface ImageEditingOverlayProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  currentImageKey: string;
  currentColor: string;
  onSave: (imageKey: string, color: string) => Promise<void>;
}

export default function ImageEditingOverlay({
  visible,
  setVisible,
  currentImageKey,
  currentColor,
  onSave,
}: ImageEditingOverlayProps) {
  const [selectedImageKey, setSelectedImageKey] = useState(currentImageKey);
  const [selectedColor, setSelectedColor] = useState<Hex>(currentColor as Hex);
  const [activeTab, setActiveTab] = useState<"image" | "color">("image");

  useEffect(() => {
    if (visible) {
      setSelectedImageKey(currentImageKey);
      setSelectedColor(currentColor as Hex);
      setActiveTab("image");
    }
  }, [visible, currentImageKey, currentColor]);

  const handleSave = async () => {
    await onSave(selectedImageKey, selectedColor);
    setVisible(false);
  };

  // Helper to render a group of images
  const renderImageGroup = (
    title: DisplayType,
    mapping: { [key: string]: ImageSourcePropType },
  ) => (
    <View style={styles.groupContainer} key={title}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.grid}>
        {Object.entries(mapping).map(([key, source]) => (
          <PressableOpacity
            key={key}
            style={[
              styles.imageItem,
              selectedImageKey === key && styles.selectedImageItem,
            ]}
            onPress={() => setSelectedImageKey(key)}
          >
            <DisplayImage
              type={title}
              imageKey={key}
              style={{ width: 50, height: 50 }}
            />
          </PressableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.centeredView}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />
        <View style={styles.modalView}>
          {/* Header / Preview */}
          <View style={styles.previewContainer}>
            <View
              style={[styles.previewCircle, { borderColor: selectedColor }]}
            >
              <DisplayImage
                type="Item"
                imageKey={selectedImageKey}
                style={{ width: 100, height: 100 }}
              />
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <PressableOpacity
              style={[styles.tab, activeTab === "image" && styles.activeTab]}
              onPress={() => setActiveTab("image")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "image" && styles.activeTabText,
                ]}
              >
                Image
              </Text>
            </PressableOpacity>
            <PressableOpacity
              style={[styles.tab, activeTab === "color" && styles.activeTab]}
              onPress={() => setActiveTab("color")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "color" && styles.activeTabText,
                ]}
              >
                Color
              </Text>
            </PressableOpacity>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            {activeTab === "image" ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {renderImageGroup("User", baseProfileMapping)}
                {renderImageGroup("Org", baseOrgMapping)}
                {renderImageGroup("Item", iconMapping)}
              </ScrollView>
            ) : (
              <View style={styles.colorPickerContainer}>
                <ColorSelect
                  color={selectedColor}
                  setColor={setSelectedColor}
                />
              </View>
            )}
          </View>

          {/* Footer / Save */}
          <View style={styles.footer}>
            <PressableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </PressableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalView: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "85%", // Large bottom sheet
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    paddingTop: 20,
  },
  previewContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  previewCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: "#888",
    fontWeight: "500",
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  colorPickerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  groupContainer: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  imageItem: {
    width: "23%", // 4 columns
    aspectRatio: 1,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 8,
    padding: 5,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedImageItem: {
    borderColor: Colors.primary,
    backgroundColor: "#fff0f0",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
