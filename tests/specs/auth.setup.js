// specs/auth.setup.js
const { test: setup, expect } = require('@playwright/test');
const path = require('path');

const AUTH_FILE = path.join(__dirname, '../.auth/user.json');

setup('authenticate', async ({ page }) => {
  await page.goto('/Identity/Account/Login');
  await page.fill('#Input_Username', process.env.TEST_USERNAME ?? 'admin');
  await page.fill('#Input_Password', process.env.TEST_PASSWORD ?? 'Admin@123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/');
  await page.context().storageState({ path: AUTH_FILE });
});
