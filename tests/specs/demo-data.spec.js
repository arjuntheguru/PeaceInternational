const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.use({ storageState: path.join(__dirname, '../.auth/user.json') });

test('demo seeding is enabled with the configured password in every environment', () => {
  const appDirectory = path.resolve(__dirname, '../../PeaceInternational');
  const productionSettings = JSON.parse(fs.readFileSync(path.join(appDirectory, 'appsettings.json')));
  const developmentSettings = JSON.parse(fs.readFileSync(path.join(appDirectory, 'appsettings.Development.json')));

  expect(productionSettings.DemoData.Enabled).toBe(true);
  expect(productionSettings.DemoData.UserPassword).toBe('Demo@123');
  expect(developmentSettings.DemoData.Enabled).toBe(true);
  expect(developmentSettings.DemoData.UserPassword).toBe('Demo@123');
});

test('development demo seed populates every application area', async ({ page, request }) => {
  const endpoints = [
    { url: '/Customer/Get', minimum: 24, key: 'fileCodeNo', value: '8384/0001' },
    { url: '/Hotel/Get', minimum: 18, key: 'code', value: 'ORJ' },
    { url: '/HotelRoomRate/Get', minimum: 18, key: 'hotel.code', value: 'ORJ' },
    { url: '/Guide/Get', minimum: 15, key: 'name', value: 'Youssef Ibrahim' },
    { url: '/Transport/Get', minimum: 6, key: 'name', value: 'T1' },
    { url: '/Sector/Get', minimum: 24, key: 'code', value: 'TLV-JRS' },
    { url: '/ServiceVoucher/Get', minimum: 18, key: 'exchangeOrderNo', value: '8384/0001' },
    { url: '/Invoice/GetInvoice', minimum: 18, key: 'invoiceNo', value: '8384/0001' },
    { url: '/Users/Get', minimum: 9, key: 'userName', value: 'operations.demo' },
  ];

  for (const endpoint of endpoints) {
    const response = await request.get(endpoint.url);
    expect(response.ok(), endpoint.url).toBeTruthy();
    const records = await response.json();
    expect(records.length, endpoint.url).toBeGreaterThanOrEqual(endpoint.minimum);

    const getValue = record => endpoint.key
      .split('.')
      .reduce((value, part) => value?.[part], record);
    expect(records.some(record => getValue(record) === endpoint.value), endpoint.url).toBeTruthy();
  }

  const statsResponse = await request.get('/Home/GetStats');
  expect(statsResponse.ok()).toBeTruthy();
  const stats = await statsResponse.json();
  expect(stats.customers).toBeGreaterThanOrEqual(24);
  expect(stats.invoices).toBeGreaterThanOrEqual(18);
  expect(stats.vouchers).toBeGreaterThanOrEqual(18);
  expect(stats.tourcosts).toBeGreaterThanOrEqual(12);

  await page.goto('/Customer');
  const countryBadge = page.getByText('United Kingdom', { exact: true });
  await expect(countryBadge).toBeVisible();
  const countryTextFitsPill = await countryBadge.evaluate(element => {
    element.style.width = '4.5rem';
    const pill = element.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(element);
    const text = range.getBoundingClientRect();
    return text.top >= pill.top - 1
      && text.right <= pill.right + 1
      && text.bottom <= pill.bottom + 1
      && text.left >= pill.left - 1;
  });
  expect(countryTextFitsPill).toBeTruthy();

  const firstCustomerRow = page.locator('#tableBody tr').first();
  const firstCustomerFileCode = (await firstCustomerRow.locator('td').first().textContent()).trim();
  await firstCustomerRow.locator('button[title="View"]').click();
  await expect(page.locator('#customer-drawer')).toBeChecked();
  await expect(page.locator('#customerTitle')).toHaveText('View Customer');
  await expect(page.locator('#fileCodeNo')).toHaveValue(firstCustomerFileCode);
  await expect(page.locator('#tourName')).toHaveAttribute('readonly', '');
  await expect(page.locator('#btnSave')).toBeHidden();
  await page.locator('#customerCloseLabel').click();
  await expect(page.locator('#customer-drawer')).not.toBeChecked();

  await firstCustomerRow.locator('button[title="Edit"]').click();
  await expect(page.locator('#customerTitle')).toHaveText('Edit Customer');
  await expect(page.locator('#tourName')).not.toHaveAttribute('readonly', '');
  await expect(page.locator('#btnSave')).toBeVisible();
  await page.locator('#customerCloseLabel').click();

  const assertBackgroundCoversLongPage = async () => {
    const layout = await page.evaluate(() => ({
      viewportHeight: window.innerHeight,
      documentHeight: document.documentElement.scrollHeight,
      bodyHeight: document.body.getBoundingClientRect().height,
      contentHeight: document.querySelector('.drawer-content').getBoundingClientRect().height,
      htmlBackground: getComputedStyle(document.documentElement).backgroundColor,
      bodyBackground: getComputedStyle(document.body).backgroundColor,
      contentBackground: getComputedStyle(document.querySelector('.drawer-content')).backgroundColor,
    }));

    expect(layout.documentHeight).toBeGreaterThan(layout.viewportHeight);
    expect(layout.bodyHeight).toBeGreaterThanOrEqual(layout.documentHeight - 1);
    expect(layout.contentHeight).toBeGreaterThanOrEqual(layout.documentHeight - 1);
    expect(layout.htmlBackground).toBe(layout.bodyBackground);
    expect(layout.contentBackground).toBe(layout.bodyBackground);
  };

  await assertBackgroundCoversLongPage();
  await page.evaluate(() => localStorage.setItem('theme', 'dark'));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('#tableBody tr')).toHaveCount(24);
  await assertBackgroundCoversLongPage();

  await page.goto('/Tourcost');
  await expect(page.getByText('Cedar Travel Group - Heritage', { exact: true })).toBeVisible();
  await expect(page.getByText('Emerald Faith Travel - Easter', { exact: true })).toBeVisible();

  const viewLinks = await page.locator('a[title="View"]').evaluateAll(links => links.map(link => link.href));
  expect(viewLinks.length).toBeGreaterThanOrEqual(12);
  for (const link of viewLinks) {
    const response = await page.goto(link);
    expect(response.status(), link).toBe(200);
    await expect(page.locator('body')).not.toContainText('An unhandled exception occurred');
    await expect(page.locator('#tourcostTemplate .alert-error')).toHaveCount(0);
  }
});
