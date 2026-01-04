import React, { useState, useRef, useEffect, useCallback } from "react";

// project imports
import { OrgUserStorage } from "../../models";
import { useUser } from "../../helper/context/UserContext";
import { ItemObj } from "../../types/ModelTypes";
import SwapGestures from "../../components/member/SwapGestures";
import { useEquipment } from "../../helper/context/EquipmentContext";

/*
  Screen for swapping equipment between the current user and another user.
  This section mainly focuses on getting and passing down the equipment info
*/
export default function SwapEquipmentScreen() {
  const { orgUserStorage } = useUser();
  const { itemData } = useEquipment();
  let swapUser = useRef<OrgUserStorage | null>(null);
  let [listOne, setListOne] = useState<ItemObj[]>([]);
  let [listTwo, setListTwo] = useState<ItemObj[]>([]);

  // gets and sets the equipment for the current user and the swap user
  // as well as the equipment counts
  const setEquipment = useCallback(async () => {
    const userItemsOne = itemData.get(orgUserStorage!.id);
    const itemsOne = userItemsOne?.data;
    setListOne(itemsOne ? itemsOne : []);
    if (swapUser.current != null) {
      const userItemsTwo = itemData.get(swapUser.current.id);
      const itemsTwo = userItemsTwo?.data;
      setListTwo(itemsTwo ? itemsTwo : []);
    } else {
      setListTwo([]);
    }
  }, [itemData, orgUserStorage]);

  // call setEquipment everytime the swap user changes
  useEffect(() => {
    setEquipment();
  }, [setEquipment]);

  // on unmount clear the swap user and dropdown
  useEffect(() => {
    return () => {
      swapUser.current = null;
    };
  }, []);

  // get selected user equipment
  const handleSet = (inputUser: OrgUserStorage | null) => {
    swapUser.current = inputUser;
    setEquipment();
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
