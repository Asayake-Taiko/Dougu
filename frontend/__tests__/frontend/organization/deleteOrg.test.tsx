import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react-native";
import { renderWithModal } from "./testSetup";

import DeleteOrgScreen from "../../../src/screens/organization/DeleteOrgScreen";
import { Organization } from "../../../src/types/models";
import { OrganizationRecord } from "../../../src/types/db";

import { useMembership } from "../../../src/lib/context/MembershipContext";
import { useSpinner } from "../../../src/lib/context/SpinnerContext";
import { useNavigation } from "@react-navigation/native";

// Mock organization service
jest.mock("../../../src/lib/services/organization", () => ({
  organizationService: {
    deleteOrganization: jest.fn(),
  },
}));

describe("DeleteOrgScreen", () => {
  let mockShowSpinner: jest.Mock;
  let mockHideSpinner: jest.Mock;
  let mockGoBack: jest.Mock;
  let mockOrganizationDelete: jest.Mock;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    mockShowSpinner = jest.fn();
    mockHideSpinner = jest.fn();
    mockGoBack = jest.fn();
    mockOrganizationDelete = jest.fn();

    (useSpinner as jest.Mock).mockReturnValue({
      showSpinner: mockShowSpinner,
      hideSpinner: mockHideSpinner,
    });

    (useNavigation as jest.Mock).mockReturnValue({
      getParent: jest.fn(() => ({
        goBack: mockGoBack,
      })),
    });
  });

  const createMockOrganization = (name: string): Organization => {
    const orgRecord: OrganizationRecord = {
      id: "test-org-id",
      name,
      access_code: "ABC123",
      manager_id: "test-manager-id",
      image: "default_org",
      color: "#791111",
      created_at: "2026-01-01T00:00:00Z",
    };

    const org = new Organization(orgRecord);
    // Mock the delete method
    org.delete = mockOrganizationDelete;
    return org;
  };

  describe("Successful deletion", () => {
    it("should delete organization and show success message when correct name is entered and user is manager", async () => {
      const mockOrg = createMockOrganization("TestOrg");
      mockOrganizationDelete.mockResolvedValue(undefined);

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(<DeleteOrgScreen />);

      // Verify the warning message is displayed
      expect(
        screen.getByText(/WARNING: This action is IRREVERSIBLE/i),
      ).toBeTruthy();
      expect(
        screen.getByText(/All equipment, containers, and membership data/i),
      ).toBeTruthy();

      // Find the input and button
      const input = screen.getByPlaceholderText("TestOrg");
      const deleteButton = screen.getByText("Delete Organization");

      // Type the correct organization name
      fireEvent.changeText(input, "TestOrg");

      // Press the delete button
      fireEvent.press(deleteButton);

      // Wait for the success message to appear in the modal
      await waitFor(() => {
        expect(
          screen.getByText("Organization deleted successfully."),
        ).toBeTruthy();
      });

      // Also verify the expected behaviors
      expect(mockShowSpinner).toHaveBeenCalled();
      expect(mockOrganizationDelete).toHaveBeenCalled();
      expect(mockGoBack).toHaveBeenCalled();
      expect(mockHideSpinner).toHaveBeenCalled();
    });
  });

  describe("Wrong confirmOrgName", () => {
    it("should not call delete when organization name does not match (button disabled)", async () => {
      const mockOrg = createMockOrganization("TestOrg");

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(<DeleteOrgScreen />);

      const input = screen.getByPlaceholderText("TestOrg");
      const deleteButton = screen.getByText("Delete Organization");

      // Type an incorrect organization name
      fireEvent.changeText(input, "WrongName");

      // Try to press the button (button should be disabled and not fire)
      fireEvent.press(deleteButton);

      // Wait a bit to ensure no async operations started
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should NOT have called any functions since button was disabled
      expect(mockShowSpinner).not.toHaveBeenCalled();
      expect(mockOrganizationDelete).not.toHaveBeenCalled();
      expect(mockGoBack).not.toHaveBeenCalled();

      // Verify no error message appears in the modal
      expect(screen.queryByText(/Organization name doesn't match/i)).toBeNull();
    });
  });

  describe("Not Manager", () => {
    it("should show error message when user is not a manager (even with correct name)", async () => {
      const mockOrg = createMockOrganization("TestOrg");

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: false, // User is not a manager
      });

      renderWithModal(<DeleteOrgScreen />);

      const input = screen.getByPlaceholderText("TestOrg");
      const deleteButton = screen.getByText("Delete Organization");

      // Type the correct organization name (button will be enabled by name match)
      fireEvent.changeText(input, "TestOrg");

      // Press the delete button
      fireEvent.press(deleteButton);

      // Wait for the error message to appear in the modal
      await waitFor(
        () => {
          expect(
            screen.getByText("Only managers can delete organizations."),
          ).toBeTruthy();
        },
        { timeout: 3000 },
      );

      // Also verify these behaviors
      expect(mockOrganizationDelete).not.toHaveBeenCalled();
      expect(mockGoBack).not.toHaveBeenCalled();
    });
  });

  describe("Error handling", () => {
    it("should show error message when delete operation fails", async () => {
      const mockOrg = createMockOrganization("TestOrg");
      const errorMessage = "Database connection failed";
      mockOrganizationDelete.mockRejectedValue(new Error(errorMessage));

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(<DeleteOrgScreen />);

      const input = screen.getByPlaceholderText("TestOrg");
      const deleteButton = screen.getByText("Delete Organization");

      fireEvent.changeText(input, "TestOrg");
      fireEvent.press(deleteButton);

      // Wait for the error message to appear in the modal
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeTruthy();
      });

      // Verify expected behaviors
      expect(mockShowSpinner).toHaveBeenCalled();
      expect(mockOrganizationDelete).toHaveBeenCalled();
      expect(mockGoBack).not.toHaveBeenCalled();
      expect(mockHideSpinner).toHaveBeenCalled();
    });

    it("should show generic error message when error has no message", async () => {
      const mockOrg = createMockOrganization("TestOrg");
      mockOrganizationDelete.mockRejectedValue(new Error());

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(<DeleteOrgScreen />);

      const input = screen.getByPlaceholderText("TestOrg");
      const deleteButton = screen.getByText("Delete Organization");

      fireEvent.changeText(input, "TestOrg");
      fireEvent.press(deleteButton);

      // Wait for the generic error message to appear in the modal
      await waitFor(() => {
        expect(
          screen.getByText(
            "An error occurred while deleting the organization.",
          ),
        ).toBeTruthy();
      });
    });
  });

  describe("UI rendering", () => {
    it("should render all UI elements correctly", () => {
      const mockOrg = createMockOrganization("MyTestOrganization");

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(<DeleteOrgScreen />);

      // Check header
      expect(screen.getByText("Confirm Deletion")).toBeTruthy();

      // Check warning box
      expect(
        screen.getByText(/WARNING: This action is IRREVERSIBLE/i),
      ).toBeTruthy();
      expect(
        screen.getByText(
          /All equipment, containers, and membership data for "MyTestOrganization"/i,
        ),
      ).toBeTruthy();

      // Check instruction text
      expect(
        screen.getByText("Please type the organization name to confirm:"),
      ).toBeTruthy();

      // Check input placeholder
      expect(screen.getByPlaceholderText("MyTestOrganization")).toBeTruthy();

      // Check delete button
      expect(screen.getByText("Delete Organization")).toBeTruthy();
    });

    it("should return null when organization is not available", () => {
      (useMembership as jest.Mock).mockReturnValue({
        organization: null,
        isManager: false,
      });

      renderWithModal(<DeleteOrgScreen />);

      // When organization is null, component returns null and nothing renders
      // We can check that none of the expected elements are present
      expect(screen.queryByText("Confirm Deletion")).toBeNull();
      expect(screen.queryByText("Delete Organization")).toBeNull();
    });
  });
});
