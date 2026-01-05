import { Text, View, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";

// project imports
import { createJoinStyles } from "../../styles/CreateJoinStyles";
import { CreateOrgScreenNavigationProp } from "../../types/navigation";
import { useSpinner } from "../../lib/context/SpinnerContext";
import { useModal } from "../../lib/context/ModalContext";
import { useMembership } from "../../lib/context/MembershipContext";
import { Logger } from "../../lib/utils/Logger";

/*
  Screen for creating an organization, user enters the name of the org
  and a random access code is generated. The user that creates the org is
  automatically the manager of the org.
*/
export default function CreateOrgScreen({ navigation }: { navigation: CreateOrgScreenNavigationProp }) {
    const [name, onChangeName] = useState("");
    const { showSpinner, hideSpinner } = useSpinner();
    const { setMessage } = useModal();
    const { createOrganization } = useMembership();

    // handle verification, creation, and navigation when creating a new Organization
    async function handleCreate() {
        showSpinner();
        try {
            const { id, name: orgName, code } = await createOrganization(name);
            setMessage(`Successfully created ${orgName}! Your access code is: ${code}`);
            navigation.navigate('MemberTabs', { organizationId: id, organizationName: orgName });
        } catch (error: any) {
            Logger.error("Error creating organization:", error);
            setMessage(error.message || "An error occurred while trying to create the organization.");
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
