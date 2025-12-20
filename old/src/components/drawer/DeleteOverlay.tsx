import { Overlay, Button } from "@rneui/themed";
import { Dispatch, SetStateAction, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { deleteUser } from "aws-amplify/auth";

import { useUser } from "../../helper/context/UserContext";
import { editOrgUserStorages } from "../../helper/drawer/ModifyProfileUtils";
import { ProfileScreenProps } from "../../types/ScreenTypes";
import { handleError } from "../../helper/Utils";
import { useLoad } from "../../helper/context/LoadingContext";

/*
    A component that allows the user to delete their account
    in the profile screen
*/
export default function DeleteOverlay({
  visible,
  setVisible,
  navigation,
}: {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  navigation: ProfileScreenProps;
}) {
  const [email, setEmail] = useState("");
  const { user, resetContext } = useUser();
  const { setIsLoading } = useLoad();

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      // verify that the email matches the user's email
      if (email !== user?.email) {
        Alert.alert("Email does not match", "Please try again");
        return;
      }
      // mark user's orguserstorages as deleted
      const deletedName = user.name + " (deleted)";
      await editOrgUserStorages(user!.id, "name", deletedName);
      // delete the user
      await deleteUser();
      resetContext();
      setIsLoading(false);
      navigation.navigate("Home");
    } catch (e) {
      handleError("handleDelete", e as Error, setIsLoading);
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
      <Text style={styles.header}>Delete Account</Text>
      <Text style={{ marginHorizontal: "20%", textAlign: "center" }}>
        To confirm, please type your email address below.
      </Text>
      <TextInput
        onChangeText={setEmail}
        value={email}
        placeholder="email"
        style={styles.email}
      />
      <Button
        radius={"md"}
        type="solid"
        icon={{ name: "trash", type: "font-awesome", color: "white" }}
        title="Delete"
        buttonStyle={styles.button}
        containerStyle={{ width: "80%" }}
        onPress={handleDelete}
      />
    </Overlay>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "red",
    marginTop: "5%",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: "10%",
  },
  email: {
    width: "80%",
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: "5%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
});
