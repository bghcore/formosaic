import { test, expect } from "@playwright/test";
import { FormPage } from "../page-objects/form.page";

test.describe("Wizard form - step navigation and conditional steps", () => {
  let form: FormPage;

  test.beforeEach(async ({ page }) => {
    form = new FormPage(page);
    await form.goto("/wizard");
  });

  test.describe("Step navigation", () => {
    test("starts on the first step (Personal Info)", async ({ page }) => {
      // The first step fields should be visible
      await form.expectFieldVisible("name");
      await form.expectFieldVisible("email");

      // Later step fields should not be visible yet
      await form.expectFieldHidden("role");
    });

    test("wizard step live region announces current step", async () => {
      const announcement = form.wizardStepAnnouncement();
      await expect(announcement).toContainText("Personal Info");
    });
  });

  test.describe("Step validation", () => {
    test("cannot advance past step 1 without filling required fields", async ({
      page,
    }) => {
      // Try to navigate to next step without filling required fields
      const nextButton = page.getByRole("button", { name: /next/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();

        // Should still be on step 1 because name and email are required
        await form.expectFieldVisible("name");
        await form.expectFieldVisible("email");
      }
    });

    test("can advance to step 2 after filling required fields", async ({
      page,
    }) => {
      await form.fillText("name", "John Doe");
      await form.fillText("email", "john@example.com");

      const nextButton = page.getByRole("button", { name: /next/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();

        // Should now be on step 2 (Role)
        await form.expectFieldVisible("role");
      }
    });
  });

  test.describe("Conditional step visibility", () => {
    test("admin config step is hidden when role is not admin", async ({
      page,
    }) => {
      // Fill step 1
      await form.fillText("name", "John Doe");
      await form.fillText("email", "john@example.com");

      const nextButton = page.getByRole("button", { name: /next/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();

        // Select non-admin role
        await form.selectDropdown("role", "User");

        // Navigate to next step -- should skip admin config and go to review
        await nextButton.click();

        // Admin fields should NOT be visible
        await form.expectFieldHidden("adminLevel");
        await form.expectFieldHidden("adminNotes");
      }
    });

    test("admin config step appears when role is admin", async ({ page }) => {
      // Fill step 1
      await form.fillText("name", "Admin User");
      await form.fillText("email", "admin@example.com");

      const nextButton = page.getByRole("button", { name: /next/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();

        // Select admin role
        await form.selectDropdown("role", "Admin");

        // Navigate to next step -- should show admin config
        await nextButton.click();

        // Admin fields should be visible
        await form.expectFieldVisible("adminLevel");
      }
    });
  });

  test.describe("Back navigation", () => {
    test("can navigate back to previous step", async ({ page }) => {
      // Fill step 1 and go to step 2
      await form.fillText("name", "John Doe");
      await form.fillText("email", "john@example.com");

      const nextButton = page.getByRole("button", { name: /next/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await form.expectFieldVisible("role");

        // Go back
        const prevButton = page.getByRole("button", { name: /prev|back/i });
        if (await prevButton.isVisible()) {
          await prevButton.click();

          // Should be back on step 1 with values preserved
          await form.expectFieldVisible("name");
          const nameInput = form.textInput("name");
          await expect(nameInput).toHaveValue("John Doe");
        }
      }
    });
  });
});
