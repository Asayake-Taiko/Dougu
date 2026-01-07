import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
// import { useAuth } from "../../lib/context/AuthContext";
import { useModal } from "../../lib/context/ModalContext";
import { useSpinner } from "../../lib/context/SpinnerContext";
import { Logger } from "../../lib/utils/Logger";
import BaseProfileOverlay from "./BaseProfileOverlay";
import { PressableOpacity } from "../PressableOpacity";
import { ProfileStyles } from "../../styles/ProfileStyles";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Colors } from "../../styles/global";

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
  // const { updateName } = useAuth();
  const updateName = async (name: string) => {
    Logger.info("Update name not implemented in this refactor step");
  };
  const { setMessage } = useModal();
  const { showSpinner, hideSpinner } = useSpinner();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, onChangeUsername] = useState("");

  // username = first + ' ' + last
  useEffect(() => {
    onChangeUsername(firstName + " " + lastName);
  }, [firstName, lastName]);

  // update user profile attributes in Cognito
  async function handleUpdateName() {
    try {
      showSpinner();
      await updateName(username);
      setVisible(false);
    } catch (error) {
      Logger.error(error);
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("An unexpected error occurred while updating name");
      }
    } finally {
      hideSpinner();
    }
  }

  return (
    <BaseProfileOverlay
      visible={visible}
      setVisible={setVisible}
      title="Change Name"
    >
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

      <PressableOpacity style={styles.saveButton} onPress={handleUpdateName}>
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
    marginBottom: "5%",
  },
});
