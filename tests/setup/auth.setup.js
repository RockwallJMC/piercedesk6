import { test as setup } from '@playwright/test';
import { loginAsOrgUser, TEST_ORGS } from '../helpers/multi-tenant-setup.js';

const authFile = 'tests/.auth/user.json';

setup('authenticate as sales manager', async ({ page }) => {
  // Login as Acme Corporation admin user
  await loginAsOrgUser(page, 'ACME', 'admin');
  await page.context().storageState({ path: authFile });
});
