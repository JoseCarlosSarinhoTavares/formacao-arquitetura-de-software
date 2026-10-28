import { expect, test, beforeAll, afterAll } from "vitest";
import type { Server } from "node:http";
import Api from "../../src/Api.ts";
import AccountRepository from "../../src/AccountRepository.ts";
import { Signup } from "../../src/Signup.ts";
import { GetAccount } from "../../src/GetAccount.ts";
import { Deposit } from "../../src/Deposit.ts";
import { PaymentGatewayFake } from "../../src/PaymentGateway.ts";
import { PlaceOrder } from "../../src/PlaceOrder.ts";
import { GetOrder } from "../../src/GetOrder.ts";
import OrderRepository from "../../src/OrderRepository.ts";
import Mediator from "../../src/Mediator.ts";
import { ExecuteOrder } from "../../src/ExecuteOrder.ts";

let server: Server;
let baseUrl: string;

beforeAll(async () => {
    const accountRepository = new AccountRepository();
    const orderRepository = new OrderRepository();
    const paymentGateway = new PaymentGatewayFake();
    const mediator = new Mediator();
    const executeOrder = new ExecuteOrder(orderRepository);
    mediator.Register("orderPlaced", async (event: any) => {
        await executeOrder.Execute(event.marketId);
    });
    const api = new Api(
        new Signup(accountRepository),
        new GetAccount(accountRepository),
        new Deposit(accountRepository, paymentGateway),
        new PlaceOrder(accountRepository, orderRepository, mediator),
        new GetOrder(orderRepository));
    server = api.app.listen(0);
    await new Promise<void>((resolve) => server.once("listening", () => resolve()));
    const address = server.address();
    const port = typeof address === "object" && address !== null ? address.port : 0;
    baseUrl = `http://localhost:${port}`;
});

afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test("Deve criar uma conta", async () => {
    const input = {
        name: "John Doe",
        email: "john.doe@gmail.com",
        document: "97456321558",
        password: "asdQWE123"
    };
    const responseSignup = await fetch(`${baseUrl}/signup`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
    });
    const outputSignup = await responseSignup.json();
    expect(outputSignup.accountId).toBeDefined();
    const responseGetAccount = await fetch(`${baseUrl}/accounts/${outputSignup.accountId}`);
    const outputGetAccount = await responseGetAccount.json();
    expect(outputGetAccount.accountId).toBe(outputSignup.accountId);
    expect(outputGetAccount.name).toBe(input.name);
    expect(outputGetAccount.email).toBe(input.email);
    expect(outputGetAccount.document).toBe(input.document);   
    expect(outputGetAccount.password).toBe(input.password);
});

test("Não deve criar uma conta com nome inválido", async () => {
    const input = {
        name: "John",
        email: "john.doe@gmail.com",
        document: "97456321558",
        password: "asdQWE123"
    }
    const responseSignup = await fetch(`${baseUrl}/signup`, {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(input)
    });
    const outputSignup = await responseSignup.json();
    expect(outputSignup.error).toBe("Invalid name");
});

test("Não deve criar uma conta com email inválido", async () => {
    const input = {
        name: "John Doe",
        email: "john.doe@gmail",
        document: "97456321558",
        password: "asdQWE123"
    }
    const responseSignup = await fetch(`${baseUrl}/signup`, {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(input)
    });
    const outputSignup = await responseSignup.json();
    expect(outputSignup.error).toBe("Invalid email");
});

test("Não deve criar uma conta com documento inválido", async () => {
    const input = {
        name: "John Doe",
        email: "john.doe@gmail.com",
        document: "974563215",
        password: "asdQWE123"
    }
    const responseSignup = await fetch(`${baseUrl}/signup`, {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(input)
    });
    const outputSignup = await responseSignup.json();
    expect(outputSignup.error).toBe("Invalid document");
});

test("Não deve criar uma conta com senha inválida", async () => {
    const input = {
        name: "John Doe",
        email: "john.doe@gmail.com",
        document: "97456321558",
        password: "asdQWEhh" 
    }
    const responseSignup = await fetch(`${baseUrl}/signup`, {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(input)
    });
    const outputSignup = await responseSignup.json();
    expect(outputSignup.error).toBe("Invalid password");
});

test("Deve executar uma ordem de compra com uma ordem de venda", async () => {
    const marketId = `BTC-USD-${Math.random()}`;
    const input = {
        name: "John Doe",
        email: "john.doe@gmail.com",
        document: "97456321558",
        password: "asdQWE123"
    };
    const responseSignup = await fetch(`${baseUrl}/signup`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
    });
    const outputSignup = await responseSignup.json();
    const imputPlaceOrderBy = {
        accountId: outputSignup.accountId,
        marketId,
        side: "buy",
        quantity: 1,
        price: 60000
    };
    const responsePlaceOrderBuy = await fetch(`${baseUrl}/place_order`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify(imputPlaceOrderBy)
    });
    const outputPlaceOrderBuy = await responsePlaceOrderBuy.json();
    const imputPlaceOrderSell = {
        accountId: outputSignup.accountId,
        marketId,
        side: "sell",
        quantity: 1,
        price: 60000
    };
    const responsePlaceOrderSell = await fetch(`${baseUrl}/place_order`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify(imputPlaceOrderSell)
    });
    const outputPlaceOrderSell = await responsePlaceOrderSell.json();
    const responseGetOrderBy = await fetch(`${baseUrl}/orders/${outputPlaceOrderBuy.orderId}`);
    const responseGetOrderSell = await fetch(`${baseUrl}/orders/${outputPlaceOrderSell.orderId}`);
    const outputGetOrderBy = await responseGetOrderBy.json();
    const outputGetOrderSell = await responseGetOrderSell.json();
    expect(outputGetOrderBy.fillQuantity).toBe(1);
    expect(outputGetOrderBy.fillPrice).toBe(60000);
    expect(outputGetOrderBy.status).toBe("closed");
    expect(outputGetOrderSell.fillQuantity).toBe(1);
    expect(outputGetOrderSell.fillPrice).toBe(60000);
    expect(outputGetOrderSell.status).toBe("closed");
});
