/**
 * Shared adapter utilities subpath export.
 *
 * Import as: import { ... } from "@formosaic/core/adapter-utils"
 *
 * These utilities are shared across all adapter packages (fluent, mui, headless, etc.)
 * for consistent field rendering, formatting, and test attribute generation.
 */

// Field utilities
export {
  GetFieldDataTestId,
  FieldClassName,
  getFieldState,
  formatDateTime,
  formatDateTimeValue,
  formatDateRange,
  getFileNames,
  extractDigits,
  formatPhone,
  ellipsifyText,
  MAX_FILE_SIZE_MB_DEFAULT,
  DocumentLinksStrings,
} from "./helpers/FieldUtils";

// Field config interfaces
export type {
  IRatingConfig,
  IDateRangeConfig,
  IDateRangeValue,
  IDateTimeConfig,
  IFileUploadConfig,
  IPhoneInputConfig,
} from "./types/IFieldConfigs";

// Utility functions used by adapters
export { convertBooleanToYesOrNoText, isNull } from "./utils";

// HTML sanitizer for rich-text read-only rendering
export { sanitizeHtml } from "./utils/sanitizeHtml";
