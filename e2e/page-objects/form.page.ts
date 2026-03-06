import { type Locator, type Page, expect } from "@playwright/test";

/**
 * Page object for interacting with FormEngine instances rendered by the E2E test app.
 *
 * Encapsulates Fluent UI v9 field interaction patterns so test specs stay
 * focused on scenarios rather than DOM selectors.
 */
export class FormPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ---- Navigation ----

  async goto(path: string, queryParams?: Record<string, string>) {
    const qs = queryParams
      ? "?" + new URLSearchParams(queryParams).toString()
      : "";
    await this.page.goto(`${path}${qs}`);
    await this.page.waitForSelector("[data-testid='form-shell']");
  }

  // ---- Field locators ----

  /** Get the wrapper element for a field by its name (used as id). */
  fieldWrapper(fieldName: string): Locator {
    // Fields are rendered inside FieldWrapper which sets the id on the input
    return this.page.locator(`[id="${fieldName}"], [name="${fieldName}"]`).first();
  }

  /** Get a text input by field name. */
  textInput(fieldName: string): Locator {
    return this.page.locator(`input[id="${fieldName}"], input[name="${fieldName}"]`).first();
  }

  /** Get a textarea by field name. */
  textarea(fieldName: string): Locator {
    return this.page.locator(
      `textarea[id="${fieldName}"], textarea[name="${fieldName}"]`
    ).first();
  }

  /** Get the Fluent UI Dropdown trigger button for a field. */
  dropdownTrigger(fieldName: string): Locator {
    // Fluent UI v9 Dropdown renders a button inside a wrapper with the field name
    return this.page.locator(
      `[id="${fieldName}"] button, button[id="${fieldName}"], [name="${fieldName}"]`
    ).first();
  }

  /** Get a dropdown option by its display text. */
  dropdownOption(text: string): Locator {
    return this.page.getByRole("option", { name: text });
  }

  /** Get a toggle/switch by field name. */
  toggle(fieldName: string): Locator {
    return this.page.locator(
      `[id="${fieldName}"], input[name="${fieldName}"]`
    ).first();
  }

  /** Get the save/submit button. */
  saveButton(): Locator {
    return this.page.locator("button.save-button");
  }

  /** Get the cancel button. */
  cancelButton(): Locator {
    return this.page.locator("button.cancel-button");
  }

  // ---- Field interactions ----

  /** Fill a text input field. Clears any existing value first. */
  async fillText(fieldName: string, value: string) {
    const input = this.textInput(fieldName);
    await input.click();
    await input.fill(value);
    // Trigger blur to fire validation
    await input.blur();
  }

  /** Select a dropdown option by its display text. */
  async selectDropdown(fieldName: string, optionText: string) {
    const trigger = this.dropdownTrigger(fieldName);
    await trigger.click();
    // Wait for the listbox to appear
    await this.page.waitForSelector("[role='listbox']", { timeout: 3000 });
    const option = this.dropdownOption(optionText);
    await option.click();
  }

  /** Toggle a switch/checkbox field. */
  async clickToggle(fieldName: string) {
    const el = this.toggle(fieldName);
    await el.click();
  }

  /** Fill a number input field. */
  async fillNumber(fieldName: string, value: number) {
    const input = this.textInput(fieldName);
    await input.click();
    await input.fill(String(value));
    await input.blur();
  }

  /** Click the save/submit button and optionally wait for save result. */
  async save() {
    await this.saveButton().click();
  }

  /** Click cancel button. */
  async cancel() {
    await this.cancelButton().click();
  }

  // ---- Assertions ----

  /** Assert that a field is visible on the page. */
  async expectFieldVisible(fieldName: string) {
    // Check for any element with matching id or name
    const locator = this.page.locator(
      `[id="${fieldName}"], [name="${fieldName}"]`
    ).first();
    await expect(locator).toBeVisible();
  }

  /** Assert that a field is not visible on the page. */
  async expectFieldHidden(fieldName: string) {
    const locator = this.page.locator(
      `[id="${fieldName}"], [name="${fieldName}"]`
    ).first();
    await expect(locator).toBeHidden();
  }

  /** Assert that a field has the required indicator. */
  async expectFieldRequired(fieldName: string) {
    // Fluent UI required fields get aria-required="true" on the input
    const input = this.page.locator(
      `[id="${fieldName}"][aria-required="true"], [name="${fieldName}"][aria-required="true"]`
    ).first();
    await expect(input).toBeVisible();
  }

  /** Assert that a field is NOT required. */
  async expectFieldNotRequired(fieldName: string) {
    const input = this.page.locator(
      `[id="${fieldName}"], [name="${fieldName}"]`
    ).first();
    const ariaRequired = await input.getAttribute("aria-required");
    expect(ariaRequired).not.toBe("true");
  }

  /** Assert that a field is read-only. */
  async expectFieldReadOnly(fieldName: string) {
    const input = this.page.locator(
      `[id="${fieldName}"], [name="${fieldName}"]`
    ).first();
    const readOnly = await input.getAttribute("readonly");
    const ariaReadOnly = await input.getAttribute("aria-readonly");
    const disabled = await input.isDisabled();
    expect(readOnly !== null || ariaReadOnly === "true" || disabled).toBe(true);
  }

  /** Assert that a field is editable (not read-only). */
  async expectFieldEditable(fieldName: string) {
    const input = this.page.locator(
      `[id="${fieldName}"], [name="${fieldName}"]`
    ).first();
    await expect(input).toBeEnabled();
  }

  /** Assert a validation error message is shown. */
  async expectErrorMessage(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }

  /** Assert no validation error is visible for the given message. */
  async expectNoErrorMessage(message: string) {
    await expect(this.page.getByText(message)).toBeHidden();
  }

  /** Get the save result element. */
  saveResult(): Locator {
    return this.page.locator("[data-testid='save-result']");
  }

  /** Get the saved data JSON block. */
  async getSavedData(): Promise<Record<string, unknown> | null> {
    const el = this.page.locator("[data-testid='saved-data']");
    const visible = await el.isVisible();
    if (!visible) return null;
    const text = await el.textContent();
    return text ? JSON.parse(text) : null;
  }

  /** Assert the save completed successfully. */
  async expectSaveSuccess() {
    await expect(this.saveResult()).toHaveAttribute("data-save-status", "saved");
  }

  /** Get the status live region text (for a11y announcements). */
  async getStatusAnnouncement(): Promise<string> {
    const el = this.page.locator("[data-testid='form-status-live-region']");
    return (await el.textContent()) ?? "";
  }

  // ---- Dropdown option assertions ----

  /** Assert that specific dropdown options are available for a field. */
  async expectDropdownOptions(fieldName: string, expectedOptions: string[]) {
    const trigger = this.dropdownTrigger(fieldName);
    await trigger.click();
    await this.page.waitForSelector("[role='listbox']", { timeout: 3000 });

    for (const optionText of expectedOptions) {
      await expect(this.dropdownOption(optionText)).toBeVisible();
    }

    // Close the dropdown by pressing Escape
    await this.page.keyboard.press("Escape");
  }

  // ---- Wizard navigation ----

  /** Get the wizard step live region. */
  wizardStepAnnouncement(): Locator {
    return this.page.locator("[data-testid='wizard-step-live-region']");
  }

  // ---- Field array helpers ----

  /** Get all field array items. */
  fieldArrayItems(): Locator {
    return this.page.locator(".field-array-item");
  }

  /** Get a specific field array item by index. */
  fieldArrayItem(index: number): Locator {
    return this.page.locator(".field-array-item").nth(index);
  }

  // ---- Draft persistence helpers ----

  draftSaveButton(): Locator {
    return this.page.locator("[data-testid='save-draft-btn']");
  }

  draftClearButton(): Locator {
    return this.page.locator("[data-testid='clear-draft-btn']");
  }

  draftStatus(): Locator {
    return this.page.locator("[data-testid='draft-status']");
  }
}
