import { Dispatch, SetStateAction, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { authService } from "../../lib/services/auth";
import { useModal } from "../../lib/context/ModalContext";
import { useSpinner } from "../../lib/context/SpinnerContext";
import { Logger } from "../../lib/utils/Logger";
import BaseProfileOverlay from "./BaseProfileOverlay";
import { PressableOpacity } from "../PressableOpacity";
import { ProfileStyles } from "../../styles/ProfileStyles";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Colors } from "../../styles/global";

/*
    A component that allows the user to change their email
    in the profile screen. The user must verify their new email
    by entering a code sent to their email.
*/
export default function EmailOverlay({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const { setMessage } = useModal();
  const { showSpinner, hideSpinner } = useSpinner();

  // update user profile attributes in Cognito
  const handleSendCode = async () => {
    try {
      showSpinner();
      await authService.sendEmailUpdateCode(email);
      setMessage("Please check your email for a verification code.");
    } catch (error) {
      Logger.error(error);
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Failed to send verification code");
      }
    } finally {
      hideSpinner();
    }
  };

  const handleVerifyEmail = async () => {
    try {
      showSpinner();
      await authService.confirmEmailUpdate(email, code);
      setVisible(false);
    } catch (e) {
      Logger.error(e);
      if (e instanceof Error) {
        setMessage(e.message);
      } else {
        setMessage("Failed to verify email");
      }
    } finally {
      hideSpinner();
    }
  };

  return (
    <BaseProfileOverlay
      visible={visible}
      setVisible={setVisible}
      title="Change Email"
    >
      <View style={[styles.row, { marginTop: "5%", justifyContent: "center" }]}>
        <TextInput
          onChangeText={setEmail}
          value={email}
          placeholder="new email"
          placeholderTextColor={Colors.gray500}
          style={styles.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <PressableOpacity style={styles.sendButton} onPress={handleSendCode}>
          <Text style={styles.sendButtonText}>Send</Text>
        </PressableOpacity>
      </View>
      <TextInput
        onChangeText={setCode}
        value={code}
        placeholder="verification code"
        placeholderTextColor={Colors.gray500}
        style={styles.code}
        keyboardType="numeric"
      />

      <PressableOpacity style={styles.saveButton} onPress={handleVerifyEmail}>
        <FontAwesome
          name="save"
          size={20}
          color={Colors.white}
          style={{ marginRight: 10 }}
        />
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
  sendButton: {
    ...ProfileStyles.button,
    backgroundColor: "#333333",
    marginTop: 0, // Override profile styles margin
    marginLeft: "5%",
    width: "15%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  sendButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  code: {
    width: "80%",
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: "5%",
    color: Colors.black,
  },
  email: {
    width: "60%",
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    color: Colors.black,
    // marginLeft handled by flex layout now, or keeping logic close to original
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
});
