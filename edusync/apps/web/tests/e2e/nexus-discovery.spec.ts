import { test, expect } from '@playwright/test';

test.describe('E2E: Cross-Campus Nexus Discovery', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000/dashboard');
  });

  test('S16: Nexus Explorer', async () => {
    // Navigate to Nexus Explorer
    await page.click('nav >> text=Nexus');
    await expect(page).toHaveURL(/.*nexus/);
    
    // Verify MOU highlights
    await expect(page.locator('text=Active Institutional Pairs')).toBeVisible();
    await expect(page.locator('[data-testid="mou-node"]')).toBeVisible();
  });

  test('S17: Cross-Campus Profile Access', async () => {
    await page.goto('http://localhost:3000/dashboard/nexus');
    
    // Search for students across campuses
    await page.fill('input[placeholder="Search across Nexus partners"]', 'Machine Learning');
    await page.click('button:has-text("Search")');
    
    // Select a student from a partner campus
    const partnerStudent = page.locator('[data-testid="nexus-result"]').first();
    await expect(partnerStudent.locator('text=IIT DELHI')).toBeVisible();
    await partnerStudent.click();
    
    // Verify restricted profile view (Nexus Policy)
    await expect(page.locator('text=Nexus Verified Partner')).toBeVisible();
  });

  test('S08: Propose Cross-Campus Swap', async () => {
    // Assuming we are on a partner's profile
    await page.click('button:has-text("Propose Nexus Swap")');
    
    // Fill Nexus Swap details
    await page.selectOption('select[name="priority"]', 'High');
    await page.click('button:has-text("Submit Proposal")');
    
    // Verify Nexus Handshake triggered
    await expect(page.locator('text=Initiating Institutional Handshake')).toBeVisible();
    await expect(page.locator('text=Nexus swap request sent')).toBeVisible();
  });
});
