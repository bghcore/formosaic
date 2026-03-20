import { registerValueFunctions } from "@formosaic/core";

/**
 * Registers value functions for the expense report form.
 */
export function bootstrapExpenseReport(): void {
  registerValueFunctions({
    /**
     * Sums the `amount` field across all entries in the `lineItems` field array.
     * Returns 0 if lineItems is empty or not yet populated.
     */
    sumExpenseItems: (context) => {
      const { values } = context;
      const lineItems = values.lineItems;

      if (!Array.isArray(lineItems) || lineItems.length === 0) {
        return 0;
      }

      const total = lineItems.reduce((sum: number, item: Record<string, unknown>) => {
        const amount = item?.amount;
        if (typeof amount === "number" && isFinite(amount)) {
          return sum + amount;
        }
        if (typeof amount === "string") {
          const parsed = parseFloat(amount);
          if (!isNaN(parsed)) {
            return sum + parsed;
          }
        }
        return sum;
      }, 0);

      return Math.round(total * 100) / 100; // Two decimal places
    },
  });
}
