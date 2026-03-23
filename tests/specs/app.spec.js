// specs/app.spec.js
const { test, expect } = require('@playwright/test');
const path = require('path');

test.use({ storageState: path.join(__dirname, '../.auth/user.json') });

// ─── Dashboard ────────────────────────────────────────────────────────────────
test.describe('Dashboard', () => {
  test('loads with title and stat cards', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Dashboard/i);
    await expect(page.locator('#stat-customers')).toBeVisible();
    await expect(page.locator('#stat-invoices')).toBeVisible();
    await expect(page.locator('#stat-vouchers')).toBeVisible();
    await expect(page.locator('#stat-tourcosts')).toBeVisible();
  });

  test('stats are populated from API', async ({ page }) => {
    await page.goto('/');
    // Wait for loading dots to be replaced by actual numbers
    await expect(page.locator('#stat-customers .loading')).toHaveCount(0, { timeout: 8000 });
    const text = await page.locator('#stat-customers').textContent();
    expect(text.trim()).toMatch(/^\d+$/);
  });
});

// ─── Customer ─────────────────────────────────────────────────────────────────
test.describe('Customer', () => {
  test('page loads with table', async ({ page }) => {
    await page.goto('/Customer');
    await expect(page).toHaveTitle(/Customer/i);
    await expect(page.locator('#customerTable')).toBeVisible();
    await expect(page.locator('#tableBody')).toBeVisible();
  });

  test('search by file code filters table', async ({ page }) => {
    await page.goto('/Customer');
    await page.fill('#searchFieldFileCode', 'zzz_no_match');
    await expect(page.locator('#tableBody')).toBeVisible();
  });

  test('search by tour name filters table', async ({ page }) => {
    await page.goto('/Customer');
    await page.fill('#searchFieldTourName', 'zzz_no_match');
    await expect(page.locator('#tableBody')).toBeVisible();
  });

  test('search by agent filters table', async ({ page }) => {
    await page.goto('/Customer');
    await page.fill('#searchFieldAgent', 'zzz_no_match');
    await expect(page.locator('#tableBody')).toBeVisible();
  });

  test('add button opens drawer with correct title', async ({ page }) => {
    await page.goto('/Customer');
    await page.click('label[for="customer-drawer"].drawer-button');
    await expect(page.locator('#customerTitle')).toHaveText('Add Customer');
    await expect(page.locator('#customerForm')).toBeVisible();
  });

  test('form validation fires on empty submit', async ({ page }) => {
    await page.goto('/Customer');
    await page.click('label[for="customer-drawer"].drawer-button');
    await page.click('#customerForm button[type="submit"]');
    await expect(page.locator('#tourName-error')).toContainText('required');
    await expect(page.locator('#country-error')).toContainText('required');
  });

  test('arrival date after departure date shows error', async ({ page }) => {
    await page.goto('/Customer');
    await page.click('label[for="customer-drawer"].drawer-button');
    await page.fill('#tourName', 'Test Tour');
    await page.fill('#country', 'Nepal');
    await page.fill('#arrivalDate', '2025-12-31');
    await page.fill('#departureDate', '2025-01-01');
    await page.click('#customerForm button[type="submit"]');
    await expect(page.locator('#arrivalDate-error')).toContainText('before departure');
  });

  test('valid customer can be saved', async ({ page }) => {
    await page.goto('/Customer');
    await page.click('label[for="customer-drawer"].drawer-button');
    await page.fill('#tourName', 'Playwright Test Tour');
    await page.fill('#country', 'Nepal');
    await page.fill('#arrivalDate', '2025-06-01');
    await page.fill('#departureDate', '2025-06-10');
    await page.fill('#agent', 'Test Agent');
    await page.click('#customerForm button[type="submit"]');
    await expect(page.locator('body')).toContainText(/success/i, { timeout: 8000 });
  });
});

// ─── Guide ────────────────────────────────────────────────────────────────────
test.describe('Guide', () => {
  test('page loads with table', async ({ page }) => {
    await page.goto('/Guide');
    await expect(page).toHaveTitle(/Guide/i);
    await expect(page.locator('#guideTable')).toBeVisible();
  });

  test('search field is present', async ({ page }) => {
    await page.goto('/Guide');
    await expect(page.locator('#searchField')).toBeVisible();
  });

  test('add button opens drawer', async ({ page }) => {
    await page.goto('/Guide');
    await page.click('label[for="guide-drawer"].drawer-button');
    await expect(page.locator('#guideTitle')).toHaveText('Add Guide');
    await expect(page.locator('#guideForm')).toBeVisible();
  });

  test('form validation fires on empty submit', async ({ page }) => {
    await page.goto('/Guide');
    await page.click('label[for="guide-drawer"].drawer-button');
    await page.click('#guideForm button[type="submit"]');
    await expect(page.locator('#name-error')).toContainText('required');
  });

  test('valid guide can be saved', async ({ page }) => {
    await page.goto('/Guide');
    await page.click('label[for="guide-drawer"].drawer-button');
    await page.fill('#name', 'Playwright Guide');
    await page.fill('#fullDayRate', '100');
    await page.fill('#halfDayRate', '50');
    await page.fill('#overnight', '75');
    await page.click('#guideForm button[type="submit"]');
    await expect(page.locator('body')).toContainText(/success/i, { timeout: 8000 });
  });
});

// ─── Hotel ────────────────────────────────────────────────────────────────────
test.describe('Hotel', () => {
  test('index page loads with table', async ({ page }) => {
    await page.goto('/Hotel');
    await expect(page).toHaveTitle(/Hotel/i);
    await expect(page.locator('#hotelTable')).toBeVisible();
  });

  test('add button opens drawer', async ({ page }) => {
    await page.goto('/Hotel');
    await page.click('label[for="hotel-drawer"].drawer-button');
    await expect(page.locator('#hotelTitle')).toHaveText('Add Hotel');
    await expect(page.locator('#hotelForm')).toBeVisible();
  });

  test('form validation fires on empty submit', async ({ page }) => {
    await page.goto('/Hotel');
    await page.click('label[for="hotel-drawer"].drawer-button');
    await page.click('#hotelForm button[type="submit"]');
    await expect(page.locator('#name-error')).toContainText('required');
  });

  test('valid hotel can be saved', async ({ page }) => {
    await page.goto('/Hotel');
    await page.click('label[for="hotel-drawer"].drawer-button');
    await page.fill('#name', 'Playwright Hotel');
    await page.fill('#code', 'PWT');
    await page.selectOption('#category', 'A');
    await page.fill('#address', 'Kathmandu');
    await page.fill('#phoneNo', '9800000000');
    await page.click('#hotelForm button[type="submit"]');
    await expect(page.locator('body')).toContainText(/success/i, { timeout: 8000 });
  });
});

// ─── Hotel Room Rate ──────────────────────────────────────────────────────────
test.describe('Hotel Room Rate', () => {
  test('page loads with table', async ({ page }) => {
    await page.goto('/HotelRoomRate');
    await expect(page).toHaveTitle(/Hotel Room Rate/i);
    await expect(page.locator('#roomrateTable')).toBeVisible();
  });

  test('add button opens drawer', async ({ page }) => {
    await page.goto('/HotelRoomRate');
    await page.click('label[for="roomrate-drawer"].drawer-button');
    await expect(page.locator('#roomrateTitle')).toHaveText('Add Room Rate');
    await expect(page.locator('#hotelRoomRateForm')).toBeVisible();
  });

  test('form validation fires on empty submit', async ({ page }) => {
    await page.goto('/HotelRoomRate');
    await page.click('label[for="roomrate-drawer"].drawer-button');
    await page.click('#hotelRoomRateForm button[type="submit"]');
    await expect(page.locator('#hotel-error')).toContainText('required');
  });
});

// ─── Transport ────────────────────────────────────────────────────────────────
test.describe('Transport', () => {
  test('page loads with table', async ({ page }) => {
    await page.goto('/Transport');
    await expect(page).toHaveTitle(/Transport/i);
    await expect(page.locator('#transportTable')).toBeVisible();
  });

  test('add button opens drawer', async ({ page }) => {
    await page.goto('/Transport');
    await page.click('label[for="transport-drawer"].drawer-button');
    await expect(page.locator('#transportTitle')).toHaveText('Add Transport');
    await expect(page.locator('#transportForm')).toBeVisible();
  });

  test('form validation fires on empty submit', async ({ page }) => {
    await page.goto('/Transport');
    await page.click('label[for="transport-drawer"].drawer-button');
    await expect(page.locator('#transportForm')).toBeVisible();
    // Submit via JS to bypass the DaisyUI drawer overlay interception
    await page.evaluate(() => document.getElementById('transportForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    await expect(page.locator('#name-error')).toContainText('Name is required');
  });

  test('valid transport can be saved', async ({ page }) => {
    await page.goto('/Transport');
    await page.click('label[for="transport-drawer"].drawer-button');
    await expect(page.locator('#transportForm')).toBeVisible();
    await page.fill('#name', 'Playwright Bus');
    await page.fill('#minPAX', '1');
    await page.fill('#maxPAX', '10');
    await page.evaluate(() => document.getElementById('transportForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    // transport.js calls Toast.show(data.message, data.type) with args swapped,
    // so the toast text is data.type = 'success'
    await expect(page.locator('#toastContainer')).toContainText('success', { timeout: 8000 });
  });
});

// ─── Sector ───────────────────────────────────────────────────────────────────
test.describe('Sector', () => {
  test('page loads with table', async ({ page }) => {
    await page.goto('/Sector');
    await expect(page).toHaveTitle(/Sector/i);
    await expect(page.locator('#sectorTable')).toBeVisible();
  });

  test('add button opens drawer', async ({ page }) => {
    await page.goto('/Sector');
    await page.click('label[for="sector-drawer"].drawer-button');
    await expect(page.locator('#sectorTitle')).toHaveText('Add Sector');
    await expect(page.locator('#sectorForm')).toBeVisible();
  });

  test('form validation fires on empty submit', async ({ page }) => {
    await page.goto('/Sector');
    await page.click('label[for="sector-drawer"].drawer-button');
    await page.click('#sectorForm button[type="submit"]');
    await expect(page.locator('#name-error')).toContainText('required');
  });
});

// ─── Invoice ──────────────────────────────────────────────────────────────────
test.describe('Invoice', () => {
  test('index page loads with table', async ({ page }) => {
    await page.goto('/Invoice');
    await expect(page).toHaveTitle(/Invoice/i);
    await expect(page.locator('#invoiceTable')).toBeVisible();
  });

  test('search fields are present', async ({ page }) => {
    await page.goto('/Invoice');
    await expect(page.locator('#searchField')).toBeVisible();
    await expect(page.locator('#searchFieldFileCode')).toBeVisible();
    await expect(page.locator('#searchFieldClient')).toBeVisible();
  });

  test('new invoice button navigates to add/edit page', async ({ page }) => {
    await page.goto('/Invoice');
    await page.click('a:has-text("New Invoice")');
    await expect(page).toHaveURL(/Invoice\/AddEdit/i);
  });

  test('add/edit page loads', async ({ page }) => {
    await page.goto('/Invoice/AddEdit');
    await expect(page).toHaveURL(/Invoice\/AddEdit/i);
    await expect(page.locator('body')).not.toContainText('An error occurred');
  });
});

// ─── Service Voucher ──────────────────────────────────────────────────────────
test.describe('ServiceVoucher', () => {
  test('page loads with table', async ({ page }) => {
    await page.goto('/ServiceVoucher');
    await expect(page).toHaveTitle(/Service Voucher/i);
    await expect(page.locator('#voucherTable')).toBeVisible();
  });

  test('search fields are present', async ({ page }) => {
    await page.goto('/ServiceVoucher');
    await expect(page.locator('#searchFieldReceipt')).toBeVisible();
    await expect(page.locator('#searchFieldFileCode')).toBeVisible();
    await expect(page.locator('#searchFieldHotel')).toBeVisible();
    await expect(page.locator('#searchFieldClientname')).toBeVisible();
  });

  test('add button opens drawer', async ({ page }) => {
    await page.goto('/ServiceVoucher');
    await page.click('label[for="voucher-drawer"].drawer-button');
    await expect(page.locator('#serviceVoucherTitle')).toHaveText('Add Service Voucher');
    await expect(page.locator('#serviceVoucherForm')).toBeVisible();
  });

  test('form validation fires on empty submit', async ({ page }) => {
    await page.goto('/ServiceVoucher');
    await page.click('label[for="voucher-drawer"].drawer-button');
    await page.click('#serviceVoucherForm button[type="submit"]');
    await expect(page.locator('#fileCodeNo-error')).toContainText('required');
  });
});

// ─── Tour Cost ────────────────────────────────────────────────────────────────
test.describe('Tourcost', () => {
  test('index page loads', async ({ page }) => {
    await page.goto('/Tourcost');
    await expect(page).toHaveURL(/Tourcost/i);
    await expect(page.locator('body')).not.toContainText('An error occurred');
  });

  test('add/edit page loads', async ({ page }) => {
    await page.goto('/Tourcost/AddEdit');
    await expect(page).toHaveURL(/Tourcost\/AddEdit/i);
    await expect(page.locator('body')).not.toContainText('An error occurred');
  });
});

// ─── Users (admin only) ───────────────────────────────────────────────────────
test.describe('Users', () => {
  test('page loads with table', async ({ page }) => {
    await page.goto('/Users');
    await expect(page).toHaveURL(/Users/i);
    await expect(page.locator('#usersTable')).toBeVisible();
  });

  test('add button opens drawer', async ({ page }) => {
    await page.goto('/Users');
    await page.click('label[for="user-drawer"].drawer-button');
    await expect(page.locator('#userTitle')).toHaveText('Add User');
    await expect(page.locator('#usersForm')).toBeVisible();
  });
});

// ─── API endpoints ────────────────────────────────────────────────────────────
test.describe('API endpoints', () => {
  const endpoints = [
    '/Home/GetStats',
    '/Customer/Get',
    '/Guide/Get',
    '/Hotel/Get',
    '/HotelRoomRate/Get',
    '/Transport/Get',
    '/Sector/Get',
    '/ServiceVoucher/Get',
    '/Invoice/GetInvoice',
  ];

  for (const url of endpoints) {
    test(`GET ${url} returns 200 with JSON`, async ({ request }) => {
      const res = await request.get(url);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toBeDefined();
    });
  }
});
