import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { Entypo } from "@expo/vector-icons";

// project imports
import { useEquipment } from "../../lib/context/EquipmentContext";
import { Item, Container, OrgOwnership } from "../../types/models";
import { useSpinner } from "../../lib/context/SpinnerContext";
import { useModal } from "../../lib/context/ModalContext";

/*
  Component for displaying all equipment in the organization
  in a table format
*/
// row for equipment or container
function ItemRow({
  item,
  isSubItem = false,
}: {
  item: Item & { ownerName: string };
  isSubItem?: boolean;
}) {
  const [openContainer, setOpenContainer] = useState(false);
  const { showSpinner, hideSpinner } = useSpinner();
  const { setMessage } = useModal();
  const { deleteItem } = useEquipment();

  async function handleDelete(selectedItem: Item) {
    try {
      showSpinner();
      await deleteItem(selectedItem);
    } catch (error: any) {
      setMessage(error.message || "Failed to delete item");
    } finally {
      hideSpinner();
    }
  }

  async function confirmDelete(selectedItem: Item) {
    // alert confirmation
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete ${selectedItem.name}?`,
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => handleDelete(selectedItem),
        },
      ],
    );
  }

  return (
    <>
      <View style={styles.row}>
        <View style={[styles.cell, { flex: 2 }]}>
          {item.type === "container" ? (
            <TouchableOpacity
              style={styles.icon}
              onPress={() => setOpenContainer(!openContainer)}
            >
              <Entypo
                name={openContainer ? "chevron-down" : "chevron-right"}
                size={20}
              />
            </TouchableOpacity>
          ) : isSubItem ? (
            <View style={styles.icon}>
              <Entypo name="minus" size={20} />
            </View>
          ) : null}
        </View>
        <View style={[styles.cell, { flex: 10 }]}>
          <Text style={styles.text}>{item.ownerName}</Text>
        </View>
        <View style={[styles.cell, { flex: 8 }]}>
          <Text style={styles.text}>{item.name}</Text>
        </View>
        <View style={[styles.cell, { flex: 3, alignItems: "center" }]}>
          <Text style={styles.text}>{item.count}</Text>
        </View>
        <TouchableOpacity
          style={styles.icon}
          onPress={() => confirmDelete(item)}
        >
          <Entypo name="dots-three-vertical" size={20} />
        </TouchableOpacity>
      </View>
      {item.type === "container" && openContainer && (
        <FlatList
          data={(item as Container).equipment}
          renderItem={({ item: subItem }) => (
            <ItemRow
              item={Object.assign(subItem, { ownerName: item.ownerName })}
              isSubItem={true}
            />
          )}
          keyExtractor={(subItem) => subItem.id}
        />
      )}
    </>
  );
}

export default function EquipmentTable({
  searchFilter,
}: {
  searchFilter: string;
}) {
  const tableHead = ["", "Location", "Name", "Count", ""];
  const { ownerships } = useEquipment();

  // table data is the equipment in the organization, flattened from ownerships
  const tableData = useMemo(() => {
    const data: (Item & { ownerName: string })[] = [];
    ownerships.forEach((ownership: OrgOwnership) => {
      ownership.items.forEach((item: Item) => {
        data.push(
          Object.assign(item, { ownerName: ownership.membership.name }),
        );
      });
    });
    return data;
  }, [ownerships]);

  // filtered data is the equipment that matches the search filter
  const filteredData = useMemo(() => {
    if (!searchFilter) return tableData;

    const filter = searchFilter.toLowerCase();
    return tableData.filter(
      (item: Item & { ownerName: string }) =>
        item.name.toLowerCase().includes(filter) ||
        item.ownerName.toLowerCase().includes(filter) ||
        (item.type === "container" &&
          (item as Container).equipment.some((e) =>
            e.name.toLowerCase().includes(filter),
          )),
    );
  }, [searchFilter, tableData]);

  return (
    <View style={styles.table}>
      <View style={styles.row}>
        <View style={[styles.cell, { flex: 2 }]} />
        <View style={[styles.cell, { flex: 10 }]}>
          <Text style={styles.headerText}>{tableHead[1]}</Text>
        </View>
        <View style={[styles.cell, { flex: 8 }]}>
          <Text style={styles.headerText}>{tableHead[2]}</Text>
        </View>
        <View style={[styles.cell, { flex: 3 }]}>
          <Text style={styles.headerText}>{tableHead[3]}</Text>
        </View>
        <View style={[styles.cell, { flex: 1 }]}>
          <Text style={styles.headerText}>{tableHead[4]}</Text>
        </View>
      </View>
      <FlatList
        data={filteredData}
        renderItem={({ item }) => <ItemRow item={item} />}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerText: {
    color: "gray",
    fontSize: 12,
  },
  cell: {
    marginLeft: 10,
    justifyContent: "center",
  },
  icon: {
    justifyContent: "center",
    marginRight: 5,
  },
  row: {
    flexDirection: "row",
    minHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
  },
  table: {
    width: "100%",
    flex: 1,
  },
  text: {
    fontSize: 12,
  },
});
