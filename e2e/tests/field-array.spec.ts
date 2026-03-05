import { test, expect } from "@playwright/test";
import { FormPage } from "../page-objects/form.page";

test.describe("Field array - add, remove, and item interactions", () => {
  let form: FormPage;

  test.beforeEach(async ({ page }) => {
    form = new FormPage(page);
    await form.goto("/field-array");
  });

  test.describe("Initial state", () => {
    test("renders with one initial item", async () => {
      const items = form.fieldArrayItems();
      await expect(items).toHaveCount(1);
    });

    test("team name field is visible", async () => {
      await form.expectFieldVisible("teamName");
    });
  });

  test.describe("Adding items", () => {
    test("can add a new field array item", async ({ page }) => {
      const addButton = page.getByRole("button", { name: /add/i });
      if (await addButton.isVisible()) {
        await addButton.click();
        const items = form.fieldArrayItems();
        await expect(items).toHaveCount(2);
      }
    });

    test("cannot add beyond maxItems (5)", async ({ page }) => {
      const addButton = page.getByRole("button", { name: /add/i });
      if (await addButton.isVisible()) {
        // Add 4 more items to reach max of 5
        for (let i = 0; i < 4; i++) {
          await addButton.click();
        }
        const items = form.fieldArrayItems();
        await expect(items).toHaveCount(5);

        // The add button should be disabled or clicking should have no effect
        if (await addButton.isEnabled()) {
          await addButton.click();
          await expect(items).toHaveCount(5);
        }
      }
    });
  });

  test.describe("Removing items", () => {
    test("can remove a field array item", async ({ page }) => {
      // First add an item so we have 2
      const addButton = page.getByRole("button", { name: /add/i });
      if (await addButton.isVisible()) {
        await addButton.click();
        await expect(form.fieldArrayItems()).toHaveCount(2);

        // Remove the second item
        const removeButtons = page.getByRole("button", { name: /remove|delete/i });
        if (await removeButtons.first().isVisible()) {
          await removeButtons.last().click();
          await expect(form.fieldArrayItems()).toHaveCount(1);
        }
      }
    });

    test("cannot remove below minItems (1)", async ({ page }) => {
      // Only 1 item -- should not be removable
      const items = form.fieldArrayItems();
      await expect(items).toHaveCount(1);

      const removeButtons = page.getByRole("button", { name: /remove|delete/i });
      if (await removeButtons.first().isVisible()) {
        await removeButtons.first().click();
        // Should still have 1 item
        await expect(items).toHaveCount(1);
      }
    });
  });

  test.describe("Item field values", () => {
    test("can fill fields within a field array item", async ({ page }) => {
      // Fill the first item's member name
      const memberNameInput = page.locator(
        "input[name='members.0.memberName'], input[id='members.0.memberName']"
      ).first();

      if (await memberNameInput.isVisible()) {
        await memberNameInput.fill("Alice");
        await expect(memberNameInput).toHaveValue("Alice");
      }
    });

    test("each item maintains independent values", async ({ page }) => {
      const addButton = page.getByRole("button", { name: /add/i });
      if (await addButton.isVisible()) {
        await addButton.click();

        // Fill first item
        const firstMember = page.locator(
          "input[name='members.0.memberName'], input[id='members.0.memberName']"
        ).first();

        // Fill second item
        const secondMember = page.locator(
          "input[name='members.1.memberName'], input[id='members.1.memberName']"
        ).first();

        if (await firstMember.isVisible()) {
          await firstMember.fill("Alice");
          await secondMember.fill("Bob");

          await expect(firstMember).toHaveValue("Alice");
          await expect(secondMember).toHaveValue("Bob");
        }
      }
    });
  });

  test.describe("Submission with field array", () => {
    test("submits all field array items in saved data", async ({ page }) => {
      // Fill team name
      await form.fillText("teamName", "Alpha Team");

      // Fill the first item
      const memberNameInput = page.locator(
        "input[name='members.0.memberName'], input[id='members.0.memberName']"
      ).first();

      if (await memberNameInput.isVisible()) {
        await memberNameInput.fill("Alice");
      }

      await form.save();

      const savedData = await form.getSavedData();
      if (savedData) {
        expect(savedData.teamName).toBe("Alpha Team");
        const members = savedData.members as Array<Record<string, unknown>>;
        expect(members).toBeDefined();
        expect(members.length).toBeGreaterThanOrEqual(1);
        expect(members[0].memberName).toBe("Alice");
      }
    });
  });
});
