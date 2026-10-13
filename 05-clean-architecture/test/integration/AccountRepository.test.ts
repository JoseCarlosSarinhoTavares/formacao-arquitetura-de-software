import { expect, test } from "vitest";
import AccountRepository from "../../src/AccountRepository.ts";
import Account from "../../src/Account.ts";

test("Deve persistir uma conta", async (t) => {
    const accountRepository = new AccountRepository();
    const account = Account.Create("John Doe", "john.doe@example.com", "97456321558", "Password123");
    await accountRepository.Save(account);
    const saveAccount = await accountRepository.GetById(account.accountId);
    expect(saveAccount.accountId).toBe(account.accountId);
    expect(saveAccount.GetName()).toBe(account.GetName());
    expect(saveAccount.email).toBe(account.email);
    expect(saveAccount.document).toBe(account.document);
    expect(saveAccount.password).toBe(account.password);
});

test("Deve persistir uma conta com recursos", async (t) => {
    const accountRepository = new AccountRepository();
    const account = Account.Create("John Doe", "john.doe@example.com", "97456321558", "Password123");
    account.Deposit("USD", 100);
    await accountRepository.Save(account);
    const saveAccount = await accountRepository.GetById(account.accountId);
    expect(saveAccount.balances[0]?.assetId).toBe("USD");
    expect(saveAccount.balances[0]?.quantity).toBe(100);
});

test("Deve atualizar uma conta com recursos", async (t) => {
    const accountRepository = new AccountRepository();
    const account = Account.Create("John Doe", "john.doe@example.com", "97456321558", "Password123");
    account.Deposit("USD", 100);
    await accountRepository.Save(account);
    const saveAccount = await accountRepository.GetById(account.accountId);
    saveAccount.SetName("john Cooper");
    saveAccount.Deposit("USD", 1000);
    await accountRepository.Update(saveAccount);
    const updatedAccount = await accountRepository.GetById(account.accountId);
    expect(updatedAccount.GetName()).toBe("john Cooper");
    expect(updatedAccount.balances[0]?.assetId).toBe("USD");
    expect(updatedAccount.balances[0]?.quantity).toBe(1100);
});