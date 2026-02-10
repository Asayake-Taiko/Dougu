import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react-native";
import { renderWithModal } from "./testSetup";

import CreateStorageScreen from "../../../src/screens/organization/CreateStorageScreen";
import { Organization } from "../../../src/types/models";
import { OrganizationRecord } from "../../../src/types/db";

import { useMembership } from "../../../src/lib/context/MembershipContext";
import { useSpinner } from "../../../src/lib/context/SpinnerContext";
import { useNavigation } from "@react-navigation/native";
import { organizationService } from "../../../src/lib/services/organization";

// Mock organization service
jest.mock("../../../src/lib/services/organization", () => ({
  organizationService: {
    createStorage: jest.fn(),
  },
}));

describe("CreateStorageScreen", () => {
  let mockShowSpinner: jest.Mock;
  let mockHideSpinner: jest.Mock;
  let mockGoBack: jest.Mock;
  let mockCreateStorage: jest.Mock;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    mockShowSpinner = jest.fn();
    mockHideSpinner = jest.fn();
    mockGoBack = jest.fn();
    mockCreateStorage = jest.fn();

    (useSpinner as jest.Mock).mockReturnValue({
      showSpinner: mockShowSpinner,
      hideSpinner: mockHideSpinner,
    });

    (useNavigation as jest.Mock).mockReturnValue({
      goBack: mockGoBack,
    });

    (organizationService.createStorage as jest.Mock) = mockCreateStorage;
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

    return new Organization(orgRecord);
  };

  describe("Successful storage creation", () => {
    it("should create storage and navigate back when valid name is provided and user is manager", async () => {
      const mockOrg = createMockOrganization("TestOrg");
      mockCreateStorage.mockResolvedValue(undefined);

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(<CreateStorageScreen />);

      // Find form inputs
      const nameInput = screen.getByPlaceholderText("name");
      const detailsInput = screen.getByPlaceholderText("details");
      const createButton = screen.getByText("Create");

      // Fill in the form
      fireEvent.changeText(nameInput, "Main Storage");
      fireEvent.changeText(detailsInput, "Storage for main equipment");

      // Press the create button
      fireEvent.press(createButton);

      // Wait for async operations
      await waitFor(() => {
        expect(mockShowSpinner).toHaveBeenCalled();
        expect(mockCreateStorage).toHaveBeenCalledWith(
          "test-org-id",
          "Main Storage",
          "default_profile",
          "#791111",
          "Storage for main equipment",
        );
        expect(mockGoBack).toHaveBeenCalled();
        expect(mockHideSpinner).toHaveBeenCalled();
      });
    });

    it("should create storage with minimal information (name only)", async () => {
      const mockOrg = createMockOrganization("TestOrg");
      mockCreateStorage.mockResolvedValue(undefined);

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(<CreateStorageScreen />);

      const nameInput = screen.getByPlaceholderText("name");
      const createButton = screen.getByText("Create");

      // Fill in only the name
      fireEvent.changeText(nameInput, "Storage A");

      // Press the create button
      fireEvent.press(createButton);

      // Wait for async operations
      await waitFor(() => {
        expect(mockCreateStorage).toHaveBeenCalledWith(
          "test-org-id",
          "Storage A",
          "default_profile",
          "#791111",
          "",
        );
        expect(mockGoBack).toHaveBeenCalled();
      });
    });
  });

  describe("Validation errors", () => {
    it("should show error when name is empty", async () => {
      const mockOrg = createMockOrganization("TestOrg");

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(<CreateStorageScreen />);

      const createButton = screen.getByText("Create");

      // Try to create without entering a name
      fireEvent.press(createButton);

      // Wait for the error message to appear in the modal
      await waitFor(() => {
        expect(
          screen.getByText("Please enter a name for the storage."),
        ).toBeTruthy();
      });

      // Verify createStorage was not called
      expect(mockCreateStorage).not.toHaveBeenCalled();
      expect(mockGoBack).not.toHaveBeenCalled();
    });

    it("should show error when name is only whitespace", async () => {
      const mockOrg = createMockOrganization("TestOrg");

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(<CreateStorageScreen />);

      const nameInput = screen.getByPlaceholderText("name");
      const createButton = screen.getByText("Create");

      // Enter only whitespace
      fireEvent.changeText(nameInput, "   ");
      fireEvent.press(createButton);

      // Wait for the error message to appear in the modal
      await waitFor(() => {
        expect(
          screen.getByText("Please enter a name for the storage."),
        ).toBeTruthy();
      });

      expect(mockCreateStorage).not.toHaveBeenCalled();
    });

    it("should show error when no organization is available", async () => {
      (useMembership as jest.Mock).mockReturnValue({
        organization: null,
        isManager: true,
      });

      renderWithModal(<CreateStorageScreen />);

      const nameInput = screen.getByPlaceholderText("name");
      const createButton = screen.getByText("Create");

      // Fill in name and try to create
      fireEvent.changeText(nameInput, "Storage");
      fireEvent.press(createButton);

      // Wait for the error message to appear in the modal
      await waitFor(() => {
        expect(screen.getByText("No active organization found.")).toBeTruthy();
      });

      expect(mockCreateStorage).not.toHaveBeenCalled();
      expect(mockGoBack).not.toHaveBeenCalled();
    });
  });

  describe("Not Manager", () => {
    it("should show error when user is not a manager", async () => {
      const mockOrg = createMockOrganization("TestOrg");

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: false, // User is not a manager
      });

      renderWithModal(<CreateStorageScreen />);

      const nameInput = screen.getByPlaceholderText("name");
      const createButton = screen.getByText("Create");

      // Fill in name and try to create
      fireEvent.changeText(nameInput, "Storage");
      fireEvent.press(createButton);

      // Wait for the error message to appear in the modal
      await waitFor(() => {
        expect(
          screen.getByText("Only managers can create storage."),
        ).toBeTruthy();
      });

      expect(mockCreateStorage).not.toHaveBeenCalled();
      expect(mockGoBack).not.toHaveBeenCalled();
    });
  });

  describe("Error handling", () => {
    it("should show error message when createStorage fails", async () => {
      const mockOrg = createMockOrganization("TestOrg");
      const errorMessage = "Database connection failed";
      mockCreateStorage.mockRejectedValue(new Error(errorMessage));

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(<CreateStorageScreen />);

      const nameInput = screen.getByPlaceholderText("name");
      const createButton = screen.getByText("Create");

      fireEvent.changeText(nameInput, "Storage");
      fireEvent.press(createButton);

      // Wait for the error message to appear in the modal
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeTruthy();
      });

      // Verify expected behaviors
      expect(mockShowSpinner).toHaveBeenCalled();
      expect(mockCreateStorage).toHaveBeenCalled();
      expect(mockGoBack).not.toHaveBeenCalled();
      expect(mockHideSpinner).toHaveBeenCalled();
    });

    it("should show generic error message when error has no message", async () => {
      const mockOrg = createMockOrganization("TestOrg");
      mockCreateStorage.mockRejectedValue(new Error());

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(<CreateStorageScreen />);

      const nameInput = screen.getByPlaceholderText("name");
      const createButton = screen.getByText("Create");

      fireEvent.changeText(nameInput, "Storage");
      fireEvent.press(createButton);

      // Wait for the generic error message to appear in the modal
      await waitFor(() => {
        expect(
          screen.getByText("Failed to create storage. Please try again."),
        ).toBeTruthy();
      });
    });
  });

  describe("UI rendering", () => {
    it("should render all form elements correctly", () => {
      const mockOrg = createMockOrganization("TestOrg");

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(<CreateStorageScreen />);

      // Check form labels
      expect(screen.getByText("Name")).toBeTruthy();
      expect(screen.getByText("Details")).toBeTruthy();

      // Check inputs
      expect(screen.getByPlaceholderText("name")).toBeTruthy();
      expect(screen.getByPlaceholderText("details")).toBeTruthy();

      // Check create button
      expect(screen.getByText("Create")).toBeTruthy();
    });
  });

  describe("Form state management", () => {
    it("should reset form after successful creation", async () => {
      const mockOrg = createMockOrganization("TestOrg");
      mockCreateStorage.mockResolvedValue(undefined);

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(<CreateStorageScreen />);

      const nameInput = screen.getByPlaceholderText("name");
      const detailsInput = screen.getByPlaceholderText("details");
      const createButton = screen.getByText("Create");

      // Fill in the form
      fireEvent.changeText(nameInput, "Storage 1");
      fireEvent.changeText(detailsInput, "Test details");

      // Verify values are set
      expect(nameInput.props.value).toBe("Storage 1");
      expect(detailsInput.props.value).toBe("Test details");

      // Submit the form
      fireEvent.press(createButton);

      // Wait for form to reset
      await waitFor(() => {
        expect(mockGoBack).toHaveBeenCalled();
      });

      // Form should be reset (values cleared)
      expect(nameInput.props.value).toBe("");
      expect(detailsInput.props.value).toBe("");
    });
  });
});
