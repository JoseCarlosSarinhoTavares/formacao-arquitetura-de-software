import type IUserCase from "./IUserCase.ts";
import type OrderRepository from "./OrderRepository.ts";
import Order from "./Order.ts";

export class ExecuteOrder implements IUserCase {
    constructor(
        readonly orderRepository: OrderRepository
    ) { }

    async Execute(marketId: string): Promise<void> {
        while (true) {
            const orders = await this.orderRepository.ListByMarketIdAndStatus(marketId, "open");
            const [highestBuy] = orders.filter((order: Order) => order.side === "buy").sort((a, b) => b.price - a.price);
            const [lowestSell] = orders.filter((order: Order) => order.side === "sell").sort((a, b) => a.price - b.price);
            if (!highestBuy || !lowestSell || highestBuy.price < lowestSell.price) break;
            const quantity = Math.min(highestBuy.quantity, lowestSell.quantity);
            const price = (highestBuy.timestamp.getTime() > lowestSell.timestamp.getTime()) ? highestBuy.price : lowestSell.price;
            highestBuy.Fill(quantity, price);
            lowestSell.Fill(quantity, price);
            await this.orderRepository.Update(highestBuy);
            await this.orderRepository.Update(lowestSell);
        }
    }
}