import { Item, Equipment, Container } from "../../types/models";
import ContainerItem from "./ContainerItem";
import EquipmentItem from "./EquipmentItem";

// Item is a component that displays either an equipment or container object
export default function ItemComponent({
  data,
  isFloating = false,
  draggingItem,
}: {
  data: Item;
  isFloating?: boolean;
  draggingItem?: Item | null;
}) {
  return (
    <>
      {data.type === "equipment" ? (
        <EquipmentItem
          item={data as Equipment}
          isFloating={isFloating}
          draggingItem={draggingItem}
        />
      ) : (
        <ContainerItem
          item={data as Container}
          isFloating={isFloating}
          draggingItem={draggingItem}
        />
      )}
    </>
  );
}
