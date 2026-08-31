const { test, expect } = require('@playwright/test');
const path = require('path');

test.use({ storageState: path.join(__dirname, '../.auth/user.json') });

test('tour cost print buttons isolate their section and fit every table column', async ({ page }) => {
  await page.goto('/Tourcost');
  const viewHref = await page.locator('a[title="View"]').first().getAttribute('href');
  expect(viewHref).toBeTruthy();

  await page.goto(viewHref);
  await expect(page.locator('#tourcostTemplate table').first()).toBeVisible();
  await expect(page.locator('#pppTemplate table').first()).toBeVisible();

  await page.evaluate(() => {
    window.print = () => {};
  });

  const printCases = [
    {
      button: '#printTourcost',
      bodyClass: 'printing-tourcost',
      visibleSection: '#tourcostPrintSection',
      hiddenSection: '#pppPrintSection',
      table: '#tourcostTemplate table',
    },
    {
      button: '#printPPPcost',
      bodyClass: 'printing-ppp',
      visibleSection: '#pppPrintSection',
      hiddenSection: '#tourcostPrintSection',
      table: '#pppTemplate table',
    },
  ];

  for (const printCase of printCases) {
    await page.locator(printCase.button).click();
    await page.emulateMedia({ media: 'print' });

    await expect(page.locator('body')).toHaveClass(new RegExp(printCase.bodyClass));
    await expect(page.locator('header')).toBeHidden();
    await expect(page.locator('.drawer-side')).toBeHidden();
    await expect(page.locator('footer')).toBeHidden();
    await expect(page.locator(printCase.visibleSection)).toBeVisible();
    await expect(page.locator(printCase.hiddenSection)).toBeHidden();

    const tableBounds = await page.locator(printCase.table).first().evaluate(table => {
      const bounds = table.getBoundingClientRect();
      return {
        left: bounds.left,
        right: bounds.right,
        viewportWidth: window.innerWidth,
        clientWidth: table.clientWidth,
        scrollWidth: table.scrollWidth,
      };
    });

    expect(tableBounds.left).toBeGreaterThanOrEqual(0);
    expect(tableBounds.right).toBeLessThanOrEqual(tableBounds.viewportWidth);
    expect(tableBounds.scrollWidth).toBeLessThanOrEqual(tableBounds.clientWidth + 1);

    await page.emulateMedia({ media: 'screen' });
    await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    await expect(page.locator('body')).not.toHaveClass(/printing-(tourcost|ppp)/);
  }
});
