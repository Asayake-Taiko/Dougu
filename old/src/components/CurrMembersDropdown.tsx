// dropdown for the current members
import React, { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { DataStore } from "@aws-amplify/datastore";
import { useIsFocused } from "@react-navigation/native";

// project imports
import { OrgUserStorage } from "../models";
import { useUser } from "../helper/context/UserContext";
import { UserNames } from "../types/ModelTypes";
import { sortOrgUserStorages } from "../helper/EquipmentUtils";

/*
  Dropdown component for selecting the current members
  (OrgUserStorages) of the organization
*/
export default function CurrMembersDropdown({
  setUser,
  isCreate,
}: {
  setUser: (inputUser: OrgUserStorage | null) => void;
  isCreate: boolean;
}) {
  const [value, setValue] = useState<string | null>(null);
  const [isFocus, setIsFocus] = useState(false);
  const [userNames, setUserNames] = useState<UserNames[]>([]);
  const isFocused = useIsFocused();
  const { user, org } = useUser();

  // useEffect
  useEffect(() => {
    const getMembers = async () => {
      let data;
      if (isCreate) {
        // when creating equipment, you want to be able to assign it to anyone
        data = await DataStore.query(OrgUserStorage, (c) =>
          c.organization.name.eq(org!.name),
        );
      } else {
        // when swapping equipment, you don't want to swap with yourself
        data = await DataStore.query(OrgUserStorage, (c) =>
          c.and((c) => [
            c.organization.name.eq(org!.name),
            c.or((c) => [c.type.eq("STORAGE"), c.user.ne(user!.id)]),
          ]),
        );
      }
      data = sortOrgUserStorages(data);
      const userNames = data.map((user) => ({
        label: user["name"],
        value: user["name"],
        data: user,
      }));
      setUserNames(userNames);
    };

    const subscription = DataStore.observeQuery(OrgUserStorage).subscribe(
      () => {
        getMembers();
      },
    );

    return () => subscription.unsubscribe();
  }, [isCreate, isFocused, org, user]);

  const handleChangeUser = (value: OrgUserStorage) => {
    setUser(value);
  };

  return (
    <Dropdown
      style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
      placeholderStyle={styles.textStyle}
      selectedTextStyle={styles.textStyle}
      data={userNames}
      labelField="label"
      valueField="value"
      placeholder={"Select Member"}
      value={value}
      onFocus={() => setIsFocus(true)}
      onBlur={() => setIsFocus(false)}
      onChange={(item) => {
        setValue(item.value);
        setIsFocus(false);
        handleChangeUser(item.data);
      }}
      autoScroll={false}
    />
  );
}

const styles = StyleSheet.create({
  dropdown: {
    width: "auto",
    height: 40,
  },
  textStyle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 20,
  },
});
