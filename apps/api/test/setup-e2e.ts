import { resetDatabase } from './reset-database';

beforeAll(async () => {
  await resetDatabase();
});
