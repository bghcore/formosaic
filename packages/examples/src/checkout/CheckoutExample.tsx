import React, { useMemo, useState, useCallback } from "react";
import {
  Typography,
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Alert,
} from "@mui/material";
import {
  RulesEngineProvider,
  InjectedFieldProvider,
  Formosaic,
  WizardForm,
  UseRulesEngineContext,
} from "@formosaic/core";
import type { IWizardNavigationProps } from "@formosaic/core";
import { createMuiFieldRegistry } from "@formosaic/mui";
import { checkoutFormConfig } from "./checkoutConfig";

/**
 * Inner component that renders the wizard.
 * Must be inside RulesEngineProvider to access rulesState for step validation.
 */
const CheckoutWizard: React.FC = () => {
  const { rulesState } = UseRulesEngineContext();
  const fieldStates = rulesState?.configs["checkout"]?.fieldStates;
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    console.log("Order placed!");
  }, []);

  if (!checkoutFormConfig.wizard) return null;

  return (
    <WizardForm
      wizardConfig={checkoutFormConfig.wizard}
      entityData={{}}
      fieldStates={fieldStates}
      renderStepHeader={({ stepIndex }) => (
        <Stepper activeStep={stepIndex} sx={{ mb: 4 }}>
          {checkoutFormConfig.wizard!.steps.map((s, i) => (
            <Step key={s.id} completed={i < stepIndex}>
              <StepLabel>{s.title}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}
      renderStepContent={(fields) => (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Fields in this step: {fields.join(", ")}
          </Typography>
          {submitted ? (
            <Alert severity="success" sx={{ my: 2 }}>
              Order placed successfully! (This is a demo -- no actual order was
              created.)
            </Alert>
          ) : (
            <Typography variant="body2" color="text.secondary">
              The Formosaic component below renders all fields. In a real app,
              you would integrate WizardForm with Formosaic to filter visible
              fields per step.
            </Typography>
          )}
        </Box>
      )}
      renderStepNavigation={({
        canGoNext,
        canGoPrev,
        goNext,
        goPrev,
        currentStepIndex,
        steps,
      }: IWizardNavigationProps) => (
        <Box
          sx={{
            mt: 3,
            display: "flex",
            gap: 1,
            justifyContent: "space-between",
          }}
        >
          <Button variant="outlined" onClick={goPrev} disabled={!canGoPrev}>
            Back
          </Button>
          {currentStepIndex === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Place Order
            </Button>
          ) : (
            <Button variant="contained" onClick={goNext} disabled={!canGoNext}>
              Continue
            </Button>
          )}
        </Box>
      )}
    />
  );
};

/**
 * E-Commerce Checkout Example
 *
 * Uses WizardForm for step navigation and Formosaic for form state.
 * The wizard config defines 3 steps: Shipping -> Payment -> Review.
 * Payment fields change based on the selected payment method.
 * State/Province/County options depend on the selected country.
 */
export const CheckoutExample: React.FC = () => {
  const fieldRegistry = useMemo(() => createMuiFieldRegistry(), []);

  const handleSave = useCallback(async (data: Record<string, unknown>) => {
    console.log("Order placed:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return data;
  }, []);

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        E-Commerce Checkout
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        A 3-step wizard with conditional payment fields and country-dependent
        address options. The WizardForm handles step navigation while
        Formosaic manages form state.
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <RulesEngineProvider>
          <InjectedFieldProvider injectedFields={fieldRegistry}>
            <CheckoutWizard />

            <Typography
              variant="subtitle2"
              sx={{ mt: 3, mb: 1, color: "text.secondary" }}
            >
              Full Form (all fields):
            </Typography>
            <Formosaic
              formConfig={checkoutFormConfig}
              defaultValues={{ country: "US", paymentMethod: "credit" }}
              configName="checkout"
              isCreate={true}
              isManualSave={true}
              saveData={handleSave}
              renderSaveButton={({ onSave, isSubmitting }) => (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={onSave}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Placing order..." : "Place Order"}
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
            <strong>WizardForm component</strong> &mdash; step navigation with
            renderStepHeader (MUI Stepper), renderStepContent, and
            renderStepNavigation
          </li>
          <li>
            <strong>Formosaic component</strong> &mdash; full form state
            management with rules engine
          </li>
          <li>
            <strong>Dropdown dependencies</strong> &mdash; state/province
            options and postal code validation change per country
          </li>
          <li>
            <strong>Payment method branching</strong> &mdash; card fields vs
            PayPal email toggled by paymentMethod, using an OR logical condition
          </li>
          <li>
            <strong>Cross-field effects</strong> &mdash; country rules control
            both state dropdown options and zip validation
          </li>
        </ul>
      </Alert>
    </div>
  );
};
