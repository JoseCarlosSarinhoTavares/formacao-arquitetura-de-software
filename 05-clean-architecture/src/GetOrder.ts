import type IUserCase from "./IUserCase.ts";
import type OrderRepository from "./OrderRepository.ts";

export class GetOrder implements IUserCase {
    constructor(readonly orderRepository: OrderRepository) { }

    async Execute(orderId: string): Promise<Output> {
        const order = await this.orderRepository.GetById(orderId);
        return {
            orderId: order.orderId,
            accountId: order.accountId,
            marketId: order.marketId,
            side: order.side,
            quantity: order.quantity,
            price: order.price,
            status: order.status,
            fillQuantity: order.fillQuantity,
            fillPrice: order.fillPrice,
            timeStamp: order.timestamp
        };
    }
}

type Output = {
    orderId: string;
    accountId: string;
    marketId: string;
    side: string;
    quantity: number;
    price: number;
    status: string;
    fillQuantity: number;
    fillPrice: number;
    timeStamp: Date;
}