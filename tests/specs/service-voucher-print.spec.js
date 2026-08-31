const { test, expect } = require('@playwright/test');
const path = require('path');

test.use({ storageState: path.join(__dirname, '../.auth/user.json') });

test('service voucher print renders one top-aligned voucher on one page', async ({ page }) => {
  await page.goto('/ServiceVoucher');
  await page.locator('#tableBody button[title="View"]').first().click();
  await expect(page.locator('#viewReceipt')).toHaveAttribute('open', '');

  await page.evaluate(() => {
    window.__nativePrintCalls = 0;
    window.__popupCalls = 0;
    window.print = () => window.__nativePrintCalls++;
    window.open = () => {
      window.__popupCalls++;
      return null;
    };
  });

  await page.locator('#printInvoice').click();

  const printCalls = await page.evaluate(() => ({
    native: window.__nativePrintCalls,
    popup: window.__popupCalls,
  }));
  expect(printCalls).toEqual({ native: 1, popup: 0 });

  await page.emulateMedia({ media: 'print' });

  await expect(page.locator('header')).toBeHidden();
  await expect(page.locator('.drawer-side').first()).toBeHidden();
  await expect(page.locator('#receiptTemplate1')).toBeVisible();
  await expect(page.locator('#receiptTemplate2')).toHaveCount(0);
  await expect(page.locator('#invoiceBody .voucher-container')).toHaveCount(1);

  const printLayout = await page.evaluate(() => {
    const modalBox = document.querySelector('#viewReceipt .modal-box');
    return {
      receiptTop: document.querySelector('#receiptTemplate1').getBoundingClientRect().top,
      modalBoxTop: modalBox.getBoundingClientRect().top,
      modalPosition: getComputedStyle(document.querySelector('#viewReceipt')).position,
      modalBoxTransform: getComputedStyle(modalBox).transform,
      modalBoxTransition: getComputedStyle(modalBox).transitionDuration,
    };
  });

  expect(printLayout).toEqual({
    receiptTop: 0,
    modalBoxTop: 0,
    modalPosition: 'absolute',
    modalBoxTransform: 'none',
    modalBoxTransition: '0s',
  });

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
  });
  const printedPages = pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) || [];
  expect(printedPages).toHaveLength(1);
});
