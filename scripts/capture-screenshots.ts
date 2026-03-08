import { test, expect } from "@playwright/test";

const NIPAH_TEXT = `PARLIAMENTARY STATEMENT BY MINISTER FOR HEALTH ONG YE KUNG
ON THE NIPAH VIRUS SITUATION IN SINGAPORE — 8 MARCH 2026

Mr Speaker, I rise to update the House on the Nipah virus situation.

On 2 March 2026, Malaysia's Ministry of Health confirmed a cluster of Nipah virus cases in Johor Bahru, linked to a fruit bat colony near a pig farm in Kota Tinggi. As of today, Malaysia has reported 14 confirmed cases and 4 deaths.

Singapore has activated DORSCON Orange. We have implemented enhanced border screening at all land, sea, and air checkpoints. Three suspected cases in Singapore are under investigation — all three individuals had recent travel to Johor Bahru. Results are expected within 24–48 hours.

Key measures taken:
1. Enhanced thermal screening at Woodlands and Tuas checkpoints
2. Mandatory health declarations for all travellers from Malaysia
3. Activation of NCID isolation facilities
4. Advisory to avoid consumption of raw date palm sap or fruits potentially contaminated by bats`;

test("capture all screenshots", async ({ page }) => {
  // Set viewport
  await page.setViewportSize({ width: 1280, height: 800 });

  // 1. Landing page
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await page.screenshot({
    path: "public/screenshots/01-landing.png",
    fullPage: false,
  });
  console.log("✓ 01-landing.png");

  // 2. Dashboard with pre-loaded DORSCON text
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await page.screenshot({
    path: "public/screenshots/02-dashboard-input.png",
    fullPage: false,
  });
  console.log("✓ 02-dashboard-input.png");

  // 3. Processing animation (using Nipah cached path for reliable delays)
  // Clear existing text and enter Nipah announcement
  const textarea = page.locator("textarea").first();
  await textarea.fill(NIPAH_TEXT);
  await page.waitForTimeout(300);

  // Click the analyze button
  const analyzeBtn = page.getByRole("button", {
    name: /run rumour pre-mortem/i,
  });
  await analyzeBtn.click();

  // Wait for processing animation to appear and sources to start streaming
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: "public/screenshots/03-processing.png",
    fullPage: false,
  });
  console.log("✓ 03-processing.png");

  // 4. Wait for results to load
  // The Nipah cache path takes ~8-10s total, wait for results phase
  await page
    .locator("text=Predicted False Narratives")
    .waitFor({ timeout: 30000 });
  await page.waitForTimeout(1500); // Wait for rumour cards to animate in
  await page.screenshot({
    path: "public/screenshots/04-results.png",
    fullPage: true,
  });
  console.log("✓ 04-results.png");

  // 5. Expanded rumour card
  const firstCard = page.locator(".rumour-card").first();
  await firstCard.click();
  await page.waitForTimeout(500);

  // Scroll to make the expanded card visible
  await firstCard.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({
    path: "public/screenshots/05-rumour-expanded.png",
    fullPage: true,
  });
  console.log("✓ 05-rumour-expanded.png");
});
