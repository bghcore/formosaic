import { runAdapterContractTests, TIER_1_FIELDS } from "@form-eng/core/testing";
import { createHeroUIFieldRegistry } from "../registry";

runAdapterContractTests(createHeroUIFieldRegistry, {
  suiteName: "HeroUI",
  onlyTypes: [...TIER_1_FIELDS, "Rating", "Autocomplete", "DateTime", "DateRange", "PhoneInput", "FileUpload", "ColorPicker", "MultiSelectSearch", "StatusDropdown", "ReadOnlyArray", "ReadOnlyDateTime", "ReadOnlyRichText", "ReadOnlyWithButton"],
});
