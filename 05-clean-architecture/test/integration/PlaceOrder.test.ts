import { expect, test } from "vitest";
import { Signup } from "../../src/Signup.ts";
import AccountRepository from "../../src/AccountRepository.ts";
import OrderRepository from "../../src/OrderRepository.ts";
import { PlaceOrder } from "../../src/PlaceOrder.ts";
import { GetOrder } from "../../src/GetOrder.ts";
import Mediator from "../../src/Mediator.ts";
import { ExecuteOrder } from "../../src/ExecuteOrder.ts";

test("Deve criar uma ordem de compra", async (t) => {
    const marketId = `BTC-USD-${Math.random()}`;
    const accountRepository = new AccountRepository();
    const orderRepository = new OrderRepository();
    const signup = new Signup(accountRepository);
    const mediator = new Mediator();
    const placeOrder = new PlaceOrder(accountRepository, orderRepository, mediator);
    const getOrder = new GetOrder(orderRepository);
    const inputSignup = {
        name: "John Doe",
        email: "john.doe@example.com",
        document: "974.563.215-58",
        password: "Password123"
    };
    const outputSignup = await signup.Execute(inputSignup);
    const imputPlaceOrder = {
        accountId: outputSignup.accountId,
        marketId: marketId,
        side: "buy",
        quantity: 1,
        price: 60000
    };
    const outputPlaceOrder = await placeOrder.Execute(imputPlaceOrder);
    expect(outputPlaceOrder).toBeDefined();
    const outputGetOrder = await getOrder.Execute(outputPlaceOrder.orderId);
    expect(outputGetOrder.accountId).toBe(outputSignup.accountId);
    expect(outputGetOrder.side).toBe("buy");
    expect(outputGetOrder.quantity).toBe(1);
    expect(outputGetOrder.price).toBe(60000);
    expect(outputGetOrder.status).toBe("open");
});

test("Deve executar uma ordem de compra com uma ordem de venda", async (t) => {
    const marketId = `BTC-USD-${Math.random()}`;
    const accountRepository = new AccountRepository();
    const orderRepository = new OrderRepository();
    const signup = new Signup(accountRepository);
    const executeOrder = new ExecuteOrder(orderRepository);
    const mediator = new Mediator();
    mediator.Register("orderPlaced", async (event: any) => {
        await executeOrder.Execute(event.marketId);
    });
    const placeOrder = new PlaceOrder(accountRepository, orderRepository, mediator);
    const getOrder = new GetOrder(orderRepository);
    const inputSignup = {
        name: "John Doe",
        email: "john.doe@example.com",
        document: "974.563.215-58",
        password: "Password123"
    };
    const outputSignup = await signup.Execute(inputSignup);
    const imputPlaceOrderBy = {
        accountId: outputSignup.accountId,
        marketId,
        side: "buy",
        quantity: 1,
        price: 60000
    };
    const outputPlaceOrderBy = await placeOrder.Execute(imputPlaceOrderBy);
    const imputPlaceOrderSell = {
        accountId: outputSignup.accountId,
        marketId,
        side: "sell",
        quantity: 1,
        price: 60000
    };
    const outputPlaceOrderSell = await placeOrder.Execute(imputPlaceOrderSell);
    const outputGetOrderBy = await getOrder.Execute(outputPlaceOrderBy.orderId);  
    const outputGetOrderSell = await getOrder.Execute(outputPlaceOrderSell.orderId);  
    expect(outputGetOrderBy.fillQuantity).toBe(1);
    expect(outputGetOrderBy.fillPrice).toBe(60000);
    expect(outputGetOrderBy.status).toBe("closed");
    expect(outputGetOrderSell.fillQuantity).toBe(1);
    expect(outputGetOrderSell.fillPrice).toBe(60000);
    expect(outputGetOrderSell.status).toBe("closed");
});

test("Deve executar uma ordem de compra com duas ordens de venda", async (t) => {
    const marketId = `BTC-USD-${Math.random()}`;
    const accountRepository = new AccountRepository();
    const orderRepository = new OrderRepository();
    const signup = new Signup(accountRepository);
    const executeOrder = new ExecuteOrder(orderRepository);
    const mediator = new Mediator();
    mediator.Register("orderPlaced", async (event: any) => {
        await executeOrder.Execute(event.marketId);
    });
    const placeOrder = new PlaceOrder(accountRepository, orderRepository, mediator);
    const getOrder = new GetOrder(orderRepository);
    const inputSignup = {
        name: "John Doe",
        email: "john.doe@example.com",
        document: "974.563.215-58",
        password: "Password123"
    };
    const outputSignup = await signup.Execute(inputSignup);
    const imputPlaceOrderBy = {
        accountId: outputSignup.accountId,
        marketId,
        side: "buy",
        quantity: 2,
        price: 60000
    };
    const outputPlaceOrderBy = await placeOrder.Execute(imputPlaceOrderBy);
    const imputPlaceOrderSell1 = {
        accountId: outputSignup.accountId,
        marketId,
        side: "sell",
        quantity: 1,
        price: 60000
    };
    const outputPlaceOrderSell1 = await placeOrder.Execute(imputPlaceOrderSell1);
    const imputPlaceOrderSell2 = {
        accountId: outputSignup.accountId,
        marketId,
        side: "sell",
        quantity: 1,
        price: 60000
    };
    const outputPlaceOrderSell2 = await placeOrder.Execute(imputPlaceOrderSell2);
    const outputGetOrderBy = await getOrder.Execute(outputPlaceOrderBy.orderId);  
    const outputGetOrderSell1 = await getOrder.Execute(outputPlaceOrderSell1.orderId);  
    const outputGetOrderSell2 = await getOrder.Execute(outputPlaceOrderSell2.orderId); 
    expect(outputGetOrderBy.fillQuantity).toBe(2);
    expect(outputGetOrderBy.fillPrice).toBe(60000);
    expect(outputGetOrderBy.status).toBe("closed");
    expect(outputGetOrderSell1.fillQuantity).toBe(1);
    expect(outputGetOrderSell1.fillPrice).toBe(60000);
    expect(outputGetOrderSell1.status).toBe("closed");
    expect(outputGetOrderSell2.fillQuantity).toBe(1);
    expect(outputGetOrderSell2.fillPrice).toBe(60000);
    expect(outputGetOrderSell2.status).toBe("closed");
});