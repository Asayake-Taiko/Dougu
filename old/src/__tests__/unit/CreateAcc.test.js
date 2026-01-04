import { validateRequirements } from "../../helper/CreateAccUtils";
import { Alert } from "react-native";

jest.mock("react-native", () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

describe("validateRequirements", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return false and display an alert if any field is empty", async () => {
    const result = await validateRequirements("", "email", "password");
    expect(result).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith(
      "Form Error",
      "Please fill out all fields.",
      [{ text: "OK" }],
    );
  });

  it("should return false and display an alert if password length is less than 8", async () => {
    const result = await validateRequirements("username", "email", "pass");
    expect(result).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith(
      "Form Error",
      "Password must be at least 8 characters long.",
      [{ text: "OK" }],
    );
  });

  it("should return true if all requirements are met", async () => {
    const result = await validateRequirements("username", "email", "password");
    expect(result).toBe(true);
    expect(Alert.alert).not.toHaveBeenCalled();
  });
});
