import { validateRequirements } from "../../helper/drawer/CreateOrgUtils";
import { DataStore } from "@aws-amplify/datastore";
import { Alert } from "react-native";

jest.mock("@aws-amplify/datastore", () => ({
  DataStore: {
    query: jest.fn(),
  },
}));

jest.spyOn(Alert, "alert");

jest.mock("../../models", () => ({
  OrgUserStorage: jest.fn(),
}));

const user = {
  attributes: {
    sub: "user-1",
    name: "username-1",
  },
};

describe("validateRequirements", () => {
  let setIsLoading;

  beforeEach(() => {
    setIsLoading = jest.fn();
    jest.clearAllMocks();
  });

  it("should fail if name does not match regex", async () => {
    const result = await validateRequirements(" ", user);

    expect(result).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith(
      "Name invalid!",
      "Please check the rules.",
    );
  });

  it("should pass if name matches regex", async () => {
    DataStore.query.mockResolvedValueOnce([]);
    DataStore.query.mockResolvedValueOnce([]);
    const result = await validateRequirements(
      "ValidName",
      { attributes: { sub: "user-1" } },
      setIsLoading,
    );

    expect(result).toBe(true);
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it("should fail if user is part of 5 or more organizations", async () => {
    DataStore.query.mockResolvedValueOnce([]);
    DataStore.query.mockResolvedValueOnce(new Array(5));
    const result = await validateRequirements(
      "ValidName",
      { attributes: { sub: "user-1" } },
      setIsLoading,
    );

    expect(result).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith(
      "User cannot be a part of more than 5 organizations!",
    );
  });

  it("should pass if user is part of less than 5 organizations", async () => {
    DataStore.query.mockResolvedValueOnce([]);
    DataStore.query.mockResolvedValueOnce(new Array(4));
    const result = await validateRequirements(
      "ValidName",
      { attributes: { sub: "user-1" } },
      setIsLoading,
    );

    expect(result).toBe(true);
    expect(Alert.alert).not.toHaveBeenCalled();
  });
});
