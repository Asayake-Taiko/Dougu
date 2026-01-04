import { Dispatch, SetStateAction, useState } from "react";
import { StyleSheet, Text } from "react-native";

import PasswordInput from "../PasswordInput";
import { useAuth } from "../../lib/context/AuthContext";
import { useModal } from "../../lib/context/ModalContext";
import { useSpinner } from "../../lib/context/SpinnerContext";
import { Logger } from "../../lib/Logger";
import BaseProfileOverlay from "./BaseProfileOverlay";
import { PressableOpacity } from "../PressableOpacity";
import { ProfileStyles } from "../../styles/ProfileStyles";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Colors } from "../../styles/global";

/*
    A component that allows the user to change their password
    in the profile screen
*/
export default function PasswordOverlay({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}) {
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { updatePassword } = useAuth();
  const { setMessage } = useModal();
  const { showSpinner, hideSpinner } = useSpinner();

  // update user profile attributes in Cognito
  const handleUpdatePassword = async () => {
    try {
      // ensure new password and confirm password match
      if (newPassword !== confirmPassword) {
        setMessage("Passwords do not match");
        return;
      }
      // check password length
      if (newPassword.length < 8) {
        setMessage("Password must be at least 8 characters long.");
        return;
      }
      showSpinner();
      // set user password in cognito
      await updatePassword(currPassword, newPassword);
      setCurrPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setVisible(false);
    } catch (e) {
      Logger.error(e);
      if (e instanceof Error) {
        setMessage(e.message);
      } else {
        setMessage("Failed to update password. Check current password.");
      }
    } finally {
      hideSpinner();
    }
  };

  return (
    <BaseProfileOverlay
      visible={visible}
      setVisible={setVisible}
      title="Change Password"
    >
      <PasswordInput
        password={currPassword}
        setPassword={setCurrPassword}
        placeHolder="current password"
      />
      <PasswordInput
        password={newPassword}
        setPassword={setNewPassword}
        placeHolder="new password"
      />
      <PasswordInput
        password={confirmPassword}
        setPassword={setConfirmPassword}
        placeHolder="confirm password"
      />

      <PressableOpacity
        style={styles.saveButton}
        onPress={handleUpdatePassword}
      >
        <FontAwesome name="save" size={20} color={Colors.white} style={{ marginRight: 10 }} />
        <Text style={styles.saveButtonText}>Save</Text>
      </PressableOpacity>
    </BaseProfileOverlay>
  );
}

const styles = StyleSheet.create({
  saveButton: {
    ...ProfileStyles.button,
    backgroundColor: "#333333",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    width: "80%",
  },
  saveButtonText: {
    ...ProfileStyles.buttonText,
    color: Colors.white,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
});
