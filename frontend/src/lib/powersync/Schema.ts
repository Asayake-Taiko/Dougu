import { column, Schema, Table } from "@powersync/react-native";

/**
 * Very simple initial schema for PowerSync.
 */
export const AppSchema = new Schema({
  users: new Table({
    email: column.text,
    full_name: column.text,
    profile: column.text,
    created_at: column.text,
    updated_at: column.text,
  }),
  organizations: new Table({
    name: column.text,
    access_code: column.text,
    manager_id: column.text,
    image: column.text,
    created_at: column.text,
  }),
  org_memberships: new Table({
    organization_id: column.text,
    type: column.text,
    user_id: column.text,
    storage_name: column.text,
    group_name: column.text,
    profile: column.text,
    details: column.text,
  }),
  containers: new Table({
    name: column.text,
    organization_id: column.text,
    assigned_to: column.text,
    color: column.text,
    group_name: column.text,
    details: column.text,
    last_updated_date: column.text,
  }),
  equipment: new Table({
    name: column.text,
    organization_id: column.text,
    assigned_to: column.text,
    container_id: column.text,
    image: column.text,
    color: column.text,
    group_name: column.text,
    details: column.text,
    last_updated_date: column.text,
  }),
});

export type Database = (typeof AppSchema)["types"];
