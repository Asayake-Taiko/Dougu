import {
    UserRecord,
    OrganizationRecord,
    OrgMembershipRecord,
    ContainerRecord,
    EquipmentRecord
} from '../../types/db';

export const MOCK_USERS: UserRecord[] = [{
    id: '123',
    email: 'johndoe@example.com',
    full_name: 'John Doe',
    profile: 'default',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
}, {
    id: '124',
    email: 'janesmith@example.com',
    full_name: 'Jane Smith',
    profile: 'jiji',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
}, {
    id: '125',
    email: 'e@gmail.com',
    full_name: 'Test User',
    profile: 'saitama',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
}];

export const MOCK_ORGS: OrganizationRecord[] = [{
    id: 'dev-org-id',
    name: 'Asa',
    access_code: 'DEV123',
    manager_id: '123',
    image: 'default',
    created_at: new Date().toISOString(),
}];

export const MOCK_MEMBERSHIPS: OrgMembershipRecord[] = [{
    id: 'dev-membership-id-123',
    organization_id: 'dev-org-id',
    type: 'USER',
    user_id: '123',
    group_name: 'Asa',
    profile: 'default',
    details: 'Primary developer account',
}, {
    id: 'dev-membership-id-125',
    organization_id: 'dev-org-id',
    type: 'USER',
    user_id: '125',
    group_name: 'Asa',
    profile: 'default',
    details: 'Secondary developer account',
}];

export const MOCK_CONTAINERS: ContainerRecord[] = [{
    id: 'dev-container-id',
    name: 'Toolbox A',
    organization_id: 'dev-org-id',
    assigned_to: 'dev-membership-id-123',
    color: '#FF5733',
    group_name: 'Asa',
    details: 'Located in the main storage room',
    last_updated_date: new Date().toISOString(),
}];

export const MOCK_EQUIPMENT: EquipmentRecord[] = [{
    id: 'dev-equipment-id',
    name: 'Multimeter',
    organization_id: 'dev-org-id',
    assigned_to: 'dev-membership-id-123',
    container_id: 'dev-container-id',
    image: 'default',
    color: '#33C1FF',
    group_name: 'Asa',
    details: 'Multimeter',
    last_updated_date: new Date().toISOString(),
}, {
    id: 'dev-equipment-id-2',
    name: 'Screwdriver',
    organization_id: 'dev-org-id',
    assigned_to: 'dev-membership-id-123',
    image: 'bachi',
    color: '#e876ffff',
    group_name: 'Asa',
    details: 'Bachi Stuff',
    last_updated_date: new Date().toISOString(),
}, {
    id: 'dev-equipment-id-3',
    name: 'chu',
    organization_id: 'dev-org-id',
    assigned_to: 'dev-membership-id-123',
    image: 'chu',
    color: '#bfd17fff',
    group_name: 'Asa',
    details: 'Chu Stuff',
    last_updated_date: new Date().toISOString(),
}, {
    id: 'dev-equipment-id-4',
    name: 'shime',
    organization_id: 'dev-org-id',
    assigned_to: 'dev-membership-id-123',
    image: 'shime',
    color: '#60ada1ff',
    group_name: 'Asa',
    details: 'Shime Stuff',
    last_updated_date: new Date().toISOString(),
}, {
    id: 'dev-equipment-id-5',
    name: 'chappa',
    organization_id: 'dev-org-id',
    assigned_to: 'dev-membership-id-123',
    image: 'chappa',
    color: '#f56f6fff',
    group_name: 'Asa',
    details: 'Chappa Stuff',
    last_updated_date: new Date().toISOString(),
}];

