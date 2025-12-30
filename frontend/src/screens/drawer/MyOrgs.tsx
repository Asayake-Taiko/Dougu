import React from "react";
import { StyleSheet, Text, FlatList, TouchableOpacity, View } from "react-native";
import { MyOrgsScreenNavigationProp } from "../../types/navigation";
import { useAuth } from "../../lib/context/AuthContext";
import { useQuery } from "@powersync/react-native";
import { OrganizationRecord } from "../../types/db";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/*
  This screen will display the organizations that the user is a part of.
  The user can select an organization to open the MemberTabs for that organization.
*/
export default function MyOrgsScreen({ navigation }: { navigation: MyOrgsScreenNavigationProp }) {
    const { user } = useAuth();

    const { data: organizations } = useQuery<OrganizationRecord>(
        `SELECT
            o.*
        FROM
            organizations o
        JOIN
            org_memberships m ON o.id = m.organization_id
        WHERE
            m.user_id = ?`,
        [user?.id]
    );

    // set the current organization and navigate to the MemberTabs
    const setAndNavigate = async (orgId: string, orgName: string) => {
        // TODO: Update some global state or context with the selected org
        console.log(`Navigating to organization: ${orgName} (${orgId})`);
        // For now, we'll just log it until MemberTabs is implemented
    };

    const renderOrgItem = ({ item }: { item: OrganizationRecord }) => (
        <TouchableOpacity
            onPress={() => setAndNavigate(item.id, item.name)}
            style={styles.orgContainer}
            activeOpacity={0.7}
        >
            <View style={styles.orgIconContainer}>
                <MaterialCommunityIcons name="office-building" size={28} color="#6200EE" />
            </View>
            <View style={styles.orgInfo}>
                <Text style={styles.orgName}>{item.name}</Text>
                <Text style={styles.orgCode}>Code: {item.access_code}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#CCCCCC" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={organizations}
                renderItem={renderOrgItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="account-group-outline" size={80} color="#DDDDDD" />
                        <Text style={styles.emptyText}>You are not a member of any organizations yet.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    listContent: {
        padding: 16,
    },
    orgContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        marginVertical: 8,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#EEEEEE",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orgIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#F3E5F5",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    orgInfo: {
        flex: 1,
        justifyContent: "center",
    },
    orgName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333333",
    },
    orgCode: {
        fontSize: 14,
        color: "#666666",
        marginTop: 4,
        fontFamily: "monospace",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 100,
    },
    emptyText: {
        color: "#999999",
        fontSize: 16,
        textAlign: "center",
        marginTop: 16,
        paddingHorizontal: 40,
    },
});
