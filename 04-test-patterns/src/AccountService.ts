import crypto from "crypto";
import { validateCpf } from "./validateCpf.ts";
import { validateName } from "./validateName.ts";
import BalanceData from "./BalanceData.ts";
import PaymentGateway from "./PaymentGateway.ts";

// Driver Port
export default interface IAccountService{
    Signup(input: SignupInput): Promise<SignupOutput>;
    GetAccount(accountId: string): Promise<GetAccountOutput>;
    Deposit(input: DepositInput): Promise<void>;
}

// Driven Port
export interface IAccountServiceAccountData {
    Save (account: Account): Promise<void>;
    GetById (accountId: string): Promise<Account>;
}

type Account = {
    accountId: string,
    name: string,
    email: string,
    document: string,
    password: string
}

// Core
export class AccountService {
    constructor(readonly accountData: IAccountServiceAccountData) { }

    async Signup(input: SignupInput): Promise<SignupOutput> {  
        if (!validateName(input.name)) {
            throw new Error("Invalid name");
        }
        if (!input.email.match(/.+@.+\..+/)) {
            throw new Error("Invalid email");
        }
        if (!validateCpf(input.document)) {
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
        await this.accountData.Save(account);
        return {
            accountId: account.accountId
        };
    }

    async GetAccount(accountId: string): Promise<GetAccountOutput> {
        const account = await this.accountData.GetById(accountId);
        const balanceData = new BalanceData();
        const balances = await balanceData.ListByAccountId(accountId);
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
        const account = await this.accountData.GetById(input.accountId);
        if (account) {
            const paymentGateway = new PaymentGateway();
            const inputProcessTransaction = {
                creditCardHolder: input.creditCardHolder,
                creditCardNumber: input.creditCardNumber,
                creditCardExpDate: input.creditCardExpiration,
                creditCardCvv: input.creditCardCvv,
                amount: input.quantity
            };
            const outputProcessTransaction = await paymentGateway.processTransaction(inputProcessTransaction);
            if (outputProcessTransaction.autorizada === "1") {
                const balanceData = new BalanceData();
                const balances = await balanceData.ListByAccountId(input.accountId);
                const existingBalance = balances.find(balance => balance.assetId === input.assetId);
                const existingQuantity = (existingBalance) ? existingBalance.quantity : 0;
                const balance = {
                    accountId: input.accountId,
                    assetId: input.assetId,
                    quantity: existingQuantity + input.quantity
                };
                await balanceData.upsert(balance);
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

    async Deposit(input: DepositInput): Promise<void> {
    }
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

type DepositInput = {
    accountId: string;
    assetId: string;
    quantity: number;
    creditCardHolder: string;
    creditCardNumber: string;
    creditCardExpiration: string;
    creditCardCvv: string;
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