import React, { useMemo, useCallback } from "react";
import { Typography, Paper, Button, Alert, Box } from "@mui/material";
import {
  RulesEngineProvider,
  InjectedFieldProvider,
  FormEngine,
} from "@form-eng/core";
import { createMuiFieldRegistry } from "@form-eng/mui";
import { loginMfaFormConfig } from "./loginMfaConfig";

/**
 * Login + MFA Example
 *
 * Shows a simple login form with email and password.
 * Toggling "Enable MFA" reveals MFA method selection and code input.
 * The MFA code field label changes based on the selected method.
 */
export const LoginMfaExample: React.FC = () => {
  const fieldRegistry = useMemo(() => createMuiFieldRegistry(), []);

  const handleSave = useCallback(async (data: Record<string, unknown>) => {
    // Simulate API call
    console.log("Login submitted:", data);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return data;
  }, []);

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Login + MFA Form
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Toggle &ldquo;Enable Multi-Factor Authentication&rdquo; to reveal the
        MFA fields. The code label changes based on the selected MFA method.
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <RulesEngineProvider>
          <InjectedFieldProvider injectedFields={fieldRegistry}>
            <FormEngine
              formConfig={loginMfaFormConfig}
              defaultValues={{}}
              programName="examples"
              configName="login-mfa"
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
                    {isSubmitting ? "Signing in..." : "Sign In"}
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
            <strong>Conditional visibility</strong> &mdash; MFA fields appear
            only when the toggle is on
          </li>
          <li>
            <strong>Cross-field effects</strong> &mdash; the enableMfa toggle
            rule controls mfaMethod and mfaCode visibility
          </li>
          <li>
            <strong>Dynamic labels</strong> &mdash; mfaCode label changes per
            MFA method selection
          </li>
          <li>
            <strong>Conditional validation</strong> &mdash; MFA code pattern
            validation only runs when MFA is enabled
          </li>
          <li>
            <strong>Manual save mode</strong> &mdash; form uses a submit button
            instead of auto-save
          </li>
        </ul>
      </Alert>
    </div>
  );
};
