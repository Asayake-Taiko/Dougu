import {
  View,
  TouchableOpacity,
  Text,
  Alert,
  ImageSourcePropType,
} from "react-native";
import React, { useState } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Button } from "@rneui/themed";
import { DataStore } from "@aws-amplify/datastore";

import { useUser } from "../../helper/context/UserContext";
import ProfileOverlay from "../../components/drawer/ProfileOverlay";
import NameOverlay from "../../components/drawer/NameOverlay";
import PasswordOverlay from "../../components/drawer/PasswordOverlay";
import EmailOverlay from "../../components/drawer/EmailOverlay";
import DeleteOverlay from "../../components/drawer/DeleteOverlay";
import { Organization } from "../../models";
import { ProfileScreenProps } from "../../types/ScreenTypes";
import ProfileDisplay from "../../components/ProfileDisplay";
import { uploadImage } from "../../helper/AWS";
import {
  editOrgUserStorages,
  modifyUserAttribute,
  updateUserContext,
} from "../../helper/drawer/ModifyProfileUtils";
import { handleError } from "../../helper/Utils";
import { useLoad } from "../../helper/context/LoadingContext";
import { useProfileStyles } from "../../styles/ProfileStyles";
import { useDimensions } from "../../helper/context/DimensionsContext";

/*
  Displays user information and provides access for
  fields to be edited. User attributes are profile image,
  name, email, and password
*/
export default function ProfileScreen({
  navigation,
}: {
  navigation: ProfileScreenProps;
}) {
  const { windowWidth } = useDimensions();
  const { user, setUser } = useUser();
  const profileStyles = useProfileStyles();
  const [profileVisible, setProfileVisible] = useState(false);
  const [nameVisible, setNameVisible] = useState(false);
  const [emailVisible, setEmailVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const { setIsLoading } = useLoad();
  const [profileSource, setProfileSource] =
    useState<ImageSourcePropType | null>(null);
  const [profileKey, setProfileKey] = useState<string>(user!.profile);

  // organization managers must transfer ownership before deleting account
  const verifyDelete = async () => {
    const orgs = await DataStore.query(Organization, (o) =>
      o.manager.eq(user!.id),
    );
    if (orgs.length > 0) {
      Alert.alert(
        "Cannot Delete Account",
        "You are the manager of an organization, please transfer ownership before deleting your account",
      );
    } else {
      setDeleteVisible(true);
    }
  };

  // update user profile with new profile source and key
  const updateProfile = async () => {
    try {
      // don't update if the profile is the same
      if (user?.profile === profileKey) {
        return;
      }
      setIsLoading(true);
      // if we are using profilesource, we need to upload it to S3
      if (profileSource) {
        const path = `public/profiles/${user!.id}/profile.jpeg`;
        await uploadImage(profileSource, path);
      }
      updateUserContext(user!, setUser, "profile", profileKey);
      modifyUserAttribute("profile", profileKey);
      // update OrgUserStorages to match user profile
      await editOrgUserStorages(user!.id, "profile", profileKey);
      setIsLoading(false);
    } catch (e) {
      handleError("updateProfile", e as Error, setIsLoading);
    }
  };

  return (
    <View style={profileStyles.container}>
      <TouchableOpacity
        style={profileStyles.profile}
        onPress={() => setProfileVisible(true)}
      >
        <ProfileDisplay
          isMini={false}
          userId={user!.id}
          profileKey={profileKey}
          source={profileSource}
        />
        <View style={profileStyles.editButton}>
          <MaterialCommunityIcons name="pencil" size={windowWidth / 18} />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={updateProfile}>
        {user?.profile !== profileKey ? (
          <Text
            style={{
              color: "#0000ff",
              fontSize: 14,
            }}
          >
            Save Profile
          </Text>
        ) : null}
      </TouchableOpacity>
      <TouchableOpacity
        style={profileStyles.row}
        onPress={() => setNameVisible(true)}
      >
        <Text style={profileStyles.text}>Name</Text>
        <View style={profileStyles.changeBtn}>
          <Text style={profileStyles.text}>{user!.name}</Text>
          <MaterialCommunityIcons name="chevron-right" size={30} />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={profileStyles.row}
        onPress={() => setEmailVisible(true)}
      >
        <Text style={profileStyles.text}>Email</Text>
        <View style={profileStyles.changeBtn}>
          <Text style={profileStyles.text}>{user!.email}</Text>
          <MaterialCommunityIcons name="chevron-right" size={30} />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={profileStyles.row}
        onPress={() => setPasswordVisible(true)}
      >
        <Text style={profileStyles.text}>Change Password</Text>
        <View style={profileStyles.changeBtn}>
          <MaterialCommunityIcons name="chevron-right" size={30} />
        </View>
      </TouchableOpacity>
      <Button
        title="Delete Account"
        color={"#EEEEEE"}
        buttonStyle={profileStyles.button}
        titleStyle={profileStyles.buttonText}
        onPress={verifyDelete}
      />
      <ProfileOverlay
        visible={profileVisible}
        setVisible={setProfileVisible}
        profileSource={profileSource}
        setProfileSource={setProfileSource}
        profileKey={profileKey}
        setProfileKey={setProfileKey}
      />
      <NameOverlay visible={nameVisible} setVisible={setNameVisible} />
      <PasswordOverlay
        visible={passwordVisible}
        setVisible={setPasswordVisible}
      />
      <EmailOverlay visible={emailVisible} setVisible={setEmailVisible} />
      <DeleteOverlay
        visible={deleteVisible}
        setVisible={setDeleteVisible}
        navigation={navigation}
      />
    </View>
  );
}
