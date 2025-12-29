import React from "react";
import { StyleSheet, Pressable, View, Text } from "react-native";
import { profileMapping } from "../../lib/ImageMapping";
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import ProfileDisplay from "../ProfileDisplay";

import IconMenu from "../IconMenu";
import { ContainerOverlayStyles } from "../../styles/ContainerOverlay";
import { Colors, Spacing } from "../../styles/global";
import { useAuth } from "../../lib/context/AuthContext";
import { useModal } from "../../lib/context/ModalContext";
import { useSpinner } from "../../lib/context/SpinnerContext";
import { Logger } from "../../lib/Logger";
import { PressableOpacity } from "../PressableOpacity";

/* 
    Dispay a profile menu for choosing a user's profile image
    when tapping on the profile in the profileScreen
*/
export default function ProfileOverlay({
  visible,
  setVisible,
  profileKey,
  setProfileKey,
}: {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  profileKey: string;
  setProfileKey: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { updateProfile } = useAuth();
  const { setMessage } = useModal();
  const { showSpinner, hideSpinner } = useSpinner();

  // update user profile attributes in Cognito
  async function handleUpdateProfile() {
    try {
      showSpinner();
      await updateProfile(profileKey);
      setVisible(false);
    } catch (err) {
      Logger.error(err);
      setMessage("Failed to update profile");
    } finally {
      hideSpinner();
    }
  }

  return (
    <>
      {visible && (
        <Pressable
          onPress={() => setVisible(false)}
          style={ContainerOverlayStyles.backDrop}
        >
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.profile}
          >
            <ProfileDisplay
              isMini={false}
              profileKey={profileKey}
            />
          </Animated.View>
          <Animated.View
            style={[
              ContainerOverlayStyles.itemContainer,
              styles.overlay,
            ]}
            entering={ZoomIn}
            exiting={ZoomOut}
          >
            <Pressable style={styles.pressableContainer}>
              <IconMenu data={profileMapping} handleSet={(profileData) => setProfileKey(profileData)} />
            </Pressable>
          </Animated.View>
          <View style={styles.buttonContainer}>
            <PressableOpacity
              style={{ backgroundColor: Colors.primary, padding: Spacing.md, borderRadius: Spacing.md }}
              onPress={handleUpdateProfile}
            >
              <Text style={{ color: Colors.white, textAlign: "center", fontSize: 18 }}>Save Profile</Text>
            </PressableOpacity>
          </View>
        </Pressable>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: "80%",
    marginTop: Spacing.lg,
  },
  overlay: {
    backgroundColor: Colors.gray300,
  },
  pressableContainer: {
    height: "100%",
    width: "100%",
  },
  profile: {
    marginTop: "5%",
  },
});
