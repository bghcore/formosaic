import React, { useMemo, useCallback } from "react";
import { Typography, Paper, Button, Box, Alert } from "@mui/material";
import {
  RulesEngineProvider,
  InjectedFieldProvider,
  Formosaic,
  registerValueFunctions,
} from "@formosaic/core";
import { createMuiFieldRegistry } from "@formosaic/mui";
import { dataEntryFormConfig } from "./dataEntryConfig";

// Register custom value function for summing line item totals
registerValueFunctions({
  sumLineItems: (_context) => {
    // In a real app, the context would provide access to form values.
    // For this example, the computed value engine handles $values references
    // and this function serves as a placeholder for the sum calculation.
    return 0;
  },
});

/**
 * Data Entry Example
 *
 * Shows field arrays with repeating line items,
 * computed values for totals, dropdown dependencies,
 * and cross-field date validation.
 */
export const DataEntryExample: React.FC = () => {
  const fieldRegistry = useMemo(() => createMuiFieldRegistry(), []);

  const handleSave = useCallback(async (data: Record<string, unknown>) => {
    console.log("Data entry saved:", data);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return data;
  }, []);

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Data Entry Form
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        A purchase order form with repeating line items, computed totals,
        category-dependent subcategories, and cross-field date validation.
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <RulesEngineProvider>
          <InjectedFieldProvider injectedFields={fieldRegistry}>
            <Formosaic
              formConfig={dataEntryFormConfig}
              defaultValues={{
                lineItems: [
                  {
                    description: "",
                    quantity: 1,
                    unitPrice: 0,
                    lineTotal: 0,
                  },
                ],
                taxRate: "0.08",
              }}
              configName="data-entry"
              isCreate={true}
              isManualSave={true}
              saveData={handleSave}
              renderSaveButton={({ onSave, isSubmitting }) => (
                <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={onSave}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Order"}
                  </Button>
                </Box>
              )}
            />
          </InjectedFieldProvider>
        </RulesEngineProvider>
      </Paper>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="subtitle2">What this example shows:</Typography>
        <ul style={{ margin: "4px 0 0", paddingLeft: 20 }}>
          <li>
            <strong>Field arrays</strong> &mdash; repeating line items with
            description, quantity, unit price, and computed line total
          </li>
          <li>
            <strong>Computed values</strong> &mdash; line total = qty x price,
            subtotal = sum of line totals, tax = subtotal x rate, grand total =
            subtotal + tax
          </li>
          <li>
            <strong>Dropdown dependencies</strong> &mdash; subcategory options
            change when category changes (electronics/office/furniture)
          </li>
          <li>
            <strong>Cross-field validation</strong> &mdash; end date must be
            after start date
          </li>
          <li>
            <strong>Numeric validation</strong> &mdash; quantity min/max,
            non-negative prices
          </li>
          <li>
            <strong>computedValue expressions</strong> &mdash; uses $values
            references and $fn functions
          </li>
        </ul>
      </Alert>
    </div>
  );
};
