import React, { useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { MemberProfileScreenProps } from "../../types/navigation";
import DisplayImage from "../../components/DisplayImage";
import { ProfileStyles } from "../../styles/ProfileStyles";
import { PressableOpacity } from "../../components/PressableOpacity";
import { useMembership } from "../../lib/context/MembershipContext";
import { useSpinner } from "../../lib/context/SpinnerContext";
import { useModal } from "../../lib/context/ModalContext";
import { Logger } from "../../lib/utils/Logger";
import { useNavigation } from "@react-navigation/native";
import ConfirmationModal from "../../components/member/ConfirmationModal";
import { DisplayStyles } from "../../styles/Display";

export default function MemberProfileScreen({
  route,
}: MemberProfileScreenProps) {
  const navigation = useNavigation();
  const { member } = route.params;
  const { organization } = useMembership();
  const { showSpinner, hideSpinner } = useSpinner();
  const { setMessage } = useModal();

  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
    isDestructive?: boolean;
    confirmText?: string;
  }>({
    visible: false,
    title: "",
    message: "",
    onConfirm: async () => {},
  });

  if (!member || !organization) return null;

  const showKickConfirmation = () => {
    setModalConfig({
      visible: true,
      title: "Kick Member",
      message: `Are you sure you want to kick ${member.name}? This will delete all equipment and containers assigned to them in this organization.`,
      confirmText: "Kick",
      isDestructive: true,
      onConfirm: handleKick,
    });
  };

  const showTransferConfirmation = () => {
    setModalConfig({
      visible: true,
      title: "Transfer Ownership",
      message: `Are you sure you want to make ${member.name} the manager? You will no longer be the manager.`,
      confirmText: "Transfer",
      isDestructive: false,
      onConfirm: handleTransfer,
    });
  };

  const handleKick = async () => {
    try {
      showSpinner();
      await member.delete();
      setMessage("Member kicked successfully.");
      navigation.goBack();
    } catch (error: any) {
      Logger.error("Error deleting member:", error);
      setMessage(error.message || "Failed to kick member. Please try again.");
    } finally {
      hideSpinner();
      setModalConfig((prev) => ({ ...prev, visible: false }));
    }
  };

  const handleTransfer = async () => {
    try {
      showSpinner();
      await organization.transferOwnership(member.userId!);
      setMessage(`${member.name} is now the manager.`);
      navigation.goBack();
    } catch (error: any) {
      Logger.error("Error transferring ownership:", error);
      setMessage(error.message || "Failed to transfer ownership.");
    } finally {
      hideSpinner();
      setModalConfig((prev) => ({ ...prev, visible: false }));
    }
  };

  return (
    <View style={ProfileStyles.container}>
      <View style={ProfileStyles.profile}>
        <DisplayImage imageKey={member.profile} style={DisplayStyles.profile} />
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
        onPress={showTransferConfirmation}
        style={ProfileStyles.buttonContainer}
      >
        <Text style={ProfileStyles.buttonText}>Make Manager</Text>
      </PressableOpacity>
      <PressableOpacity
        onPress={showKickConfirmation}
        style={[ProfileStyles.buttonContainer, styles.kickButton]}
      >
        <Text style={ProfileStyles.buttonText}>Kick</Text>
      </PressableOpacity>

      <ConfirmationModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig((prev) => ({ ...prev, visible: false }))}
        confirmText={modalConfig.confirmText}
        isDestructive={modalConfig.isDestructive}
      />
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
