import { StyleSheet } from "react-native";
import { Colors, Spacing, Typography, Layout } from "./global";

/*
  styles for Login, CreateAcc, RequestPasswordReset, and ResetPassword
*/
export const AuthStyles = StyleSheet.create({
  button: {
    height: Layout.dimensions.buttonHeight,
    margin: Spacing.md,
    backgroundColor: Colors.dark,
    width: "80%",
    borderRadius: Layout.borderRadius.md,
  },
  btnText: {
    textAlign: "center",
    color: Colors.white,
    padding: Spacing.sm,
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  error: {
    color: "red",
    marginTop: Spacing.sm,
  },
  link: {
    color: Colors.blue,
    marginTop: Spacing.sm,
  },
  header: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  input: {
    height: Layout.dimensions.inputHeight,
    marginTop: "5%",
    borderWidth: Layout.borderWidth.thin,
    borderRadius: Layout.borderRadius.md,
    padding: Spacing.sm,
    width: "80%",
  },
  name: {
    width: "40%",
    height: Layout.dimensions.inputHeight,
    borderWidth: Layout.borderWidth.thin,
    borderRadius: Layout.borderRadius.md,
    padding: Spacing.sm,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "80%",
    marginTop: "5%",
  },
  requestContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: "15%",
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.dark,
    textAlign: "center",
  },
});
