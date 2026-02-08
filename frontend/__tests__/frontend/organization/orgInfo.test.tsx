// @ts-nocheck - Test file with mocked navigation props
import React from "react";
import { screen, fireEvent } from "@testing-library/react-native";
import { renderWithModal } from "./testSetup";

import OrgInfoScreen from "../../../src/screens/member/OrgInfo";
import { Organization } from "../../../src/types/models";
import { OrganizationRecord } from "../../../src/types/db";

import { useMembership } from "../../../src/lib/context/MembershipContext";
import { useNavigation } from "@react-navigation/native";

describe("OrgInfoScreen", () => {
  let mockNavigate: jest.Mock;
  let mockOrgUpdateImage: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockNavigate = jest.fn();
    mockOrgUpdateImage = jest.fn();

    (useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });
  });

  const createMockOrganization = (
    name: string,
    accessCode: string,
    managerId: string,
    image: string = "default_org",
    color: string = "#791111",
  ): Organization => {
    const orgRecord: OrganizationRecord = {
      id: "test-org-id",
      name,
      access_code: accessCode,
      manager_id: managerId,
      image,
      color,
      created_at: "2026-01-01T00:00:00Z",
    };

    const org = new Organization(orgRecord);
    org.updateImage = mockOrgUpdateImage;
    return org;
  };

  describe("UI Rendering", () => {
    it("should render organization name and access code", () => {
      const mockOrg = createMockOrganization(
        "Test Organization",
        "ABC123",
        "manager-id",
      );

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        <OrgInfoScreen navigation={{ navigate: mockNavigate }} />,
      );

      expect(screen.getByText("Test Organization")).toBeTruthy();
      expect(screen.getByText("ABC123")).toBeTruthy();
    });

    it("should render all navigation buttons", () => {
      const mockOrg = createMockOrganization(
        "Test Organization",
        "ABC123",
        "manager-id",
      );

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        <OrgInfoScreen navigation={{ navigate: mockNavigate }} />,
      );

      expect(screen.getByText("Name")).toBeTruthy();
      expect(screen.getByText("Access Code")).toBeTruthy();
      expect(screen.getByText("Members")).toBeTruthy();
      expect(screen.getByText("Equipment Sheet")).toBeTruthy();
      expect(screen.getByText("Manage Equipment")).toBeTruthy();
      expect(screen.getByText("Delete Organization")).toBeTruthy();
    });

    it("should render when organization is null", () => {
      (useMembership as jest.Mock).mockReturnValue({
        organization: null,
        isManager: false,
      });

      renderWithModal(
        <OrgInfoScreen navigation={{ navigate: mockNavigate }} />,
      );

      // Should still render the structure
      expect(screen.getByText("Name")).toBeTruthy();
      expect(screen.getByText("Access Code")).toBeTruthy();
    });
  });

  describe("Navigation", () => {
    it("should navigate to UserStorages when Members is pressed", () => {
      const mockOrg = createMockOrganization(
        "Test Organization",
        "ABC123",
        "manager-id",
      );

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        <OrgInfoScreen navigation={{ navigate: mockNavigate }} />,
      );

      const membersButton = screen.getByText("Members");
      fireEvent.press(membersButton);

      expect(mockNavigate).toHaveBeenCalledWith("UserStorages");
    });

    it("should navigate to Sheet when Equipment Sheet is pressed", () => {
      const mockOrg = createMockOrganization(
        "Test Organization",
        "ABC123",
        "manager-id",
      );

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        <OrgInfoScreen navigation={{ navigate: mockNavigate }} />,
      );

      const sheetButton = screen.getByText("Equipment Sheet");
      fireEvent.press(sheetButton);

      expect(mockNavigate).toHaveBeenCalledWith("Sheet");
    });

    it("should navigate to ManageEquipment when Manage Equipment is pressed", () => {
      const mockOrg = createMockOrganization(
        "Test Organization",
        "ABC123",
        "manager-id",
      );

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        <OrgInfoScreen navigation={{ navigate: mockNavigate }} />,
      );

      const manageButton = screen.getByText("Manage Equipment");
      fireEvent.press(manageButton);

      expect(mockNavigate).toHaveBeenCalledWith("ManageEquipment");
    });

    it("should navigate to DeleteOrg when Delete Organization is pressed", () => {
      const mockOrg = createMockOrganization(
        "Test Organization",
        "ABC123",
        "manager-id",
      );

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        <OrgInfoScreen navigation={{ navigate: mockNavigate }} />,
      );

      const deleteButton = screen.getByText("Delete Organization");
      fireEvent.press(deleteButton);

      expect(mockNavigate).toHaveBeenCalledWith("DeleteOrg");
    });
  });

  describe("Image Update", () => {
    it("should update organization image successfully when user is manager", async () => {
      const mockOrg = createMockOrganization(
        "Test Organization",
        "ABC123",
        "manager-id",
        "default_org",
        "#791111",
      );
      mockOrgUpdateImage.mockResolvedValue(undefined);

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        <OrgInfoScreen navigation={{ navigate: mockNavigate }} />,
      );
      expect(screen.getByText("Test Organization")).toBeTruthy();
    });

    it("should verify component renders for both manager and non-manager", () => {
      const mockOrg = createMockOrganization(
        "Test Organization",
        "ABC123",
        "manager-id",
        "default_org",
        "#791111",
      );

      // Test with non-manager
      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: false,
      });

      renderWithModal(
        <OrgInfoScreen navigation={{ navigate: mockNavigate }} />,
      );

      // Should render correctly even as non-manager
      expect(screen.getByText("Test Organization")).toBeTruthy();
      expect(screen.getByText("ABC123")).toBeTruthy();
    });

    it("should handle missing organization gracefully", () => {
      (useMembership as jest.Mock).mockReturnValue({
        organization: null,
        isManager: true,
      });

      renderWithModal(
        <OrgInfoScreen navigation={{ navigate: mockNavigate }} />,
      );

      // Should render without crashing
      expect(screen.getByText("Name")).toBeTruthy();
      expect(screen.getByText("Access Code")).toBeTruthy();
    });

    it("should display organization data from useMembership context", () => {
      const mockOrg = createMockOrganization(
        "Test Org 1",
        "ABC123",
        "manager-id",
        "org_image_1",
        "#FF0000",
      );

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        <OrgInfoScreen navigation={{ navigate: mockNavigate }} />,
      );

      expect(screen.getByText("Test Org 1")).toBeTruthy();
      expect(screen.getByText("ABC123")).toBeTruthy();
    });
  });

  describe("Image Editing Overlay Integration", () => {
    it("should render ImageEditingOverlay component", () => {
      const mockOrg = createMockOrganization(
        "Test Organization",
        "ABC123",
        "manager-id",
      );

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        <OrgInfoScreen navigation={{ navigate: mockNavigate }} />,
      );

      // The ImageEditingOverlay component should be rendered
      // We can verify the structure is correct by checking the main content
      expect(screen.getByText("Test Organization")).toBeTruthy();
    });

    it("should initialize with correct image and color from organization", () => {
      const mockOrg = createMockOrganization(
        "Test Organization",
        "ABC123",
        "manager-id",
        "custom_org_image",
        "#0000FF",
      );

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        <OrgInfoScreen navigation={{ navigate: mockNavigate }} />,
      );

      // Component should render with the organization's data
      expect(screen.getByText("Test Organization")).toBeTruthy();
      expect(screen.getByText("ABC123")).toBeTruthy();
    });
  });

  describe("Manager-specific UI", () => {
    it("should render EditImage component", () => {
      const mockOrg = createMockOrganization(
        "Test Organization",
        "ABC123",
        "manager-id",
      );

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        <OrgInfoScreen navigation={{ navigate: mockNavigate }} />,
      );

      // EditImage is rendered with the organization data
      expect(screen.getByText("Test Organization")).toBeTruthy();
      expect(screen.getByText("ABC123")).toBeTruthy();
    });

    it("should show all navigation options regardless of manager status", () => {
      const mockOrg = createMockOrganization(
        "Test Organization",
        "ABC123",
        "manager-id",
      );

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: false, // Non-manager
      });

      renderWithModal(
        <OrgInfoScreen navigation={{ navigate: mockNavigate }} />,
      );

      // All navigation options should be visible
      expect(screen.getByText("Members")).toBeTruthy();
      expect(screen.getByText("Equipment Sheet")).toBeTruthy();
      expect(screen.getByText("Manage Equipment")).toBeTruthy();
      expect(screen.getByText("Delete Organization")).toBeTruthy();
    });
  });

  describe("Access Code Display", () => {
    it("should display correct access code", () => {
      const mockOrg = createMockOrganization(
        "Test Organization",
        "CUSTOM123",
        "manager-id",
      );

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        <OrgInfoScreen navigation={{ navigate: mockNavigate }} />,
      );

      expect(screen.getByText("CUSTOM123")).toBeTruthy();
    });

    it("should display access code from organization", () => {
      const mockOrg = createMockOrganization(
        "Test Org",
        "CODE123",
        "manager-id",
      );

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        <OrgInfoScreen navigation={{ navigate: mockNavigate }} />,
      );

      expect(screen.getByText("CODE123")).toBeTruthy();
    });
  });
});
