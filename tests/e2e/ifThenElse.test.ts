import Ajv from "ajv";

import { FromSchema } from "index";

var ajv = new Ajv();

describe("If/Then/Else schemas", () => {
  describe("if, then & else", () => {
    const petSchema = {
      type: "object",
      properties: {
        type: { enum: ["cat", "dog"] },
        dogRace: { type: "string" },
        catRace: { type: "string" },
      },
      required: ["type"],
      if: { properties: { type: { const: "dog" } } },
      then: {
        required: ["dogRace"],
      },
      else: {
        required: ["catRace"],
      },
    } as const;

    type Pet = FromSchema<typeof petSchema>;
    let petInstance: Pet;

    it("accepts valid dogs", () => {
      petInstance = { type: "dog", dogRace: "poodle" };
      expect(ajv.validate(petSchema, petInstance)).toBe(true);
    });

    it("accepts valid cats", () => {
      petInstance = { type: "cat", catRace: "persan" };
      expect(ajv.validate(petSchema, petInstance)).toBe(true);
    });

    it("rejects invalid dogs/cats", () => {
      // @ts-expect-error
      petInstance = { type: "dog" };
      expect(ajv.validate(petSchema, petInstance)).toBe(false);

      // Unable to throw as "dog" type is not perceived as impossible in else case
      petInstance = { type: "dog", catRace: "persan" };
      expect(ajv.validate(petSchema, petInstance)).toBe(false);

      // @ts-expect-error
      petInstance = { type: "cat" };
      expect(ajv.validate(petSchema, petInstance)).toBe(false);

      // @ts-expect-error
      petInstance = { type: "cat", dogRace: "poodle" };
      expect(ajv.validate(petSchema, petInstance)).toBe(false);

      // @ts-expect-error
      petInstance = { type: "duck" };
      expect(ajv.validate(petSchema, petInstance)).toBe(false);
    });
  });

  describe("only if & then", () => {
    const petSchema = {
      type: "object",
      properties: {
        type: { enum: ["cat", "dog"] },
        dogRace: { type: "string" },
        catRace: { type: "string" },
      },
      required: ["type"],
      if: { properties: { type: { const: "dog" } } },
      then: {
        required: ["dogRace"],
      },
    } as const;

    type Pet = FromSchema<typeof petSchema>;
    let petInstance: Pet;

    it("accepts valid dogs", () => {
      petInstance = { type: "dog", dogRace: "poodle" };
      expect(ajv.validate(petSchema, petInstance)).toBe(true);
    });

    it("accepts valid cats", () => {
      petInstance = { type: "cat" };
      expect(ajv.validate(petSchema, petInstance)).toBe(true);

      petInstance = { type: "cat", catRace: "persan" };
      expect(ajv.validate(petSchema, petInstance)).toBe(true);

      petInstance = { type: "cat", dogRace: "poodle" };
      expect(ajv.validate(petSchema, petInstance)).toBe(true);
    });

    it("rejects invalid dogs/cats", () => {
      // Unable to throw as "dog" type is not perceived as impossible in else case
      petInstance = { type: "dog" };
      expect(ajv.validate(petSchema, petInstance)).toBe(false);

      // Unable to throw as "dog" type is not excluded in else case
      petInstance = { type: "dog", catRace: "persan" };
      expect(ajv.validate(petSchema, petInstance)).toBe(false);

      // @ts-expect-error
      petInstance = { type: "duck" };
      expect(ajv.validate(petSchema, petInstance)).toBe(false);
    });
  });

  describe("only if & else", () => {
    const petSchema = {
      type: "object",
      properties: {
        type: { enum: ["cat", "dog"] },
        dogRace: { type: "string" },
        catRace: { type: "string" },
      },
      required: ["type"],
      if: { properties: { type: { const: "dog" } } },
      else: {
        required: ["catRace"],
      },
    } as const;

    type Pet = FromSchema<typeof petSchema>;
    let petInstance: Pet;

    it("accepts valid dogs", () => {
      petInstance = { type: "dog" };
      expect(ajv.validate(petSchema, petInstance)).toBe(true);

      petInstance = { type: "dog", dogRace: "poodle" };
      expect(ajv.validate(petSchema, petInstance)).toBe(true);

      petInstance = { type: "dog", catRace: "persan" };
      expect(ajv.validate(petSchema, petInstance)).toBe(true);
    });

    it("accepts valid cats", () => {
      petInstance = { type: "cat", catRace: "persan" };
      expect(ajv.validate(petSchema, petInstance)).toBe(true);
    });

    it("rejects invalid dogs/cats", () => {
      // @ts-expect-error
      petInstance = { type: "cat" };
      expect(ajv.validate(petSchema, petInstance)).toBe(false);

      // @ts-expect-error
      petInstance = { type: "cat", dogRace: "poodle" };
      expect(ajv.validate(petSchema, petInstance)).toBe(false);

      // @ts-expect-error
      petInstance = { type: "duck" };
      expect(ajv.validate(petSchema, petInstance)).toBe(false);
    });
  });

  describe("additional items (incorrect)", () => {
    const petSchema = {
      type: "array",
      items: [
        { enum: ["cat", "dog"] },
        { enum: ["poodle", "beagle", "husky"] },
      ],
      if: {
        items: [{ const: "dog" }],
      },
      then: { minItems: 2, additionalItems: false },
      else: { maxItems: 1 },
    } as const;

    type Pet = FromSchema<typeof petSchema>;
    let petInstance: Pet;

    it("rejects invalid dog instances", () => {
      // error is not throwed at the moment because we cannot differ "cat" from "dog" in else statement (exclusion)
      petInstance = ["dog"];
      expect(ajv.validate(petSchema, petInstance)).toBe(false);

      // accepts additionalItems as additionalItems is not bound to items
      petInstance = ["dog", "poodle", "other"];
      expect(ajv.validate(petSchema, petInstance)).toBe(true);
    });
  });

  describe("additional items (correct)", () => {
    const petSchema = {
      type: "array",
      items: [
        { enum: ["cat", "dog"] },
        { enum: ["poodle", "beagle", "husky"] },
      ],
      if: {
        items: [{ const: "dog" }],
      },
      then: { items: [{ const: "dog" }], additionalItems: false },
    } as const;

    type Pet = FromSchema<typeof petSchema>;
    let petInstance: Pet;

    it("rejects invalid dog instances", () => {
      petInstance = ["dog"];
      expect(ajv.validate(petSchema, petInstance)).toBe(true);

      // error is not throwed at the moment because we cannot differ "cat" from "dog" in else statement (exclusion)
      petInstance = ["dog", "poodle", "other"];
      expect(ajv.validate(petSchema, petInstance)).toBe(false);
    });
  });
});
