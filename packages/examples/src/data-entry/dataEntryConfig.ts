import { IFormConfig } from "@form-eng/core";

/**
 * Data Entry Configuration
 *
 * Demonstrates:
 * - Field arrays (repeating line items)
 * - Computed values (line total = qty * price, grand total = sum)
 * - Cross-field validation (end date after start date)
 * - Dropdown dependencies (subcategory depends on category)
 * - Numeric range validation
 */
export const dataEntryFormConfig: IFormConfig = {
  version: 2,
  fields: {
    // -- Header fields --
    invoiceNumber: {
      type: "Textbox",
      label: "Invoice Number",
      required: true,
      placeholder: "INV-001",
      computedValue: "$fn.setDate()",
      computeOnCreateOnly: true,
      readOnly: true,
      description: "Auto-generated on create",
    },
    category: {
      type: "Dropdown",
      label: "Category",
      required: true,
      options: [
        { value: "electronics", label: "Electronics" },
        { value: "office", label: "Office Supplies" },
        { value: "furniture", label: "Furniture" },
      ],
      rules: [
        {
          id: "category-electronics",
          when: { field: "category", operator: "equals", value: "electronics" },
          then: {
            fields: {
              subcategory: {
                options: [
                  { value: "laptops", label: "Laptops" },
                  { value: "monitors", label: "Monitors" },
                  { value: "keyboards", label: "Keyboards" },
                  { value: "mice", label: "Mice" },
                  { value: "cables", label: "Cables & Adapters" },
                ],
              },
            },
          },
        },
        {
          id: "category-office",
          when: { field: "category", operator: "equals", value: "office" },
          then: {
            fields: {
              subcategory: {
                options: [
                  { value: "paper", label: "Paper Products" },
                  { value: "pens", label: "Pens & Writing" },
                  { value: "binders", label: "Binders & Folders" },
                  { value: "tape", label: "Tape & Adhesives" },
                ],
              },
            },
          },
        },
        {
          id: "category-furniture",
          when: { field: "category", operator: "equals", value: "furniture" },
          then: {
            fields: {
              subcategory: {
                options: [
                  { value: "desks", label: "Desks" },
                  { value: "chairs", label: "Chairs" },
                  { value: "shelving", label: "Shelving" },
                  { value: "storage", label: "Storage Cabinets" },
                ],
              },
            },
          },
        },
      ],
    },
    subcategory: {
      type: "Dropdown",
      label: "Subcategory",
      required: true,
      options: [],
      description: "Select a category first",
    },
    startDate: {
      type: "DateControl",
      label: "Start Date",
      required: true,
      description: "Project or delivery start date",
    },
    endDate: {
      type: "DateControl",
      label: "End Date",
      required: true,
      description: "Must be after start date",
      validate: [
        {
          name: "custom",
          message: "End date must be after start date",
          params: { crossField: "startDate", comparison: "greaterThan" },
        },
      ],
    },

    // -- Line Items (Field Array) --
    lineItems: {
      type: "FieldArray",
      label: "Line Items",
      required: true,
      minItems: 1,
      maxItems: 20,
      items: {
        description: {
          type: "Textbox",
          label: "Description",
          required: true,
          placeholder: "Item description",
        },
        quantity: {
          type: "Number",
          label: "Quantity",
          required: true,
          defaultValue: 1,
          validate: [
            {
              name: "min",
              params: { min: 1 },
              message: "Quantity must be at least 1",
            },
            {
              name: "max",
              params: { max: 9999 },
              message: "Quantity cannot exceed 9999",
            },
          ],
        },
        unitPrice: {
          type: "Number",
          label: "Unit Price ($)",
          required: true,
          defaultValue: 0,
          validate: [
            {
              name: "min",
              params: { min: 0 },
              message: "Price cannot be negative",
            },
          ],
        },
        lineTotal: {
          type: "Number",
          label: "Line Total ($)",
          readOnly: true,
          computedValue: "$values.quantity * $values.unitPrice",
          description: "Automatically calculated",
        },
      },
    },

    // -- Totals --
    subtotal: {
      type: "Number",
      label: "Subtotal ($)",
      readOnly: true,
      computedValue: "$fn.sumLineItems()",
      description: "Sum of all line totals",
    },
    taxRate: {
      type: "Dropdown",
      label: "Tax Rate",
      required: true,
      defaultValue: "0.08",
      options: [
        { value: "0", label: "No Tax (0%)" },
        { value: "0.05", label: "5%" },
        { value: "0.08", label: "8%" },
        { value: "0.10", label: "10%" },
        { value: "0.13", label: "13% (HST)" },
      ],
    },
    taxAmount: {
      type: "Number",
      label: "Tax Amount ($)",
      readOnly: true,
      computedValue: "$values.subtotal * $values.taxRate",
      description: "Subtotal x tax rate",
    },
    grandTotal: {
      type: "Number",
      label: "Grand Total ($)",
      readOnly: true,
      computedValue: "$values.subtotal + $values.taxAmount",
      description: "Subtotal + tax",
    },

    // -- Notes --
    notes: {
      type: "Textarea",
      label: "Notes",
      required: false,
      placeholder: "Additional notes for this order...",
    },
  },
  fieldOrder: [
    "invoiceNumber",
    "category",
    "subcategory",
    "startDate",
    "endDate",
    "lineItems",
    "subtotal",
    "taxRate",
    "taxAmount",
    "grandTotal",
    "notes",
  ],
  settings: {
    manualSave: true,
  },
};
