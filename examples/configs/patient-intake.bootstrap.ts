import { registerValidators } from "@formosaic/core";
import type { ValidatorFn } from "@formosaic/core";

/**
 * Registers the async insurance ID validator.
 * ValidatorFn signature: (value, params, context) => string | undefined | Promise<string | undefined>
 * Returns undefined if valid, error message string if invalid.
 *
 * In real usage this would call an insurance verification API.
 * For demo purposes, IDs starting with "VALID" or longer than 8 chars pass after 500ms.
 */
export function bootstrapPatientIntake(): void {
  const insuranceIdLookup: ValidatorFn = async (value, _params, _context) => {
    if (!value || typeof value !== "string" || value.length === 0) {
      return undefined; // Empty is handled by required validator
    }
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Demo logic: IDs starting with "VALID" or longer than 8 chars pass
    const id = value.toUpperCase();
    if (id.startsWith("VALID") || id.length >= 8) {
      return undefined; // Valid
    }
    return "Unable to verify this insurance ID. Please check and try again.";
  };

  registerValidators({ insuranceIdLookup });
}
