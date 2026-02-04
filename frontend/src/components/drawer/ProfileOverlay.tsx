import React from "react";
import { profileMapping } from "../../lib/utils/ImageMapping";
import Display from "../Display";
import { authService } from "../../lib/services/auth";
import { useModal } from "../../lib/context/ModalContext";
import { useSpinner } from "../../lib/context/SpinnerContext";
import { Logger } from "../../lib/utils/Logger";
import BaseImageOverlay from "../BaseImageOverlay";

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
  const { setMessage } = useModal();
  const { showSpinner, hideSpinner } = useSpinner();

  // update user profile attributes in Cognito
  async function handleUpdateProfile() {
    try {
      showSpinner();
      await authService.updateProfileImage(profileKey);
      setVisible(false);
    } catch (err) {
      Logger.error(err);
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage("Failed to update profile");
      }
    } finally {
      hideSpinner();
    }
  }

  return (
    <BaseImageOverlay
      visible={visible}
      setVisible={setVisible}
      onSave={handleUpdateProfile}
      displayComponent={
        <Display type="User" isMini={false} imageKey={profileKey} />
      }
      iconMenuData={profileMapping}
      handleSet={(profileData) => setProfileKey(profileData)}
      buttonTitle="Save Profile"
    />
  );
}
