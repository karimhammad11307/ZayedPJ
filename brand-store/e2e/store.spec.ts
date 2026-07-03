import { test, expect } from '@playwright/test';

test.describe('User Store Workflow', () => {
  test('browse shop, view product, add to cart, and checkout', async ({ page }) => {
    // 1. Visit Shop
    await page.goto('/shop');
    await expect(page.locator('h1:has-text("The Collection")')).toBeVisible();

    // 2. Find a product. We will click the first product card.
    // We assume there's at least one product (from the admin test or existing DB).
    const productCard = page.locator('.bg-cream-warm.rounded-card').first();
    await productCard.click();
    
    // 3. Wait for Product Detail page
    await expect(page.locator('button:has-text("Add to Cart")')).toBeVisible({ timeout: 10000 });

    // 4. Select a color (first available)
    const colorBtn = page.locator('p:has-text("Color") + div button:not([disabled])').first();
    if (await colorBtn.isVisible()) {
      await colorBtn.click();
    }

    // 5. Select a size (first available)
    const sizeBtn = page.locator('p:has-text("Size") + div button:not([disabled])').first();
    if (await sizeBtn.isVisible()) {
      await sizeBtn.click();
    }

    // 6. Add to Cart
    await page.click('button:has-text("Add to Cart")');
    
    // Wait for Cart Drawer
    await expect(page.locator('h2:has-text("Your Cart")').last()).toBeVisible();
    await page.locator('a:has-text("Checkout")').last().click();

    // 7. Checkout Process
    await expect(page).toHaveURL(/\/checkout/);
    
    // Fill out the form
    await page.fill('input[id="name"]', 'Playwright Tester');
    await page.fill('input[id="email"]', 'test@playwright.dev');
    await page.fill('input[id="phone"]', '01012345678');
    
    // Delivery details (default is delivery)
    await page.fill('input[id="address"]', '123 Test Street');
    await page.fill('input[id="city"]', 'Cairo');

    // 8. Place Order
    // Intercept WhatsApp window.open so the test doesn't hang
    await page.evaluate(() => {
      window.open = function() { return null; };
    });

    await page.click('button:has-text("Place Order")');

    // 9. Verify Success page redirection
    await expect(page).toHaveURL(/\/order\//, { timeout: 15000 });
    await expect(page.locator('text=Awaiting Payment')).toBeVisible();
  });
});
