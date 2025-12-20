import { ContainerObj, EquipmentObj, ItemObj } from "../../types/ModelTypes";
import ContainerItem from "./ContainerItem";
import EquipmentItem from "./EquipmentItem";

// Item is a component that displays either an equipment or container object
export default function Item({
  data,
  swapable,
}: {
  data: ItemObj;
  swapable: boolean;
}) {
  return (
    <>
      {data.type === "equipment" ? (
        <EquipmentItem item={data as EquipmentObj} count={data.count} />
      ) : (
        <ContainerItem
          item={data as ContainerObj}
          swapable={swapable}
          count={data.count}
        />
      )}
    </>
  );
}
