import { registerValueFunctions } from "@formosaic/core";

const BASE_RATES: Record<string, number> = {
  basic: 50,
  standard: 85,
  premium: 130,
};

const VEHICLE_FACTORS: Record<string, number> = {
  car: 1.0,
  truck: 1.15,
  motorcycle: 1.3,
};

const USAGE_MULTIPLIERS: Record<string, number> = {
  personal: 1.0,
  commute: 1.1,
  commercial: 1.4,
  rideshare: 1.35,
};

function computePremium(values: Record<string, unknown>): number {
  const coverageLevel = (values.coverageLevel as string) || "standard";
  const vehicleType = (values.vehicleType as string) || "car";
  const usage = (values.usage as string) || "personal";
  const deductible = Number(values.deductible) || 1000;
  const hasAccidents = values.hasAccidents === true;
  const accidentCount = Number(values.accidentCount) || 0;
  const hasExistingPolicy = values.hasExistingPolicy === true;

  let monthly = BASE_RATES[coverageLevel] || 85;
  monthly *= VEHICLE_FACTORS[vehicleType] || 1.0;
  monthly *= USAGE_MULTIPLIERS[usage] || 1.0;

  // Deductible discount: higher deductible = lower premium
  const deductibleDiscount = 1 - ((deductible - 250) / 4750) * 0.25;
  monthly *= deductibleDiscount;

  // Accident surcharge
  if (hasAccidents && accidentCount > 0) {
    monthly *= 1 + accidentCount * 0.1;
  }

  // New customer discount
  if (!hasExistingPolicy) {
    monthly *= 0.9;
  }

  return Math.round(monthly * 100) / 100;
}

/**
 * Registers value functions for the vehicle insurance quote form.
 */
export function bootstrapVehicleInsuranceQuote(): void {
  registerValueFunctions({
    computeMonthlyPremium: (context) => {
      const monthly = computePremium(context.values);
      return `$${monthly.toFixed(2)}/mo`;
    },
    computeAnnualPremium: (context) => {
      const monthly = computePremium(context.values);
      const annual = monthly * 12;
      return `$${annual.toFixed(2)}/yr`;
    },
    computeCoverageSummary: (context) => {
      const { values } = context;
      const parts: string[] = [];
      const coverage = values.coverageLevel as string;
      if (coverage === "basic") parts.push("Liability Only");
      else if (coverage === "standard") parts.push("Liability + Collision");
      else if (coverage === "premium") parts.push("Full Coverage");

      const deductible = Number(values.deductible) || 1000;
      parts.push(`$${deductible} deductible`);

      if (!values.hasExistingPolicy) parts.push("10% new customer discount");
      if (values.hasAccidents && Number(values.accidentCount) > 2) {
        parts.push("high-risk surcharge applied");
      }

      return parts.join(" | ");
    },
  });
}
