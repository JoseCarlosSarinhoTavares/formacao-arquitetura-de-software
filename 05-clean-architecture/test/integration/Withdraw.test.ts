import { expect, test } from "vitest";
import AccountRepository from "../../src/AccountRepository.ts";
import { PaymentGatewayFake } from "../../src/PaymentGateway.ts";
import { Signup } from "../../src/Signup.ts";
import { GetAccount } from "../../src/GetAccount.ts";
import { Deposit } from "../../src/Deposit.ts";
import { Withdraw } from "../../src/Withdraw.ts";

test("Deve fazer um saque na conta", async (t) => {
    const accountRepository = new AccountRepository();
    const paymentGateway = new PaymentGatewayFake();
    const signup = new Signup(accountRepository);
    const getAccount = new GetAccount(accountRepository);
    const deposit = new Deposit(accountRepository, paymentGateway);
    const withdraw = new Withdraw(accountRepository);
    const inputSignup = {
        name: "John Doe",
        email: "john.doe@example.com",
        document: "974.563.215-58",
        password: "Password123"
    };
    const outputSignup = await signup.Execute(inputSignup);
    const inputDeposit = {
        accountId: outputSignup.accountId,
        assetId: "USD",
        quantity: 100,
        creditCardHolder: "John Doe",
        creditCardNumber: "4111111111111111",
        creditCardExpiration: "12/2027",
        creditCardCvv: "123"
    };
    await deposit.Execute(inputDeposit);
    const inputWithdraw = {
        accountId: outputSignup.accountId,
        assetId: "USD",
        quantity: 50
    };
    await withdraw.Execute(inputWithdraw);
    const outputGetAccount = await getAccount.Execute(outputSignup.accountId);
    expect(outputGetAccount.balances[0]?.assetId).toBe("USD");
    expect(outputGetAccount.balances[0]?.quantity).toBe(50);
});

test("Não deve fazer um saque em uma conta que não existe", async (t) => {
    const accountRepository = new AccountRepository();
    const withdraw = new Withdraw(accountRepository);
    const inputWithdraw = {
        accountId: crypto.randomUUID(),
        assetId: "USD",
        quantity: 50
    };
    await expect(withdraw.Execute(inputWithdraw)).rejects.toThrow("Account not found");
});

test("Não deve fazer um saque na conta com saldo insuficiente", async (t) => {
    const accountRepository = new AccountRepository();
    const paymentGateway = new PaymentGatewayFake();
    const signup = new Signup(accountRepository);
    const getAccount = new GetAccount(accountRepository);
    const deposit = new Deposit(accountRepository, paymentGateway);
    const withdraw = new Withdraw(accountRepository);
    const inputSignup = {
        name: "John Doe",
        email: "john.doe@example.com",
        document: "974.563.215-58",
        password: "Password123"
    };
    const outputSignup = await signup.Execute(inputSignup);
    const inputDeposit = {
        accountId: outputSignup.accountId,
        assetId: "USD",
        quantity: 50,
        creditCardHolder: "John Doe",
        creditCardNumber: "4111111111111111",
        creditCardExpiration: "12/2027",
        creditCardCvv: "123"
    };
    await deposit.Execute(inputDeposit);
    const inputWithdraw = {
        accountId: outputSignup.accountId,
        assetId: "USD",
        quantity: 100
    };
    await expect(withdraw.Execute(inputWithdraw)).rejects.toThrow("Insufficient balance");
});