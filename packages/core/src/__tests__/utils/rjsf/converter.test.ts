import { describe, it, expect } from "vitest";
import type { IFieldConfig } from "../../../types/IFieldConfig";
import { fromRjsfSchema } from "../../../utils/rjsf/converter";

/** Cast helper: fromRjsfSchema always returns resolved IFieldConfig (never templateRefs). */
const f = (fields: Record<string, unknown>, key: string): IFieldConfig =>
  fields[key] as IFieldConfig;

describe("fromRjsfSchema", () => {
  describe("basic field mapping", () => {
    it("should convert a simple schema with string properties", () => {
      const result = fromRjsfSchema({
        type: "object",
        properties: {
          name: { type: "string", title: "Name" },
          email: { type: "string", format: "email", title: "Email" },
        },
        required: ["name"],
      });

      expect(result.version).toBe(2);
      expect(f(result.fields, "name").type).toBe("Textbox");
      expect(f(result.fields, "name").label).toBe("Name");
      expect(f(result.fields, "name").required).toBe(true);
      expect(f(result.fields, "email").type).toBe("Textbox");
      expect(f(result.fields, "email").validate).toContainEqual({ name: "email" });
    });

    it("should convert all basic types", () => {
      const result = fromRjsfSchema({
        type: "object",
        properties: {
          text: { type: "string" },
          num: { type: "number" },
          int: { type: "integer" },
          bool: { type: "boolean" },
          dropdown: { type: "string", enum: ["a", "b"] },
          date: { type: "string", format: "date" },
        },
      });

      expect(f(result.fields, "text").type).toBe("Textbox");
      expect(f(result.fields, "num").type).toBe("Number");
      expect(f(result.fields, "int").type).toBe("Number");
      expect(f(result.fields, "bool").type).toBe("Toggle");
      expect(f(result.fields, "dropdown").type).toBe("Dropdown");
      expect(f(result.fields, "date").type).toBe("DateControl");
    });

    it("should handle empty schema", () => {
      const result = fromRjsfSchema({ type: "object" });
      expect(result.version).toBe(2);
      expect(result.fields).toEqual({});
      expect(result.fieldOrder).toEqual([]);
    });
  });

  describe("$ref resolution", () => {
    it("should resolve $ref before mapping", () => {
      const result = fromRjsfSchema({
        type: "object",
        definitions: {
          Name: { type: "string", title: "Name" },
        },
        properties: {
          name: { $ref: "#/definitions/Name" },
        },
      });

      expect(f(result.fields, "name").type).toBe("Textbox");
      expect(f(result.fields, "name").label).toBe("Name");
    });
  });

  describe("allOf merging", () => {
    it("should merge allOf schemas before mapping", () => {
      const result = fromRjsfSchema({
        type: "object",
        allOf: [
          {
            properties: { name: { type: "string" } },
            required: ["name"],
          },
          {
            properties: { age: { type: "number" } },
          },
        ],
      });

      expect(result.fields.name).toBeDefined();
      expect(f(result.fields, "name").required).toBe(true);
      expect(result.fields.age).toBeDefined();
    });
  });

  describe("uiSchema application", () => {
    it("should apply uiSchema overrides", () => {
      const result = fromRjsfSchema(
        {
          type: "object",
          properties: {
            bio: { type: "string" },
          },
        },
        {
          bio: {
            "ui:widget": "textarea",
            "ui:placeholder": "Tell us about yourself",
          },
        }
      );

      expect(f(result.fields, "bio").type).toBe("Textarea");
      expect(f(result.fields, "bio").placeholder).toBe("Tell us about yourself");
    });

    it("should use ui:order for fieldOrder", () => {
      const result = fromRjsfSchema(
        {
          type: "object",
          properties: {
            a: { type: "string" },
            b: { type: "string" },
            c: { type: "string" },
          },
        },
        { "ui:order": ["c", "a", "b"] }
      );

      expect(result.fieldOrder).toEqual(["c", "a", "b"]);
    });

    it("should expand * wildcard in ui:order", () => {
      const result = fromRjsfSchema(
        {
          type: "object",
          properties: {
            a: { type: "string" },
            b: { type: "string" },
            c: { type: "string" },
          },
        },
        { "ui:order": ["c", "*"] }
      );

      expect(result.fieldOrder![0]).toBe("c");
      expect(result.fieldOrder).toContain("a");
      expect(result.fieldOrder).toContain("b");
    });
  });

  describe("formData defaults", () => {
    it("should merge formData as defaultValues", () => {
      const result = fromRjsfSchema(
        {
          type: "object",
          properties: {
            name: { type: "string" },
            age: { type: "number" },
          },
        },
        undefined,
        { name: "John", age: 30 }
      );

      expect(f(result.fields, "name").defaultValue).toBe("John");
      expect(f(result.fields, "age").defaultValue).toBe(30);
    });

    it("should not override schema default with formData", () => {
      const result = fromRjsfSchema(
        {
          type: "object",
          properties: {
            name: { type: "string", default: "Default" },
          },
        },
        undefined,
        { name: "Override" }
      );

      expect(f(result.fields, "name").defaultValue).toBe("Default");
    });
  });

  describe("nested objects (flatten strategy)", () => {
    it("should flatten nested objects with dot-notation keys", () => {
      const result = fromRjsfSchema({
        type: "object",
        properties: {
          address: {
            type: "object",
            properties: {
              street: { type: "string", title: "Street" },
              city: { type: "string", title: "City" },
            },
            required: ["street"],
          },
        },
      });

      expect(result.fields["address.street"]).toBeDefined();
      expect(f(result.fields, "address.street").label).toBe("Street");
      expect(f(result.fields, "address.street").required).toBe(true);
      expect(result.fields["address.city"]).toBeDefined();
    });
  });

  describe("array fields", () => {
    it("should convert array with object items to FieldArray", () => {
      const result = fromRjsfSchema({
        type: "object",
        properties: {
          contacts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                phone: { type: "string" },
              },
              required: ["name"],
            },
          },
        },
      });

      expect(f(result.fields, "contacts").type).toBe("FieldArray");
      expect(f(result.fields, "contacts").items).toBeDefined();
      expect(f(result.fields, "contacts").items!.name.required).toBe(true);
    });

    it("should convert array with enum items to Multiselect", () => {
      const result = fromRjsfSchema({
        type: "object",
        properties: {
          tags: {
            type: "array",
            items: { type: "string", enum: ["a", "b", "c"] },
          },
        },
      });

      expect(f(result.fields, "tags").type).toBe("Multiselect");
    });
  });

  describe("dependencies", () => {
    it("should convert property dependencies to rules", () => {
      const result = fromRjsfSchema({
        type: "object",
        properties: {
          credit_card: { type: "string" },
          billing_address: { type: "string" },
        },
        dependencies: {
          credit_card: ["billing_address"],
        },
      });

      expect(f(result.fields, "billing_address").rules).toHaveLength(1);
      expect(f(result.fields, "billing_address").rules![0].when).toEqual({
        field: "credit_card",
        operator: "isNotEmpty",
      });
    });

    it("should convert schema dependencies to visibility rules", () => {
      const result = fromRjsfSchema({
        type: "object",
        properties: {
          credit_card: { type: "string" },
        },
        dependencies: {
          credit_card: {
            properties: {
              billing_address: { type: "string", title: "Billing Address" },
            },
            required: ["billing_address"],
          },
        },
      });

      expect(result.fields.billing_address).toBeDefined();
      expect(f(result.fields, "billing_address").hidden).toBe(true);
      expect(f(result.fields, "billing_address").rules).toHaveLength(1);
    });
  });

  describe("if/then/else", () => {
    it("should convert if/then/else to rules", () => {
      const result = fromRjsfSchema({
        type: "object",
        properties: {
          animal: { type: "string", enum: ["cat", "dog"] },
        },
        if: {
          properties: { animal: { const: "cat" } },
        },
        then: {
          properties: {
            indoor: { type: "boolean", title: "Indoor cat?" },
          },
        },
        else: {
          properties: {
            breed: { type: "string", title: "Dog breed" },
          },
        },
      });

      expect(result.fields.indoor).toBeDefined();
      expect(f(result.fields, "indoor").rules).toHaveLength(1);
      expect(f(result.fields, "indoor").rules![0].when).toEqual({
        field: "animal",
        operator: "equals",
        value: "cat",
      });

      expect(result.fields.breed).toBeDefined();
      expect(f(result.fields, "breed").rules).toHaveLength(1);
    });
  });

  describe("oneOf/anyOf composition", () => {
    it("should convert oneOf with discriminator to dropdown + rules", () => {
      const result = fromRjsfSchema({
        type: "object",
        oneOf: [
          {
            properties: {
              entity_type: { const: "person" },
              first_name: { type: "string" },
            },
          },
          {
            properties: {
              entity_type: { const: "company" },
              company_name: { type: "string" },
            },
          },
        ],
      });

      expect(f(result.fields, "entity_type").type).toBe("Dropdown");
      expect(f(result.fields, "first_name").rules).toHaveLength(1);
      expect(f(result.fields, "company_name").rules).toHaveLength(1);
    });
  });

  describe("real-world RJSF schema", () => {
    it("should convert a complete RJSF registration form", () => {
      const result = fromRjsfSchema(
        {
          type: "object",
          definitions: {
            address: {
              type: "object",
              properties: {
                street: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
              },
              required: ["street", "city"],
            },
          },
          properties: {
            firstName: { type: "string", title: "First name", minLength: 1 },
            lastName: { type: "string", title: "Last name" },
            age: { type: "integer", title: "Age", minimum: 0, maximum: 150 },
            email: { type: "string", title: "Email", format: "email" },
            address: { $ref: "#/definitions/address" },
            newsletter: { type: "boolean", title: "Subscribe to newsletter" },
          },
          required: ["firstName", "lastName"],
        },
        {
          firstName: { "ui:autofocus": true },
          age: { "ui:widget": "updown" },
          email: { "ui:placeholder": "you@example.com" },
          "ui:order": ["firstName", "lastName", "email", "age", "*"],
        }
      );

      expect(result.version).toBe(2);
      expect(f(result.fields, "firstName").required).toBe(true);
      expect(f(result.fields, "firstName").config?.autofocus).toBe(true);
      expect(f(result.fields, "age").type).toBe("Number");
      expect(f(result.fields, "email").placeholder).toBe("you@example.com");
      expect(f(result.fields, "newsletter").type).toBe("Toggle");
      // Flattened address
      expect(result.fields["address.street"]).toBeDefined();
      expect(result.fields["address.city"]).toBeDefined();
      // Field order
      expect(result.fieldOrder![0]).toBe("firstName");
      expect(result.fieldOrder![1]).toBe("lastName");
    });
  });

  describe("options", () => {
    it("should use custom ruleIdPrefix", () => {
      const result = fromRjsfSchema(
        {
          type: "object",
          properties: { a: { type: "string" }, b: { type: "string" } },
          dependencies: { a: ["b"] },
        },
        undefined,
        undefined,
        { ruleIdPrefix: "myapp" }
      );

      expect(f(result.fields, "b").rules![0].id).toContain("myapp");
    });

    it("should use fieldArray strategy for nested objects", () => {
      const result = fromRjsfSchema(
        {
          type: "object",
          properties: {
            address: {
              type: "object",
              properties: {
                street: { type: "string" },
                city: { type: "string" },
              },
            },
          },
        },
        undefined,
        undefined,
        { nestedObjectStrategy: "fieldArray" }
      );

      expect(f(result.fields, "address").type).toBe("FieldArray");
      expect(f(result.fields, "address").items).toBeDefined();
    });
  });
});
