import crypto from "crypto";
import { BalanceDAO } from "./BalanceDAO.ts";
import type IAccountDAO from "./AccountDAO.ts";
import type PaymentGateway from "./PaymentGateway.ts";
import { ValidateName } from "./validateName.ts";
import { ValidateCpf } from "./validateCpf.ts";

export default interface IAccountService{
    Signup(input: SignupInput): Promise<SignupOutput>;
    GetAccount(accountId: string): Promise<GetAccountOutput>;
    Deposit(input: DepositInput): Promise<void>;
    Withdraw(input: WithdrawInput): Promise<void>;
    PlaceOrder(input: PlaceOrderInput): Promise<void>;
    ExecuteOrder(input: ExecuteOrderInput): Promise<void>;
}

export class AccountService {
    constructor(
        readonly accountDAO: IAccountDAO, 
        readonly balanceDAO: BalanceDAO, 
        readonly paymentGateway: PaymentGateway
    ) { }

    async Signup(input: SignupInput): Promise<SignupOutput> {  
        if (!ValidateName(input.name)) {
            throw new Error("Invalid name");
        }
        if (!input.email.match(/.+@.+\..+/)) {
            throw new Error("Invalid email");
        }
        if (!ValidateCpf(input.document)) {
            throw new Error("Invalid document");
        }
        if (
            input.password.length < 8 || 
            !input.password.match(/[a-z]/) || 
            !input.password.match(/[A-Z]/) || 
            !input.password.match(/[0-9]/)
        ) {
            throw new Error("Invalid password");
        }
        const account = {
            accountId: crypto.randomUUID(),
            name: input.name,
            email: input.email,
            document: input.document,
            password: input.password
        }
        await this.accountDAO.Save(account);
        return {
            accountId: account.accountId
        };
    }

    async GetAccount(accountId: string): Promise<GetAccountOutput> {
        const account = await this.accountDAO.GetById(accountId);
        const balances = await this.balanceDAO.ListByAccountId(accountId);
        const output = {
            accountId: account.accountId,
            name: account.name,
            email: account.email,
            document: account.document,
            password: account.password,
            balances: balances.map(balance => ({
                assetId: balance.assetId,
                quantity: balance.quantity
            }))
        }
        return output;
    }

    async Deposit(input: DepositInput): Promise<void> {
        const account = await this.accountDAO.GetById(input.accountId);
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
                const balances = await this.balanceDAO.ListByAccountId(input.accountId);
                const existingBalance = balances.find(balance => balance.assetId === input.assetId);
                const existingQuantity = (existingBalance) ? existingBalance.quantity : 0;
                const balance = {
                    accountId: input.accountId,
                    assetId: input.assetId,
                    quantity: existingQuantity + input.quantity
                };
                await this.balanceDAO.Upsert(balance);
            }
        }
    }

    async Withdraw(input: WithdrawInput): Promise<void> {
        const account = await this.accountDAO.GetById(input.accountId);
        if (account) {
            const balances = await this.balanceDAO.ListByAccountId(input.accountId);
            const existingBalance = balances.find(balance => balance.assetId === input.assetId);
            const existingQuantity = (existingBalance) ? existingBalance.quantity : 0;
            if (existingQuantity >= input.quantity) {
                const balance = {
                    accountId: input.accountId,
                    assetId: input.assetId,
                    quantity: existingQuantity - input.quantity
                };
                await this.balanceDAO.Upsert(balance);
            }
        }
    }

    async PlaceOrder(input: PlaceOrderInput): Promise<void> {
        const account = await this.accountDAO.GetById(input.accountId);
        if (account) {
            const balances = await this.balanceDAO.ListByAccountId(input.accountId);
            const existingBalance = balances.find(balance => balance.assetId === input.assetId);
            const existingQuantity = (existingBalance) ? existingBalance.quantity : 0;
            if (existingQuantity >= input.quantity) {
                const balance = {
                    accountId: input.accountId,
                    assetId: input.assetId,
                    quantity: existingQuantity - input.quantity
                };
                await this.balanceDAO.Upsert(balance);
            }
        }
    }

    async ExecuteOrder(input: ExecuteOrderInput): Promise<void> {
        const account = await this.accountDAO.GetById(input.accountId);
        if (account) {
            const balances = await this.balanceDAO.ListByAccountId(input.accountId);
            const existingBalance = balances.find(balance => balance.assetId === input.assetId);
            const existingQuantity = (existingBalance) ? existingBalance.quantity : 0;
            const balance = {
                accountId: input.accountId,
                assetId: input.assetId,
                quantity: existingQuantity + input.quantity
            };
            await this.balanceDAO.Upsert(balance);
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

    async Withdraw(input: WithdrawInput): Promise<void> { }

    async PlaceOrder(input: PlaceOrderInput): Promise<void> { }

    async ExecuteOrder(input: ExecuteOrderInput): Promise<void> { }
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