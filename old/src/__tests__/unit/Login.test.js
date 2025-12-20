import { signIn, signOut } from "aws-amplify/auth";
import { render, fireEvent, act } from "@testing-library/react-native";

import { MockUserProvider, MockLoadingProvider } from "../mock/MockProviders";
import LoginScreen from "../../components/Login";
import { handleError, setUserContext } from "../../helper/Utils";

/*
    Test login.tsx file and ensure that the user can sign in successfully
    and that errors are handled correctly
*/

const mockNavigation = {
  navigate: jest.fn(),
};

jest.mock("aws-amplify/auth", () => ({
  signOut: jest.fn(),
  signIn: jest.fn(),
  fetchUserAttributes: jest.fn(),
}));

jest.mock("../../helper/Utils", () => ({
  handleError: jest.fn(),
  setUserContext: jest.fn(),
}));

jest.mock("@aws-amplify/datastore", () => ({
  DataStore: {
    clear: jest.fn(),
  },
  initSchema: jest.fn(() => ({
    Organization: jest.fn(),
    OrgUserStorage: jest.fn(),
    Container: jest.fn(),
    Equipment: jest.fn(),
  })),
}));

jest.setTimeout(10000);

describe("signIn", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("signs in a user successfully", async () => {
    const username = "T@gmail.com";
    const password = "Tassword";

    signOut.mockResolvedValueOnce({});
    signIn.mockResolvedValueOnce({});
    setUserContext.mockResolvedValueOnce();

    const { getByTestId } = render(
      <MockLoadingProvider>
        <MockUserProvider>
          <LoginScreen navigation={mockNavigation} />
        </MockUserProvider>
      </MockLoadingProvider>,
    );

    const emailInput = getByTestId("emailInput");
    act(() => {
      fireEvent.changeText(emailInput, username);
    });

    const passwordInput = getByTestId("passwordInput");
    act(() => {
      fireEvent.changeText(passwordInput, password);
    });

    const signInButton = getByTestId("signInButton");
    await act(async () => {
      fireEvent.press(signInButton);
    });

    expect(signIn).toHaveBeenCalledWith({
      username: username,
      password: password,
    });
    expect(setUserContext).toHaveBeenCalled();
    expect(handleError).not.toHaveBeenCalled();
  });

  it("handles errors during sign in", async () => {
    const username = null;
    const password = null;
    const error = new Error("sign in failed");

    signOut.mockResolvedValueOnce({});
    signIn.mockRejectedValueOnce(error);

    const { getByTestId } = render(
      <MockLoadingProvider>
        <MockUserProvider>
          <LoginScreen navigation={mockNavigation} />
        </MockUserProvider>
      </MockLoadingProvider>,
    );

    const emailInput = getByTestId("emailInput");
    await act(async () => {
      fireEvent.changeText(emailInput, username);
    });

    const passwordInput = getByTestId("passwordInput");
    await act(async () => {
      fireEvent.changeText(passwordInput, password);
    });

    const signInButton = getByTestId("signInButton");
    await act(async () => {
      fireEvent.press(signInButton);
    });

    expect(signIn).toHaveBeenCalledWith({
      username: username,
      password: password,
    });
    expect(handleError).toHaveBeenCalledWith(
      "signIn",
      error,
      expect.any(Function),
    );
  });
});
