import crypto from "crypto";
import { validateCpf } from "./validateCpf.ts";
import { validateName } from "./validateName.ts";

// Driver Port
export default interface IAccountService{
    Signup(input: SignupInput): Promise<SignupOutput>;
    GetAccount(accountId: string): Promise<GetAccountOutput>;
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
        const output = await this.accountData.GetById(accountId);
        return output;
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
            password: "Password123"
        };
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

type GetAccountOutput = {
    accountId: string;
    name: string;
    email: string;
    document: string;
    password: string;
}