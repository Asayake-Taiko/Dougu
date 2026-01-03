import { Text, View, Alert, StyleSheet } from "react-native";
import { MemberProfileScreenProps } from "../../types/navigation";
import ProfileDisplay from "../../components/ProfileDisplay";
import { ProfileStyles } from "../../styles/ProfileStyles";
import { PressableOpacity } from "../../components/PressableOpacity";
import { useMembership } from "../../lib/context/MembershipContext";
import { useSpinner } from "../../lib/context/SpinnerContext";
import { useModal } from "../../lib/context/ModalContext";
import { db } from "../../lib/powersync/PowerSync";
import { Logger } from "../../lib/Logger";
import { useNavigation } from "@react-navigation/native";

export default function MemberProfileScreen({
  route,
}: MemberProfileScreenProps) {
  const navigation = useNavigation();
  const { member } = route.params;
  const { organization, isManager } = useMembership();
  const { showSpinner, hideSpinner } = useSpinner();
  const { setMessage } = useModal();

  // delete an orgUserStorage associated with the user
  // DOING SO ALSO REMOVES ALL EQUIPMENT ASSOCIATED WITH THE USER
  const handleDelete = async () => {
    if (!isManager) {
      setMessage("Only managers can kick members.");
      return;
    }

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
              const orgId = organization?.id;
              const targetId = member.membershipType === 'USER' ? member.userId : member.id;

              if (!orgId) throw new Error("No active organization found");
              if (!targetId) throw new Error("Member ID not found");

              await db.writeTransaction(async (tx) => {
                // Cascading delete based on assigned_to and organization_id for safety
                await tx.execute(
                  "DELETE FROM equipment WHERE assigned_to = ? AND organization_id = ?",
                  [targetId, orgId]
                );
                await tx.execute(
                  "DELETE FROM containers WHERE assigned_to = ? AND organization_id = ?",
                  [targetId, orgId]
                );

                if (member.membershipType === 'USER') {
                  await tx.execute(
                    "DELETE FROM org_memberships WHERE user_id = ? AND organization_id = ?",
                    [member.userId, orgId]
                  );
                } else {
                  await tx.execute(
                    "DELETE FROM org_memberships WHERE id = ?",
                    [member.id]
                  );
                }
              });
              navigation.goBack();
            } catch (error) {
              Logger.error("Error deleting member:", error);
              setMessage("Failed to kick member. Please try again.");
            } finally {
              hideSpinner();
            }
          },
        },
      ]
    );
  };

  // transfer ownership permission to a user by making them the org manager
  const handleTransfer = async () => {
    if (!isManager) {
      setMessage("Only the current manager can transfer ownership.");
      return;
    }

    if (member.membershipType !== 'USER' || !member.userId) {
      setMessage("Ownership can only be transferred to a user.");
      return;
    }

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
              await db.execute(
                "UPDATE organizations SET manager_id = ? WHERE id = ?",
                [member.userId, organization!.id]
              );
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
      ]
    );
  };

  return (
    <View style={ProfileStyles.container}>
      <View style={ProfileStyles.profile}>
        <ProfileDisplay
          isMini={false}
          profileKey={member.profile}
        />
      </View>
      <View style={ProfileStyles.centerRow}>
        <Text style={ProfileStyles.text}>{member.name}</Text>
      </View>
      {member.details && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsText}>{member.details}</Text>
        </View>
      )}
      {isManager && (
        <>
          <PressableOpacity onPress={handleTransfer} style={ProfileStyles.buttonContainer}>
            <Text style={ProfileStyles.buttonText}>Make Manager</Text>
          </PressableOpacity>
          <PressableOpacity onPress={handleDelete} style={[ProfileStyles.buttonContainer, styles.kickButton]}>
            <Text style={ProfileStyles.buttonText}>Kick</Text>
          </PressableOpacity>
        </>
      )}
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
