import { supabase } from "../supabase/supabase";
import { generateUUID } from "../utils/UUID";
import { EquipmentRecord, ContainerRecord } from "../../types/db";
import { Equipment, Container } from "../../types/models";
import { AbstractPowerSyncDatabase } from "@powersync/react-native";
import { Queries } from "../powersync/queries";
import { handleSupabaseError } from "./util";

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
  reassignEquipment(
    db: AbstractPowerSyncDatabase,
    equipment: Equipment,
    targetMemberId: string,
    targetContainerId: string | null,
  ): Promise<void>;
  reassignContainer(
    db: AbstractPowerSyncDatabase,
    container: Container,
    targetMemberId: string,
  ): Promise<void>;
  updateEquipment(
    ids: string[],
    updates: Partial<EquipmentRecord>,
  ): Promise<void>;
  updateContainer(id: string, updates: Partial<ContainerRecord>): Promise<void>;
}

export class EquipmentService implements IEquipmentService {
  async deleteEquipment(equipment: Equipment): Promise<void> {
    const ids = Array.from(equipment.selectedIndices).map(
      (index) => equipment.records[index].id,
    );
    const { error } = await supabase.from("equipment").delete().in("id", ids);
    if (error) handleSupabaseError(error);
  }

  async deleteContainer(container: Container): Promise<void> {
    const { error: conError } = await supabase
      .from("containers")
      .delete()
      .eq("id", container.id);
    if (conError) handleSupabaseError(conError);
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
    if (error) handleSupabaseError(error);
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
    if (error) handleSupabaseError(error);
  }

  async reassignEquipment(
    db: AbstractPowerSyncDatabase,
    equipment: Equipment,
    targetMemberId: string,
    targetContainerId: string | null = null,
  ): Promise<void> {
    const now = new Date().toISOString();
    const selectedRecords = Array.from(equipment.selectedIndices).map(
      (i) => equipment.records[i],
    );

    await db.writeTransaction(async (tx) => {
      for (const record of selectedRecords) {
        await tx.execute(Queries.Equipment.updateAssignment, [
          targetMemberId,
          targetContainerId,
          now,
          record.id,
        ]);
      }
    });
  }

  async reassignContainer(
    db: AbstractPowerSyncDatabase,
    container: Container,
    targetMemberId: string,
  ): Promise<void> {
    const now = new Date().toISOString();
    await db.writeTransaction(async (tx) => {
      // Update container
      await tx.execute(Queries.Container.updateAssignment, [
        targetMemberId,
        now,
        container.id,
      ]);

      // Update all equipment in container
      await tx.execute(Queries.Equipment.updateAssignmentByContainer, [
        targetMemberId,
        now,
        container.id,
      ]);
    });
  }

  async updateEquipment(
    ids: string[],
    updates: Partial<EquipmentRecord>,
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    const data = { ...updates, last_updated_date: timestamp };

    const { data: updated, error } = await supabase
      .from("equipment")
      .update(data)
      .in("id", ids)
      .select();

    if (error) handleSupabaseError(error);
    if (!updated || updated.length !== ids.length) {
      throw new Error("Permission denied or Resource not found.");
    }
  }

  async updateContainer(
    id: string,
    updates: Partial<ContainerRecord>,
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    const data = { ...updates, last_updated_date: timestamp };

    const { data: updated, error } = await supabase
      .from("containers")
      .update(data)
      .eq("id", id)
      .select();

    if (error) handleSupabaseError(error);
    if (!updated || updated.length === 0) {
      throw new Error("Permission denied or Resource not found.");
    }
  }
}

export const equipmentService = new EquipmentService();
