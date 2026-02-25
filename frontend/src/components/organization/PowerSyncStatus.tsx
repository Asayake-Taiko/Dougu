import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { usePowerSync } from "@powersync/react-native";
import { Colors, Spacing, Typography } from "../../styles/global";

export function PowerSyncStatus({ compact = false }: { compact?: boolean }) {
  const powerSync = usePowerSync();
  const status = powerSync.currentStatus;

  const isConnected = status?.connected;
  const isSyncing = status?.downloading;
  const hasError = !!status?.lastSyncedAt && !isConnected;

  let label = "Offline";
  let color = Colors.error;
  let errorMessage = "";

  if (isConnected) {
    if (isSyncing) {
      label = "Syncing...";
      color = Colors.primary;
    } else {
      label = "Online";
      color = Colors.success;
    }
  } else if (hasError || status?.connectError) {
    label = "Error";
    color = Colors.error;
    if (status?.connectError) {
      errorMessage = status.connectError.message || String(status.connectError);
    }
  }

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={{ flex: compact ? 0 : 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.text}>{label}</Text>
          {!compact && status?.lastSyncedAt && (
            <Text style={styles.timeText}>
              {new Date(status.lastSyncedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          )}
        </View>
        {!compact && !!errorMessage && (
          <Text style={styles.errorText} numberOfLines={2}>
            {errorMessage}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 8,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  compactContainer: {
    padding: Spacing.xs,
    marginHorizontal: Spacing.sm,
    marginTop: 0,
    backgroundColor: "transparent",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  text: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "600",
    color: Colors.gray600,
    marginRight: Spacing.sm,
  },
  timeText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.gray400,
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
    marginTop: 2,
  },
});
