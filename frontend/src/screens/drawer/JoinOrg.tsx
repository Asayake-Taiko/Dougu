import { Text, View, TextInput } from "react-native";
import React, { useState } from "react";
import { PressableOpacity } from "../../components/PressableOpacity";

// project imports
import { createJoinStyles } from "../../styles/CreateJoinStyles";
import { JoinOrgScreenNavigationProp } from "../../types/navigation";
import { useMembership } from "../../lib/context/MembershipContext";
import { useSpinner } from "../../lib/context/SpinnerContext";
import { useModal } from "../../lib/context/ModalContext";
import { Logger } from "../../lib/utils/Logger";

/*
  Screen for joining an organization, user enters the access code to join
*/
export default function JoinOrgScreen({
  navigation,
}: {
  navigation: JoinOrgScreenNavigationProp;
}) {
  const [code, onChangeCode] = useState("");
  const { joinOrganization } = useMembership();
  const { showSpinner, hideSpinner } = useSpinner();
  const { setMessage } = useModal();

  const handleJoin = async () => {
    showSpinner();
    try {
      const { id, name } = await joinOrganization(code);
      setMessage(`Successfully joined ${name}!`);
      navigation.navigate("MemberTabs", {
        organizationId: id,
        organizationName: name,
      });
    } catch (error: any) {
      Logger.error("Error joining organization:", error);
      setMessage(
        error.message ||
          "An error occurred while trying to join the organization.",
      );
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
        <PressableOpacity style={createJoinStyles.button} onPress={handleJoin}>
          <Text style={createJoinStyles.btnText}>Join My Org</Text>
        </PressableOpacity>
      </View>
    </View>
  );
}
