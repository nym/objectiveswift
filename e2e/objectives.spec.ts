import { test, expect } from "@playwright/test";

test("GET /objectives renders page heading and form", async ({ page }) => {
  await page.goto("/objectives");

  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator('input[name="title"]').first()).toBeVisible();
  await expect(page.locator('textarea[name="description"]').first()).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toBeVisible();
});

test("submitting the form with a title creates an objective", async ({
  page,
}) => {
  await page.goto("/objectives");

  await page.fill('input[name="title"]', "Run 5k every morning");
  await page.click('button[type="submit"]');

  // The new card should appear in the list
  await expect(page.getByText("Run 5k every morning")).toBeVisible();
});

test("submitting without a title shows an inline error", async ({ page }) => {
  await page.goto("/objectives");

  await page.click('button[type="submit"]');

  // Client-side validation should show an error
  const error = page.getByRole('alert');
  await expect(error).toBeVisible();
});

test("description textarea grows when text is typed", async ({ page }) => {
  await page.goto("/objectives");

  const textarea = page.locator('textarea[name="description"]');

  const initialHeight = await textarea.evaluate(
    (el) => (el as HTMLElement).offsetHeight
  );

  // Type enough text to cause expansion
  const longText = "This is a long description.\n".repeat(8);
  await textarea.fill(longText);

  const expandedHeight = await textarea.evaluate(
    (el) => (el as HTMLElement).offsetHeight
  );

  expect(expandedHeight).toBeGreaterThan(initialHeight);
});

test("theme toggle changes dark mode", async ({ page }) => {
  await page.goto("/objectives");

  const toggleButton = page.getByRole('button', { name: /theme/i });
  await expect(toggleButton).toBeVisible();

  // Get current class state
  const isDarkBefore = await page.evaluate(() =>
    document.documentElement.classList.contains("dark")
  );

  await toggleButton.click();

  const isDarkAfter = await page.evaluate(() =>
    document.documentElement.classList.contains("dark")
  );

  // State should have toggled
  expect(isDarkAfter).toBe(!isDarkBefore);
});

test("delete button appears on objective cards", async ({ page }) => {
  await page.goto("/objectives");

  await page.fill('input[name="title"]', "To be deleted");
  await page.click('button[type="submit"]');
  await expect(page.getByText("To be deleted")).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Delete objective" }).first()
  ).toBeVisible();
});

test("clicking delete once shows a confirmation prompt", async ({ page }) => {
  await page.goto("/objectives");

  await page.fill('input[name="title"]', "Confirm delete test");
  await page.click('button[type="submit"]');
  await expect(page.getByText("Confirm delete test")).toBeVisible();

  await page.getByRole("button", { name: "Delete objective" }).first().click();

  await expect(page.getByText("Delete?")).toBeVisible();
});

test("confirming delete removes the card from the list", async ({ page }) => {
  await page.goto("/objectives");

  await page.fill('input[name="title"]', "Delete me");
  await page.click('button[type="submit"]');
  await expect(page.getByText("Delete me")).toBeVisible();

  const deleteButton = page.getByRole("button", { name: "Delete objective" }).first();
  await deleteButton.click();
  await expect(page.getByText("Delete?")).toBeVisible();
  await deleteButton.click();

  await expect(page.getByText("Delete me")).not.toBeVisible();
});

test("clicking mark as complete checks the checkbox", async ({ page }) => {
  await page.goto("/objectives");

  await page.fill('input[name="title"]', "Complete me");
  await page.click('button[type="submit"]');
  await expect(page.getByText("Complete me")).toBeVisible();

  await page.getByRole("button", { name: "Mark as complete" }).first().click();

  await expect(
    page.getByRole("button", { name: "Completed" }).first()
  ).toBeVisible();
});

test("completed objective shows greyed text after the flash", async ({ page }) => {
  await page.goto("/objectives");

  await page.fill('input[name="title"]', "Already done");
  await page.click('button[type="submit"]');
  await expect(page.getByText("Already done")).toBeVisible();

  await page.getByRole("button", { name: "Mark as complete" }).first().click();

  // Wait for the 3-second flash to end and the page to revalidate
  await page.waitForTimeout(3500);

  // Title text should carry the grey completed class
  const title = page.getByText("Already done");
  const classes = await title.getAttribute("class");
  expect(classes).toMatch(/text-gray-400/);
});

test("completed state persists after page reload", async ({ page }) => {
  await page.goto("/objectives");

  await page.fill('input[name="title"]', "Persisted completion");
  await page.click('button[type="submit"]');
  await expect(page.getByText("Persisted completion")).toBeVisible();

  await page.getByRole("button", { name: "Mark as complete" }).first().click();
  await expect(page.getByRole("button", { name: "Completed" }).first()).toBeVisible();

  await page.reload();

  await expect(
    page.getByRole("button", { name: "Completed" }).first()
  ).toBeVisible();
});

test("multiple objectives render as a grid of cards", async ({ page }) => {
  await page.goto("/objectives");

  // Create two objectives
  for (const title of ["Morning yoga", "Evening reading"]) {
    await page.fill('input[name="title"]', title);
    await page.click('button[type="submit"]');
    await expect(page.getByText(title).first()).toBeVisible();
    // Clear for next entry
    await page.fill('input[name="title"]', "");
  }

  // Both should be visible as cards
  await expect(page.getByText("Morning yoga").first()).toBeVisible();
  await expect(page.getByText("Evening reading").first()).toBeVisible();
});
