import React, { useState, useRef, useEffect } from "react";
import { OrgMembershipRecord } from "../../types/db";
import { Item } from "../../types/models";
import SwapGestures from "../../components/member/SwapGestures";
import { useEquipment } from "../../lib/context/EquipmentContext";

/*
  Screen for swapping equipment between the current user and another member.
  This section mainly focuses on getting and passing down the equipment info
*/
export default function SwapScreen() {
    const { currentMember, ownerships } = useEquipment();
    const swapUser = useRef<OrgMembershipRecord | null>(null);
    const [listOne, setListOne] = useState<Item[]>([]);
    const [listTwo, setListTwo] = useState<Item[]>([]);

    const updateLists = () => {
        if (currentMember) {
            const myOwnership = ownerships.get(currentMember.id);
            setListOne(myOwnership?.items || []);
        } else {
            setListOne([]);
        }

        if (swapUser.current) {
            const swapOwnership = ownerships.get(swapUser.current.id);
            setListTwo(swapOwnership?.items || []);
        } else {
            setListTwo([]);
        }
    };

    // Update lists whenever ownerships or selection changes
    useEffect(() => {
        updateLists();
    }, [ownerships, currentMember]);

    // get selected user equipment
    const handleSet = (targetMembership: OrgMembershipRecord | null) => {
        swapUser.current = targetMembership;
        updateLists();
    };

    return (
        <SwapGestures
            listOne={listOne}
            listTwo={listTwo}
            handleSet={handleSet}
            swapUser={swapUser}
        />
    );
}
