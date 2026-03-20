import { test, expect } from "@playwright/test";
import { FormPage } from "../page-objects/form.page";

test.describe("Rules engine - show/hide, required, option filtering", () => {
  let form: FormPage;

  test.beforeEach(async ({ page }) => {
    form = new FormPage(page);
    await form.goto("/rules");
  });

  test.describe("Show/hide rules", () => {
    test("priority field is hidden by default", async () => {
      await form.expectFieldHidden("priority");
    });

    test("selecting Active status shows the priority field", async () => {
      await form.selectDropdown("status", "Active");
      await form.expectFieldVisible("priority");
    });

    test("selecting Inactive hides priority again", async () => {
      // Show it first
      await form.selectDropdown("status", "Active");
      await form.expectFieldVisible("priority");

      // Then hide it
      await form.selectDropdown("status", "Inactive");
      await form.expectFieldHidden("priority");
    });

    test("selecting Pending hides priority", async () => {
      await form.selectDropdown("status", "Pending");
      await form.expectFieldHidden("priority");
    });
  });

  test.describe("Required toggle rules", () => {
    test("priority becomes required when status is Active", async () => {
      await form.selectDropdown("status", "Active");
      await form.expectFieldRequired("priority");
    });

    test("priority is not required when status is not Active", async () => {
      await form.selectDropdown("status", "Active");
      await form.expectFieldRequired("priority");

      await form.selectDropdown("status", "Inactive");
      // Priority is hidden, so it should not be required either
      await form.expectFieldHidden("priority");
    });
  });

  test.describe("Dropdown option filtering rules", () => {
    test("selecting US shows US region options", async () => {
      await form.selectDropdown("country", "United States");
      await form.expectDropdownOptions("region", [
        "East Coast",
        "West Coast",
        "Central",
      ]);
    });

    test("selecting Canada shows Canadian region options", async () => {
      await form.selectDropdown("country", "Canada");
      await form.expectDropdownOptions("region", [
        "Ontario",
        "Quebec",
        "British Columbia",
      ]);
    });

    test("switching country updates regions", async () => {
      await form.selectDropdown("country", "United States");
      await form.expectDropdownOptions("region", [
        "East Coast",
        "West Coast",
        "Central",
      ]);

      await form.selectDropdown("country", "Canada");
      await form.expectDropdownOptions("region", [
        "Ontario",
        "Quebec",
        "British Columbia",
      ]);
    });
  });

  test.describe("AND condition rules", () => {
    test("notes field is not required by default", async () => {
      await form.expectFieldNotRequired("notes");
    });

    test("notes becomes required when status=Active AND issueType=Bug", async () => {
      await form.selectDropdown("status", "Active");
      await form.selectDropdown("issueType", "Bug");
      await form.expectFieldRequired("notes");
    });

    test("notes is NOT required when only status=Active (issueType is Feature)", async () => {
      await form.selectDropdown("status", "Active");
      await form.selectDropdown("issueType", "Feature");
      await form.expectFieldNotRequired("notes");
    });

    test("notes is NOT required when only issueType=Bug (status is Inactive)", async () => {
      await form.selectDropdown("status", "Inactive");
      await form.selectDropdown("issueType", "Bug");
      await form.expectFieldNotRequired("notes");
    });
  });

  test.describe("ReadOnly toggle rules", () => {
    test("details field is editable by default", async () => {
      await form.expectFieldEditable("readOnlyWhenInactive");
    });

    test("details becomes read-only when status is Inactive", async () => {
      await form.selectDropdown("status", "Inactive");
      await form.expectFieldReadOnly("readOnlyWhenInactive");
    });

    test("details becomes editable again when status changes from Inactive", async () => {
      await form.selectDropdown("status", "Inactive");
      await form.expectFieldReadOnly("readOnlyWhenInactive");

      await form.selectDropdown("status", "Active");
      await form.expectFieldEditable("readOnlyWhenInactive");
    });
  });

  test.describe("Field animation behavior", () => {
    test("field animates in when shown by rule", async ({ page }) => {
      const form = new FormPage(page);
      await form.goto("/rules");

      // Priority is hidden by default
      await form.expectFieldHidden("priority");

      // Trigger show rule
      await form.selectDropdown("status", "Active");

      // The field should become visible (animation wrapper present)
      const wrapper = page.locator(".formosaic-field-animate").filter({ has: page.locator('[data-testid*="priority"]') });
      await expect(wrapper).toBeVisible();
      await expect(wrapper).not.toHaveAttribute("data-exiting");
    });

    test("field animates out when hidden by rule", async ({ page }) => {
      const form = new FormPage(page);
      await form.goto("/rules");

      // Show the field first
      await form.selectDropdown("status", "Active");
      await form.expectFieldVisible("priority");

      // Trigger hide rule
      await form.selectDropdown("status", "Inactive");

      // After animation duration, field should be gone
      const wrapper = page.locator(".formosaic-field-animate").filter({ has: page.locator('[data-testid*="priority"]') });
      await expect(wrapper).toHaveCount(0, { timeout: 1000 });
    });
  });
});
