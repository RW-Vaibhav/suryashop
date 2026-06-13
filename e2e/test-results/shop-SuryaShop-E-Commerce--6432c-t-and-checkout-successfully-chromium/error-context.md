# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shop.spec.ts >> SuryaShop E-Commerce Flow >> should complete registration, browse, add to cart, and checkout successfully
- Location: tests\shop.spec.ts:10:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4200/
Call log:
  - navigating to "http://localhost:4200/", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('SuryaShop E-Commerce Flow', () => {
  4   |   const timestamp = Date.now();
  5   |   const username = `customer_${timestamp}`;
  6   |   const email = `customer_${timestamp}@suryashop.local`;
  7   |   const password = 'SecurePassword123';
  8   |   const shippingAddress = '456 Cyberpunk Lane, Neo Tokyo, 94016';
  9   | 
  10  |   test('should complete registration, browse, add to cart, and checkout successfully', async ({ page }) => {
  11  |     // 1. Visit Home Page
> 12  |     await page.goto('/');
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4200/
  13  |     await page.waitForLoadState('networkidle');
  14  |     await expect(page).toHaveTitle(/SuryaShop/i);
  15  |     await expect(page.locator('text=Curated Premium Tech & Accessories')).toBeVisible();
  16  | 
  17  |     // 2. Go to Login / Register page
  18  |     await page.click('a:has-text("Login")');
  19  |     await page.waitForURL('**/login');
  20  |     await expect(page.url()).toContain('/login');
  21  |     await expect(page.locator('text=Welcome Back')).toBeVisible();
  22  | 
  23  |     // Toggle to Register mode
  24  |     await page.click('button:has-text("Don\'t have an account? Sign Up")');
  25  |     await expect(page.locator('text=Create Account')).toBeVisible();
  26  | 
  27  |     // Fill registration details
  28  |     await page.fill('input[name="username"]', username);
  29  |     await page.fill('input[name="email"]', email);
  30  |     await page.fill('input[name="password"]', password);
  31  |     await page.click('button[type="submit"]:has-text("Sign Up")');
  32  | 
  33  |     // Verify successful login (should show "Hi, [username]" and "Logout")
  34  |     await expect(page.locator(`.username-display`)).toContainText(`Hi, ${username}`);
  35  |     await expect(page.locator('button:has-text("Logout")')).toBeVisible();
  36  | 
  37  |     // 3. Browse Product Catalog
  38  |     await page.click('a:has-text("Products")');
  39  |     await page.waitForURL('**/products');
  40  |     await expect(page.url()).toContain('/products');
  41  |     await expect(page.locator('h1')).toContainText('Product Catalog');
  42  | 
  43  |     // Verify products are loaded from SQL DB
  44  |     const firstProductCard = page.locator('.product-card').first();
  45  |     await expect(firstProductCard).toBeVisible();
  46  |     const firstProductName = await firstProductCard.locator('.product-title').innerText();
  47  |     expect(firstProductName.length).toBeGreaterThan(0);
  48  | 
  49  |     // 4. View Product Details
  50  |     await firstProductCard.locator('a:has-text("Details")').click();
  51  |     await page.waitForURL('**/product/*');
  52  |     await expect(page.url()).toContain('/product/');
  53  |     await expect(page.locator('.detail-title')).toHaveText(firstProductName);
  54  |     await expect(page.locator('text=Description')).toBeVisible();
  55  | 
  56  |     // 5. Add item to Cart
  57  |     const qtySelector = page.locator('.qty-value');
  58  |     await expect(qtySelector).toHaveText('1');
  59  |     
  60  |     // Increment quantity to 2
  61  |     await page.click('button.qty-btn:has-text("+")');
  62  |     await expect(qtySelector).toHaveText('2');
  63  | 
  64  |     // Click Add to Cart
  65  |     await page.click('button:has-text("Add to Cart")');
  66  |     
  67  |     // Verify Toast Success message
  68  |     const toast = page.locator('.toast.success', { hasText: 'added to cart' });
  69  |     await expect(toast).toBeVisible();
  70  | 
  71  |     // Verify cart badge count is updated to 2
  72  |     const cartBadge = page.locator('.cart-badge');
  73  |     await expect(cartBadge).toHaveText('2');
  74  | 
  75  |     // 6. View Shopping Cart
  76  |     await page.click('a.cart-btn');
  77  |     await page.waitForURL('**/cart');
  78  |     await expect(page.url()).toContain('/cart');
  79  |     await expect(page.locator('h1')).toContainText('Your Shopping Cart');
  80  | 
  81  |     // Verify product name and quantity in cart
  82  |     await expect(page.locator('.item-name')).toContainText(firstProductName);
  83  |     await expect(page.locator('.qty-value-sm')).toHaveText('2');
  84  | 
  85  |     // 7. Complete Checkout Form
  86  |     await page.fill('textarea[name="shippingAddress"]', shippingAddress);
  87  |     
  88  |     // Submit payment & checkout
  89  |     await page.click('button:has-text("Place Order")');
  90  |     await page.waitForURL('**/payment-success*');
  91  | 
  92  |     // 8. Verify Payment Confirmation Page
  93  |     await expect(page.url()).toContain('/payment-success');
  94  |     await expect(page.locator('h1')).toContainText('Payment Completed!');
  95  |     await expect(page.locator('text=Order Reference')).toBeVisible();
  96  |     
  97  |     // Verify address matches on receipt
  98  |     await expect(page.locator('.address-value')).toHaveText(shippingAddress);
  99  |     
  100 |     // Verify purchased product is listed on receipt
  101 |     await expect(page.locator('.receipt-item-name')).toContainText(firstProductName);
  102 |     await expect(page.locator('.receipt-item-qty')).toContainText('Quantity: 2');
  103 |   });
  104 | });
  105 | 
```