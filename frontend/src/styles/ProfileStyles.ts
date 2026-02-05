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
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: Colors.white,
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
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 0,
    bottom: 0,
    borderColor: Colors.black,
    borderWidth: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
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
