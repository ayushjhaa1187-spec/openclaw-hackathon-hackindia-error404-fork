import { test, expect } from '@playwright/test';

test.describe('E2E: Admin Moderation', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:3002/dashboard');
  });

  test('S27: Guardian Monitor', async () => {
    // S27 Admin Monitor
    await page.click('nav >> text=Guardian');
    await expect(page).toHaveURL(/.*guardian/);
    
    // Check Flag queue
    await expect(page.locator('h1')).toContainText('Guardian Monitor');
    await expect(page.locator('[data-testid="flag-item"]')).toBeVisible();
    
    // View flag details
    const flag = page.locator('[data-testid="flag-item"]').first();
    await flag.click();
    await expect(page.locator('text=Flag Details')).toBeVisible();
  });

  test('S23-S18: Student Detail → Action → Notifications', async () => {
    await page.goto('http://localhost:3002/dashboard/guardian');
    
    // S23 Student Detail View
    const flaggedStudent = page.locator('[data-testid="flagged-student-link"]').first();
    const studentName = await flaggedStudent.textContent();
    await flaggedStudent.click();
    await expect(page.locator('h1')).toContainText(studentName || 'Student Detail');
    
    // Moderation Action: Warning
    await page.click('button:has-text("Actions")');
    await page.click('button:has-text("Issue Warning")');
    await page.fill('textarea[placeholder="Reason for warning"]', 'Policy Violation: inappropriate language');
    await page.click('button:has-text("Submit Warning")');
    
    // S18 Verification (User notification)
    // We'll simulate checking the student's notification center
    await page.goto('http://localhost:3000/dashboard/notifications');
    await expect(page.locator('text=Guardian Warning Issued')).toBeVisible();
    await expect(page.locator('text=Policy Violation')).toBeVisible();
  });
});
