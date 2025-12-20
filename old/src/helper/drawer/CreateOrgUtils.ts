import { DataStore } from "@aws-amplify/datastore";
import { Alert } from "react-native";

import { OrgUserStorage } from "../../models";
import { UserType } from "../../types/ContextTypes";

export const validateRequirements = async (name: string, user: UserType) => {
  // check an appropriate orgName (no spaces, no special characters)
  const regEx = /^[a-zA-Z0-9-_]{1,40}$/;
  if (!regEx.test(name)) {
    Alert.alert("Name invalid!", "Please check the rules.");
    return false;
  }
  // check that the name isn't already taken
  const orgs = await DataStore.query(OrgUserStorage, (c) => c.name.eq(name));
  if (orgs.length > 0) {
    Alert.alert("Organization name is already taken!");
    return false;
  }
  // check that the user is not a part of more than 5 organizations
  const userOrgs = await DataStore.query(OrgUserStorage, (c) =>
    c.user.eq(user!.id),
  );
  if (userOrgs.length >= 5) {
    Alert.alert("User cannot be a part of more than 5 organizations!");
    return false;
  }
  return true;
};
