import { AccountService } from "./AccountService.ts";
import Api from "./Api.ts";
import { PaymentGatewayHttp } from "./PaymentGateway.ts";
import AccountRepository from "./AccountRepository.ts";

const accountRepository = new AccountRepository();
const paymentGateway = new PaymentGatewayHttp();
const accountService = new AccountService(accountRepository, paymentGateway);
const api = new Api(accountService);