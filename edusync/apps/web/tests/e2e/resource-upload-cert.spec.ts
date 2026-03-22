import { test, expect } from '@playwright/test';

test.describe('E2E: Resource Upload → Certification → Download', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000/dashboard/vault');
  });

  test('S14: Upload Resource', async () => {
    // Navigate to Upload
    await page.click('button:has-text("Upload Resource")');
    await expect(page).toHaveURL(/.*vault\/upload\//);
    
    // Fill upload form
    await page.fill('input[name="title"]', 'Advanced Data Structures');
    await page.fill('textarea[name="description"]', 'Comprehensive notes on trees and graphs');
    await page.selectOption('select[name="subject"]', 'Computer Science');
    
    // Upload a mock file
    await page.setInputFiles('input[type="file"]', {
      name: 'notes.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('mock pdf content')
    });
    
    await page.click('button:has-text("Submit to Vault")');
    
    // Verify AI screening starts
    await expect(page.locator('text=Guardian AI Screening in progress')).toBeVisible();
    await expect(page.locator('text=Resource pending verification')).toBeVisible();
  });

  test('S25-S12: Verification (Self-Service Mock) → Browse', async () => {
    // In a real flow, an admin would verify. 
    // Here we'll simulate the state change or assume it's verified for the next steps.
    await page.goto('http://localhost:3000/dashboard/vault');
    
    // Filter by 'Certified Only'
    await page.click('[data-testid="filter-certified"]');
    
    // Verify 'Advanced Data Structures' shows up as 'Certified'
    const resourceItem = page.locator('text=Advanced Data Structures').first();
    await expect(resourceItem.locator('[data-testid="certified-badge"]')).toBeVisible();
  });

  test('S13: Resource Detail & Purchase', async () => {
    await page.goto('http://localhost:3000/dashboard/vault');
    await page.click('text=Advanced Data Structures');
    
    // S13 Detail View
    await expect(page.locator('h1')).toContainText('Advanced Data Structures');
    await expect(page.locator('[data-testid="karma-cost"]')).toBeVisible();
    
    // Purchase with Karma
    await page.click('button:has-text("Unlock for 50 Karma")');
    
    // Verify Unlock success
    await expect(page.locator('text=Purchase Successful')).toBeVisible();
    await expect(page.locator('button:has-text("Download Resource")')).toBeVisible();
  });
});
