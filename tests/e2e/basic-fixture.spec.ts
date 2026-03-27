import { expect, test } from "@playwright/test";

test("renders UI5 components in the Koppajs fixture and keeps them stable", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.locator("ui5-shellbar")).toBeVisible();
  await expect(page.locator("ui5-side-navigation")).toBeVisible();

  await expect(page.locator("#email-value")).toHaveText("alice@example.com");
  await expect(page.locator("#saving-state")).toHaveText("enabled");

  const initialInputIdentity = await page.evaluate(() => {
    const input = document.querySelector("ui5-input");
    (
      window as Window & { __koppajsUi5Input?: Element | null }
    ).__koppajsUi5Input = input;
    return Boolean(input);
  });

  expect(initialInputIdentity).toBe(true);

  await page.locator("ui5-input").locator("input").fill("bob@example.com");
  await expect(page.locator("#email-value")).toHaveText("bob@example.com");
  await expect(page.locator("ui5-input")).toHaveJSProperty(
    "value",
    "bob@example.com",
  );

  await page.getByRole("button", { name: "Toggle Saving" }).click();
  await expect(page.locator("#saving-state")).toHaveText("disabled");
  await expect(
    page.locator("ui5-button[data-primary-save='true']"),
  ).toHaveJSProperty("disabled", true);

  await page.getByRole("button", { name: "Trigger Parent Rerender" }).click();

  const sameInputInstance = await page.evaluate(() => {
    return (
      document.querySelector("ui5-input") ===
      (window as Window & { __koppajsUi5Input?: Element | null })
        .__koppajsUi5Input
    );
  });

  expect(sameInputInstance).toBe(true);

  await page.evaluate(() => {
    const list = document.querySelector("ui5-list");
    const settingsItem = list?.querySelector("ui5-li:last-child");

    list?.dispatchEvent(
      new CustomEvent("selection-change", {
        bubbles: true,
        detail: {
          selectedItems: settingsItem ? [settingsItem] : [],
        },
      }),
    );
  });
  await expect(page.locator("#selection-change-count")).toHaveText("1");
  await expect(page.locator("#last-selection")).toHaveText("Settings");

  await page.evaluate(() => {
    document.querySelector("ui5-date-picker")?.dispatchEvent(
      new CustomEvent("value-state-change", {
        bubbles: true,
        detail: {
          valueState: "Negative",
          valid: false,
        },
      }),
    );
  });
  await expect(page.locator("#value-state-change-count")).toHaveText("1");
});
