import { supabase } from "../supabase/supabase";
import { generateUUID } from "../utils/UUID";
import { EquipmentRecord, ContainerRecord } from "../../types/db";
import { Equipment, Container } from "../../types/models";

export interface IEquipmentService {
  deleteEquipment(equipment: Equipment): Promise<void>;
  deleteContainer(container: Container): Promise<void>;
  createEquipment(
    quantity: number,
    data: Omit<EquipmentRecord, "id" | "last_updated_date">,
  ): Promise<void>;
  createContainer(
    quantity: number,
    data: Omit<ContainerRecord, "id" | "last_updated_date">,
  ): Promise<void>;
}

export class EquipmentService implements IEquipmentService {
  async deleteEquipment(equipment: Equipment): Promise<void> {
    const ids = equipment.records.map((r) => r.id);
    const { error } = await supabase.from("equipment").delete().in("id", ids);
    if (error) throw error;
  }

  async deleteContainer(container: Container): Promise<void> {
    const { error: conError } = await supabase
      .from("containers")
      .delete()
      .eq("id", container.id);
    if (conError) throw conError;
  }

  async createEquipment(
    quantity: number,
    data: Omit<EquipmentRecord, "id" | "last_updated_date">,
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    const items = Array.from({ length: quantity }).map(() => ({
      id: generateUUID(),
      ...data,
      last_updated_date: timestamp,
    }));

    const { error } = await supabase.from("equipment").insert(items);
    if (error) throw error;
  }

  async createContainer(
    quantity: number,
    data: Omit<ContainerRecord, "id" | "last_updated_date">,
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    const items = Array.from({ length: quantity }).map(() => ({
      id: generateUUID(),
      ...data,
      last_updated_date: timestamp,
    }));

    const { error } = await supabase.from("containers").insert(items);
    if (error) throw error;
  }
}

export const equipmentService = new EquipmentService();
