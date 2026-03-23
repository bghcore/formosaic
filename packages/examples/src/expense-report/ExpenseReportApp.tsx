import React, { useMemo, useCallback } from "react";
import { Typography, Paper, Button, Box, Alert } from "@mui/material";
import {
  RulesEngineProvider,
  InjectedFieldProvider,
  Formosaic,
} from "@formosaic/core";
import { createMuiFieldRegistry } from "@formosaic/mui";
import { expenseReportConfig } from "./expenseReportConfig";
import { bootstrapExpenseReport } from "../../../../examples/configs/expense-report.bootstrap";

// Register the sumExpenseItems value function at module load time
bootstrapExpenseReport();

/**
 * Expense Report Example
 *
 * Demonstrates field arrays with per-row receipt upload, computed totals
 * driven by the sumExpenseItems value function, currency-driven field
 * label updates, and a justification textarea that appears automatically
 * when the total amount exceeds $5000.
 */
export const ExpenseReportApp: React.FC = () => {
  const fieldRegistry = useMemo(() => createMuiFieldRegistry(), []);

  const handleSave = useCallback(async (data: Record<string, unknown>) => {
    console.log("Expense report submitted:", data);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return data;
  }, []);

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Expense Report Form
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        An expense report with repeating line items (including receipt upload
        per row), computed subtotal/tax/total, currency-aware labels, and a
        justification field that becomes required when the total exceeds $5,000.
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <RulesEngineProvider>
          <InjectedFieldProvider injectedFields={fieldRegistry}>
            <Formosaic
              formConfig={expenseReportConfig}
              defaultValues={{
                currency: "USD",
                lineItems: [
                  {
                    description: "",
                    category: "",
                    amount: 0,
                    receiptDate: "",
                  },
                ],
              }}
              configName="expense-report"
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
                    {isSubmitting ? "Submitting..." : "Submit Report"}
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
            <strong>Field arrays with receipt upload</strong> &mdash; each line
            item row contains description, category, amount, date, and a
            receipt file upload
          </li>
          <li>
            <strong>Computed totals</strong> &mdash; subtotal is driven by{" "}
            <code>$fn.sumExpenseItems()</code>; tax and grand total derive from
            subtotal using <code>$values</code> expressions
          </li>
          <li>
            <strong>Currency-driven labels</strong> &mdash; selecting EUR, GBP,
            CAD, or AUD rewrites the amount field labels to reflect the chosen
            currency symbol
          </li>
          <li>
            <strong>Justification when &gt; $5,000</strong> &mdash; a
            justification textarea becomes visible and required when the total
            amount exceeds $5,000, using a greaterThan rule condition
          </li>
        </ul>
      </Alert>
    </div>
  );
};
