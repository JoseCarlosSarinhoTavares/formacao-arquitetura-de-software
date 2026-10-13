import { expect, test } from "vitest";
import AccountRepository, { AccountRepositoryFake } from "../../src/AccountRepository.ts";
import { AccountService } from "../../src/AccountService.ts";
import sinon from "sinon";
import { PaymentGatewayFake, PaymentGatewayHttp } from "../../src/PaymentGateway.ts";
import Account from "../../src/Account.ts";

test("Deve criar uma conta", async (t) => {
    const accountRepository = new AccountRepository();
    const paymentGateway = new PaymentGatewayFake();
    const accountService = new AccountService(accountRepository, paymentGateway);
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

test("Deve fazer dois depósitos do mesmo tipo de recurso em uma conta", async (t) => {
    const accountRepository = new AccountRepository();
    const paymentGateway = new PaymentGatewayFake();
    const accountService = new AccountService(accountRepository, paymentGateway);
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

test("Deve fazer um depósito em uma conta com spy", async (t) => {
    const accountRepository = new AccountRepository();
    const paymentGateway = new PaymentGatewayHttp();
    const accountService = new AccountService(accountRepository, paymentGateway);
    const processTransactionSpy = sinon.spy(PaymentGatewayHttp.prototype, "ProcessTransaction");
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

test("Deve fazer um depósito em uma conta com mock", async (t) => {
    const accountRepository = new AccountRepository();
    const paymentGateway = new PaymentGatewayHttp();
    const accountService = new AccountService(accountRepository, paymentGateway);
    const accountRepositoryMock = sinon.mock(AccountRepository.prototype);
    const paymentGatewayMock = sinon.mock(PaymentGatewayHttp.prototype);
    const inputSignup = {
        name: "John Doe",
        email: "john.doe@example.com",
        document: "974.563.215-58",
        password: "Password123"
    };
    accountRepositoryMock.expects("Save").once().resolves();
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
    const mockedAccount = new Account(outputSignup.accountId, inputSignup.name, inputSignup.email, inputSignup.document, inputSignup.password, []);
    accountRepositoryMock.expects("Update").once().resolves();
    accountRepositoryMock.expects("GetById").twice().resolves(mockedAccount);
    paymentGatewayMock.expects("ProcessTransaction").once().withArgs({
        creditCardHolder: inputDeposit.creditCardHolder,
        creditCardNumber: inputDeposit.creditCardNumber,
        creditCardExpDate: inputDeposit.creditCardExpiration,
        creditCardCvv: inputDeposit.creditCardCvv,
        amount: inputDeposit.quantity
    }).resolves({ autorizada: "1" });
    await accountService.Deposit(inputDeposit);
    const outputGetAccount = await accountService.GetAccount(outputSignup.accountId);
    expect(outputGetAccount.balances[0]?.assetId).toBe("USD");
    expect(outputGetAccount.balances[0]?.quantity).toBe(100);
    accountRepositoryMock.verify();
    accountRepositoryMock.restore();
    paymentGatewayMock.verify();
    paymentGatewayMock.restore();
});

test("Deve fazer um depósito em uma conta com fake", async (t) => {
    const accountRepository = new AccountRepositoryFake();
    const paymentGateway = new PaymentGatewayFake();
    const accountService = new AccountService(accountRepository, paymentGateway);
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
});