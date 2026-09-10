import { expect, test } from "vitest";
import AccountDAO, { AccountDAOFake } from "../../src/AccountDAO.ts";
import { AccountService } from "../../src/AccountService.ts";
import sinon from "sinon";
import { PaymentGatewayFake, PaymentGatewayHttp } from "../../src/PaymentGateway.ts";
import { BalanceDAO, BalanceDAOFake } from "../../src/BalanceDAO.ts";

test("Deve criar uma conta", async (t) => {
    const accountDAO = new AccountDAO();
    const balanceDAO = new BalanceDAOFake();
    const paymentGateway = new PaymentGatewayFake();
    const accountService = new AccountService(accountDAO, balanceDAO, paymentGateway);
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

test("Deve fazer dois depósitos do mesmo tipo de recursoem uma conta", async (t) => {
    const accountDAO = new AccountDAO();
    const balanceDAO = new BalanceDAO();
    const paymentGateway = new PaymentGatewayFake();
    const accountService = new AccountService(accountDAO, balanceDAO, paymentGateway);
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

test("Deve fazer um depósito em uma conta com stub", async (t) => {
    const accountDAO = new AccountDAO();
    const balanceDAO = new BalanceDAO();
    const paymentGateway = new PaymentGatewayFake();
    const accountService = new AccountService(accountDAO, balanceDAO, paymentGateway);
    const upsertStub = sinon.stub(BalanceDAO.prototype, "Upsert").resolves();
    const listByAccountIdStub = sinon.stub(BalanceDAO.prototype, "ListByAccountId").resolves([
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

test("Deve fazer um depósito em uma conta com spy", async (t) => {
    const accountDAO = new AccountDAO();
    const balanceDAO = new BalanceDAO();
    const paymentGateway = new PaymentGatewayHttp();
    const accountService = new AccountService(accountDAO, balanceDAO, paymentGateway);
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
    const accountDAO = new AccountDAO();
    const balanceDAO = new BalanceDAO();
    const paymentGateway = new PaymentGatewayHttp();
    const accountService = new AccountService(accountDAO, balanceDAO, paymentGateway);
    const balanceDataMock = sinon.mock(BalanceDAO.prototype);
    const paymentGatewayMock = sinon.mock(PaymentGatewayHttp.prototype);
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
    balanceDataMock.expects("Upsert").once().resolves();
    balanceDataMock.expects("ListByAccountId").twice().resolves([
        {
            accountId: "",
            assetId: "USD",
            quantity: 100
        }
    ]);
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
    balanceDataMock.verify();
    balanceDataMock.restore();
    paymentGatewayMock.verify();
    paymentGatewayMock.restore();
});

test("Deve fazer um depósito em uma conta com fake", async (t) => {
    const accountDAO = new AccountDAOFake();
    const balanceDAO = new BalanceDAOFake();
    const paymentGateway = new PaymentGatewayFake();
    const accountService = new AccountService(accountDAO, balanceDAO, paymentGateway);
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

test("Deve fazer um saque em uma conta com fake", async (t) => {
    const accountDAO = new AccountDAOFake();
    const balanceDAO = new BalanceDAOFake();
    const paymentGateway = new PaymentGatewayFake();
    const accountService = new AccountService(accountDAO, balanceDAO, paymentGateway);
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
    const inputWithdraw = {
        accountId: outputSignup.accountId,
        assetId: "USD",
        quantity: 40
    };
    await accountService.Withdraw(inputWithdraw);
    const outputGetAccount = await accountService.GetAccount(outputSignup.accountId);
    expect(outputGetAccount.balances[0]?.assetId).toBe("USD");
    expect(outputGetAccount.balances[0]?.quantity).toBe(60);
});

test("Não deve fazer um saque acima do saldo em uma conta com fake", async (t) => {
    const accountDAO = new AccountDAOFake();
    const balanceDAO = new BalanceDAOFake();
    const paymentGateway = new PaymentGatewayFake();
    const accountService = new AccountService(accountDAO, balanceDAO, paymentGateway);
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
    const inputWithdraw = {
        accountId: outputSignup.accountId,
        assetId: "USD",
        quantity: 140
    };
    await accountService.Withdraw(inputWithdraw);
    const outputGetAccount = await accountService.GetAccount(outputSignup.accountId);
    expect(outputGetAccount.balances[0]?.assetId).toBe("USD");
    expect(outputGetAccount.balances[0]?.quantity).toBe(100);
});

test("Deve colocar uma ordem em uma conta com fake", async (t) => {
    const accountDAO = new AccountDAOFake();
    const balanceDAO = new BalanceDAOFake();
    const paymentGateway = new PaymentGatewayFake();
    const accountService = new AccountService(accountDAO, balanceDAO, paymentGateway);
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
    const inputPlaceOrder = {
        accountId: outputSignup.accountId,
        assetId: "USD",
        quantity: 30
    };
    await accountService.PlaceOrder(inputPlaceOrder);
    const outputGetAccount = await accountService.GetAccount(outputSignup.accountId);
    expect(outputGetAccount.balances[0]?.assetId).toBe("USD");
    expect(outputGetAccount.balances[0]?.quantity).toBe(70);
});

test("Não deve colocar uma ordem acima do saldo em uma conta com fake", async (t) => {
    const accountDAO = new AccountDAOFake();
    const balanceDAO = new BalanceDAOFake();
    const paymentGateway = new PaymentGatewayFake();
    const accountService = new AccountService(accountDAO, balanceDAO, paymentGateway);
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
    const inputPlaceOrder = {
        accountId: outputSignup.accountId,
        assetId: "USD",
        quantity: 130
    };
    await accountService.PlaceOrder(inputPlaceOrder);
    const outputGetAccount = await accountService.GetAccount(outputSignup.accountId);
    expect(outputGetAccount.balances[0]?.assetId).toBe("USD");
    expect(outputGetAccount.balances[0]?.quantity).toBe(100);
});

test("Deve executar uma ordem em uma conta com fake", async (t) => {
    const accountDAO = new AccountDAOFake();
    const balanceDAO = new BalanceDAOFake();
    const paymentGateway = new PaymentGatewayFake();
    const accountService = new AccountService(accountDAO, balanceDAO, paymentGateway);
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
    const inputExecuteOrder = {
        accountId: outputSignup.accountId,
        assetId: "USD",
        quantity: 50
    };
    await accountService.ExecuteOrder(inputExecuteOrder);
    const outputGetAccount = await accountService.GetAccount(outputSignup.accountId);
    expect(outputGetAccount.balances[0]?.assetId).toBe("USD");
    expect(outputGetAccount.balances[0]?.quantity).toBe(150);
});