import { expect, test } from "vitest";
import AccountDAO from "../../src/AccountDAO.ts";

test("Deve persistir uma conta", async (t) => {
    const accountDAO = new AccountDAO();
    const account = {
        accountId: crypto.randomUUID(),
        name: "John Doe",
        email: "john.doe@example.com",
        document: "974.563.215-58",
        password: "Password123"
    };
    await accountDAO.Save(account);
    const saveAccount = await accountDAO.GetById(account.accountId);
    expect(saveAccount.accountId).toBe(account.accountId);
    expect(saveAccount.name).toBe(account.name);
    expect(saveAccount.email).toBe(account.email);
    expect(saveAccount.document).toBe(account.document);
    expect(saveAccount.password).toBe(account.password);
});