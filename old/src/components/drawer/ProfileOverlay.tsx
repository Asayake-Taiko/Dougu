import React, { useState } from "react";
import { StyleSheet, Pressable, ImageSourcePropType } from "react-native";
import { profileMapping } from "../../helper/ImageMapping";
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import ProfileDisplay from "../ProfileDisplay";

import IconMenu from "../IconMenu";
import { Tab } from "@rneui/themed";
import UploadImage from "../UploadImage";
import { useContainerStyles } from "../../styles/ContainerOverlay";

/* 
    Dispay a profile menu for choosing a user's profile image
    when tapping on the profile in the profileScreen
*/
export default function ProfileOverlay({
  visible,
  setVisible,
  profileSource,
  setProfileSource,
  profileKey,
  setProfileKey,
  userId,
}: {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  profileSource: ImageSourcePropType | null;
  setProfileSource: React.Dispatch<
    React.SetStateAction<ImageSourcePropType | null>
  >;
  profileKey: string;
  setProfileKey: React.Dispatch<React.SetStateAction<string>>;
  userId?: string;
}) {
  const containerOverlayStyles = useContainerStyles();
  const [selected, setSelected] = useState(0);

  // update user profile attributes in Cognito
  const handleSet = async (profileData: string) => {
    setProfileSource(null);
    setProfileKey(profileData);
  };

  const handleClose = async () => {
    setVisible(false);
    setSelected(0);
  };

  return (
    <>
      {visible && (
        <Pressable
          onPress={handleClose}
          style={containerOverlayStyles.backDrop}
        >
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.profile}
          >
            <ProfileDisplay
              isMini={false}
              profileKey={profileKey}
              source={profileSource}
              userId={userId}
            />
          </Animated.View>
          <Animated.View
            style={[
              containerOverlayStyles.itemContainer,
              { backgroundColor: "#D3D3D3" },
            ]}
            entering={ZoomIn}
            exiting={ZoomOut}
          >
            <Pressable onPress={() => {}} style={styles.pressableContainer}>
              <Tab
                value={selected}
                onChange={setSelected}
                iconPosition="left"
                indicatorStyle={[{ backgroundColor: "black", width: "50%" }]}
                titleStyle={{ color: "black" }}
                containerStyle={{
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                }}
              >
                <Tab.Item
                  icon={{ name: "camera", type: "ionicon", color: "black" }}
                ></Tab.Item>
                <Tab.Item
                  icon={{ name: "file", type: "font-awesome", color: "black" }}
                ></Tab.Item>
              </Tab>
              {selected === 0 ? (
                <IconMenu data={profileMapping} handleSet={handleSet} />
              ) : (
                <UploadImage
                  setImageSource={setProfileSource}
                  setImageKey={setProfileKey}
                />
              )}
            </Pressable>
          </Animated.View>
        </Pressable>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  backDrop: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  button: {
    backgroundColor: "#791111",
  },
  buttonContainer: {
    width: "80%",
    margin: 10,
  },
  overlay: {
    backgroundColor: "#D3D3D3",
    width: "85%",
    height: "55%",
    borderRadius: 20,
  },
  pressableContainer: {
    height: "100%",
    width: "100%",
  },
  profile: {
    marginTop: "5%",
  },
});
