import { Dispatch, SetStateAction, useState } from "react";
import { StyleSheet, Text, TextInput } from "react-native";

import { useAuth } from "../../lib/context/AuthContext";
import { useModal } from "../../lib/context/ModalContext";
import { useSpinner } from "../../lib/context/SpinnerContext";
import { Logger } from "../../lib/utils/Logger";
import BaseProfileOverlay from "./BaseProfileOverlay";
import { PressableOpacity } from "../PressableOpacity";
import { ProfileStyles } from "../../styles/ProfileStyles";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Colors } from "../../styles/global";

/*
    A component that allows the user to delete their account
    in the profile screen
*/
export default function DeleteOverlay({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}) {
  const [email, setEmail] = useState("");
  const { user, deleteAccount } = useAuth();
  const { setMessage } = useModal();
  const { showSpinner, hideSpinner } = useSpinner();

  const handleDelete = async () => {
    try {
      showSpinner();
      if (email !== user?.email) {
        setMessage("Email does not match");
        return;
      }
      await deleteAccount();
    } catch (e) {
      Logger.error(e);
      if (e instanceof Error) {
        setMessage(e.message);
      } else {
        setMessage("Failed to delete account");
      }
    } finally {
      hideSpinner();
    }
  };

  return (
    <BaseProfileOverlay
      visible={visible}
      setVisible={setVisible}
      title="Delete Account"
    >
      <Text style={{ marginHorizontal: "20%", textAlign: "center" }}>
        To confirm, please type your email address below.
      </Text>
      <TextInput
        onChangeText={setEmail}
        value={email}
        placeholder="email"
        style={styles.email}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <PressableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
      >
        <FontAwesome name="trash" size={20} color={Colors.white} style={{ marginRight: 10 }} />
        <Text style={styles.deleteButtonText}>Delete</Text>
      </PressableOpacity>
    </BaseProfileOverlay>
  );
}

const styles = StyleSheet.create({
  deleteButton: {
    ...ProfileStyles.button,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    width: "80%",
  },
  deleteButtonText: {
    ...ProfileStyles.buttonText,
    color: Colors.white,
    fontWeight: "bold",
  },
  email: {
    width: "80%",
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: "5%",
  },
});
