import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled, AsyncCollection, AsyncItem } from "@aws-amplify/datastore";

export enum UserOrStorage {
  USER = "USER",
  STORAGE = "STORAGE"
}



type EagerOrganization = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Organization, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly accessCode: string;
  readonly manager: string;
  readonly image: string;
  readonly UserOrStorages?: (OrgUserStorage | null)[] | null;
  readonly equipment?: (Equipment | null)[] | null;
  readonly containers?: (Container | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyOrganization = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Organization, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly accessCode: string;
  readonly manager: string;
  readonly image: string;
  readonly UserOrStorages: AsyncCollection<OrgUserStorage>;
  readonly equipment: AsyncCollection<Equipment>;
  readonly containers: AsyncCollection<Container>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Organization = LazyLoading extends LazyLoadingDisabled ? EagerOrganization : LazyOrganization

export declare const Organization: (new (init: ModelInit<Organization>) => Organization) & {
  copyOf(source: Organization, mutator: (draft: MutableModel<Organization>) => MutableModel<Organization> | void): Organization;
}

type EagerOrgUserStorage = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<OrgUserStorage, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly organization: Organization;
  readonly type: UserOrStorage | keyof typeof UserOrStorage;
  readonly group: string;
  readonly profile: string;
  readonly user?: string | null;
  readonly equipment?: (Equipment | null)[] | null;
  readonly containers?: (Container | null)[] | null;
  readonly details?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly organizationUserOrStoragesId?: string | null;
}

type LazyOrgUserStorage = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<OrgUserStorage, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly organization: AsyncItem<Organization>;
  readonly type: UserOrStorage | keyof typeof UserOrStorage;
  readonly group: string;
  readonly profile: string;
  readonly user?: string | null;
  readonly equipment: AsyncCollection<Equipment>;
  readonly containers: AsyncCollection<Container>;
  readonly details?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly organizationUserOrStoragesId?: string | null;
}

export declare type OrgUserStorage = LazyLoading extends LazyLoadingDisabled ? EagerOrgUserStorage : LazyOrgUserStorage

export declare const OrgUserStorage: (new (init: ModelInit<OrgUserStorage>) => OrgUserStorage) & {
  copyOf(source: OrgUserStorage, mutator: (draft: MutableModel<OrgUserStorage>) => MutableModel<OrgUserStorage> | void): OrgUserStorage;
}

type EagerContainer = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Container, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly organization: Organization;
  readonly lastUpdatedDate: string;
  readonly assignedTo: OrgUserStorage;
  readonly assignedToId: string;
  readonly color: string;
  readonly group: string;
  readonly details?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly organizationContainersId?: string | null;
  readonly orgUserStorageContainersId?: string | null;
}

type LazyContainer = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Container, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly organization: AsyncItem<Organization>;
  readonly lastUpdatedDate: string;
  readonly assignedTo: AsyncItem<OrgUserStorage>;
  readonly assignedToId: string;
  readonly color: string;
  readonly group: string;
  readonly details?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly organizationContainersId?: string | null;
  readonly orgUserStorageContainersId?: string | null;
}

export declare type Container = LazyLoading extends LazyLoadingDisabled ? EagerContainer : LazyContainer

export declare const Container: (new (init: ModelInit<Container>) => Container) & {
  copyOf(source: Container, mutator: (draft: MutableModel<Container>) => MutableModel<Container> | void): Container;
}

type EagerEquipment = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Equipment, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly organization: Organization;
  readonly lastUpdatedDate: string;
  readonly assignedTo: OrgUserStorage;
  readonly assignedToId: string;
  readonly image: string;
  readonly color: string;
  readonly group: string;
  readonly containerId?: string | null;
  readonly details?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly organizationEquipmentId?: string | null;
  readonly orgUserStorageEquipmentId?: string | null;
}

type LazyEquipment = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Equipment, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly organization: AsyncItem<Organization>;
  readonly lastUpdatedDate: string;
  readonly assignedTo: AsyncItem<OrgUserStorage>;
  readonly assignedToId: string;
  readonly image: string;
  readonly color: string;
  readonly group: string;
  readonly containerId?: string | null;
  readonly details?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly organizationEquipmentId?: string | null;
  readonly orgUserStorageEquipmentId?: string | null;
}

export declare type Equipment = LazyLoading extends LazyLoadingDisabled ? EagerEquipment : LazyEquipment

export declare const Equipment: (new (init: ModelInit<Equipment>) => Equipment) & {
  copyOf(source: Equipment, mutator: (draft: MutableModel<Equipment>) => MutableModel<Equipment> | void): Equipment;
}