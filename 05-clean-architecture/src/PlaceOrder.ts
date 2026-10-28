import type IAccountRepository from "./AccountRepository.ts";
import type IUserCase from "./IUserCase.ts";
import type OrderRepository from "./OrderRepository.ts";
import Order from "./Order.ts";
import type Mediator from "./Mediator.ts";

export class PlaceOrder implements IUserCase {
    constructor(
        readonly accountRepository: IAccountRepository,
        readonly orderRepository: OrderRepository,
        readonly mediator: Mediator
    ) { }

    async Execute(input: Input): Promise<Output> {
        const account = await this.accountRepository.GetById(input.accountId);
        const order = Order.Create(input.accountId, input.marketId, input.side, input.quantity, input.price);
        await this.orderRepository.Save(order);
        await this.mediator.NotifyAll("orderPlaced", { orderId: order.orderId, marketId: order.marketId });
        return {
            orderId: order.orderId
        };
    }
}

type Input = {
    accountId: string;
    marketId: string;
    side: string;
    quantity: number;
    price: number;
}

type Output = {
    orderId: string;
}