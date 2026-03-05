import { test, expect } from "@playwright/test";
import { FormPage } from "../page-objects/form.page";

test.describe("Validation - required, email, URL, phone, length", () => {
  let form: FormPage;

  test.beforeEach(async ({ page }) => {
    form = new FormPage(page);
    await form.goto("/validation");
  });

  test.describe("Required field validation", () => {
    test("submitting with empty required fields shows errors", async () => {
      // Dirty the form with a non-required field so save is enabled
      await form.fillText("phone", "something");
      await form.fillText("phone", "");
      await form.save();

      // Required fields (name, email) should show validation errors
      // The form should not save successfully
      const savedData = await form.getSavedData();
      expect(savedData).toBeNull();
    });

    test("filling required fields allows submission", async () => {
      await form.fillText("name", "John Doe");
      await form.fillText("email", "john@example.com");

      await form.save();
      await form.expectSaveSuccess();
    });
  });

  test.describe("Email validation", () => {
    test("invalid email shows error message", async () => {
      await form.fillText("email", "not-an-email");
      await form.expectErrorMessage("Please enter a valid email address");
    });

    test("valid email clears error", async () => {
      await form.fillText("email", "not-an-email");
      await form.expectErrorMessage("Please enter a valid email address");

      await form.fillText("email", "valid@example.com");
      await form.expectNoErrorMessage("Please enter a valid email address");
    });

    test("common valid email formats pass validation", async () => {
      const validEmails = [
        "user@example.com",
        "user.name@domain.org",
        "user+tag@company.co.uk",
      ];

      for (const email of validEmails) {
        await form.fillText("email", email);
        await form.expectNoErrorMessage("Please enter a valid email address");
      }
    });
  });

  test.describe("URL validation", () => {
    test("invalid URL shows error message", async () => {
      await form.fillText("website", "not-a-url");
      await form.expectErrorMessage("Please enter a valid URL");
    });

    test("valid URL clears error", async () => {
      await form.fillText("website", "not-a-url");
      await form.expectErrorMessage("Please enter a valid URL");

      await form.fillText("website", "https://example.com");
      await form.expectNoErrorMessage("Please enter a valid URL");
    });
  });

  test.describe("Phone validation", () => {
    test("invalid phone shows error message", async () => {
      await form.fillText("phone", "abc");
      await form.expectErrorMessage("Please enter a valid phone number");
    });

    test("valid phone clears error", async () => {
      await form.fillText("phone", "abc");
      await form.expectErrorMessage("Please enter a valid phone number");

      await form.fillText("phone", "+1-555-1234");
      await form.expectNoErrorMessage("Please enter a valid phone number");
    });
  });

  test.describe("Length validation", () => {
    test("name shorter than 2 characters shows error", async () => {
      await form.fillText("name", "J");
      await form.expectErrorMessage("Name must be at least 2 characters");
    });

    test("name with 2+ characters clears min length error", async () => {
      await form.fillText("name", "J");
      await form.expectErrorMessage("Name must be at least 2 characters");

      await form.fillText("name", "Jo");
      await form.expectNoErrorMessage("Name must be at least 2 characters");
    });

    test("bio exceeding 200 characters shows error", async () => {
      const longBio = "A".repeat(201);
      await form.fillText("bio", longBio);
      await form.expectErrorMessage("Bio must be at most 200 characters");
    });
  });

  test.describe("Full valid submission", () => {
    test("all fields valid submits and returns saved data", async () => {
      await form.fillText("name", "Jane Smith");
      await form.fillText("email", "jane@example.com");
      await form.fillText("phone", "+1-555-9876");
      await form.fillText("website", "https://jane.dev");
      await form.fillText("bio", "Software engineer with a passion for forms.");

      await form.save();
      await form.expectSaveSuccess();

      const savedData = await form.getSavedData();
      expect(savedData).not.toBeNull();
      expect(savedData!.name).toBe("Jane Smith");
      expect(savedData!.email).toBe("jane@example.com");
    });
  });
});
