import { test, expect } from "vitest";
import Account, { type Balance } from "../../src/Account.ts";

test("Deve criar uma conta", () => {
    const account = Account.Create("John Doe", "john.doe@example.com", "71428793860", "asdQWE123");
    expect(account).toBeDefined();
    expect(account.accountId).toBeDefined();
    expect(account.GetName()).toBe("John Doe");
    expect(account.email).toBe("john.doe@example.com");
    expect(account.document).toBe("71428793860");
    expect(account.password).toBe("asdQWE123");
    expect(account.balances).toEqual([]);
});

test("Deve restaurar o estado de uma conta", () => {
    const accountId = crypto.randomUUID();
    const balances: Balance[] = [];
    const account = new Account(accountId, "John Doe", "john.doe@example.com", "71428793860", "asdQWE123", balances);
    expect(account).toBeDefined();
    expect(account.accountId).toBeDefined();
    expect(account.GetName()).toBe("John Doe");
    expect(account.email).toBe("john.doe@example.com");
    expect(account.document).toBe("71428793860");
    expect(account.password).toBe("asdQWE123");
    expect(account.balances).toEqual([]);
});

test("Não deve criar uma conta com nome inválido", () => {
    expect(() => {
        Account.Create("john", "john.doe@example.com", "71428793860", "asdQWE123");
    }).toThrow((new Error("Invalid name")));
});

test("Não deve criar uma conta com email inválido", () => {
    expect(() => {
        Account.Create("John Doe", "john.doe", "71428793860", "asdQWE123");
    }).toThrow((new Error("Invalid email")));
});

test("Não deve criar uma conta com documento inválido", () => {
    expect(() => {
        Account.Create("John Doe", "john.doe@example.com", "714287938", "asdQWE123");
    }).toThrow((new Error("Invalid document")));
});

test("Não deve criar uma conta com senha inválida", () => {
    expect(() => {
        Account.Create("John Doe", "john.doe@example.com", "71428793860", "asdWER");
    }).toThrow((new Error("Invalid password")));
});

test("Deve depositar em uma conta", () => {
    const account = Account.Create("John Doe", "john.doe@example.com", "71428793860", "asdQWE123");
    account.Deposit("USD", 100);
    expect(account.GetBalances("USD")).toBe(100);
});

test("Deve fazer dois depósitos em uma conta", () => {
    const account = Account.Create("John Doe", "john.doe@example.com", "71428793860", "asdQWE123");
    account.Deposit("USD", 100);
    account.Deposit("USD", 100);
    expect(account.GetBalances("USD")).toBe(200);
});