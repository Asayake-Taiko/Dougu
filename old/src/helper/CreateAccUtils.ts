import { Alert } from "react-native";

export const validateRequirements = async (
  username: string,
  email: string,
  password: string,
) => {
  // check all fields are filled out
  if (username === "" || password === "" || email === "") {
    Alert.alert("Form Error", "Please fill out all fields.", [{ text: "OK" }]);
    return false;
  }
  // check password length
  if (password.length < 8) {
    Alert.alert("Form Error", "Password must be at least 8 characters long.", [
      { text: "OK" },
    ]);
    return false;
  }
  return true;
};
