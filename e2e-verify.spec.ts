import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173/';
const SCREENSHOT_DIR = 'e2e-screenshots';

test.describe('Sales Navigator Agent Tab Prototype', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Sales Navigator', { timeout: 10000 });
  });

  test('1. Initial state - TopNav, left panel, right panel', async ({ page }) => {
    await page.screenshot({ path: `${SCREENSHOT_DIR}/01-initial.png` });

    // TopNav: "Sales Navigator" with tabs
    await expect(page.locator('text=Sales Navigator')).toBeVisible();
    const tabs = ['Home', 'Accounts', 'Leads', 'Smart Links', 'Messaging', 'Agent', 'Admin'];
    for (const tab of tabs) {
      await expect(page.locator(`text=${tab}`).first()).toBeVisible();
    }
    // Agent should be active (black underline)
    const agentTab = page.locator('button:has-text("Agent")');
    await expect(agentTab).toHaveClass(/border-black/);

    // Left panel: Threads tab with Pinned and Recent
    await expect(page.locator('text=Threads')).toBeVisible();
    await expect(page.locator('text=Pinned').first()).toBeVisible();
    await expect(page.locator('text=Recent').first()).toBeVisible();

    // Right panel: Today home tiles
    await expect(page.locator('h2:has-text("Today")')).toBeVisible();
    const tileNames = ['Hot now', 'What changed', 'Pipeline risk', 'Quick wins', 'Drafts waiting'];
    for (const name of tileNames) {
      await expect(page.locator(`text=${name}`).first()).toBeVisible();
    }
  });

  test('2. Click What changed tile - opens thread with diff evidence', async ({ page }) => {
    await page.click('button:has-text("What changed")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/02-what-changed.png` });

    // Should show thread view (left) and diff evidence (right)
    await expect(page.locator('text=What changed in the last 7 days')).toBeVisible();
    await expect(page.locator('text=Acme Software')).toBeVisible();
    await expect(page.locator('text=EXEC_MOVE').or(page.locator('text=VP Sales joined'))).toBeVisible();
  });

  test('3. Click back arrow - return to thread list', async ({ page }) => {
    await page.click('button:has-text("What changed")');
    await page.waitForTimeout(300);
    await page.click('button[aria-label="Back to thread list"]');
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/03-back-to-list.png` });

    await expect(page.locator('h2:has-text("Today")')).toBeVisible();
    await expect(page.locator('text=Pinned').first()).toBeVisible();
  });

  test('4. Jobs tab - Active and Completed jobs', async ({ page }) => {
    await page.click('button:has-text("Jobs")');
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/04-jobs-tab.png` });

    await expect(page.locator('text=Active').first()).toBeVisible();
    await expect(page.locator('text=Completed').first()).toBeVisible();
    await expect(page.locator('text=Draft outreach for 8 leads')).toBeVisible();
    await expect(page.locator('text=Needs approval')).toBeVisible();
  });

  test('5. Click Draft outreach job - approval queue', async ({ page }) => {
    await page.click('button:has-text("Jobs")');
    await page.waitForTimeout(300);
    await page.click('text=Draft outreach for 8 leads');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/05-approval-queue.png` });

    await expect(page.locator('text=Draft outreach — Pending approval')).toBeVisible();
    await expect(page.locator('text=Approve all')).toBeVisible();
    await expect(page.locator('text=Sarah Chen')).toBeVisible();
    await expect(page.locator('text=Why this message')).toBeVisible();
  });
});
