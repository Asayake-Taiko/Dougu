import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react-native";
import { renderWithModal } from "./testSetup";

import MemberProfileScreen from "../../../src/screens/organization/MemberProfileScreen";
import { Organization, OrgMembership } from "../../../src/types/models";
import { OrganizationRecord, OrgMembershipRecord } from "../../../src/types/db";

import { useMembership } from "../../../src/lib/context/MembershipContext";
import { useSpinner } from "../../../src/lib/context/SpinnerContext";
import { useNavigation } from "@react-navigation/native";

describe("MemberProfileScreen", () => {
  let mockShowSpinner: jest.Mock;
  let mockHideSpinner: jest.Mock;
  let mockGoBack: jest.Mock;
  let mockMemberDelete: jest.Mock;
  let mockMemberUpdateImage: jest.Mock;
  let mockOrgTransferOwnership: jest.Mock;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    mockShowSpinner = jest.fn();
    mockHideSpinner = jest.fn();
    mockGoBack = jest.fn();
    mockMemberDelete = jest.fn();
    mockMemberUpdateImage = jest.fn();
    mockOrgTransferOwnership = jest.fn();

    (useSpinner as jest.Mock).mockReturnValue({
      showSpinner: mockShowSpinner,
      hideSpinner: mockHideSpinner,
    });

    (useNavigation as jest.Mock).mockReturnValue({
      goBack: mockGoBack,
    });
  });

  const createMockOrganization = (
    name: string,
    managerId: string,
  ): Organization => {
    const orgRecord: OrganizationRecord = {
      id: "test-org-id",
      name,
      access_code: "ABC123",
      manager_id: managerId,
      image: "default_org",
      color: "#791111",
      created_at: "2026-01-01T00:00:00Z",
    };

    const org = new Organization(orgRecord);
    org.transferOwnership = mockOrgTransferOwnership;
    return org;
  };

  const createMockMember = (
    userId: string | null,
    name: string,
    type: "USER" | "STORAGE",
    details?: string,
  ): OrgMembership => {
    const memberRecord: OrgMembershipRecord = {
      id: "test-member-id",
      organization_id: "test-org-id",
      type,
      user_id: type === "USER" ? (userId ?? undefined) : undefined,
      storage_name: type === "STORAGE" ? name : undefined,
      profile_image: "default_profile",
      color: "#791111",
      details: details,
    };

    const member = new OrgMembership(
      memberRecord,
      type === "USER" ? name : undefined,
      "default_profile",
      "#791111",
    );
    member.delete = mockMemberDelete;
    member.updateImage = mockMemberUpdateImage;
    return member;
  };

  describe("Kick Member", () => {
    it("should kick member successfully when user is manager", async () => {
      const mockOrg = createMockOrganization("TestOrg", "manager-user-id");
      const mockMember = createMockMember("member-user-id", "John Doe", "USER");
      mockMemberDelete.mockResolvedValue(undefined);

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        // @ts-expect-error - Mocked navigation
        <MemberProfileScreen route={{ params: { member: mockMember } }} />,
      );

      // Find and press the Kick button
      const kickButton = screen.getByText("Kick");
      fireEvent.press(kickButton);

      // Wait for confirmation modal to appear
      await waitFor(() => {
        expect(screen.getByText("Kick Member")).toBeTruthy();
        expect(
          screen.getByText(/Are you sure you want to kick John Doe/),
        ).toBeTruthy();
      });

      // Confirm the kick action (second "Kick" button is in the modal)
      const kickButtons = screen.getAllByText("Kick");
      fireEvent.press(kickButtons[1]);

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText("Member kicked successfully.")).toBeTruthy();
      });

      expect(mockShowSpinner).toHaveBeenCalled();
      expect(mockMemberDelete).toHaveBeenCalled();
      expect(mockGoBack).toHaveBeenCalled();
      expect(mockHideSpinner).toHaveBeenCalled();
    });

    it("should show error when trying to kick the manager", async () => {
      const mockOrg = createMockOrganization("TestOrg", "manager-user-id");
      const mockMember = createMockMember("manager-user-id", "Manager", "USER");

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        // @ts-expect-error - Mocked navigation
        <MemberProfileScreen route={{ params: { member: mockMember } }} />,
      );

      const kickButton = screen.getByText("Kick");
      fireEvent.press(kickButton);

      // Confirm the kick action
      await waitFor(() => {
        expect(screen.getByText("Kick Member")).toBeTruthy();
      });

      const kickButtons = screen.getAllByText("Kick");
      fireEvent.press(kickButtons[1]);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText("You cannot kick the manager.")).toBeTruthy();
      });

      expect(mockMemberDelete).not.toHaveBeenCalled();
      expect(mockGoBack).not.toHaveBeenCalled();
    });

    it("should show error when non-manager tries to kick", async () => {
      const mockOrg = createMockOrganization("TestOrg", "manager-user-id");
      const mockMember = createMockMember("member-user-id", "John Doe", "USER");

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: false, // Not a manager
      });

      renderWithModal(
        // @ts-expect-error - Mocked navigation
        <MemberProfileScreen route={{ params: { member: mockMember } }} />,
      );

      const kickButton = screen.getByText("Kick");
      fireEvent.press(kickButton);

      await waitFor(() => {
        expect(screen.getByText("Kick Member")).toBeTruthy();
      });

      const kickButtons = screen.getAllByText("Kick");
      fireEvent.press(kickButtons[1]);

      await waitFor(() => {
        expect(
          screen.getByText("Only managers can kick members."),
        ).toBeTruthy();
      });

      expect(mockMemberDelete).not.toHaveBeenCalled();
      expect(mockGoBack).not.toHaveBeenCalled();
    });

    it("should handle kick failure gracefully", async () => {
      const mockOrg = createMockOrganization("TestOrg", "manager-user-id");
      const mockMember = createMockMember("member-user-id", "John Doe", "USER");
      const errorMessage = "Database error";
      mockMemberDelete.mockRejectedValue(new Error(errorMessage));

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        // @ts-expect-error - Mocked navigation
        <MemberProfileScreen
          route={{
            key: "test",
            name: "MemberProfile",
            params: { member: mockMember },
          }}
        />,
      );

      const kickButton = screen.getByText("Kick");
      fireEvent.press(kickButton);

      await waitFor(() => {
        expect(screen.getByText("Kick Member")).toBeTruthy();
      });

      const kickButtons = screen.getAllByText("Kick");
      fireEvent.press(kickButtons[1]);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeTruthy();
      });

      expect(mockMemberDelete).toHaveBeenCalled();
      expect(mockGoBack).not.toHaveBeenCalled();
    });

    it("should show generic error message when kick fails without message", async () => {
      const mockOrg = createMockOrganization("TestOrg", "manager-user-id");
      const mockMember = createMockMember("member-user-id", "John Doe", "USER");
      mockMemberDelete.mockRejectedValue(new Error());

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        // @ts-expect-error - Mocked navigation
        <MemberProfileScreen route={{ params: { member: mockMember } }} />,
      );

      const kickButton = screen.getByText("Kick");
      fireEvent.press(kickButton);

      await waitFor(() => {
        expect(screen.getByText("Kick Member")).toBeTruthy();
      });

      const kickButtons = screen.getAllByText("Kick");
      fireEvent.press(kickButtons[1]);

      await waitFor(() => {
        expect(
          screen.getByText("Failed to kick member. Please try again."),
        ).toBeTruthy();
      });
    });
  });

  describe("Delete Storage", () => {
    it("should delete storage successfully when user is manager", async () => {
      const mockOrg = createMockOrganization("TestOrg", "manager-user-id");
      const mockStorage = createMockMember(
        null,
        "Main Storage",
        "STORAGE",
        "Storage details",
      );
      mockMemberDelete.mockResolvedValue(undefined);

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        // @ts-expect-error - Mocked navigation
        <MemberProfileScreen
          route={{
            key: "test",
            name: "MemberProfile",
            params: { member: mockStorage },
          }}
        />,
      );

      // Storage should show "Delete" instead of "Kick"
      const deleteButton = screen.getByText("Delete");
      fireEvent.press(deleteButton);

      // Wait for confirmation modal
      await waitFor(() => {
        expect(screen.getByText("Kick Member")).toBeTruthy();
      });

      const confirmButton = screen.getByText("Kick");
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(screen.getByText("Member kicked successfully.")).toBeTruthy();
      });

      expect(mockMemberDelete).toHaveBeenCalled();
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe("Transfer Ownership", () => {
    it("should transfer ownership successfully to a user member", async () => {
      const mockOrg = createMockOrganization("TestOrg", "manager-user-id");
      const mockMember = createMockMember("member-user-id", "John Doe", "USER");
      mockOrgTransferOwnership.mockResolvedValue(undefined);

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        // @ts-expect-error - Mocked navigation
        <MemberProfileScreen
          route={{
            key: "test",
            name: "MemberProfile",
            params: { member: mockMember },
          }}
        />,
      );

      // Find and press the Make Manager button
      const makeManagerButton = screen.getByText("Make Manager");
      fireEvent.press(makeManagerButton);

      // Wait for confirmation modal
      await waitFor(() => {
        expect(screen.getByText("Transfer Ownership")).toBeTruthy();
        expect(
          screen.getByText(
            /Are you sure you want to make John Doe the manager/,
          ),
        ).toBeTruthy();
      });

      // Confirm the transfer
      const confirmButton = screen.getByText("Transfer");
      fireEvent.press(confirmButton);

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText("John Doe is now the manager.")).toBeTruthy();
      });

      expect(mockShowSpinner).toHaveBeenCalled();
      expect(mockOrgTransferOwnership).toHaveBeenCalledWith("member-user-id");
      expect(mockGoBack).toHaveBeenCalled();
      expect(mockHideSpinner).toHaveBeenCalled();
    });

    it("should show error when trying to transfer to storage", async () => {
      const mockOrg = createMockOrganization("TestOrg", "manager-user-id");
      const mockStorage = createMockMember(null, "Storage", "STORAGE");

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        // @ts-expect-error - Mocked navigation
        <MemberProfileScreen
          route={{
            key: "test",
            name: "MemberProfile",
            params: { member: mockStorage },
          }}
        />,
      );

      // Storage shouldn't have "Make Manager" button - verify it doesn't exist
      expect(screen.queryByText("Make Manager")).toBeNull();
    });

    it("should show error when trying to transfer to current manager", async () => {
      const mockOrg = createMockOrganization("TestOrg", "manager-user-id");
      const mockMember = createMockMember(
        "manager-user-id",
        "Current Manager",
        "USER",
      );

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        // @ts-expect-error - Mocked navigation
        <MemberProfileScreen
          route={{
            key: "test",
            name: "MemberProfile",
            params: { member: mockMember },
          }}
        />,
      );

      const makeManagerButton = screen.getByText("Make Manager");
      fireEvent.press(makeManagerButton);

      await waitFor(() => {
        expect(screen.getByText("Transfer Ownership")).toBeTruthy();
      });

      const confirmButton = screen.getByText("Transfer");
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(
          screen.getByText("This member is already the manager."),
        ).toBeTruthy();
      });

      expect(mockOrgTransferOwnership).not.toHaveBeenCalled();
      expect(mockGoBack).not.toHaveBeenCalled();
    });

    it("should show error when non-manager tries to transfer", async () => {
      const mockOrg = createMockOrganization("TestOrg", "manager-user-id");
      const mockMember = createMockMember("member-user-id", "John Doe", "USER");

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: false, // Not a manager
      });

      renderWithModal(
        // @ts-expect-error - Mocked navigation
        <MemberProfileScreen
          route={{
            key: "test",
            name: "MemberProfile",
            params: { member: mockMember },
          }}
        />,
      );

      const makeManagerButton = screen.getByText("Make Manager");
      fireEvent.press(makeManagerButton);

      await waitFor(() => {
        expect(screen.getByText("Transfer Ownership")).toBeTruthy();
      });

      const confirmButton = screen.getByText("Transfer");
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(
          screen.getByText("Only managers can transfer ownership."),
        ).toBeTruthy();
      });

      expect(mockOrgTransferOwnership).not.toHaveBeenCalled();
      expect(mockGoBack).not.toHaveBeenCalled();
    });

    it("should handle transfer failure gracefully", async () => {
      const mockOrg = createMockOrganization("TestOrg", "manager-user-id");
      const mockMember = createMockMember("member-user-id", "John Doe", "USER");
      const errorMessage = "Transfer failed";
      mockOrgTransferOwnership.mockRejectedValue(new Error(errorMessage));

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        // @ts-expect-error - Mocked navigation
        <MemberProfileScreen
          route={{
            key: "test",
            name: "MemberProfile",
            params: { member: mockMember },
          }}
        />,
      );

      const makeManagerButton = screen.getByText("Make Manager");
      fireEvent.press(makeManagerButton);

      await waitFor(() => {
        expect(screen.getByText("Transfer Ownership")).toBeTruthy();
      });

      const confirmButton = screen.getByText("Transfer");
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeTruthy();
      });

      expect(mockOrgTransferOwnership).toHaveBeenCalled();
      expect(mockGoBack).not.toHaveBeenCalled();
    });

    it("should show generic error message when transfer fails without message", async () => {
      const mockOrg = createMockOrganization("TestOrg", "manager-user-id");
      const mockMember = createMockMember("member-user-id", "John Doe", "USER");
      mockOrgTransferOwnership.mockRejectedValue(new Error());

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        // @ts-expect-error - Mocked navigation
        <MemberProfileScreen
          route={{
            key: "test",
            name: "MemberProfile",
            params: { member: mockMember },
          }}
        />,
      );

      const makeManagerButton = screen.getByText("Make Manager");
      fireEvent.press(makeManagerButton);

      await waitFor(() => {
        expect(screen.getByText("Transfer Ownership")).toBeTruthy();
      });

      const confirmButton = screen.getByText("Transfer");
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(screen.getByText("Failed to transfer ownership.")).toBeTruthy();
      });
    });
  });

  describe("Confirmation Modal Cancellation", () => {
    it("should cancel kick action when user presses Cancel", async () => {
      const mockOrg = createMockOrganization("TestOrg", "manager-user-id");
      const mockMember = createMockMember("member-user-id", "John Doe", "USER");

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        // @ts-expect-error - Mocked navigation
        <MemberProfileScreen
          route={{
            key: "test",
            name: "MemberProfile",
            params: { member: mockMember },
          }}
        />,
      );

      const kickButton = screen.getByText("Kick");
      fireEvent.press(kickButton);

      // Wait for modal
      await waitFor(() => {
        expect(screen.getByText("Kick Member")).toBeTruthy();
      });

      // Press Cancel
      const cancelButton = screen.getByText("Cancel");
      fireEvent.press(cancelButton);

      // Wait a bit to ensure nothing happens
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify no action was taken
      expect(mockMemberDelete).not.toHaveBeenCalled();
      expect(mockGoBack).not.toHaveBeenCalled();
    });

    it("should cancel transfer action when user presses Cancel", async () => {
      const mockOrg = createMockOrganization("TestOrg", "manager-user-id");
      const mockMember = createMockMember("member-user-id", "John Doe", "USER");

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        // @ts-expect-error - Mocked navigation
        <MemberProfileScreen route={{ params: { member: mockMember } }} />,
      );

      const makeManagerButton = screen.getByText("Make Manager");
      fireEvent.press(makeManagerButton);

      await waitFor(() => {
        expect(screen.getByText("Transfer Ownership")).toBeTruthy();
      });

      const cancelButton = screen.getByText("Cancel");
      fireEvent.press(cancelButton);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockOrgTransferOwnership).not.toHaveBeenCalled();
      expect(mockGoBack).not.toHaveBeenCalled();
    });
  });

  describe("UI Rendering", () => {
    it("should render member profile with all elements for user member", () => {
      const mockOrg = createMockOrganization("TestOrg", "manager-user-id");
      const mockMember = createMockMember(
        "member-user-id",
        "John Doe",
        "USER",
        "Member details here",
      );

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        // @ts-expect-error - Mocked navigation
        <MemberProfileScreen
          route={{
            key: "test",
            name: "MemberProfile",
            params: { member: mockMember },
          }}
        />,
      );

      // Check member name
      expect(screen.getByText("John Doe")).toBeTruthy();

      // Check details
      expect(screen.getByText("Member details here")).toBeTruthy();

      // Check buttons
      expect(screen.getByText("Make Manager")).toBeTruthy();
      expect(screen.getByText("Kick")).toBeTruthy();
    });

    it("should render storage profile correctly", () => {
      const mockOrg = createMockOrganization("TestOrg", "manager-user-id");
      const mockStorage = createMockMember(
        null,
        "Storage Unit",
        "STORAGE",
        "Storage for equipment",
      );

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        // @ts-expect-error - Mocked navigation
        <MemberProfileScreen
          route={{
            key: "test",
            name: "MemberProfile",
            params: { member: mockStorage },
          }}
        />,
      );

      expect(screen.getByText("Storage Unit")).toBeTruthy();
      expect(screen.getByText("Storage for equipment")).toBeTruthy();

      // Storage should show "Delete" instead of "Kick"
      expect(screen.getByText("Delete")).toBeTruthy();

      // Storage should NOT show "Make Manager"
      expect(screen.queryByText("Make Manager")).toBeNull();
    });

    it("should not render details section when member has no details", () => {
      const mockOrg = createMockOrganization("TestOrg", "manager-user-id");
      const mockMember = createMockMember("member-user-id", "John Doe", "USER");

      (useMembership as jest.Mock).mockReturnValue({
        organization: mockOrg,
        isManager: true,
      });

      renderWithModal(
        // @ts-expect-error - Mocked navigation
        <MemberProfileScreen
          route={{
            key: "test",
            name: "MemberProfile",
            params: { member: mockMember },
          }}
        />,
      );

      expect(screen.getByText("John Doe")).toBeTruthy();

      // Details should not be present
      expect(screen.queryByText(/details/i)).toBeNull();
    });

    it("should return null when member or organization is missing", () => {
      (useMembership as jest.Mock).mockReturnValue({
        organization: null,
        isManager: true,
      });

      const mockMember = createMockMember("member-user-id", "John Doe", "USER");

      renderWithModal(
        // @ts-expect-error - Mocked navigation
        <MemberProfileScreen
          route={{
            key: "test",
            name: "MemberProfile",
            params: { member: mockMember },
          }}
        />,
      );

      // Nothing should render
      expect(screen.queryByText("John Doe")).toBeNull();
      expect(screen.queryByText("Make Manager")).toBeNull();
      expect(screen.queryByText("Kick")).toBeNull();
    });
  });
});
