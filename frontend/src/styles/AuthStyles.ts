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
    justifyContent: "center",
  },
  btnText: {
    fontWeight: Typography.fontWeight[600],
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
  },
  header: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.dark,
    padding: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.dark,
    textAlign: "center",
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
  additionalText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray500,
    textAlign: "center",
    padding: Spacing.sm,
  },
  signInContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "5%",
  },
  requestContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: "15%",
  },
  logo: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    padding: 50,
    marginTop: -80,
  },
});
