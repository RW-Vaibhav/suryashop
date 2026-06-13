import { test, expect } from '@playwright/test';

test.describe('SuryaShop E-Commerce Flow', () => {
  const timestamp = Date.now();
  const username = `customer_${timestamp}`;
  const email = `customer_${timestamp}@suryashop.local`;
  const password = 'SecurePassword123';
  const shippingAddress = '456 Cyberpunk Lane, Neo Tokyo, 94016';

  test('should complete registration, browse, add to cart, and checkout successfully', async ({ page }) => {
    // 1. Visit Home Page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/SuryaShop/i);
    await expect(page.locator('text=Curated Premium Tech & Accessories')).toBeVisible();

    // 2. Go to Login / Register page
    await page.click('a:has-text("Login")');
    await page.waitForURL('**/login');
    await expect(page.url()).toContain('/login');
    await expect(page.locator('text=Welcome Back')).toBeVisible();

    // Toggle to Register mode
    await page.click('button:has-text("Don\'t have an account? Sign Up")');
    await expect(page.locator('text=Create Account')).toBeVisible();

    // Fill registration details
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]:has-text("Sign Up")');

    // Verify successful login (should show "Hi, [username]" and "Logout")
    await expect(page.locator(`.username-display`)).toContainText(`Hi, ${username}`);
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();

    // 3. Browse Product Catalog
    await page.click('a:has-text("Products")');
    await page.waitForURL('**/products');
    await expect(page.url()).toContain('/products');
    await expect(page.locator('h1')).toContainText('Product Catalog');

    // Verify products are loaded from SQL DB
    const firstProductCard = page.locator('.product-card').first();
    await expect(firstProductCard).toBeVisible();
    const firstProductName = await firstProductCard.locator('.product-title').innerText();
    expect(firstProductName.length).toBeGreaterThan(0);

    // 4. View Product Details
    await firstProductCard.locator('a:has-text("Details")').click();
    await page.waitForURL('**/product/*');
    await expect(page.url()).toContain('/product/');
    await expect(page.locator('.detail-title')).toHaveText(firstProductName);
    await expect(page.locator('text=Description')).toBeVisible();

    // 5. Add item to Cart
    const qtySelector = page.locator('.qty-value');
    await expect(qtySelector).toHaveText('1');
    
    // Increment quantity to 2
    await page.click('button.qty-btn:has-text("+")');
    await expect(qtySelector).toHaveText('2');

    // Click Add to Cart
    await page.click('button:has-text("Add to Cart")');
    
    // Verify Toast Success message
    const toast = page.locator('.toast.success', { hasText: 'added to cart' });
    await expect(toast).toBeVisible();

    // Verify cart badge count is updated to 2
    const cartBadge = page.locator('.cart-badge');
    await expect(cartBadge).toHaveText('2');

    // 6. View Shopping Cart
    await page.click('a.cart-btn');
    await page.waitForURL('**/cart');
    await expect(page.url()).toContain('/cart');
    await expect(page.locator('h1')).toContainText('Your Shopping Cart');

    // Verify product name and quantity in cart
    await expect(page.locator('.item-name')).toContainText(firstProductName);
    await expect(page.locator('.qty-value-sm')).toHaveText('2');

    // 7. Complete Checkout Form
    await page.fill('textarea[name="shippingAddress"]', shippingAddress);
    
    // Submit payment & checkout
    await page.click('button:has-text("Place Order")');
    await page.waitForURL('**/payment-success*');

    // 8. Verify Payment Confirmation Page
    await expect(page.url()).toContain('/payment-success');
    await expect(page.locator('h1')).toContainText('Payment Completed!');
    await expect(page.locator('text=Order Reference')).toBeVisible();
    
    // Verify address matches on receipt
    await expect(page.locator('.address-value')).toHaveText(shippingAddress);
    
    // Verify purchased product is listed on receipt
    await expect(page.locator('.receipt-item-name')).toContainText(firstProductName);
    await expect(page.locator('.receipt-item-qty')).toContainText('Quantity: 2');
  });
});
