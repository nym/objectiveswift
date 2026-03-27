import { test } from "@playwright/test";
import postgres from "postgres";
import path from "path";

const DATABASE_URL = process.env.DATABASE_URL ?? "postgres://app:please@127.0.0.1:5432/app_dev";
const sql = postgres(DATABASE_URL);
const screenshotsDir = path.join(import.meta.dirname, "..", "docs", "screenshots");

test.describe.configure({ mode: "serial" });

test.afterAll(async () => {
  await sql`DELETE FROM objectives WHERE title = ANY(${["Morning run", "Read 30 pages", "Plan the week"]})`;
  await sql.end();
});

test("home screen", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: path.join(screenshotsDir, "home.png"),
    fullPage: true,
  });
});

test("objectives screen", async ({ page }) => {
  // Seed a few objectives so the screenshot shows a populated list
  await sql`
    INSERT INTO objectives (title, description)
    VALUES
      ('Morning run', 'Go for a 5k run before breakfast'),
      ('Read 30 pages', NULL),
      ('Plan the week', 'Review goals and set priorities for the coming week')
    ON CONFLICT DO NOTHING
  `;

  await page.goto("/objectives");
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: path.join(screenshotsDir, "objectives.png"),
    fullPage: true,
  });
});
