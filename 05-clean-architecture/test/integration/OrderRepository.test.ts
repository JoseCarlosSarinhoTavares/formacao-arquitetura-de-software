import { expect, test } from "vitest";
import Order from "../../src/Order.ts";
import OrderRepository from "../../src/OrderRepository.ts";

test("Deve persistir uma ordem de compra", async (t) => {
    const orderRepository = new OrderRepository();
    const accountId = crypto.randomUUID();
    const order = Order.Create(accountId, "BTC-USD", "buy", 1, 60000);
    await orderRepository.Save(order);
    const savedOrder = await orderRepository.GetById(order.orderId);
    expect(savedOrder.orderId).toBe(order.orderId);
    expect(savedOrder.accountId).toBe(order.accountId);
    expect(savedOrder.marketId).toBe(order.marketId);
    expect(savedOrder.side).toBe(order.side);
    expect(savedOrder.quantity).toBe(order.quantity);
    expect(savedOrder.price).toBe(order.price);
    expect(savedOrder.fillQuantity).toBe(order.fillQuantity);
    expect(savedOrder.fillPrice).toBe(order.fillPrice);
    expect(savedOrder.status).toBe(order.status);
});

test("Deve listar ordens por marketId e status", async (t) => {
    const marketId = `BTC-USD-${Math.random()}`;
    const orderRepository = new OrderRepository();
    const accountId = crypto.randomUUID();
    const orderBy = Order.Create(accountId, marketId, "buy", 1, 60000);
    await orderRepository.Save(orderBy);
    const orderSell = Order.Create(accountId, marketId, "sell", 1, 60000);
    await orderRepository.Save(orderSell);
    const orders = await orderRepository.ListByMarketIdAndStatus(marketId, "open");
    expect(orders).toHaveLength(2);
});