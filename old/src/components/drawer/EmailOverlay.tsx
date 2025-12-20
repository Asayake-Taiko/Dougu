import { Overlay, Button } from "@rneui/themed";
import { Dispatch, SetStateAction, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import {
  modifyUserAttribute,
  updateUserContext,
} from "../../helper/drawer/ModifyProfileUtils";
import { useUser } from "../../helper/context/UserContext";
import { handleError } from "../../helper/Utils";
import { confirmUserAttribute } from "aws-amplify/auth";

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
  const { user, setUser } = useUser();

  // update user profile attributes in Cognito
  const sendCode = async () => {
    try {
      await modifyUserAttribute("email", email);
      Alert.alert("Verification Code Sent", "Please check your email");
    } catch (error) {
      handleError("modifyUserAttribute", error as Error, null);
      console.log(error);
    }
  };

  const verifyEmail = async () => {
    try {
      if (!code) {
        Alert.alert("Error", "Please enter a code");
        return;
      }
      await confirmUserAttribute({
        userAttributeKey: "email",
        confirmationCode: code,
      });
      // update user context (local)
      updateUserContext(user!, setUser, "email", email);
      setVisible(false);
      Alert.alert("Email Updated", "Your email has been updated");
    } catch (e) {
      handleError("verifyEmail", e as Error, null);
    }
  };

  return (
    <Overlay
      isVisible={visible}
      fullScreen
      animationType="slide"
      overlayStyle={{ alignItems: "center" }}
    >
      <View style={styles.row}>
        <Button
          icon={{ name: "arrow-left", type: "font-awesome", color: "black" }}
          title="Profile"
          titleStyle={{ color: "black" }}
          type="clear"
          onPress={() => setVisible(false)}
          buttonStyle={{ alignSelf: "flex-start" }}
        />
      </View>
      <Text style={styles.header}>Change Email</Text>
      <View style={[styles.row, { marginTop: "5%" }]}>
        <TextInput
          onChangeText={setEmail}
          value={email}
          placeholder="new email"
          style={styles.email}
          keyboardType="email-address"
        />
        <Button
          radius={"md"}
          type="solid"
          title={"Send"}
          buttonStyle={styles.button}
          containerStyle={{ width: "15%", marginLeft: "5%" }}
          titleStyle={{ fontSize: 12 }}
          onPress={sendCode}
        />
      </View>
      <TextInput
        onChangeText={setCode}
        value={code}
        placeholder="verification code"
        style={styles.code}
        keyboardType="numeric"
      />
      <Button
        radius={"md"}
        type="solid"
        icon={{ name: "save", type: "font-awesome", color: "white" }}
        title="Save"
        buttonStyle={styles.button}
        containerStyle={{ width: "80%" }}
        onPress={verifyEmail}
      />
    </Overlay>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#333333",
    marginTop: "5%",
    height: 50,
  },
  code: {
    width: "80%",
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: "5%",
  },
  email: {
    width: "60%",
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginLeft: "10%",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: "10%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
});
