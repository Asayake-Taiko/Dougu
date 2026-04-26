import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useEquipment } from "../../lib/context/EquipmentContext";
import ScrollRow from "../../components/member/ScrollRow";
import EquipmentOverlay from "../../components/member/EquipmentOverlay";
import ContainerOverlay from "../../components/member/ContainerOverlay";
import DisplayImage from "../../components/DisplayImage";

export default function TeamScreen() {
  const { ownerships } = useEquipment();
  const [containerPage, setContainerPage] = React.useState(0);

  return (
    <View style={{ backgroundColor: "white", minHeight: "100%" }}>
      <FlatList
        data={Array.from(ownerships.values())}
        keyExtractor={(ownership) => ownership.membership.id}
        renderItem={({ item: ownership }) => {
          const { membership, items } = ownership;
          const displayName = membership.name;

          return (
            <View style={styles.userContainer}>
              <View style={styles.headerRow}>
                <DisplayImage
                  imageKey={membership.profile}
                  style={styles.profileImage}
                  color={membership.color}
                />
                <Text style={styles.scrollText}>{displayName}</Text>
              </View>
              <ScrollRow listData={items} />
            </View>
          );
        }}
      />
      <EquipmentOverlay />
      <ContainerOverlay
        containerPage={containerPage}
        setContainerPage={setContainerPage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 20,
    marginTop: 10,
  },
  profileImage: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
  },
  scrollText: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  userContainer: {
    minHeight: 200,
    backgroundColor: "white",
  },
});
