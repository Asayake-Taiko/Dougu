import {
  View,
  StyleSheet,
  Alert,
  Text,
  ImageSourcePropType,
} from "react-native";
import {
  launchImageLibraryAsync,
  launchCameraAsync,
  MediaTypeOptions,
  requestCameraPermissionsAsync,
  ImagePickerAsset,
} from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Button } from "@rneui/themed";
import { Dispatch, SetStateAction } from "react";

/*
  UploadImage is a component that allows the user to upload an image
  for an equipment object. These images will be uploaded to AWS S3. 
*/
export default function UploadImage({
  setImageSource,
  setImageKey,
}: {
  setImageSource: Dispatch<SetStateAction<ImageSourcePropType | null>>;
  setImageKey: Dispatch<SetStateAction<string>>;
}) {
  // set the image source and key after compressing the image
  const setImage = async (asset: ImagePickerAsset) => {
    let fileName;
    if (!asset.fileName) {
      const uriParts = asset.uri.split("/");
      fileName = uriParts[uriParts.length - 1];
    } else {
      fileName = asset.fileName;
    }
    // compress the image (for cost savings)
    const manipResult = await ImageManipulator.manipulateAsync(
      asset.uri,
      [{ resize: { width: 150 } }],
      { compress: 0, format: ImageManipulator.SaveFormat.PNG },
    );
    setImageSource(manipResult);
    if (setImageKey) setImageKey(fileName);
  };

  // pick an image from the gallery
  const pickImage = async () => {
    let result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  // take a photo with the camera
  const takePhoto = async () => {
    const permissions = await requestCameraPermissionsAsync();
    if (!permissions.granted) {
      Alert.alert(
        "Camera permissions are required to take a photo.",
        "Please enable camera permissions in your settings.",
      );
      return;
    }
    let result = await launchCameraAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upload Image</Text>
      <Text style={styles.text}>
        You can use custom images for your items. Just select an image from your
        gallery or take a photo.
      </Text>
      <View style={styles.row}>
        <Button
          buttonStyle={styles.button}
          containerStyle={styles.buttonContainer}
          icon={{ name: "image", type: "ionicon", color: "white", size: 50 }}
          iconPosition="top"
          onPress={pickImage}
          radius={"lg"}
          title="Gallery"
          titleStyle={{ fontWeight: "500" }}
        />
        <Button
          buttonStyle={styles.button}
          containerStyle={styles.buttonContainer}
          icon={{
            name: "camera",
            type: "font-awesome",
            color: "white",
            size: 50,
          }}
          iconPosition="top"
          onPress={takePhoto}
          radius={"lg"}
          title="Camera"
          titleStyle={{ fontWeight: "500" }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#791111",
  },
  buttonContainer: {
    width: "40%",
    margin: 10,
  },
  container: {
    flex: 1,
    alignItems: "center",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: "10%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
  },
  text: {
    textAlign: "center",
    marginBottom: 20,
    width: "80%",
  },
});
