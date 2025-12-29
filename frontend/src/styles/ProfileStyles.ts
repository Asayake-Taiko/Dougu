import { StyleSheet } from "react-native";
import { Colors, Spacing } from "./global";

export const ProfileStyles = StyleSheet.create({
  button: {
    borderRadius: Spacing.sm,
    marginTop: Spacing.lg,
  },
  buttonContainer: { 
    width: "80%", 
    marginTop: Spacing.lg,
  },
  buttonText: {
    color: Colors.primary,
  },
  centerRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: "center",
  },
  changeBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    width: 40, // Static size instead of dynamic
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray300,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: -5,
    bottom: -5,
    borderColor: Colors.white,
    borderWidth: 5,
  },
  text: {
    fontSize: 16,
  },
  profile: {
    width: 100, // Static size instead of dynamic
    marginTop: "5%",
    marginBottom: "5%",
  },
  row: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: Spacing.md,
  },
});
