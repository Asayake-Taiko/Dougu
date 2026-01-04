import { Alert, Text, View } from "react-native";
import { MemberProfileScreenProps } from "../../types/ScreenTypes";
import ProfileDisplay from "../../components/ProfileDisplay";
import { Button } from "@rneui/themed";
import { useLoad } from "../../helper/context/LoadingContext";
import { DataStore } from "@aws-amplify/datastore";
import { Organization, OrgUserStorage } from "../../models";
import { handleError } from "../../helper/Utils";
import { useUser } from "../../helper/context/UserContext";
import { useProfileStyles } from "../../styles/ProfileStyles";

export default function MemberProfileScreen({
  route,
}: MemberProfileScreenProps) {
  const { member } = route.params;
  const { setIsLoading } = useLoad();
  const { org, setOrg, isManager, setIsManager } = useUser();
  const profileStyles = useProfileStyles();

  // delete an orgUserStorage associated with the user
  // DOING SO ALSO REMOVES ALL EQUIPMENT ASSOCIATED WITH THE USER
  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const orgUserStorage = await DataStore.query(OrgUserStorage, member.id);
      if (orgUserStorage == null) throw new Error("User/Storage not found");
      await DataStore.delete(orgUserStorage);
      setIsLoading(false);
    } catch (e) {
      handleError("handleDelete", e as Error, setIsLoading);
    }
  };

  // transfer ownership permission to a user by making them the org manager
  const handleTransfer = async () => {
    try {
      setIsLoading(true);
      const orgUserStorage = await DataStore.query(OrgUserStorage, member.id);
      const dataOrg = await DataStore.query(Organization, org!.id);
      if (
        orgUserStorage == null ||
        dataOrg == null ||
        orgUserStorage.type === "STORAGE"
      )
        throw new Error("Bad data issue! Please restart and try again.");
      const updated = await DataStore.save(
        Organization.copyOf(dataOrg, (updated) => {
          updated.manager = orgUserStorage.user as string;
        }),
      );
      setOrg(updated);
      setIsManager(false);
      setIsLoading(false);
    } catch (e) {
      handleError("handleDelete", e as Error, setIsLoading);
    }
  };

  const confirmDelete = async () => {
    if (!isManager) {
      Alert.alert(
        "Authorization Error",
        "You do not have permission to delete",
        [
          {
            text: "OK",
          },
        ],
      );
    } else {
      Alert.alert(
        "Confirmation",
        "Are you sure you want to delete this user? \nWARNING: Deleting this user also deletes all equipment/containers that belong to them",
        [
          {
            text: "Yes",
            onPress: handleDelete,
          },
          {
            text: "Cancel",
          },
        ],
      );
    }
  };

  const confirmTransfer = async () => {
    if (!isManager || member.type === "STORAGE") {
      Alert.alert(
        "Error",
        "You either don't have permission or can't transfer to a storage",
        [
          {
            text: "OK",
          },
        ],
      );
    } else {
      Alert.alert(
        "Confirmation",
        "Are you sure you want to transfer ownership to this user? \nYou will lose your current ownership",
        [
          {
            text: "Yes",
            onPress: handleTransfer,
          },
          {
            text: "Cancel",
          },
        ],
      );
    }
  };

  return (
    <View style={profileStyles.container}>
      <View style={profileStyles.profile}>
        <ProfileDisplay
          isMini={false}
          userId={member.user}
          profileKey={member.profile}
          source={null}
        />
      </View>
      <View style={profileStyles.centerRow}>
        <Text style={profileStyles.text}>{member.name}</Text>
      </View>
      <Button
        title="Make Manager"
        color={"#791111"}
        containerStyle={profileStyles.buttonContainer}
        titleStyle={{ color: "white" }}
        size="lg"
        radius="md"
        onPress={confirmTransfer}
      />
      <Button
        title="Kick"
        color={"#EEEEEE"}
        containerStyle={profileStyles.buttonContainer}
        titleStyle={profileStyles.buttonText}
        size="lg"
        radius="md"
        onPress={confirmDelete}
      />
    </View>
  );
}
