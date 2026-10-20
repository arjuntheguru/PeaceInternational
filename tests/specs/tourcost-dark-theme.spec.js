const { test, expect } = require('@playwright/test');
const path = require('path');

test.use({ storageState: path.join(__dirname, '../.auth/user.json') });

test('tour cost details use readable white text on dark surfaces', async ({ page }) => {
  await page.goto('/Tourcost');
  const viewHref = await page.locator('a[title="View"]').first().getAttribute('href');
  expect(viewHref).toBeTruthy();

  await page.evaluate(() => localStorage.setItem('theme', 'dark'));
  await page.goto(viewHref);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('#tourcostTemplate table td').first()).toBeVisible();
  await expect(page.locator('#pppTemplate .card').first()).toBeVisible();

  const colours = await page.evaluate(() => {
    const rgb = element => getComputedStyle(element).color;
    return {
      detailText: rgb(document.querySelector('#tourcostTemplate table td')),
      sectionHeading: rgb(document.querySelector('#pppTemplate .h5')),
      pricingSurface: getComputedStyle(document.querySelector('#pppTemplate .card')).backgroundColor,
    };
  });

  expect(colours).toEqual({
    detailText: 'rgb(255, 255, 255)',
    sectionHeading: 'rgb(255, 255, 255)',
    pricingSurface: 'rgb(32, 32, 32)',
  });
});
