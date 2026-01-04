import {
  UpdateUserAttributesOutput,
  updateUserAttributes,
} from "aws-amplify/auth";
import { DataStore } from "@aws-amplify/datastore";

import { UserType } from "../../types/ContextTypes";
import { Dispatch, SetStateAction } from "react";
import { OrgUserStorage, UserOrStorage } from "../../models";

// update user profile attributes in Cognito
export const modifyUserAttribute = async (
  key: keyof UserType,
  value: string,
): Promise<UpdateUserAttributesOutput> => {
  // update user in cognito (server)
  const output = await updateUserAttributes({
    userAttributes: {
      [key]: value,
    },
  });
  return output;
};

export const updateUserContext = async (
  user: UserType,
  setUser: Dispatch<SetStateAction<UserType | null>>,
  key: keyof UserType,
  value: string,
) => {
  // update user context (local)
  const newUser = { ...user!, [key]: value };
  setUser(newUser);
};

export const editProfilePictures = async (userId: string, profile: string) => {
  const orgUserStorages = await DataStore.query(OrgUserStorage, (c) =>
    c.and((c) => [c.user.eq(userId), c.type.eq(UserOrStorage.USER)]),
  );
  // for each orgUserStorage, set the profile to the new one
  orgUserStorages.forEach(async (user) => {
    await DataStore.save(
      OrgUserStorage.copyOf(user, (updated) => {
        updated.profile = profile;
      }),
    );
  });
};

export const editOrgUserStorages = async (
  userId: string,
  key: "profile" | "name",
  value: string,
) => {
  const orgUserStorages = await DataStore.query(OrgUserStorage, (c) =>
    c.and((c) => [c.user.eq(userId), c.type.eq(UserOrStorage.USER)]),
  );
  // for each orgUserStorage, set the key to the new value
  orgUserStorages.forEach(async (user) => {
    await DataStore.save(
      OrgUserStorage.copyOf(user, (updated) => {
        (updated as any)[key] = value;
      }),
    );
  });
};
