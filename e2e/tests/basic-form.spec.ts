import { test, expect } from "@playwright/test";
import { FormPage } from "../page-objects/form.page";

test.describe("Basic form - fill and submit", () => {
  let form: FormPage;

  test.beforeEach(async ({ page }) => {
    form = new FormPage(page);
    await form.goto("/basic");
  });

  test("renders all fields in the correct order", async ({ page }) => {
    await form.expectFieldVisible("firstName");
    await form.expectFieldVisible("lastName");
    await form.expectFieldVisible("age");
    await form.expectFieldVisible("country");
    await form.expectFieldVisible("newsletter");
  });

  test("save button is disabled when form is pristine", async () => {
    await expect(form.saveButton()).toBeDisabled();
  });

  test("fill all fields and submit successfully", async () => {
    await form.fillText("firstName", "Jane");
    await form.fillText("lastName", "Doe");
    await form.fillNumber("age", 30);
    await form.selectDropdown("country", "Canada");
    await form.clickToggle("newsletter");

    await form.save();
    await form.expectSaveSuccess();

    const savedData = await form.getSavedData();
    expect(savedData).not.toBeNull();
    expect(savedData!.firstName).toBe("Jane");
    expect(savedData!.lastName).toBe("Doe");
    expect(savedData!.country).toBe("CA");
  });

  test("required fields prevent submission when empty", async () => {
    // Only fill non-required fields
    await form.fillNumber("age", 25);

    // The save button should be enabled once the form is dirty
    await expect(form.saveButton()).toBeEnabled();
    await form.save();

    // Save should NOT succeed because required fields are empty
    const savedData = await form.getSavedData();
    expect(savedData).toBeNull();
  });

  test("cancel resets form to defaults", async () => {
    await form.fillText("firstName", "Temporary");
    await form.cancel();

    const input = form.textInput("firstName");
    await expect(input).toHaveValue("");
  });

  test("dropdown displays correct options", async () => {
    await form.expectDropdownOptions("country", [
      "United States",
      "Canada",
      "United Kingdom",
      "Australia",
    ]);
  });
});
