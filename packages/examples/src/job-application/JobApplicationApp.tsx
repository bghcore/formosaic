import React, { useMemo, useCallback } from "react";
import { Typography, Paper, Button, Box, Alert } from "@mui/material";
import {
  RulesEngineProvider,
  InjectedFieldProvider,
  Formosaic,
} from "@formosaic/core";
import { createMuiFieldRegistry } from "@formosaic/mui";
import { jobApplicationConfig } from "./jobApplicationConfig";
import { bootstrapJobApplication } from "../../../../examples/configs/job-application.bootstrap";

// Register the averageRatings value function at module load time
bootstrapJobApplication();

/**
 * Job Application Example
 *
 * Demonstrates a wizard with a conditional Portfolio step (shown only for
 * designer/PM roles), a file upload field for resume/portfolio, Rating
 * fields for self-assessment, a computed average score, and a slider
 * that controls seniority-level field visibility.
 */
export const JobApplicationApp: React.FC = () => {
  const fieldRegistry = useMemo(() => createMuiFieldRegistry(), []);

  const handleSave = useCallback(async (data: Record<string, unknown>) => {
    console.log("Job application submitted:", data);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return data;
  }, []);

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Job Application Form
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        A multi-step job application with a conditional Portfolio step for
        designer/PM roles, rating-based self-assessment, a computed average
        score, and a years-of-experience slider that drives seniority rules.
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <RulesEngineProvider>
          <InjectedFieldProvider injectedFields={fieldRegistry}>
            <Formosaic
              formConfig={jobApplicationConfig}
              defaultValues={{}}
              configName="job-application"
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
                    {isSubmitting ? "Submitting..." : "Submit Application"}
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
            <strong>Wizard with conditional step</strong> &mdash; the Portfolio
            step is visible only when the selected role is Designer or Product
            Manager
          </li>
          <li>
            <strong>File upload</strong> &mdash; resume and portfolio document
            upload fields with type and size constraints
          </li>
          <li>
            <strong>Rating fields</strong> &mdash; four self-assessment ratings
            (communication, technical, leadership, problem-solving)
          </li>
          <li>
            <strong>Computed average</strong> &mdash; overall score is
            calculated by the <code>$fn.averageRatings()</code> value function
            registered via bootstrapJobApplication
          </li>
          <li>
            <strong>Slider-driven seniority</strong> &mdash; years-of-experience
            slider triggers rules that show/hide senior-level fields and update
            required constraints
          </li>
        </ul>
      </Alert>
    </div>
  );
};
