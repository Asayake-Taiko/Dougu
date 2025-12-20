/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getOrganization = /* GraphQL */ `
  query GetOrganization($id: ID!) {
    getOrganization(id: $id) {
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
export const listOrganizations = /* GraphQL */ `
  query ListOrganizations(
    $filter: ModelOrganizationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listOrganizations(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncOrganizations = /* GraphQL */ `
  query SyncOrganizations(
    $filter: ModelOrganizationFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncOrganizations(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getOrgUserStorage = /* GraphQL */ `
  query GetOrgUserStorage($id: ID!) {
    getOrgUserStorage(id: $id) {
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
export const listOrgUserStorages = /* GraphQL */ `
  query ListOrgUserStorages(
    $filter: ModelOrgUserStorageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listOrgUserStorages(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncOrgUserStorages = /* GraphQL */ `
  query SyncOrgUserStorages(
    $filter: ModelOrgUserStorageFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncOrgUserStorages(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getContainer = /* GraphQL */ `
  query GetContainer($id: ID!) {
    getContainer(id: $id) {
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
export const listContainers = /* GraphQL */ `
  query ListContainers(
    $filter: ModelContainerFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listContainers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        lastUpdatedDate
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncContainers = /* GraphQL */ `
  query SyncContainers(
    $filter: ModelContainerFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncContainers(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        name
        lastUpdatedDate
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getEquipment = /* GraphQL */ `
  query GetEquipment($id: ID!) {
    getEquipment(id: $id) {
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
export const listEquipment = /* GraphQL */ `
  query ListEquipment(
    $filter: ModelEquipmentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listEquipment(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        lastUpdatedDate
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncEquipment = /* GraphQL */ `
  query SyncEquipment(
    $filter: ModelEquipmentFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncEquipment(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        name
        lastUpdatedDate
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
      nextToken
      startedAt
      __typename
    }
  }
`;
