import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Switch } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

// project imports
import { useEquipment } from "../../lib/context/EquipmentContext";
import { useMembership } from "../../lib/context/MembershipContext";
import { getSheetData } from "../../lib/utils/EquipmentUtils";
import Sheet, { csvSheet } from "../../components/organization/Sheet";

const STORAGE_KEY = "sheet_config";

export default function SheetScreen() {
  const { ownerships } = useEquipment();
  const { organization } = useMembership();
  const [data, setData] = useState<csvSheet | null>(null);
  const [showEmpty, setShowEmpty] = useState(true);
  const [showContainerEquip, setShowContainerEquip] = useState(true);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  // Load preferences
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const configStr = await AsyncStorage.getItem(STORAGE_KEY);
        if (configStr) {
          const {
            showEmpty: savedShowEmpty,
            showContainerEquip: savedShowContainerEquip,
          } = JSON.parse(configStr);
          setShowEmpty(savedShowEmpty);
          setShowContainerEquip(savedShowContainerEquip);
        }
      } catch (e) {
        console.error("Failed to load sheet config", e);
      } finally {
        setIsLoadingConfig(false);
      }
    };
    loadConfig();
  }, []);

  // Sync data with items and preferences
  useEffect(() => {
    setData(getSheetData(ownerships, showEmpty, showContainerEquip));
  }, [ownerships, showEmpty, showContainerEquip]);

  // Persist preferences
  useEffect(() => {
    if (isLoadingConfig) return;
    const saveConfig = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ showEmpty, showContainerEquip }),
        );
      } catch (e) {
        console.error("Failed to save sheet config", e);
      }
    };
    saveConfig();
  }, [showEmpty, showContainerEquip, isLoadingConfig]);

  if (!organization) return null;

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#791111", "#550c0c"]} style={styles.header}>
        <Text style={styles.headerText}>{organization.name}</Text>
      </LinearGradient>

      <View style={styles.configArea}>
        <View style={styles.toggleRow}>
          <Text style={styles.label}>Empty Rows</Text>
          <Switch
            value={showEmpty}
            onValueChange={setShowEmpty}
            trackColor={{ false: "#767577", true: "#791111" }}
            thumbColor={showEmpty ? "#fff" : "#f4f3f4"}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.label}>Items in Containers</Text>
          <Switch
            value={showContainerEquip}
            onValueChange={setShowContainerEquip}
            trackColor={{ false: "#767577", true: "#791111" }}
            thumbColor={showContainerEquip ? "#fff" : "#f4f3f4"}
          />
        </View>
      </View>

      <View style={styles.sheetContainer}>
        <Sheet data={data} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  configArea: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    marginRight: 8,
    color: "#444",
  },
  sheetContainer: {
    flex: 1,
  },
});
