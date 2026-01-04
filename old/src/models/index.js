// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const UserOrStorage = {
  "USER": "USER",
  "STORAGE": "STORAGE"
};

const { Organization, OrgUserStorage, Container, Equipment } = initSchema(schema);

export {
  Organization,
  OrgUserStorage,
  Container,
  Equipment,
  UserOrStorage
};