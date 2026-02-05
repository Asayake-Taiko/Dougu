import { StyleSheet, Dimensions } from "react-native";
import { Colors, Spacing } from "./global";

const { width: windowWidth } = Dimensions.get("window");

export const ConfirmationModalStyles = StyleSheet.create({
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    width: windowWidth * 0.85,
    backgroundColor: Colors.white,
    borderRadius: Spacing.lg,
    padding: Spacing.xl,
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: Colors.gray500,
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    color: Colors.gray500,
    fontWeight: "600",
    fontSize: 16,
  },
  confirmButtonText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  destructiveButton: {
    backgroundColor: "#791111", // Keeping it separate for destructive actions
  },
});
