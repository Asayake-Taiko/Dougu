import React from "react";
import { Image } from "expo-image";
import { orgMapping } from "../../lib/utils/ImageMapping";
import { DisplayStyles } from "../../styles/Display";
import { useMembership } from "../../lib/context/MembershipContext";
import { useModal } from "../../lib/context/ModalContext";
import { useSpinner } from "../../lib/context/SpinnerContext";
import { Logger } from "../../lib/utils/Logger";
import BaseImageOverlay from "../BaseImageOverlay";

export default function OrgImageOverlay({
  visible,
  setVisible,
  imageKey,
  setImageKey,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  imageKey: string;
  setImageKey: (key: string) => void;
}) {
  const { organization } = useMembership();
  const { setMessage } = useModal();
  const { showSpinner, hideSpinner } = useSpinner();

  async function handleUpdateOrgImage() {
    if (!organization) {
      setMessage("Organization not found");
      return;
    }

    try {
      showSpinner();
      await organization.updateImage(imageKey);
      setVisible(false);
    } catch (err: any) {
      Logger.error(err);
      setMessage(err.message || "Failed to update organization image");
    } finally {
      hideSpinner();
    }
  }

  return (
    <BaseImageOverlay
      visible={visible}
      setVisible={setVisible}
      onSave={handleUpdateOrgImage}
      displayComponent={
        <Image source={orgMapping[imageKey]} style={DisplayStyles.image} />
      }
      iconMenuData={orgMapping}
      handleSet={setImageKey}
      buttonTitle="Save Image"
    />
  );
}
