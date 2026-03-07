// @ts-check
const { test, expect } = require('@playwright/test');

test('button smoke flow', async ({ page }) => {
  const appPath = 'file:///C:/Users/hak/Documents/weby/yourdivelog/index.html';
  await page.goto(appPath);

  await expect(page.locator('.loading-view')).toBeVisible();
  await page.waitForTimeout(2400);

  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.locator('[data-tab-content="logs"]')).toBeVisible();

  await page.getByRole('button', { name: 'Statistics' }).click();
  await expect(page.locator('[data-tab-content="statistics"]')).toBeVisible();

  await page.getByRole('button', { name: 'Map' }).click();
  await expect(page.locator('[data-tab-content="map"]')).toBeVisible();
  await page.locator('[data-location-filter]').first().click();
  await expect(page.locator('[data-tab-content="logs"]')).toBeVisible();

  await page.getByRole('button', { name: 'Equipment' }).click();
  await expect(page.locator('[data-tab-content="equipment"]')).toBeVisible();
  await page.locator('[data-equipment-filter]').first().click();
  await expect(page.locator('[data-tab-content="logs"]')).toBeVisible();

  await page.getByRole('button', { name: 'Community' }).click();
  await expect(page.locator('[data-tab-content="community"]')).toBeVisible();

  await page.getByRole('button', { name: 'My Logs' }).click();
  await expect(page.locator('[data-tab-content="logs"]')).toBeVisible();

  await page.getByRole('button', { name: 'New Dive Log' }).click();
  await expect(page.locator('#newDiveModal')).toBeVisible();

  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.locator('#newDiveModal')).toHaveClass(/hidden/);

  await page.getByRole('button', { name: 'New Dive Log' }).click();
  // formDiveNumber is now readonly and auto-assigned — skip filling it
  await page.fill('#formDate', '2026-03-06');
  await page.fill('#formTime', '09:15');
  await page.selectOption('#formType', 'Recreational');
  await page.fill('#formLocation', 'Red Sea Test Location');
  await page.fill('#formSiteName', 'Test Site');
  await page.fill('#formDiveBuddy', 'Buddy One');
  await page.fill('#formDepth', '18.5');
  await page.fill('#formDuration', '42');
  await page.fill('#formProfilePoints', '0,0\n5,8\n15,18\n35,6\n42,0');
  await page.fill('#formWaterTemperature', '26.2');
  await page.fill('#formVisibility', '25');
  await page.fill('#formCurrent', '12.5');
  await page.fill('#formWeather', 'Sunny');
  await page.fill('#formStartPressure', '300 kPa');
  await page.fill('#formEndPressure', '220 MPa');
  await page.fill('#formTankType', 'AL80');
  await page.fill('#formGasMix', 'Air');
  // Equipment is now a checkbox grid from the gear inventory — check the first two items
  const equipCheckboxes = page.locator('#formEquipmentGrid input[type="checkbox"]');
  await equipCheckboxes.nth(0).check();
  await equipCheckboxes.nth(1).check();
  await page.fill('#formWildlife', 'Coral, Turtle');
  await page.fill('#formLatitude', '27.735');
  await page.fill('#formLongitude', '34.255');
  await page.fill('#formHeroImage', 'https://example.com/hero.jpg');
  await page.fill('#formPhotos', 'https://example.com/p1.jpg, https://example.com/p2.jpg');
  await page.fill('#formNotes', 'Test note 1\nTest note 2');
  await page.getByRole('button', { name: 'Create Dive Log' }).click();
  await expect(page.locator('#newDiveModal')).toHaveClass(/hidden/);
  await expect(page.locator('#detailTitle')).toContainText('Dive #');

  await page.getByRole('button', { name: 'New Dive Log' }).click();
  await page.getByRole('button', { name: '✕' }).click();
  await expect(page.locator('#newDiveModal')).toHaveClass(/hidden/);

  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page.locator('.auth-view')).toBeVisible();
});
