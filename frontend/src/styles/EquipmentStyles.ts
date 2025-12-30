import { StyleSheet, Dimensions } from "react-native";
import { Colors, Spacing, Typography } from "./global";

const { width: windowWidth } = Dimensions.get("window");
const rowWidth = windowWidth * 0.9;
const containerWidth = rowWidth / 3;

export const EquipmentStyles = StyleSheet.create({
    background: {
        backgroundColor: Colors.white,
        flex: 1,
        width: "100%",
    },
    container: {
        width: "100%",
        paddingBottom: Spacing.lg,
        alignItems: "center",
        backgroundColor: Colors.white,
    },
    title: {
        fontSize: Typography.fontSize.xl,
        fontWeight: Typography.fontWeight.bold,
        marginVertical: Spacing.lg,
        color: Colors.black,
    },
    equipmentRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
        width: rowWidth,
        marginBottom: Spacing.md,
        marginLeft: "auto",
        marginRight: "auto",
    },
    equipmentItemContainer: {
        width: containerWidth,
        alignItems: "center",
    },
});

export default EquipmentStyles;
