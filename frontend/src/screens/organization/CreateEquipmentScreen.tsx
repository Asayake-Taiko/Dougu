import { Text, View, StyleSheet, TextInput } from "react-native";
import React, { useState } from "react";

// project imports
import CurrMembersDropdown from "../../components/member/CurrMembersDropdown";
import { useMembership } from "../../lib/context/MembershipContext";
import { useSpinner } from "../../lib/context/SpinnerContext";
import { useModal } from "../../lib/context/ModalContext";
import { PressableOpacity } from "../../components/PressableOpacity";
import { Colors } from "../../styles/global";
import { OrgMembershipRecord } from "../../types/db";
import { Hex } from "../../types/other";
import ImageEditingOverlay from "../../components/ImageEditingOverlay";
import { Logger } from "../../lib/utils/Logger";
import { equipmentService } from "../../lib/services/equipment";
import EquipmentDisplay from "../../components/member/EquipmentDisplay";
import { ItemStyles } from "../../styles/ItemStyles";

/*
  Create equipment screen allows a manager to create equipment
  and assign it to a user/storage.
*/
export default function CreateEquipmentScreen() {
  const { organization } = useMembership();
  const { showSpinner, hideSpinner } = useSpinner();
  const { setMessage } = useModal();

  const [name, onChangeName] = useState("");
  const [quantity, onChangeQuantity] = useState<string>("");
  const [assignUser, setAssignUser] = useState<OrgMembershipRecord | null>(
    null,
  );
  const [details, onChangeDetails] = useState("");

  // Static values for now as requested to skip overlay/image logic details
  const [imageKey, setImageKey] = useState("default_equipment");
  const [itemColor, setItemColor] = useState<Hex>("#ddd");
  const [overlayVisible, setOverlayVisible] = useState(false);

  // index 0 is equipment, index 1 is container
  const [index, setIndex] = useState(0);

  // Create a new equipment and assign it to a user
  const handleCreate = async () => {
    if (!organization) {
      setMessage("Organization not found.");
      return;
    }

    const quantityCount = parseInt(quantity);
    if (!assignUser || !name || !quantityCount) {
      setMessage("Please fill out all fields.");
      return;
    }

    if (quantityCount < 1 || quantityCount > 25) {
      setMessage("You must make between 1 and 25 items at a time.");
      return;
    }

    try {
      showSpinner();
      if (index === 0) {
        // Create Equipment
        await equipmentService.createEquipment(quantityCount, {
          name,
          organization_id: organization.id,
          assigned_to: assignUser.id,
          image: imageKey,
          color: itemColor,
          details,
        });
      } else {
        // Create Container
        await equipmentService.createContainer(quantityCount, {
          name,
          organization_id: organization.id,
          assigned_to: assignUser.id,
          color: itemColor,
          details,
        });
      }
      setMessage("Items created successfully.");
      onChangeName("");
      onChangeQuantity("");
      onChangeDetails("");
    } catch (error: any) {
      Logger.error("Failed to create items", error);
      setMessage(error.message || "Failed to create items.");
    } finally {
      hideSpinner();
    }
  };

  const handleSaveImage = async (newImageKey: string, newColor: string) => {
    setImageKey(newImageKey);
    setItemColor(newColor as Hex);
    return Promise.resolve();
  };

  return (
    <View style={styles.container}>
      <ImageEditingOverlay
        visible={overlayVisible}
        setVisible={setOverlayVisible}
        currentImageKey={imageKey}
        currentColor={itemColor}
        onSave={handleSaveImage}
      />
      <View style={styles.topRow}>
        {index === 0 ? (
          <EquipmentDisplay
            imageKey={imageKey}
            color={itemColor}
            isMini={false}
          />
        ) : (
          <PressableOpacity
            style={{
              backgroundColor: itemColor,
              ...ItemStyles.containerItem,
            }}
          />
        )}
      </View>
      <View style={styles.centerContainer}>
        <PressableOpacity onPress={() => setOverlayVisible(true)}>
          <Text style={styles.link}>Edit Item Image</Text>
        </PressableOpacity>
      </View>
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
          <Text style={styles.rowHeader}>Type</Text>
        </View>
        <View style={styles.row2}>
          <View style={styles.tabBar}>
            <PressableOpacity
              style={[styles.tabItem, index === 0 && styles.activeTab]}
              onPress={() => setIndex(0)}
            >
              <Text
                style={[styles.tabText, index === 0 && styles.activeTabText]}
              >
                Equipment
              </Text>
            </PressableOpacity>
            <PressableOpacity
              style={[styles.tabItem, index === 1 && styles.activeTab]}
              onPress={() => setIndex(1)}
            >
              <Text
                style={[styles.tabText, index === 1 && styles.activeTabText]}
              >
                Container
              </Text>
            </PressableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.rowContainer}>
        <View style={styles.row1}>
          <Text style={styles.rowHeader}>Quantity</Text>
        </View>
        <View style={styles.row2}>
          <TextInput
            style={styles.input}
            onChangeText={onChangeQuantity}
            value={quantity}
            placeholder="quantity"
            keyboardType="numeric"
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
      <View style={styles.centerContainer}>
        <CurrMembersDropdown setUser={setAssignUser} isCreate={true} />
      </View>
      <PressableOpacity style={styles.createBtn} onPress={handleCreate}>
        <Text style={styles.createBtnTxt}> Create </Text>
      </PressableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  createBtn: {
    backgroundColor: "#791111",
    width: "85%",
    padding: 15,
    borderRadius: 12,
    alignSelf: "center",
    marginTop: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  createBtnTxt: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  container: {
    backgroundColor: "#fff",
    height: "100%",
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
    height: 90,
    marginVertical: 8,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#F9F9F9",
  },
  link: {
    color: Colors.primary || "#791111",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  centerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
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
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    marginHorizontal: 12,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
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
    color: "#333",
    fontWeight: "700",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
    marginBottom: 10,
  },
});
