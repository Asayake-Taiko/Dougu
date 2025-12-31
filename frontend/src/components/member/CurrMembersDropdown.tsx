import React, { useState } from "react";
import { StyleSheet, View, Text, Pressable, Modal, FlatList } from "react-native";
import { FontAwesome5 } from '@expo/vector-icons';
import { OrgMembershipRecord } from "../../types/db";
import { useEquipment } from "../../lib/context/EquipmentContext";
import { Colors, Spacing } from "../../styles/global";

/*
  Simple Dropdown replacement using Modal and FlatList
  Filters out the current user and avoids showing the same member twice
*/
export default function CurrMembersDropdown({
    setUser,
    isCreate,
}: {
    setUser: (membership: OrgMembershipRecord | null) => void;
    isCreate: boolean;
}) {
    const [modalVisible, setModalVisible] = useState(false);
    const { ownerships, currentMember } = useEquipment();
    const [selectedName, setSelectedName] = useState("Select Member");

    // Filter members:
    // If not isCreate, don't show current member
    const members = Array.from(ownerships.values())
        .map(o => o.membership)
        .filter(m => isCreate || m.id !== currentMember?.id);

    const handleSelect = (membership: OrgMembershipRecord) => {
        const name = membership.type === 'USER'
            ? (membership as any).full_name || 'User'
            : membership.storage_name || 'Storage';
        setSelectedName(name);
        setUser(membership);
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <Pressable
                style={styles.dropdown}
                onPress={() => setModalVisible(true)}
            >
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
                                const name = item.type === 'USER'
                                    ? (item as any).full_name || 'User'
                                    : item.storage_name || 'Storage';
                                return (
                                    <Pressable
                                        style={styles.memberItem}
                                        onPress={() => handleSelect(item)}
                                    >
                                        <Text style={styles.memberText}>{name}</Text>
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
});
