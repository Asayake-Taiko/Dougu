import React from "react";
import { TouchableOpacity } from "react-native";
import ProfileDisplay from "../ProfileDisplay";
import { useUser } from "../../helper/context/UserContext";
import { MyHeaderProfileButtonProps } from "../../types/NavigatorTypes";

//Left profile icon
export default function MyHeaderProfileButton({
  navigation,
}: MyHeaderProfileButtonProps) {
  const { user } = useUser();

  return (
    <TouchableOpacity style={{ left: 20 }} onPress={navigation.toggleDrawer}>
      <ProfileDisplay
        isMini={true}
        profileKey={user!.profile}
        source={null}
        userId={user!.id}
      />
    </TouchableOpacity>
  );
}
