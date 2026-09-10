import { expect, test } from "vitest";
import AccountData, { AccountDataFake } from "../../src/AccountData.ts";
import { AccountService } from "../../src/AccountService.ts";
import sinon from "sinon";
import BalanceData from "../../src/BalanceData.ts";
import PaymentGateway from "../../src/PaymentGateway.ts";

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

test("Deve fazer um depósito em uma conta com stub", async (t) => {
    const accountData = new AccountData();
    const accountService = new AccountService(accountData);
    const upsertStub = sinon.stub(BalanceData.prototype, "upsert").resolves();
    const listByAccountIdStub = sinon.stub(BalanceData.prototype, "ListByAccountId").resolves([
        {
            accountId: "1",
            assetId: "USD",
            quantity: 100
        }
    ]);
    const inputSignup = {
        name: "John Doe",
        email: "john.doe@example.com",
        document: "974.563.215-58",
        password: "Password123"
    };
    const outputSignup = await accountService.Signup(inputSignup);
    const inputDeposit = {
        accountId: outputSignup.accountId,
        assetId: "USD",
        quantity: 100,
        creditCardHolder: "John Doe",
        creditCardNumber: "4111111111111111",
        creditCardExpiration: "12/2027",
        creditCardCvv: "123"
    };
    await accountService.Deposit(inputDeposit);
    const outputGetAccount = await accountService.GetAccount(outputSignup.accountId);
    expect(outputGetAccount.balances[0]?.assetId).toBe("USD");
    expect(outputGetAccount.balances[0]?.quantity).toBe(100);
    upsertStub.restore();
    listByAccountIdStub.restore();
});

test("Deve fazer dois depósitos do mesmo tipo de recursoem uma conta", async (t) => {
    const accountData = new AccountData();
    const accountService = new AccountService(accountData);
    const inputSignup = {
        name: "John Doe",
        email: "john.doe@example.com",
        document: "974.563.215-58",
        password: "Password123"
    };
    const outputSignup = await accountService.Signup(inputSignup);
    const inputDeposit = {
        accountId: outputSignup.accountId,
        assetId: "USD",
        quantity: 100,
        creditCardHolder: "John Doe",
        creditCardNumber: "4111111111111111",
        creditCardExpiration: "12/2027",
        creditCardCvv: "123"
    };
    await accountService.Deposit(inputDeposit);
    await accountService.Deposit(inputDeposit);
    const outputGetAccount = await accountService.GetAccount(outputSignup.accountId);
    expect(outputGetAccount.balances[0]?.assetId).toBe("USD");
    expect(outputGetAccount.balances[0]?.quantity).toBe(200);
});

test.only("Deve fazer um depósito em uma conta com spy", async (t) => {
    const accountData = new AccountData();
    const accountService = new AccountService(accountData);
    const processTransactionSpy = sinon.spy(PaymentGateway.prototype, "processTransaction");
    const inputSignup = {
        name: "John Doe",
        email: "john.doe@example.com",
        document: "974.563.215-58",
        password: "Password123"
    };
    const outputSignup = await accountService.Signup(inputSignup);
    const inputDeposit = {
        accountId: outputSignup.accountId,
        assetId: "USD",
        quantity: 100,
        creditCardHolder: "John Doe",
        creditCardNumber: "4111111111111111",
        creditCardExpiration: "12/2027",
        creditCardCvv: "123"
    };
    await accountService.Deposit(inputDeposit);
    const outputGetAccount = await accountService.GetAccount(outputSignup.accountId);
    expect(outputGetAccount.balances[0]?.assetId).toBe("USD");
    expect(outputGetAccount.balances[0]?.quantity).toBe(100);
    expect(processTransactionSpy.calledOnce).toBe(true);
    expect(processTransactionSpy.calledWith({
        creditCardHolder: inputDeposit.creditCardHolder,
        creditCardNumber: inputDeposit.creditCardNumber,
        creditCardExpDate: inputDeposit.creditCardExpiration,
        creditCardCvv: inputDeposit.creditCardCvv,
        amount: inputDeposit.quantity
    })).toBe(true);
    processTransactionSpy.restore();
});