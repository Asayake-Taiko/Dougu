/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateOrganization = /* GraphQL */ `
  subscription OnCreateOrganization(
    $filter: ModelSubscriptionOrganizationFilterInput
  ) {
    onCreateOrganization(filter: $filter) {
      id
      name
      accessCode
      manager
      image
      UserOrStorages {
        nextToken
        startedAt
        __typename
      }
      equipment {
        nextToken
        startedAt
        __typename
      }
      containers {
        nextToken
        startedAt
        __typename
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const onUpdateOrganization = /* GraphQL */ `
  subscription OnUpdateOrganization(
    $filter: ModelSubscriptionOrganizationFilterInput
  ) {
    onUpdateOrganization(filter: $filter) {
      id
      name
      accessCode
      manager
      image
      UserOrStorages {
        nextToken
        startedAt
        __typename
      }
      equipment {
        nextToken
        startedAt
        __typename
      }
      containers {
        nextToken
        startedAt
        __typename
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const onDeleteOrganization = /* GraphQL */ `
  subscription OnDeleteOrganization(
    $filter: ModelSubscriptionOrganizationFilterInput
  ) {
    onDeleteOrganization(filter: $filter) {
      id
      name
      accessCode
      manager
      image
      UserOrStorages {
        nextToken
        startedAt
        __typename
      }
      equipment {
        nextToken
        startedAt
        __typename
      }
      containers {
        nextToken
        startedAt
        __typename
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const onCreateOrgUserStorage = /* GraphQL */ `
  subscription OnCreateOrgUserStorage(
    $filter: ModelSubscriptionOrgUserStorageFilterInput
  ) {
    onCreateOrgUserStorage(filter: $filter) {
      id
      name
      organization {
        id
        name
        accessCode
        manager
        image
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      type
      group
      profile
      user
      equipment {
        nextToken
        startedAt
        __typename
      }
      containers {
        nextToken
        startedAt
        __typename
      }
      details
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      organizationUserOrStoragesId
      __typename
    }
  }
`;
export const onUpdateOrgUserStorage = /* GraphQL */ `
  subscription OnUpdateOrgUserStorage(
    $filter: ModelSubscriptionOrgUserStorageFilterInput
  ) {
    onUpdateOrgUserStorage(filter: $filter) {
      id
      name
      organization {
        id
        name
        accessCode
        manager
        image
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      type
      group
      profile
      user
      equipment {
        nextToken
        startedAt
        __typename
      }
      containers {
        nextToken
        startedAt
        __typename
      }
      details
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      organizationUserOrStoragesId
      __typename
    }
  }
`;
export const onDeleteOrgUserStorage = /* GraphQL */ `
  subscription OnDeleteOrgUserStorage(
    $filter: ModelSubscriptionOrgUserStorageFilterInput
  ) {
    onDeleteOrgUserStorage(filter: $filter) {
      id
      name
      organization {
        id
        name
        accessCode
        manager
        image
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      type
      group
      profile
      user
      equipment {
        nextToken
        startedAt
        __typename
      }
      containers {
        nextToken
        startedAt
        __typename
      }
      details
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      organizationUserOrStoragesId
      __typename
    }
  }
`;
export const onCreateContainer = /* GraphQL */ `
  subscription OnCreateContainer(
    $filter: ModelSubscriptionContainerFilterInput
  ) {
    onCreateContainer(filter: $filter) {
      id
      name
      organization {
        id
        name
        accessCode
        manager
        image
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      lastUpdatedDate
      assignedTo {
        id
        name
        type
        group
        profile
        user
        details
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        organizationUserOrStoragesId
        __typename
      }
      assignedToId
      color
      group
      details
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      organizationContainersId
      orgUserStorageContainersId
      __typename
    }
  }
`;
export const onUpdateContainer = /* GraphQL */ `
  subscription OnUpdateContainer(
    $filter: ModelSubscriptionContainerFilterInput
  ) {
    onUpdateContainer(filter: $filter) {
      id
      name
      organization {
        id
        name
        accessCode
        manager
        image
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      lastUpdatedDate
      assignedTo {
        id
        name
        type
        group
        profile
        user
        details
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        organizationUserOrStoragesId
        __typename
      }
      assignedToId
      color
      group
      details
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      organizationContainersId
      orgUserStorageContainersId
      __typename
    }
  }
`;
export const onDeleteContainer = /* GraphQL */ `
  subscription OnDeleteContainer(
    $filter: ModelSubscriptionContainerFilterInput
  ) {
    onDeleteContainer(filter: $filter) {
      id
      name
      organization {
        id
        name
        accessCode
        manager
        image
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      lastUpdatedDate
      assignedTo {
        id
        name
        type
        group
        profile
        user
        details
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        organizationUserOrStoragesId
        __typename
      }
      assignedToId
      color
      group
      details
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      organizationContainersId
      orgUserStorageContainersId
      __typename
    }
  }
`;
export const onCreateEquipment = /* GraphQL */ `
  subscription OnCreateEquipment(
    $filter: ModelSubscriptionEquipmentFilterInput
  ) {
    onCreateEquipment(filter: $filter) {
      id
      name
      organization {
        id
        name
        accessCode
        manager
        image
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      lastUpdatedDate
      assignedTo {
        id
        name
        type
        group
        profile
        user
        details
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        organizationUserOrStoragesId
        __typename
      }
      assignedToId
      image
      color
      group
      containerId
      details
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      organizationEquipmentId
      orgUserStorageEquipmentId
      __typename
    }
  }
`;
export const onUpdateEquipment = /* GraphQL */ `
  subscription OnUpdateEquipment(
    $filter: ModelSubscriptionEquipmentFilterInput
  ) {
    onUpdateEquipment(filter: $filter) {
      id
      name
      organization {
        id
        name
        accessCode
        manager
        image
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      lastUpdatedDate
      assignedTo {
        id
        name
        type
        group
        profile
        user
        details
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        organizationUserOrStoragesId
        __typename
      }
      assignedToId
      image
      color
      group
      containerId
      details
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      organizationEquipmentId
      orgUserStorageEquipmentId
      __typename
    }
  }
`;
export const onDeleteEquipment = /* GraphQL */ `
  subscription OnDeleteEquipment(
    $filter: ModelSubscriptionEquipmentFilterInput
  ) {
    onDeleteEquipment(filter: $filter) {
      id
      name
      organization {
        id
        name
        accessCode
        manager
        image
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      lastUpdatedDate
      assignedTo {
        id
        name
        type
        group
        profile
        user
        details
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        organizationUserOrStoragesId
        __typename
      }
      assignedToId
      image
      color
      group
      containerId
      details
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      organizationEquipmentId
      orgUserStorageEquipmentId
      __typename
    }
  }
`;
