import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Admin Workflow', () => {
  test('login, add product with images, and verify', async ({ page }) => {
    // 1. Login
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'mennadel.official@gmail.com');
    await page.fill('input[type="password"]', 'mennawillbeabillionaire2026!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/admin$/);

    // 2. Go to products and create
    await page.goto('/admin/products');
    await expect(page).toHaveURL(/.*\/admin\/products$/);
    await page.click('button:has-text("Add New Product")');

    // 3. Fill product form
    await page.fill('input[name="name"]', 'Test Playwright Product');
    // Category selects 'tops' by default
    await page.fill('input[name="price"]', '1200');
    await page.fill('textarea[name="description"]', 'A test product created by Playwright');
    
    // Fill default variant stock
    // The variant inputs are just input elements, but we can target them by value or placeholder
    await page.fill('input[placeholder="S"]', 'M');
    await page.fill('input[placeholder="e.g. Olive"]', 'Black');
    // Stock is the input with type=number and min=0, let's use the bounding box or index
    const stockInputs = page.locator('input[type="number"][min="0"]').nth(1); // 0 is price, 1 is stock
    await stockInputs.fill('50');

    // Upload image
    const iconPath = path.join(__dirname, '../app/icon.png');
    // Playwright handles input[type="file"] with setInputFiles directly
    await page.setInputFiles('input[type="file"]', iconPath);
    
    // Wait for the "Save Product" button to become enabled (it requires images.length > 0)
    await expect(page.locator('button:has-text("Save Product")')).not.toBeDisabled({ timeout: 15000 });

    // 4. Submit
    await page.click('button:has-text("Save Product")');
    
    // Verify product is listed
    await expect(page.locator('text=Test Playwright Product').first()).toBeVisible({ timeout: 10000 });
  });
});
