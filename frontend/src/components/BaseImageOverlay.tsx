import React from "react";
import { StyleSheet, Pressable, View, Text } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import IconMenu from "./IconMenu";
import { ContainerOverlayStyles } from "../styles/ContainerOverlay";
import { Colors, Spacing } from "../styles/global";
import { PressableOpacity } from "./PressableOpacity";

/* 
    BaseImageOverlay is a generic component for displaying an image selection menu
    in an overlay. It can be used for both user profile images and organization images.
*/
export default function BaseImageOverlay({
  visible,
  setVisible,
  onSave,
  displayComponent,
  iconMenuData,
  handleSet,
  buttonTitle = "Save",
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onSave: () => Promise<void>;
  displayComponent: React.ReactNode;
  iconMenuData: { [key: string]: any };
  handleSet: (key: string) => void;
  buttonTitle?: string;
}) {
  return (
    <>
      {visible && (
        <Pressable
          onPress={() => setVisible(false)}
          style={ContainerOverlayStyles.backDrop}
        >
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.profile}
          >
            {displayComponent}
          </Animated.View>
          <Animated.View
            style={[ContainerOverlayStyles.itemContainer, styles.overlay]}
            entering={ZoomIn}
            exiting={ZoomOut}
          >
            <Pressable style={styles.pressableContainer}>
              <IconMenu data={iconMenuData} handleSet={handleSet} />
            </Pressable>
          </Animated.View>
          <View style={styles.buttonContainer}>
            <PressableOpacity
              style={{
                backgroundColor: Colors.primary,
                padding: Spacing.md,
                borderRadius: Spacing.md,
              }}
              onPress={onSave}
            >
              <Text
                style={{
                  color: Colors.white,
                  textAlign: "center",
                  fontSize: 18,
                }}
              >
                {buttonTitle}
              </Text>
            </PressableOpacity>
          </View>
        </Pressable>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: "80%",
    marginTop: Spacing.lg,
  },
  overlay: {
    backgroundColor: Colors.gray300,
  },
  pressableContainer: {
    height: "100%",
    width: "100%",
  },
  profile: {
    marginTop: "5%",
  },
});
