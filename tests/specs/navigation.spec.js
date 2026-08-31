const { test, expect } = require('@playwright/test');
const path = require('path');

const AUTH_FILE = path.join(__dirname, '../.auth/user.json');

test.describe('Navigation visibility', () => {
  test('signed-out visitors do not see the application navigation', async ({ page }) => {
    await page.goto('/Identity/Account/Login');

    await expect(page.locator('aside')).toHaveCount(0);
    await expect(page.locator('label[for="sidebar-drawer"]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Users', exact: true })).toHaveCount(0);
  });

  test('standard users see the application navigation without admin links', async ({ page, browser }) => {
    const email = `navigation-user-${Date.now()}@example.com`;

    try {
      await page.goto('/Identity/Account/Register');
      await page.fill('#Input_Email', email);
      await page.fill('#Input_Password', 'Test@123');
      await page.fill('#Input_ConfirmPassword', 'Test@123');
      await page.click('button[type="submit"]');

      await expect(page).toHaveURL('/');
      await expect(page.locator('aside')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Dashboard', exact: true })).toBeVisible();
      await expect(page.getByText('Admin', { exact: true })).toHaveCount(0);
      await expect(page.getByRole('link', { name: 'Users', exact: true })).toHaveCount(0);
    } finally {
      const adminContext = await browser.newContext({
        storageState: AUTH_FILE,
        ignoreHTTPSErrors: true,
      });
      const usersResponse = await adminContext.request.get('https://localhost:5001/Users/Get');
      if (usersResponse.ok()) {
        const users = await usersResponse.json();
        const createdUser = users.find(user => user.email === email);
        if (createdUser) {
          await adminContext.request.post(`https://localhost:5001/Users/Delete?id=${createdUser.id}`);
        }
      }
      await adminContext.close();
    }
  });
});

test.describe('Admin navigation and dark theme', () => {
  test.use({ storageState: AUTH_FILE });

  test('admins see user management', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Admin', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Users', exact: true })).toBeVisible();
  });

  test('dark mode uses neutral black surfaces and clear primary buttons', async ({ page }) => {
    await page.goto('/Customer');
    await page.evaluate(() => localStorage.setItem('theme', 'dark'));
    await page.reload();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await expect.poll(async () => page.evaluate(() => {
      const toRgb = colour => {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const context = canvas.getContext('2d');
        context.fillStyle = colour;
        context.fillRect(0, 0, 1, 1);
        return Array.from(context.getImageData(0, 0, 1, 1).data.slice(0, 3));
      };
      const body = getComputedStyle(document.body);
      const primaryButton = getComputedStyle(document.querySelector('.btn-primary'));
      return {
        body: toRgb(body.backgroundColor),
        button: toRgb(primaryButton.backgroundColor),
        buttonText: toRgb(primaryButton.color),
      };
    })).toEqual({
      body: [10, 10, 10],
      button: [98, 185, 130],
      buttonText: [7, 19, 11],
    });
  });

  test('restores dark mode before the stylesheet finishes loading', async ({ page }) => {
    await page.goto('/Customer');
    await page.evaluate(() => localStorage.setItem('theme', 'dark'));

    await page.route('**/css/output.css*', async route => {
      const response = await route.fetch();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({ response });
    });

    const navigation = page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark', { timeout: 500 });
    await navigation;
  });
});
