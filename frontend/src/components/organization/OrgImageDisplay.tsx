import { Image } from "expo-image";
import { DisplayStyles } from "../../styles/Display";
import { orgMapping } from "../../lib/ImageMapping";

/*
  ProfileDisplay displays the profile image of a user. It can either
  use a stored image uri or fetch the image from AWS S3.
*/
export default function OrgImageDisplay({
  imageKey,
}: {
  imageKey: string;
}) {
  return (
    <Image
      source={orgMapping[imageKey]}
      style={DisplayStyles.image}
    />
  );
}
