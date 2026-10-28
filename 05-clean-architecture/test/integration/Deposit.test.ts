import { expect, test, afterEach } from "vitest";
import AccountRepository, { AccountRepositoryFake } from "../../src/AccountRepository.ts";
import sinon from "sinon";
import { PaymentGatewayFake } from "../../src/PaymentGateway.ts";
import Account from "../../src/Account.ts";
import { Signup } from "../../src/Signup.ts";
import { GetAccount } from "../../src/GetAccount.ts";
import { Deposit } from "../../src/Deposit.ts";

afterEach(() => {
    sinon.restore();
});


test("Deve fazer dois depósitos do mesmo tipo de recurso em uma conta", async (t) => {
    const accountRepository = new AccountRepository();
    const paymentGateway = new PaymentGatewayFake();
    const signup = new Signup(accountRepository);
    const getAccount = new GetAccount(accountRepository);
    const deposit = new Deposit(accountRepository, paymentGateway);
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
    await deposit.Execute(inputDeposit);
    const outputGetAccount = await getAccount.Execute(outputSignup.accountId);
    expect(outputGetAccount.balances[0]?.assetId).toBe("USD");
    expect(outputGetAccount.balances[0]?.quantity).toBe(200);
});

test("Deve fazer um depósito em uma conta com spy", async (t) => {
    const accountRepository = new AccountRepository();
    const paymentGateway = new PaymentGatewayFake();
    const signup = new Signup(accountRepository);
    const getAccount = new GetAccount(accountRepository);
    const deposit = new Deposit(accountRepository, paymentGateway);
    const processTransactionSpy = sinon.spy(PaymentGatewayFake.prototype, "ProcessTransaction");
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
    const outputGetAccount = await getAccount.Execute(outputSignup.accountId);
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
});

test("Deve fazer um depósito em uma conta com mock", async (t) => {
    const accountRepository = new AccountRepository();
    const paymentGateway = new PaymentGatewayFake();
    const signup = new Signup(accountRepository);
    const getAccount = new GetAccount(accountRepository);
    const deposit = new Deposit(accountRepository, paymentGateway);
    const accountRepositoryMock = sinon.mock(AccountRepository.prototype);
    const paymentGatewayMock = sinon.mock(PaymentGatewayFake.prototype);
    const inputSignup = {
        name: "John Doe",
        email: "john.doe@example.com",
        document: "974.563.215-58",
        password: "Password123"
    };
    accountRepositoryMock.expects("Save").once().resolves();
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
    await deposit.Execute(inputDeposit);
    const outputGetAccount = await getAccount.Execute(outputSignup.accountId);
    expect(outputGetAccount.balances[0]?.assetId).toBe("USD");
    expect(outputGetAccount.balances[0]?.quantity).toBe(100);
    accountRepositoryMock.verify();
    paymentGatewayMock.verify();
});

test("Deve fazer um depósito em uma conta com fake", async (t) => {
    const accountRepository = new AccountRepositoryFake();
    const paymentGateway = new PaymentGatewayFake();
    const signup = new Signup(accountRepository);
    const getAccount = new GetAccount(accountRepository);
    const deposit = new Deposit(accountRepository, paymentGateway);
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
    const outputGetAccount = await getAccount.Execute(outputSignup.accountId);
    expect(outputGetAccount.balances[0]?.assetId).toBe("USD");
    expect(outputGetAccount.balances[0]?.quantity).toBe(100);
});

test("Não deve fazer depóssito em uma conta que não existe", async (t) => {
    const accountRepository = new AccountRepositoryFake();
    const paymentGateway = new PaymentGatewayFake();
    const signup = new Signup(accountRepository);
    const getAccount = new GetAccount(accountRepository);
    const deposit = new Deposit(accountRepository, paymentGateway);
    const inputDeposit = {
        accountId: crypto.randomUUID(),
        assetId: "USD",
        quantity: 100,
        creditCardHolder: "John Doe",
        creditCardNumber: "4111111111111111",
        creditCardExpiration: "12/2027",
        creditCardCvv: "123"
    };
    await expect(() => deposit.Execute(inputDeposit)).rejects.toThrow(new Error("Account not found"));
});
