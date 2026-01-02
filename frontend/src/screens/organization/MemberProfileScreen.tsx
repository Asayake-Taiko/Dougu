import { Text, View } from "react-native";
import { MemberProfileScreenProps } from "../../types/navigation";
import ProfileDisplay from "../../components/ProfileDisplay";
import { ProfileStyles } from "../../styles/ProfileStyles";
import { PressableOpacity } from "../../components/PressableOpacity";

export default function MemberProfileScreen({
  route,
}: MemberProfileScreenProps) {
  const { member } = route.params;

  // delete an orgUserStorage associated with the user
  // DOING SO ALSO REMOVES ALL EQUIPMENT ASSOCIATED WITH THE USER
  const handleDelete = async () => {
  };

  // transfer ownership permission to a user by making them the org manager
  const handleTransfer = async () => {
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
      <PressableOpacity onPress={handleTransfer} style={ProfileStyles.buttonContainer}>
        <Text style={ProfileStyles.buttonText}>Make Manager</Text>
      </PressableOpacity>
      <PressableOpacity onPress={handleDelete} style={ProfileStyles.buttonContainer}>
        <Text style={ProfileStyles.buttonText}>Kick</Text>
      </PressableOpacity>
    </View>
  );
}
