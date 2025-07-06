/* [clarify] Onboarding Flow E2E Spec
   Mission: onboard_users
   This Playwright spec walks a fresh user through the onboarding wizard and validates API/UI sync.
*/

import { test, expect } from '@playwright/test';

// Helper: returns onboarding API base URL
const apiBase = process.env['VITE_API_URL'] || 'http://localhost:3002';

// Initial user session (anonymous)
const USER_ID = `test-user-${Date.now()}`;

test.describe('[onboarding] Guided onboarding wizard', () => {
  test('user completes first 3 steps and state is synced', async ({ page, request }) => {
    // 1. Launch app fresh
    await page.goto('http://localhost:3000');

    // 2. Ensure onboarding wizard appears
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toBeVisible();

    // 3. Walk first three steps (placeholder selectors)
    for (let i = 0; i < 3; i++) {
      await expect(page.locator('[data-testid="onboarding-step-title"]')).toBeVisible();
      await page.click('[data-testid="onboarding-next"]');
    }

    // 4. Fetch onboarding state via API
    const stateResp = await request.get(`${apiBase}/onboarding/state`, {
      headers: { 'x-mock-user': USER_ID }
    });
    expect(stateResp.ok()).toBeTruthy();
    const { data } = await stateResp.json();

    // 5. Assert current_step reflects third step and completed_steps length === 3
    expect(data.completed_steps.length).toBe(3);
    expect(data.current_step).toBe(data.completed_steps[2]);

    // 6. UI badge shows 3/… progress
    await expect(page.locator('[data-testid="onboarding-progress"]')).toHaveText(/3\s*\/\s*\d+/);
  });
}); 