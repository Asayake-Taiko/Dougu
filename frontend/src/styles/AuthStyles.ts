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
    justifyContent: "flex-start",
    alignItems: "center",
    flex: 1,
    paddingTop: "30%",
    backgroundColor: Colors.white,
  },
  error: {
    color: "red",
    marginTop: Spacing.sm,
  },
  link: {
    color: Colors.blue,
    fontWeight: Typography.fontWeight[600],
  },
  header: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.black,
    padding: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.dark,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  input: {
    height: Layout.dimensions.buttonHeight,
    borderWidth: Layout.borderWidth.thin,
    borderColor: Colors.gray300,
    borderRadius: Layout.borderRadius.md,
    padding: Spacing.sm,
    width: "80%",
    marginBottom: Spacing.md,
    color: Colors.black,
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
    padding: Spacing.md,
  },
  footerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray500,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    marginVertical: Spacing.md,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray200,
  },
  separatorText: {
    marginHorizontal: Spacing.sm,
    color: Colors.gray500,
    fontSize: Typography.fontSize.sm,
  },
  signInContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "10%",
  },
  requestContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: "15%",
  },
  logo: {
    fontSize: 48,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: 80,
  },
});
