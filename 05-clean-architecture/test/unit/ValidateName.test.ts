import { test, expect } from "vitest";
import { ValidateName } from "../../src/ValidateName.ts";

test("Deve validar o nome", () => {
  const name = "John Doe";
  const isValid = ValidateName(name);
  expect(isValid).toBe(true);
});

test.each([
  "John",
  undefined,
  null
])("Não deve validar o nome: %s", (name: any) => {
  const isValid = ValidateName(name);
  expect(isValid).toBe(false);
});