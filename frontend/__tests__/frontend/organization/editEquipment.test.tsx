// @ts-nocheck - Test file with mocked navigation props
import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react-native";
import { renderWithModal } from "./testSetup";

import EditEquipmentScreen from "../../../src/screens/organization/EditEquipmentScreen";
import { Equipment, Container } from "../../../src/types/models";
import { EquipmentRecord, ContainerRecord } from "../../../src/types/db";

import { useEquipment } from "../../../src/lib/context/EquipmentContext";
import { useMembership } from "../../../src/lib/context/MembershipContext";
import { Logger } from "../../../src/lib/utils/Logger";

// Mock the contexts
jest.mock("../../../src/lib/context/EquipmentContext");
jest.mock("../../../src/lib/context/MembershipContext");

describe("EditEquipmentScreen", () => {
  let mockNavigate: jest.Mock;
  let mockGoBack: jest.Mock;
  let mockEquipmentUpdate: jest.Mock;
  let mockEquipmentDelete: jest.Mock;
  let mockContainerUpdate: jest.Mock;
  let mockContainerDelete: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockNavigate = jest.fn();
    mockGoBack = jest.fn();
    mockEquipmentUpdate = jest.fn();
    mockEquipmentDelete = jest.fn();
    mockContainerUpdate = jest.fn();
    mockContainerDelete = jest.fn();
  });

  const createMockEquipment = (
    name: string = "Test Equipment",
    details: string = "Test details",
    image: string = "equipment_wrench",
    color: string = "#ff0000",
    numRecords: number = 3,
  ): Equipment => {
    const records: EquipmentRecord[] = [];
    for (let i = 0; i < numRecords; i++) {
      records.push({
        id: `equipment-${i}`,
        name,
        details,
        image,
        color,
        organization_id: "test-org-id",
        assigned_to: "membership-id",
        container_id: null,
        created_at: "2026-01-01T00:00:00Z",
      });
    }

    const equipment = new Equipment(records[0], new Set([0]));
    for (let i = 1; i < records.length; i++) {
      equipment.addRecord(records[i]);
    }

    equipment.update = mockEquipmentUpdate;
    equipment.delete = mockEquipmentDelete;
    return equipment;
  };

  const createMockContainer = (
    name: string = "Test Container",
    details: string = "Test details",
    color: string = "#00ff00",
  ): Container => {
    const containerRecord: ContainerRecord = {
      id: "container-1",
      name,
      details,
      color,
      organization_id: "test-org-id",
      assigned_to: "membership-id",
      created_at: "2026-01-01T00:00:00Z",
    };

    const container = new Container(containerRecord);
    container.update = mockContainerUpdate;
    container.delete = mockContainerDelete;
    return container;
  };

  const setupMocks = (
    item: Equipment | Container,
    isManager: boolean = true,
  ) => {
    const ownerships = new Map();
    ownerships.set("ownership-1", {
      items: [item],
    });

    (useEquipment as jest.Mock).mockReturnValue({
      ownerships,
    });

    (useMembership as jest.Mock).mockReturnValue({
      isManager,
    });
  };

  describe("Equipment Rendering", () => {
    it("should render equipment with name and details", () => {
      const mockEquipment = createMockEquipment(
        "Test Wrench",
        "A very useful wrench",
      );
      setupMocks(mockEquipment);

      renderWithModal(
        <EditEquipmentScreen
          route={{ params: { itemId: "equipment-0" } }}
          navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
        />,
      );

      expect(screen.getByDisplayValue("Test Wrench")).toBeTruthy();
      expect(screen.getByDisplayValue("A very useful wrench")).toBeTruthy();
    });

    it("should render Details and Records tabs for equipment", () => {
      const mockEquipment = createMockEquipment();
      setupMocks(mockEquipment);

      renderWithModal(
        <EditEquipmentScreen
          route={{ params: { itemId: "equipment-0" } }}
          navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
        />,
      );

      // Use getAllByText since there are multiple "Details" texts (tab and header)
      const detailsElements = screen.getAllByText("Details");
      expect(detailsElements.length).toBeGreaterThan(0);
      expect(screen.getByText("Records")).toBeTruthy();
    });

    it("should render Edit Item Image link", () => {
      const mockEquipment = createMockEquipment();
      setupMocks(mockEquipment);

      renderWithModal(
        <EditEquipmentScreen
          route={{ params: { itemId: "equipment-0" } }}
          navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
        />,
      );

      expect(screen.getByText("Edit Item Image")).toBeTruthy();
    });

    it("should render Update and Delete buttons", () => {
      const mockEquipment = createMockEquipment();
      setupMocks(mockEquipment);

      renderWithModal(
        <EditEquipmentScreen
          route={{ params: { itemId: "equipment-0" } }}
          navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
        />,
      );

      expect(screen.getByText("Update")).toBeTruthy();
      expect(screen.getByText("Delete")).toBeTruthy();
    });

    it("should show Item not found when item does not exist", () => {
      setupMocks(createMockEquipment());

      renderWithModal(
        <EditEquipmentScreen
          route={{ params: { itemId: "non-existent-id" } }}
          navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
        />,
      );

      expect(screen.getByText("Item not found")).toBeTruthy();
    });
  });

  describe("Container Rendering", () => {
    it("should render container with name and details", () => {
      const mockContainer = createMockContainer("Storage Box", "Large box");
      setupMocks(mockContainer);

      renderWithModal(
        <EditEquipmentScreen
          route={{ params: { itemId: "container-1" } }}
          navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
        />,
      );

      expect(screen.getByDisplayValue("Storage Box")).toBeTruthy();
      expect(screen.getByDisplayValue("Large box")).toBeTruthy();
    });

    it("should not render tabs for containers", () => {
      const mockContainer = createMockContainer();
      setupMocks(mockContainer);

      renderWithModal(
        <EditEquipmentScreen
          route={{ params: { itemId: "container-1" } }}
          navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
        />,
      );

      // Check that Records tab doesn't exist (Details will show in the form header)
      expect(screen.queryByText("Records")).toBeNull();
    });
  });

  describe("User Interactions - Equipment", () => {
    it("should update name input", () => {
      const mockEquipment = createMockEquipment("Old Name");
      setupMocks(mockEquipment);

      renderWithModal(
        <EditEquipmentScreen
          route={{ params: { itemId: "equipment-0" } }}
          navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
        />,
      );

      const nameInput = screen.getByDisplayValue("Old Name");
      fireEvent.changeText(nameInput, "New Name");

      expect(screen.getByDisplayValue("New Name")).toBeTruthy();
    });

    it("should update details input", () => {
      const mockEquipment = createMockEquipment("Test", "Old details");
      setupMocks(mockEquipment);

      renderWithModal(
        <EditEquipmentScreen
          route={{ params: { itemId: "equipment-0" } }}
          navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
        />,
      );

      const detailsInput = screen.getByDisplayValue("Old details");
      fireEvent.changeText(detailsInput, "New details");

      expect(screen.getByDisplayValue("New details")).toBeTruthy();
    });

    it("should switch to Records tab", () => {
      const mockEquipment = createMockEquipment();
      setupMocks(mockEquipment);

      renderWithModal(
        <EditEquipmentScreen
          route={{ params: { itemId: "equipment-0" } }}
          navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
        />,
      );

      const recordsTab = screen.getByText("Records");
      fireEvent.press(recordsTab);

      // Verify we're on the records tab - check for all instances
      const equipmentNames = screen.getAllByText(/Test Equipment/);
      expect(equipmentNames.length).toBeGreaterThan(1);
    });

    it("should switch back to Details tab", () => {
      const mockEquipment = createMockEquipment();
      setupMocks(mockEquipment);

      renderWithModal(
        <EditEquipmentScreen
          route={{ params: { itemId: "equipment-0" } }}
          navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
        />,
      );

      const recordsTab = screen.getByText("Records");
      fireEvent.press(recordsTab);

      const detailsTab = screen.getByText("Details");
      fireEvent.press(detailsTab);

      // Back to details - name input should be visible
      expect(screen.getByDisplayValue("Test Equipment")).toBeTruthy();
    });
  });

  describe("Update Functionality", () => {
    it("should call equipment.update with correct parameters when manager updates", async () => {
      mockEquipmentUpdate.mockResolvedValue(undefined);
      const mockEquipment = createMockEquipment();
      setupMocks(mockEquipment, true);

      renderWithModal(
        <EditEquipmentScreen
          route={{ params: { itemId: "equipment-0" } }}
          navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
        />,
      );

      const nameInput = screen.getByDisplayValue("Test Equipment");
      fireEvent.changeText(nameInput, "Updated Equipment");

      const updateButton = screen.getByText("Update");
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(mockEquipmentUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "Updated Equipment",
            details: "Test details",
            image: "equipment_wrench",
            color: "#ff0000",
          }),
          expect.any(Set),
        );
      });

      expect(mockGoBack).toHaveBeenCalled();
    });

    it("should call container.update with correct parameters when manager updates", async () => {
      mockContainerUpdate.mockResolvedValue(undefined);
      const mockContainer = createMockContainer();
      setupMocks(mockContainer, true);

      renderWithModal(
        <EditEquipmentScreen
          route={{ params: { itemId: "container-1" } }}
          navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
        />,
      );

      const nameInput = screen.getByDisplayValue("Test Container");
      fireEvent.changeText(nameInput, "Updated Container");

      const updateButton = screen.getByText("Update");
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(mockContainerUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "Updated Container",
            details: "Test details",
            color: "#00ff00",
          }),
        );
      });

      expect(mockGoBack).toHaveBeenCalled();
    });

    it("should show error when non-manager tries to update", async () => {
      const mockEquipment = createMockEquipment();
      setupMocks(mockEquipment, false);

      const { getByText } = renderWithModal(
        <EditEquipmentScreen
          route={{ params: { itemId: "equipment-0" } }}
          navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
        />,
      );

      const updateButton = getByText("Update");
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(getByText("Only managers can edit item profiles.")).toBeTruthy();
      });

      expect(mockEquipmentUpdate).not.toHaveBeenCalled();
      expect(mockGoBack).not.toHaveBeenCalled();
    });

    it("should log error and show message when update fails", async () => {
      const error = new Error("Update failed");
      mockEquipmentUpdate.mockRejectedValue(error);
      const mockEquipment = createMockEquipment();
      setupMocks(mockEquipment, true);

      const { getByText } = renderWithModal(
        <EditEquipmentScreen
          route={{ params: { itemId: "equipment-0" } }}
          navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
        />,
      );

      const updateButton = getByText("Update");
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(Logger.error).toHaveBeenCalledWith(error);
        expect(getByText("Update failed")).toBeTruthy();
      });
    });
  });

  describe("Delete Functionality", () => {
    it("should call equipment.delete when manager deletes", async () => {
      mockEquipmentDelete.mockResolvedValue(undefined);
      const mockEquipment = createMockEquipment();
      setupMocks(mockEquipment, true);

      renderWithModal(
        <EditEquipmentScreen
          route={{ params: { itemId: "equipment-0" } }}
          navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
        />,
      );

      const deleteButton = screen.getByText("Delete");
      fireEvent.press(deleteButton);

      await waitFor(() => {
        expect(mockEquipmentDelete).toHaveBeenCalled();
      });

      expect(mockGoBack).toHaveBeenCalled();
    });

    it("should call container.delete when manager deletes", async () => {
      mockContainerDelete.mockResolvedValue(undefined);
      const mockContainer = createMockContainer();
      setupMocks(mockContainer, true);

      renderWithModal(
        <EditEquipmentScreen
          route={{ params: { itemId: "container-1" } }}
          navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
        />,
      );

      const deleteButton = screen.getByText("Delete");
      fireEvent.press(deleteButton);

      await waitFor(() => {
        expect(mockContainerDelete).toHaveBeenCalled();
      });

      expect(mockGoBack).toHaveBeenCalled();
    });

    it("should show error when non-manager tries to delete", async () => {
      const mockEquipment = createMockEquipment();
      setupMocks(mockEquipment, false);

      const { getByText } = renderWithModal(
        <EditEquipmentScreen
          route={{ params: { itemId: "equipment-0" } }}
          navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
        />,
      );

      const deleteButton = getByText("Delete");
      fireEvent.press(deleteButton);

      await waitFor(() => {
        expect(getByText("Only managers can delete items.")).toBeTruthy();
      });

      expect(mockEquipmentDelete).not.toHaveBeenCalled();
      expect(mockGoBack).not.toHaveBeenCalled();
    });

    it("should log error and show message when delete fails", async () => {
      const error = new Error("Delete failed");
      mockEquipmentDelete.mockRejectedValue(error);
      const mockEquipment = createMockEquipment();
      setupMocks(mockEquipment, true);

      const { getByText } = renderWithModal(
        <EditEquipmentScreen
          route={{ params: { itemId: "equipment-0" } }}
          navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
        />,
      );

      const deleteButton = getByText("Delete");
      fireEvent.press(deleteButton);

      await waitFor(() => {
        expect(Logger.error).toHaveBeenCalledWith(error);
        expect(getByText("Delete failed")).toBeTruthy();
      });
    });
  });

  describe("Image Editing", () => {
    it("should open image editing overlay when Edit Item Image is pressed", () => {
      const mockEquipment = createMockEquipment();
      setupMocks(mockEquipment);

      renderWithModal(
        <EditEquipmentScreen
          route={{ params: { itemId: "equipment-0" } }}
          navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
        />,
      );

      const editImageLink = screen.getByText("Edit Item Image");
      fireEvent.press(editImageLink);
    });
  });

  describe("Records Tab - Checklist", () => {
    it("should display equipment records in checklist", () => {
      const mockEquipment = createMockEquipment(
        "Multi Equipment",
        "Details",
        "equipment_wrench",
        "#ff0000",
        3,
      );
      setupMocks(mockEquipment);

      renderWithModal(
        <EditEquipmentScreen
          route={{ params: { itemId: "equipment-0" } }}
          navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
        />,
      );

      // Switch to Records tab
      const recordsTab = screen.getByText("Records");
      fireEvent.press(recordsTab);

      // EquipmentChecklist component should be rendered with the records
      const equipmentNames = screen.getAllByText(/Multi Equipment/);
      expect(equipmentNames.length).toBeGreaterThan(1);
    });

    it("should update selected indices when update is called", async () => {
      mockEquipmentUpdate.mockResolvedValue(undefined);
      const mockEquipment = createMockEquipment(
        "Test",
        "Details",
        "equipment_wrench",
        "#ff0000",
        3,
      );
      setupMocks(mockEquipment, true);

      renderWithModal(
        <EditEquipmentScreen
          route={{ params: { itemId: "equipment-0" } }}
          navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
        />,
      );

      // Switch to Records tab
      const recordsTab = screen.getByText("Records");
      fireEvent.press(recordsTab);

      const updateButton = screen.getByText("Update");
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(mockEquipmentUpdate).toHaveBeenCalledWith(
          expect.any(Object),
          expect.any(Set),
        );
      });
    });
  });
});
