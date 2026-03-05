import { test, expect } from "@playwright/test";
import { FormPage } from "../page-objects/form.page";

test.describe("Draft persistence - save, reload, and recover", () => {
  let form: FormPage;

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto("/basic");
    await page.evaluate(() => localStorage.clear());
  });

  test("saves a draft and shows draft status", async ({ page }) => {
    form = new FormPage(page);
    await form.goto("/basic", { draft: "true" });

    await form.fillText("firstName", "Draft User");
    await form.draftSaveButton().click();

    await expect(form.draftStatus()).toHaveText("has-draft");
  });

  test("recovers draft data after page reload", async ({ page }) => {
    form = new FormPage(page);
    await form.goto("/basic", { draft: "true" });

    // Fill some data and save as draft
    await form.fillText("firstName", "Recovered");
    await form.fillText("lastName", "User");
    await form.draftSaveButton().click();
    await expect(form.draftStatus()).toHaveText("has-draft");

    // Reload the page
    await page.reload();
    await page.waitForSelector("[data-testid='form-shell']");

    // The draft status should still indicate a draft exists
    await expect(form.draftStatus()).toHaveText("has-draft");

    // The recovered draft data should be loaded into the form
    const firstNameInput = form.textInput("firstName");
    const value = await firstNameInput.inputValue();
    // The draft recovery happens on initial load, so the field should have the draft value
    expect(value).toBe("Recovered");
  });

  test("clearing draft removes saved data", async ({ page }) => {
    form = new FormPage(page);
    await form.goto("/basic", { draft: "true" });

    await form.fillText("firstName", "ToDelete");
    await form.draftSaveButton().click();
    await expect(form.draftStatus()).toHaveText("has-draft");

    await form.draftClearButton().click();
    await expect(form.draftStatus()).toHaveText("no-draft");

    // Reload -- should NOT recover any draft
    await page.reload();
    await page.waitForSelector("[data-testid='form-shell']");

    await expect(form.draftStatus()).toHaveText("no-draft");
  });

  test("draft data persists across navigations within the app", async ({
    page,
  }) => {
    form = new FormPage(page);
    await form.goto("/basic", { draft: "true" });

    await form.fillText("firstName", "Persistent");
    await form.draftSaveButton().click();

    // Navigate away
    await page.goto("/");
    // Navigate back
    await form.goto("/basic", { draft: "true" });

    await expect(form.draftStatus()).toHaveText("has-draft");
  });
});
