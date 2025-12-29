import { Overlay, Button } from "@rneui/themed";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

import { handleError } from "../../helper/Utils";
import {
  editOrgUserStorages,
  modifyUserAttribute,
  updateUserContext,
} from "../../helper/drawer/ModifyProfileUtils";
import { useUser } from "../../helper/context/UserContext";

/* 
    A component that allows the user to change their name
    in the profile screen
*/
export default function NameOverlay({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}) {
  const { user, setUser } = useUser();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, onChangeUsername] = useState("");

  // username = first + ' ' + last
  useEffect(() => {
    onChangeUsername(firstName + " " + lastName);
  }, [firstName, lastName]);

  // update user profile attributes in Cognito
  const handleSet = async () => {
    try {
      // set user name in cognito
      await modifyUserAttribute("name", username);
      // modify orgUserStorages to match user name
      await editOrgUserStorages(user!.id, "name", username);
      // update user context (local)
      updateUserContext(user!, setUser, "name", username);
      setFirstName("");
      setLastName("");
      setVisible(false);
      Alert.alert("Name Updated", "Your name has been updated");
    } catch (e) {
      handleError("handleSet", e as Error, null);
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
      <Text style={styles.header}>Change Name</Text>
      <View style={styles.nameContainer}>
        <TextInput
          onChangeText={setFirstName}
          value={firstName}
          placeholder="first"
          style={styles.name}
        />
        <TextInput
          onChangeText={setLastName}
          value={lastName}
          placeholder="last"
          style={styles.name}
        />
      </View>
      <Button
        radius={"md"}
        type="solid"
        icon={{ name: "save", type: "font-awesome", color: "white" }}
        title="Save"
        buttonStyle={styles.button}
        containerStyle={{ width: "80%" }}
        onPress={handleSet}
      />
    </Overlay>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#333333",
    marginTop: "5%",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: "10%",
  },
  name: {
    width: "45%",
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "80%",
    marginTop: "5%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
});
