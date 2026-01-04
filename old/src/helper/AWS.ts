import { getUrl, uploadData } from "aws-amplify/storage";
import { ImageSourcePropType } from "react-native";

/*
    Call an AWS API Gateway endpoint that uses a lambda function
    to create a user group and add a user to the group.
*/
const userGroupUrl = process.env.EXPO_PUBLIC_API + "/user-group";

// create a user group with the given name
export const createUserGroup = async (
  jwtToken: string,
  userGroupName: string,
) => {
  const response = await fetch(userGroupUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: userGroupName,
    }),
  });
  if (response.status !== 200) {
    throw new Error("Failed to create user group");
  }
  return true;
};

// add a user of the given userId to the user group of the given name
export const addUserToGroup = async (
  jwtToken: string,
  userGroupName: string,
  userId: string,
) => {
  const response = await fetch(userGroupUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: userGroupName,
      userId: userId,
    }),
  });
  if (response.status !== 200) {
    throw new Error("Failed to add user to group");
  }
  return true;
};

// uploads an equipment image to S3
export const uploadImage = async (
  imageSource: ImageSourcePropType | null,
  path: string,
) => {
  if (!imageSource || typeof imageSource != "object" || !("uri" in imageSource))
    throw new Error("Invalid image source");
  const imageUri = imageSource.uri;
  const imageData = await fetch(String(imageUri)).then((r) => r.blob());
  await uploadData({
    path: path,
    data: imageData,
  }).result;
};

// get a signed URL for an image in S3
// set the image uri
export const getImageUri = async (path: string) => {
  try {
    console.log("Getting image uri for path", path);
    const getUrlResult = await getUrl({
      path: path,
      options: {
        validateObjectExistence: true, // Check if object exists before creating a URL
      },
    });
    return getUrlResult.url.toString();
  } catch (error) {
    console.log("Error getting image uri", error);
    return null;
  }
};
