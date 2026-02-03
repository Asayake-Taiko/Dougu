import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import { ConfirmationModalStyles } from "../../styles/ConfirmationModalStyles";

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmationModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
}: ConfirmationModalProps) {
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onCancel}
    >
      <View style={ConfirmationModalStyles.centeredView}>
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={ConfirmationModalStyles.backdrop}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={onCancel}
            activeOpacity={1}
          />
        </Animated.View>

        <Animated.View
          entering={ZoomIn.duration(300)}
          exiting={ZoomOut.duration(200)}
          style={ConfirmationModalStyles.modalView}
        >
          <Text style={ConfirmationModalStyles.title}>{title}</Text>
          <Text style={ConfirmationModalStyles.message}>{message}</Text>

          <View style={ConfirmationModalStyles.buttonContainer}>
            <TouchableOpacity
              style={[
                ConfirmationModalStyles.button,
                ConfirmationModalStyles.cancelButton,
              ]}
              onPress={onCancel}
            >
              <Text style={ConfirmationModalStyles.cancelButtonText}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                ConfirmationModalStyles.button,
                isDestructive
                  ? ConfirmationModalStyles.destructiveButton
                  : ConfirmationModalStyles.confirmButton,
              ]}
              onPress={onConfirm}
            >
              <Text style={ConfirmationModalStyles.confirmButtonText}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
