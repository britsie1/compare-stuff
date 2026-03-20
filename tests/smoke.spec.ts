import { test, expect } from '@playwright/test';

test('has title and dark mode toggle', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/CompareStuff/);

  // Check dark mode toggle
  const body = page.locator('html');
  const toggle = page.getByRole('button', { name: /toggle dark mode/i });
  
  await expect(body).not.toHaveClass(/dark/);
  await toggle.click();
  await expect(body).toHaveClass(/dark/);
  await toggle.click();
  await expect(body).not.toHaveClass(/dark/);
});

test('navigation to terms page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /terms of use/i }).click();
  await expect(page).toHaveURL(/\/terms/);
  await expect(page.getByRole('heading', { name: /terms of use/i })).toBeVisible();
});
