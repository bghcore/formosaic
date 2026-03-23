import { registerValueFunctions } from "@formosaic/core";

/**
 * Registers value functions for the survey form.
 */
export function bootstrapSurvey(): void {
  registerValueFunctions({
    computeSurveyProgress: (context) => {
      const { values } = context;
      const trackedFields = [
        "ageRange", "role", "industry", "usedBefore",
        "usageFrequency", "featuresUsed",
        "satisfaction", "npsScore",
        "openFeedback",
      ];

      let filled = 0;
      for (const field of trackedFields) {
        const val = values[field];
        if (val !== undefined && val !== null && val !== "" &&
            !(Array.isArray(val) && val.length === 0)) {
          filled++;
        }
      }

      const pct = Math.round((filled / trackedFields.length) * 100);
      return `${pct}% complete (${filled}/${trackedFields.length} questions answered)`;
    },
  });
}
