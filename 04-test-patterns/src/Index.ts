import { AccountService } from "./AccountService.ts";
import Api from "./Api.ts";
import AccountDAO from "./AccountDAO.ts";
import { BalanceDAO } from "./BalanceDAO.ts";
import { PaymentGatewayHttp } from "./PaymentGateway.ts";

const accountDAO = new AccountDAO();
const balanceDAO = new BalanceDAO();
const paymentGateway = new PaymentGatewayHttp();
const accountService = new AccountService(accountDAO, balanceDAO, paymentGateway);
const api = new Api(accountService);