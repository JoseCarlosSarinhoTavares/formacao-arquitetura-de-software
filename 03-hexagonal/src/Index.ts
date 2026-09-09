import IAccountData from "./AccountData.ts";
import { AccountService } from "./AccountService.ts";
import Api from "./Api.ts";

const accountData = new IAccountData();
const accountService = new AccountService(accountData);
const api = new Api(accountService);