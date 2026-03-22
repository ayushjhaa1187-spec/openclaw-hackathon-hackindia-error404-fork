import { test, expect } from '@playwright/test';

test.describe('E2E: Student Onboarding → First Swap', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });

  test('S01-S02: Landing → Login', async () => {
    // S01 Landing
    await expect(page.locator('h1')).toContainText('EduSync');
    
    // Click Login
    await page.click('button:has-text("Login with Google")');
    
    // Mock OAuth callback
    await page.goto('http://localhost:3000/dashboard');
    
    // S02 Login verification
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('S03: Onboarding (Add Skills)', async () => {
    // Navigate to onboarding
    await page.goto('http://localhost:3000/onboarding');
    
    // Add skill: Python
    await page.fill('input[placeholder="Skill name"]', 'Python');
    await page.selectOption('select[name="level"]', 'advanced');
    await page.click('button:has-text("Add Skill")');
    
    // Verify skill added
    await expect(page.locator('text=Python')).toBeVisible();
    
    // Add skill: JavaScript
    await page.fill('input[placeholder="Skill name"]', 'JavaScript');
    await page.selectOption('select[name="level"]', 'intermediate');
    await page.click('button:has-text("Add Skill")');
    
    // Complete onboarding
    await page.click('button:has-text("Complete Setup")');
    
    // S04 Dashboard
    await expect(page).toHaveURL(/.*dashboard$/);
  });

  test('S05-S08: Explore → Send Swap', async () => {
    // S05 Explore Skills
    await page.goto('http://localhost:3000/dashboard/explore');
    
    // Search for React
    await page.fill('input[placeholder="Search skills"]', 'React');
    await page.press('input', 'Enter');
    
    // Wait for results
    await page.waitForLoadState('networkidle');
    
    // Verify search results show score breakdown
    const firstResult = page.locator('[data-testid="skill-result"]').first();
    await expect(firstResult.locator('[data-testid="match-score"]')).toBeVisible();
    
    // Click on first result
    await firstResult.click();
    
    // S06 View Profile
    await expect(page.locator('h1')).toContainText(/Student Profile|React Developer/);
    
    // S08 Send Swap
    await page.click('button:has-text("Propose Swap")');
    
    // Fill swap form
    await page.selectOption('select[name="offer"]', 'Python');
    await page.selectOption('select[name="request"]', 'React');
    await page.click('button:has-text("Send Proposal")');
    
    // Verify swap sent
    await expect(page.locator('text=Proposal sent successfully')).toBeVisible();
  });

  test('S10-S11: Collab Room → Review', async () => {
    // Navigate to swap
    await page.goto('http://localhost:3000/dashboard/swap');
    
    // Click active swap
    await page.click('[data-testid="swap-item"]');
    
    // S10 Collab Room (Chat)
    await page.fill('textarea[placeholder="Message"]', "Let's schedule our first session");
    await page.click('button:has-text("Send")');
    
    // Verify message sent
    await expect(page.locator("text=Let's schedule")).toBeVisible();
    
    // S11 Review & Complete
    await page.click('button:has-text("Mark as Complete")');
    
    // Write review
    await page.fill('textarea[placeholder="How was the experience?"]', 'Great help!');
    await page.click('button:has-text("Submit Review")');
    
    // Verify swap completed
    await expect(page.locator('text=Swap completed')).toBeVisible();
  });

  test('S15: Karma Wallet Updated', async () => {
    // Navigate to karma wallet
    await page.goto('http://localhost:3000/dashboard/karma');
    
    // Verify karma balance increased
    const karmaBalance = page.locator('[data-testid="karma-balance"]');
    const balance = await karmaBalance.textContent();
    
    // Should have earned karma from completed swap
    expect(parseInt(balance || '0')).toBeGreaterThan(0);
  });
});
