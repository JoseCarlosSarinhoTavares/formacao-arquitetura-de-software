import Api from "./Api.ts";
import { PaymentGatewayHttp } from "./PaymentGateway.ts";
import AccountRepository from "./AccountRepository.ts";
import { Signup } from "./Signup.ts";
import { GetAccount } from "./GetAccount.ts";
import { Deposit } from "./Deposit.ts";
import { PlaceOrder } from "./PlaceOrder.ts";
import OrderRepository from "./OrderRepository.ts";
import Mediator from "./Mediator.ts";
import { GetOrder } from "./GetOrder.ts";
import { ExecuteOrder } from "./ExecuteOrder.ts";

const DEFAULT_PORT = 3000;
const PORT = Number(process.env.PORT ?? DEFAULT_PORT);

const accountRepository = new AccountRepository();
const orderRepository = new OrderRepository();
const paymentGateway = new PaymentGatewayHttp();
const signup = new Signup(accountRepository);
const getAccount = new GetAccount(accountRepository);
const deposit = new Deposit(accountRepository, paymentGateway);
const executeOrder = new ExecuteOrder(orderRepository);
const mediator = new Mediator();
mediator.Register("orderPlaced", async (event: any) => {
    await executeOrder.Execute(event.marketId);
});
const placeOrder = new PlaceOrder(accountRepository, orderRepository, mediator);
const getOrder = new GetOrder(orderRepository);
const api = new Api(signup, getAccount, deposit, placeOrder, getOrder);
api.app.listen(PORT);