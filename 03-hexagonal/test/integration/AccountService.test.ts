import { expect, test } from "vitest";
import AccountData, { AccountDataFake } from "../../src/AccountData.ts";
import { AccountService } from "../../src/AccountService.ts";

test("Deve criar uma conta", async (t) => {
    const accountData = new AccountData();
    //const accountData = new AccountDataFake();
    const accountService = new AccountService(accountData);
    const input = {
        name: "John Doe",
        email: "john.doe@example.com",
        document: "974.563.215-58",
        password: "Password123"
    };
    const outputSignup = await accountService.Signup(input);
    const outputGetAccount = await accountService.GetAccount(outputSignup.accountId);
    expect(outputGetAccount.accountId).toBe(outputSignup.accountId);
    expect(outputGetAccount.name).toBe(input.name);
    expect(outputGetAccount.email).toBe(input.email);
    expect(outputGetAccount.document).toBe(input.document);
    expect(outputGetAccount.password).toBe(input.password);
});