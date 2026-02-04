import { Equipment, Container, OrgMembership } from "./models";

// equipment item background colors should be Hex
export type Hex = `#${string}`;

export type Item = Equipment | Container;

export interface OrgOwnership {
  membership: OrgMembership;
  items: Item[];
}

// the type of an iamge
export type DisplayType = "User" | "Org" | "Item";
