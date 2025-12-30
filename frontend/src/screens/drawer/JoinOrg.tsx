import { Text, View, TextInput } from "react-native";
import React, { useState } from "react";
import { PressableOpacity } from "../../components/PressableOpacity";

// project imports
import { createJoinStyles } from "../../styles/CreateJoinStyles";
import { JoinOrgScreenNavigationProp } from "../../types/navigation";
import { db } from "../../lib/powersync/PowerSync";
import { useAuth } from "../../lib/context/AuthContext";
import { useSpinner } from "../../lib/context/SpinnerContext";
import { useModal } from "../../lib/context/ModalContext";
import { Logger } from "../../lib/Logger";

/*
  Screen for joining an organization, user enters the access code to join
*/
export default function JoinOrgScreen({ navigation }: { navigation: JoinOrgScreenNavigationProp }) {
    const [code, onChangeCode] = useState("");
    const { user } = useAuth();
    const { showSpinner, hideSpinner } = useSpinner();
    const { setMessage } = useModal();

    const handleJoin = async () => {
        if (!code.trim()) {
            setMessage("Please enter an access code");
            return;
        }

        showSpinner();
        try {
            const org = await db.getOptional<any>('SELECT * FROM organizations WHERE access_code = ?', [code.trim()]);

            if (!org) {
                setMessage("Organization not found");
                return;
            }

            const existingMemberships = await db.getAll(
                'SELECT * FROM org_memberships WHERE organization_id = ? AND user_id = ?',
                [org.id, user?.id]
            );

            if (existingMemberships.length > 0) {
                setMessage("You are already a member of this organization.");
                return;
            }

            // Join the organization
            await db.execute(
                'INSERT INTO org_memberships (id, organization_id, user_id, type) VALUES (?, ?, ?, ?)',
                [
                    // Simple unique ID generation for the membership record
                    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                    org.id,
                    user?.id,
                    'member'
                ]
            );
            setMessage(`Successfully joined ${org.name}!`);
            navigation.navigate('MemberTabs', { organizationId: org.id, organizationName: org.name });
        } catch (error) {
            Logger.error("Error joining organization:", error);
            setMessage("An error occurred while trying to join the organization.");
        } finally {
            onChangeCode("");
            hideSpinner();
        }
    };

    return (
        <View style={createJoinStyles.mainContainer}>
            <View style={createJoinStyles.container}>
                <Text style={createJoinStyles.title}>Join Org</Text>
                <Text style={createJoinStyles.subtitle}>
                    Enter the access code provided by the organization manager
                </Text>
                <TextInput
                    style={createJoinStyles.input}
                    onChangeText={onChangeCode}
                    value={code}
                    placeholder="Ex. ABC1234"
                    keyboardType="default"
                    autoCapitalize="characters"
                />
                <PressableOpacity
                    style={createJoinStyles.button}
                    onPress={handleJoin}
                >
                    <Text style={createJoinStyles.btnText}>Join My Org</Text>
                </PressableOpacity>
            </View>
        </View>
    );
}
