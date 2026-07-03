# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Admin Workflow >> login, add product with images, and verify
- Location: e2e/admin.spec.ts:5:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Test Playwright Product')
Expected: visible
Error: strict mode violation: locator('text=Test Playwright Product') resolved to 2 elements:
    1) <h3 class="font-body font-medium text-brown text-base leading-tight line-clamp-1 flex-1 pr-2">Test Playwright Product</h3> aka getByRole('heading', { name: 'Test Playwright Product' }).first()
    2) <h3 class="font-body font-medium text-brown text-base leading-tight line-clamp-1 flex-1 pr-2">Test Playwright Product</h3> aka getByRole('heading', { name: 'Test Playwright Product' }).nth(1)

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('text=Test Playwright Product')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e6]: ZAYED
      - navigation [ref=e7]:
        - link "Dashboard" [ref=e8] [cursor=pointer]:
          - /url: /admin
          - img [ref=e9]
          - text: Dashboard
        - link "Products" [ref=e14] [cursor=pointer]:
          - /url: /admin/products
          - img [ref=e15]
          - text: Products
        - link "Orders" [ref=e19] [cursor=pointer]:
          - /url: /admin/orders
          - img [ref=e20]
          - text: Orders
        - link "View Store" [ref=e24] [cursor=pointer]:
          - /url: /
          - img [ref=e25]
          - text: View Store
        - button "Sign Out" [ref=e29] [cursor=pointer]:
          - img [ref=e30]
          - text: Sign Out
    - main [ref=e33]:
      - generic [ref=e34]:
        - generic [ref=e35]:
          - heading "Products" [level=1] [ref=e36]
          - paragraph [ref=e37]: 9 total
        - button "Add New Product" [ref=e38] [cursor=pointer]:
          - img [ref=e39]
          - text: Add New Product
      - generic [ref=e40]:
        - generic [ref=e41]:
          - img "Test Playwright Product" [ref=e43]
          - generic [ref=e44]:
            - generic [ref=e45]:
              - heading "Test Playwright Product" [level=3] [ref=e46]
              - generic [ref=e47]: EGP 1,200
            - generic [ref=e48]:
              - generic [ref=e49]: tops
              - generic [ref=e50]: 46 in stock
            - generic [ref=e51]:
              - button "Edit" [ref=e52] [cursor=pointer]:
                - img [ref=e53]
                - text: Edit
              - button "Hide product" [ref=e55] [cursor=pointer]:
                - img [ref=e56]
              - button "Delete product" [ref=e59] [cursor=pointer]:
                - img [ref=e60]
        - generic [ref=e63]:
          - img "Test Playwright Product" [ref=e65]
          - generic [ref=e66]:
            - generic [ref=e67]:
              - heading "Test Playwright Product" [level=3] [ref=e68]
              - generic [ref=e69]: EGP 1,200
            - generic [ref=e70]:
              - generic [ref=e71]: tops
              - generic [ref=e72]: 50 in stock
            - generic [ref=e73]:
              - button "Edit" [ref=e74] [cursor=pointer]:
                - img [ref=e75]
                - text: Edit
              - button "Hide product" [ref=e77] [cursor=pointer]:
                - img [ref=e78]
              - button "Delete product" [ref=e81] [cursor=pointer]:
                - img [ref=e82]
        - generic [ref=e85]:
          - generic [ref=e86]:
            - img "colorful dress" [ref=e87]
            - generic [ref=e88]: Featured
          - generic [ref=e89]:
            - generic [ref=e90]:
              - heading "colorful dress" [level=3] [ref=e91]
              - generic [ref=e92]: EGP 1,500
            - generic [ref=e93]:
              - generic [ref=e94]: dresses
              - generic [ref=e95]: 5 in stock
            - generic [ref=e96]:
              - button "Edit" [ref=e97] [cursor=pointer]:
                - img [ref=e98]
                - text: Edit
              - button "Hide product" [ref=e100] [cursor=pointer]:
                - img [ref=e101]
              - button "Delete product" [ref=e104] [cursor=pointer]:
                - img [ref=e105]
        - generic [ref=e108]:
          - generic [ref=e109]:
            - img "red ribbon swareh" [ref=e110]
            - generic [ref=e111]: Featured
          - generic [ref=e112]:
            - generic [ref=e113]:
              - heading "red ribbon swareh" [level=3] [ref=e114]
              - generic [ref=e115]: EGP 2,000
            - generic [ref=e116]:
              - generic [ref=e117]: dresses
              - generic [ref=e118]: 5 in stock
            - generic [ref=e119]:
              - button "Edit" [ref=e120] [cursor=pointer]:
                - img [ref=e121]
                - text: Edit
              - button "Hide product" [ref=e123] [cursor=pointer]:
                - img [ref=e124]
              - button "Delete product" [ref=e127] [cursor=pointer]:
                - img [ref=e128]
        - generic [ref=e131]:
          - generic [ref=e132]:
            - img "Blue Dress" [ref=e133]
            - generic [ref=e134]: Hidden
          - generic [ref=e135]:
            - generic [ref=e136]:
              - heading "Blue Dress" [level=3] [ref=e137]
              - generic [ref=e138]: EGP 950
            - generic [ref=e139]:
              - generic [ref=e140]: dresses
              - generic [ref=e141]: 0 in stock
            - generic [ref=e142]:
              - button "Edit" [ref=e143] [cursor=pointer]:
                - img [ref=e144]
                - text: Edit
              - button "Show product" [ref=e146] [cursor=pointer]:
                - img [ref=e147]
              - button "Delete product" [ref=e152] [cursor=pointer]:
                - img [ref=e153]
        - generic [ref=e156]:
          - generic [ref=e157]:
            - img "Orange dress" [ref=e158]
            - generic [ref=e159]: Featured
          - generic [ref=e160]:
            - generic [ref=e161]:
              - heading "Orange dress" [level=3] [ref=e162]
              - generic [ref=e163]: EGP 580
            - generic [ref=e164]:
              - generic [ref=e165]: dresses
              - generic [ref=e166]: 4 in stock
            - generic [ref=e167]:
              - button "Edit" [ref=e168] [cursor=pointer]:
                - img [ref=e169]
                - text: Edit
              - button "Hide product" [ref=e171] [cursor=pointer]:
                - img [ref=e172]
              - button "Delete product" [ref=e175] [cursor=pointer]:
                - img [ref=e176]
        - generic [ref=e179]:
          - generic [ref=e180]:
            - img "Coffee dress" [ref=e181]
            - generic [ref=e182]: Featured
          - generic [ref=e183]:
            - generic [ref=e184]:
              - heading "Coffee dress" [level=3] [ref=e185]
              - generic [ref=e186]: EGP 1,000
            - generic [ref=e187]:
              - generic [ref=e188]: dresses
              - generic [ref=e189]: 5 in stock
            - generic [ref=e190]:
              - button "Edit" [ref=e191] [cursor=pointer]:
                - img [ref=e192]
                - text: Edit
              - button "Hide product" [ref=e194] [cursor=pointer]:
                - img [ref=e195]
              - button "Delete product" [ref=e198] [cursor=pointer]:
                - img [ref=e199]
        - generic [ref=e202]:
          - generic [ref=e203]:
            - img "red dress" [ref=e204]
            - generic [ref=e205]: Featured
          - generic [ref=e206]:
            - generic [ref=e207]:
              - heading "red dress" [level=3] [ref=e208]
              - generic [ref=e209]: EGP 1,500
            - generic [ref=e210]:
              - generic [ref=e211]: dresses
              - generic [ref=e212]: 5 in stock
            - generic [ref=e213]:
              - button "Edit" [ref=e214] [cursor=pointer]:
                - img [ref=e215]
                - text: Edit
              - button "Hide product" [ref=e217] [cursor=pointer]:
                - img [ref=e218]
              - button "Delete product" [ref=e221] [cursor=pointer]:
                - img [ref=e222]
        - generic [ref=e225]:
          - generic [ref=e226]:
            - img "Classic White Linen Shirt" [ref=e227]
            - generic [ref=e228]: Featured
          - generic [ref=e229]:
            - generic [ref=e230]:
              - heading "Classic White Linen Shirt" [level=3] [ref=e231]
              - generic [ref=e232]: EGP 850
            - generic [ref=e233]:
              - generic [ref=e234]: tops
              - generic [ref=e235]: 33 in stock
            - generic [ref=e236]:
              - button "Edit" [ref=e237] [cursor=pointer]:
                - img [ref=e238]
                - text: Edit
              - button "Hide product" [ref=e240] [cursor=pointer]:
                - img [ref=e241]
              - button "Delete product" [ref=e244] [cursor=pointer]:
                - img [ref=e245]
      - generic [ref=e249]:
        - generic [ref=e250]:
          - heading "Add New Product" [level=2] [ref=e251]
          - button "✕" [ref=e252] [cursor=pointer]
        - generic [ref=e253]:
          - generic [ref=e254]:
            - heading "Basic Info" [level=3] [ref=e255]
            - generic [ref=e256]:
              - generic [ref=e257]:
                - generic [ref=e258]: Product Name
                - textbox "e.g. The Linen Wrap Dress" [ref=e259]: Test Playwright Product
              - generic [ref=e260]:
                - generic [ref=e261]: Category
                - combobox [ref=e262]:
                  - option "tops" [selected]
                  - option "bottoms"
                  - option "dresses"
                  - option "outerwear"
              - generic [ref=e263]:
                - generic [ref=e264]: Price (EGP)
                - spinbutton [ref=e265]: "1200"
              - generic [ref=e266]:
                - generic [ref=e267]: Description
                - textbox "Write a compelling description..." [ref=e268]: A test product created by Playwright
          - generic [ref=e269]:
            - heading "Product Images" [level=3] [ref=e270]
            - generic [ref=e271]:
              - generic [ref=e273]:
                - img "Upload 0" [ref=e274]
                - generic [ref=e275]:
                  - button "◀" [disabled] [ref=e276]
                  - button [ref=e277] [cursor=pointer]:
                    - img [ref=e278]
                  - button "▶" [disabled] [ref=e281]
                - generic [ref=e282]: Main Image
              - generic [ref=e283]:
                - button "Choose File" [ref=e284] [cursor=pointer]
                - generic [ref=e285]:
                  - img [ref=e286]
                  - paragraph [ref=e289]: Click to upload or drag and drop
                  - paragraph [ref=e290]: PNG, JPG up to 10MB
          - generic [ref=e291]:
            - heading "Sizes & Stock" [level=3] [ref=e292]
            - generic [ref=e293]:
              - generic [ref=e294]:
                - generic [ref=e295]:
                  - generic [ref=e296]: Size
                  - textbox "S" [ref=e297]: M
                - generic [ref=e298]:
                  - generic [ref=e299]: Color
                  - textbox "e.g. Olive" [ref=e300]: Black
                - generic [ref=e301]:
                  - generic [ref=e302]: Stock
                  - spinbutton [ref=e303]: "50"
                - generic [ref=e304]:
                  - generic [ref=e305]: Waist (cm) (optional)
                  - spinbutton [ref=e306]
                - button [disabled] [ref=e308]:
                  - img [ref=e309]
              - button "Add Variant" [ref=e312] [cursor=pointer]:
                - img [ref=e313]
                - text: Add Variant
          - generic [ref=e314]:
            - heading "Settings" [level=3] [ref=e315]
            - generic [ref=e316]:
              - generic [ref=e317] [cursor=pointer]:
                - checkbox "Featured Product (Shows on homepage)" [ref=e318]
                - generic [ref=e319]: Featured Product (Shows on homepage)
              - generic [ref=e320] [cursor=pointer]:
                - checkbox "Active / Visible in store" [checked] [ref=e321]
                - generic [ref=e322]: Active / Visible in store
          - generic [ref=e323]:
            - button "Cancel" [ref=e324] [cursor=pointer]
            - button "Saving..." [disabled] [ref=e325]
  - alert [ref=e326]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import path from 'path';
  3  | 
  4  | test.describe('Admin Workflow', () => {
  5  |   test('login, add product with images, and verify', async ({ page }) => {
  6  |     // 1. Login
  7  |     await page.goto('/admin/login');
  8  |     await page.fill('input[type="email"]', 'mennadel.official@gmail.com');
  9  |     await page.fill('input[type="password"]', 'mennawillbeabillionaire2026!');
  10 |     await page.click('button[type="submit"]');
  11 |     await expect(page).toHaveURL(/.*\/admin$/);
  12 | 
  13 |     // 2. Go to products and create
  14 |     await page.goto('/admin/products');
  15 |     await expect(page).toHaveURL(/.*\/admin\/products$/);
  16 |     await page.click('button:has-text("Add New Product")');
  17 | 
  18 |     // 3. Fill product form
  19 |     await page.fill('input[name="name"]', 'Test Playwright Product');
  20 |     // Category selects 'tops' by default
  21 |     await page.fill('input[name="price"]', '1200');
  22 |     await page.fill('textarea[name="description"]', 'A test product created by Playwright');
  23 |     
  24 |     // Fill default variant stock
  25 |     // The variant inputs are just input elements, but we can target them by value or placeholder
  26 |     await page.fill('input[placeholder="S"]', 'M');
  27 |     await page.fill('input[placeholder="e.g. Olive"]', 'Black');
  28 |     // Stock is the input with type=number and min=0, let's use the bounding box or index
  29 |     const stockInputs = page.locator('input[type="number"][min="0"]').nth(1); // 0 is price, 1 is stock
  30 |     await stockInputs.fill('50');
  31 | 
  32 |     // Upload image
  33 |     const iconPath = path.join(__dirname, '../app/icon.png');
  34 |     // Playwright handles input[type="file"] with setInputFiles directly
  35 |     await page.setInputFiles('input[type="file"]', iconPath);
  36 |     
  37 |     // Wait for the "Save Product" button to become enabled (it requires images.length > 0)
  38 |     await expect(page.locator('button:has-text("Save Product")')).not.toBeDisabled({ timeout: 15000 });
  39 | 
  40 |     // 4. Submit
  41 |     await page.click('button:has-text("Save Product")');
  42 |     
  43 |     // Verify product is listed
> 44 |     await expect(page.locator('text=Test Playwright Product')).toBeVisible({ timeout: 10000 });
     |                                                                ^ Error: expect(locator).toBeVisible() failed
  45 |   });
  46 | });
  47 | 
```