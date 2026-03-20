import { registerValueFunctions } from "@formosaic/core";

/**
 * Registers value functions for the job application form.
 */
export function bootstrapJobApplication(): void {
  registerValueFunctions({
    averageRatings: (context) => {
      const { values } = context;
      const ratings = [
        values.ratingCommunication,
        values.ratingTechnical,
        values.ratingLeadership,
        values.ratingProblemSolving,
      ].filter((v): v is number => typeof v === "number" && v > 0);

      if (ratings.length === 0) return 0;
      const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      return Math.round(avg * 10) / 10; // One decimal
    },
  });
}
