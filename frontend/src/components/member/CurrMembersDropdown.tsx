import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { OrgMembershipRecord } from "../../types/db";
import { useEquipment } from "../../lib/context/EquipmentContext";
import { useMembership } from "../../lib/context/MembershipContext";
import { OrgMembership } from "../../types/models";
import { Colors, Spacing } from "../../styles/global";
import DisplayImage from "../../components/DisplayImage";

/*
  Simple Dropdown replacement using Modal and FlatList
  Filters out the current user and avoids showing the same member twice
*/
export default function CurrMembersDropdown({
  setUser,
  excludeSelf = false,
  initialName = "Select Member",
  initialProfile = "default_profile",
  initialColor = "#791111",
}: {
  setUser: (membership: OrgMembershipRecord | null) => void;
  excludeSelf?: boolean;
  initialName?: string;
  initialProfile?: string;
  initialColor?: string;
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const { ownerships } = useEquipment();
  const { membership } = useMembership();
  const [selectedName, setSelectedName] = useState(initialName);
  const [selectedProfile, setSelectedProfile] = useState(initialProfile);
  const [selectedColor, setSelectedColor] = useState(initialColor);

  // Filter members:
  const members = Array.from(ownerships.values())
    .map((o) => o.membership)
    .filter((m) => !excludeSelf || m.id !== membership?.id);

  const handleSelect = (m: OrgMembership) => {
    setSelectedName(m.name);
    setSelectedProfile(m.profile);
    setSelectedColor(m.color);
    setUser(m.membership);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.dropdown} onPress={() => setModalVisible(true)}>
        <DisplayImage
          imageKey={selectedProfile}
          style={styles.profileImageSmall}
          color={selectedColor}
        />
        <Text style={styles.textStyle}>{selectedName}</Text>
        <FontAwesome5 name="caret-down" size={25} color={Colors.black} />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={members}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const name = item.name;
                return (
                  <Pressable
                    style={styles.memberItem}
                    onPress={() => handleSelect(item)}
                  >
                    <View style={styles.memberRow}>
                      <DisplayImage
                        imageKey={item.profile}
                        style={styles.profileImage}
                        color={item.color}
                      />
                      <Text style={styles.memberText}>{name}</Text>
                    </View>
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
  },
  dropdown: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  textStyle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.black,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    maxHeight: "60%",
    backgroundColor: Colors.white || "#fff",
    borderRadius: Spacing.md,
    padding: Spacing.md,
    elevation: 5,
  },
  memberItem: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  memberText: {
    fontSize: 18,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  profileImageSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
