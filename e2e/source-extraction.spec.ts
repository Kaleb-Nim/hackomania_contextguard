import { test, expect } from "@playwright/test";

test.describe("Source Extraction E2E", () => {
  test.setTimeout(120_000); // real API calls need generous timeout

  test("full pipeline: submit announcement → extract sources → display results", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    // The textarea is pre-loaded with DORSCON demo text
    const textarea = page.locator("textarea");
    await expect(textarea).toBeVisible();
    const preloadedText = await textarea.inputValue();
    expect(preloadedText.length).toBeGreaterThan(50);

    // Click "Run Rumour Pre-Mortem"
    const analyseButton = page.getByRole("button", {
      name: /run rumour pre-mortem/i,
    });
    await expect(analyseButton).toBeEnabled();
    await analyseButton.click();

    // Should enter analyzing phase
    await expect(page.locator("text=ANALYZING")).toBeVisible({ timeout: 5_000 });

    // Wait for source retrieval feed to appear
    await expect(page.locator("text=RETRIEVING SOURCES")).toBeVisible({
      timeout: 30_000,
    });

    // Wait for results phase — "Predicted False Narratives" heading
    await expect(
      page.locator("text=Predicted False Narratives")
    ).toBeVisible({ timeout: 90_000 });

    // Verify at least one rumour card rendered
    const rumourCards = page.locator("text=Risk Score");
    await expect(rumourCards.first()).toBeVisible({ timeout: 10_000 });

    // Verify historical pattern matches section
    await expect(
      page.locator("text=Corpus Pattern Matches")
    ).toBeVisible();

    // Verify summary stats are present
    const summaryStats = page.locator("text=Predicted Narratives");
    await expect(summaryStats).toBeVisible();
  });

  test("API /api/analyze returns valid structure with real sources", async ({
    request,
  }) => {
    const response = await request.post("/api/analyze", {
      data: {
        text: "The Ministry of Health has raised the DORSCON level from Yellow to Orange. This means the government assesses that the virus is severe and spreads easily, but has not spread widely in Singapore.",
      },
    });

    expect(response.ok()).toBe(true);
    const body = await response.json();

    // Must have predictions array
    expect(Array.isArray(body.predictions)).toBe(true);
    expect(body.predictions.length).toBeGreaterThan(0);

    // Each prediction should have sources with real URLs
    for (const prediction of body.predictions) {
      expect(prediction).toHaveProperty("title");
      expect(prediction).toHaveProperty("risk");
      expect(prediction).toHaveProperty("riskScore");
      expect(prediction).toHaveProperty("sources");
      expect(Array.isArray(prediction.sources)).toBe(true);

      for (const source of prediction.sources) {
        expect(source).toHaveProperty("url");
        expect(source).toHaveProperty("label");
        expect(source.url).toMatch(/^https?:\/\//);
      }
    }

    // Must have historical patterns
    expect(Array.isArray(body.historicalPatterns)).toBe(true);
    expect(body.historicalPatterns.length).toBeGreaterThan(0);

    for (const pattern of body.historicalPatterns) {
      expect(pattern).toHaveProperty("event");
      expect(pattern).toHaveProperty("similarity");
      expect(pattern.similarity).toBeGreaterThanOrEqual(0);
      expect(pattern.similarity).toBeLessThanOrEqual(100);
    }

    // Must have aggregate counts
    expect(typeof body.communityLeadersCount).toBe("number");
    expect(typeof body.constituencies).toBe("number");

    // Must have top-level sources array
    expect(Array.isArray(body.sources)).toBe(true);
    expect(body.sources.length).toBeGreaterThan(0);

    // Should not be fallback data if APIs are working
    if (!body.fallback) {
      // Real sources should come from expected domains
      const domains = body.sources.map(
        (s: { url: string }) => new URL(s.url).hostname
      );
      const hasExpectedDomain = domains.some(
        (d: string) =>
          d.includes("pofmaoffice.gov.sg") ||
          d.includes("channelnewsasia.com") ||
          d.includes("moh.gov.sg")
      );
      expect(hasExpectedDomain).toBe(true);
    }
  });

  test("fallback to demo data on empty text returns 400", async ({
    request,
  }) => {
    const response = await request.post("/api/analyze", {
      data: { text: "" },
    });
    expect(response.status()).toBe(400);
  });

  test("UI shows source links that are clickable in results", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    const analyseButton = page.getByRole("button", {
      name: /run rumour pre-mortem/i,
    });
    await analyseButton.click();

    // Wait for results
    await expect(
      page.locator("text=Predicted False Narratives")
    ).toBeVisible({ timeout: 90_000 });

    // Expand first rumour card to see sources
    const firstCard = page.locator("text=Risk Score").first();
    await firstCard.click();

    // Look for source links within expanded card
    const sourceLinks = page.locator('a[target="_blank"][href^="http"]');
    const count = await sourceLinks.count();
    expect(count).toBeGreaterThan(0);

    // Verify first source link has valid href
    const href = await sourceLinks.first().getAttribute("href");
    expect(href).toMatch(/^https?:\/\//);
  });
});
