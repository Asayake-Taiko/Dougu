import React from "react";
import { Text, View, Alert, StyleSheet } from "react-native";
import { MemberProfileScreenProps } from "../../types/navigation";
import ProfileDisplay from "../../components/ProfileDisplay";
import { ProfileStyles } from "../../styles/ProfileStyles";
import { PressableOpacity } from "../../components/PressableOpacity";
import { useMembership } from "../../lib/context/MembershipContext";
import { useSpinner } from "../../lib/context/SpinnerContext";
import { useModal } from "../../lib/context/ModalContext";
import { Logger } from "../../lib/utils/Logger";
import { useNavigation } from "@react-navigation/native";

export default function MemberProfileScreen({
  route,
}: MemberProfileScreenProps) {
  const navigation = useNavigation();
  const { member } = route.params;
  const { organization } = useMembership();
  const { showSpinner, hideSpinner } = useSpinner();
  const { setMessage } = useModal();

  if (!member || !organization) return null;

  const handleKick = async () => {
    Alert.alert(
      "Kick Member",
      `Are you sure you want to kick ${member.name}? This will delete all equipment and containers assigned to them in this organization.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Kick",
          style: "destructive",
          onPress: async () => {
            try {
              showSpinner();
              await member.delete();
              setMessage("Member kicked successfully.");
              navigation.goBack();
            } catch (error) {
              Logger.error("Error deleting member:", error);
              setMessage("Failed to kick member. Please try again.");
            } finally {
              hideSpinner();
            }
          },
        },
      ],
    );
  };

  const handleTransfer = async () => {
    Alert.alert(
      "Transfer Ownership",
      `Are you sure you want to make ${member.name} the manager? You will no longer be the manager.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Transfer",
          onPress: async () => {
            try {
              showSpinner();
              await organization.transferOwnership(member.userId!);
              setMessage(`${member.name} is now the manager.`);
              navigation.goBack();
            } catch (error) {
              Logger.error("Error transferring ownership:", error);
              setMessage("Failed to transfer ownership. Please try again.");
            } finally {
              hideSpinner();
            }
          },
        },
      ],
    );
  };

  return (
    <View style={ProfileStyles.container}>
      <View style={ProfileStyles.profile}>
        <ProfileDisplay isMini={false} profileKey={member.profile} />
      </View>
      <View style={ProfileStyles.centerRow}>
        <Text style={ProfileStyles.text}>{member.name}</Text>
      </View>
      {member.details && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsText}>{member.details}</Text>
        </View>
      )}
      <PressableOpacity
        onPress={handleTransfer}
        style={ProfileStyles.buttonContainer}
      >
        <Text style={ProfileStyles.buttonText}>Make Manager</Text>
      </PressableOpacity>
      <PressableOpacity
        onPress={handleKick}
        style={[ProfileStyles.buttonContainer, styles.kickButton]}
      >
        <Text style={ProfileStyles.buttonText}>Kick</Text>
      </PressableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  detailsContainer: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  detailsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  kickButton: {
    backgroundColor: "#791111",
  },
});
