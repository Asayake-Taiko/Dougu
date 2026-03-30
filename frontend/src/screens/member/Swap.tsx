import React, { useState, useRef, useEffect, useCallback } from "react";
import { OrgMembershipRecord } from "../../types/db";
import { Item } from "../../types/other";
import SwapGestures from "../../components/member/SwapGestures";
import { useEquipment } from "../../lib/context/EquipmentContext";
import { useMembership } from "../../lib/context/MembershipContext";

/*
  Screen for swapping equipment between the current user and another member.
  This section mainly focuses on getting and passing down the equipment info
*/
export default function SwapScreen() {
  const { ownerships } = useEquipment();
  const { membership } = useMembership();
  const topUser = useRef<OrgMembershipRecord | null>(
    membership?.membership || null,
  );
  const bottomUser = useRef<OrgMembershipRecord | null>(null);
  const [listOne, setListOne] = useState<Item[]>([]);
  const [listTwo, setListTwo] = useState<Item[]>([]);

  const updateLists = useCallback(() => {
    // We get ownership based on selected top user, defaulting to current member if topUser is not set.
    if (topUser.current) {
      const topOwnership = ownerships.get(topUser.current.id);
      setListOne(topOwnership?.items || []);
    }

    if (bottomUser.current) {
      const bottomOwnership = ownerships.get(bottomUser.current.id);
      setListTwo(bottomOwnership?.items || []);
    }
  }, [ownerships]);

  // Update lists whenever ownerships change
  useEffect(() => {
    updateLists();
  }, [ownerships, updateLists]);

  const handleSetTop = (targetMembership: OrgMembershipRecord | null) => {
    topUser.current = targetMembership;
    updateLists();
  };

  const handleSetBottom = (targetMembership: OrgMembershipRecord | null) => {
    bottomUser.current = targetMembership;
    updateLists();
  };

  return (
    <SwapGestures
      listOne={listOne}
      listTwo={listTwo}
      handleSetTop={handleSetTop}
      handleSetBottom={handleSetBottom}
      topUser={topUser}
      bottomUser={bottomUser}
    />
  );
}
