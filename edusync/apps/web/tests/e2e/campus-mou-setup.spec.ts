import { test, expect } from '@playwright/test';

test.describe('E2E: Campus MOU Setup', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:3002/dashboard/nexus');
  });

  test('S24: MOU Console', async () => {
    // S24 MOU Management
    await page.click('button:has-text("Manage MOUs")');
    await expect(page).toHaveURL(/.*nexus\/mou/);
    
    // Create MOU Proposal
    await page.click('button:has-text("Propose New MOU")');
    await page.fill('input[placeholder="Partner Campus ID"]', 'NIT_TRICHY');
    await page.click('button:has-text("Send Proposal")');
    
    // S24 Pending status
    await expect(page.locator('text=Proposal sent to NIT_TRICHY')).toBeVisible();
    await expect(page.locator('text=Pending Acceptance')).toBeVisible();
  });

  test('S26-S18: Analytics → Acceptance → Notifications', async () => {
    // Navigate to Analytics for MOUs
    await page.goto('http://localhost:3002/dashboard/analytics/nexus');
    await expect(page).toHaveURL(/.*analytics\/nexus/);
    
    // S26 Cross-Campus Trends
    await expect(page.locator('text=Active Nexus Utilization')).toBeVisible();
    await expect(page.locator('[data-testid="mou-health-chart"]')).toBeVisible();
    
    // Verify MOU update notification
    // Simulation: accepting a proposal
    await page.goto('http://localhost:3002/dashboard/notifications');
    await expect(page.locator('text=MOU Proposal Accepted')).toBeVisible();
    await expect(page.locator('text=NIT_TRICHY')).toBeVisible();
  });
});
