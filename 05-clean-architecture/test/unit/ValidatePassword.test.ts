import { test, expect } from "vitest";
import { ValidatePassword } from "../../src/ValidatePassword.ts";

test("Deve validar a senha: %s", () => {
  const password = "asdQWE123";
  const isValid = ValidatePassword(password);
  expect(isValid).toBe(true);
});

test.each([
  "asdQWE",
  "asdfghjkl",
  "ASDFGHJKL",
  "12345678",
  "asdfQWER",
  "1234QWER"
])("Não deve validar ser uma senha válida: %s", (password: any) => {
  const isValid = ValidatePassword(password);
  expect(isValid).toBe(false);
});