import type IAccountRepository from "./AccountRepository.ts";
import type PaymentGateway from "./PaymentGateway.ts";
import Account from "./Account.ts";

export default interface IAccountService{
    Signup(input: SignupInput): Promise<SignupOutput>;
    GetAccount(accountId: string): Promise<GetAccountOutput>;
    Deposit(input: DepositInput): Promise<void>;
}

export class AccountService {
    constructor(
        readonly accountRepository: IAccountRepository,
        readonly paymentGateway: PaymentGateway
    ) { }

    async Signup(input: SignupInput): Promise<SignupOutput> {  
        const account = Account.Create(input.name, input.email, input.document, input.password);
        await this.accountRepository.Save(account);
        return {
            accountId: account.accountId
        };
    }

    async GetAccount(accountId: string): Promise<GetAccountOutput> {
        const account = await this.accountRepository.GetById(accountId);
        const output = {
            accountId: account.accountId,
            name: account.GetName(),
            email: account.email,
            document: account.document,
            password: account.password,
            balances: account.balances.map(balance => ({
                assetId: balance.assetId,
                quantity: balance.quantity
            }))
        }
        return output;
    }

    async Deposit(input: DepositInput): Promise<void> {
        const account = await this.accountRepository.GetById(input.accountId);
        if (account) {
            const inputProcessTransaction = {
                creditCardHolder: input.creditCardHolder,
                creditCardNumber: input.creditCardNumber,
                creditCardExpDate: input.creditCardExpiration,
                creditCardCvv: input.creditCardCvv,
                amount: input.quantity
            };
            const outputProcessTransaction = await this.paymentGateway.ProcessTransaction(inputProcessTransaction);
            if (outputProcessTransaction.autorizada === "1") {
                account.Deposit(input.assetId, input.quantity);
                await this.accountRepository.Update(account);
            }
        }
    }
}

export class AccountServiceFake implements IAccountService {
    async Signup(input: SignupInput): Promise<SignupOutput> {
        return {
            accountId: "1"
        };
    }

    async GetAccount(accountId: string): Promise<GetAccountOutput> {
        return {
            accountId: "1",
            name: "John Doe Fake",
            email: "Fake@example.com",
            document: "123.456.789-00",
            password: "Password123",
            balances: []
        };
    }

    async Deposit(input: DepositInput): Promise<void> { }
}

type SignupInput = {
    name: string;
    email: string;
    document: string;
    password: string;
}

type SignupOutput = {
    accountId: string;
}

type GetAccountOutput = {
    accountId: string;
    name: string;
    email: string;
    document: string;
    password: string;
    balances: {
        assetId: string;
        quantity: number;
    }[];
}

type DepositInput = {
    accountId: string;
    assetId: string;
    quantity: number;
    creditCardHolder: string;
    creditCardNumber: string;
    creditCardExpiration: string;
    creditCardCvv: string;
}

type WithdrawInput = {
    accountId: string;
    assetId: string;
    quantity: number;
}
type PlaceOrderInput = {
    accountId: string;
    assetId: string;
    quantity: number;
}

type ExecuteOrderInput = {
    accountId: string;
    assetId: string;
    quantity: number;
}