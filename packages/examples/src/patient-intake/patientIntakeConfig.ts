import type { IFormConfig } from "@formosaic/core";
import config from "../../../../examples/configs/patient-intake.json";

/**
 * Patient Intake form configuration.
 * Loaded from the shared examples/configs JSON asset.
 */
export const patientIntakeConfig = config as unknown as IFormConfig;
