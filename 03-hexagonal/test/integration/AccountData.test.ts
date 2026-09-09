import { expect, test } from "vitest";
import AccountData from "../../src/AccountData.ts";

test("Deve persistir uma conta", async (t) => {
    const accountData = new AccountData();
    const account = {
        accountId: crypto.randomUUID(),
        name: "John Doe",
        email: "john.doe@example.com",
        document: "974.563.215-58",
        password: "Password123"
    };
    await accountData.Save(account);
    const saveAccount = await accountData.GetById(account.accountId);
    expect(saveAccount.accountId).toBe(account.accountId);
    expect(saveAccount.name).toBe(account.name);
    expect(saveAccount.email).toBe(account.email);
    expect(saveAccount.document).toBe(account.document);
    expect(saveAccount.password).toBe(account.password);
});