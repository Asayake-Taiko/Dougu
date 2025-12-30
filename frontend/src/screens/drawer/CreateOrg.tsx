import { Text, View, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";

// project imports
import { createJoinStyles } from "../../styles/CreateJoinStyles";
import { CreateOrgScreenNavigationProp } from "../../types/navigation";
import { useAuth } from "../../lib/context/AuthContext";
import { useSpinner } from "../../lib/context/SpinnerContext";
import { useModal } from "../../lib/context/ModalContext";
import { db } from "../../lib/powersync/PowerSync";
import { Logger } from "../../lib/Logger";

/*
  Screen for creating an organization, user enters the name of the org
  and a random access code is generated. The user that creates the org is
  automatically the manager of the org.
*/
export default function CreateOrgScreen({ navigation }: { navigation: CreateOrgScreenNavigationProp }) {
    const [name, onChangeName] = useState("");
    const { showSpinner, hideSpinner } = useSpinner();
    const { setMessage } = useModal();
    const { user } = useAuth();

    // Helper to generate a random uppercase string
    const generateRandomString = (length: number) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    // generate codes and check if they are unique. If not, generate another
    async function generateUniqueCode() {
        while (true) {
            const code = generateRandomString(7);
            // Check that access code is unique using parameterized query
            const existing = await db.getOptional<any>('SELECT id FROM organizations WHERE access_code = ?', [code]);
            if (!existing) {
                return code;
            }
        }
    };

    // handle verification, creation, and navigation when creating a new Organization
    async function handleCreate() {
        if (!name.trim()) {
            setMessage("Please enter an organization name.");
            return;
        }

        // Validate name requirements (1-40 alphanumeric characters with no whitespaces, _ and - allowed)
        const nameRegEx = /^[a-zA-Z0-9-_]{1,40}$/;
        if (!nameRegEx.test(name)) {
            setMessage("Invalid name! Use 1-40 alphanumeric characters, no spaces (_ and - allowed).");
            return;
        }

        showSpinner();
        try {
            // 1. Check if the name is already taken
            const existingOrg = await db.getOptional<any>('SELECT id FROM organizations WHERE name = ?', [name]);
            if (existingOrg) {
                setMessage("Organization name is already taken!");
                return;
            }

            // 2. Generate a random unique access code
            const code = await generateUniqueCode();

            // 3. Create the organization and membership in a transaction (atomic)
            const orgId = Math.random().toString(36).substring(2, 15);
            await db.writeTransaction(async (tx) => {
                const membershipId = Math.random().toString(36).substring(2, 15);

                // Insert the organization
                await tx.execute(
                    'INSERT INTO organizations (id, name, access_code, manager_id, created_at) VALUES (?, ?, ?, ?, ?)',
                    [orgId, name, code, user?.id, new Date().toISOString()]
                );

                // Insert the organization membership for the creator (as manager)
                await tx.execute(
                    'INSERT INTO org_memberships (id, organization_id, user_id, type) VALUES (?, ?, ?, ?)',
                    [membershipId, orgId, user?.id, 'manager']
                );
            });

            setMessage(`Successfully created ${name}! Your access code is: ${code}`);
            navigation.navigate('MemberTabs', { organizationId: orgId, organizationName: name });
        } catch (error) {
            Logger.error("Error creating organization:", error);
            setMessage("An error occurred while trying to create the organization.");
        } finally {
            onChangeName("");
            hideSpinner();
        }
    };

    return (
        <View style={createJoinStyles.mainContainer}>
            <View style={createJoinStyles.container}>
                <Text style={createJoinStyles.title}>Create Org</Text>
                <Text style={createJoinStyles.subtitle}>
                    Create a name for your org.
                </Text>
                <TextInput
                    style={createJoinStyles.input}
                    onChangeText={onChangeName}
                    value={name}
                    placeholder="Ex. Great_Org"
                    keyboardType="default"
                    autoCapitalize="none"
                />
                <TouchableOpacity
                    style={createJoinStyles.button}
                    onPress={handleCreate}
                >
                    <Text style={createJoinStyles.btnText}>Create Org</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
