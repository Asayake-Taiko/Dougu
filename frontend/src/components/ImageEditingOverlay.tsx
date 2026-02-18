import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ImageSourcePropType,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../styles/global";
import { PressableOpacity } from "./PressableOpacity";
import ColorSelect from "./organization/ColorSelect";
import { Hex } from "../types/other";
import {
  baseProfileMapping,
  baseOrgMapping,
  iconMapping,
} from "../lib/utils/ImageMapping";
import DisplayImage from "./DisplayImage";
import { launchImageLibraryAsync } from "expo-image-picker";
import { uploadImage } from "../lib/supabase/storage";
import { Logger } from "../lib/utils/Logger";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export type UploadContext =
  | { type: "user_profile"; userId: string }
  | { type: "org_profile"; orgId: string }
  | { type: "org_equipment"; orgId: string }
  | { type: "custom" };

interface ImageEditingOverlayProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  currentImageKey: string;
  currentColor: string;
  onSave: (imageKey: string, color: string) => Promise<void>;
  hideImagePicker?: boolean;
  uploadContext?: UploadContext;
}

export default function ImageEditingOverlay({
  visible,
  setVisible,
  currentImageKey,
  currentColor,
  onSave,
  hideImagePicker = false,
  uploadContext = { type: "custom" },
}: ImageEditingOverlayProps) {
  const [selectedImageKey, setSelectedImageKey] = useState(currentImageKey);
  const [selectedColor, setSelectedColor] = useState<Hex>(currentColor as Hex);
  const [activeTab, setActiveTab] = useState<"image" | "color">("image");
  const [isUploading, setIsUploading] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setIsUploading(true);
        const asset = result.assets[0];

        let path = "";
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const filename = `${timestamp}_${randomStr}.png`;

        switch (uploadContext.type) {
          case "user_profile":
            path = `profiles/${uploadContext.userId}/profile.png`;
            break;
          case "org_profile":
            path = `organizations/${uploadContext.orgId}/profile.png`;
            break;
          case "org_equipment":
            path = `organizations/${uploadContext.orgId}/equipment/${filename}`;
            break;
          case "custom":
          default:
            path = `custom/${filename}`;
            break;
        }

        const imagePath = await uploadImage(asset.uri, path);
        setSelectedImageKey(imagePath);
        setIsUploading(false);
      }
    } catch (error: any) {
      Logger.error("Upload failed:", error);
      alert(error.message || "Failed to upload image. Please try again.");
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      setSelectedImageKey(currentImageKey);
      setSelectedColor(currentColor as Hex);
      setActiveTab(hideImagePicker ? "color" : "image");
    }
  }, [visible, currentImageKey, currentColor, hideImagePicker]);

  const handleSave = async () => {
    await onSave(selectedImageKey, selectedColor);
    setVisible(false);
  };

  // Helper to render a group of images
  const renderImageGroup = (
    title: string,
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
            <DisplayImage imageKey={key} style={styles.fill} />
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
      <SafeAreaView style={styles.centeredView}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />
        <View style={styles.modalView}>
          <View style={styles.handle} />

          {/* Header / Preview */}
          <View style={styles.previewContainer}>
            <View
              style={[styles.previewCircle, { backgroundColor: selectedColor }]}
            >
              {!hideImagePicker && (
                <DisplayImage imageKey={selectedImageKey} style={styles.fill} />
              )}
            </View>
          </View>

          {/* Tabs - Modern Segmented Control */}
          {!hideImagePicker && (
            <View style={styles.tabWrapper}>
              <View style={styles.tabContainer}>
                <PressableOpacity
                  style={[
                    styles.tab,
                    activeTab === "image" && styles.activeTab,
                  ]}
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
                  style={[
                    styles.tab,
                    activeTab === "color" && styles.activeTab,
                  ]}
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
            </View>
          )}

          {/* Content */}
          <View style={styles.contentContainer}>
            {activeTab === "image" && !hideImagePicker ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Custom Image / Upload Section Integrated into Grid */}
                <View style={styles.groupContainer}>
                  <Text style={styles.groupTitle}>Custom Selection</Text>
                  <View style={styles.grid}>
                    <PressableOpacity
                      style={[styles.imageItem, styles.uploadItem]}
                      onPress={handlePickImage}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <ActivityIndicator color={Colors.primary} />
                      ) : (
                        <View style={styles.uploadPlaceholder}>
                          <MaterialCommunityIcons
                            name="plus"
                            size={24}
                            color="#666"
                          />
                          <Text style={styles.uploadSmallText}>Upload</Text>
                        </View>
                      )}
                    </PressableOpacity>
                  </View>
                </View>

                {renderImageGroup("Profiles", baseProfileMapping)}
                {renderImageGroup("Organizations", baseOrgMapping)}
                {renderImageGroup("Items", iconMapping)}
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
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </PressableOpacity>
          </View>
        </View>
      </SafeAreaView>
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
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalView: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "85%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    paddingTop: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  previewContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  previewCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  tabWrapper: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  colorPickerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  groupContainer: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1A1A1A",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    columnGap: "2.6%",
  },
  imageItem: {
    width: "23%",
    aspectRatio: 1,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 16,
    padding: 6,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  uploadItem: {
    borderStyle: "dashed",
    borderColor: "#CCC",
    backgroundColor: "#F0F0F0",
  },
  selectedImageItem: {
    borderColor: Colors.primary,
    backgroundColor: "#FFF5F5",
  },
  uploadPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  uploadSmallText: {
    fontSize: 10,
    color: "#666",
    marginTop: 2,
    fontWeight: "500",
  },
  footer: {
    padding: 20,
    paddingBottom: 34, // Safe area ish
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  fill: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
});
