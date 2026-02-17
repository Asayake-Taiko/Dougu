import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { PressableOpacity } from "../../components/PressableOpacity";
import { useMembership } from "../../lib/context/MembershipContext";
import { useSpinner } from "../../lib/context/SpinnerContext";
import { useModal } from "../../lib/context/ModalContext";
import { Colors, Spacing } from "../../styles/global";
import { Logger } from "../../lib/utils/Logger";

/*
  DeleteOrgScreen allows a manager to permanently delete an organization
  and all its associated data.
*/
export default function DeleteOrgScreen() {
  const navigation = useNavigation();
  const { organization, isManager } = useMembership();
  const { showSpinner, hideSpinner } = useSpinner();
  const { setMessage } = useModal();
  const [orgNameConfirm, setOrgNameConfirm] = useState("");

  if (!organization) {
    return null;
  }

  const handleDelete = async () => {
    try {
      // checks
      if (orgNameConfirm !== organization.name)
        throw new Error(
          "Organization name doesn't match. Please type it exactly.",
        );
      if (!isManager)
        throw new Error("Only managers can delete organizations.");

      // perform deletion
      showSpinner();
      await organization.delete();
      setMessage("Organization deleted successfully.");
      navigation.getParent()?.goBack();
    } catch (error: any) {
      Logger.error("Failed to delete organization", error);
      setMessage(
        error.message || "An error occurred while deleting the organization.",
      );
    } finally {
      hideSpinner();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Confirm Deletion</Text>
      <View style={styles.warningBox}>
        <Text style={styles.warningText}>
          WARNING: This action is IRREVERSIBLE.
        </Text>
        <Text style={styles.label}>
          All equipment, containers, and membership data for {'"'}
          {organization.name}
          {'"'} will be permanently deleted.
        </Text>
      </View>

      <Text style={styles.instruction}>
        Please type the organization name to confirm:
      </Text>

      <TextInput
        style={styles.input}
        value={orgNameConfirm}
        onChangeText={setOrgNameConfirm}
        placeholder={organization.name}
        placeholderTextColor={Colors.gray500}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <PressableOpacity
        onPress={handleDelete}
        style={[
          styles.button,
          orgNameConfirm !== organization.name && styles.buttonDisabled,
        ]}
        disabled={orgNameConfirm !== organization.name}
      >
        <Text style={styles.buttonText}>Delete Organization</Text>
      </PressableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.lg,
    backgroundColor: Colors.white || "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 40,
    marginBottom: 20,
    color: Colors.black || "#333",
  },
  warningBox: {
    backgroundColor: "#FFF5F5",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FEB2B2",
    marginBottom: 30,
    width: "100%",
  },
  warningText: {
    color: "#C53030",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    color: "#4A5568",
    textAlign: "center",
    lineHeight: 20,
  },
  instruction: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    alignSelf: "flex-start",
    marginLeft: "5%",
  },
  input: {
    height: 50,
    borderColor: "#E2E8F0",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 30,
    paddingHorizontal: 16,
    width: "90%",
    backgroundColor: "#F7FAFC",
    fontSize: 16,
    color: Colors.black,
  },
  button: {
    backgroundColor: Colors.primary || "#E53E3E",
    paddingVertical: 15,
    borderRadius: 12,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: "#CBD5E0",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});
