import { Item, Equipment, Container } from "../../types/models";
import ContainerItem from "./ContainerItem";
import EquipmentItem from "./EquipmentItem";

// Item is a component that displays either an equipment or container object
export default function ItemComponent({
  data,
  swapable,
  isFloating = false,
}: {
  data: Item;
  swapable: boolean;
  isFloating?: boolean;
}) {
  return (
    <>
      {data.type === "equipment" ? (
        <EquipmentItem item={data as Equipment} isFloating={isFloating} />
      ) : (
        <ContainerItem
          item={data as Container}
          swapable={swapable}
          isFloating={isFloating}
        />
      )}
    </>
  );
}
