import React, { useMemo, useCallback } from "react";
import { Typography, Paper, Button, Box, Alert } from "@mui/material";
import {
  RulesEngineProvider,
  InjectedFieldProvider,
  Formosaic,
} from "@formosaic/core";
import { createMuiFieldRegistry } from "@formosaic/mui";
import { patientIntakeConfig } from "./patientIntakeConfig";
import { bootstrapPatientIntake } from "../../../../examples/configs/patient-intake.bootstrap";

// Register the async insurance ID validator at module load time
bootstrapPatientIntake();

/**
 * Patient Intake Example
 *
 * Demonstrates conditional sections (insurance fields revealed when
 * insurance coverage is selected), arrayContains operator for multi-select
 * condition matching, async insurance ID validation, confirmInput on
 * sensitive fields, and a field array for current medications.
 */
export const PatientIntakeApp: React.FC = () => {
  const fieldRegistry = useMemo(() => createMuiFieldRegistry(), []);

  const handleSave = useCallback(async (data: Record<string, unknown>) => {
    console.log("Patient intake submitted:", data);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return data;
  }, []);

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Patient Intake Form
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        A healthcare intake form with conditional insurance sections, async
        insurance ID verification, a confirm-input guard on date of birth, and
        a repeating medications field array.
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <RulesEngineProvider>
          <InjectedFieldProvider injectedFields={fieldRegistry}>
            <Formosaic
              formConfig={patientIntakeConfig}
              defaultValues={{}}
              configName="patient-intake"
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
                    {isSubmitting ? "Submitting..." : "Submit Intake"}
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
            <strong>Conditional sections</strong> &mdash; insurance fields
            appear only when the patient selects an insurance coverage type
          </li>
          <li>
            <strong>arrayContains operator</strong> &mdash; allergy checkboxes
            use the arrayContains condition to trigger severity field visibility
          </li>
          <li>
            <strong>Async validation</strong> &mdash; insurance ID is verified
            against a simulated lookup API with a 500 ms delay
          </li>
          <li>
            <strong>confirmInput</strong> &mdash; date of birth uses
            confirmInput to require a second entry before accepting the value
          </li>
          <li>
            <strong>Field arrays</strong> &mdash; current medications list
            allows adding/removing repeating entries with name, dose, and
            frequency
          </li>
        </ul>
      </Alert>
    </div>
  );
};
