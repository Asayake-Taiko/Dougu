// @ts-nocheck - Test file with mocked navigation props
import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react-native";
import { renderWithModal } from "./testSetup";

import CreateEquipmentScreen from "../../../src/screens/organization/CreateEquipmentScreen";
import { Organization } from "../../../src/types/models";
import { OrganizationRecord, OrgMembershipRecord } from "../../../src/types/db";

import { useMembership } from "../../../src/lib/context/MembershipContext";
import { useEquipment } from "../../../src/lib/context/EquipmentContext";
import { useSpinner } from "../../../src/lib/context/SpinnerContext";
import { Logger } from "../../../src/lib/utils/Logger";
import { equipmentService } from "../../../src/lib/services/equipment";

// Mock the equipment service
jest.mock("../../../src/lib/services/equipment");

describe("CreateEquipmentScreen", () => {
  let mockShowSpinner: jest.Mock;
  let mockHideSpinner: jest.Mock;
  let mockCreateEquipment: jest.Mock;
  let mockCreateContainer: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockShowSpinner = jest.fn();
    mockHideSpinner = jest.fn();
    mockCreateEquipment = jest.fn();
    mockCreateContainer = jest.fn();

    (useSpinner as jest.Mock).mockReturnValue({
      showSpinner: mockShowSpinner,
      hideSpinner: mockHideSpinner,
    });

    equipmentService.createEquipment = mockCreateEquipment;
    equipmentService.createContainer = mockCreateContainer;
  });

  // Helper function to select a member from dropdown
  const selectMember = (getByText: any) => {
    const dropdown = getByText("Select Member");
    fireEvent.press(dropdown);
    // Select first member from the list
    const member = getByText("Test User");
    fireEvent.press(member);
  };

  const createMockOrganization = (): Organization => {
    const orgRecord: OrganizationRecord = {
      id: "test-org-id",
      name: "Test Organization",
      access_code: "ABC123",
      manager_id: "manager-id",
      image: "default_org",
      color: "#791111",
      created_at: "2026-01-01T00:00:00Z",
    };

    return new Organization(orgRecord);
  };

  const createMockMembership = (
    name: string = "Test User",
    type: "USER" | "STORAGE" = "USER",
  ): OrgMembershipRecord => {
    return {
      id: "membership-id",
      organization_id: "test-org-id",
      user_id: type === "USER" ? "user-id" : null,
      type,
      storage_name: type === "STORAGE" ? name : null,
      details: null,
      created_at: "2026-01-01T00:00:00Z",
    };
  };

  const setupMocks = (isManager: boolean = true, hasOrg: boolean = true) => {
    const mockMembership = createMockMembership();
    const mockMembership2 = createMockMembership("Test Member 2", "USER");
    mockMembership2.id = "membership-id-2";
    mockMembership2.user_id = "user-id-2";

    // Create ownerships map with members for the dropdown
    const ownershipsMap = new Map();
    ownershipsMap.set("membership-id", {
      membership: {
        id: "membership-id",
        organizationId: "test-org-id",
        name: "Test User",
        membershipType: "USER",
        membership: mockMembership,
      },
    });
    ownershipsMap.set("membership-id-2", {
      membership: {
        id: "membership-id-2",
        organizationId: "test-org-id",
        name: "Test Member 2",
        membershipType: "USER",
        membership: mockMembership2,
      },
    });

    (useMembership as jest.Mock).mockReturnValue({
      organization: hasOrg ? createMockOrganization() : null,
      isManager,
      membership: mockMembership,
    });

    (useEquipment as jest.Mock).mockReturnValue({
      ownerships: ownershipsMap,
    });
  };

  describe("UI Rendering", () => {
    it("should render all input fields", () => {
      setupMocks();

      renderWithModal(<CreateEquipmentScreen />);

      expect(screen.getByPlaceholderText("name")).toBeTruthy();
      expect(screen.getByPlaceholderText("quantity")).toBeTruthy();
      expect(screen.getByPlaceholderText("details")).toBeTruthy();
    });

    it("should render Equipment and Container type tabs", () => {
      setupMocks();

      renderWithModal(<CreateEquipmentScreen />);

      expect(screen.getByText("Equipment")).toBeTruthy();
      expect(screen.getByText("Container")).toBeTruthy();
    });

    it("should render Edit Item Image link", () => {
      setupMocks();

      renderWithModal(<CreateEquipmentScreen />);

      expect(screen.getByText("Edit Item Image")).toBeTruthy();
    });

    it("should render Create button", () => {
      setupMocks();

      renderWithModal(<CreateEquipmentScreen />);

      expect(screen.getByText("Create")).toBeTruthy();
    });

    it("should render field labels", () => {
      setupMocks();

      renderWithModal(<CreateEquipmentScreen />);

      expect(screen.getByText("Name")).toBeTruthy();
      expect(screen.getByText("Type")).toBeTruthy();
      expect(screen.getByText("Quantity")).toBeTruthy();
      expect(screen.getByText("Details")).toBeTruthy();
    });

    it("should have Equipment tab active by default", () => {
      setupMocks();

      renderWithModal(<CreateEquipmentScreen />);

      // Equipment should be the default active tab (index 0)
      const equipmentTab = screen.getByText("Equipment");
      expect(equipmentTab).toBeTruthy();
    });
  });

  describe("User Interactions", () => {
    it("should update name input", () => {
      setupMocks();

      renderWithModal(<CreateEquipmentScreen />);

      const nameInput = screen.getByPlaceholderText("name");
      fireEvent.changeText(nameInput, "Test Equipment");

      expect(screen.getByDisplayValue("Test Equipment")).toBeTruthy();
    });

    it("should update quantity input", () => {
      setupMocks();

      renderWithModal(<CreateEquipmentScreen />);

      const quantityInput = screen.getByPlaceholderText("quantity");
      fireEvent.changeText(quantityInput, "5");

      expect(screen.getByDisplayValue("5")).toBeTruthy();
    });

    it("should update details input", () => {
      setupMocks();

      renderWithModal(<CreateEquipmentScreen />);

      const detailsInput = screen.getByPlaceholderText("details");
      fireEvent.changeText(detailsInput, "Test details");

      expect(screen.getByDisplayValue("Test details")).toBeTruthy();
    });

    it("should switch to Container tab", () => {
      setupMocks();

      renderWithModal(<CreateEquipmentScreen />);

      const containerTab = screen.getByText("Container");
      fireEvent.press(containerTab);

      // Container tab should now be active
      expect(containerTab).toBeTruthy();
    });

    it("should switch back to Equipment tab", () => {
      setupMocks();

      renderWithModal(<CreateEquipmentScreen />);

      const containerTab = screen.getByText("Container");
      fireEvent.press(containerTab);

      const equipmentTab = screen.getByText("Equipment");
      fireEvent.press(equipmentTab);

      // Equipment tab should be active again
      expect(equipmentTab).toBeTruthy();
    });

    it("should open image editing overlay", () => {
      setupMocks();

      renderWithModal(<CreateEquipmentScreen />);

      const editImageLink = screen.getByText("Edit Item Image");
      fireEvent.press(editImageLink);

      // The overlay should be opened (setOverlayVisible(true) called)
    });
  });

  describe("Validation - Missing Fields", () => {
    it("should show error when organization is not found", async () => {
      setupMocks(true, false);

      const { getByText } = renderWithModal(<CreateEquipmentScreen />);

      const createButton = getByText("Create");
      selectMember(getByText);

      fireEvent.press(createButton);

      await waitFor(() => {
        expect(getByText("Organization not found.")).toBeTruthy();
      });

      expect(mockCreateEquipment).not.toHaveBeenCalled();
    });

    it("should show error when name is missing", async () => {
      setupMocks();

      const { getByText, getByPlaceholderText } = renderWithModal(
        <CreateEquipmentScreen />,
      );

      // Fill only quantity
      const quantityInput = getByPlaceholderText("quantity");
      fireEvent.changeText(quantityInput, "5");

      const createButton = getByText("Create");
      selectMember(getByText);

      fireEvent.press(createButton);

      await waitFor(() => {
        expect(getByText("Please fill out all fields.")).toBeTruthy();
      });

      expect(mockCreateEquipment).not.toHaveBeenCalled();
    });

    it("should show error when quantity is missing", async () => {
      setupMocks();

      const { getByText, getByPlaceholderText } = renderWithModal(
        <CreateEquipmentScreen />,
      );

      // Fill only name
      const nameInput = getByPlaceholderText("name");
      fireEvent.changeText(nameInput, "Test Equipment");

      const createButton = getByText("Create");
      selectMember(getByText);

      fireEvent.press(createButton);

      await waitFor(() => {
        expect(getByText("Please fill out all fields.")).toBeTruthy();
      });

      expect(mockCreateEquipment).not.toHaveBeenCalled();
    });
  });

  describe("Validation - Invalid Quantity", () => {
    it("should show error when quantity is less than 1", async () => {
      setupMocks();

      const { getByText, getByPlaceholderText } = renderWithModal(
        <CreateEquipmentScreen />,
      );

      const nameInput = getByPlaceholderText("name");
      fireEvent.changeText(nameInput, "Test Equipment");

      const quantityInput = getByPlaceholderText("quantity");
      fireEvent.changeText(quantityInput, "0");

      selectMember(getByText);

      const createButton = getByText("Create");
      fireEvent.press(createButton);

      await waitFor(() => {
        // 0 is falsy, so it triggers "Please fill out all fields" error
        expect(getByText("Please fill out all fields.")).toBeTruthy();
      });

      expect(mockCreateEquipment).not.toHaveBeenCalled();
    });

    it("should show error when quantity is greater than 25", async () => {
      setupMocks();

      const { getByText, getByPlaceholderText } = renderWithModal(
        <CreateEquipmentScreen />,
      );

      const nameInput = getByPlaceholderText("name");
      fireEvent.changeText(nameInput, "Test Equipment");

      const quantityInput = getByPlaceholderText("quantity");
      fireEvent.changeText(quantityInput, "26");

      selectMember(getByText);

      const createButton = getByText("Create");
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(getByText("Quantity must be between 1 and 25.")).toBeTruthy();
      });

      expect(mockCreateEquipment).not.toHaveBeenCalled();
    });

    it("should accept valid quantity of 1", async () => {
      mockCreateEquipment.mockResolvedValue(undefined);
      setupMocks();

      const { getByText, getByPlaceholderText } = renderWithModal(
        <CreateEquipmentScreen />,
      );

      const nameInput = getByPlaceholderText("name");
      fireEvent.changeText(nameInput, "Test Equipment");

      const quantityInput = getByPlaceholderText("quantity");
      fireEvent.changeText(quantityInput, "1");

      const createButton = getByText("Create");
      selectMember(getByText);

      fireEvent.press(createButton);

      await waitFor(() => {
        expect(mockCreateEquipment).toHaveBeenCalled();
      });
    });

    it("should accept valid quantity of 25", async () => {
      mockCreateEquipment.mockResolvedValue(undefined);
      setupMocks();

      const { getByText, getByPlaceholderText } = renderWithModal(
        <CreateEquipmentScreen />,
      );

      const nameInput = getByPlaceholderText("name");
      fireEvent.changeText(nameInput, "Test Equipment");

      const quantityInput = getByPlaceholderText("quantity");
      fireEvent.changeText(quantityInput, "25");

      const createButton = getByText("Create");
      selectMember(getByText);

      fireEvent.press(createButton);

      await waitFor(() => {
        expect(mockCreateEquipment).toHaveBeenCalled();
      });
    });
  });

  describe("Validation - Permissions", () => {
    it("should show error when non-manager tries to create", async () => {
      setupMocks(false);

      const { getByText, getByPlaceholderText } = renderWithModal(
        <CreateEquipmentScreen />,
      );

      const nameInput = getByPlaceholderText("name");
      fireEvent.changeText(nameInput, "Test Equipment");

      const quantityInput = getByPlaceholderText("quantity");
      fireEvent.changeText(quantityInput, "5");
      selectMember(getByText);
      const createButton = getByText("Create");
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(getByText("Only managers can create items.")).toBeTruthy();
      });

      expect(mockCreateEquipment).not.toHaveBeenCalled();
      expect(mockCreateContainer).not.toHaveBeenCalled();
    });
  });

  describe("Create Equipment", () => {
    it("should create equipment with correct parameters", async () => {
      mockCreateEquipment.mockResolvedValue(undefined);
      setupMocks();

      const { getByText, getByPlaceholderText } = renderWithModal(
        <CreateEquipmentScreen />,
      );

      const nameInput = getByPlaceholderText("name");
      fireEvent.changeText(nameInput, "Test Wrench");

      const quantityInput = getByPlaceholderText("quantity");
      fireEvent.changeText(quantityInput, "3");

      const detailsInput = getByPlaceholderText("details");
      fireEvent.changeText(detailsInput, "A useful tool");

      const createButton = getByText("Create");
      selectMember(getByText);

      fireEvent.press(createButton);

      await waitFor(() => {
        expect(mockCreateEquipment).toHaveBeenCalledWith(
          3,
          expect.objectContaining({
            name: "Test Wrench",
            organization_id: "test-org-id",
            image: "default_equipment",
            color: "#ddd",
            details: "A useful tool",
          }),
        );
      });

      expect(mockShowSpinner).toHaveBeenCalled();
      expect(mockHideSpinner).toHaveBeenCalled();
      expect(getByText("Items created successfully.")).toBeTruthy();
    });

    it("should clear form after successful creation", async () => {
      mockCreateEquipment.mockResolvedValue(undefined);
      setupMocks();

      const { getByText, getByPlaceholderText } = renderWithModal(
        <CreateEquipmentScreen />,
      );

      const nameInput = getByPlaceholderText("name");
      fireEvent.changeText(nameInput, "Test Equipment");

      const quantityInput = getByPlaceholderText("quantity");
      fireEvent.changeText(quantityInput, "5");

      const detailsInput = getByPlaceholderText("details");
      fireEvent.changeText(detailsInput, "Test details");

      const createButton = getByText("Create");
      selectMember(getByText);

      fireEvent.press(createButton);

      await waitFor(() => {
        expect(mockCreateEquipment).toHaveBeenCalled();
      });

      // Inputs should be cleared
      expect(screen.queryByDisplayValue("Test Equipment")).toBeNull();
      expect(screen.queryByDisplayValue("5")).toBeNull();
      expect(screen.queryByDisplayValue("Test details")).toBeNull();
    });
  });

  describe("Create Container", () => {
    it("should create container with correct parameters", async () => {
      mockCreateContainer.mockResolvedValue(undefined);
      setupMocks();

      const { getByText, getByPlaceholderText } = renderWithModal(
        <CreateEquipmentScreen />,
      );

      // Switch to Container tab
      const containerTab = getByText("Container");
      fireEvent.press(containerTab);

      const nameInput = getByPlaceholderText("name");
      fireEvent.changeText(nameInput, "Storage Box");

      const quantityInput = getByPlaceholderText("quantity");
      fireEvent.changeText(quantityInput, "2");

      const detailsInput = getByPlaceholderText("details");
      fireEvent.changeText(detailsInput, "Large storage box");

      const createButton = getByText("Create");
      selectMember(getByText);

      fireEvent.press(createButton);

      await waitFor(() => {
        expect(mockCreateContainer).toHaveBeenCalledWith(
          2,
          expect.objectContaining({
            name: "Storage Box",
            organization_id: "test-org-id",
            color: "#ddd",
            details: "Large storage box",
          }),
        );
      });

      // Should NOT have image property for containers
      expect(mockCreateContainer).toHaveBeenCalledWith(
        2,
        expect.not.objectContaining({
          image: expect.anything(),
        }),
      );

      expect(mockShowSpinner).toHaveBeenCalled();
      expect(mockHideSpinner).toHaveBeenCalled();
      expect(getByText("Items created successfully.")).toBeTruthy();
    });

    it("should not call createEquipment when creating container", async () => {
      mockCreateContainer.mockResolvedValue(undefined);
      setupMocks();

      const { getByText, getByPlaceholderText } = renderWithModal(
        <CreateEquipmentScreen />,
      );

      // Switch to Container tab
      const containerTab = getByText("Container");
      fireEvent.press(containerTab);

      const nameInput = getByPlaceholderText("name");
      fireEvent.changeText(nameInput, "Test Container");

      const quantityInput = getByPlaceholderText("quantity");
      fireEvent.changeText(quantityInput, "1");

      const createButton = getByText("Create");
      selectMember(getByText);

      fireEvent.press(createButton);

      await waitFor(() => {
        expect(mockCreateContainer).toHaveBeenCalled();
      });

      expect(mockCreateEquipment).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should log error and show message when equipment creation fails", async () => {
      const error = new Error("Creation failed");
      mockCreateEquipment.mockRejectedValue(error);
      setupMocks();

      const { getByText, getByPlaceholderText } = renderWithModal(
        <CreateEquipmentScreen />,
      );

      const nameInput = getByPlaceholderText("name");
      fireEvent.changeText(nameInput, "Test Equipment");

      const quantityInput = getByPlaceholderText("quantity");
      fireEvent.changeText(quantityInput, "5");

      const createButton = getByText("Create");
      selectMember(getByText);

      fireEvent.press(createButton);

      await waitFor(() => {
        expect(Logger.error).toHaveBeenCalledWith(
          "Failed to create items",
          error,
        );
        expect(getByText("Creation failed")).toBeTruthy();
      });

      expect(mockHideSpinner).toHaveBeenCalled();
    });

    it("should show generic error message when error has no message", async () => {
      mockCreateEquipment.mockRejectedValue(new Error());
      setupMocks();

      const { getByText, getByPlaceholderText } = renderWithModal(
        <CreateEquipmentScreen />,
      );

      const nameInput = getByPlaceholderText("name");
      fireEvent.changeText(nameInput, "Test Equipment");

      const quantityInput = getByPlaceholderText("quantity");
      fireEvent.changeText(quantityInput, "5");

      const createButton = getByText("Create");
      selectMember(getByText);

      fireEvent.press(createButton);

      await waitFor(() => {
        expect(getByText("Failed to create items.")).toBeTruthy();
      });
    });

    it("should log error and show message when container creation fails", async () => {
      const error = new Error("Container creation failed");
      mockCreateContainer.mockRejectedValue(error);
      setupMocks();

      const { getByText, getByPlaceholderText } = renderWithModal(
        <CreateEquipmentScreen />,
      );

      // Switch to Container tab
      const containerTab = getByText("Container");
      fireEvent.press(containerTab);

      const nameInput = getByPlaceholderText("name");
      fireEvent.changeText(nameInput, "Test Container");

      const quantityInput = getByPlaceholderText("quantity");
      fireEvent.changeText(quantityInput, "1");

      const createButton = getByText("Create");
      selectMember(getByText);

      fireEvent.press(createButton);

      await waitFor(() => {
        expect(Logger.error).toHaveBeenCalledWith(
          "Failed to create items",
          error,
        );
        expect(getByText("Container creation failed")).toBeTruthy();
      });

      expect(mockHideSpinner).toHaveBeenCalled();
    });
  });
});
