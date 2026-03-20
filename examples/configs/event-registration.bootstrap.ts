import { registerValueFunctions } from "@formosaic/core";

/** Ticket base prices indexed by ticketType value */
const TICKET_PRICES: Record<string, number> = {
  standard: 99,
  vip: 299,
  student: 49,
};

/** Per-person guest surcharge (added once per additional guest) */
const GUEST_PRICE = 49;

/** Workshop add-on prices indexed by workshop value */
const WORKSHOP_PRICES: Record<string, number> = {
  keynote_breakfast: 25,
  deep_dive_ai: 75,
  hands_on_lab: 50,
  networking_lunch: 35,
  panel_discussion: 0,
};

/**
 * Registers value functions for the event registration form.
 */
export function bootstrapEventRegistration(): void {
  registerValueFunctions({
    /**
     * Computes the total registration price from:
     *   - Base ticket price (ticketType)
     *   - Guest surcharge ($49 × guestCount)
     *   - Workshop add-ons (selected items in workshops CheckboxGroup)
     *
     * VIP tickets automatically include all workshops, so per-workshop
     * pricing is not applied when ticketType === "vip".
     */
    computeEventTotal: (context) => {
      const { values } = context;

      // --- Ticket base price ---
      const ticketType = typeof values.ticketType === "string" ? values.ticketType : "standard";
      const basePrice = TICKET_PRICES[ticketType] ?? 99;

      // --- Guest surcharge ---
      const rawGuests = values.guestCount;
      const guestCount =
        typeof rawGuests === "number" && isFinite(rawGuests) && rawGuests > 0
          ? Math.floor(rawGuests)
          : 0;
      const guestTotal = guestCount * GUEST_PRICE;

      // --- Workshop pricing ---
      // VIP tickets include all workshops at no extra charge
      let workshopTotal = 0;
      if (ticketType !== "vip") {
        const selectedWorkshops = values.workshops;
        if (Array.isArray(selectedWorkshops)) {
          workshopTotal = selectedWorkshops.reduce((sum: number, key: unknown) => {
            if (typeof key === "string" && key in WORKSHOP_PRICES) {
              return sum + WORKSHOP_PRICES[key];
            }
            return sum;
          }, 0);
        }
      }

      const total = basePrice + guestTotal + workshopTotal;
      return `$${total.toLocaleString("en-US")}`;
    },
  });
}
