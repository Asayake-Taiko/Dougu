import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { AntDesign } from "@expo/vector-icons";
import { InfoScreenProps } from "../../types/navigation";
import { useMembership } from "../../lib/context/MembershipContext";
import OrgImageOverlay from "../../components/organization/OrgImageOverlay";
import { orgMapping } from "../../lib/ImageMapping";
import { DisplayStyles } from "../../styles/Display";

/*
  InfoScreen displays the organization's name, access code, and offers
  navigation to view more information about the organization's members,
  storages, and equipment.
*/
export default function OrgInfoScreen({ navigation }: InfoScreenProps) {
    const { organization } = useMembership();
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [imageKey, setImageKey] = useState(organization?.image || "default");

    if (!organization) {
        return null;
    }

    const handleOrgImage = () => {
        setImageKey(organization.image);
        setOverlayVisible(true);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleOrgImage} style={styles.imageContainer}>
                <Image
                    source={orgMapping[imageKey]}
                    style={DisplayStyles.image}
                />
            </TouchableOpacity>
            <View style={styles.row}>
                <Text style={[styles.rowHeader, { flex: 2 }]}>Name</Text>
                <Text style={{ flex: 3 }}>{organization.name}</Text>
            </View>
            <View style={styles.row}>
                <Text style={[styles.rowHeader, { flex: 2 }]}>Access Code</Text>
                <Text style={{ flex: 3 }}>{organization.accessCode}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.rowHeader}>Members</Text>
                <TouchableOpacity
                    style={styles.rightArrow}
                    onPress={() =>
                        navigation.navigate("UserStorages", { tabParam: "Members" })
                    }
                >
                    <Text>View Members</Text>
                    <AntDesign name="right" size={20} />
                </TouchableOpacity>
            </View>
            <View style={styles.row}>
                <Text style={styles.rowHeader}>Storages</Text>
                <TouchableOpacity
                    style={styles.rightArrow}
                    onPress={() =>
                        navigation.navigate("UserStorages", { tabParam: "Storages" })
                    }
                >
                    <Text>View Storages</Text>
                    <AntDesign name="right" size={20} />
                </TouchableOpacity>
            </View>
            <View style={styles.row}>
                <Text style={styles.rowHeader}>Equipment</Text>
                <TouchableOpacity
                    style={styles.rightArrow}
                    onPress={() => navigation.navigate("Sheet")}
                >
                    <Text>View Sheet</Text>
                    <AntDesign name="right" size={20} />
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                style={styles.equipmentBtn}
                onPress={() => navigation.navigate("ManageEquipment")}
            >
                <Text style={styles.eBtnText}>Manage Equipment</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.equipmentBtn}
                onPress={() => navigation.navigate("DeleteOrg")}
            >
                <Text style={styles.deleteText}>Delete Org</Text>
            </TouchableOpacity>

            <OrgImageOverlay
                visible={overlayVisible}
                setVisible={setOverlayVisible}
                imageKey={imageKey}
                setImageKey={setImageKey}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#fff",
    },
    imageContainer: {
        marginTop: 20,
        marginBottom: 10,
    },
    deleteText: {
        alignSelf: "center",
        fontWeight: "bold",
        color: "red",
    },
    equipmentBtn: {
        backgroundColor: "#EEEEEE",
        height: 50,
        width: "50%",
        justifyContent: "center",
        borderRadius: 10,
        marginTop: 20,
    },
    eBtnText: {
        alignSelf: "center",
        fontWeight: "bold",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "90%",
        margin: 15,
    },
    rowHeader: {
        fontWeight: "bold",
        flex: 2,
    },
    rightArrow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "50%",
        flex: 3,
    },
});
