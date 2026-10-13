import { test, expect } from "vitest";
import { ValidateEmail } from "../../src/ValidateEmail.ts";

test("Deve validar o email: %s", () => {
  const email = "john.doe@example.com";
  const isValid = ValidateEmail(email);
  expect(isValid).toBe(true);
});

test.each([
  "john",
  "john.doe",
  "john.doe@",
  "john.doe@example"
])("Não deve validar ser um email válido: %s", (email: any) => {
  const isValid = ValidateEmail(email);
  expect(isValid).toBe(false);
});