import { expect, test, describe } from "vitest";
import type { ZodError } from "zod";
import { zIntegrationParameter, zIntegrationParameters } from "./integration-parameters";

describe("Integration Parameter Schema", () => {
  describe("Success", () => {
    test("Generate a integration parameter type switch", () => {
      const data = {
        type: "switch",
        default: true,
      };

      const result = zIntegrationParameter.parse(data);

      expect(result.default).toBeTruthy();
      expect(result.type).toBe("switch");
      expect(result.group).toBe("main");
      expect(result.name).toBe("");
    });

    test("Generate a integration parameter type text", () => {
      const data = {
        type: "text",
        group: "advanced",
      };

      const result = zIntegrationParameter.parse(data);
      expect(result.type).toBe("text");
      expect(result.group).toBe("advanced");
    });

    test("Generate a integration parameter type dropdown", () => {
      const data = {
        type: "dropdown",
        label: "test",
        options: [
          {
            is_default: false,
            label: "test",
            value: "test",
          },
        ],
      };

      const result = zIntegrationParameter.parse(data);
      expect(result.type).toBe("dropdown");
      expect(result.label).toBe("test");
      // @ts-expect-error
      expect(result.options).toHaveLength(1);
      // @ts-expect-error
      expect(result.options[0].label).toBe("test");
    });

    test("Generate a integration parameter type text", () => {
      const data = {
        type: "number",
        default: "10",
        label: "type a number",
        name: "age",
      };

      const result = zIntegrationParameter.parse(data);
      expect(result.type).toBe("number");
      expect(result.default).toBe("10");
      expect(result.label).toBe("type a number");
      expect(result.name).toBe("age");
    });

    test("Generate a integration parameter list", () => {
      const data = [
        {
          type: "number",
          default: "10",
          label: "type a number",
          name: "age",
        },
      ];

      const result = zIntegrationParameters.parse(data);

      const r = JSON.parse(result);

      expect(r[0].type).toBe("number");
      expect(r[0].default).toBe("10");
      expect(r[0].label).toBe("type a number");
      expect(r[0].name).toBe("age");
    });
  });

  describe("Error", () => {
    test("Can't generate a parameter invalid default value", () => {
      try {
        const data = {
          type: "switch",
          default: 0,
        };
        zIntegrationParameter.parse(data);
      } catch (error) {
        const errorF = (error as ZodError).flatten();
        expect(errorF.fieldErrors.default?.[0]).toBe("Expected boolean, received number");
      }
    });

    test("Can't generate a parameter invalid type", () => {
      try {
        const data = {
          type: "test",
          default: 0,
        };
        zIntegrationParameter.parse(data);
      } catch (error) {
        const errorF = (error as ZodError).flatten();
        expect(errorF.fieldErrors.type?.[0]).toContain("Invalid discriminator value");
      }
    });

    test("Can't generate a parameter invalid group", () => {
      try {
        const data = {
          group: "test",
          default: 0,
        };
        zIntegrationParameter.parse(data);
      } catch (error) {
        const errorF = (error as ZodError).flatten();
        expect(errorF.fieldErrors.group?.[0]).toContain("Invalid enum value");
      }
    });

    test("Can't generate a parameter invalid name", () => {
      try {
        const data = {
          group: "test",
          name: true,
        };
        zIntegrationParameter.parse(data);
      } catch (error) {
        const errorF = (error as ZodError).flatten();
        expect(errorF.fieldErrors.name?.[0]).toBe("Expected string, received boolean");
      }
    });

    test("Can't generate a parameter invalid type dropdown", () => {
      try {
        const data = {
          type: "dropdown",
          group: "main",
          options: true,
        };
        zIntegrationParameter.parse(data);
      } catch (error) {
        const errorF = (error as ZodError).flatten();
        expect(errorF.fieldErrors.options?.[0]).toBe("Expected array, received boolean");
      }
    });

    test("Can't generate a parameter invalid type dropdown options array", () => {
      try {
        const data = {
          type: "dropdown",
          group: "main",
          options: [
            {
              label: true,
            },
          ],
        };
        zIntegrationParameter.parse(data);
      } catch (error) {
        const errorF = (error as ZodError).flatten();
        expect(errorF.fieldErrors.options?.[0]).toBe("Expected string, received boolean");
      }
    });

    test("Can't generate a parameter when array", () => {
      try {
        const data = [
          {
            type: "test",
            group: "main",
            options: [
              {
                label: true,
              },
            ],
          },
        ];
        zIntegrationParameters.parse(data);
      } catch (error) {
        const errorF = (error as ZodError).flatten();
        expect(errorF.fieldErrors?.["0"]?.[0]).toContain("Invalid discriminator value");
      }
    });
  });
});
