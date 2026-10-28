import pgp from "pg-promise";
import Order from "./Order.ts";

export default interface IOrderRepository {
    Save (order: Order): Promise<void>;
    Update (order: Order): Promise<void>;
    GetById (orderId: string): Promise<Order>;
    ListByMarketIdAndStatus (marketId: string, status: string): Promise<Order[]>;
}

export default class OrderRepository implements IOrderRepository {
    async Save(order: Order): Promise<void> {
        const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
        await connection.query("insert into app.order (order_id, account_id, market_id, side, quantity, price, status, fill_quantity, fill_price, timestamp) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)", 
            [order.orderId, order.accountId, order.marketId, order.side, order.quantity, order.price, order.status, order.fillQuantity, order.fillPrice, order.timestamp]);            
        await connection.$pool.end();
    }

    async Update(order: Order): Promise<void> {
        const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
        await connection.query("update app.order set status = $1, fill_quantity = $2, fill_price = $3 where order_id = $4", 
            [order.status, order.fillQuantity, order.fillPrice, order.orderId]);
        await connection.$pool.end();
    }

    async GetById(orderId: string): Promise<Order> {
        const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
        const [orderData] = await connection.query("select * from app.order where order_id = $1", 
            [orderId]);
        const order = new Order(
            orderData.order_id,
            orderData.account_id,
            orderData.market_id,
            orderData.side,
            parseFloat(orderData.quantity),
            parseFloat(orderData.price),
            parseFloat(orderData.fill_quantity),
            parseFloat(orderData.fill_price),
            orderData.status,
            orderData.timestamp
        );
        await connection.$pool.end();
        return order;
    };

    async ListByMarketIdAndStatus(marketId: string, status: string): Promise<Order[]> {
        const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
        const ordersData = await connection.query("select * from app.order where market_id = $1 and status = $2", 
            [marketId, status]);
        await connection.$pool.end();
        const orders: Order[] = [];
        for (const orderData of ordersData) {
            const order = new Order(
                orderData.order_id,
                orderData.account_id,
                orderData.market_id,
                orderData.side,
                parseFloat(orderData.quantity),
                parseFloat(orderData.price),
                parseFloat(orderData.fill_quantity),
                parseFloat(orderData.fill_price),
                orderData.status,
                orderData.timestamp
            );
            orders.push(order);
        }
        return orders;
    };
}