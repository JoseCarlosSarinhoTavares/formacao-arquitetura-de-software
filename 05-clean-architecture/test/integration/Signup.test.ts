import { expect, test } from "vitest";
import { Signup } from "../../src/Signup.ts";
import AccountRepository from "../../src/AccountRepository.ts";
import { GetAccount } from "../../src/GetAccount.ts";

test("Deve criar uma conta", async (t) => {
    const accountRepository = new AccountRepository();
    const signup = new Signup(accountRepository);
    const getAccount = new GetAccount(accountRepository);
    const input = {
        name: "John Doe",
        email: "john.doe@example.com",
        document: "974.563.215-58",
        password: "Password123"
    };
    const outputSignup = await signup.Execute(input);
    const outputGetAccount = await getAccount.Execute(outputSignup.accountId);
    expect(outputGetAccount.accountId).toBe(outputSignup.accountId);
    expect(outputGetAccount.name).toBe(input.name);
    expect(outputGetAccount.email).toBe(input.email);
    expect(outputGetAccount.document).toBe(input.document);
    expect(outputGetAccount.password).toBe(input.password);
});